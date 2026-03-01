const Memory = require('../../models/Memory');
const crypto = require('crypto');

// Secret Key for local DB encryption (in production, should come from ENV)
const ENCRYPTION_KEY = process.env.MEMORY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Must be 256 bits (32 chars)
const IV_LENGTH = 16; // AES block size

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return "[ENCRYPTED CONTENT CORRUPTED]";
    }
}

class MemoryService {
    /**
     * Store a memory for the user
     */
    async store(userId, type, key, value, importance = 5, tags = []) {
        try {
            // If type is secret, encrypt the value!
            let finalValue = value;
            if (type === 'secret') {
                finalValue = encrypt(typeof value === 'object' ? JSON.stringify(value) : String(value));
            }

            const memory = await Memory.findOneAndUpdate(
                { userId, key },
                { userId, type, key, value: finalValue, importance, tags, source: 'conversation' },
                { upsert: true, new: true }
            );
            return memory;
        } catch (error) {
            console.error('Memory store error:', error);
            return null;
        }
    }

    /**
     * Retrieve all memories for a user
     */
    async getAll(userId) {
        try {
            return await Memory.find({ userId })
                .sort({ importance: -1, updatedAt: -1 })
                .limit(50);
        } catch (error) {
            console.error('Memory retrieval error:', error);
            return [];
        }
    }

    /**
     * Get memories by type
     */
    async getByType(userId, type) {
        try {
            return await Memory.find({ userId, type })
                .sort({ importance: -1 })
                .limit(20);
        } catch (error) {
            return [];
        }
    }

    /**
     * Search memories by key or tag
     */
    async search(userId, query) {
        try {
            return await Memory.find({
                userId,
                $or: [
                    { key: { $regex: query, $options: 'i' } },
                    { tags: { $in: [query.toLowerCase()] } },
                    { value: { $regex: query, $options: 'i' } }
                ]
            }).limit(10);
        } catch (error) {
            return [];
        }
    }

    /**
     * Delete a specific memory
     */
    async delete(userId, key) {
        try {
            return await Memory.findOneAndDelete({ userId, key });
        } catch (error) {
            return null;
        }
    }

    /**
     * Get user context for LLM (top memories formatted as text)
     */
    async getUserContext(userId) {
        const memories = await this.getAll(userId);
        return memories.map(m => {
            let decodedValue = m.value;
            if (m.type === 'secret') {
                decodedValue = decrypt(m.value);
            }
            return {
                key: m.key,
                value: typeof decodedValue === 'object' ? JSON.stringify(decodedValue) : decodedValue,
                type: m.type
            };
        });
    }

    /**
     * Auto-extract and store memories from conversation
     */
    async extractFromMessage(userId, message) {
        const stored = [];

        // Detect city mentions
        const cityMatch = message.match(/(?:from|in|at|mein|se)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
        if (cityMatch) {
            const mem = await this.store(userId, 'fact', 'user_city', cityMatch[1], 7, ['location']);
            if (mem) stored.push(mem);
        }

        // Detect name mentions
        const nameMatch = message.match(/(?:my name is|mera naam|i am|main)\s+([A-Z][a-z]+)/i);
        if (nameMatch) {
            const mem = await this.store(userId, 'fact', 'user_name', nameMatch[1], 9, ['identity']);
            if (mem) stored.push(mem);
        }

        // Detect preferences
        const prefMatch = message.match(/(?:i like|i prefer|mujhe pasand|i want)\s+(.+?)(?:\.|$)/i);
        if (prefMatch) {
            const mem = await this.store(userId, 'preference', `pref_${Date.now()}`, prefMatch[1].trim(), 5, ['preference']);
            if (mem) stored.push(mem);
        }

        return stored;
    }
}

module.exports = new MemoryService();
