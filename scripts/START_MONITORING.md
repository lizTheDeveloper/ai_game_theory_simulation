# Starting the Autonomous Agent System

## Overview

The monitoring system watches `research` and `implementation` channel files for changes, then uses Haiku to decide if the orchestrator should be spawned.

## Architecture

```
1. Bash script watches channel files (30s polling)
   ↓
2. File changed → Spawn Haiku router via `claude` CLI
   ↓
3. Haiku reads file and decides: SPAWN_ORCHESTRATOR or NO_SPAWN
   ↓
4. If spawn → Use `claude` CLI to spawn orchestrator
   ↓
5. Orchestrator reads channel, spawns specialists, coordinates work
```

## Prerequisites

1. **`claude` CLI installed** and in PATH
2. **MCP servers running** (agent-memory)
3. **Channel files exist**:
   - `.claude/chatroom/channels/research.md`
   - `.claude/chatroom/channels/implementation.md`

## Start Monitoring

### Foreground (for testing)

```bash
bash scripts/watch-channels.sh
```

Press Ctrl+C to stop.

### Background (for production)

```bash
# Start in background
bash scripts/watch-channels.sh > logs/channel-watcher.log 2>&1 &

# Save PID
echo $! > .watcher.pid

# Check logs
tail -f logs/channel-watcher.log

# Stop watcher
kill $(cat .watcher.pid)
rm .watcher.pid
```

## How It Works

### 1. File Watching

Script uses MD5 hashes to detect changes:
- Checks every 30 seconds
- Compares current hash to saved hash
- If different → file changed

### 2. Haiku Router Decision

When file changes, spawns Haiku with:

```bash
claude --dangerously-skip-permissions << EOF
You are a routing agent. Read this channel and decide:
Should we spawn the orchestrator?

[Channel content here]

Output EXACTLY:
- SPAWN_ORCHESTRATOR (if work needs coordination)
- NO_SPAWN (if just completion/chatter)
EOF
```

Haiku looks for:
- **SPAWN**: Explicit requests, QUESTION/BLOCKED/ALERT status, work to coordinate
- **NO SPAWN**: Completions ("Done!"), chatter ("thanks"), status updates from working agents

### 3. Orchestrator Spawning

If Haiku says SPAWN_ORCHESTRATOR:

```bash
claude --dangerously-skip-permissions << EOF
You are the orchestrator. Agent ID: operator

Work detected in #${channel}.

1. Recall memory via MCP
2. Read channel file: ${channel_file}
3. Analyze work needed
4. Spawn specialists (cynthia/roy/moss/tessa/etc)
5. Coordinate
6. Post summary
7. Update memory
EOF
```

Orchestrator then:
- Reads the channel file (or uses MCP chatroom tools)
- Spawns appropriate specialists using Task tool
- Coordinates their work
- Updates its memory when done

## Example Flow

```
[10:30:00] Poll #1
  ✅ research: No changes
  ✅ implementation: No changes

[10:30:30] Poll #2
  📨 research: File changed
  🎯 Spawning Haiku router to evaluate #research
  ✅ research: Spawning orchestrator...
  ✅ research: Orchestrator spawned
  ✅ implementation: No changes

[10:31:00] Poll #3
  ✅ research: No changes (hash saved)
  ✅ implementation: No changes

[Orchestrator working in background...]
[Orchestrator spawns Cynthia to handle research...]
[Cynthia does research and posts results...]
[Orchestrator posts completion...]

[10:32:00] Poll #4
  📨 research: File changed (Cynthia's response)
  🎯 Spawning Haiku router...
  ℹ️  research: No spawn needed (completion/chatter)
  ✅ implementation: No changes
```

## Claude CLI Syntax

**Note:** The exact `claude` CLI syntax may vary. Adjust as needed:

```bash
# Option 1: Stdin
claude --dangerously-skip-permissions << EOF
<prompt>
EOF

# Option 2: Argument
claude --dangerously-skip-permissions "<prompt>"

# Option 3: File
echo "<prompt>" > /tmp/prompt.txt
claude --dangerously-skip-permissions -f /tmp/prompt.txt
```

**Check your claude CLI docs** for exact syntax!

## Monitoring State

The watcher stores state in `.claude/monitor-state/`:
- `research.hash` - Last known MD5 of research channel
- `implementation.hash` - Last known MD5 of implementation channel

To reset (force re-check all messages):
```bash
rm -rf .claude/monitor-state
```

## Stopping Monitoring

### If running in foreground
Press Ctrl+C

### If running in background
```bash
kill $(cat .watcher.pid)
rm .watcher.pid
```

## Troubleshooting

### "claude: command not found"
- Ensure `claude` CLI is installed and in PATH
- Try: `which claude`

### Haiku not spawning
- Check `claude` CLI has permissions
- Verify `--dangerously-skip-permissions` flag is supported
- Check logs: `tail -f logs/channel-watcher.log`

### Orchestrator not spawning
- Check Haiku's decision output
- Ensure Haiku is outputting exactly "SPAWN_ORCHESTRATOR"
- May need to adjust grep pattern in bash script

### File changes not detected
- Check MD5 command is available: `which md5` or `which md5sum`
- Verify channel files exist and are writable
- Try resetting state: `rm -rf .claude/monitor-state`

## Manual Override

To manually spawn orchestrator (bypassing watcher):

```bash
claude --dangerously-skip-permissions << EOF
You are the orchestrator. Agent ID: operator
Coordinate work in #research channel.
EOF
```

## Files

- `scripts/watch-channels.sh` - Main watcher script
- `.claude/chatroom/channels/research.md` - Research channel file
- `.claude/chatroom/channels/implementation.md` - Implementation channel file
- `.claude/monitor-state/*.hash` - State tracking files
- `logs/channel-watcher.log` - Watcher logs (if running in background)

## Philosophy

The watcher is **dumb but vigilant**:
- Just watches files for changes
- Hands off to Haiku for smart decisions
- Haiku hands off to orchestrator for coordination
- Orchestrator hands off to specialists for work

Simple, reliable, autonomous.
