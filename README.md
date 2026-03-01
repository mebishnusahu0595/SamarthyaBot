<div align="center">
  <img src="backend/public/favicon.svg" width="80" height="80" alt="SamarthyaBot Logo" />
  <h1>🧠 SamarthyaBot</h1>
  <p><strong>The Open-Source Local Agentic OS & AI Command Center</strong></p>
  
  <p>
    Run multi-step autonomous AI workflows natively on your machine.
    <br/><b>Privacy-First • Completely Local • Highly Extensible</b>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/samarthya-bot"><img src="https://img.shields.io/npm/v/samarthya-bot?color=orange&style=flat-square" alt="NPM Version" /></a>
    <a href="https://github.com/mebishnusahu0595/SamarthyaBot"><img src="https://img.shields.io/github/stars/mebishnusahu0595/SamarthyaBot?style=flat-square&color=yellow" alt="GitHub Stars" /></a>
    <img src="https://img.shields.io/npm/l/samarthya-bot?style=flat-square&color=blue" alt="License" />
  </p>
</div>

<hr/>

## 🚀 Instant Setup

SamarthyaBot is now distributed as a global NPM package. No manual cloning or complex setup required.

```bash
# 1. Install globally
npm install -g samarthya-bot

# 2. Run the onboarding wizard
samarthya onboard

# 3. Start the Agent Engine
samarthya gateway
```
*Access your control center at `http://localhost:5000` after starting the gateway.*

---

## 🌟 Why SamarthyaBot?

Most AI tools are just chat boxes. SamarthyaBot is a **Local Operating System for AI Agents**. It doesn't just talk; it **does things**.

- 🛑 **Control Center UI**: A sleek dashboard to monitor agent health, RAM usage, and active autonomous loops.
- 🔁 **Autonomous Planning**: Native ReAct-inspired (`Reason`, `Act`, `Observe`) engine that breaks complex goals into executable tool-steps.
- 🕒 **Background Jobs**: Schedule tasks like "Monitor my downloads folder" or "Check GST deadlines every 4 hours".
- 🔌 **Plugin Architecture**: Drop any JS tool into your local plugins folder, and the agent learns that skill instantly.
- 📸 **Screen Intelligence**: Capture and analyze your desktop state for visual-contextual automation.
- 🔐 **Encrypted Vault**: AES-256-CBC local encryption for your API keys and sensitive memories.
- 🇮🇳 **Indian Flavour**: Built-in logic for UPI links, IRCTC bookings, GST handling, and Hinglish understanding.

## 🛠️ CLI Commands

| Command | Description |
| :--- | :--- |
| `samarthya onboard` | Interactive setup for API keys (Gemini/Ollama) and database. |
| `samarthya gateway` | Starts the backend server and agent engine. |
| `samarthya status` | Check if the agent and background jobs are running. |
| `samarthya stop` | Gracefully shut down all background agent processes. |
| `samarthya model [name]` | Quickly switch between LLM providers (e.g. `ollama`, `gemini`). |

## 🔌 Developing Plugins

Giving your AI a new "Superpower" is as easy as writing a simple JS file:

```javascript
// ~/SamarthyaBot_Files/plugins/greet.js
module.exports = {
    name: 'greet_user',
    description: 'Greets the user with a custom message',
    parameters: {
        name: { type: 'string', required: true }
    },
    execute: async (args) => {
        return { success: true, result: `Namaste ${args.name}! I am SamarthyaBot.` };
    }
};
```
Drop it in the folder, restart the gateway, and your agent is now a specialized greeter!

## �️ Privacy Guarantee

Your data **never** leaves your hardware.
- **Local DB**: All chats and memories are stored on your local MongoDB.
- **Local Execution**: Use **Ollama** for 100% offline air-gapped intelligence.
- **No Tracking**: We don't collect usage analytics. Your agent is yours.

## 📄 License
MIT License • Built with ❤️ in India by [Bishnu Sahu](https://github.com/mebishnusahu0595)
