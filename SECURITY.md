# 🔒 Security Policy

## Supported Versions

| Version | Supported |
| :--- | :---: |
| 2.x.x | ✅ Active |
| 1.x.x | ⚠️ Critical fixes only |
| < 1.0 | ❌ End of life |

## Reporting a Vulnerability

If you discover a security vulnerability in SamarthyaBot, **please do NOT open a public issue**.

### How to Report

1. **Email**: Send details to the maintainer via [GitHub profile](https://github.com/mebishnusahu0595)
2. **Private Issue**: Use GitHub's private vulnerability reporting feature on the repository

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Investigation**: Within 7 days
- **Fix Release**: Within 30 days for critical issues

## Security Features

SamarthyaBot is built with security as a core design principle:

| Feature | Description |
| :--- | :--- |
| 🏠 **Local-First** | All data stays on YOUR machine — zero cloud dependency |
| 🔐 **AES-256-CBC** | All memories and API keys encrypted at rest |
| 🛡️ **Command Blacklists** | Dangerous commands (`rm -rf`, `mkfs`, `format`, `dd if=`) blocked |
| 📁 **Workspace Sandbox** | File and execution operations restricted to workspace directory |
| 🔌 **Offline Mode** | Via Ollama — 100% offline AI, zero data leakage |
| 🚨 **Kill Switch** | `samarthya stop` — instant Emergency shutdown |

## Best Practices for Users

1. **Never share your `.env` file** — it contains API keys
2. **Use a strong `MEMORY_ENCRYPTION_KEY`** — at least 32 characters
3. **Keep `RESTRICT_TO_WORKSPACE=true`** — prevents file access outside workspace
4. **Update regularly** — `npm update -g samarthya-bot`
5. **Use Ollama for sensitive work** — fully offline, no data leaves your machine

Thank you for helping keep SamarthyaBot secure! 🙏
