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

Runtime: **Node JS ≥ 20** and **MongoDB** (Local).

```bash
npm install -g samarthya-bot

# Start the interactive setup
samarthya onboard

# Launch the engine and dashboard
samarthya gateway
```
*The wizard guides you through API keys (Gemini/Ollama) and system permissions.*

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

- 🧠 **Autonomous Planning**: Native ReAct engine (`Reason` -> `Act` -> `Observe`) that breaks complex requests like *"Find the latest tech news and summarize the top 3 into a PDF"* into discrete steps.
- � **Control Center UI**: A futuristic dashboard served locally from the gateway. Monitor system vitals, RAM usage, and active agent threads.
- 🔐 **Encrypted Memory**: Every interaction is stored locally. Sensitive data like API keys are encrypted via **AES-256-CBC** with your custom vault key.
- 🔌 **Extensible Modules**: Drop any JavaScript plugin into `~/SamarthyaBot_Files/plugins/` and the assistant learns it instantly.
- 📸 **Visual Intelligence**: Built-in screen understanding for contextual automation.
- 🇮🇳 **Indian Localization**: Specialized tools for **GST**, **IRCTC**, **UPI** links, and native **Hinglish/Hindi** fluency.

---

## 🛠️ CLI Commands

| Command | Action |
| :--- | :--- |
| `samarthya onboard` | Start the installation & configuration wizard. |
| `samarthya gateway` | Run the backend control plane and serve the Dashboard. |
| `samarthya status` | Display the status of background jobs and the engine. |
| `samarthya stop` | Gracefully shut down all background autonomous agents. |
| `samarthya model [name]` | Swap between LLM providers (e.g. `ollama`, `gemini`). |

---

## ⚙️ Environment Variables

If you are running from source or manual setup, create a `.env` file in the `backend/` directory.

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
MEMORY_ENCRYPTION_KEY=your_32_char_secret_key

# Optional
MONGO_URI=mongodb://localhost:27017/samarthya
PORT=5000
USE_OLLAMA=false
ACTIVE_PROVIDER=gemini # or ollama
```

*Note: The `samarthya onboard` command handles these for you automatically!*

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
