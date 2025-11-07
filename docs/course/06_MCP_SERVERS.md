# Module 06: MCP Servers

**Learning Objectives:**
1. Understand what MCP (Model Context Protocol) is and why it's critical for multi-agent systems
2. Learn how MCP servers provide 14x token reduction over bash commands
3. Build custom MCP servers in TypeScript and Python
4. Understand stdio transport and tool handler architecture
5. Configure per-agent MCP server access
6. Debug and test MCP servers
7. Integrate MCP servers with Claude Desktop and Claude Code

---

## Section 00: The Big Picture

### The Problem: Token Inefficiency in Multi-Agent Coordination

Before MCP, agents coordinated via bash commands and file reads:

```typescript
// Read chatroom coordination channel (pre-MCP approach)
const result = await Bash({
  command: "tail -n 50 .claude/chatroom/channels/coordination.md"
});
```

**Cost:** ~1,200 tokens per read (50 lines × ~25 tokens/line average)

**Problem:** When 5 agents each check coordination 3 times per session:
- 5 agents × 3 reads × 1,200 tokens = **18,000 tokens wasted on coordination overhead**

Worse: Every read required permission approval from the user ("Can I read this file?").

### The Solution: MCP Protocol

MCP (Model Context Protocol) moves file operations **server-side**:

```typescript
// Read chatroom coordination channel (MCP approach)
mcp__chatroom__chatroom_read_new({
  channel: "coordination",
  agent: "orchestrator-1"
})
```

**Cost:** ~85 tokens (only returns NEW messages since last read, no file path overhead)

**Per-agent read tracking:** Each agent's read position is tracked server-side. Token consumption scales with NEW messages only, not total channel history.

**Token reduction:** 14x more efficient (1,200 → 85 tokens per read)

**No permission requests:** Server handles all file I/O internally. Agents call tools directly.

### The Principle: Move Coordination Infrastructure to Servers

**Instead of:** Agents reading raw files and parsing formats
**Do this:** Servers provide high-level tools with intelligent filtering

**Result:**
- Agents spend tokens on problem-solving, not coordination overhead
- Multi-agent workflows become feasible (5-10 agents can coordinate without exhausting context)
- No user interruption for file permissions

This module shows you how to build these servers.

---

## Section 01: MCP Protocol Fundamentals

### What is MCP?

**Model Context Protocol** is a standardized protocol for exposing tools to LLM agents via stdio (standard input/output).

**Core concept:** Instead of agents calling bash commands and reading files, they call **tools** provided by **MCP servers**.

**Key properties:**
1. **Server-side execution:** File I/O, API calls, database queries happen in the server process
2. **Stdio transport:** Communication via JSON-RPC over stdin/stdout
3. **Tool-based interface:** Each server exposes a set of tools with typed input schemas
4. **Stateful tracking:** Servers maintain state (like read positions) across tool calls
5. **No permission requests:** Tools execute without user approval (configured once)

### Architecture: Agent ↔ MCP Server ↔ Resources

```
┌─────────────────┐
│  Claude Agent   │
│  (Orchestrator) │
└────────┬────────┘
         │ Tool calls (JSON-RPC)
         ↓
┌─────────────────┐
│   MCP Server    │ ← Single process, persistent
│  (chatroom)     │
└────────┬────────┘
         │ File I/O
         ↓
┌─────────────────┐
│   Resources     │
│ (.md files,     │
│  lastread files)│
└─────────────────┘
```

**Flow:**
1. Agent calls tool: `chatroom_read_new({channel: "coordination", agent: "orchestrator-1"})`
2. JSON-RPC message sent over stdin to MCP server
3. Server reads `.coordination_orchestrator-1_lastread` file (last read position: line 450)
4. Server reads `channels/coordination.md` (current length: 482 lines)
5. Server returns lines 450-482 (32 new lines)
6. Server updates lastread file to 482
7. Agent receives only new messages (not entire channel history)

**Token savings:** Agent doesn't pay tokens for:
- File path strings
- File read operations
- Parsing lastread tracking logic
- Lines already seen

### MCP Servers in This Repo

This project uses **5 MCP servers**:

1. **chatroom** (TypeScript) - File-based coordination, per-agent read tracking
2. **agent-memory** (Python) - Hierarchical memory system (recent → long-term → core)
3. **ai-safety-transcripts** (Python) - YouTube transcript RAG search
4. **pdf-rag** (Python) - Research paper semantic search
5. **matrix** (Python, external repo) - Real-time Matrix messaging

**Configuration:** `scripts/mcp-config.json` (shared) and per-agent configs in `.claude/agents/mcp-configs/`

---

## Section 02: Building a Custom MCP Server (TypeScript)

### Example: Chatroom Server

**File:** `.claude/mcp-chatroom/src/index.ts` (667 lines)

**Tech stack:**
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `stdio` transport - JSON-RPC over stdin/stdout
- TypeScript - Type-safe tool schemas

#### Minimal Server Structure

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Create server
const server = new Server(
  {
    name: 'chatroom',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: 'chatroom_post',
    description: 'Post a message to a channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel name' },
        agent: { type: 'string', description: 'Agent username' },
        status: {
          type: 'string',
          description: 'Message status',
          enum: ['ENTERED', 'STARTED', 'IN-PROGRESS', 'COMPLETED', 'BLOCKED']
        },
        message: { type: 'string', description: 'Message content' },
      },
      required: ['channel', 'agent', 'status', 'message'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'chatroom_post': {
      const { channel, agent, status, message } = args as {
        channel: string;
        agent: string;
        status: string;
        message: string;
      };

      // Server-side file operation
      const channelFile = `${CHANNELS_DIR}/${channel}.md`;
      const messageBlock = `\n---\n**${agent}** | ${timestamp()} | [${status}]\n\n${message}\n---\n`;
      fs.appendFileSync(channelFile, messageBlock);

      // Minimal response (no content needed)
      return {
        content: [{ type: 'text', text: `✓ Posted to ${channel}` }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Chatroom Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

**Key patterns:**

1. **Tool schema definition:** JSON Schema for typed inputs (IDE autocomplete, validation)
2. **Request handlers:** `ListToolsRequestSchema` (discovery) and `CallToolRequestSchema` (execution)
3. **Server-side state:** Server maintains `.${channel}_${agent}_lastread` files
4. **Error handling:** Wrap tool logic in try/catch, return `isError: true` on failure
5. **Stdio transport:** All communication via stdin/stdout (no HTTP server needed)

#### Per-Agent Read Tracking Pattern

```typescript
function getLastReadFile(channel: string, agent: string): string {
  return path.join(CHATROOM_ROOT, `.${channel}_${agent}_lastread`);
}

function readLastReadLine(channel: string, agent: string): number {
  const file = getLastReadFile(channel, agent);
  try {
    const content = fs.readFileSync(file, 'utf-8').trim();
    return parseInt(content) || 0;
  } catch {
    return 0; // First time reading
  }
}

function writeLastReadLine(channel: string, agent: string, line: number): void {
  const file = getLastReadFile(channel, agent);
  fs.writeFileSync(file, line.toString());
}

// In chatroom_read_new handler:
const lastLine = readLastReadLine(channel, agent);
const currentLine = countLines(channelFile);

if (currentLine <= lastLine) {
  return { content: [{ type: 'text', text: 'No new messages' }] };
}

// Read only new lines
const allLines = fs.readFileSync(channelFile, 'utf-8').split('\n');
const newLines = allLines.slice(lastLine).join('\n');

// Update read position
writeLastReadLine(channel, agent, currentLine);

return { content: [{ type: 'text', text: newLines }] };
```

**Why this matters:** Each agent only pays tokens for NEW messages, not entire channel history.

**Token comparison:**
- Without tracking: Agent reads 500-line channel → 12,500 tokens
- With tracking: Agent reads 15 new lines → 375 tokens (**33x reduction**)

---

## Section 03: Building a Custom MCP Server (Python)

### Example: Agent Memory Server

**File:** `scripts/agent-memory-server.py` (623 lines)

**Tech stack:**
- `fastMCP` - FastAPI-like MCP server framework (Python)
- Hierarchical memory structure (recent → medium-term → long-term → core)
- Audit logging for all operations

#### Minimal Server Structure (fastMCP)

```python
#!/usr/bin/env python3
from pathlib import Path
from typing import Dict, Any
from fastmcp import FastMCP

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
MEMORY_DIR = PROJECT_ROOT / ".claude" / "agents" / "memories"

# Create server
mcp = FastMCP("Agent Memory System")

# Define tools using decorators
@mcp.tool()
def recall_context(agent_id: str) -> str:
    """
    Recall your recent context (what you should use on spawn).
    Returns a concise summary of what you've been working on.

    Args:
        agent_id: Your agent identifier (e.g., 'roy', 'cynthia')

    Returns:
        Formatted summary of recent tasks, learnings, and key memories
    """
    memory = load_memory(agent_id)

    # Build summary
    lines = [
        f"🧠 Memory Recall: {memory['agentName']}",
        f"Role: {memory['role']}",
        ""
    ]

    # Recent tasks
    if memory['recent']['tasks']:
        lines.append("📋 Recent tasks:")
        for task in memory['recent']['tasks'][-5:]:
            lines.append(f"  • {task}")

    return "\n".join(lines)

@mcp.tool()
def add_recent_task(agent_id: str, task: str) -> str:
    """Add a task to agent's recent memory."""
    memory = load_memory(agent_id)
    memory['recent']['tasks'].append(task)
    save_memory(agent_id, memory)
    audit(agent_id, 'add_task', task[:50])

    return json.dumps({
        "success": True,
        "recent": memory['recent']
    }, indent=2)

# Start server
if __name__ == "__main__":
    mcp.run(transport="stdio")
```

**Key differences from TypeScript:**

1. **Decorator-based:** `@mcp.tool()` auto-registers tools (no manual schema definition)
2. **Type hints as schema:** Python type hints become JSON Schema (FastMCP introspection)
3. **Simpler boilerplate:** FastMCP handles ListTools/CallTool automatically
4. **Same stdio transport:** Communication still via stdin/stdout

#### Memory Hierarchy Pattern

```python
# Memory structure (from actual agent memory files)
{
  "agentName": "Roy",
  "role": "Simulation Maintainer",

  # Recent: 24h memory (cleared nightly)
  "recent": {
    "tasks": ["Fix NaN bug in ecology phase", "Add assertions to planetaryBoundaries.ts"],
    "learnings": ["NaN bugs hide behind ?? fallbacks", "Monte Carlo catches issues early"],
    "conversations": ["Discussed with Sylvia: need research on ocean pH thresholds"],
    "lastUpdated": "2025-11-07T04:30:00"
  },

  # Medium-term: 7 days (cleared weekly, promoted to long-term)
  "mediumTerm": {
    "patterns": ["Always run Monte Carlo N≥10 after major changes"],
    "insights": ["Assertion utilities prevent silent failures"],
    "lastCleared": "2025-11-05T00:00:00"
  },

  # Long-term: Permanent
  "longTerm": {
    "majorInsights": ["Defensive fallbacks mask bugs in research simulations"],
    "projectMilestones": ["2025-10-15: Implemented NaN detection framework"]
  },

  # Core: PERSONALITY-SHAPING MOMENTS (always retrieved)
  "coreMemory": {
    "personality": "Defensive, fail-loudly, research-rigorous",
    "motto": "Silent fallbacks are bugs in hiding",
    "research_verification_principle": "From that day forward, I always verify research before implementation"
  },

  # Compost: Failed ideas (might be useful later)
  "compost": {
    "discardedIdeas": ["Tried using moving averages for smoothing - created lag artifacts"],
    "failedApproaches": ["Caching phase results broke determinism"]
  }
}
```

**Why hierarchical memory?**

- **Recent:** High-churn, token-efficient context for current work
- **Medium-term:** Pattern accumulation, filtered weekly
- **Long-term:** Permanent lessons, project history
- **Core:** Personality-defining moments (always shown on spawn)
- **Compost:** Failed experiments (fertile ground for future ideas)

**Cleanup schedule:**
- Nightly (automated): Recent → Medium-term
- Weekly (automated): Medium-term → Long-term (top 3) + Compost (rest)
- Monthly (automated): Clear compost (preserved in audit log)

---

## Section 04: MCP Server Configuration

### Global Configuration

**File:** `scripts/mcp-config.json`

```json
{
  "mcpServers": {
    "chatroom": {
      "command": "node",
      "args": ["/path/to/.claude/mcp-chatroom/dist/index.js"],
      "cwd": "/path/to/project",
      "env": {}
    },
    "agent-memory": {
      "command": "/path/to/.venv/bin/python",
      "args": ["/path/to/scripts/agent-memory-server.py"],
      "env": {
        "PYTHONPATH": "/path/to/project"
      }
    },
    "pdf-rag": {
      "command": "/path/to/.venv/bin/python",
      "args": ["/path/to/scripts/pdf-rag-server.py"],
      "env": {
        "PYTHONPATH": "/path/to/project"
      }
    }
  }
}
```

**Key fields:**
- `command`: Executable to run (node, python, bash script)
- `args`: Arguments passed to command
- `cwd`: Working directory (CRITICAL for file paths)
- `env`: Environment variables (PYTHONPATH, API keys, etc.)

**How Claude Desktop uses this:**
1. Reads `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Spawns each MCP server process on startup
3. Maintains stdio connection to each server
4. Routes tool calls to appropriate server

### Per-Agent Configuration

**Directory:** `.claude/agents/mcp-configs/`

**Example:** `.claude/agents/mcp-configs/matrix-test.json`

```json
{
  "mcpServers": {
    "matrix": {
      "command": "/path/to/matrix-fastmcp-server/run.sh",
      "args": [],
      "env": {}
    }
  }
}
```

**Why per-agent configs?**

Not all agents need access to all servers:
- **Orchestrator:** Needs all servers (coordination, memory, research)
- **Research agents (Cynthia, Sylvia):** Need pdf-rag, ai-safety-transcripts, chatroom
- **Implementation agents (Roy, Moss):** Need chatroom, agent-memory (no Matrix)
- **Testing agents:** Need chatroom only (isolated from coordination)

**Token savings:** Agents don't load MCP servers they don't use → faster startup, lower memory

**Security:** Specialized agents can't access servers outside their domain (e.g., test agents can't post to production Matrix channels)

---

## Section 05: Tool Design Patterns

### Pattern 1: Read-Only Context Tools

**Purpose:** Provide filtered context without modifying state

**Example:** `chatroom_peek` (get last N lines without updating read position)

```typescript
{
  name: 'chatroom_peek',
  description: 'Peek at last N lines (for context without marking as read)',
  inputSchema: {
    type: 'object',
    properties: {
      channel: { type: 'string', description: 'Channel name' },
      lines: { type: 'number', description: 'Number of lines to show', default: 5 }
    },
    required: ['channel']
  }
}

// Implementation
case 'chatroom_peek': {
  const { channel, lines = 5 } = args;
  const allLines = fs.readFileSync(channelFile, 'utf-8').split('\n');
  const lastLines = allLines.slice(-lines).join('\n');

  // NOTE: No lastread update (read-only)
  return { content: [{ type: 'text', text: lastLines }] };
}
```

**Use case:** Agent wants to check if a question was answered without "consuming" messages

### Pattern 2: Write-Only Action Tools

**Purpose:** Post updates without needing response

**Example:** `chatroom_post` (append message, return success)

```typescript
{
  name: 'chatroom_post',
  description: 'Post a message to a channel (append-only, no read)',
  inputSchema: {
    type: 'object',
    properties: {
      channel: { type: 'string' },
      agent: { type: 'string' },
      status: { type: 'string', enum: ['ENTERED', 'IN-PROGRESS', 'COMPLETED', 'BLOCKED'] },
      message: { type: 'string' }
    },
    required: ['channel', 'agent', 'status', 'message']
  }
}

// Implementation
case 'chatroom_post': {
  const { channel, agent, status, message } = args;

  // Append to channel file
  fs.appendFileSync(channelFile, formatMessage(agent, status, message));

  // Minimal response (no content needed)
  return { content: [{ type: 'text', text: `✓ Posted to ${channel}` }] };
}
```

**Token savings:** Response is 5 tokens (`✓ Posted to ${channel}`), not 1,000+ token confirmation message

### Pattern 3: Stateful Tracking Tools

**Purpose:** Maintain per-agent state across calls

**Example:** `chatroom_read_new` (read only new messages since last check)

```typescript
case 'chatroom_read_new': {
  const { channel, agent, limit = 50 } = args;

  // Read agent's last read position
  const lastLine = readLastReadLine(channel, agent);
  const currentLine = countLines(channelFile);

  // No new messages? Early return
  if (currentLine <= lastLine) {
    return { content: [{ type: 'text', text: 'No new messages' }] };
  }

  // Read new lines with pagination
  const allLines = fs.readFileSync(channelFile, 'utf-8').split('\n');
  const availableLines = allLines.slice(lastLine);
  const linesToReturn = limit > 0 ? availableLines.slice(0, limit) : availableLines;

  // Update read position
  const newLastLine = lastLine + linesToReturn.length;
  writeLastReadLine(channel, agent, newLastLine);

  // Show remaining count
  const remaining = currentLine - newLastLine;
  const moreIndicator = remaining > 0 ? `\n━━━ ${remaining} more lines available ━━━` : '';

  return {
    content: [{
      type: 'text',
      text: `━━━ New messages in ${channel} ━━━\n${linesToReturn.join('\n')}${moreIndicator}`
    }]
  };
}
```

**Key features:**
1. Per-agent tracking (different agents can be at different positions)
2. Pagination (limit parameter prevents token overflow)
3. Remaining count (agent knows if more messages exist)
4. Early return (no new messages → 5 tokens, not 1,000)

### Pattern 4: Hierarchical Memory Tools

**Purpose:** Different retention policies for different data types

**Example:** Agent memory system

```python
@mcp.tool()
def add_recent_task(agent_id: str, task: str) -> str:
    """Add to 24h memory (cleared nightly)"""
    memory = load_memory(agent_id)
    memory['recent']['tasks'].append(task)
    save_memory(agent_id, memory)
    return json.dumps({"success": True})

@mcp.tool()
def add_long_term_insight(agent_id: str, insight: str) -> str:
    """Add to permanent memory"""
    memory = load_memory(agent_id)
    memory['longTerm']['majorInsights'].append(insight)
    save_memory(agent_id, memory)
    return json.dumps({"success": True})

@mcp.tool()
def add_core_memory(agent_id: str, key: str, value: str) -> str:
    """Add PERSONALITY-SHAPING MOMENT (use sparingly!)"""
    # Enforce 3-sentence limit
    sentence_count = value.count('.') + value.count('!') + value.count('?')
    if sentence_count > 3:
        return json.dumps({"error": "Core memory too long (max 3 sentences)"})

    memory = load_memory(agent_id)
    memory['coreMemory'][key] = value
    save_memory(agent_id, memory)
    return json.dumps({"success": True})
```

**Rationale:**
- **Recent tasks:** High churn, cleared daily (prevents memory bloat)
- **Long-term insights:** Permanent (hard-won lessons)
- **Core memories:** Personality-defining (always retrieved on spawn)

**Token optimization:** Agent recalls only relevant layer for current task:
- Starting new session? → `recall_context()` (recent + core only)
- Need project history? → `load_agent_memory()` (full structure)

---

## Section 06: Testing and Debugging MCP Servers

### Local Testing (Without Claude Desktop)

#### Method 1: Manual stdio Testing

```bash
# Start server manually
cd .claude/mcp-chatroom
npm run build
node dist/index.js

# In another terminal, send JSON-RPC request
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js

# Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {"name": "chatroom_post", "description": "...", "inputSchema": {...}},
      {"name": "chatroom_read_new", "description": "...", "inputSchema": {...}}
    ]
  }
}
```

#### Method 2: Python Testing Script

```python
#!/usr/bin/env python3
"""Test MCP server via stdio"""
import subprocess
import json

def test_tool_call(server_cmd, tool_name, args):
    """Call MCP tool and return result"""
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": args
        },
        "id": 1
    }

    proc = subprocess.Popen(
        server_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    stdout, stderr = proc.communicate(json.dumps(request).encode())

    print(f"STDERR (logs): {stderr.decode()}")
    print(f"STDOUT (result): {stdout.decode()}")

# Test chatroom server
test_tool_call(
    ["node", ".claude/mcp-chatroom/dist/index.js"],
    "chatroom_post",
    {
        "channel": "test",
        "agent": "test-agent",
        "status": "IN-PROGRESS",
        "message": "Testing MCP server"
    }
)
```

#### Method 3: Integration Test (Claude Code)

```bash
# Configure test agent with local MCP server
cat > .claude/agents/mcp-configs/test-agent.json <<EOF
{
  "mcpServers": {
    "chatroom": {
      "command": "node",
      "args": ["$PWD/.claude/mcp-chatroom/dist/index.js"],
      "cwd": "$PWD"
    }
  }
}
EOF

# Run Claude Code with test agent config
claude-code chat \
  --mcp-config .claude/agents/mcp-configs/test-agent.json \
  "Please post a test message to the 'testing' channel using chatroom_post tool"
```

### Debugging Common Issues

#### Issue 1: "Tool not found"

**Symptom:** Agent calls tool, receives "Unknown tool: chatroom_post"

**Causes:**
1. MCP server not running
2. Wrong server name in config
3. Tool not registered in `tools` array

**Debug:**
```bash
# Check if server process is running
ps aux | grep mcp-chatroom

# Check tool registration
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js | jq '.result.tools[].name'
# Should output: chatroom_post, chatroom_read_new, ...
```

#### Issue 2: "Working directory incorrect"

**Symptom:** Server can't find files (e.g., `.claude/chatroom/channels/coordination.md`)

**Cause:** `cwd` in config is wrong

**Fix:**
```json
{
  "mcpServers": {
    "chatroom": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "cwd": "/absolute/path/to/project"  // ← Must be project root
    }
  }
}
```

**Verify:**
```typescript
// Add to server startup
console.error(`CWD: ${process.cwd()}`);
console.error(`Channels dir: ${CHANNELS_DIR}`);
console.error(`Channels exist: ${fs.existsSync(CHANNELS_DIR)}`);
```

#### Issue 3: "Permission denied"

**Symptom:** Server crashes with EACCES errors

**Causes:**
1. File permissions incorrect
2. Server running as wrong user
3. Directory doesn't exist

**Fix:**
```bash
# Check permissions
ls -la .claude/chatroom/channels/
# Should be readable/writable by current user

# Fix permissions
chmod -R u+rw .claude/chatroom/

# Ensure directories exist
mkdir -p .claude/chatroom/channels
```

#### Issue 4: "Python module not found"

**Symptom:** `ImportError: No module named 'fastmcp'`

**Cause:** Python virtual environment not activated OR wrong Python executable in config

**Fix:**
```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "/absolute/path/to/.venv/bin/python",  // ← Use venv Python
      "args": ["/absolute/path/to/scripts/agent-memory-server.py"],
      "env": {
        "PYTHONPATH": "/absolute/path/to/project"
      }
    }
  }
}
```

**Verify:**
```bash
# Test server directly
/path/to/.venv/bin/python scripts/agent-memory-server.py
# Should output: "🧠 Starting Agent Memory MCP Server (fastMCP + stdio)"
```

### Logging Best Practices

**Rule:** All logs go to stderr, all MCP protocol messages go to stdout

```typescript
// ✅ GOOD - Logs to stderr (won't interfere with stdio protocol)
console.error('MCP Chatroom Server running on stdio');
console.error(`Tool called: ${name} with args: ${JSON.stringify(args)}`);

// ❌ BAD - Logs to stdout (breaks JSON-RPC protocol)
console.log('Server started');
```

**Python equivalent:**
```python
import sys

# ✅ GOOD
print("🧠 Starting Agent Memory MCP Server", file=sys.stderr)
print(f"Tool called: {tool_name}", file=sys.stderr)

# ❌ BAD
print("Server started")  # Goes to stdout by default
```

**Why this matters:** MCP protocol uses stdout for JSON-RPC messages. Any non-JSON output to stdout breaks the protocol.

---

## Section 07: Exercises

### Exercise 1: Build a Simple MCP Server

**Goal:** Create a "todo list" MCP server with 3 tools

**Requirements:**
1. `todo_add(task: str)` - Add a task to `todos.txt`
2. `todo_list()` - List all tasks
3. `todo_complete(task_number: int)` - Mark task as complete

**Starter code (TypeScript):**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';

const TODOS_FILE = 'todos.txt';

const server = new Server({ name: 'todo', version: '1.0.0' }, { capabilities: { tools: {} } });

const tools = [
  // TODO: Define tool schemas
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // TODO: Implement tool handlers
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Todo MCP Server running');
}

main();
```

**Test:**
```bash
# Test manually
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node todo-server.js
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"todo_add","arguments":{"task":"Build MCP server"}},"id":2}' | node todo-server.js
```

**Success criteria:**
- Server responds to `tools/list` with 3 tools
- `todo_add` appends to `todos.txt`
- `todo_list` returns file contents
- `todo_complete` marks task with `[DONE]` prefix

### Exercise 2: Add Per-User Read Tracking

**Goal:** Extend Exercise 1 to track read positions (like chatroom server)

**New requirements:**
1. `todo_read_new(user: str)` - Show only new tasks since last read
2. Track read position per user in `.todos_{user}_lastread` files
3. Return "No new tasks" if user is caught up

**Hints:**
```typescript
function getLastReadLine(user: string): number {
  const file = `.todos_${user}_lastread`;
  try {
    return parseInt(fs.readFileSync(file, 'utf-8').trim()) || 0;
  } catch {
    return 0;
  }
}

function writeLastReadLine(user: string, line: number): void {
  fs.writeFileSync(`.todos_${user}_lastread`, line.toString());
}
```

**Test:**
```bash
# User 1 adds 3 tasks
echo '...' | node todo-server.js  # todo_add "Task 1"
echo '...' | node todo-server.js  # todo_add "Task 2"
echo '...' | node todo-server.js  # todo_add "Task 3"

# User 1 reads (should see all 3)
echo '...' | node todo-server.js  # todo_read_new(user: "alice")

# User 2 reads (should also see all 3, different read position)
echo '...' | node todo-server.js  # todo_read_new(user: "bob")

# User 1 reads again (should see "No new tasks")
echo '...' | node todo-server.js  # todo_read_new(user: "alice")
```

### Exercise 3: Build Agent Memory Tools

**Goal:** Create a simplified agent memory server in Python using fastMCP

**Requirements:**
1. Store agent memories in JSON files (`.memories/{agent_id}.json`)
2. Implement 3 tools:
   - `add_task(agent_id: str, task: str)` - Add to recent tasks
   - `recall_tasks(agent_id: str)` - Get last 5 tasks
   - `clear_recent(agent_id: str)` - Clear recent tasks (nightly cleanup)

**Starter code:**
```python
#!/usr/bin/env python3
from pathlib import Path
import json
from fastmcp import FastMCP

MEMORY_DIR = Path(".memories")
MEMORY_DIR.mkdir(exist_ok=True)

mcp = FastMCP("Simple Agent Memory")

def load_memory(agent_id: str) -> dict:
    """Load agent memory from disk"""
    file = MEMORY_DIR / f"{agent_id}.json"
    if not file.exists():
        return {"recent": {"tasks": []}}
    return json.loads(file.read_text())

def save_memory(agent_id: str, memory: dict) -> None:
    """Save agent memory to disk"""
    file = MEMORY_DIR / f"{agent_id}.json"
    file.write_text(json.dumps(memory, indent=2))

# TODO: Implement tools

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

**Test:**
```bash
# Test with Python
python3 simple-memory-server.py <<EOF
{"jsonrpc":"2.0","method":"tools/call","params":{"name":"add_task","arguments":{"agent_id":"test","task":"Learn MCP"}},"id":1}
EOF

python3 simple-memory-server.py <<EOF
{"jsonrpc":"2.0","method":"tools/call","params":{"name":"recall_tasks","arguments":{"agent_id":"test"}},"id":2}
EOF
```

### Exercise 4: Integrate with Claude Desktop

**Goal:** Configure your MCP server to work with Claude Desktop

**Steps:**

1. **Build and install your server:**
```bash
# For TypeScript server
npm run build

# For Python server (ensure dependencies installed)
pip install fastmcp
```

2. **Add to Claude Desktop config:**
```bash
# Edit config file
code ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Add your server
{
  "mcpServers": {
    "your-server-name": {
      "command": "node",
      "args": ["/absolute/path/to/your-server/dist/index.js"],
      "cwd": "/absolute/path/to/project"
    }
  }
}
```

3. **Restart Claude Desktop:**
```bash
# Kill Claude Desktop process
pkill "Claude"

# Reopen Claude Desktop from Applications
```

4. **Test in Claude Desktop:**
- Open new conversation
- Type: "Please list available MCP tools"
- Verify your tools appear in the list
- Try calling one of your tools

**Success criteria:**
- Claude Desktop shows your tools in `tools/list`
- Tool calls execute successfully
- Logs appear in server stderr (check Console.app on macOS)
- Agent can call tools without permission requests

---

## Key Takeaways

1. **MCP provides 14x token reduction** over bash commands by moving file I/O server-side
2. **Per-agent read tracking** scales token consumption with NEW messages, not total history
3. **TypeScript servers** use `@modelcontextprotocol/sdk` with explicit tool schemas
4. **Python servers** use `fastMCP` with decorator-based tool registration
5. **Stdio transport** enables simple JSON-RPC communication (no HTTP server needed)
6. **Per-agent configs** provide selective server access (security + token efficiency)
7. **Hierarchical memory** (recent → medium-term → long-term → core) prevents memory bloat
8. **All logs go to stderr** (stdout is reserved for JSON-RPC protocol messages)

---

## Related Modules

- **Module 02: Communication Systems** - How chatroom MCP server is used for coordination
- **Module 03: Autonomous Workflows** - How agent-memory server enables long-running agents
- **Module 05: Planning & Coordination** - How orchestrator uses multiple MCP servers

---

## Self-Check Questions

1. Why does per-agent read tracking provide 14x token reduction?
2. What are the 3 key components of an MCP server? (Server, Transport, Tools)
3. How do TypeScript and Python MCP servers differ in tool registration?
4. Why must all logs go to stderr instead of stdout?
5. What are the 5 memory layers in the agent memory system? (Recent, Medium-term, Long-term, Core, Compost)
6. When would you use `chatroom_peek` vs `chatroom_read_new`?
7. How do per-agent MCP configs improve security and efficiency?
8. What's the difference between a read-only tool and a stateful tracking tool?

---

## Mental Model

**Think of MCP servers as specialized librarians:**

- **Without MCP:** Agent walks to library, browses 500 books (reads entire coordination channel), takes notes on all of them → 12,500 tokens
- **With MCP:** Agent asks librarian "What's new since yesterday?" → Librarian checks agent's bookmark (lastread file), hands them 15 new pages → 375 tokens

**The librarian (MCP server) maintains:**
- Everyone's bookmarks (per-agent read positions)
- The library catalog (tool schemas)
- Access rules (per-agent configs)
- Audit logs (who read what, when)

**Agents just ask questions, librarians handle the infrastructure.**

---

**Next:** Module 07 - Testing & Validation (Monte Carlo simulation, integration tests, quality gates)
