const BackgroundJob = require('../models/BackgroundJob');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const toolRegistry = require('../services/tools/toolRegistry');

exports.getPlatformStatus = async (req, res) => {
    try {
        const activeJobs = await BackgroundJob.countDocuments({ isActive: true });

        let pluginsCount = 0;
        try {
            const pluginDir = path.join(os.homedir(), 'SamarthyaBot_Files', 'plugins');
            const files = await fs.readdir(pluginDir);
            pluginsCount = files.filter(f => f.endsWith('.js')).length;
        } catch (e) { }

        res.json({
            success: true,
            status: {
                uptime: process.uptime(),
                totalTools: toolRegistry.getAllTools().length,
                activeBackgroundJobs: activeJobs,
                loadedPlugins: pluginsCount,
                osName: os.type() + ' ' + os.release(),
                ramUsage: Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBackgroundJobs = async (req, res) => {
    try {
        const jobs = await BackgroundJob.find().sort({ nextRunAt: 1 }).limit(20);
        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.emergencyStop = async (req, res) => {
    try {
        // Stop all active background jobs
        await BackgroundJob.updateMany({ isActive: true }, { $set: { isActive: false } });

        // In a real system you might also want to set a global flag in plannerService to reject new processing
        res.json({ success: true, message: "🚨 EMERGENCY STOP ENGAGED. All background jobs halted." });
        console.warn("🛑 EMERGENCY KILL SWITCH ACTIVATED BY USER 🛑");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
