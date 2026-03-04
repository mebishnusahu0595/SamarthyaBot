require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const auditRoutes = require('./routes/audit');
const toolsRoutes = require('./routes/tools');
const whatsappRoutes = require('./routes/whatsapp');
const telegramRoutes = require('./routes/telegram');
const screenRoutes = require('./routes/screen');
const fileRoutes = require('./routes/files');
const platformRoutes = require('./routes/platform');
const backgroundService = require('./services/background/backgroundService');

// New PicoClaw-inspired services
const discordService = require('./services/discord/discordService');
const sandboxService = require('./services/security/sandboxService');
const heartbeatService = require('./services/heartbeat/heartbeatService');
const voiceService = require('./services/voice/voiceService');
const spawnService = require('./services/agent/spawnService');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '15mb' }));
app.use(morgan('dev'));

// Inject io into requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

const path = require('path');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/screen', screenRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/platform', platformRoutes);

// Serve static frontend UI (SamarthyaBot Dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Health check — now includes all service statuses
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        name: 'SamarthyaBot Server',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            sandbox: sandboxService.getStatus(),
            heartbeat: heartbeatService.getStatus(),
            voice: voiceService.isAvailable(),
            spawn: spawnService.getStatus()
        }
    });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined room`);
    });

    socket.on('typing', (data) => {
        socket.to(data.userId).emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// SPA Catch-all Middleware for Express 5
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        const activeProvider = process.env.ACTIVE_PROVIDER ? process.env.ACTIVE_PROVIDER.toUpperCase() : 'GEMINI';
        const activeModel = process.env.ACTIVE_MODEL || 'gemini-2.5-flash';
        const aiString = `🧠 Active AI: ${activeProvider} (${activeModel})`.padEnd(49, ' ');

        const discordStatus = process.env.DISCORD_BOT_TOKEN ? '✅ Active' : '⚪ No Token';
        const voiceStatus = voiceService.isAvailable() ? '✅ Groq Whisper' : '⚪ Not Configured';
        const sandboxStatus = sandboxService.enabled ? '✅ Enabled' : '⚠️ Disabled';
        const heartbeatStatus = heartbeatService.enabled ? `✅ Every ${heartbeatService.intervalMinutes}min` : '⚪ Disabled';

        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🇮🇳  SamarthyaBot Server v2.0.0                         ║
║   Privacy-first Personal AI Operator · Made in India     ║
║                                                          ║
║   🌐 Server:    http://localhost:${String(PORT).padEnd(25)}║
║   📡 Socket:    ws://localhost:${String(PORT).padEnd(26)}║
║   🔗 Health:    http://localhost:${PORT}/api/health${' '.repeat(8)}║
║                                                          ║
║   ── Channels ──────────────────────────────────────     ║
║   🤖 Telegram:  /api/telegram/webhook                    ║
║   🟣 Discord:   ${discordStatus.padEnd(39)}║
║   📱 WhatsApp:  /api/whatsapp/webhook                    ║
║   👁️  Vision:    /api/screen/analyze                      ║
║                                                          ║
║   ── AI Engine ─────────────────────────────────────     ║
║   ${aiString.padEnd(55)}║
║   📦 Ollama:    ${(process.env.USE_OLLAMA === 'true' ? '✅ Enabled' : '❌ Disabled').padEnd(39)}║
║   🎙️  Voice:     ${voiceStatus.padEnd(38)}║
║                                                          ║
║   ── Services ──────────────────────────────────────     ║
║   🔄 Background Engine:  ✅ Active                       ║
║   🔌 Plugin Engine:      ✅ Active                       ║
║   🔒 Workspace Sandbox:  ${sandboxStatus.padEnd(31)}║
║   💓 Heartbeat:          ${heartbeatStatus.padEnd(31)}║
║   🚀 Sub-Agent Spawn:    ✅ Ready                        ║
║                                                          ║
║   🇮🇳 Built with ❤️ in India by Bishnu Sahu                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `);

        // Start all services
        backgroundService.start();

        // Start Discord bot (if configured)
        discordService.start(async (message, userId, channel) => {
            // Simple handler — route Discord messages through the chat pipeline
            // This will be connected to your chatController in production
            const chatController = require('./controllers/chatController');
            if (chatController.handleExternalMessage) {
                return chatController.handleExternalMessage(message, userId, channel);
            }
            return 'Namaste! Main SamarthyaBot hoon. Chat service starting up... 🚀';
        });

        // Start Heartbeat periodic tasks
        heartbeatService.start(async (task, userId, channel) => {
            console.log(`💓 Heartbeat executing: ${task.substring(0, 50)}`);
            return null; // Tasks are logged, full pipeline integration comes next
        });
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    // Start server even without DB for demo
    server.listen(PORT, () => {
        console.log(`⚠️  Server running without DB on port ${PORT}`);
    });
});
