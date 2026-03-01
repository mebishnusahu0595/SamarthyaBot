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

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        name: 'SamarthyaBot Server',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
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

        console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🧠 SamarthyaBot Server v1.1.0                      ║
║   Privacy-first Personal AI Operator                 ║
║                                                      ║
║   🌐 Server:    http://localhost:${PORT}             ║
║   📡 Socket:    ws://localhost:${PORT}               ║
║   🔗 Health:    http://localhost:${PORT}/api/health  ║
║   📱 WhatsApp:  /api/whatsapp/webhook                ║
║   🤖 Telegram:  /api/telegram/webhook                ║
║   👁️  Vision:    /api/screen/analyze                 ║
║                                                      ║
║   🇮🇳 Built for Indian Workflows                      ║
║   📦 Ollama: ${process.env.USE_OLLAMA === 'true' ? '✅ Enabled'.padEnd(35) : '❌ Disabled'.padEnd(35)}║
║   🔄 Autonomous Background Engine: ✅ Active         ║
║   🔌 Dynamic Plugin Engine: ✅ Active                ║
║   ${aiString}                                        ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
        `);
        backgroundService.start();
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    // Start server even without DB for demo
    server.listen(PORT, () => {
        console.log(`⚠️  Server running without DB on port ${PORT}`);
    });
});
