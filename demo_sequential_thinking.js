const { spawn } = require('child_process');

const server = spawn('npx.cmd', ['-y', '@modelcontextprotocol/server-sequential-thinking'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: true
});

let messageId = 1;

// Send initialize message
const initMessage = {
  jsonrpc: '2.0',
  id: messageId++,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'demo-client',
      version: '1.0.0'
    }
  }
};

server.stdin.write(JSON.stringify(initMessage) + '\n');

// Listen for response
server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  if (data.toString().includes('"id":1')) {
    // After initialize, send tools/list to see available tools
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/list',
      params: {}
    };
    server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
  } else if (data.toString().includes('"id":2')) {
    // After listing tools, call sequential_thinking
    const callToolMessage = {
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/call',
      params: {
        name: 'sequential_thinking',
        arguments: {
          thought: 'Starting to solve a simple math problem: What is 2 + 2?',
          nextThoughtNeeded: true,
          thoughtNumber: 1,
          totalThoughts: 3,
          isRevision: false
        }
      }
    };
    server.stdin.write(JSON.stringify(callToolMessage) + '\n');
  } else if (data.toString().includes('"id":3')) {
    // After tool call, exit
    server.kill();
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log('Server exited with code', code);
});
