/**
 * Workspace Security Sandbox for SamarthyaBot
 * Restricts file and command operations to the configured workspace
 * Inspired by PicoClaw's restrict_to_workspace feature
 */

const path = require('path');
const os = require('os');

class SandboxService {
    constructor() {
        this.enabled = process.env.RESTRICT_TO_WORKSPACE !== 'false'; // default: true
        this.workspace = process.env.WORKSPACE_PATH || path.join(os.homedir(), 'SamarthyaBot_Files');

        // Dangerous command patterns (always blocked, even if sandbox is off)
        this.blockedPatterns = [
            /rm\s+(-rf|-fr|--no-preserve-root)\s/i,
            /del\s+\/f/i,
            /rmdir\s+\/s/i,
            /format\s+/i,
            /mkfs\s/i,
            /diskpart/i,
            /dd\s+if=/i,
            /\/dev\/sd[a-z]/i,
            /shutdown/i,
            /reboot/i,
            /poweroff/i,
            /init\s+[06]/i,
            /:()\{\s*:\|:&\s*\};:/,  // Fork bomb
            />\s*\/dev\/sda/i,
            /mv\s+\/\s/i,           // mv / (moving root)
            /chmod\s+-R\s+777\s+\//i, // chmod 777 on root
        ];
    }

    /**
     * Validate that a file path is within the allowed workspace
     * @param {string} filePath - The file path to validate
     * @returns {{ allowed: boolean, reason: string }}
     */
    validatePath(filePath) {
        if (!this.enabled) return { allowed: true, reason: 'Sandbox disabled' };

        const resolvedPath = path.resolve(filePath);
        const resolvedWorkspace = path.resolve(this.workspace);

        if (resolvedPath.startsWith(resolvedWorkspace)) {
            return { allowed: true, reason: 'Path is within workspace' };
        }

        // Allow /tmp for scratch files
        if (resolvedPath.startsWith('/tmp') || resolvedPath.startsWith(os.tmpdir())) {
            return { allowed: true, reason: 'Path is in temp directory' };
        }

        return {
            allowed: false,
            reason: `🔒 Security: Path "${filePath}" is outside the workspace. Only files within "${this.workspace}" can be accessed. Set RESTRICT_TO_WORKSPACE=false in .env to disable this restriction.`
        };
    }

    /**
     * Validate that a command is safe to execute
     * @param {string} command - The shell command to validate
     * @returns {{ allowed: boolean, reason: string }}
     */
    validateCommand(command) {
        // Always check blocked patterns (even if sandbox is disabled)
        for (const pattern of this.blockedPatterns) {
            if (pattern.test(command)) {
                return {
                    allowed: false,
                    reason: `🛡️ Safety Guard: Command blocked — dangerous pattern detected ("${command.substring(0, 50)}..."). This command could harm your system.`
                };
            }
        }

        // If sandbox is enabled, check that command paths are within workspace
        if (this.enabled) {
            // Extract paths from command (basic heuristic)
            const pathRegex = /(?:^|\s)(\/[^\s;|&]+)/g;
            let match;
            while ((match = pathRegex.exec(command)) !== null) {
                const cmdPath = match[1];
                // Skip common system binaries
                if (cmdPath.startsWith('/usr/') || cmdPath.startsWith('/bin/') ||
                    cmdPath.startsWith('/sbin/') || cmdPath.startsWith('/tmp/')) {
                    continue;
                }
                const validation = this.validatePath(cmdPath);
                if (!validation.allowed) {
                    return {
                        allowed: false,
                        reason: `🔒 Security: Command references path outside workspace — ${validation.reason}`
                    };
                }
            }
        }

        return { allowed: true, reason: 'Command is safe' };
    }

    /**
     * Get workspace info for status display
     */
    getStatus() {
        return {
            enabled: this.enabled,
            workspace: this.workspace,
            blockedPatterns: this.blockedPatterns.length
        };
    }
}

module.exports = new SandboxService();
