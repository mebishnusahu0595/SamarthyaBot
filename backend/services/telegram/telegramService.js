class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    async sendMessage(chatId, text) {
        if (!this.botToken) {
            console.error('Telegram Bot Token not configured!');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Telegram send error:', error);
                return { success: false, error };
            }

            return { success: true };
        } catch (error) {
            console.error('Telegram Service Error:', error);
            return { success: false, error: error.message };
        }
    }

    async setWebhook(url) {
        try {
            const response = await fetch(`${this.apiUrl}/setWebhook?url=${url}`);
            const data = await response.json();
            console.log('Telegram Webhook Setup:', data);
            return data;
        } catch (error) {
            console.error('Telegram webhook setup error:', error);
        }
    }
}

module.exports = new TelegramService();
