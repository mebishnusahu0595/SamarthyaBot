const fs = require('fs');

let content = fs.readFileSync('services/tools/toolRegistry.js', 'utf8');

// 1. Replace SAFE_DIR definition
content = content.replace(
    /const SAFE_DIR = path\.join\(os\.homedir\(\), 'SamarthyaBot_Files'\);\n\n\/\/ Ensure safe directory exists on startup\n\(\(async \(\) => {\n    try { await fs\.mkdir\(SAFE_DIR, { recursive: true } \); } catch \(e\) { \/\* ignore \*\/ }\n}\)\(\);/g,
    `const BASE_DIR = path.join(os.homedir(), 'SamarthyaBot_Files');\n\nasync function getSafeDir(user) {\n    let dir = BASE_DIR;\n    if (user && (user._id || user.id)) {\n        dir = path.join(BASE_DIR, String(user._id || user.id));\n    }\n    try { await fs.mkdir(dir, { recursive: true }); } catch(e) {}\n    return dir;\n}`
);

// 2. update execute function signatures specifically
content = content.replace(/execute: async \(args\) => {/g, 'execute: async (args, userContext) => {');
content = content.replace(/execute: async \(\) => {/g, 'execute: async (args, userContext) => {');

// 3. inject SAFE_DIR into the functions that need it
const fileFuncs = ['file_read', 'file_write', 'file_list', 'note_take', 'reminder_set', 'reminders_get', 'gst_reminder', 'calendar_schedule'];
content = content.replace(/execute: async \(args, userContext\) => {\n            try {/g, 
    'execute: async (args, userContext) => {\n            try {\n                const SAFE_DIR = await getSafeDir(userContext);');

// 4. Update executeTool and execute calls
content = content.replace(/async executeTool\(name, args\) {/g, 'async executeTool(name, args, user) {');
content = content.replace(/const result = await tool\.execute\(args\);/g, 'const result = await tool.execute(args, user);');

fs.writeFileSync('services/tools/toolRegistry.js', content);
console.log('Fixed toolRegistry.js');
