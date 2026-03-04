<div align="center">
  <img src="https://raw.githubusercontent.com/mebishnusahu0595/SamarthyaBot/main/backend/public/logo.png" width="180" height="180" alt="SamarthyaBot Logo">

  <h1>🇮🇳 SamarthyaBot — Your Local Agentic OS</h1>

  <h3>Privacy-First · Multi-Agent · Autonomous · Made in India 🇮🇳</h3>

  <p>
    <img src="https://img.shields.io/badge/Node.js-20_LTS-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go&logoColor=white" alt="Go Worker">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/MongoDB-Local-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/license-MIT-138808?style=flat" alt="License">
    <br>
    <a href="https://www.npmjs.com/package/samarthya-bot"><img src="https://img.shields.io/npm/v/samarthya-bot?color=FF9933&style=flat&logo=npm&logoColor=white&label=npm" alt="NPM"></a>
    <a href="https://github.com/mebishnusahu0595/SamarthyaBot"><img src="https://img.shields.io/github/stars/mebishnusahu0595/SamarthyaBot?style=flat&color=FFD600&logo=github" alt="Stars"></a>
    <img src="https://img.shields.io/badge/PRs-welcome-FF9933?style=flat" alt="PRs Welcome">
  </p>
</div>

---

🤖 SamarthyaBot is a **privacy-first personal AI Operating System** that runs entirely on YOUR devices. It's not just a chatbot — it's a **Full RPA (Robotic Process Automation) Agent** that writes code, commits to GitHub, deploys to servers, controls browsers, sends real emails, and handles Indian workflows (GST, UPI, IRCTC) — all from a single Telegram message or a beautiful Web Dashboard.

⚡ Powered by a **Go Micro-Worker** for live terminal streaming, **Puppeteer** for real browser control, and multi-provider AI (Gemini, Claude, Ollama, DeepSeek, OpenRouter) — SamarthyaBot is the most feature-rich self-hosted AI agent built for Indian developers.

> [!CAUTION]
> **🚨 SECURITY NOTICE**
>
> * SamarthyaBot runs **locally on YOUR machine**. Your data never leaves your device.
> * All sensitive data (API keys, memories) is encrypted via **AES-256-CBC**.
> * Dangerous commands (`rm -rf`, `mkfs`, `format`) are **blocked by regex blacklists**.
> * SamarthyaBot is in active development — use with caution in production.

---

## ✨ Features

| Feature | Description | Status |
| :--- | :--- | :---: |
| 🤖 **Full RPA Engine** | Writes code, commits to GitHub, deploys to VPS autonomously | ✅ Live |
| ⚡ **Go Micro-Worker** | Live terminal streaming — `npm build`, `git push` without freezing Node.js | ✅ Live |
| 🌍 **SSH Deployments** | Deploy to remote servers via password or PEM key from a chat prompt | ✅ Live |
| 🕸️ **Browser Controller** | Puppeteer-based real DOM interaction — scrape, click, navigate | ✅ Live |
| 🛡️ **Zero-Harm Blacklists** | OS regex block-layer protects against dangerous commands | ✅ Live |
| 🧠 **Autonomous Planner** | ReAct engine breaks complex requests into discrete steps | ✅ Live |
| 🔐 **Encrypted Memory** | AES-256-CBC encrypted local memory in MongoDB | ✅ Live |
| 🇮🇳 **Indian Localization** | GST calculator, UPI links, IRCTC, Hindi/Hinglish fluency | ✅ Live |
| 📧 **Real Email** | Send actual emails via Nodemailer SMTP — not a simulation | ✅ Live |
| 📁 **File Manager** | Read, write, edit, append, list files in your workspace | ✅ Live |
| 👁️ **Screen Vision** | Gemini Vision analyzes screenshots for UI/UX understanding | ✅ Live |
| 📱 **Telegram Bot** | Full two-way Telegram integration with webhook + tunnel | ✅ Live |
| 🌐 **Web Dashboard** | Beautiful React UI to manage agent, view logs, chat live | ✅ Live |
| 🔌 **Plugin System** | Drop a `.js` file → new AI skill. Zero restart needed | ✅ Live |
| 🤖 **Multi-LLM** | Gemini, Claude, DeepSeek, Qwen, OpenRouter, Ollama | ✅ Live |
| 🎙️ **Voice (Whisper)** | Groq/Whisper transcription for Telegram voice notes | ✅ Live |
| 💬 **Discord Bot** | Full Discord integration with mention-only mode | ✅ Live |
| 🔒 **Workspace Sandbox** | File ops restricted to workspace, configurable security | ✅ Live |
| 💓 **Heartbeat Tasks** | Periodic autonomous tasks from `HEARTBEAT.md` | ✅ Live |
| 🚀 **Sub-Agent Spawn** | Non-blocking background agents for long-running tasks | ✅ Live |

## 🏆 Comparison

|                        | OpenClaw       | PicoClaw             | **SamarthyaBot** 🇮🇳               |
| ---------------------- | -------------- | -------------------- | ----------------------------------- |
| **Language**           | TypeScript     | Go                   | **Node.js + Go + React**            |
| **Browser Control**    | ❌ None        | ❌ Search APIs only  | **✅ Real Puppeteer DOM**           |
| **Web Dashboard**      | ✅ Yes         | ❌ CLI only          | **✅ Beautiful React UI**           |
| **Live Terminal**      | ❌ No          | ❌ Spawn (async)     | **✅ Go Worker Streaming**          |
| **Indian Workflows**   | ❌ No          | ❌ No                | **✅ GST/UPI/IRCTC/Hindi**          |
| **Encrypted Memory**   | ❌ Plain text  | ❌ Markdown files    | **✅ AES-256-CBC + MongoDB**        |
| **Voice Transcription**| ❌ No          | ✅ Groq Whisper      | **✅ Groq Whisper**                 |
| **Chat Channels**      | 2              | 7                    | **Telegram + Discord + Web**        |
| **SSH Deploy**         | ❌ No          | ❌ No                | **✅ Password + PEM Key**           |
| **Plugin System**      | ❌ No          | Skills folder        | **✅ Drop-in JS plugins**           |
| **Startup RAM**        | >1GB           | <10MB                | ~100MB (Full-stack + DB)            |
| **Install Complexity** | High           | Single binary        | `npm i -g samarthya-bot` ✨         |

---

## 🚀 Quick Start

> [!TIP]
> **Prerequisites:** [Node.js 20 LTS](https://nodejs.org/) · [MongoDB](https://www.mongodb.com/try/download/community) (local)
> Get API keys: [Gemini](https://aistudio.google.com/api-keys) (Free) · [Ollama](https://ollama.com) (Free, Local)
> Optional: [Telegram Bot Token](https://t.me/BotFather) · [Groq](https://console.groq.com) (Voice) · [OpenRouter](https://openrouter.ai/keys) (100+ models)

### 📦 Install (One Command)

```bash
npm install -g samarthya-bot

# Interactive setup wizard
samarthya onboard

# Launch the engine + dashboard (Terminal 1)
samarthya gateway

# Expose to internet & link Telegram (Terminal 2)
samarthya tunnel
```

That's it! 🎉 Open **http://localhost:5000** for the Dashboard.

### 🛠️ From Source (Development)

```bash
git clone https://github.com/mebishnusahu0595/SamarthyaBot.git
cd SamarthyaBot

# Install all dependencies
npm install

# Setup API keys interactively
samarthya onboard

# Start development server
npm run dev
```

---

## 💬 Chat Channels

Talk to SamarthyaBot on your favorite platform:

| Channel | Setup | Status |
| :--- | :--- | :---: |
| **Telegram** | Easy — just a bot token + `samarthya tunnel` | ✅ Live |
| **Discord** | Bot token + intents + invite URL | ✅ Live |
| **Web Dashboard** | Built-in at `http://localhost:5000` | ✅ Live |
| **WhatsApp** | Business API integration | 🔜 Coming |
| **Slack** | Webhook + App | 📋 Planned |

<details>
<summary><b>📱 Telegram Setup</b> (Recommended)</summary>

**1. Create a bot**
* Open Telegram → search `@BotFather`
* Send `/newbot`, follow prompts
* Copy the token

**2. Configure** — Add to your `.env`:
```bash
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
```

**3. Run**
```bash
# Terminal 1
samarthya gateway

# Terminal 2 (new terminal!)
samarthya tunnel
```

The tunnel automatically sets the webhook URL. You're live! 🚀

</details>

<details>
<summary><b>💬 Discord Setup</b></summary>

**1. Create a bot**
* Go to https://discord.com/developers/applications
* Create Application → Bot → Copy Token

**2. Enable Intents** — In Bot settings:
* ✅ MESSAGE CONTENT INTENT
* ✅ SERVER MEMBERS INTENT (optional)

**3. Configure** — Add to your `.env`:
```bash
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
DISCORD_ALLOW_FROM=YOUR_USER_ID
```

**4. Invite the bot**
* OAuth2 → URL Generator → Scope: `bot`
* Permissions: `Send Messages`, `Read Message History`
* Open the generated URL → add to your server

**5. Run**
```bash
samarthya gateway
```

</details>

---

## ⚙️ Configuration

All configuration is in `backend/.env`:

```bash
# ═══════════════ REQUIRED ═══════════════
GEMINI_API_KEY=your_gemini_api_key
MEMORY_ENCRYPTION_KEY=your_32_char_secret_key

# ═══════════════ AI PROVIDERS ═══════════════
ACTIVE_PROVIDER=gemini          # gemini | ollama | anthropic | deepseek | openrouter | qwen
ACTIVE_MODEL=gemini-2.5-flash

# Provider API Keys (set the one you use)
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=
QWEN_API_KEY=

# Ollama (local, free, offline)
USE_OLLAMA=false

# ═══════════════ CHANNELS ═══════════════
TELEGRAM_BOT_TOKEN=your_telegram_token
DISCORD_BOT_TOKEN=your_discord_token

# ═══════════════ VOICE ═══════════════
GROQ_API_KEY=your_groq_key      # For Whisper voice transcription

# ═══════════════ SECURITY ═══════════════
RESTRICT_TO_WORKSPACE=true       # Sandbox all file/exec operations
HEARTBEAT_INTERVAL=30            # Minutes between periodic tasks

# ═══════════════ DATABASE ═══════════════
MONGO_URI=mongodb://localhost:27017/samarthya
PORT=5000
```

---

## 🛠️ CLI Commands

| Command | Action |
| :--- | :--- |
| `samarthya onboard` | Interactive setup wizard — API keys, permissions, everything |
| `samarthya gateway` | Start the backend engine + serve the Dashboard |
| `samarthya tunnel` | Expose to internet & auto-link Telegram webhook |
| `samarthya status` | Show status of background jobs and the engine |
| `samarthya stop` | Gracefully kill all autonomous background agents |
| `samarthya model` | Swap LLM provider (gemini, ollama, claude, deepseek...) |

---

## 🔌 Developing Plugins

Give your AI new superpowers — just drop a `.js` file:

```javascript
// ~/SamarthyaBot_Files/plugins/weather.js
module.exports = {
    name: 'get_weather',
    description: 'Gets current weather for a city',
    parameters: {
        city: { type: 'string', required: true }
    },
    execute: async (args) => {
        const res = await fetch(`https://wttr.in/${args.city}?format=j1`);
        const data = await res.json();
        return {
            success: true,
            result: `${args.city}: ${data.current_condition[0].temp_C}°C, ${data.current_condition[0].weatherDesc[0].value}`
        };
    }
};
```

Restart the gateway — the agent can now check weather autonomously! 🌦️

---

## 💓 Heartbeat (Periodic Tasks)

Create `~/SamarthyaBot_Files/HEARTBEAT.md` to schedule autonomous tasks:

```markdown
# Periodic Tasks

- Check my email for important messages
- Search web for latest AI news and summarize
- Remind me about today's calendar events
```

SamarthyaBot reads this file every 30 minutes (configurable) and executes each task using available tools. Results are sent via your active channel (Telegram/Discord/Dashboard).

---

## 🔒 Security & Privacy

| Feature | Description |
| :--- | :--- |
| **🏠 Local Control Plane** | Gateway runs on YOUR machine — zero cloud dependency |
| **🔐 AES-256-CBC Encryption** | All memories and API keys encrypted at rest |
| **🛡️ Command Blacklists** | `rm -rf`, `mkfs`, `format`, `dd if=` — all blocked |
| **📁 Workspace Sandbox** | File/exec operations restricted to workspace folder |
| **🔌 Ollama Offline Mode** | 100% offline AI — zero data leakage |
| **🚨 Emergency Kill Switch** | `samarthya stop` — instant shutdown from CLI or Dashboard |

---

## 🏗️ Architecture

```
  Telegram / Discord / WebUI / CLI
                │
                ▼
  ┌──────────────────────────────────────────┐
  │         SamarthyaBot Gateway             │
  │        (The Control Plane)               │
  │        http://localhost:5000             │
  ├──────────────────────────────────────────┤
  │                                          │
  │  ┌─────────┐  ┌──────────┐  ┌────────┐  │
  │  │ Planner │  │ LLM Hub  │  │ Tools  │  │
  │  │ (ReAct) │  │ (Multi)  │  │ Engine │  │
  │  └────┬────┘  └────┬─────┘  └───┬────┘  │
  │       │            │             │       │
  │  ┌────┴────────────┴─────────────┴────┐  │
  │  │        Go Micro-Worker             │  │
  │  │   (Live Terminal Streaming)        │  │
  │  └───────────────────────────────────┘  │
  │                                          │
  │  ┌─────────┐  ┌──────────┐  ┌────────┐  │
  │  │ Memory  │  │ Browser  │  │ Cron / │  │
  │  │ (AES)   │  │(Puppeteer│  │Hearbeat│  │
  │  └─────────┘  └──────────┘  └────────┘  │
  │                                          │
  └──────────────────────────────────────────┘
                │
                ▼
        MongoDB (Local, Encrypted)
```

---

## 🗺️ My checklist -- >> 

- [x] Full RPA Engine (Code → Commit → Deploy)
- [x] Go Micro-Worker (Live Terminal Streaming)
- [x] Puppeteer Browser DOM Controller
- [x] Telegram Integration + Auto Tunnel
- [x] Multi-Provider LLM (Gemini, Claude, DeepSeek, Qwen, OpenRouter, Ollama)
- [x] Discord Bot Integration
- [x] Groq/Whisper Voice Transcription
- [x] Workspace Security Sandbox
- [x] Heartbeat Periodic Tasks
- [x] Sub-Agent Spawn (Background Workers)
- [ ] WhatsApp Business API
- [ ] Slack Integration
- [ ] Docker Compose deployment
- [ ] Mobile companion app

---

## 📄 License

**MIT License** — Built with ❤️ in India 🇮🇳 by **Bishnu Sahu**

[GitHub](https://github.com/mebishnusahu0595) · [NPM](https://www.npmjs.com/package/samarthya-bot)
