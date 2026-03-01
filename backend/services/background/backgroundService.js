const BackgroundJob = require('../../models/BackgroundJob');
const User = require('../../models/User');
const plannerService = require('../planner/plannerService');
const telegramService = require('../telegram/telegramService');
const Conversation = require('../../models/Conversation');

class BackgroundService {
    constructor() {
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🔄 Background Autonomous Mode Started (Checking every 1 minute)');

        // Check every minute
        setInterval(() => this.checkJobs(), 60 * 1000);
        // Do an initial check
        this.checkJobs();
    }

    async checkJobs() {
        try {
            const now = new Date();
            // Find jobs where nextRunAt <= now and is active
            const jobs = await BackgroundJob.find({
                isActive: true,
                nextRunAt: { $lte: now }
            }).populate('userId');

            for (const job of jobs) {
                if (!job.userId) continue;
                console.log(`⏱️ Executing Background Job: ${job.taskName} for ${job.userId.email}`);

                // 1. Prepare conversation (create a temporary memory block for context)
                const previousMessages = [{
                    role: 'system',
                    content: `[CRITICAL INSTRUCTION] You are running in AUTONOMOUS BACKGROUND MODE.
You must execute the following scheduled background job: "${job.taskName}".
Context/Prompt: ${job.prompt}
You must perform the necessary actions using tools. If you find something noteworthy, or if the user asked to be alerted, output a final message. The final message will be sent to the user on Telegram.`
                }];

                // 2. Execute via planner
                const result = await plannerService.processMessage(
                    job.userId,
                    previousMessages,
                    `[BACKGROUND TRIGGER]: Run job "${job.taskName}" now.`,
                    null // no onProgress for background
                );

                // 3. Send result to Telegram if there's a meaningful response
                // Since this runs silent, only send if there's content and the agent didn't just say "done"
                if (result.response && result.response.length > 5) {
                    const chatIdMatch = job.userId.email.match(/^tg_(\d+)@samarthya\.local$/);
                    if (chatIdMatch) {
                        const chatId = chatIdMatch[1];
                        await telegramService.sendMessage(
                            chatId,
                            `🤖 *Background Task Completed: ${job.taskName}*\n\n${result.response}`
                        );
                    }
                }

                // 4. Update job schedule
                job.lastRunAt = now;
                if (job.intervalMinutes > 0) {
                    job.nextRunAt = new Date(now.getTime() + job.intervalMinutes * 60000);
                } else {
                    job.isActive = false; // Run once
                }
                await job.save();
            }
        } catch (error) {
            console.error('Background job error:', error);
        }
    }
}

module.exports = new BackgroundService();
