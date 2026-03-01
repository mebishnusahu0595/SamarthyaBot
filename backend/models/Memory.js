const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['preference', 'fact', 'task', 'context', 'reminder'], required: true },
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    importance: { type: Number, default: 5, min: 1, max: 10 },
    expiresAt: Date,
    source: { type: String, default: 'conversation' },
    tags: [String]
}, { timestamps: true });

memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Memory', memorySchema);
