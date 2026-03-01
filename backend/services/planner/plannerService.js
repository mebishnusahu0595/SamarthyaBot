const llmService = require('../llm/llmService');
const toolRegistry = require('../tools/toolRegistry');
const securityService = require('../security/securityService');
const memoryService = require('../memory/memoryService');
const AuditLog = require('../../models/AuditLog');

class PlannerService {
    /**
     * Process a user message through the full pipeline:
     * 1. Security scan input
     * 2. Load user context & memories
     * 3. Build system prompt with available tools
     * 4. Send to LLM
     * 5. Parse tool calls if any
     * 6. Execute tools (with permission checks)
     * 7. Log audit trail
     * 8. Extract & store new memories
     * 9. Return final response
     */
    async processMessage(user, conversationHistory, userMessage, onProgress = null) {
        const result = {
            response: '',
            toolCalls: [],
            sensitiveDataWarnings: [],
            tokensUsed: 0,
            model: '',
            language: llmService.detectLanguage(userMessage)
        };

        // Step 1: Security scan on user input
        const inputScan = securityService.scanForSensitiveData(userMessage);
        if (inputScan.length > 0) {
            result.sensitiveDataWarnings = inputScan;
        }

        // Step 2: Load memories
        const memories = await memoryService.getUserContext(user._id || user.id);

        // Step 3: Get tools for user's active pack
        const tools = toolRegistry.getToolsForPack(user.activePack || 'personal');

        // Step 4: Build system prompt and call LLM
        const systemPrompt = llmService.buildSystemPrompt(user, tools, memories);

        const messages = [
            ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
        ];

        const llmResponse = await llmService.chat(messages, systemPrompt, user);
        result.response = llmResponse.content;
        result.tokensUsed = llmResponse.tokensUsed;
        result.model = llmResponse.model;

        // Step 5: Execute Agentic Loop (up to 20 steps for massive multi-tasking)
        let loopCount = 0;
        const maxLoops = 20;
        let currentMessages = [...messages, { role: 'assistant', content: llmResponse.content }];
        let currentResponse = llmResponse.content;

        while (loopCount < maxLoops) {
            loopCount++;

            // Extract planning / thought process and stream it to the user
            const thoughtProcess = currentResponse.replace(/```(?:tool_call|json)?\s*[\s\S]*?```/g, '').trim();
            if (thoughtProcess && onProgress) {
                // Send only if there's substantial text, maybe filtering short OKs
                if (thoughtProcess.length > 10) {
                    await onProgress(`\n${thoughtProcess}\n`);
                }
            }

            const toolCalls = llmService.parseToolCalls(currentResponse);
            if (toolCalls.length === 0) {
                // Done! No more tools to call
                result.response = currentResponse;
                break;
            }

            const stepToolResults = [];
            for (const tc of toolCalls) {
                const toolResult = {
                    toolName: tc.tool,
                    arguments: tc.args,
                    status: 'pending',
                    riskLevel: securityService.assessRisk(tc.tool),
                    result: null
                };

                const permCheck = securityService.requiresPermission(tc.tool, user.permissions);
                if (permCheck === 'blocked') {
                    toolResult.status = 'blocked';
                    toolResult.result = `🚫 Tool "${tc.tool}" blocked by your permission settings.`;
                } else {
                    try {
                        toolResult.status = 'running';
                        console.log(`🔧 Executing tool: ${tc.tool}`, JSON.stringify(tc.args));
                        const execResult = await toolRegistry.executeTool(tc.tool, tc.args, user);
                        toolResult.result = execResult.result;
                        if (execResult.notificationParams) toolResult.notificationParams = execResult.notificationParams;
                        toolResult.status = execResult.success ? 'completed' : 'failed';
                        console.log(`✅ Tool ${tc.tool}: ${toolResult.status}`);
                    } catch (error) {
                        toolResult.status = 'failed';
                        toolResult.result = `Error: ${error.message}`;
                        console.error(`❌ Tool ${tc.tool} error:`, error.message);
                    }
                }

                stepToolResults.push(toolResult);

                // Audit log
                try {
                    await AuditLog.create({
                        userId: user._id || user.id,
                        action: `Tool: ${tc.tool}`,
                        category: toolRegistry.getTool(tc.tool)?.category || 'tool',
                        details: {
                            toolName: tc.tool,
                            input: tc.args,
                            output: toolResult.result,
                            riskLevel: toolResult.riskLevel,
                            permissionGranted: toolResult.status !== 'blocked'
                        },
                        status: toolResult.status === 'completed' ? 'success' :
                            toolResult.status === 'blocked' ? 'blocked' : 'failed'
                    });
                } catch (e) { console.error('Audit log error:', e); }
            }

            result.toolCalls.push(...stepToolResults);

            if (stepToolResults.some(tc => tc.status === 'completed' || tc.status === 'failed')) {
                const toolResultsText = stepToolResults
                    .map(tc => {
                        let text = `Tool "${tc.toolName}" result:\n${tc.result}`;
                        if (tc.status === 'failed') {
                            text += `\n\nFAILURE DETECTED. Please analyze the error, auto-correct your parameters, and retry.`;
                        }
                        return text;
                    })
                    .join('\n\n');

                currentMessages.push({
                    role: 'user',
                    content: `[System Temporary Memory] Tool Execution Results:\n${toolResultsText}\n\nReview the results. If failed, apply FAILURE RECOVERY by retrying with different parameters. If all tasks are completed, output the final completion message.`
                });

                const followUp = await llmService.chat(currentMessages, systemPrompt, user);
                currentResponse = followUp.content;
                currentMessages.push({ role: 'assistant', content: currentResponse });
                if (followUp.tokensUsed) result.tokensUsed += followUp.tokensUsed;
            } else {
                // Tools were blocked or something weird happened - exit loop early
                result.response = currentResponse;
                break;
            }
        }

        if (loopCount >= maxLoops) {
            result.response = currentResponse + '\n\n*(Note: Task reached maximum automated steps limit and was paused for your review.)*';
        }

        // Step 8: Scan output for sensitive data
        const outputScan = securityService.scanForSensitiveData(result.response);
        if (outputScan.length > 0) {
            result.sensitiveDataWarnings = [...result.sensitiveDataWarnings, ...outputScan];
            result.response = securityService.maskSensitiveData(result.response);
        }

        // Step 9: Extract memories from conversation
        try {
            await memoryService.extractFromMessage(user._id || user.id, userMessage);
        } catch (e) {
            // Non-critical
        }

        return result;
    }
}

module.exports = new PlannerService();
