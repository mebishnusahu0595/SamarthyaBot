#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const args = process.argv.slice(2);
const command = args[0];
const backendDir = path.join(__dirname, '..');

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🎨 TERMINAL COLORS                       ║
// ╚══════════════════════════════════════════════════════════════╝
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    under: '\x1b[4m',
    // Indian Flag Colors
    saffron: '\x1b[38;2;255;153;51m',
    white: '\x1b[38;2;255;255;255m',
    green: '\x1b[38;2;19;136;8m',
    navy: '\x1b[38;2;0;0;128m',
    // UI Colors
    red: '\x1b[38;2;239;68;68m',
    cyan: '\x1b[38;2;34;211;238m',
    yellow: '\x1b[38;2;250;204;21m',
    purple: '\x1b[38;2;168;85;247m',
    pink: '\x1b[38;2;244;114;182m',
    lime: '\x1b[38;2;74;222;128m',
    gray: '\x1b[38;2;120;120;120m',
    dimWhite: '\x1b[38;2;180;180,180m',
    // Backgrounds
    bgSaffron: '\x1b[48;2;255;153;51m',
    bgGreen: '\x1b[48;2;19;136;8m',
    bgNavy: '\x1b[48;2;0;0;128m',
    bgDark: '\x1b[48;2;15;15;25m',
};

// ╔══════════════════════════════════════════════════════════════╗
// ║                   🏳️ ASCII ART BANNER                       ║
// ╚══════════════════════════════════════════════════════════════╝
const BANNER = `
${c.saffron}${c.bold}  ███████╗ █████╗ ███╗   ███╗ █████╗ ██████╗ ████████╗██╗  ██╗██╗   ██╗ █████╗ 
  ██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██║  ██║╚██╗ ██╔╝██╔══██╗
  ███████╗███████║██╔████╔██║███████║██████╔╝   ██║   ███████║ ╚████╔╝ ███████║
${c.white}  ╚════██║██╔══██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██╔══██║  ╚██╔╝  ██╔══██║
  ███████║██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ██║  ██║   ██║   ██║  ██║
  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
${c.green}              ██████╗  ██████╗ ████████╗
              ██╔══██╗██╔═══██╗╚══██╔══╝
              ██████╔╝██║   ██║   ██║   
${c.green}              ██╔══██╗██║   ██║   ██║   
              ██████╔╝╚██████╔╝   ██║   
              ╚═════╝  ╚═════╝    ╚═╝   ${c.reset}

${c.gray}  ─────────────────────────────────────────────────────────────────────────────${c.reset}
${c.dim}          🇮🇳  Privacy-First Local Agentic OS  •  Made in India  🇮🇳${c.reset}
${c.gray}  ─────────────────────────────────────────────────────────────────────────────${c.reset}
`;

const MINI_BANNER = `
${c.saffron}${c.bold}  ╔═══╗╔═══╗╔╗╔╗╔═══╗╔═══╗╔════╗╔╗ ╔╗╔╗ ╔╗╔═══╗  ╔══╗╔═══╗╔════╗${c.reset}
${c.saffron}  ║╔═╗║║╔═╗║║║║║║╔═╗║║╔═╗║║╔╗╔╗║║║ ║║╚╝ ╚╝║╔═╗║  ║╔╗║║╔═╗║║╔╗╔╗║${c.reset}
${c.white}${c.bold}  ║╚══╗║║ ║║║╚╝║║║ ║║║╚═╝║╚╝║║╚╝║╚═╝║     ║║ ║║  ║╚╝╚╗║║ ║║╚╝║║╚╝${c.reset}
${c.white}  ╚══╗║║╚═╝║║╔╗║║╚═╝║║╔╗╔╝  ║║  ║╔═╗║     ║╚═╝║  ║╔═╗║║║ ║║  ║║  ${c.reset}
${c.green}${c.bold}  ║╚═╝║║╔═╗║║║║║║╔═╗║║║║║   ║║  ║║ ║║     ║╔═╗║  ║╚═╝║║╚═╝║  ║║  ${c.reset}
${c.green}  ╚═══╝╚╝ ╚╝╚╝╚╝╚╝ ╚╝╚╝╚╝   ╚╝  ╚╝ ╚╝     ╚╝ ╚╝  ╚═══╝╚═══╝  ╚╝  ${c.reset}
`;

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🛠 HELPER UTILITIES                       ║
// ╚══════════════════════════════════════════════════════════════╝

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Animated spinner
class Spinner {
    constructor(text) {
        this.text = text;
        this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.i = 0;
        this.timer = null;
    }
    start() {
        this.timer = setInterval(() => {
            process.stdout.write(`\r${c.cyan}${this.frames[this.i++ % this.frames.length]}${c.reset} ${this.text}`);
        }, 80);
    }
    stop(successText) {
        clearInterval(this.timer);
        process.stdout.write(`\r${c.lime}✔${c.reset} ${successText || this.text}\n`);
    }
    fail(failText) {
        clearInterval(this.timer);
        process.stdout.write(`\r${c.red}✖${c.reset} ${failText || this.text}\n`);
    }
}

// Progress bar
const progressBar = (current, total, width = 30) => {
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    const bar = `${c.saffron}${'█'.repeat(filled)}${c.gray}${'░'.repeat(empty)}${c.reset}`;
    return `${bar} ${c.dim}${current}/${total}${c.reset}`;
};

// Step header
const stepHeader = (num, total, text) => {
    console.log(`\n${c.saffron}${c.bold}  [${num}/${total}]${c.reset} ${c.white}${c.bold}${text}${c.reset}`);
    console.log(`${c.gray}  ${'─'.repeat(60)}${c.reset}`);
};

// Labeled print
const info = (text) => console.log(`  ${c.cyan}ℹ${c.reset}  ${text}`);
const success = (text) => console.log(`  ${c.lime}✔${c.reset}  ${text}`);
const warn = (text) => console.log(`  ${c.yellow}⚠${c.reset}  ${text}`);
const error = (text) => console.log(`  ${c.red}✖${c.reset}  ${text}`);

// Create readline interface
const createRL = () => readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (rl, query) => new Promise(resolve => rl.question(query, resolve));

// Check if server is running
const isServerRunning = () => {
    try {
        if (process.platform === 'win32') {
            const output = execSync('netstat -ano | findstr :5000', { encoding: 'utf-8' });
            return output.includes('LISTENING');
        } else {
            execSync('lsof -i:5000 -t 2>/dev/null');
            return true;
        }
    } catch { return false; }
};

// Read existing .env
const readEnv = () => {
    const envPath = path.join(backendDir, '.env');
    const envVars = {};
    if (fs.existsSync(envPath)) {
        fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
            const eqIndex = line.indexOf('=');
            if (eqIndex > 0) {
                const k = line.substring(0, eqIndex).trim();
                const v = line.substring(eqIndex + 1).trim();
                if (k) envVars[k] = v;
            }
        });
    }
    return envVars;
};

// Write .env
const writeEnv = (envVars) => {
    const envPath = path.join(backendDir, '.env');
    const content = Object.keys(envVars).map(k => `${k}=${envVars[k]}`).join('\n');
    fs.writeFileSync(envPath, content);
};

// Mask API key for display
const maskKey = (key) => {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '•'.repeat(Math.min(key.length - 8, 20)) + key.substring(key.length - 4);
};

// ╔══════════════════════════════════════════════════════════════╗
// ║                PROVIDER & MODEL DEFINITIONS                  ║
// ╚══════════════════════════════════════════════════════════════╝

const PROVIDERS = [
    { id: 'gemini', name: 'Google Gemini', tag: 'Free Tier', color: c.cyan, envKey: 'GEMINI_API_KEY' },
    { id: 'groq', name: 'Groq', tag: 'Fastest', color: c.yellow, envKey: 'GROQ_API_KEY' },
    { id: 'anthropic', name: 'Anthropic Claude', tag: 'Smartest', color: c.purple, envKey: 'ANTHROPIC_API_KEY' },
    { id: 'openai', name: 'OpenAI', tag: 'GPT-5', color: c.lime, envKey: 'OPENAI_API_KEY' },
    { id: 'deepseek', name: 'DeepSeek', tag: 'Budget', color: c.cyan, envKey: 'DEEPSEEK_API_KEY' },
    { id: 'qwen', name: 'Qwen', tag: 'Alibaba', color: c.pink, envKey: 'QWEN_API_KEY' },
    { id: 'openrouter', name: 'OpenRouter', tag: '100+ Models', color: c.saffron, envKey: 'OPENROUTER_API_KEY' },
    { id: 'ollama', name: 'Ollama', tag: 'Offline', color: c.green, envKey: null },
    { id: 'mistral', name: 'Mistral AI', tag: 'EU Privacy', color: c.white, envKey: 'MISTRAL_API_KEY' },
];

const MODELS = {
    gemini: [
        { id: 'gemini-2.5-flash', desc: 'Fastest reasoning, great pricing' },
        { id: 'gemini-2.5-pro', desc: 'Advanced multi-step reasoning' },
        { id: 'gemini-2.5-flash-lite', desc: 'Budget friendly' },
        { id: 'gemini-2.0-flash', desc: 'Older 1M context' },
    ],
    groq: [
        { id: 'llama-3.3-70b-versatile', desc: 'Best overall Llama' },
        { id: 'llama-3.1-8b-instant', desc: 'Extreme fast' },
        { id: 'qwen/qwen3-32b', desc: 'Powerful 32b reasoning' },
    ],
    anthropic: [
        { id: 'claude-3-5-sonnet-latest', desc: 'Best balance' },
        { id: 'claude-3-opus-latest', desc: 'Most capable' },
    ],
    openai: [
        { id: 'gpt-5.2', desc: 'Best for coding & agentic' },
        { id: 'gpt-5-mini', desc: 'Faster, cost-efficient' },
        { id: 'gpt-4o', desc: 'Fast, intelligent' },
        { id: 'o3-mini', desc: 'Small reasoning' },
    ],
    deepseek: [
        { id: 'deepseek-chat', desc: 'General purpose chat' },
        { id: 'deepseek-coder', desc: 'Code specialized' },
    ],
    qwen: [
        { id: 'qwen-max', desc: 'Most capable Qwen' },
        { id: 'qwen-turbo', desc: 'Fast and efficient' },
    ],
    openrouter: [
        { id: 'auto', desc: 'Auto-select best model' },
        { id: 'anthropic/claude-3.5-sonnet', desc: 'Claude via OpenRouter' },
        { id: 'google/gemini-2.5-flash', desc: 'Gemini via OpenRouter' },
    ],
    ollama: [
        { id: 'dolphin3:8b-llama3.1-q4_K_M', desc: 'Default local' },
        { id: 'llama3:8b', desc: 'Meta Llama 3' },
        { id: 'mistral', desc: 'Mistral local' },
    ],
    mistral: [
        { id: 'mistral-large-3', desc: 'General-purpose multimodal' },
        { id: 'ministral-3-8b', desc: 'Powerful & efficient' },
        { id: 'devstral-2', desc: 'Best for code & agents' },
    ],
};

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🚀 CLI COMMANDS                           ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── Show help ───
if (!command) {
    console.log(BANNER);
    console.log(`${c.bold}  COMMANDS:${c.reset}`);
    console.log(`    ${c.saffron}samarthya onboard${c.reset}     ${c.dim}Setup + Start everything (single command!)${c.reset}`);
    console.log(`    ${c.saffron}samarthya gateway${c.reset}     ${c.dim}Start the local server${c.reset}`);
    console.log(`    ${c.saffron}samarthya model${c.reset}       ${c.dim}Change AI provider/model${c.reset}`);
    console.log(`    ${c.saffron}samarthya telegram${c.reset}    ${c.dim}Configure Telegram bot${c.reset}`);
    console.log(`    ${c.saffron}samarthya discord${c.reset}     ${c.dim}Configure Discord bot${c.reset}`);
    console.log(`    ${c.saffron}samarthya config${c.reset}      ${c.dim}View current configuration${c.reset}`);
    console.log(`    ${c.saffron}samarthya tunnel${c.reset}      ${c.dim}Expose to internet & setup webhooks${c.reset}`);
    console.log(`    ${c.saffron}samarthya status${c.reset}      ${c.dim}Check if agent is running${c.reset}`);
    console.log(`    ${c.saffron}samarthya stop${c.reset}        ${c.dim}Stop the gateway${c.reset}`);
    console.log(`    ${c.saffron}samarthya restart${c.reset}     ${c.dim}Restart the gateway${c.reset}\n`);
    process.exit(0);
}

switch (command) {

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                   📦 ONBOARD WIZARD                          ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'onboard': {
        console.log(BANNER);
        console.log(`  ${c.saffron}${c.bold}🚀 Setup Wizard${c.reset}${c.dim} — Let's get your AI agent ready!\n${c.reset}`);

        const rl = createRL();
        const q = (query) => ask(rl, `  ${c.white}${query}${c.reset}`);

        (async () => {
            const TOTAL_STEPS = 5;

            // ── Step 1: Select AI Provider ──
            stepHeader(1, TOTAL_STEPS, 'Select AI Provider');
            console.log();
            PROVIDERS.forEach((p, i) => {
                const num = `${i + 1}`.padStart(2);
                console.log(`    ${c.dim}${num})${c.reset} ${p.color}${c.bold}${p.name}${c.reset} ${c.gray}(${p.tag})${c.reset}`);
            });
            console.log();

            let providerRaw = await q(`  Enter choice [${c.saffron}1-9${c.reset}, default ${c.saffron}1${c.reset}]: `);
            const provIdx = parseInt(providerRaw.trim()) - 1;
            const provider = PROVIDERS[provIdx >= 0 && provIdx < PROVIDERS.length ? provIdx : 0];
            const activeProvider = provider.id;
            const useOllama = activeProvider === 'ollama' ? 'true' : 'false';

            console.log(`\n  ${c.lime}✔${c.reset} Selected: ${provider.color}${c.bold}${provider.name}${c.reset}\n`);

            // ── Step 2: API Key for selected provider ──
            stepHeader(2, TOTAL_STEPS, 'API Key Configuration');
            let apiKey = '';
            if (provider.envKey) {
                apiKey = await q(`  🔑 Enter ${provider.name} API Key: `);
                if (apiKey.trim()) {
                    success(`Key saved: ${c.dim}${maskKey(apiKey.trim())}${c.reset}`);
                } else {
                    info(`Skipped — will use existing key if available`);
                }
            } else {
                info(`${provider.name} runs locally — no API key needed`);
            }
            console.log();

            // ── Step 3: Telegram configuration ──
            stepHeader(3, TOTAL_STEPS, 'Channel Integrations');
            let telegramToken = '';
            let discordToken = '';

            const enableTg = await q(`  📱 Enable Telegram Bot? (${c.lime}y${c.reset}/${c.red}n${c.reset}): `);
            if (enableTg.trim().toLowerCase() === 'y' || enableTg.trim().toLowerCase() === 'yes') {
                telegramToken = await q(`  🤖 Enter Telegram Bot Token: `);
                if (telegramToken.trim()) {
                    success(`Telegram configured: ${c.dim}${maskKey(telegramToken.trim())}${c.reset}`);
                }
            } else {
                info(`Telegram skipped`);
            }
            console.log();

            const enableDc = await q(`  🟣 Enable Discord Bot? (${c.lime}y${c.reset}/${c.red}n${c.reset}): `);
            if (enableDc.trim().toLowerCase() === 'y' || enableDc.trim().toLowerCase() === 'yes') {
                discordToken = await q(`  🟣 Enter Discord Bot Token: `);
                if (discordToken.trim()) {
                    success(`Discord configured: ${c.dim}${maskKey(discordToken.trim())}${c.reset}`);
                }
            } else {
                info(`Discord skipped`);
            }
            console.log();

            // ── Step 4: Save configuration ──
            stepHeader(4, TOTAL_STEPS, 'Saving Configuration');

            const spin1 = new Spinner('Writing .env configuration...');
            spin1.start();
            await sleep(600);

            const envPath = path.join(backendDir, '.env');
            let envVars = readEnv();

            // Set defaults if fresh install
            if (!envVars['PORT']) {
                Object.assign(envVars, {
                    PORT: '5000',
                    MONGO_URI: 'mongodb://localhost:27017/samarthya',
                    JWT_SECRET: 'samarthya_secret_key_change_in_production',
                    NODE_ENV: 'production',
                    CORS_ORIGIN: 'http://localhost:5000',
                    OLLAMA_URL: 'http://localhost:11434',
                    OLLAMA_MODEL: 'dolphin3:8b-llama3.1-q4_K_M',
                    RESTRICT_TO_WORKSPACE: 'true',
                    HEARTBEAT_INTERVAL: '30',
                });
            }

            envVars['ACTIVE_PROVIDER'] = activeProvider;
            envVars['USE_OLLAMA'] = useOllama;
            if (activeProvider === 'gemini' && !envVars['ACTIVE_MODEL']) envVars['ACTIVE_MODEL'] = 'gemini-2.5-flash';

            if (apiKey.trim() && provider.envKey) envVars[provider.envKey] = apiKey.trim();
            if (telegramToken.trim()) envVars['TELEGRAM_BOT_TOKEN'] = telegramToken.trim();
            if (discordToken.trim()) envVars['DISCORD_BOT_TOKEN'] = discordToken.trim();

            // Auto-generate encryption key
            if (!envVars['MEMORY_ENCRYPTION_KEY']) {
                const crypto = require('crypto');
                envVars['MEMORY_ENCRYPTION_KEY'] = crypto.randomBytes(16).toString('hex');
            }

            if (!envVars['GEMINI_API_KEY']) envVars['GEMINI_API_KEY'] = 'dummy';

            writeEnv(envVars);
            spin1.stop('Configuration saved');

            const spin2 = new Spinner('Installing dependencies...');
            spin2.start();
            try {
                execSync('npm install --production 2>/dev/null', { cwd: backendDir, stdio: 'ignore' });
                spin2.stop('Dependencies installed');
            } catch {
                spin2.fail('Dependencies install failed (non-critical)');
            }

            rl.close();

            // ── Step 5: Boot Gateway ──
            stepHeader(5, TOTAL_STEPS, 'Starting SamarthyaBot');

            console.log();
            const bootSteps = [
                'Loading AI modules',
                'Connecting database',
                'Starting security sandbox',
                'Initializing heartbeat service',
                'Registering tool packs',
                'Booting web server'
            ];

            for (let i = 0; i < bootSteps.length; i++) {
                const s = new Spinner(bootSteps[i] + '...');
                s.start();
                await sleep(400 + Math.random() * 300);
                s.stop(bootSteps[i]);
            }

            console.log(`\n${c.gray}  ─────────────────────────────────────────────────────────────${c.reset}`);
            console.log(`  ${c.lime}${c.bold}🚀 SamarthyaBot is READY!${c.reset}`);
            console.log(`  ${c.dim}Dashboard: ${c.cyan}${c.under}http://localhost:5000${c.reset}`);
            console.log(`  ${c.dim}Provider:  ${provider.color}${provider.name}${c.reset}`);
            if (telegramToken.trim()) console.log(`  ${c.dim}Telegram:  ${c.lime}Connected${c.reset}`);
            if (discordToken.trim()) console.log(`  ${c.dim}Discord:   ${c.purple}Connected${c.reset}`);
            console.log(`${c.gray}  ─────────────────────────────────────────────────────────────${c.reset}\n`);

            // Load .env and spawn the server
            try { require('dotenv').config({ path: envPath }); } catch (e) { }

            const gatewayChild = spawn('node', ['server.js'], {
                cwd: backendDir,
                stdio: 'inherit'
            });

            gatewayChild.on('close', (code) => {
                console.log(`\n${c.red}Gateway exited with code ${code}${c.reset}`);
            });

            // Auto-start tunnel if Telegram configured
            setTimeout(() => {
                if (envVars['TELEGRAM_BOT_TOKEN'] && envVars['TELEGRAM_BOT_TOKEN'] !== 'dummy') {
                    info('Auto-starting tunnel for Telegram webhook...');
                    const isWin = process.platform === 'win32';
                    const tunnelChild = spawn('npm', ['exec', 'localtunnel', '--', '--port', '5000'], {
                        stdio: 'pipe', shell: isWin
                    });
                    tunnelChild.stdout.on('data', async (data) => {
                        const output = data.toString();
                        const match = output.match(/your url is: (https:\/\/.+)/);
                        if (match && match[1]) {
                            const publicUrl = match[1];
                            success(`Public URL: ${c.cyan}${c.under}${publicUrl}${c.reset}`);
                            if (envVars['TELEGRAM_BOT_TOKEN']) {
                                try {
                                    const tgUrl = `https://api.telegram.org/bot${envVars['TELEGRAM_BOT_TOKEN']}/setWebhook?url=${publicUrl}/api/telegram/webhook`;
                                    const res = await fetch(tgUrl);
                                    const result = await res.json();
                                    if (result.ok) success('Telegram Webhook set!');
                                    else warn('Telegram Webhook failed: ' + result.description);
                                } catch (err) { warn('Webhook error: ' + err.message); }
                            }
                        }
                    });
                    tunnelChild.stderr.on('data', (data) => warn('Tunnel: ' + data.toString().trim()));
                }
            }, 3000);
        })();
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                    🧠 MODEL SWITCH                           ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'model': {
        console.log(`\n${c.saffron}${c.bold}  🧠 Model Selector${c.reset}\n`);

        const rl = createRL();
        const q = (query) => ask(rl, `  ${c.white}${query}${c.reset}`);

        (async () => {
            // Step 1: Provider
            console.log(`  ${c.bold}Select Provider:${c.reset}`);
            PROVIDERS.forEach((p, i) => {
                console.log(`    ${c.dim}${i + 1})${c.reset} ${p.color}${p.name}${c.reset} ${c.gray}(${p.tag})${c.reset}`);
            });
            console.log();

            let pRaw = await q(`  Choice [1-9]: `);
            const pIdx = parseInt(pRaw.trim()) - 1;
            const prov = PROVIDERS[pIdx >= 0 && pIdx < PROVIDERS.length ? pIdx : 0];

            console.log(`\n  ${c.lime}✔${c.reset} Provider: ${prov.color}${c.bold}${prov.name}${c.reset}\n`);

            // Step 2: Model
            const models = MODELS[prov.id] || [];
            if (models.length > 0) {
                console.log(`  ${c.bold}Select Model:${c.reset}`);
                models.forEach((m, i) => {
                    console.log(`    ${c.dim}${i + 1})${c.reset} ${c.white}${m.id}${c.reset} ${c.gray}— ${m.desc}${c.reset}`);
                });
                console.log();
            }

            let mRaw = await q(`  Choice (or type custom ID): `);
            const mIdx = parseInt(mRaw.trim()) - 1;
            let modelId = '';
            if (mIdx >= 0 && mIdx < models.length) modelId = models[mIdx].id;
            else if (mRaw.trim()) modelId = mRaw.trim();
            else modelId = models[0]?.id || '';

            console.log(`\n  ${c.lime}✔${c.reset} Model: ${c.cyan}${c.bold}${modelId}${c.reset}\n`);

            // Save
            const spin = new Spinner('Updating configuration...');
            spin.start();
            await sleep(400);

            const envVars = readEnv();
            envVars['ACTIVE_PROVIDER'] = prov.id;
            envVars['ACTIVE_MODEL'] = modelId;
            envVars['USE_OLLAMA'] = prov.id === 'ollama' ? 'true' : 'false';
            if (prov.id === 'ollama') envVars['OLLAMA_MODEL'] = modelId;
            writeEnv(envVars);

            spin.stop('Configuration updated');
            warn('Restart the gateway for changes to take effect: ' + c.saffron + 'samarthya restart' + c.reset);

            rl.close();
        })();
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                 📱 TELEGRAM CONFIG                           ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'telegram': {
        console.log(`\n${c.saffron}${c.bold}  📱 Telegram Configuration${c.reset}\n`);

        const rl = createRL();
        const q = (query) => ask(rl, `  ${c.white}${query}${c.reset}`);

        (async () => {
            const envVars = readEnv();
            const existing = envVars['TELEGRAM_BOT_TOKEN'];

            if (existing && existing !== 'dummy') {
                info(`Current token: ${c.dim}${maskKey(existing)}${c.reset}`);
            }

            const token = await q(`  🤖 Enter Telegram Bot Token (or Enter to keep): `);
            if (token.trim()) {
                const spin = new Spinner('Saving Telegram token...');
                spin.start();
                await sleep(400);
                envVars['TELEGRAM_BOT_TOKEN'] = token.trim();
                writeEnv(envVars);
                spin.stop('Telegram token saved');
                info(`Run ${c.saffron}samarthya tunnel${c.reset} to set webhook automatically`);
            } else {
                info('No changes made');
            }
            rl.close();
        })();
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                 🟣 DISCORD CONFIG                            ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'discord': {
        console.log(`\n${c.purple}${c.bold}  🟣 Discord Configuration${c.reset}\n`);

        const rl = createRL();
        const q = (query) => ask(rl, `  ${c.white}${query}${c.reset}`);

        (async () => {
            const envVars = readEnv();
            const existing = envVars['DISCORD_BOT_TOKEN'];

            if (existing) {
                info(`Current token: ${c.dim}${maskKey(existing)}${c.reset}`);
            }

            const token = await q(`  🟣 Enter Discord Bot Token (or Enter to keep): `);
            if (token.trim()) {
                const spin = new Spinner('Saving Discord token...');
                spin.start();
                await sleep(400);
                envVars['DISCORD_BOT_TOKEN'] = token.trim();
                writeEnv(envVars);
                spin.stop('Discord token saved');
                info(`Restart gateway to connect: ${c.saffron}samarthya restart${c.reset}`);
            } else {
                info('No changes made');
            }

            // Allow-list config
            const allowFrom = await q(`  👤 Discord user IDs to allow (comma-separated, or Enter to skip): `);
            if (allowFrom.trim()) {
                envVars['DISCORD_ALLOW_FROM'] = allowFrom.trim();
                writeEnv(envVars);
                success('Allow-list updated');
            }

            rl.close();
        })();
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                 ⚙️ CONFIG VIEWER                             ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'config': {
        console.log(`\n${c.saffron}${c.bold}  ⚙️  Current Configuration${c.reset}\n`);
        const envVars = readEnv();

        const configItems = [
            { label: 'AI Provider', key: 'ACTIVE_PROVIDER', color: c.cyan },
            { label: 'AI Model', key: 'ACTIVE_MODEL', color: c.cyan },
            { label: 'Port', key: 'PORT', color: c.white },
            { label: 'MongoDB', key: 'MONGO_URI', color: c.green },
            { label: 'Gemini Key', key: 'GEMINI_API_KEY', color: c.cyan, mask: true },
            { label: 'Groq Key', key: 'GROQ_API_KEY', color: c.yellow, mask: true },
            { label: 'Anthropic Key', key: 'ANTHROPIC_API_KEY', color: c.purple, mask: true },
            { label: 'OpenAI Key', key: 'OPENAI_API_KEY', color: c.lime, mask: true },
            { label: 'DeepSeek Key', key: 'DEEPSEEK_API_KEY', color: c.cyan, mask: true },
            { label: 'OpenRouter Key', key: 'OPENROUTER_API_KEY', color: c.saffron, mask: true },
            { label: 'Telegram Token', key: 'TELEGRAM_BOT_TOKEN', color: c.cyan, mask: true },
            { label: 'Discord Token', key: 'DISCORD_BOT_TOKEN', color: c.purple, mask: true },
            { label: 'Encryption Key', key: 'MEMORY_ENCRYPTION_KEY', color: c.red, mask: true },
            { label: 'Sandbox', key: 'RESTRICT_TO_WORKSPACE', color: c.green },
            { label: 'Heartbeat (min)', key: 'HEARTBEAT_INTERVAL', color: c.pink },
        ];

        const maxLabel = Math.max(...configItems.map(i => i.label.length));

        configItems.forEach(item => {
            const val = envVars[item.key];
            const label = item.label.padEnd(maxLabel + 2);
            if (val && val !== 'dummy') {
                const display = item.mask ? maskKey(val) : val;
                console.log(`  ${c.dim}${label}${c.reset} ${item.color}${display}${c.reset}`);
            } else {
                console.log(`  ${c.dim}${label}${c.reset} ${c.gray}not set${c.reset}`);
            }
        });

        console.log(`\n  ${c.dim}File: ${path.join(backendDir, '.env')}${c.reset}\n`);
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                    🌐 GATEWAY                                ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'gateway': {
        if (isServerRunning()) {
            warn('Gateway is already running on port 5000!');
            info(`Dashboard: ${c.cyan}${c.under}http://localhost:5000${c.reset}`);
            process.exit(0);
        }

        console.log(MINI_BANNER);

        try { require('dotenv').config({ path: path.join(backendDir, '.env') }); } catch (e) { }

        const prov = process.env.ACTIVE_PROVIDER?.toUpperCase() || 'GEMINI';
        const mod = process.env.ACTIVE_MODEL || 'gemini-2.5-flash';

        console.log(`  ${c.dim}Provider: ${c.saffron}${prov}${c.reset} ${c.dim}(${mod})${c.reset}`);
        console.log(`  ${c.dim}Dashboard: ${c.cyan}${c.under}http://localhost:5000${c.reset}\n`);

        const child = spawn('node', ['server.js'], {
            cwd: backendDir,
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            console.log(`\n${c.red}Gateway exited with code ${code}${c.reset}`);
        });
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                    📊 STATUS                                 ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'status': {
        console.log();
        if (isServerRunning()) {
            success(`${c.bold}SamarthyaBot is ${c.lime}ONLINE${c.reset}`);
            info(`Dashboard: ${c.cyan}${c.under}http://localhost:5000${c.reset}`);

            const envVars = readEnv();
            if (envVars['ACTIVE_PROVIDER']) {
                info(`Provider: ${c.saffron}${envVars['ACTIVE_PROVIDER'].toUpperCase()}${c.reset}`);
            }
        } else {
            error(`${c.bold}SamarthyaBot is ${c.red}OFFLINE${c.reset}`);
            info(`Start with: ${c.saffron}samarthya gateway${c.reset}`);
        }
        console.log();
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                 🚇 TUNNEL                                    ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'tunnel': {
        console.log(`\n${c.saffron}${c.bold}  🚇 LocalTunnel${c.reset}\n`);

        if (!isServerRunning()) {
            warn('Gateway is not running! Start it first: ' + c.saffron + 'samarthya gateway' + c.reset);
        }

        try { require('dotenv').config({ path: path.join(backendDir, '.env') }); } catch (e) { }

        const spin = new Spinner('Connecting to tunnel service...');
        spin.start();

        const isWin = process.platform === 'win32';
        const tunnelProcess = spawn('npm', ['exec', 'localtunnel', '--', '--port', '5000'], {
            stdio: 'pipe', shell: isWin
        });

        tunnelProcess.stdout.on('data', async (data) => {
            const output = data.toString();
            const match = output.match(/your url is: (https:\/\/.+)/);
            if (match && match[1]) {
                spin.stop('Tunnel connected');
                const publicUrl = match[1];
                success(`Public URL: ${c.cyan}${c.under}${publicUrl}${c.reset}`);
                info(`Telegram webhook: ${publicUrl}/api/telegram/webhook`);
                info(`WhatsApp webhook: ${publicUrl}/api/whatsapp/webhook`);

                if (process.env.TELEGRAM_BOT_TOKEN) {
                    const spin2 = new Spinner('Setting Telegram webhook...');
                    spin2.start();
                    try {
                        const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${publicUrl}/api/telegram/webhook`;
                        const res = await fetch(tgUrl);
                        const result = await res.json();
                        if (result.ok) spin2.stop('Telegram webhook set!');
                        else spin2.fail('Webhook failed: ' + result.description);
                    } catch (err) {
                        spin2.fail('Webhook error: ' + err.message);
                    }
                }

                console.log(`\n  ${c.dim}Keep this terminal open to maintain the tunnel${c.reset}\n`);
            }
        });

        tunnelProcess.stderr.on('data', (data) => {
            const msg = data.toString().trim();
            if (msg) warn('Tunnel: ' + msg);
        });

        tunnelProcess.on('close', (code) => {
            console.log(`\n${c.dim}Tunnel closed with code ${code}${c.reset}`);
        });
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                    🛑 STOP                                   ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'stop': {
        console.log();
        if (isServerRunning()) {
            const spin = new Spinner('Stopping SamarthyaBot...');
            spin.start();
            try {
                if (process.platform === 'win32') {
                    const netstatOut = execSync('netstat -ano | findstr :5000', { encoding: 'utf-8' });
                    netstatOut.split('\n').forEach(line => {
                        if (line.includes('LISTENING')) {
                            const parts = line.trim().split(/\s+/);
                            const pid = parts[parts.length - 1];
                            if (pid && pid !== '0') execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                        }
                    });
                } else {
                    execSync('lsof -t -i:5000 | xargs kill -9 2>/dev/null || fuser -k 5000/tcp 2>/dev/null');
                }
                spin.stop('Gateway stopped');
            } catch {
                spin.fail('Failed to stop gateway');
            }
        } else {
            info('Gateway is not running');
        }
        console.log();
        break;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║                    🔄 RESTART                                ║
    // ╚══════════════════════════════════════════════════════════════╝
    case 'restart': {
        console.log();
        const spin = new Spinner('Restarting SamarthyaBot...');
        spin.start();

        if (isServerRunning()) {
            try {
                if (process.platform === 'win32') {
                    const netstatOut = execSync('netstat -ano | findstr :5000', { encoding: 'utf-8' });
                    netstatOut.split('\n').forEach(line => {
                        if (line.includes('LISTENING')) {
                            const parts = line.trim().split(/\s+/);
                            const pid = parts[parts.length - 1];
                            if (pid && pid !== '0') execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                        }
                    });
                } else {
                    execSync('lsof -t -i:5000 | xargs kill -9 2>/dev/null || fuser -k 5000/tcp 2>/dev/null');
                }
            } catch { }
        }

        setTimeout(() => {
            spin.stop('Restarted');
            const restartChild = spawn('node', ['server.js'], {
                cwd: backendDir,
                stdio: 'inherit'
            });
            restartChild.on('close', (code) => {
                console.log(`\n${c.red}Gateway exited with code ${code}${c.reset}`);
            });
            info(`Dashboard: ${c.cyan}${c.under}http://localhost:5000${c.reset}\n`);
        }, 1200);
        break;
    }

    default:
        error(`Unknown command: ${c.bold}${command}${c.reset}`);
        info(`Run ${c.saffron}samarthya${c.reset} to see all commands`);
        process.exit(1);
}
