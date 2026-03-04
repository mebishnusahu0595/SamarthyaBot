/**
 * Spawn (Sub-Agent) Service for SamarthyaBot
 * Creates independent background agents for long-running tasks
 * Inspired by PicoClaw's spawn feature
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');

class SpawnService {
    constructor() {
        this.activeAgents = new Map(); // id -> { worker, status, startTime, task }
        this.maxConcurrent = parseInt(process.env.MAX_SPAWN_AGENTS || '5', 10);
        this.idCounter = 0;
    }

    /**
     * Spawn a new sub-agent to handle a long-running task
     * @param {string} task - The task description
     * @param {Function} chatHandler - The chat processing function
     * @param {Function} onComplete - Callback when task completes
     * @returns {{ id: string, status: string }}
     */
    spawn(task, chatHandler, onComplete) {
        if (this.activeAgents.size >= this.maxConcurrent) {
            return {
                id: null,
                status: 'rejected',
                reason: `Maximum concurrent agents reached (${this.maxConcurrent}). Wait for a running agent to finish.`
            };
        }

        const agentId = `spawn-${++this.idCounter}-${Date.now()}`;

        const agentContext = {
            id: agentId,
            task: task,
            status: 'running',
            startTime: Date.now(),
            result: null,
            error: null
        };

        this.activeAgents.set(agentId, agentContext);

        console.log(`🚀 Spawn: Agent ${agentId} started — "${task.substring(0, 60)}..."`);

        // Execute asynchronously without blocking
        (async () => {
            try {
                const result = await chatHandler(
                    `[SPAWNED SUB-AGENT TASK] You are a background sub-agent. Complete this task independently and return only the result: ${task}`,
                    `spawn-${agentId}`,
                    'spawn'
                );

                agentContext.status = 'completed';
                agentContext.result = result;
                console.log(`✅ Spawn: Agent ${agentId} completed`);

                if (onComplete) onComplete(agentId, result);
            } catch (error) {
                agentContext.status = 'failed';
                agentContext.error = error.message;
                console.error(`❌ Spawn: Agent ${agentId} failed:`, error.message);

                if (onComplete) onComplete(agentId, { error: error.message });
            }
        })();

        return {
            id: agentId,
            status: 'spawned',
            message: `🚀 Sub-agent spawned (ID: ${agentId}). It will work in the background and report results when done.`
        };
    }

    /**
     * Get status of a specific agent
     */
    getAgentStatus(agentId) {
        const agent = this.activeAgents.get(agentId);
        if (!agent) return null;

        return {
            id: agent.id,
            task: agent.task,
            status: agent.status,
            elapsed: `${Math.round((Date.now() - agent.startTime) / 1000)}s`,
            result: agent.result,
            error: agent.error
        };
    }

    /**
     * List all active agents
     */
    listAgents() {
        const agents = [];
        for (const [id, agent] of this.activeAgents) {
            agents.push({
                id: agent.id,
                task: agent.task.substring(0, 80),
                status: agent.status,
                elapsed: `${Math.round((Date.now() - agent.startTime) / 1000)}s`
            });
        }
        return agents;
    }

    /**
     * Clean up completed agents (keep last 10)
     */
    cleanup() {
        const completed = [];
        for (const [id, agent] of this.activeAgents) {
            if (agent.status === 'completed' || agent.status === 'failed') {
                completed.push(id);
            }
        }

        // Keep last 10 completed, remove the rest
        if (completed.length > 10) {
            const toRemove = completed.slice(0, completed.length - 10);
            for (const id of toRemove) {
                this.activeAgents.delete(id);
            }
        }
    }

    getStatus() {
        return {
            active: [...this.activeAgents.values()].filter(a => a.status === 'running').length,
            total: this.activeAgents.size,
            maxConcurrent: this.maxConcurrent
        };
    }
}

module.exports = new SpawnService();
