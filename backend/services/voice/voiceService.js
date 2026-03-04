/**
 * Voice Transcription Service for SamarthyaBot
 * Uses Groq Whisper API to convert voice notes to text
 * Supports OGG (Telegram), MP3, WAV, M4A formats
 */

const fs = require('fs');
const path = require('path');

class VoiceService {
    constructor() {
        this.groqApiKey = process.env.GROQ_API_KEY;
        this.model = 'whisper-large-v3-turbo'; // Groq's fast Whisper model
    }

    /**
     * Transcribe an audio file using Groq Whisper API
     * @param {string|Buffer} audioInput - File path or Buffer of audio data
     * @param {string} fileName - Original filename (for MIME type detection)
     * @param {string} language - Language hint (e.g., 'hi' for Hindi, 'en' for English)
     * @returns {Promise<{text: string, language: string, duration: number}>}
     */
    async transcribe(audioInput, fileName = 'audio.ogg', language = null) {
        if (!this.groqApiKey || this.groqApiKey === 'your_groq_api_key') {
            return {
                text: null,
                error: 'Voice transcription not available — GROQ_API_KEY not configured. Get a free key at https://console.groq.com'
            };
        }

        try {
            let audioBuffer;
            if (typeof audioInput === 'string') {
                // It's a file path
                audioBuffer = fs.readFileSync(audioInput);
            } else {
                audioBuffer = audioInput;
            }

            // Build multipart form data manually (no external dependency)
            const boundary = '----SamarthyaBotVoice' + Date.now();
            const mimeType = this.getMimeType(fileName);

            const bodyParts = [];

            // File part
            bodyParts.push(
                `--${boundary}\r\n`,
                `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
                `Content-Type: ${mimeType}\r\n\r\n`
            );

            const headerBuffer = Buffer.from(bodyParts.join(''));
            const footerParts = [`\r\n--${boundary}\r\n`,
                `Content-Disposition: form-data; name="model"\r\n\r\n`,
            `${this.model}\r\n`
            ];

            if (language) {
                footerParts.push(
                    `--${boundary}\r\n`,
                    `Content-Disposition: form-data; name="language"\r\n\r\n`,
                    `${language}\r\n`
                );
            }

            footerParts.push(
                `--${boundary}\r\n`,
                `Content-Disposition: form-data; name="response_format"\r\n\r\n`,
                `verbose_json\r\n`,
                `--${boundary}--\r\n`
            );

            const footerBuffer = Buffer.from(footerParts.join(''));
            const body = Buffer.concat([headerBuffer, audioBuffer, footerBuffer]);

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.groqApiKey}`,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`
                },
                body: body
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('❌ Voice transcription error:', errText);
                return { text: null, error: `Transcription failed: ${response.status}` };
            }

            const data = await response.json();
            console.log(`🎙️ Voice transcribed: "${(data.text || '').substring(0, 60)}..." (${data.language || 'auto'}, ${Math.round(data.duration || 0)}s)`);

            return {
                text: data.text || '',
                language: data.language || 'unknown',
                duration: data.duration || 0
            };
        } catch (error) {
            console.error('❌ Voice service error:', error.message);
            return { text: null, error: error.message };
        }
    }

    /**
     * Download a file from URL and transcribe it (for Telegram voice notes)
     * @param {string} fileUrl - URL of the audio file
     * @param {string} language - Language hint
     */
    async transcribeFromUrl(fileUrl, language = null) {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                return { text: null, error: `Failed to download audio: ${response.status}` };
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Extract filename from URL
            const urlParts = fileUrl.split('/');
            const fileName = urlParts[urlParts.length - 1] || 'audio.oga';

            return this.transcribe(buffer, fileName, language);
        } catch (error) {
            console.error('❌ Voice download error:', error.message);
            return { text: null, error: error.message };
        }
    }

    getMimeType(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const mimeMap = {
            '.ogg': 'audio/ogg',
            '.oga': 'audio/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/m4a',
            '.webm': 'audio/webm',
            '.flac': 'audio/flac'
        };
        return mimeMap[ext] || 'audio/ogg';
    }

    isAvailable() {
        return !!(this.groqApiKey && this.groqApiKey !== 'your_groq_api_key');
    }
}

module.exports = new VoiceService();
