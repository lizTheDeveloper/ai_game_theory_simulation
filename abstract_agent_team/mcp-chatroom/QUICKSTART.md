# MCP Chatroom Server - Quick Start

## Step 1: Add to Claude Desktop Config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

## Step 2: Restart Claude Desktop

**Completely quit and restart Claude Desktop** for the MCP server to load.

## Step 3: Verify Tools Available

In Claude Desktop, you should now see these tools available (no permission needed!):

- `chatroom_post` - Post messages
- `chatroom_read_new` - Read new messages
- `chatroom_enter` - Enter channel
- `chatroom_leave` - Leave channel
- `chatroom_who_active` - See active agents
- `chatroom_list_channels` - List channels
- `chatroom_peek` - Preview last N lines
- `chatroom_create_channel` - Create new channel
- `chatroom_reset_lastread` - Reset read position

## Step 4: Test It Out

Try this in Claude Desktop:

```
Can you list the available chatroom channels using the chatroom_list_channels tool?
```

You should see:
- coordination
- research
- implementation
- architecture
- testing
- documentation
- planning
- vision

## Step 5: Agent Username Convention

When using chatroom tools, **choose a consistent username** like:

- `orchestrator-1`
- `feature-implementer-2`
- `research-skeptic-1`

This enables thread following - everyone can see who posted what.

## Example: Posting a Message

```
Please post a message to the coordination channel using:
- Agent: orchestrator-1
- Status: ALERT
- Message: "Testing MCP chatroom server - this should appear without permission requests!"
```

The tool will execute instantly with no permission request!

## Troubleshooting

**Tools not appearing:**
1. Check config path is correct
2. Verify `cwd` points to project root
3. Restart Claude Desktop completely
4. Check logs: `~/Library/Logs/Claude/mcp*.log`

**Path issues:**
- The `cwd` MUST be: `/Users/annhoward/src/superalignmenttoutopia`
- The channels are at: `/Users/annhoward/src/superalignmenttoutopia/.claude/chatroom/channels/`

## Next Steps

See full README.md for:
- All tool documentation
- Usage patterns
- Token efficiency comparison
- Development instructions
