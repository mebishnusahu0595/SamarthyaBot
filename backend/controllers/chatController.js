const Conversation = require('../models/Conversation');
const User = require('../models/User');
const plannerService = require('../services/planner/plannerService');
const securityService = require('../services/security/securityService');

// Send message and get AI response
exports.sendMessage = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const userId = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Get or create conversation
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId });
            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation not found' });
            }
        } else {
            conversation = await Conversation.create({
                userId,
                title: message.substring(0, 60) + (message.length > 60 ? '...' : ''),
                messages: [],
                context: {
                    activePack: user.activePack,
                    language: user.language
                }
            });
        }

        // Add user message
        conversation.messages.push({
            role: 'user',
            content: message,
            language: user.language
        });

        // Process through planner
        const conversationHistory = conversation.messages.slice(-20).map(m => ({
            role: m.role,
            content: m.content
        }));

        const result = await plannerService.processMessage(user, conversationHistory, message);

        // Add assistant response
        conversation.messages.push({
            role: 'assistant',
            content: result.response,
            language: result.language,
            toolCalls: result.toolCalls,
            metadata: {
                tokensUsed: result.tokensUsed,
                model: result.model,
                sensitiveDataDetected: result.sensitiveDataWarnings.map(w => w.type)
            }
        });

        await conversation.save();

        // Emit via socket if available
        if (req.io) {
            req.io.to(userId).emit('message', {
                conversationId: conversation._id,
                message: {
                    role: 'assistant',
                    content: result.response,
                    toolCalls: result.toolCalls,
                    sensitiveDataWarnings: result.sensitiveDataWarnings,
                    timestamp: new Date()
                }
            });
        }

        res.json({
            success: true,
            conversationId: conversation._id,
            message: {
                role: 'assistant',
                content: result.response,
                toolCalls: result.toolCalls,
                sensitiveDataWarnings: result.sensitiveDataWarnings,
                tokensUsed: result.tokensUsed,
                model: result.model,
                language: result.language
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all conversations
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ isActive: true })
            .select('title context isPinned createdAt updatedAt')
            .sort({ isPinned: -1, updatedAt: -1 })
            .limit(50);

        res.json({ success: true, conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single conversation with messages
exports.getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        res.json({ success: true, conversation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
    try {
        await Conversation.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: false }
        );
        res.json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Pin/Unpin conversation
exports.togglePin = async (req, res) => {
    try {
        const conv = await Conversation.findOne({ _id: req.params.id });
        if (!conv) return res.status(404).json({ success: false, message: 'Not found' });

        conv.isPinned = !conv.isPinned;
        await conv.save();

        res.json({ success: true, isPinned: conv.isPinned });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
