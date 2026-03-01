const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
    content: { type: String, required: true },
    language: { type: String, enum: ['hindi', 'hinglish', 'english'], default: 'english' },
    toolCalls: [{
        toolName: String,
        arguments: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
        status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'blocked'], default: 'pending' },
        riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
        notificationParams: mongoose.Schema.Types.Mixed,
        executedAt: Date
    }],
    metadata: {
        tokensUsed: Number,
        responseTime: Number,
        model: String,
        sensitiveDataDetected: [String]
    }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: [messageSchema],
    context: {
        activePack: String,
        language: String,
        taskType: String
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    source: { type: String, enum: ['web', 'whatsapp', 'telegram'], default: 'web' }
}, { timestamps: true });

conversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
