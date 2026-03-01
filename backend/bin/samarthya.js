#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const args = process.argv.slice(2);
const command = args[0];

const backendDir = path.join(__dirname, '..');

// Helper to check if server is already running on port 5000
const isServerRunning = () => {
    try {
        execSync('fuser 5000/tcp 2>/dev/null');
        return true;
    } catch {
        return false;
    }
}

if (!command) {
    console.log(`
🤖 SamarthyaBot Local AI Agent
Usage:
  samarthya onboard      - Setup your local environment
  samarthya model        - Change your active AI provider/model
  samarthya gateway      - Start the local server
  samarthya status       - Check if the agent is running
  samarthya tunnel       - Expose to internet & setup webhooks 
  samarthya stop         - Stop the running gateway
  samarthya restart      - Restart the gateway
`);
    process.exit(0);
}

switch (command) {
    case 'onboard':
        console.log('🚀 Running SamarthyaBot Setup Wizard...');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (query) => new Promise(resolve => rl.question(query, resolve));

        (async () => {
            console.log("\n🌐 Select your primary AI Provider:");
            console.log("  1) Google Gemini (Default)");
            console.log("  2) Anthropic Claude");
            console.log("  3) Groq (Fastest)");
            console.log("  4) OpenAI");
            console.log("  5) Local Ollama (Offline)");
            console.log("  6) Mistral AI\n");

            let providerRaw = await question("Enter choice (1-6, default 1): ");
            let activeProvider = 'gemini';
            let useOllama = 'false';

            switch (providerRaw.trim()) {
                case '2': activeProvider = 'anthropic'; break;
                case '3': activeProvider = 'groq'; break;
                case '4': activeProvider = 'openai'; break;
                case '5':
                    activeProvider = 'ollama';
                    useOllama = 'true';
                    break;
                case '6': activeProvider = 'mistral'; break;
                case '1':
                default:
                    activeProvider = 'gemini';
                    break;
            }

            console.log(`\n👉 Selected Provider: ${activeProvider.toUpperCase()}\n`);

            const geminiKey = await question('🔑 Enter Google Gemini API Key (or press Enter to skip if already set): ');
            const anthropicKey = await question('🔑 Enter Anthropic (Claude) API Key (or press Enter to skip): ');
            const groqKey = await question('🔑 Enter Groq API Key (or press Enter to skip): ');
            const openAiKey = await question('🔑 Enter OpenAI API Key (or press Enter to skip): ');

            const envPath = path.join(backendDir, '.env');
            let envVars = {};

            // Read existing if present to keep other configs
            if (fs.existsSync(envPath)) {
                const currentEnv = fs.readFileSync(envPath, 'utf8');
                currentEnv.split('\n').forEach(line => {
                    const [k, v] = line.split('=');
                    if (k && v) envVars[k.trim()] = v.trim();
                });
            } else {
                envVars = {
                    PORT: '5000',
                    MONGODB_URI: 'mongodb://localhost:27017/samarthya',
                    JWT_SECRET: 'samarthya_secret_key_change_in_production',
                    NODE_ENV: 'production',
                    CORS_ORIGIN: 'http://localhost:5000',
                    USE_OLLAMA: useOllama,
                    ACTIVE_PROVIDER: activeProvider,
                    ACTIVE_MODEL: activeProvider === 'gemini' ? 'gemini-2.5-flash' : '',
                    OLLAMA_URL: 'http://localhost:11434',
                    OLLAMA_MODEL: 'dolphin3:8b-llama3.1-q4_K_M'
                };
            }

            envVars['USE_OLLAMA'] = useOllama;
            envVars['ACTIVE_PROVIDER'] = activeProvider;

            // Assign keys if provided
            if (geminiKey.trim()) envVars['GEMINI_API_KEY'] = geminiKey.trim();
            if (anthropicKey.trim()) envVars['ANTHROPIC_API_KEY'] = anthropicKey.trim();
            if (groqKey.trim()) envVars['GROQ_API_KEY'] = groqKey.trim();
            if (openAiKey.trim()) envVars['OPENAI_API_KEY'] = openAiKey.trim();

            if (!envVars['GEMINI_API_KEY']) envVars['GEMINI_API_KEY'] = 'dummy';

            // Write back to .env
            const newEnvContent = Object.keys(envVars).map(k => `${k}=${envVars[k]}`).join('\n');
            fs.writeFileSync(envPath, newEnvContent);
            console.log('\n✅ Keys saved to .env file securely.');

            console.log('📦 Installing backend dependencies (this might take a few seconds)...');
            try {
                execSync('npm install --production', { cwd: backendDir, stdio: 'ignore' });
            } catch (e) { /* ignore */ }

            console.log('\n✨ Onboarding complete! Run "samarthya gateway" to start your AI Operator.');
            rl.close();
            process.exit(0);
        })();
        break;

    case 'model':
        console.log('🔄 Changing SamarthyaBot Active AI Model...');
        const rlModel = readline.createInterface({ input: process.stdin, output: process.stdout });
        const qModel = (query) => new Promise(res => rlModel.question(query, res));

        (async () => {
            console.log("\n🌐 Select your primary AI Provider:");
            console.log("  1) Google Gemini (Default)");
            console.log("  2) Anthropic Claude");
            console.log("  3) Groq (Fastest)");
            console.log("  4) OpenAI");
            console.log("  5) Local Ollama (Offline)");
            console.log("  6) Mistral AI\n");

            let pRaw = await qModel("Enter choice (1-6, default 1): ");
            let aProv = 'gemini';
            let uOll = 'false';

            switch (pRaw.trim()) {
                case '2': aProv = 'anthropic'; break;
                case '3': aProv = 'groq'; break;
                case '4': aProv = 'openai'; break;
                case '5': aProv = 'ollama'; uOll = 'true'; break;
                case '6': aProv = 'mistral'; break;
                default: aProv = 'gemini'; break;
            }

            let aMod = '';
            console.log(`\n📌 Sub-Models for ${aProv.toUpperCase()}:`);
            if (aProv === 'gemini') {
                console.log(" 1) gemini-2.5-flash        (Fastest reasoning, great pricing)");
                console.log(" 2) gemini-2.5-pro          (Advanced complex multi-step reasoning)");
                console.log(" 3) gemini-2.5-flash-lite   (Fastest, budget friendly)");
                console.log(" 4) gemini-2.0-flash        (Older 1M context version)");
                const mSel = await qModel("Enter model choice (or type custom model ID directly): ");
                if (mSel.trim() === '1' || mSel.trim() === '') aMod = 'gemini-2.5-flash';
                else if (mSel.trim() === '2') aMod = 'gemini-2.5-pro';
                else if (mSel.trim() === '3') aMod = 'gemini-2.5-flash-lite';
                else if (mSel.trim() === '4') aMod = 'gemini-2.0-flash';
                else aMod = mSel.trim();
            } else if (aProv === 'openai') {
                console.log(" 1) gpt-5.2      (Best for coding & agentic tasks)");
                console.log(" 2) gpt-5-mini   (Faster, cost-efficient GPT-5)");
                console.log(" 3) gpt-4o       (Fast, intelligent, flexible)");
                console.log(" 4) o3-mini      (Small reasoning alternative)");
                const mSel = await qModel("Enter model choice (or type custom ID): ");
                if (mSel.trim() === '1') aMod = 'gpt-5.2';
                else if (mSel.trim() === '2') aMod = 'gpt-5-mini';
                else if (mSel.trim() === '3') aMod = 'gpt-4o';
                else if (mSel.trim() === '4') aMod = 'o3-mini';
                else aMod = mSel.trim();
            } else if (aProv === 'groq') {
                console.log(" 1) llama-3.3-70b-versatile  (Best overall Llama)");
                console.log(" 2) llama-3.1-8b-instant     (Extreme Fast Llama)");
                console.log(" 3) qwen/qwen3-32b           (Powerful 32b reasoning)");
                const mSel = await qModel("Enter model choice (or type custom ID): ");
                if (mSel.trim() === '1' || mSel.trim() === '') aMod = 'llama-3.3-70b-versatile';
                else if (mSel.trim() === '2') aMod = 'llama-3.1-8b-instant';
                else if (mSel.trim() === '3') aMod = 'qwen/qwen3-32b';
                else aMod = mSel.trim();
            } else if (aProv === 'mistral') {
                console.log(" 1) mistral-large-3          (General-purpose multimodal)");
                console.log(" 2) ministral-3-8b           (Powerful & efficient)");
                console.log(" 3) mistral-small-3.2        (Small latest model)");
                console.log(" 4) devstral-2               (Best for code & agents)");
                const mSel = await qModel("Enter model choice (or type custom ID): ");
                if (mSel.trim() === '1' || mSel.trim() === '') aMod = 'mistral-large-3';
                else if (mSel.trim() === '2') aMod = 'ministral-3-8b';
                else if (mSel.trim() === '3') aMod = 'mistral-small-3.2';
                else if (mSel.trim() === '4') aMod = 'devstral-2';
                else aMod = mSel.trim();
            } else if (aProv === 'anthropic') {
                console.log(" 1) claude-3-5-sonnet-latest");
                console.log(" 2) claude-3-opus-latest");
                const mSel = await qModel("Enter model choice (or type custom ID): ");
                if (mSel.trim() === '1' || mSel.trim() === '') aMod = 'claude-3-5-sonnet-latest';
                else if (mSel.trim() === '2') aMod = 'claude-3-opus-latest';
                else aMod = mSel.trim();
            } else if (aProv === 'ollama') {
                console.log(" Your models list usually includes:");
                console.log(" 1) dolphin3:8b-llama3.1-q4_K_M   (Default)");
                console.log(" 2) llama3:8b");
                console.log(" 3) mistral");
                const mSel = await qModel("Enter model choice (or type custom Ollama tag): ");
                if (mSel.trim() === '1' || mSel.trim() === '') aMod = 'dolphin3:8b-llama3.1-q4_K_M';
                else if (mSel.trim() === '2') aMod = 'llama3:8b';
                else if (mSel.trim() === '3') aMod = 'mistral';
                else aMod = mSel.trim();
            }

            const ePath = path.join(backendDir, '.env');
            if (fs.existsSync(ePath)) {
                let currentEnv = fs.readFileSync(ePath, 'utf8');
                let lines = currentEnv.split('\n');
                let updated = false;
                let mUpdated = false;

                lines = lines.map(line => {
                    if (line.startsWith('ACTIVE_PROVIDER=')) { updated = true; return `ACTIVE_PROVIDER=${aProv}`; }
                    if (line.startsWith('ACTIVE_MODEL=')) { mUpdated = true; return `ACTIVE_MODEL=${aMod}`; }
                    if (line.startsWith('USE_OLLAMA=')) { uUpdated = true; return `USE_OLLAMA=${uOll}`; }
                    if (aProv === 'ollama' && line.startsWith('OLLAMA_MODEL=')) { return `OLLAMA_MODEL=${aMod}`; }
                    return line;
                });

                if (!updated) lines.push(`ACTIVE_PROVIDER=${aProv}`);
                if (!mUpdated) lines.push(`ACTIVE_MODEL=${aMod}`);
                if (!uUpdated) lines.push(`USE_OLLAMA=${uOll}`);

                fs.writeFileSync(ePath, lines.join('\n'));
                console.log(`\n✅ Model successfully switched to: ${aProv.toUpperCase()}!`);
                console.log('🔄 Please restart the gateway if it is currently running.');
            } else {
                console.log('❌ Error: .env file not found. Please run "samarthya onboard" first.');
            }

            rlModel.close();
        })();
        break;

    case 'gateway':
        if (isServerRunning()) {
            console.log('⚠️  Gateway is already running on port 5000!');
            console.log('🌐 Access the dashboard at http://localhost:5000');
            process.exit(0);
        }

        try { require('dotenv').config({ path: path.join(backendDir, '.env') }); } catch (e) { /* ignore if not installed */ }

        const activeProvider = process.env.ACTIVE_PROVIDER ? process.env.ACTIVE_PROVIDER.toUpperCase() : 'GEMINI';
        const activeModel = process.env.ACTIVE_MODEL || 'gemini-2.5-flash';

        console.log('🚀 Starting SamarthyaBot Gateway in the background...');
        console.log(`🧠 Local Config: Using ${activeProvider} (${activeModel})`);
        console.log('💡 Tip: Run "samarthya model" to change your AI provider/model at any time.');
        console.log('🌐 You can access your agent dashboard at http://localhost:5000\n');

        // We use spawn to run the server
        const child = spawn('node', ['server.js'], {
            cwd: backendDir,
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            console.log(`Gateway exited with code ${code}`);
        });
        break;

    case 'status':
        if (isServerRunning()) {
            console.log('🟢 SamarthyaBot Gateway is actively running on port 5000.');
            console.log('🌐 Dashboard: http://localhost:5000');
        } else {
            console.log('🔴 SamarthyaBot Gateway is offline. Run "samarthya gateway" to start.');
        }
        break;

    case 'tunnel':
        console.log('🚇 Starting LocalTunnel to expose port 5000 to the internet...');
        if (!isServerRunning()) {
            console.log('⚠️  Warning: SamarthyaBot Gateway is not running! Run "samarthya gateway" in another terminal first.');
        }

        try { require('dotenv').config({ path: path.join(backendDir, '.env') }); } catch (e) { }

        const tunnelProcess = spawn('npx', ['localtunnel', '--port', '5000'], { stdio: 'pipe' });

        tunnelProcess.stdout.on('data', async (data) => {
            const output = data.toString();
            console.log(output.trim());
            const match = output.match(/your url is: (https:\/\/.+)/);
            if (match && match[1]) {
                const publicUrl = match[1];
                console.log(`\n✅ Public Gateway URL: ${publicUrl}`);

                // Set Telegram Webhook Automatically
                if (process.env.TELEGRAM_BOT_TOKEN) {
                    console.log('🔗 Setting Telegram Webhook...');
                    try {
                        const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${publicUrl}/api/telegram/webhook`;
                        const res = await fetch(tgUrl);
                        const result = await res.json();
                        if (result.ok) {
                            console.log('🟢 Telegram Webhook Set Successfully!');
                        } else {
                            console.log('🔴 Failed to set Telegram Webhook:', result.description);
                        }
                    } catch (err) {
                        console.log('🔴 Error setting Telegram Webhook:', err.message);
                    }
                } else {
                    console.log('ℹ️  TELEGRAM_BOT_TOKEN not found in .env. Skipping Telegram Webhook setup.');
                }

                console.log('\n📱 Put this URL in your Meta WhatsApp App Dashboard:');
                console.log(`   ${publicUrl}/api/whatsapp/webhook`);
                console.log('\n(Leave this terminal running to keep the tunnel open natively)');
            }
        });

        tunnelProcess.stderr.on('data', (data) => {
            console.error('Tunnel Error:', data.toString());
        });

        tunnelProcess.on('close', (code) => {
            console.log(`Tunnel closed with code ${code}`);
        });

        break;

    case 'stop':
        if (isServerRunning()) {
            console.log('🛑 Stopping SamarthyaBot Gateway...');
            try {
                execSync('fuser -k 5000/tcp 2>/dev/null');
                console.log('✅ Gateway stopped successfully.');
            } catch (e) {
                console.log('❌ Failed to stop gateway gracefully. Process might already be dead.');
            }
        } else {
            console.log('⚠️  Gateway is not currently running.');
        }
        break;

    case 'restart':
        console.log('🔄 Restarting SamarthyaBot Gateway...');
        if (isServerRunning()) {
            try {
                execSync('fuser -k 5000/tcp 2>/dev/null');
            } catch (e) { /* ignore */ }
        }
        // Give it a moment to free the port
        setTimeout(() => {
            const restartChild = spawn('node', ['server.js'], {
                cwd: backendDir,
                stdio: 'inherit'
            });
            restartChild.on('close', (code) => {
                console.log(`Gateway exited with code ${code}`);
            });
            console.log('✅ Gateway restarted successfully!');
            console.log('🌐 Dashboard: http://localhost:5000\n');
        }, 1000);
        break;

    default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Try "samarthya onboard" or "samarthya gateway"');
        process.exit(1);
}
