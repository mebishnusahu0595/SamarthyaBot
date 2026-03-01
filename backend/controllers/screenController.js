const llmService = require('../services/llm/llmService');
const securityService = require('../services/security/securityService');
const AuditLog = require('../models/AuditLog');

/**
 * Analyze a screenshot via Gemini Vision
 * POST /api/screen/analyze
 * Body: { image: base64string, prompt?: string }
 */
exports.analyzeScreen = async (req, res) => {
    try {
        const { image, prompt } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Screenshot image required (base64)' });
        }

        // Remove data URL prefix if present
        let base64Image = image;
        if (base64Image.startsWith('data:image')) {
            base64Image = base64Image.split(',')[1];
        }

        // Size check (max ~10MB base64)
        if (base64Image.length > 14_000_000) {
            return res.status(400).json({ error: 'Image too large. Max 10MB.' });
        }

        const user = req.user;

        // Audit log
        await AuditLog.create({
            userId: user._id,
            action: 'Screen analysis requested',
            category: 'browser',
            details: {
                toolName: 'screen_understanding',
                prompt: prompt || 'Auto-analyze',
                imageSize: `${Math.round(base64Image.length / 1024)}KB`,
                riskLevel: 'medium'
            },
            status: 'success',
            riskLevel: 'medium'
        });

        // Call Gemini Vision
        const analysis = await llmService.analyzeScreen(
            base64Image,
            prompt || 'Analyze this screenshot. Identify what app/website this is, what the user is trying to do, and suggest the next steps.',
            user
        );

        // Mask any sensitive data in the analysis
        analysis.content = securityService.maskSensitiveData(analysis.content);

        res.json({
            success: true,
            analysis: {
                content: analysis.content,
                model: analysis.model,
                tokensUsed: analysis.tokensUsed || 0
            }
        });

    } catch (error) {
        console.error('Screen analyze error:', error);
        res.status(500).json({
            error: 'Screen analysis failed',
            message: error.message
        });
    }
};

/**
 * List supported screen types this AI can understand
 * GET /api/screen/supported
 */
exports.getSupportedScreens = (req, res) => {
    res.json({
        supported: [
            { id: 'irctc', name: 'IRCTC', nameHi: 'आईआरसीटीसी', desc: 'Train booking, PNR status, tatkal' },
            { id: 'gst', name: 'GST Portal', nameHi: 'जीएसटी पोर्टल', desc: 'GSTR filing, returns, challan' },
            { id: 'digilocker', name: 'DigiLocker', nameHi: 'डिजीलॉकर', desc: 'Document download, Aadhaar, PAN' },
            { id: 'upi', name: 'UPI Apps', nameHi: 'यूपीआई ऐप्स', desc: 'GPay, PhonePe, Paytm transactions' },
            { id: 'banking', name: 'Net Banking', nameHi: 'नेट बैंकिंग', desc: 'Balance check, transfers, statements' },
            { id: 'ecommerce', name: 'E-Commerce', nameHi: 'ई-कॉमर्स', desc: 'Amazon, Flipkart orders & tracking' },
            { id: 'govt', name: 'Govt Portals', nameHi: 'सरकारी पोर्टल', desc: 'Income tax, passport, PF' },
            { id: 'any', name: 'Any Website', nameHi: 'कोई भी वेबसाइट', desc: 'General form filling assistance' },
        ]
    });
};
