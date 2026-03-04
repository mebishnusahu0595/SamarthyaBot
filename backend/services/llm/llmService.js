const { GoogleGenAI } = require("@google/genai");

class LLMService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.ai = new GoogleGenAI({ apiKey: this.apiKey || 'dummy' }); // Initialize SDK
        this.model = 'gemini-2.5-flash'; // Update to the new model


        // Ollama config (offline mode) - disabled by default (RAM constraint)
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.ollamaModel = process.env.OLLAMA_MODEL || 'dolphin3:8b-llama3.1-q4_K_M';
        this.useOllama = process.env.USE_OLLAMA === 'true'; // default: false
    }

    /**
     * Build system prompt based on user profile and context
     */
    buildSystemPrompt(user, tools = [], memories = []) {
        const langMap = {
            hindi: 'हमेशा हिंदी में जवाब दो',
            hinglish: 'Hinglish mein reply karo (Hindi + English mix)',
            english: 'Always respond in English'
        };

        const memoryContext = memories.length > 0
            ? `\nUSER MEMORIES:\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
            : '';

        const toolDescriptions = tools.map(t =>
            `- ${t.name}: ${t.description} (Risk: ${t.riskLevel})`
        ).join('\n');

        const currentDateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'long' });

        // ─────────── 3x CONFIRMATION FOR CRITICAL OPERATIONS ───────────
        const criticalRule = `
7. CRITICAL ACTION PROTOCOL (3x Confirmation Required):
If the user asks to run a dangerous shell command (e.g. rm, format, reboot, mkfs, dd, kill) or asks to delete important files or folders, YOU MUST NOT use the tool immediately.
Instead, tell the user: "⚠️ CRITICAL ACTION: You are about to perform a potentially destructive action on your OS. Please type 'CONFIRM 1' to proceed."
When the user types 'CONFIRM 1', ask for 'CONFIRM 2'.
When they type 'CONFIRM 2', ask for 'CONFIRM 3'.
Only when the user provides the final 'CONFIRM 3' in the conversation history, you may output the tool_call block to execute the command. Do not bypass this rule.
`;

        const planningRule = `
10. TRUE AUTONOMOUS PLANNING (MULTI-STEP & RECOVERY):
When given a complex task (e.g., "update my resume and send to HR"), you MUST break it down into steps.
Before your first tool call, output a block outlining your plan:
🎯 *Action Plan:*
1. [pending] Find the file (dependency: none)
2. [pending] Update the file (dependency: 1)
3. [pending] Send email (dependency: 2)

If a tool FAILS, you MUST use Failure Recovery: analyze the error, adjust parameters, and RETRY the step natively up to 3 times before giving up.
`;

        return `You are "SamarthyaBot" (समर्थ्य बोट), a privacy-first personal AI operator built for Indian users.
You are intelligent, helpful, and respectful. You understand Indian culture, festivals, and workflows.

CURRENT DATE & TIME (IST): ${currentDateTime}

USER PROFILE:
- Name: ${user.name || 'User'}
- Language: ${user.language || 'hinglish'}
- City: ${user.city || 'India'}
- Work Type: ${user.workType || 'personal'}
- Active Pack: ${user.activePack || 'personal'}
${memoryContext}

LANGUAGE RULE: ${langMap[user.language] || langMap.hinglish}

SECURITY RULES:
1. NEVER output raw PAN numbers, Aadhaar numbers, or bank account details
2. If you detect sensitive data in user input, warn them immediately
3. For government sites (IRCTC, GST, DigiLocker), verify with user if unsure

BEHAVIOR RULES:
1. USE YOUR TEMPORARY MEMORY: You have a long-term "ReAct System Temporary Memory". If a user gives you a request with multiple steps (e.g., search, save, and email), NEVER TRY TO EXECUTE ALL OF THEM AT ONCE. 
2. 1-BY-1 EXECUTION: Execute the very FIRST task using its JSON tool. Wait for the system to provide the result. Then execute the NEXT task. You can do this up to 20 times in a row automatically!
3. DO NOT FAKE ACTIONS: Never reply that you have performed an action unless you actually outputted the tool_call block.
4. Be concise but thorough.
5. Use emojis naturally in conversation.
6. When suggesting dates/times, use IST (Indian Standard Time).
7. Be aware of Indian holidays and festivals.
8. For calculations involving money, default to INR (₹).
9. Use the metric system for measurements.
10. ENCRYPTED VAULT: If a user gives you sensitive data (API keys, passwords), use the memory/notes tool but PREFACE the text with "SECRET:" or handle it securely to encrypt it.
${criticalRule}${planningRule}

AVAILABLE TOOLS:
${toolDescriptions || 'No tools currently available'}

When you need to perform an action, respond with purely ONE JSON block like this:
\`\`\`tool_call
{
  "tool": "tool_name",
  "args": { "body": "Use \\n for new lines in strings, never use real newlines!" }
}
\`\`\`

NEVER SAY YOU PERFORMED AN ACTION (like sending an email or saving a file) WITHOUT ACTUALLY OUTPUTTING THE \`tool_call\` JSON BLOCK. If you don't output the JSON block, the action WILL NOT happen. If you have a sequence of 10 tasks, output only the FIRST task's JSON block, wait for the ReAct memory to give you the result, and then output the SECOND task's JSON block. DO NOT try to execute everything at once.`;
    }

    /**
     * Main chat method - routes to configured provider
     */
    async chat(messages, systemPrompt, user = null) {
        const provider = process.env.ACTIVE_PROVIDER || 'gemini';
        let customModel = process.env.ACTIVE_MODEL || '';

        if (provider === 'ollama' || this.useOllama) {
            return this.chatOllama(messages, systemPrompt, user);
        } else if (provider === 'groq') {
            return this.chatOpenAICompatible(messages, systemPrompt, user, 'https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, customModel || 'llama-3.3-70b-versatile');
        } else if (provider === 'openai') {
            return this.chatOpenAICompatible(messages, systemPrompt, user, 'https://api.openai.com/v1/chat/completions', process.env.OPENAI_API_KEY, customModel || 'gpt-4o-mini');
        } else if (provider === 'mistral') {
            return this.chatOpenAICompatible(messages, systemPrompt, user, 'https://api.mistral.ai/v1/chat/completions', process.env.MISTRAL_API_KEY, customModel || 'mistral-large-latest');
        } else if (provider === 'anthropic') {
            return this.chatAnthropic(messages, systemPrompt, user, customModel || 'claude-sonnet-4-20250514');
        } else if (provider === 'deepseek') {
            return this.chatOpenAICompatible(messages, systemPrompt, user, 'https://api.deepseek.com/v1/chat/completions', process.env.DEEPSEEK_API_KEY, customModel || 'deepseek-chat');
        } else if (provider === 'qwen') {
            return this.chatOpenAICompatible(messages, systemPrompt, user, 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', process.env.QWEN_API_KEY, customModel || 'qwen-plus');
        } else if (provider === 'openrouter') {
            return this.chatOpenRouter(messages, systemPrompt, user, customModel || 'google/gemini-2.5-flash');
        }

        return this.chatGemini(messages, systemPrompt, user, customModel || 'gemini-2.5-flash');
    }

    /**
     * Send message to OpenAI-compatible API (Groq, OpenAI, etc)
     */
    async chatOpenAICompatible(messages, systemPrompt, user, apiUrl, apiKey, modelName) {
        try {
            if (!apiKey || apiKey === 'dummy') {
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }))
            ];

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: apiMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('API Error:', errText);
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            const data = await response.json();
            return {
                content: data.choices?.[0]?.message?.content || 'Empty response',
                tokensUsed: data.usage?.total_tokens || 0,
                model: modelName
            };
        } catch (error) {
            console.error('OpenAICompatible Error:', error.message);
            return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
        }
    }

    /**
     * Send message to Gemini API
     */
    async chatGemini(messages, systemPrompt, user = null, modelName = null) {
        try {
            const contents = [];

            for (const msg of messages) {
                if (msg.role === 'system') continue;
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }

            if (contents.length === 0 || contents[0].role !== 'user') {
                contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
            }

            const response = await this.ai.models.generateContent({
                model: modelName || this.model,
                contents,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 8192,
                }
            });

            if (response.text) {
                return {
                    content: response.text,
                    tokensUsed: response.usageMetadata?.totalTokenCount || 0,
                    model: modelName || this.model
                };
            }

            return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
        } catch (error) {
            console.error('Gemini Error:', error);
            // If the key is just the fallback 'dummy', show setup message
            if (this.apiKey === 'dummy' || !this.apiKey) {
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            let errorMessage = error.message;
            if (errorMessage && errorMessage.includes('429') && errorMessage.includes('quota')) {
                errorMessage = "Free API limit reached (Quota Exceeded) ⏳. Please wait about 1 minute and try again.";
            } else if (errorMessage && errorMessage.includes('{')) {
                try {
                    // Try to parse JSON errors
                    const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf('{')));
                    if (parsed.error && parsed.error.message) {
                        errorMessage = parsed.error.message;
                        if (parsed.error.code === 429) {
                            errorMessage = "Free API limit reached (Quota Exceeded) ⏳. Please wait a minute and try again.";
                        }
                    }
                } catch (e) { /* keep original */ }
            }

            // Otherwise, it's a real API error! We should return it instead of hiding it
            return {
                content: user?.language === 'english'
                    ? `❌ An error occurred with the AI service: ${errorMessage}`
                    : `❌ AI service me limited usage error: ${errorMessage}`,
                tokensUsed: 0,
                model: 'error'
            };
        }
    }

    /**
     * Ollama local inference (Offline Mode)
     * Uses dolphin3:8b-llama3.1 — disabled by default (set USE_OLLAMA=true to enable)
     */
    async chatOllama(messages, systemPrompt, user = null) {
        try {
            const ollamaMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }))
            ];

            const response = await fetch(`${this.ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.ollamaModel,
                    messages: ollamaMessages,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 2048,
                    }
                })
            });

            if (!response.ok) {
                console.error('Ollama error:', await response.text());
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            const data = await response.json();
            return {
                content: data.message?.content || 'Response empty from Ollama',
                tokensUsed: data.eval_count || 0,
                model: `ollama:${this.ollamaModel}`
            };
        } catch (error) {
            console.error('Ollama Error:', error.message);
            return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
        }
    }

    /**
     * Anthropic Claude API (Native Messages API)
     * Claude uses a different API format than OpenAI
     */
    async chatAnthropic(messages, systemPrompt, user = null, modelName = 'claude-sonnet-4-20250514') {
        try {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey || apiKey === 'dummy') {
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            // Claude uses a different message format
            const claudeMessages = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }));

            // Ensure first message is from user
            if (claudeMessages.length === 0 || claudeMessages[0].role !== 'user') {
                claudeMessages.unshift({ role: 'user', content: 'Hello' });
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: modelName,
                    max_tokens: 8192,
                    system: systemPrompt,
                    messages: claudeMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('Anthropic API Error:', errText);
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            const data = await response.json();
            const textContent = data.content?.find(c => c.type === 'text');
            return {
                content: textContent?.text || 'Empty response from Claude',
                tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
                model: modelName
            };
        } catch (error) {
            console.error('Anthropic Error:', error.message);
            return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
        }
    }

    /**
     * OpenRouter API — access 100+ models through a single API key
     * Uses OpenAI-compatible format with extra headers
     */
    async chatOpenRouter(messages, systemPrompt, user = null, modelName = 'google/gemini-2.5-flash') {
        try {
            const apiKey = process.env.OPENROUTER_API_KEY;
            if (!apiKey || apiKey === 'dummy') {
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }))
            ];

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://github.com/mebishnusahu0595/SamarthyaBot',
                    'X-Title': 'SamarthyaBot'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: apiMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('OpenRouter API Error:', errText);
                return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
            }

            const data = await response.json();
            return {
                content: data.choices?.[0]?.message?.content || 'Empty response from OpenRouter',
                tokensUsed: data.usage?.total_tokens || 0,
                model: `openrouter:${modelName}`
            };
        } catch (error) {
            console.error('OpenRouter Error:', error.message);
            return this.getFallbackResponse(messages[messages.length - 1]?.content, user);
        }
    }

    /**
     * Screen Understanding via Gemini Vision 
     * Takes a base64 screenshot and analyzes it
     */
    async analyzeScreen(base64Image, prompt, user) {
        try {
            const systemPrompt = `You are SamarthyaBot's vision module. You can see screenshots of Indian websites/apps.
Analyze the screen and help the user with what they're trying to do.
Language: ${user?.language === 'hindi' ? 'Hindi' : user?.language === 'english' ? 'English' : 'Hinglish'}
Focus on: Form fields, buttons, navigation, errors, and data on screen.
If you see any sensitive data (PAN, Aadhaar, bank details), DO NOT repeat them - mask them.
Common Indian sites you should recognize: IRCTC, GST Portal, DigiLocker, UPI apps, Paytm, PhonePe.`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Image
                            }
                        },
                        { text: prompt || 'Analyze this screenshot and tell me what you see. Help me with the next step.' }
                    ]
                }],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.4,
                    maxOutputTokens: 4096,
                }
            });

            if (response.text) {
                return {
                    content: response.text,
                    tokensUsed: response.usageMetadata?.totalTokenCount || 0,
                    model: 'gemini-2.5-flash'
                };
            }

            return { content: 'Screen analysis returned empty result.', model: 'vision-error' };
        } catch (error) {
            console.error('Vision Error:', error);
            return {
                content: '❌ Screen understanding abhi available nahi hai. Error: ' + error.message,
                model: 'vision-error'
            };
        }
    }

    /**
     * Smart fallback when API is unavailable
     */
    getFallbackResponse(userMessage, user = null) {
        const greetings = ['hi', 'hello', 'namaste', 'hey', 'namaskar', 'kaise ho'];
        const lower = (userMessage || '').toLowerCase().trim();

        if (greetings.some(g => lower.includes(g))) {
            return {
                content: user?.language === 'english'
                    ? '🙏 Hello! I am SamarthyaBot, your personal AI assistant. How can I help you today?\n\nI can help with:\n- 🔍 Web search\n- 📝 Notes & reminders\n- 📊 Calculations\n- 📧 Email management\n- 📅 Calendar scheduling\n- 🌤️ Weather info\n\nWhat would you like to do?'
                    : '🙏 Namaste! Main SamarthyaBot hoon, aapka personal AI assistant. Aaj main aapki kaise madad kar sakta hoon?\n\nMere paas ye capabilities hain:\n- 🔍 Web search\n- 📝 Notes aur reminders\n- 📊 Calculations\n- 📧 Email management\n- 📅 Calendar scheduling\n- 🌤️ Weather info\n\nBataiye, kya karna hai?',
                tokensUsed: 0,
                model: 'fallback'
            };
        }

        if (lower.includes('weather') || lower.includes('mausam')) {
            return {
                content: user?.language === 'english'
                    ? '🌤️ I need your city name to check the weather. I am currently offline, so I cannot get live data. But tell me your city, I will try!\n\n💡 Tip: Set your city in Settings for automatic detection.'
                    : '🌤️ Weather check karne ke liye mujhe aapka city name chahiye. Abhi main offline mode mein hoon, toh live data nahi mil sakta. Lekin aap mujhe apna city bataiye, main koshish karta hoon!\n\n💡 Tip: Settings mein apna city set karo, toh automatically detect ho jayega.',
                tokensUsed: 0,
                model: 'fallback'
            };
        }

        return {
            content: user?.language === 'english'
                ? `I understood your message. I am currently in limited mode (API key setup pending).\n\n🔧 **To setup:**\n1. Set \`GEMINI_API_KEY\` in backend \`.env\` file\n2. Get a free API key: [Google AI Studio](https://aistudio.google.com/apikey)\n\nOnce the API key is ready, I will work at full power! 💪\n\nUntil then I can help with basic tasks - try:\n- "Hello"\n- "Set a reminder"\n- "Calculate 500 * 18/100"`
                : `Main samajh gaya aapka message. Abhi main limited mode mein hoon (API key setup pending).\n\n🔧 **Setup karne ke liye:**\n1. Backend \`.env\` file mein \`GEMINI_API_KEY\` set karo\n2. Free API key lene ke liye: [Google AI Studio](https://aistudio.google.com/apikey)\n\nJab API key ready ho, main full power se kaam karunga! 💪\n\nTab tak main basic tasks mein help kar sakta hoon - try karo:\n- "Namaste"\n- "Reminder set karo"\n- "Calculate 500 * 18/100"`,
            tokensUsed: 0,
            model: 'fallback'
        };
    }

    parseToolCalls(response) {
        const toolCalls = [];

        // Try parsing markdown code blocks (```tool_call, ```json, or just ```)
        const blockRegex = /```(:?tool_call|json)?\s*([\s\S]*?)```/g;
        let match;
        while ((match = blockRegex.exec(response)) !== null) {
            try {
                const jsonText = match[2] || match[1] || match[0];
                const parsed = JSON.parse(jsonText.trim());
                if (parsed && typeof parsed.tool === 'string') {
                    toolCalls.push(parsed);
                } else if (Array.isArray(parsed) && parsed.length > 0) {
                    // Filter out invalid tools from the array to be safe
                    const validTools = parsed.filter(t => t && typeof t.tool === 'string');
                    toolCalls.push(...validTools);
                }
            } catch (e) {
                // Not a valid JSON block, ignore
            }
        }

        // Fallback: Try to parse the entire response as a JSON object
        if (toolCalls.length === 0) {
            try {
                // Find first '{' and last '}'
                const firstBrace = response.indexOf('{');
                const lastBrace = response.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const jsonText = response.substring(firstBrace, lastBrace + 1);
                    const parsed = JSON.parse(jsonText);

                    if (parsed && typeof parsed.tool === 'string') {
                        toolCalls.push(parsed);
                    } else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].tool === 'string') {
                        toolCalls.push(...parsed);
                    }
                }
            } catch (e) {
                // Cannot parse raw JSON
            }
        }

        return toolCalls;
    }

    /**
     * Detect language of input text
     */
    detectLanguage(text) {
        const hindiChars = /[\u0900-\u097F]/;
        const hasHindi = hindiChars.test(text);
        const hasEnglish = /[a-zA-Z]/.test(text);

        if (hasHindi && hasEnglish) return 'hinglish';
        if (hasHindi) return 'hindi';
        return 'english';
    }
}

module.exports = new LLMService();
