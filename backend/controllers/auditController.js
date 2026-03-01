const AuditLog = require('../models/AuditLog');

// Get audit logs with pagination
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, category, status } = req.query;
        const query = {};

        if (category) query.category = category;
        if (status) query.status = status;

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get audit stats
exports.getAuditStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [totalActions, byCategory, byStatus, recentRisks] = await Promise.all([
            AuditLog.countDocuments({}),
            AuditLog.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
            AuditLog.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            AuditLog.find({
                'details.riskLevel': { $in: ['high', 'critical'] }
            }).sort({ createdAt: -1 }).limit(10)
        ]);

        res.json({
            success: true,
            stats: {
                totalActions,
                byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
                byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
                recentHighRisks: recentRisks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Rollback an action
exports.rollbackAction = async (req, res) => {
    try {
        const log = await AuditLog.findOne({
            _id: req.params.id,
            canRollback: true
        });

        if (!log) {
            return res.status(404).json({ success: false, message: 'Action not found or cannot be rolled back' });
        }

        // Mark as rolled back
        log.status = 'rolled_back';
        await log.save();

        res.json({ success: true, message: 'Action rolled back successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
