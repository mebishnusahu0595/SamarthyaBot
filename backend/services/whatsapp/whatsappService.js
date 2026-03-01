/**
 * WhatsApp Business Cloud API Service
 * Handles sending/receiving WhatsApp messages via Meta's API
 * 
 * Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
 * 1. Create Meta Business account
 * 2. Set up WhatsApp Business App
 * 3. Get API token and phone number ID
 * 4. Set webhook URL to: https://yourdomain.com/api/whatsapp/webhook
 */

class WhatsAppService {
    constructor() {
        this.apiToken = process.env.WHATSAPP_API_TOKEN;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'samarthya_whatsapp_verify_2025';
        this.apiUrl = 'https://graph.facebook.com/v18.0';
    }

    /**
     * Send a text message via WhatsApp
     */
    async sendMessage(to, text) {
        try {
            const response = await fetch(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: to,
                        type: 'text',
                        text: { body: text }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error('WhatsApp send error:', error);
                return { success: false, error };
            }

            const data = await response.json();
            return { success: true, messageId: data.messages?.[0]?.id };
        } catch (error) {
            console.error('WhatsApp Service Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send interactive buttons
     */
    async sendButtons(to, bodyText, buttons) {
        try {
            const response = await fetch(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: to,
                        type: 'interactive',
                        interactive: {
                            type: 'button',
                            body: { text: bodyText },
                            action: {
                                buttons: buttons.map((btn, i) => ({
                                    type: 'reply',
                                    reply: {
                                        id: `btn_${i}`,
                                        title: btn.substring(0, 20) // WhatsApp 20 char limit
                                    }
                                }))
                            }
                        }
                    })
                }
            );

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('WhatsApp buttons error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a template message (for notifications/reminders)
     */
    async sendTemplate(to, templateName, language = 'en', parameters = []) {
        try {
            const components = parameters.length > 0 ? [{
                type: 'body',
                parameters: parameters.map(p => ({
                    type: 'text',
                    text: String(p)
                }))
            }] : [];

            const response = await fetch(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: to,
                        type: 'template',
                        template: {
                            name: templateName,
                            language: { code: language },
                            components
                        }
                    })
                }
            );

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('WhatsApp template error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId) {
        try {
            await fetch(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        status: 'read',
                        message_id: messageId
                    })
                }
            );
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }

    /**
     * Download media (images, voice notes) from WhatsApp
     * Returns buffer for processing
     */
    async downloadMedia(mediaId) {
        try {
            // Step 1: Get media URL
            const urlRes = await fetch(
                `${this.apiUrl}/${mediaId}`,
                {
                    headers: { 'Authorization': `Bearer ${this.apiToken}` }
                }
            );
            const urlData = await urlRes.json();

            if (!urlData.url) return null;

            // Step 2: Download actual media
            const mediaRes = await fetch(urlData.url, {
                headers: { 'Authorization': `Bearer ${this.apiToken}` }
            });

            const buffer = await mediaRes.arrayBuffer();
            return {
                buffer: Buffer.from(buffer),
                mimeType: urlData.mime_type,
                size: urlData.file_size
            };
        } catch (error) {
            console.error('Media download error:', error);
            return null;
        }
    }

    /**
     * Parse incoming webhook message
     */
    parseWebhookMessage(body) {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (!value?.messages?.[0]) return null;

            const msg = value.messages[0];
            const contact = value.contacts?.[0];

            const parsed = {
                messageId: msg.id,
                from: msg.from, // phone number
                timestamp: new Date(parseInt(msg.timestamp) * 1000),
                contactName: contact?.profile?.name || 'Unknown',
                type: msg.type, // text, image, audio, document, interactive
            };

            switch (msg.type) {
                case 'text':
                    parsed.text = msg.text.body;
                    break;
                case 'image':
                    parsed.mediaId = msg.image.id;
                    parsed.mimeType = msg.image.mime_type;
                    parsed.caption = msg.image.caption;
                    break;
                case 'audio':
                    parsed.mediaId = msg.audio.id;
                    parsed.mimeType = msg.audio.mime_type;
                    break;
                case 'document':
                    parsed.mediaId = msg.document.id;
                    parsed.mimeType = msg.document.mime_type;
                    parsed.filename = msg.document.filename;
                    break;
                case 'interactive':
                    parsed.text = msg.interactive?.button_reply?.title ||
                        msg.interactive?.list_reply?.title || '';
                    parsed.buttonId = msg.interactive?.button_reply?.id;
                    break;
            }

            return parsed;
        } catch (error) {
            console.error('Webhook parse error:', error);
            return null;
        }
    }
}

module.exports = new WhatsAppService();
