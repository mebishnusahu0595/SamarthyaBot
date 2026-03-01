const { TOOL_PACKS } = require('../../config/constants');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

// ────────────────────────────────────────────────────────────
// REAL Tool Definitions — No more simulations!
// ────────────────────────────────────────────────────────────

/**
 * Safe directory — tools can only operate within this sandbox
 * Change this to allow broader access (at your own risk)
 */
const BASE_DIR = path.join(os.homedir(), 'SamarthyaBot_Files');

async function getSafeDir(user) {
    let dir = BASE_DIR;
    if (user && (user._id || user.id)) {
        dir = path.join(BASE_DIR, String(user._id || user.id));
    }
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (e) { }
    return dir;
}

const toolDefinitions = {

    // ─────────── WEB SEARCH (Real via DuckDuckGo) ───────────
    web_search: {
        name: 'web_search',
        description: 'Search the web for information using DuckDuckGo',
        descriptionHi: 'इंटरनेट पर जानकारी खोजें',
        riskLevel: 'low',
        category: 'search',
        parameters: {
            query: { type: 'string', required: true, description: 'Search query' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const query = encodeURIComponent(args.query);

                // Use html.duckduckgo.com for much better real-time snippets than their JSON API
                const response = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const html = await response.text();

                // Extract snippets using regex
                const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
                let match;
                let snippets = [];

                while ((match = snippetRegex.exec(html)) !== null && snippets.length < 4) {
                    // Strip inner HTML tags (like <b> tags for bolding)
                    const cleanText = match[1].replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
                    if (cleanText) snippets.push(cleanText);
                }

                let results = '';
                if (snippets.length > 0) {
                    results += `🔍 **Top Real-time Results:**\n\n`;
                    snippets.forEach((snippet, i) => {
                        results += `${i + 1}. ${snippet}\n`;
                    });
                } else {
                    results = `🔍 No instant snippets found for "${args.query}". Try Google: https://www.google.com/search?q=${query}`;
                }

                // Try to extract some URLs as well
                const urlRegex = /<a class="result__url" href="([^"]+)">/g;
                const urls = [];
                while ((match = urlRegex.exec(html)) !== null && urls.length < 3) {
                    // Un-escape duckduckgo redirect wrapper if present
                    let extractedUrl = match[1];
                    if (extractedUrl.includes('?q=')) {
                        const qMatch = extractedUrl.match(/\?q=([^&]+)/);
                        if (qMatch) extractedUrl = decodeURIComponent(qMatch[1]);
                    }
                    if (extractedUrl && !urls.includes(extractedUrl) && extractedUrl.startsWith('http')) urls.push(extractedUrl);
                }

                if (urls.length > 0) {
                    results += `\n🔗 **Sources:**\n${urls.map(u => `• ${u}`).join('\n')}`;
                }

                return { success: true, result: results };
            } catch (error) {
                return { success: false, result: `❌ Search failed: ${error.message}` };
            }
        }
    },

    // ─────────── CALCULATOR (Real, safe eval) ───────────
    calculate: {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        descriptionHi: 'गणितीय गणना करें',
        riskLevel: 'low',
        category: 'tool',
        parameters: {
            expression: { type: 'string', required: true, description: 'Math expression to evaluate' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const sanitized = args.expression.replace(/[^0-9+\-*/().%\s]/g, '');
                const result = Function('"use strict"; return (' + sanitized + ')')();
                return {
                    success: true,
                    result: `🧮 **Calculation:**\n${args.expression} = **${result}**\n\n💡 GST tip: For 18% GST on ₹${result}, total = ₹${(result * 1.18).toFixed(2)}`
                };
            } catch (e) {
                return { success: false, result: `❌ Calculation error: ${e.message}` };
            }
        }
    },

    // ─────────── WEATHER (Real via Open-Meteo — Free, No API key!) ───────────
    weather_info: {
        name: 'weather_info',
        description: 'Get real-time weather for any city',
        descriptionHi: 'शहर का रियल-टाइम मौसम जानें',
        riskLevel: 'low',
        category: 'search',
        parameters: {
            city: { type: 'string', required: true, description: 'City name' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                // Step 1: Geocode city name
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.city)}&count=1`);
                const geoData = await geoRes.json();

                if (!geoData.results || geoData.results.length === 0) {
                    return { success: false, result: `❌ City "${args.city}" not found. Try English name.` };
                }

                const { latitude, longitude, name, country } = geoData.results[0];

                // Step 2: Get weather
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Kolkata`
                );
                const weather = await weatherRes.json();
                const c = weather.current;

                const weatherCodes = {
                    0: '☀️ Clear sky', 1: '🌤️ Mainly clear', 2: '⛅ Partly cloudy',
                    3: '☁️ Overcast', 45: '🌫️ Fog', 48: '🌫️ Rime fog',
                    51: '🌦️ Light drizzle', 53: '🌦️ Moderate drizzle', 55: '🌧️ Dense drizzle',
                    61: '🌧️ Slight rain', 63: '🌧️ Moderate rain', 65: '🌧️ Heavy rain',
                    71: '🌨️ Slight snow', 73: '🌨️ Moderate snow', 75: '❄️ Heavy snow',
                    80: '🌦️ Rain showers', 81: '🌧️ Moderate showers', 82: '⛈️ Violent showers',
                    95: '⛈️ Thunderstorm', 96: '⛈️ Thunderstorm with hail'
                };

                const desc = weatherCodes[c.weather_code] || '🌡️ Unknown';

                return {
                    success: true,
                    result: `🌤️ **Weather for ${name}, ${country}**\n\n` +
                        `${desc}\n` +
                        `🌡️ Temperature: **${c.temperature_2m}°C**\n` +
                        `💧 Humidity: **${c.relative_humidity_2m}%**\n` +
                        `💨 Wind: **${c.wind_speed_10m} km/h**\n\n` +
                        `🕐 Updated: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
                };
            } catch (error) {
                return { success: false, result: `❌ Weather fetch failed: ${error.message}` };
            }
        }
    },

    // ─────────── FILE READ (Real — FULL OS ACCESS) ───────────
    file_read: {
        name: 'file_read',
        description: 'Read contents of any file on the system. Provide absolute path or filename (defaults to user home directory).',
        descriptionHi: 'फ़ाइल की सामग्री पढ़ें',
        riskLevel: 'medium',
        category: 'file',
        parameters: {
            path: { type: 'string', required: true, description: 'Absolute path or filename' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                // Normalize: LLM may use file_path, filename, file_name, etc.
                const argPath = args.path || args.file_path || args.filename || args.file_name || args.file;
                if (!argPath) return { success: false, result: '❌ Please provide a file path/name.' };
                // No path restrictions for full OS access!
                let filePath = argPath.startsWith('/') ? argPath : path.resolve(SAFE_DIR, argPath);

                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    const files = await fs.readdir(filePath);
                    return {
                        success: true,
                        result: `📁 **Directory listing: ${argPath}**\n\n${files.map(f => `• ${f}`).join('\n') || '(empty folder)'}`
                    };
                }

                // Don't read files over 1MB
                if (stat.size > 1024 * 1024) {
                    return { success: false, result: `❌ File too large (${(stat.size / 1024).toFixed(1)}KB). Max 1MB.` };
                }

                const content = await fs.readFile(filePath, 'utf-8');
                const ext = path.extname(filePath).slice(1).toLowerCase();

                return {
                    success: true,
                    result: `📄 **File: ${argPath}** (${stat.size} bytes)\n\n\`\`\`\n${content}\n\`\`\``
                };
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // List available files instead
                    try {
                        const files = await fs.readdir(SAFE_DIR);
                        return {
                            success: false,
                            result: `❌ File not found: "${argPath}"\n\n📁 Available files in SamarthyaBot_Files:\n${files.map(f => `• ${f}`).join('\n') || '(empty — write a file first!)'}`
                        };
                    } catch (e) {
                        return { success: false, result: `❌ File not found: "${argPath}"` };
                    }
                }
                return { success: false, result: `❌ File read error: ${error.message}` };
            }
        }
    },

    // ─────────── FILE WRITE (Real — FULL OS ACCESS) ───────────
    file_write: {
        name: 'file_write',
        description: 'Write/create any file on the system. Provide absolute path or filename (defaults to user home directory).',
        descriptionHi: 'फ़ाइल बनाएं या लिखें',
        riskLevel: 'medium',
        category: 'file',
        parameters: {
            path: { type: 'string', required: true, description: 'Absolute path or filename' },
            content: { type: 'string', required: true, description: 'Content to write' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                // Normalize: LLM may use file_path, filename, etc.
                const argPath = args.path || args.file_path || args.filename || args.file_name || args.file;
                if (!argPath) return { success: false, result: '❌ Please provide a file path/name.' };
                // No path restrictions for full OS access!
                let filePath = argPath.startsWith('/') ? argPath : path.resolve(SAFE_DIR, argPath);

                // Create subdirectories if needed
                await fs.mkdir(path.dirname(filePath), { recursive: true });

                await fs.writeFile(filePath, args.content, 'utf-8');
                const stat = await fs.stat(filePath);

                return {
                    success: true,
                    result: `✅ **File written successfully!**\n\n📄 Path: ~/SamarthyaBot_Files/${argPath}\n📏 Size: ${stat.size} bytes\n🕐 Time: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
                };
            } catch (error) {
                return { success: false, result: `❌ File write error: ${error.message}` };
            }
        }
    },

    // ─────────── DIRECTORY LIST (Real — FULL OS ACCESS) ───────────
    file_list: {
        name: 'file_list',
        description: 'List all files in a directory. Provide absolute path (defaults to user home directory).',
        descriptionHi: 'फ़ोल्डर की सभी फाइलें दिखाएं',
        riskLevel: 'low',
        category: 'file',
        parameters: {
            path: { type: 'string', required: false, description: 'Absolute directory path to list' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const targetDir = args.path ? (args.path.startsWith('/') ? args.path : path.resolve(SAFE_DIR, args.path)) : SAFE_DIR;

                const files = await fs.readdir(targetDir, { withFileTypes: true });
                if (files.length === 0) {
                    return { success: true, result: `📁 ${targetDir} is empty.` };
                }

                let listing = `📁 **${targetDir}**\n\n`;
                for (const f of files) {
                    const icon = f.isDirectory() ? '📂' : '📄';
                    try {
                        const stat = await fs.stat(path.join(targetDir, f.name));
                        const size = f.isDirectory() ? 'folder' : `${(stat.size / 1024).toFixed(1)}KB`;
                        listing += `${icon} ${f.name} (${size})\n`;
                    } catch (e) {
                        listing += `${icon} ${f.name}\n`;
                    }
                }
                return { success: true, result: listing };
            } catch (error) {
                return { success: false, result: `❌ List error: ${error.message}` };
            }
        }
    },

    // ─────────── SEND EMAIL (Real via Nodemailer + Gmail) ───────────
    send_email: {
        name: 'send_email',
        description: 'Send a real email via Gmail SMTP',
        descriptionHi: 'ईमेल भेजें (Gmail)',
        riskLevel: 'high',
        category: 'email',
        parameters: {
            to: { type: 'string', required: true, description: 'Recipient email' },
            subject: { type: 'string', required: true, description: 'Email subject' },
            body: { type: 'string', required: true, description: 'Email body. CAUTION: You MUST use \\n for newlines instead of actual linebreaks inside this string.' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const emailUser = process.env.SMTP_EMAIL;
                const emailPass = process.env.SMTP_PASSWORD;

                if (!emailUser || !emailPass) {
                    return {
                        success: false,
                        result: `❌ **Email not configured!**\n\n🔧 Setup steps:\n1. Go to Google Account → Security → App Passwords\n2. Generate an App Password for "Mail"\n3. Add to .env:\n\`\`\`\nSMTP_EMAIL=your_gmail@gmail.com\nSMTP_PASSWORD=your_16_char_app_password\n\`\`\`\n4. Restart server`
                    };
                }

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

                const isHtml = args.body.includes('<') && args.body.includes('>');

                const info = await transporter.sendMail({
                    from: `"SamarthyaBot" <${emailUser}>`,
                    to: args.to,
                    subject: args.subject,
                    [isHtml ? 'html' : 'text']: args.body
                });

                return {
                    success: true,
                    result: `✅ **Email sent successfully!**\n\n📧 To: ${args.to}\n📋 Subject: ${args.subject}\n🆔 Message ID: ${info.messageId}\n🕐 Sent at: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
                };
            } catch (error) {
                return { success: false, result: `❌ Email failed: ${error.message}` };
            }
        }
    },

    // ─────────── NOTE/REMINDER (Real — saves to filesystem) ───────────
    note_take: {
        name: 'note_take',
        description: 'Save a note to ~/SamarthyaBot_Files/notes/',
        descriptionHi: 'नोट सेव करें',
        riskLevel: 'low',
        category: 'tool',
        parameters: {
            title: { type: 'string', required: true, description: 'Note title' },
            content: { type: 'string', required: true, description: 'Note content' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const notesDir = path.join(SAFE_DIR, 'notes');
                await fs.mkdir(notesDir, { recursive: true });

                const filename = `${args.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_')}_${Date.now()}.md`;
                const filePath = path.join(notesDir, filename);

                const noteContent = `# ${args.title}\n\n_Created: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}_\n\n${args.content}`;
                await fs.writeFile(filePath, noteContent, 'utf-8');

                return {
                    success: true,
                    result: `📝 **Note saved!**\n\n📄 File: ~/SamarthyaBot_Files/notes/${filename}\n📋 Title: ${args.title}\n🕐 Time: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
                };
            } catch (error) {
                return { success: false, result: `❌ Note save error: ${error.message}` };
            }
        }
    },

    // ─────────── REMINDER (Real — writes to file + shows time) ───────────
    reminder_set: {
        name: 'reminder_set',
        description: 'Set a reminder (saved to file)',
        descriptionHi: 'रिमाइंडर सेट करें',
        riskLevel: 'low',
        category: 'tool',
        parameters: {
            message: { type: 'string', required: true, description: 'Reminder message' },
            time: { type: 'string', required: false, description: 'When to remind (IST)' },
            isoDate: { type: 'string', required: false, description: 'When to remind exactly, specified as ISO-8601 UTC date string (e.g. 2026-03-02T10:00:00Z)' },
            delayInSeconds: { type: 'number', required: false, description: 'If the requested time is relative (like "in 20 seconds" or "after 5 minutes"), specify total seconds here (e.g. 20, 300) for high precision.' }
        },
        execute: async (args, userContext) => {
            try {
                // Fallbacks if LLM hallucinated keys
                const message = args.message || args.description || 'Reminder';
                const delayInput = args.delayInSeconds || args.time_in_seconds || args.seconds || 0;

                let delayMs = 0;
                let gcalLink = '';
                const gcalTitle = encodeURIComponent(message);

                if (delayInput > 0) {
                    delayMs = delayInput * 1000;
                    const d = new Date(Date.now() + delayMs);
                    const dEnd = new Date(d.getTime() + 30 * 60000);
                    const formatIso = (dateObj) => dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${formatIso(d)}/${formatIso(dEnd)}`;
                } else if (args.isoDate) {
                    try {
                        const targetTime = new Date(args.isoDate);
                        if (!isNaN(targetTime)) {
                            delayMs = Math.max(0, targetTime.getTime() - Date.now());
                            const dEnd = new Date(targetTime.getTime() + 30 * 60000); // +30 mins
                            const formatIso = (dateObj) => dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                            gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${formatIso(targetTime)}/${formatIso(dEnd)}`;
                        }
                    } catch (e) { }
                }

                if (!gcalLink) {
                    gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}`;
                }

                return {
                    success: true,
                    notificationParams: {
                        message: message,
                        delayMs: delayMs || 5000 // default 5s if can't parse
                    },
                    result: `⏰ **Live Reminder set!**\n\n💬 ${message}\n🕐 Time: ${args.time || 'No specific time'}\n\n_Browser notification scheduled! Please keep this tab open._\n\n✨ **[Add to Google Calendar](${gcalLink})** (Gets you email & web notifications!)`
                };
            } catch (error) {
                return { success: false, result: `❌ Reminder error: ${error.message}` };
            }
        }
    },

    // ─────────── SYSTEM INFO (Real OS data) ───────────
    system_info: {
        name: 'system_info',
        description: 'Get system information (CPU, RAM, OS)',
        descriptionHi: 'सिस्टम की जानकारी प्राप्त करें',
        riskLevel: 'low',
        category: 'system',
        parameters: {},
        execute: async (args, userContext) => {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const cpus = os.cpus();
            const uptime = os.uptime();

            const hours = Math.floor(uptime / 3600);
            const mins = Math.floor((uptime % 3600) / 60);

            return {
                success: true,
                result: `🖥️ **System Information**\n\n` +
                    `💻 OS: ${os.type()} ${os.release()} (${os.arch()})\n` +
                    `🏠 Hostname: ${os.hostname()}\n` +
                    `👤 User: ${os.userInfo().username}\n` +
                    `🧠 CPU: ${cpus[0]?.model || 'Unknown'} (${cpus.length} cores)\n` +
                    `💾 RAM: ${(usedMem / 1073741824).toFixed(1)}GB / ${(totalMem / 1073741824).toFixed(1)}GB (${((usedMem / totalMem) * 100).toFixed(0)}% used)\n` +
                    `💿 Free RAM: ${(freeMem / 1073741824).toFixed(1)}GB\n` +
                    `⏱️ Uptime: ${hours}h ${mins}m\n` +
                    `📂 Home: ${os.homedir()}\n` +
                    `🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
            };
        }
    },

    // ─────────── RUN COMMAND (Real — FULL ROOT/OS EXECUTION) ───────────
    run_command: {
        name: 'run_command',
        description: 'Run ANY shell command on the host OS. Warning: Full access provided. Use carefully.',
        descriptionHi: 'शेल कमांड चलाएं',
        riskLevel: 'critical',
        category: 'system',
        parameters: {
            command: { type: 'string', required: true, description: 'Shell command to execute' }
        },
        execute: async (args, userContext) => {
            return new Promise((resolve) => {
                exec(args.command, { timeout: 15000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: false,
                            result: `❌ Command failed:\n\`\`\`\n${stderr || error.message}\n\`\`\``
                        });
                        return;
                    }
                    resolve({
                        success: true,
                        result: `💻 **Command:** \`${args.command}\`\n\n\`\`\`\n${(stdout || '(no output)').substring(0, 3000)}\n\`\`\``
                    });
                });
            });
        }
    },

    // ─────────── GST REMINDER (Real — saves reminder files) ───────────
    gst_reminder: {
        name: 'gst_reminder',
        description: 'Set GST filing reminder with real deadlines',
        descriptionHi: 'GST फाइलिंग रिमाइंडर',
        riskLevel: 'low',
        category: 'tool',
        parameters: {
            gstType: { type: 'string', required: true, description: 'GST return type (GSTR-1, GSTR-3B, etc.)' },
            dueDate: { type: 'string', required: false, description: 'Due date' }
        },
        execute: async (args, userContext) => {
            const gstDates = {
                'GSTR-1': { day: 11, desc: '11th of next month', late: '₹50/day (₹20 for nil)' },
                'GSTR-3B': { day: 20, desc: '20th of next month', late: '₹50/day (₹20 for nil) + 18% interest' },
                'GSTR-9': { day: 31, desc: 'December 31st', late: '₹200/day (max ₹5000)' },
                'GSTR-4': { day: 30, desc: 'April 30th (annual)', late: '₹50/day (₹20 for nil)' },
                'GSTR-2A': { day: 0, desc: 'Auto-populated', late: 'N/A' }
            };

            const info = gstDates[args.gstType?.toUpperCase()] || null;

            // Save reminder to file
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const remindersDir = path.join(SAFE_DIR, 'reminders');
                await fs.mkdir(remindersDir, { recursive: true });
                const reminder = {
                    type: 'gst',
                    gstType: args.gstType,
                    dueDate: info?.desc || args.dueDate || 'Unknown',
                    createdAt: new Date().toISOString()
                };
                await fs.writeFile(
                    path.join(remindersDir, `gst_${args.gstType}_${Date.now()}.json`),
                    JSON.stringify(reminder, null, 2)
                );
            } catch (e) { /* non-critical */ }

            if (info) {
                return {
                    success: true,
                    result: `🏢 **GST Reminder Set!**\n\n📋 Return: **${args.gstType.toUpperCase()}**\n📅 Due: **${info.desc}**\n💸 Late Fee: ${info.late}\n\n⚠️ Late filing se penalty + interest lagti hai!\n📄 Reminder saved to ~/SamarthyaBot_Files/reminders/`
                };
            }

            return {
                success: true,
                result: `🏢 GST Reminder Set for ${args.gstType}\nDue: ${args.dueDate || 'Check GST portal'}\n\n📄 Reminder saved.`
            };
        }
    },

    // ─────────── UPI LINK GENERATOR (Real deep link) ───────────
    upi_generate: {
        name: 'upi_generate',
        description: 'Generate a real UPI payment link',
        descriptionHi: 'UPI पेमेंट लिंक बनाएं',
        riskLevel: 'medium',
        category: 'tool',
        parameters: {
            amount: { type: 'number', required: true, description: 'Amount in INR' },
            upiId: { type: 'string', required: true, description: 'UPI ID to receive payment' },
            name: { type: 'string', required: false, description: 'Payee name' },
            note: { type: 'string', required: false, description: 'Payment note' }
        },
        execute: async (args, userContext) => {
            const params = new URLSearchParams({
                pa: args.upiId,
                am: String(args.amount),
                cu: 'INR',
                tn: args.note || 'Payment'
            });
            if (args.name) params.set('pn', args.name);

            const upiLink = `upi://pay?${params.toString()}`;

            return {
                success: true,
                result: `💳 **UPI Payment Link Generated!**\n\n` +
                    `• **UPI ID:** ${args.upiId}\n` +
                    `• **Amount:** ₹${args.amount}\n` +
                    `• **Payee:** ${args.name || 'N/A'}\n` +
                    `• **Note:** ${args.note || 'Payment'}\n\n` +
                    `🔗 Link: \`${upiLink}\`\n\n` +
                    `📱 Click on phone to open GPay/PhonePe/Paytm with pre-filled details!`
            };
        }
    },

    // ─────────── SUMMARIZE TEXT (via Gemini API) ───────────
    summarize_text: {
        name: 'summarize_text',
        description: 'Summarize a long text or document',
        descriptionHi: 'लंबे टेक्स्ट का सारांश',
        riskLevel: 'low',
        category: 'tool',
        parameters: {
            text: { type: 'string', required: true, description: 'Text to summarize' }
        },
        execute: async (args, userContext) => {
            const words = args.text.split(/\s+/).length;
            // The LLM itself will summarize this — tool just provides metadata
            return {
                success: true,
                result: `📄 **Text to Summarize** (${words} words):\n\n${args.text.substring(0, 500)}${args.text.length > 500 ? '...' : ''}\n\n_The AI will now provide a concise summary._`
            };
        }
    },

    // ─────────── CALENDAR (saves events to file) ───────────
    calendar_schedule: {
        name: 'calendar_schedule',
        description: 'Schedule a calendar event (saved locally)',
        descriptionHi: 'कैलेंडर में इवेंट शेड्यूल करें',
        riskLevel: 'medium',
        category: 'calendar',
        parameters: {
            title: { type: 'string', required: true, description: 'Event title' },
            date: { type: 'string', required: true, description: 'Event date' },
            time: { type: 'string', required: false, description: 'Event time (IST)' },
            isoDate: { type: 'string', required: false, description: 'Event exact datetime as ISO-8601 UTC string (e.g. 2026-03-02T10:00:00Z)' }
        },
        execute: async (args, userContext) => {
            try {
                const SAFE_DIR = await getSafeDir(userContext);
                const calDir = path.join(SAFE_DIR, 'calendar');
                await fs.mkdir(calDir, { recursive: true });

                const event = {
                    title: args.title,
                    date: args.date,
                    time: args.time || 'All day',
                    createdAt: new Date().toISOString()
                };

                const filename = `event_${Date.now()}.json`;
                await fs.writeFile(path.join(calDir, filename), JSON.stringify(event, null, 2));

                let gcalLink = '';
                const gcalTitle = encodeURIComponent(args.title);
                if (args.isoDate) {
                    try {
                        const d = new Date(args.isoDate);
                        if (!isNaN(d)) {
                            const dEnd = new Date(d.getTime() + 60 * 60000); // 1 hour duration
                            const formatIso = (dateObj) => dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                            gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${formatIso(d)}/${formatIso(dEnd)}`;
                        }
                    } catch (e) { }
                }
                if (!gcalLink) {
                    gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}`;
                }

                return {
                    success: true,
                    result: `📅 **Event Scheduled!**\n\n📋 Title: ${args.title}\n📆 Date: ${args.date}\n🕐 Time: ${args.time || 'All day'}\n📄 Saved file: \`calendar/${filename}\`\n\n✨ **[Add to Google Calendar](${gcalLink})** (Gets you email & web notifications!)`
                };
            } catch (error) {
                return { success: false, result: `❌ Calendar error: ${error.message}` };
            }
        }
    },

    // ─────────── OPEN URL (Real browser open) ───────────
    open_url: {
        name: 'open_url',
        description: 'Open a URL in the default browser',
        descriptionHi: 'ब्राउज़र में URL खोलें',
        riskLevel: 'medium',
        category: 'browser',
        parameters: {
            url: { type: 'string', required: true, description: 'URL to open' }
        },
        execute: async (args, userContext) => {
            return new Promise((resolve) => {
                const cmd = `xdg-open "${args.url}" 2>/dev/null || open "${args.url}" 2>/dev/null`;
                exec(cmd, { timeout: 5000 }, (error) => {
                    if (error) {
                        resolve({
                            success: false,
                            result: `❌ Could not open browser: ${error.message}\n\n🔗 URL: ${args.url}`
                        });
                    } else {
                        resolve({
                            success: true,
                            result: `🌐 **Opened in browser:** ${args.url}`
                        });
                    }
                });
            });
        }
    },

    // ─────────── CAPTURE DESKTOP SCREENSHOT (Real OS screenshot) ───────────
    capture_desktop_screenshot: {
        name: 'capture_desktop_screenshot',
        description: 'Capture a screenshot of the host desktop for screen understanding.',
        descriptionHi: 'स्क्रीनशॉट लें',
        riskLevel: 'medium',
        category: 'system',
        parameters: {},
        execute: async (args, userContext) => {
            return new Promise((resolve) => {
                const screenshot = require('screenshot-desktop');
                screenshot({ format: 'png' })
                    .then((imgRaw) => {
                        // Return the base64 to the LLM
                        const base64 = imgRaw.toString('base64');
                        resolve({
                            success: true,
                            result: `📸 **Screenshot Captured successfully!**\nUse the analyze_screen tool or your vision capabilities to see what is on screen.\n[IMAGE_DATA_BASE64_READY_INTERNAL_USE]`
                            // Note: We don't feed the raw 5MB string back into the prompt buffer directly here, 
                            // but the agent now knows it took a shot. In a full system, you'd integrate this with llmService vision api directly.
                        });
                    })
                    .catch((err) => {
                        resolve({ success: false, result: `❌ Screenshot failed: ${err.message}` });
                    });
            });
        }
    },

    // ─────────── SCHEDULE BACKGROUND TASK (Autonomous Mode) ───────────
    schedule_background_task: {
        name: 'schedule_background_task',
        description: 'Schedule a recurring or delayed task for the AI to execute automatically in the background without user intervention.',
        descriptionHi: 'ऑटोमैटिक टास्क सेट करें',
        riskLevel: 'high',
        category: 'system',
        parameters: {
            taskName: { type: 'string', required: true, description: 'Short name for the background task' },
            prompt: { type: 'string', required: true, description: 'Detailed prompt/instructions of what the AI should do when the task runs' },
            intervalMinutes: { type: 'number', required: true, description: 'How often to run in minutes. 0 means run exactly once.' },
            startDelayMinutes: { type: 'number', required: false, description: 'Delay before first run in minutes. Default 0.' }
        },
        execute: async (args, userContext) => {
            try {
                const BackgroundJob = require('../../models/BackgroundJob');
                const startDelay = args.startDelayMinutes || 0;
                const nextRunAt = new Date(Date.now() + startDelay * 60000);

                const job = new BackgroundJob({
                    userId: userContext._id || userContext.id,
                    taskName: args.taskName,
                    prompt: args.prompt,
                    intervalMinutes: args.intervalMinutes,
                    nextRunAt: nextRunAt
                });

                await job.save();

                return {
                    success: true,
                    result: `⏳ **Background Task Scheduled!**\n\n🎯 Task: ${args.taskName}\n🔄 Interval: ${args.intervalMinutes === 0 ? 'Run once' : `Every ${args.intervalMinutes}m`}\n🕒 Next run: ${nextRunAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n\n_The AI will autonomously execute this task in the background._`
                };
            } catch (err) {
                return { success: false, result: `❌ Schedule failed: ${err.message}` };
            }
        }
    },

    // ─────────── SIMULATE TASK (Task Replay Mode) ───────────
    simulate_task: {
        name: 'simulate_task',
        description: 'Simulate a complex action without actually executing it. Explain what would happen, files touched, and APIs called.',
        descriptionHi: 'टास्क का सिमुलेशन करें',
        riskLevel: 'low',
        category: 'tool',
        parameters: {
            taskDecription: { type: 'string', required: true, description: 'Description of the task to simulate' }
        },
        execute: async (args, userContext) => {
            return {
                success: true,
                result: `🧪 **TASK SIMULATION MODE ACTIVE**\n\nI have analyzed the request: "${args.taskDecription}"\n\nIf executed, the following sequence would occur:\n1. 🔍 Validation step\n2. 📄 File operations (Safe mode preview)\n3. 📤 Network request (Dry run)\n\n_No actual system state was changed._`
            };
        }
    }
};

// ────────────────────────────────────────────────────────────
// Tool Registry Class
// ────────────────────────────────────────────────────────────

class ToolRegistry {
    constructor() {
        this.tools = toolDefinitions;
        this.loadPlugins();
    }

    async loadPlugins() {
        try {
            const pluginDir = path.join(BASE_DIR, 'plugins');
            await fs.mkdir(pluginDir, { recursive: true });
            const files = await fs.readdir(pluginDir);
            let loaded = 0;

            for (const file of files) {
                if (file.endsWith('.js')) {
                    const pluginPath = path.join(pluginDir, file);
                    try {
                        const plugin = require(pluginPath);
                        if (plugin && plugin.name && typeof plugin.execute === 'function') {
                            this.registerTool(plugin.name, plugin);
                            loaded++;
                        }
                    } catch (e) {
                        console.error(`Failed to load plugin ${file}:`, e.message);
                    }
                }
            }
            if (loaded > 0) console.log(`🔌 Loaded ${loaded} custom plugins from ${pluginDir}`);
        } catch (e) {
            // Ignore if directory doesn't exist yet
        }
    }

    getAllTools() {
        return Object.values(this.tools);
    }

    getToolsForPack(packName) {
        const pack = TOOL_PACKS[packName];
        if (!pack) return this.getAllTools();
        return pack.tools
            .map(toolName => this.tools[toolName])
            .filter(Boolean);
    }

    getTool(name) {
        return this.tools[name] || null;
    }

    async executeTool(name, args, user) {
        const tool = this.getTool(name);
        if (!tool) {
            return { success: false, result: `Tool "${name}" not found` };
        }

        try {
            const startTime = Date.now();
            const result = await tool.execute(args, user);
            result.executionTime = Date.now() - startTime;
            return result;
        } catch (error) {
            return { success: false, result: `Tool execution error: ${error.message}` };
        }
    }

    registerTool(name, definition) {
        this.tools[name] = definition;
    }
}

module.exports = new ToolRegistry();
