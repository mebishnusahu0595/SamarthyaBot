const whatsappService = require('../services/whatsapp/whatsappService');
const llmService = require('../services/llm/llmService');
const securityService = require('../services/security/securityService');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Memory = require('../models/Memory');

/**
 * WhatsApp Webhook Verification (GET)
 * Meta sends this to verify your webhook URL
 */
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === whatsappService.verifyToken) {
        console.log('✅ WhatsApp webhook verified');
        return res.status(200).send(challenge);
    }

    console.error('❌ WhatsApp webhook verification failed');
    return res.status(403).send('Forbidden');
};

/**
 * WhatsApp Incoming Message Handler (POST)
 * Processes incoming messages and sends AI responses
 */
exports.handleMessage = async (req, res) => {
    // Always respond 200 quickly (WhatsApp requires fast ACK)
    res.status(200).send('EVENT_RECEIVED');

    try {
        const parsed = whatsappService.parseWebhookMessage(req.body);
        if (!parsed) return;

        console.log(`📱 WhatsApp from ${parsed.contactName} (${parsed.from}): ${parsed.text || parsed.type}`);

        // Mark as read
        await whatsappService.markAsRead(parsed.messageId);

        // Find or create user by phone
        let user = await User.findOne({ phone: parsed.from });
        if (!user) {
            user = await User.create({
                name: parsed.contactName,
                phone: parsed.from,
                email: `wa_${parsed.from}@samarthya.local`,
                password: 'whatsapp_user',
                language: 'hinglish',
                workType: 'personal',
                activePack: 'personal',
                source: 'whatsapp'
            });

            // Welcome message for new WhatsApp users
            await whatsappService.sendMessage(parsed.from,
                '🙏 Namaste! Main SamarthyaBot hoon.\n\n' +
                'Main aapka personal AI assistant hoon. Hindi, Hinglish ya English mein baat karo!\n\n' +
                '💡 Try karo:\n' +
                '• "GST ki deadline kab hai?"\n' +
                '• "500 * 18% calculate karo"\n' +
                '• "Reminder set karo"\n' +
                '• Screenshot bhejo — main samajh lunga!\n\n' +
                '🔐 Aapka data safe hai. PAN/Aadhaar auto-mask hota hai.'
            );
            return;
        }

        // Handle image messages → Screen Understanding
        if (parsed.type === 'image' && parsed.mediaId) {
            await handleScreenshot(parsed, user);
            return;
        }

        // Handle text messages → AI pipeline
        if (parsed.text) {
            await handleTextMessage(parsed, user);
            return;
        }

        // Handle audio → notify not supported yet
        if (parsed.type === 'audio') {
            await whatsappService.sendMessage(parsed.from,
                '🎤 Voice notes ka support jald aa raha hai! Abhi ke liye text mein likho ya screenshot bhejo.'
            );
        }

    } catch (error) {
        console.error('WhatsApp handler error:', error);
    }
};

/**
 * Process text messages through AI pipeline
 */
async function handleTextMessage(parsed, user) {
    try {
        // Security scan
        const securityReport = securityService.scanForSensitiveData(parsed.text);
        if (securityReport.found) {
            await whatsappService.sendMessage(parsed.from,
                `⚠️ Sensitive data detected: ${securityReport.types.join(', ')}\n` +
                '🔐 Main isko mask kar dunga. Dhyan rakhein!'
            );
        }

        // Get user memories for context
        const memories = await Memory.find({ userId: user._id })
            .sort({ importance: -1 })
            .limit(10)
            .lean();

        // Get/create conversation
        let conversation = await Conversation.findOne({
            userId: user._id,
            source: 'whatsapp',
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24h
        }).sort({ updatedAt: -1 });

        const previousMessages = conversation?.messages?.slice(-6)?.map(m => ({
            role: m.role,
            content: m.content
        })) || [];

        // Build prompt and call LLM
        const systemPrompt = llmService.buildSystemPrompt(user, [], memories);
        const messages = [
            ...previousMessages,
            { role: 'user', content: parsed.text }
        ];

        const response = await llmService.chat(messages, systemPrompt, user);

        // Truncate for WhatsApp (4096 char limit)
        let replyText = response.content;
        if (replyText.length > 4000) {
            replyText = replyText.substring(0, 3990) + '\n\n... (truncated)';
        }

        // Mask sensitive data in response
        replyText = securityService.maskSensitiveData(replyText);

        // Save conversation
        if (!conversation) {
            conversation = await Conversation.create({
                userId: user._id,
                title: parsed.text.substring(0, 50),
                source: 'whatsapp',
                messages: []
            });
        }

        conversation.messages.push(
            { role: 'user', content: parsed.text },
            { role: 'assistant', content: replyText }
        );
        await conversation.save();

        // Send reply
        await whatsappService.sendMessage(parsed.from, replyText);

    } catch (error) {
        console.error('Text message handler error:', error);
        await whatsappService.sendMessage(parsed.from,
            '❌ Kuch error aa gaya. Thodi der baad try karo.'
        );
    }
}

/**
 * Handle screenshot messages → Gemini Vision (Screen Understanding)
 */
async function handleScreenshot(parsed, user) {
    try {
        await whatsappService.sendMessage(parsed.from,
            '👁️ Screenshot received! Analyzing...'
        );

        // Download image from WhatsApp
        const media = await whatsappService.downloadMedia(parsed.mediaId);
        if (!media) {
            await whatsappService.sendMessage(parsed.from,
                '❌ Image download fail ho gaya. Dubara bhejo.'
            );
            return;
        }

        // Convert to base64 for Gemini Vision
        const base64Image = media.buffer.toString('base64');
        const prompt = parsed.caption ||
            'Is screenshot mein kya hai? Mujhe batao aur next step suggest karo.';

        // Call Gemini Vision
        const analysis = await llmService.analyzeScreen(base64Image, prompt, user);

        // Truncate for WhatsApp
        let replyText = analysis.content;
        if (replyText.length > 4000) {
            replyText = replyText.substring(0, 3990) + '\n\n... (truncated)';
        }

        replyText = securityService.maskSensitiveData(replyText);

        await whatsappService.sendMessage(parsed.from, replyText);

    } catch (error) {
        console.error('Screenshot handler error:', error);
        await whatsappService.sendMessage(parsed.from,
            '❌ Screen analysis mein error aa gaya. Check karo ki Gemini API key set hai .env mein.'
        );
    }
}
