# 📋 Changelog

All notable changes to SamarthyaBot are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [2.2.0] - 2026-03-05

### Added
- **Extreme SEO & GEO Optimization** — 85+ NPM keywords, structured data, Open Graph tags
- **GitHub Community Files** — CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- **Issue & PR Templates** — Structured bug reports, feature requests
- **Frontend SEO** — JSON-LD structured data, Open Graph meta, robots.txt, sitemap.xml
- **GEO-Optimized README** — FAQ section, authority statements, use-case examples
- `samarthyabot` CLI alias — both `samarthya` and `samarthyabot` now work

### Changed
- Expanded package description for NPM search discoverability
- Updated `package.json` with homepage, bugs, funding URLs

---

## [2.1.0] - 2026-03-04

### Added
- **Premium CLI Experience** — Large ASCII banner with Indian flag colors (saffron, white, green)
- **Interactive Setup Wizard** (`samarthya onboard`) — Step-by-step guided API key and channel configuration
- **Loading Spinners & Progress Bars** — Animated terminal output during setup and boot
- **New CLI Commands** — `samarthya telegram`, `samarthya discord`, `samarthya config`, `samarthya model`
- **Auto-Tunnel** — Automatic LocalTunnel + Telegram webhook setup from `samarthya onboard`
- **Model Selector** — Interactive multi-provider model switching with 9 providers and 20+ models
- **Boot Sequence Animation** — Professional startup with step-by-step status indicators

---

## [2.0.0] - 2026-03-03

### Added
- **Multi-Provider LLM Hub** — Gemini, Claude, DeepSeek, Qwen, OpenRouter, Ollama support
- **Discord Bot Integration** — Full two-way Discord chat with mention-only mode
- **Workspace Security Sandbox** — File/exec restricted to configurable workspace folder
- **Heartbeat Periodic Tasks** — Autonomous task execution from `HEARTBEAT.md` every N minutes
- **Groq/Whisper Voice Transcription** — Voice notes → text in Telegram
- **Sub-Agent Spawn Service** — Non-blocking background agents for long-running tasks
- **Go Micro-Worker** — Live terminal streaming via WebSocket for `npm build`, `git push`, etc.
- **Plugin System** — Drop a `.js` file, get a new AI tool — zero restart
- **Puppeteer Browser Controller** — Real DOM interaction, scraping, clicking, navigating
- **SSH Deployment** — Deploy to remote VPS via password or PEM key from chat
- **Screen Vision** — Gemini Vision analyzes screenshots for UI understanding

### Changed
- Complete React dashboard redesign with dark theme and glassmorphism
- ReAct autonomous planner with multi-step reasoning

---

## [1.1.4] - 2026-02-28

### Added
- God-Mode features on landing page (Browser DOM, Go Worker, SSH previews)

### Changed
- Moved God Mode UI into frontend Capabilities module

---

## [1.0.0] - 2026-02-25

### Added
- Initial release
- Gemini AI integration
- Telegram bot with webhook
- Basic file management
- Email sending via Nodemailer
- MongoDB encrypted memory
- AES-256-CBC encryption for memories
- Express REST API + Socket.IO realtime
- React web dashboard

---

[2.2.0]: https://github.com/mebishnusahu0595/SamarthyaBot/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/mebishnusahu0595/SamarthyaBot/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/mebishnusahu0595/SamarthyaBot/compare/v1.1.4...v2.0.0
[1.1.4]: https://github.com/mebishnusahu0595/SamarthyaBot/compare/v1.0.0...v1.1.4
[1.0.0]: https://github.com/mebishnusahu0595/SamarthyaBot/releases/tag/v1.0.0
