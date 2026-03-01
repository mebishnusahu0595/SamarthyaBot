const telegramService = require('../services/telegram/telegramService');
const llmService = require('../services/llm/llmService');
const securityService = require('../services/security/securityService');
const plannerService = require('../services/planner/plannerService');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Memory = require('../models/Memory');

/**
 * Handle incoming Telegram messages (POST webhook)
 */
exports.handleMessage = async (req, res) => {
    // Always respond 200 OK fast
    res.status(200).send('OK');

    try {
        const update = req.body;
        // Check if message and text exist
        if (!update.message || !update.message.text) return;

        const chatId = update.message.chat.id;
        const text = update.message.text;
        const fromName = update.message.from?.first_name || 'User';
        const username = update.message.from?.username || chatId;

        console.log(`📱 Telegram from ${fromName} (${chatId}): ${text.substring(0, 50)}`);

        // Find or create user by chatId
        let user = await User.findOne({ email: `tg_${chatId}@samarthya.local` });
        if (!user) {
            user = await User.create({
                name: fromName,
                email: `tg_${chatId}@samarthya.local`,
                password: 'telegram_user',
                language: 'hinglish',
                workType: 'personal',
                activePack: 'personal',
                source: 'telegram'
            });

            // Welcome message for new Telegram users
            await telegramService.sendMessage(chatId,
                '🙏 Namaste! Main *SamarthyaBot* hoon.\n\n' +
                'Main aapka personal AI assistant hoon.\n\n' +
                '💡 Try karo:\n' +
                '• "Bhai, 5 log ka movie ticket ka bill split karo"\n' +
                '• "Kal meeting create karo"\n' +
                '• "Summarize this long text..."\n\n' +
                '🔐 Aapka data yahan puri tarah safe hai.'
            );
            return;
        }

        // Security check
        const securityReport = securityService.scanForSensitiveData(text);
        if (securityReport.found) {
            await telegramService.sendMessage(chatId,
                `⚠️ *Sensitive Data Detected*: ${securityReport.types.join(', ')}\n` +
                'Maine automatically isko mask kar diya hai.'
            );
        }

        // Context (Memories)
        const memories = await Memory.find({ userId: user._id })
            .sort({ importance: -1 })
            .limit(10)
            .lean();

        // Previous Conversation
        let conversation = await Conversation.findOne({
            userId: user._id,
            source: 'telegram',
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ updatedAt: -1 });

        const previousMessages = conversation?.messages?.slice(-6)?.map(m => ({
            role: m.role,
            content: m.content
        })) || [];

        // Progress handler
        const onProgress = async (updateText) => {
            // Send the agent's thought/plan as an intermediate message
            if (updateText && updateText.trim().length > 0) {
                await telegramService.sendMessage(chatId, `🧠 *Agent Progress:*${updateText}`);
            }
        };

        // Process through the full Agentic Planner (OS Tools, Web, Mem)
        const result = await plannerService.processMessage(user, previousMessages, text, onProgress);

        let replyText = result.response;
        // Truncate if too large (~4096 limit in Telegram)
        if (replyText.length > 4000) {
            replyText = replyText.substring(0, 3990) + '\n\n... (truncated)';
        }

        await telegramService.sendMessage(chatId, replyText);

        // Save conversation
        if (!conversation) {
            conversation = new Conversation({ userId: user._id, title: text.substring(0, 20), source: 'telegram', messages: [] });
        }
        conversation.messages.push({ role: 'user', content: text });
        conversation.messages.push({
            role: 'assistant',
            content: result.response,
            toolCalls: result.toolCalls,
            language: result.language,
            metadata: {
                tokensUsed: result.tokensUsed,
                model: result.model
            }
        });
        await conversation.save();

    } catch (error) {
        console.error('Telegram handler error:', error);
    }
};
