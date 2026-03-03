<div align="center">
  <img src="https://raw.githubusercontent.com/mebishnusahu0595/SamarthyaBot/main/backend/public/logo.png" width="200" height="200" alt="SamarthyaBot Logo" />
  <h1>स SamarthyaBot — Your Local Agentic OS</h1>
  
  <p>
    <strong>Privacy-First • Multi-Agent • Autonomous • Made in India</strong>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/samarthya-bot"><img src="https://img.shields.io/npm/v/samarthya-bot?color=FB8C00&style=for-the-badge" alt="NPM Version" /></a>
    <a href="https://github.com/mebishnusahu0595/SamarthyaBot"><img src="https://img.shields.io/github/stars/mebishnusahu0595/SamarthyaBot?style=for-the-badge&color=FFD600" alt="GitHub Stars" /></a>
    <img src="https://img.shields.io/npm/l/samarthya-bot?style=for-the-badge&color=2196F3" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" />
  </p>

  <p>
    SamarthyaBot is a personal AI assistant you run on your own devices. It answers you on the channels you already use (WhatsApp, Telegram), handles absolute local privacy, and executes multi-step autonomous plans. The Gateway is your control plane — the product is the assistant.
  </p>

  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-key-highlights">Highlights</a> •
    <a href="#-cli-commands">CLI</a> •
    <a href="#-developing-plugins">Plugins</a> •
    <a href="#-security">Security</a>
  </p>
</div>

<hr/>

## 🚀 Quick Start

SamarthyaBot is built for developers. The best way to start is the **CLI Wizard**.

### 📦 Install (Global)

Runtime: **Node 20 LTS** (Officially Supported/Recommended) and **MongoDB** (Local).

```bash
npm install -g samarthya-bot

# Start the interactive setup
samarthya onboard

# Launch the engine and dashboard (Terminal 1)
samarthya gateway

# Expose to internet & setup Telegram Webhook (Terminal 2)
samarthya tunnel
```
*The wizard guides you through API keys (Gemini/Ollama, Telegram Bot Token) and system permissions.*

### 🛠️ From Source (Development)

If you want to contribute or build custom features:

```bash
git clone https://github.com/mebishnusahu0595/SamarthyaBot.git
cd SamarthyaBot

# Install dependencies
npm install

# Run the setup
samarthya onboard

# Start development loop
npm run dev
```

---

## 🌟 Key Highlights

- 🤖 **Full RPA Engine (v1.1.3 God Mode):** Evolved from a chat assistant to a **Robotic Process Automation** agent. Writes code, commits to GitHub, and deploys to remote servers autonomously.
- ⚡ **Go Micro-Worker Streaming:** Heavy CLI tasks (`npm build`, `git push`) are handled by a Golang backend that streams live terminal states back to the AI without freezing Node.js.
- 🌍 **SSH Remote Deployments:** Native support for securely logging into remote VPS architectures (via Password or PEM keys) to deploy your Node/Python apps directly from a prompt.
- 🕸️ **Browser DOM Controller:** Natively integrates `puppeteer-core`. Can connect to your local Chrome to navigate web pages, scrape UI, or create a new GitHub repository by interacting with real DOM selectors.
- 🛡️ **Zero-Harm Blacklists:** Strict OS regex block-layer protects your computer from dangerous commands (`rm -rf`, `mkfs`), keeping autonomous loops perfectly safe.
- 🧠 **Autonomous Planning**: Native ReAct engine breaks complex requests into discrete steps.
- 🔐 **Encrypted Memory**: Every interaction is stored locally. Sensitive data like API keys are encrypted via **AES-256-CBC**.
- 🇮🇳 **Indian Localization**: Specialized tools for **GST**, **IRCTC**, **UPI** links, and native **Hinglish/Hindi** fluency.

---

## 🛠️ CLI Commands

| Command | Action |
| :--- | :--- |
| `samarthya onboard` | Start the installation & configuration wizard. |
| `samarthya gateway` | Run the backend control plane and serve the Dashboard. |
| `samarthya status` | Display the status of background jobs and the engine. |
| `samarthya stop` | Gracefully shut down all background autonomous agents. |
| `samarthya model` | Swap between LLM providers (e.g. `ollama`, `gemini`). |
| `samarthya tunnel` | Expose gateway to internet. **(Must run in a separate terminal)** |

---

## ⚙️ Environment Variables

If you are running from source or manual setup, create a `.env` file in the `backend/` directory.

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
MEMORY_ENCRYPTION_KEY=your_32_char_secret_key

# Optional (For Remote Access)
TELEGRAM_BOT_TOKEN=your_telegram_bot_api_key

# Optional
MONGO_URI=mongodb://localhost:27017/samarthya
PORT=5000
USE_OLLAMA=false
ACTIVE_PROVIDER=gemini # or ollama
```

### 📱 Telegram Integration
To connect SamarthyaBot to Telegram:
1. Get a bot token from [@BotFather](https://t.me/BotFather).
2. The `samarthya onboard` wizard will automatically ask for this token.
3. Run `samarthya gateway` in your **first terminal**.
4. Run `samarthya tunnel` in a **new, separate terminal**.
5. Samarthya will automatically create a secure tunnel and link your bot!

---

## 🔌 Developing Plugins

Giving your AI a new Superpower is simple. Create a `.js` file in your plugins directory:

```javascript
// ~/SamarthyaBot_Files/plugins/hello.js
module.exports = {
    name: 'greet',
    description: 'Greets the user in a friendly way',
    parameters: {
        name: { type: 'string', required: true }
    },
    execute: async (args) => {
        return { success: true, result: `Namaste ${args.name}! Main SamarthyaBot hoon.` };
    }
};
```
Restart the gateway and the agent can now "greet" anyone autonomously.

---

## 🔐 Security & Privacy

OpenClaw connecting to your real-world data requires trust. SamarthyaBot is **Local-First**:

1. **Local Control Plane**: The gateway runs on YOUR machine.
2. **Offline-Ready**: Support for **Ollama** ensures 0% data leakage to the cloud.
3. **Emergency Kill Switch**: Stop all background tasks instantly from the Dashboard.
4. **Sandboxed Tools**: (In Progress) Capability to run tool executions in Docker environments.

---

## 🏗️ Architecture

```text
 WhatsApp / Telegram / WebUI / CLI Surface
               │
               ▼
┌─────────────────────────────────┐
│        Samarthya Gateway        │
│      (The Control Plane)        │
│      http://localhost:5000      │
└──────────────┬──────────────────┘
               │
               ├─ Planner Engine (Multi-Step Logic)
               ├─ Skill Registry (Plugins)
               ├─ Background CRON (Autonomous Loops)
               └─ Encrypted Memory Vault
```

---

## 📄 License
MIT License • Built with ❤️ in India by **Bishnu Sahu**

[Website](https://github.com/mebishnusahu0595) • [Discord Coming Soon] • [NPM](https://www.npmjs.com/package/samarthya-bot)
