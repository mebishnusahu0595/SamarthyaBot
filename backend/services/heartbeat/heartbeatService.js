/**
 * Heartbeat Service for SamarthyaBot
 * Reads HEARTBEAT.md periodically and executes autonomous tasks
 * Inspired by PicoClaw's heartbeat feature
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class HeartbeatService {
    constructor() {
        this.enabled = process.env.HEARTBEAT_ENABLED !== 'false'; // default: true
        this.intervalMinutes = parseInt(process.env.HEARTBEAT_INTERVAL || '30', 10);
        if (this.intervalMinutes < 5) this.intervalMinutes = 5; // Minimum 5 minutes
        this.workspace = process.env.WORKSPACE_PATH || path.join(os.homedir(), 'SamarthyaBot_Files');
        this.heartbeatFile = path.join(this.workspace, 'HEARTBEAT.md');
        this.timer = null;
        this.chatHandler = null;
        this.isRunning = false;
    }

    /**
     * Start the heartbeat loop
     * @param {Function} chatHandler - Function to process tasks (same as chat pipeline)
     */
    start(chatHandler) {
        if (!this.enabled) {
            console.log('⚪ Heartbeat: Disabled');
            return;
        }

        this.chatHandler = chatHandler;

        // Create HEARTBEAT.md if it doesn't exist
        this.ensureHeartbeatFile();

        console.log(`💓 Heartbeat: Active (every ${this.intervalMinutes} minutes)`);
        console.log(`💓 Heartbeat file: ${this.heartbeatFile}`);

        // Run first check after a short delay (let server fully boot)
        setTimeout(() => this.tick(), 30000);

        // Schedule periodic checks
        this.timer = setInterval(() => this.tick(), this.intervalMinutes * 60 * 1000);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log('💓 Heartbeat: Stopped');
    }

    ensureHeartbeatFile() {
        try {
            if (!fs.existsSync(this.workspace)) {
                fs.mkdirSync(this.workspace, { recursive: true });
            }
            if (!fs.existsSync(this.heartbeatFile)) {
                const defaultContent = `# SamarthyaBot Heartbeat Tasks

## Quick Tasks
- Report the current date and time

## Long Tasks (Background)
# Add tasks here that should run periodically
# - Search the web for AI news and summarize
# - Check if any reminders are due
`;
                fs.writeFileSync(this.heartbeatFile, defaultContent, 'utf-8');
                console.log('💓 Created default HEARTBEAT.md');
            }
        } catch (error) {
            console.error('💓 Heartbeat: Error creating file:', error.message);
        }
    }

    async tick() {
        if (this.isRunning) {
            console.log('💓 Heartbeat: Previous tick still running, skipping...');
            return;
        }

        this.isRunning = true;

        try {
            if (!fs.existsSync(this.heartbeatFile)) {
                this.isRunning = false;
                return;
            }

            const content = fs.readFileSync(this.heartbeatFile, 'utf-8');
            const tasks = this.parseTasks(content);

            if (tasks.length === 0) {
                this.isRunning = false;
                return;
            }

            console.log(`💓 Heartbeat: Found ${tasks.length} tasks to execute`);

            for (const task of tasks) {
                try {
                    console.log(`💓 Executing: ${task.substring(0, 60)}...`);
                    if (this.chatHandler) {
                        await this.chatHandler(
                            `[HEARTBEAT TASK] ${task}. Keep response brief, max 2 sentences.`,
                            'heartbeat-system',
                            'heartbeat'
                        );
                    }
                } catch (err) {
                    console.error(`💓 Task failed: ${err.message}`);
                }
            }
        } catch (error) {
            console.error('💓 Heartbeat tick error:', error.message);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Parse tasks from HEARTBEAT.md
     * Extracts lines starting with "- " that are not comments (# prefixed content)
     */
    parseTasks(content) {
        const lines = content.split('\n');
        const tasks = [];

        for (const line of lines) {
            const trimmed = line.trim();
            // Match task lines: "- task description" but not "# - commented task"
            if (trimmed.startsWith('- ') && !trimmed.startsWith('# ')) {
                const task = trimmed.substring(2).trim();
                if (task.length > 0) {
                    tasks.push(task);
                }
            }
        }

        return tasks;
    }

    getStatus() {
        return {
            enabled: this.enabled,
            interval: `${this.intervalMinutes} minutes`,
            file: this.heartbeatFile,
            running: this.isRunning
        };
    }
}

module.exports = new HeartbeatService();
