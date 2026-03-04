/**
 * Discord Channel Service for SamarthyaBot
 * Full Discord bot integration with mention-only mode support
 */

let discordReady = false;
let discordClient = null;

class DiscordService {
    constructor() {
        this.token = process.env.DISCORD_BOT_TOKEN;
        this.allowFrom = (process.env.DISCORD_ALLOW_FROM || '').split(',').filter(Boolean);
        this.mentionOnly = process.env.DISCORD_MENTION_ONLY === 'true';
        this.ws = null;
        this.heartbeatInterval = null;
        this.sessionId = null;
        this.resumeGatewayUrl = null;
        this.seq = null;
        this.botUserId = null;
    }

    /**
     * Initialize the Discord bot (no external dependencies — uses raw WebSocket Gateway API)
     */
    async start(chatHandler) {
        if (!this.token || this.token === 'your_discord_bot_token') {
            console.log('⚪ Discord: Skipped (no token configured)');
            return;
        }

        this.chatHandler = chatHandler;

        try {
            // Get gateway URL
            const response = await fetch('https://discord.com/api/v10/gateway/bot', {
                headers: { 'Authorization': `Bot ${this.token}` }
            });

            if (!response.ok) {
                console.error('❌ Discord: Failed to get gateway URL:', await response.text());
                return;
            }

            const data = await response.json();
            this.connectToGateway(data.url);
            console.log('🟣 Discord: Connecting...');
        } catch (error) {
            console.error('❌ Discord: Connection error:', error.message);
        }
    }

    connectToGateway(url) {
        // Dynamic import for WebSocket (Node.js built-in in v22+, or use ws package)
        const WebSocket = require('ws') || globalThis.WebSocket;
        this.ws = new WebSocket(`${url}?v=10&encoding=json`);

        this.ws.on('open', () => {
            console.log('🟣 Discord: WebSocket connected');
        });

        this.ws.on('message', (data) => {
            const payload = JSON.parse(data.toString());
            this.handleGatewayEvent(payload);
        });

        this.ws.on('close', (code) => {
            console.log(`🟣 Discord: WebSocket closed (${code}). Reconnecting in 5s...`);
            clearInterval(this.heartbeatInterval);
            setTimeout(() => this.connectToGateway(url), 5000);
        });

        this.ws.on('error', (err) => {
            console.error('❌ Discord WebSocket error:', err.message);
        });
    }

    handleGatewayEvent(payload) {
        const { op, d, s, t } = payload;

        if (s) this.seq = s;

        switch (op) {
            case 10: // Hello — start heartbeat and identify
                const heartbeatMs = d.heartbeat_interval;
                this.heartbeatInterval = setInterval(() => {
                    this.ws.send(JSON.stringify({ op: 1, d: this.seq }));
                }, heartbeatMs);

                // Identify
                this.ws.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: this.token,
                        intents: 513 | 32768, // GUILDS + MESSAGE_CONTENT
                        properties: {
                            os: 'linux',
                            browser: 'samarthyabot',
                            device: 'samarthyabot'
                        }
                    }
                }));
                break;

            case 11: // Heartbeat ACK
                break;

            case 0: // Dispatch
                if (t === 'READY') {
                    this.sessionId = d.session_id;
                    this.resumeGatewayUrl = d.resume_gateway_url;
                    this.botUserId = d.user?.id;
                    discordReady = true;
                    discordClient = this;
                    console.log(`🟣 Discord: ✅ Bot ready as ${d.user?.username}#${d.user?.discriminator}`);
                }

                if (t === 'MESSAGE_CREATE') {
                    this.handleMessage(d);
                }
                break;
        }
    }

    async handleMessage(message) {
        // Ignore bot's own messages
        if (message.author?.id === this.botUserId) return;
        if (message.author?.bot) return;

        // Allow-list check
        if (this.allowFrom.length > 0 && !this.allowFrom.includes(message.author?.id)) return;

        // Mention-only mode
        if (this.mentionOnly) {
            const mentioned = message.mentions?.some(m => m.id === this.botUserId);
            if (!mentioned) return;
        }

        const content = message.content?.replace(/<@!?\d+>/g, '').trim();
        if (!content) return;

        console.log(`🟣 Discord msg from ${message.author?.username}: ${content.substring(0, 50)}...`);

        try {
            // Use the chat handler to process the message
            if (this.chatHandler) {
                const response = await this.chatHandler(content, message.author?.id, 'discord');
                await this.sendMessage(message.channel_id, response);
            }
        } catch (error) {
            console.error('❌ Discord message handling error:', error.message);
            await this.sendMessage(message.channel_id, '❌ Kuch error aa gaya processing mein. Please try again.');
        }
    }

    async sendMessage(channelId, content) {
        try {
            // Discord message limit is 2000 chars
            const chunks = this.splitMessage(content, 2000);
            for (const chunk of chunks) {
                await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bot ${this.token}`
                    },
                    body: JSON.stringify({ content: chunk })
                });
            }
        } catch (error) {
            console.error('❌ Discord send error:', error.message);
        }
    }

    splitMessage(text, maxLen = 2000) {
        if (text.length <= maxLen) return [text];
        const chunks = [];
        let remaining = text;
        while (remaining.length > 0) {
            let splitIndex = remaining.lastIndexOf('\n', maxLen);
            if (splitIndex <= 0) splitIndex = maxLen;
            chunks.push(remaining.substring(0, splitIndex));
            remaining = remaining.substring(splitIndex).trimStart();
        }
        return chunks;
    }
}

module.exports = new DiscordService();
