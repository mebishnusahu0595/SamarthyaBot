const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

class WorkerClient {
    constructor() {
        this.workerProcess = null;
        this.pendingRequests = new Map();

        // Find the worker binary.
        // In dev, it's inside `worker/samarthya-worker`
        // In prod (npm module), it might be inside the module root.

        // Let's resolve it more robustly:
        const projectRoot = path.resolve(__dirname, '../../../'); // Gives /home/bishnups/Documents/PROJECT_DEB
        this.workerPath = path.join(projectRoot, 'worker', 'samarthya-worker' + (os.platform() === 'win32' ? '.exe' : ''));
    }

    start() {
        if (this.workerProcess) return;

        console.log(`[Worker] Starting Go Micro-Worker from: ${this.workerPath}`);

        this.workerProcess = spawn(this.workerPath, [], {
            stdio: ['pipe', 'pipe', 'inherit'] // We write to stdin, read from stdout
        });

        this.workerProcess.on('error', (err) => {
            console.error('[Worker] Failed to start Go worker:', err.message);
            console.error('[Worker] Make sure you have run `cd worker && go build -o samarthya-worker`');
        });

        this.workerProcess.on('exit', (code) => {
            console.log(`[Worker] Go worker exited with code ${code}. Restarting in 5s...`);
            this.workerProcess = null;
            setTimeout(() => this.start(), 5000);
        });

        // Listen to JSON stream line by line
        let buffer = '';
        this.workerProcess.stdout.on('data', (chunk) => {
            buffer += chunk.toString();
            let newlineIdx;
            while ((newlineIdx = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, newlineIdx).trim();
                buffer = buffer.slice(newlineIdx + 1);

                if (line) {
                    try {
                        const parsed = JSON.parse(line);
                        this._handleResponse(parsed);
                    } catch (e) {
                        console.error('[Worker] JSON Parse Error from Go line:', line);
                    }
                }
            }
        });
    }

    _handleResponse(res) {
        if (!res.id || !this.pendingRequests.has(res.id)) {
            // Unbound message or logging
            if (res.type === 'error') {
                console.error(`[Worker Msg] ${res.data}`);
            }
            return;
        }

        const handlers = this.pendingRequests.get(res.id);

        if (res.type === 'stdout' || res.type === 'stderr') {
            if (handlers.onStream) {
                handlers.onStream(res.data, res.type);
            } else {
                // If the user didn't provide a stream handler, buffer it internally
                if (!handlers.buffer) handlers.buffer = '';
                handlers.buffer += res.data + '\n';
            }
        }
        else if (res.type === 'end') {
            const finalData = handlers.buffer || res.data;
            handlers.resolve({
                success: res.exitCode === 0,
                exitCode: res.exitCode,
                output: finalData,
                elapsed: res.elapsedTimeMs
            });
            this.pendingRequests.delete(res.id);
        }
        else if (res.type === 'error') {
            handlers.resolve({
                success: false,
                exitCode: -1,
                output: res.data,
                elapsed: 0
            });
            this.pendingRequests.delete(res.id);
        }
    }

    executeCommand(command, dir = '', streamCallback = null) {
        if (!this.workerProcess) {
            this.start();
            if (!this.workerProcess) {
                return Promise.resolve({ success: false, output: 'Worker process unavailable. Is the Go binary built?' });
            }
        }

        return new Promise((resolve) => {
            const reqId = uuidv4();

            // Register handlers
            this.pendingRequests.set(reqId, {
                resolve,
                onStream: streamCallback,
                buffer: ''
            });

            const req = {
                id: reqId,
                command: command,
                dir: dir,
                stream: true,
                timeoutMs: 0
            };

            // Send to Go via stdin
            this.workerProcess.stdin.write(JSON.stringify(req) + '\n');
        });
    }

    stop() {
        if (this.workerProcess) {
            this.workerProcess.kill();
            this.workerProcess = null;
        }
    }
}

// Export singleton instance
const workerClient = new WorkerClient();
module.exports = workerClient;
