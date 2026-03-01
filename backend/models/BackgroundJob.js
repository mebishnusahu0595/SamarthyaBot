const mongoose = require('mongoose');

const backgroundJobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskName: { type: String, required: true },
    prompt: { type: String, required: true },
    intervalMinutes: { type: Number, required: true }, // 0 means run once
    lastRunAt: { type: Date },
    nextRunAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('BackgroundJob', backgroundJobSchema);
