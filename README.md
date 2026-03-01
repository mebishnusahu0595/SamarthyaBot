<div align="center">
  <h1>🧠 SamarthyaBot</h1>
  <p><strong>Privacy-First Local Agentic OS & Command Center</strong></p>
  
  <p>
    An intelligent, extensible, and localized AI operator built for local-first execution. Out-of-the-box support for API usage (Gemini) or completely offline execution via Ollama. It runs commands, handles background jobs, remembers you securely, and performs multi-step autonomous planning.
  </p>
</div>

<hr/>

## 🚀 The Vision: A Developer's Platform, Not Just a Chatbot

Most AI tools are single-turn chat interfaces. SamarthyaBot is built as a **Platform OS**. It features a modular Plugin Engine, a Background CRON executor, and a dedicated UI Control Center. 

You don't just ask SamarthyaBot questions; you *delegate tasks* to it.

## 🌟 Key "Level 2" Features

- 🛑 **Control Center UI**: A full dashboard monitoring the health of the agent, loaded plugins, RAM usage, and autonomous loops.
- 🔁 **Autonomous Background Engine**: Schedule tasks (e.g. "Monitor this folder every 10 mins") and let the agent work silently in the background. Features a **Big Red Kill Switch** for emergency halts.
- 🔌 **Dynamic Plugin Marketplace**: Drop a `.js` file into `~/SamarthyaBot_Files/plugins/`, and the agent automatically learns the new tool on start.
- 📸 **Screen Understanding**: Native capability to capture desktop screenshots and pipe them into Vision models.
- 🔐 **Encrypted Memory Vault**: AES-256-CBC local encryption for any API keys, tokens, or PII the agent decides it needs to remember.
- 🇮🇳 **Indian Context**: Native prompt handling for GST due dates, UPI link generation, and Hinglish/Hindi fluency.

## 🛠️ Architecture

It uses a monolithic structure right now, preparing for a modular NPM package evolution:
- **Backend**: Node.js, Express, MongoDB (Local), PM2 for Daemonizing.
- **Frontend**: React, Vite, Lucide-Icons.
- **Agent Loop**: A custom ReAct-inspired (`Reason`, `Act`, `Observe`) multi-step autonomous planner.

## 📦 Quick Start Guide

**Prerequisites:** Node.js (v20+), MongoDB running locally, Git.

1. **Clone & Install:**
```bash
git clone https://github.com/mebishnusahu0595/SamarthyaBot.git
cd SamarthyaBot/backend
npm install
cd ../frontend
npm install
```

2. **Environment Variables:**
Duplicate the config file in the backend.
```bash
cd ../backend
cp .env.example .env
```
Edit `.env` and fill in your `GEMINI_API_KEY` and a random string for `MEMORY_ENCRYPTION_KEY`.

3. **Build Frontend & Start:**
```bash
cd ../frontend
npm run build
cp -r dist/* ../backend/public/
cd ../backend
npm start   # Or use `node bin/samarthya.js start` if you have it linked globally
```

4. **Access the Control Center:**
Open `http://localhost:5000` in your browser.

## 🔌 Developing Plugins

Want to give your AI a new Superpower? Just make a simple JS file in `~/SamarthyaBot_Files/plugins/my_tool.js`:

```javascript
module.exports = {
    name: 'greet_user',
    description: 'Greets the user nicely',
    riskLevel: 'low',
    category: 'tool',
    parameters: {
        name: { type: 'string', required: true, description: 'User name' }
    },
    execute: async (args, userContext) => {
        return { success: true, result: `Hello ${args.name}!` };
    }
};
```
Restart the server, and the agent will instantly know how to greet users using your custom logic!

## 🔐 Privacy Guarantee

All your conversations, file reads, and parsed memories remain completely local in your MongoDB database and `~/SamarthyaBot_Files/` directory. API data is only sent to the LLM Provider you specific (Gemini or Local Ollama).

## 📄 License
MIT License
