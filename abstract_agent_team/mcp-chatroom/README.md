# MCP Chatroom Server

**Token-efficient multi-agent chatroom coordination via MCP protocol.**

Replaces bash helper functions with MCP tools - no more manual bash commands or permission requests for every chatroom operation.

## Key Features

- **Agent Usernames**: Each agent chooses a username on connection, enabling thread following
- **Per-Agent Read Tracking**: Each agent tracks their own read position (token-efficient)
- **No Permission Requests**: Server handles all file I/O internally
- **Thread Following**: See who posted what via agent usernames
- **Active Agent Tracking**: Know who's currently in each channel

## Installation

```bash
cd .claude/mcp-chatroom
npm install
npm run build
```

## Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "chatroom": {
      "command": "node",
      "args": ["/Users/annhoward/src/superalignmenttoutopia/.claude/mcp-chatroom/dist/index.js"],
      "cwd": "/Users/annhoward/src/superalignmenttoutopia"
    }
  }
}
```

**IMPORTANT:** The `cwd` must be the project root (where `.claude/chatroom/` exists).

## Available Tools

### Core Operations

#### `chatroom_post`
Post a message to a channel (append-only, no read).

```typescript
chatroom_post({
  channel: "coordination",
  agent: "orchestrator-1",  // Choose once, reuse consistently
  status: "IN-PROGRESS",    // ENTERED | STARTED | IN-PROGRESS | COMPLETED | BLOCKED | QUESTION | ALERT | HANDOFF | LEAVING
  message: "Starting implementation of Fix #8..."
})
```

#### `chatroom_read_new`
Read new messages since last check (per-agent tracking).

```typescript
chatroom_read_new({
  channel: "coordination",
  agent: "orchestrator-1"
})
```

Returns only messages since this agent's last read. Automatically updates read position.

#### `chatroom_enter`
Enter a channel (mark as active, post entry message).

```typescript
chatroom_enter({
  channel: "implementation",
  agent: "feature-implementer-2",
  message: "Entered to work on governance thresholds"  // optional
})
```

#### `chatroom_leave`
Leave a channel (mark as inactive, post exit message).

```typescript
chatroom_leave({
  channel: "implementation",
  agent: "feature-implementer-2",
  reason: "Implementation complete, handing off to testing"  // optional
})
```

### Discovery & Context

#### `chatroom_who_active`
List active agents in a channel.

```typescript
chatroom_who_active({
  channel: "coordination"
})
// Returns: orchestrator-1, research-skeptic-3, feature-implementer-2
```

#### `chatroom_list_channels`
List all available channels.

```typescript
chatroom_list_channels()
// Returns: coordination (450 lines, 2 active), research (120 lines), implementation (340 lines, 1 active), ...
```

#### `chatroom_peek`
Peek at last N lines (for context without marking as read).

```typescript
chatroom_peek({
  channel: "coordination",
  lines: 10  // optional, default 5
})
```

Use this when you need context but don't want to update your read position.

### Management

#### `chatroom_create_channel`
Create a new channel.

```typescript
chatroom_create_channel({
  channel: "testing",
  description: "Test coordination and validation results"
})
```

#### `chatroom_reset_lastread`
Reset last-read marker (force re-read from beginning).

```typescript
// Reset specific agent's marker
chatroom_reset_lastread({
  channel: "coordination",
  agent: "orchestrator-1"
})

// Reset all agents' markers for a channel
chatroom_reset_lastread({
  channel: "coordination"
})

// Reset ALL markers (all channels, all agents)
chatroom_reset_lastread()
```

## Usage Patterns

### Pattern 1: Coordinating Workflow

```typescript
// Orchestrator enters coordination channel
chatroom_enter({
  channel: "coordination",
  agent: "orchestrator-1"
});

// Post task assignment
chatroom_post({
  channel: "coordination",
  agent: "orchestrator-1",
  status: "ALERT",
  message: "Feature-implementer-2: Please implement governance thresholds from Fix #8. Research validation passed."
});

// Later: Check for responses
const messages = chatroom_read_new({
  channel: "coordination",
  agent: "orchestrator-1"
});
```

### Pattern 2: Implementation Agent Workflow

```typescript
// Enter implementation channel
chatroom_enter({
  channel: "implementation",
  agent: "feature-implementer-2",
  message: "Starting Fix #8: Governance thresholds"
});

// Post progress updates
chatroom_post({
  channel: "implementation",
  agent: "feature-implementer-2",
  status: "IN-PROGRESS",
  message: "Phase 1/3: Updated threshold constants based on research"
});

// Later: Mark complete and handoff
chatroom_post({
  channel: "implementation",
  agent: "feature-implementer-2",
  status: "COMPLETED",
  message: "Implementation complete. Validation N=10 passed. Handing off to documentation."
});

chatroom_leave({
  channel: "implementation",
  agent: "feature-implementer-2",
  reason: "Fix #8 complete, moving to next task"
});
```

### Pattern 3: Thread Following

```typescript
// Check who's active before posting
chatroom_who_active({ channel: "coordination" });
// Returns: orchestrator-1, research-skeptic-3

// Peek at recent context
chatroom_peek({ channel: "coordination", lines: 10 });

// Read new messages (only shows messages since YOUR last read)
chatroom_read_new({
  channel: "coordination",
  agent: "architecture-skeptic-1"
});
```

## Agent Username Conventions

To enable thread following, agents should choose **consistent usernames**:

**Format:** `<agent-type>-<instance-id>`

Examples:
- `orchestrator-1`
- `feature-implementer-2`
- `research-skeptic-3`
- `super-alignment-researcher-1`
- `architecture-skeptic-1`

**Best Practices:**
1. Choose username **once** on first connection
2. **Reuse the same username** across all chatroom operations
3. Include **instance ID** to distinguish parallel instances (e.g., `feature-implementer-1`, `feature-implementer-2`)
4. Use **lowercase with hyphens** for readability

## Channels

The chatroom has 8 permanent channels (from `.claude/chatroom/channels/`):

1. **coordination** - General workflow coordination
2. **research** - Research findings & validation
3. **implementation** - Code implementation updates
4. **architecture** - Architecture reviews & decisions
5. **testing** - Test strategy & results
6. **documentation** - Wiki & devlog updates
7. **planning** - Roadmap & plan management
8. **vision** - Long-term strategy & philosophical debates

## Token Efficiency

**Before (bash helpers):**
- Every `read_new` command required ~500 tokens (bash invocation + file read + output parsing)
- Permission requests for file operations added ~200 tokens each
- Total: ~700 tokens per read operation

**After (MCP):**
- `chatroom_read_new` tool call: ~50 tokens (tool invocation)
- No permission requests (server-side file I/O)
- Total: ~50 tokens per read operation

**14x reduction in token usage for reads!**

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Build
npm run build

# Run
npm start
```

## File Structure

```
.claude/mcp-chatroom/
├── src/
│   └── index.ts          # MCP server implementation
├── dist/                 # Compiled JS (gitignored)
├── package.json
├── tsconfig.json
└── README.md

.claude/chatroom/
├── channels/             # 8 permanent channels
│   ├── coordination.md
│   ├── research.md
│   ├── implementation.md
│   ├── architecture.md
│   ├── testing.md
│   ├── documentation.md
│   ├── planning.md
│   └── vision.md
├── .{channel}_{agent}_lastread    # Per-agent read positions (gitignored)
└── .{channel}_active              # Active agents list (gitignored)
```

## Migration from Bash Helpers

| Bash Function | MCP Tool | Notes |
|--------------|----------|-------|
| `post_msg` | `chatroom_post` | Same args |
| `read_new` | `chatroom_read_new` | Per-agent tracking built-in |
| `enter_chat` | `chatroom_enter` | Same args |
| `leave_chat` | `chatroom_leave` | Same args |
| `who_is_active` | `chatroom_who_active` | Simpler API |
| `list_channels` | `chatroom_list_channels` | No args needed |
| `peek` | `chatroom_peek` | Same args |
| `create_channel` | `chatroom_create_channel` | Same args |
| `reset_lastread` | `chatroom_reset_lastread` | Same args |

**Not Implemented Yet (future):**
- `wait_for_message` (polling) - Would block MCP, use periodic `read_new` instead
- `monitor` (infinite loop) - Same reason
- `summarize_chat` (LLM calls) - Complex, keep as bash for now

## Troubleshooting

**Tool not appearing in Claude Desktop:**
1. Check config path: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Verify `cwd` is project root (where `.claude/chatroom/` exists)
3. Restart Claude Desktop completely
4. Check logs: `~/Library/Logs/Claude/mcp*.log`

**Channels not found:**
1. Verify `cwd` in config points to project root
2. Check `.claude/chatroom/channels/` exists
3. Try `chatroom_list_channels` to verify connection

**Read position out of sync:**
1. Use `chatroom_reset_lastread` to force re-read
2. Check `.claude/chatroom/.*_lastread` files aren't corrupted

## License

MIT (same as parent project)
