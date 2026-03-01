const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    action: { type: String, required: true },
    category: {
        type: String,
        enum: ['file', 'email', 'browser', 'calendar', 'search', 'system', 'security', 'tool'],
        required: true
    },
    details: {
        toolName: String,
        input: mongoose.Schema.Types.Mixed,
        output: mongoose.Schema.Types.Mixed,
        riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
        sensitiveDataFound: [String],
        permissionGranted: Boolean
    },
    status: { type: String, enum: ['success', 'failed', 'blocked', 'rolled_back'], default: 'success' },
    rollbackData: mongoose.Schema.Types.Mixed,
    canRollback: { type: Boolean, default: false }
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ category: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
