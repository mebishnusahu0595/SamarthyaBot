const llmService = require('./services/llm/llmService.js');
const response = `Here is the data:
\`\`\`tool_call
[
  { "tool": "file_write", "args": { "filename": "test.txt", "content": "hello" } },
  { "tool": "send_email", "args": { "to": "a@a.com", "subject": "a", "body": "a" } }
]
\`\`\`
`;
console.log(llmService.parseToolCalls(response));
