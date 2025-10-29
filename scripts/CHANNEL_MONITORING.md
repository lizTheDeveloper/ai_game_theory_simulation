# Channel Monitoring System

Autonomous agent spawning based on chatroom activity.

## Architecture

```
┌─────────────────────────────────────────────────┐
│ 1. channel-monitor.ts (long-running process)    │
│    - Polls research & implementation channels    │
│    - Detects when work needs attention           │
│    - Posts orchestrator request to coordination  │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│ 2. Orchestrator spawns (via Task tool)          │
│    - Recalls memory context                      │
│    - Reads channel messages                      │
│    - Determines what needs to be done            │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│ 3. Orchestrator spawns specialists              │
│    - Cynthia (research)                          │
│    - Roy (simulation maintenance)                │
│    - Moss (feature implementation)               │
│    - Sylvia (research skeptic)                   │
│    - etc.                                        │
└─────────────────────────────────────────────────┘
```

## Monitored Channels

- **research** - Research requests, paper reviews, parameter validation
- **implementation** - Feature work, bug fixes, code reviews

## How It Works

### 1. Monitor Polls Channels

Every 30 seconds, the monitor checks:
- Are there new messages in research/implementation?
- Is orchestrator already active in that channel?
- Do the messages indicate work needs attention?

### 2. Detection Logic

Attention needed if messages contain:
- **Explicit requests**: "Can someone...", "Need help...", "Orchestrator..."
- **Work status**: STARTED, BLOCKED, ALERT, QUESTION
- **No orchestrator active**: Work posted but no coordinator present

### 3. Orchestrator Spawning

When work detected, orchestrator is spawned with instructions to:

1. **Recall memory**: `mcp__agent_memory__recall_context({ agent_id: "orchestrator" })`
2. **Enter channel**: `mcp__chatroom__chatroom_enter({ channel, agent: "orchestrator" })`
3. **Read messages**: `mcp__chatroom__chatroom_read_new({ channel, agent: "orchestrator" })`
4. **Analyze work**: Determine what needs to be done
5. **Spawn specialists**: Use Task tool to delegate to experts
6. **Coordinate**: Track progress, unblock issues
7. **Complete**: Post summary, update memory, leave channel

## Running the Monitor

### Option 1: Foreground (for testing)

```bash
npx tsx scripts/channel-monitor.ts
```

Press Ctrl+C to stop.

### Option 2: Background (for production)

```bash
# Start in background
npx tsx scripts/channel-monitor.ts > logs/channel-monitor.log 2>&1 &

# Save PID for later shutdown
echo $! > .channel-monitor.pid

# Check status
tail -f logs/channel-monitor.log

# Stop monitor
kill $(cat .channel-monitor.pid)
```

### Option 3: npm script

Add to `package.json`:

```json
{
  "scripts": {
    "monitor": "tsx scripts/channel-monitor.ts",
    "monitor:bg": "tsx scripts/channel-monitor.ts > logs/channel-monitor.log 2>&1 &"
  }
}
```

Then:
```bash
npm run monitor
```

## Configuration

Edit `scripts/channel-monitor.ts`:

```typescript
// Channels to watch
const CHANNELS_TO_MONITOR = ['research', 'implementation'];

// How often to check (milliseconds)
const POLL_INTERVAL_MS = 30000; // 30 seconds

// Voice notifications on/off
// Controlled by .claude/silent-mode file
```

## Voice Notifications

The monitor uses voice notifications (if not in silent mode):

- **"Channel monitor started"** - When monitor begins
- **"Orchestrator spawning for [channel]"** - When work detected
- **"Orchestrator spawned successfully"** - After spawn
- **"Channel monitor stopped"** - On shutdown

Toggle silent mode:
```bash
bash scripts/toggle-silent-mode.sh
```

## Thundering Herd Protection

The monitor prevents duplicate orchestrator spawns:

1. Before spawning, checks `chatroom_who_active(channel)`
2. If orchestrator is already active, skips spawn
3. Only spawns when channel has work AND no orchestrator present

## Example Flow

```
1. User posts to #research:
   "Can someone research climate tipping points? Need 2024 papers."

2. Monitor detects (30s later):
   ✓ New message in research channel
   ✓ Contains "Can someone" (explicit request)
   ✓ No orchestrator currently active
   → Spawn orchestrator

3. Orchestrator spawns:
   - Recalls memory (sees past research coordination)
   - Reads research channel message
   - Determines: "This needs Cynthia (researcher)"
   - Spawns Cynthia with Task tool
   - Posts to coordination: "Cynthia researching climate tipping points"

4. Cynthia works:
   - Recalls her memory (sees past climate research)
   - Searches AI safety transcripts for tipping points
   - Searches arXiv for 2024 papers
   - Posts findings to research channel
   - Updates her memory with learnings

5. Orchestrator completes:
   - Sees Cynthia posted results
   - Posts summary to research channel
   - Adds milestone to memory
   - Leaves research channel

6. Monitor continues polling...
```

## Debugging

Enable verbose output:

```typescript
// In channel-monitor.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Raw MCP response:', result);
}
```

Check monitor logs:
```bash
tail -f logs/channel-monitor.log
```

Check chatroom audit:
```bash
cat .claude/chatroom/channels/research.md
```

## Manual Orchestrator Spawn

To manually spawn the orchestrator (bypassing monitor):

```typescript
// In Claude Code
Task({
  subagent_type: "orchestrator",
  description: "Coordinate research work",
  prompt: `
    You are the orchestrator. Agent ID: orchestrator

    1. Recall memory: await mcp__agent_memory__recall_context({ agent_id: "orchestrator" })
    2. Enter research channel and coordinate work
    3. Spawn specialists as needed
  `
});
```

## Future Enhancements

- [ ] Pattern learning: Remember what messages trigger which agents
- [ ] Priority queuing: High-priority requests spawn immediately
- [ ] Agent memory integration: Remember who worked on similar tasks
- [ ] Slack/Discord integration: Monitor external channels
- [ ] Web dashboard: Show monitor status and agent activity

## Limitations

**Current Implementation:**

The monitor script currently **logs spawn requests** but doesn't actually spawn agents automatically. This is because:

1. The `Task` tool is only available inside Claude Code's context
2. We can't programmatically invoke Task from external Node.js scripts

**Workarounds:**

1. **Semi-automatic**: Monitor posts to coordination channel, user manually spawns orchestrator
2. **Claude Code CLI**: Future: Use `claude` CLI to invoke agents programmatically
3. **MCP Agent Spawning**: Future: MCP tool for agent spawning

**For now, the recommended flow is:**

1. Run monitor to detect work
2. Monitor posts to coordination channel: "Orchestrator needed in #research"
3. User manually spawns orchestrator with Task tool
4. Orchestrator delegates to specialists

This gives you monitoring + notification while keeping spawning under your control.

## See Also

- `.claude/agents/orchestrator.md` - Orchestrator agent definition
- `.claude/agents/memories/README.md` - Agent memory system
- `.claude/chatroom/README.md` - Chatroom protocol
- `scripts/safeSpawnChannelMonitor.ts` - Spawn helper utilities
