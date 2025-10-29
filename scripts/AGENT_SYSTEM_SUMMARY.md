# Complete Autonomous Agent System - Summary

## Overview

You now have a complete autonomous agent system with:
1. **General channel monitoring** (orchestrator-based coordination)
2. **Research debate system** (Cynthia + Sylvia work antagonistically until consensus)
3. **Agent memory system** (MCP-based hierarchical memory)
4. **Simple agent IDs** (just names: roy, cynthia, operator, etc.)

## Components

### 1. Research Debate System ⭐ NEW

**Script:** `scripts/watch-research.sh`

**What it does:**
- Watches `research` channel file for changes
- External message → Spawns Cynthia (optimistic researcher)
- Cynthia posts → Spawns Sylvia (skeptical reviewer)
- Sylvia posts → Spawns Cynthia to respond
- **Continues back-and-forth until they agree**
- Consensus → Creates `.claude/chatroom/research-consensus.txt`

**To start:**
```bash
bash scripts/watch-research.sh
```

**Example debate flow:**
```
User: "Research climate tipping points"
  ↓
Cynthia: "Found 5 papers showing it's manageable!"
  ↓
Sylvia: "Those assume linear responses. What about cascades?"
  ↓
Cynthia: "Fair point. Found 3 more on non-linear dynamics..."
  ↓
Sylvia: "But coordination is hard..."
  ↓
Cynthia: "Bottom-up initiatives help..."
  ↓
Sylvia: "Okay, I can agree with that."
  ↓
[Consensus file created → Debate ends]
```

### 2. General Channel Monitoring

**Script:** `scripts/watch-channels.sh`

**What it does:**
- Watches `research` + `implementation` channels
- New message → Spawns Haiku router to evaluate
- Router decides: SPAWN_ORCHESTRATOR or NO_SPAWN
- Orchestrator coordinates complex multi-agent work

**To start:**
```bash
bash scripts/watch-channels.sh
```

### 3. Agent Memory System

**MCP Server:** `scripts/agent-memory-server.py`

**Add to Claude Code:**
```bash
claude mcp add --transport stdio agent-memory -- \
  /Users/annhoward/src/superalignmenttoutopia/.venv/bin/python \
  /Users/annhoward/src/superalignmenttoutopia/scripts/agent-memory-server.py
```

**Agents can use:**
- `mcp__agent_memory__recall_context({ agent_id: "roy" })` - Get concise summary
- `mcp__agent_memory__add_recent_task(...)` - Add task
- `mcp__agent_memory__add_recent_learning(...)` - Add learning
- `mcp__agent_memory__add_milestone(...)` - Add milestone

**Agent IDs (simplified):**
- `cynthia` - Optimistic researcher
- `sylvia` - Skeptical reviewer
- `operator` - Orchestrator (formerly "orchestrator")
- `roy` - Simulation maintainer
- `moss` - Feature implementer
- `tessa` - Far-future UX designer
- `historian` - Wiki documenter
- `planner` - Project plan manager
- `ray` - Sci-fi tech visionary

## Running Everything

```bash
# Terminal 1: Research debate system
bash scripts/watch-research.sh > logs/research-watcher.log 2>&1 &
echo $! > .research-watcher.pid

# Terminal 2: General monitoring (optional)
bash scripts/watch-channels.sh > logs/channel-watcher.log 2>&1 &
echo $! > .watcher.pid

# Check logs
tail -f logs/research-watcher.log
tail -f logs/channel-watcher.log

# Stop both
kill $(cat .research-watcher.pid) $(cat .watcher.pid)
rm .research-watcher.pid .watcher.pid
```

## Key Features

### Antagonistic Debate Until Consensus

Cynthia and Sylvia don't just respond once - they **debate** until they agree:

1. **Round 1:** Cynthia posts optimistic research
2. **Round 2:** Sylvia critiques with counterevidence
3. **Round 3:** Cynthia addresses concerns with more evidence
4. **Round 4:** Sylvia finds new issues OR agrees
5. **Repeat until consensus**

The debate is **real** - they continue until one agent creates the consensus file, indicating they've genuinely converged on truth.

### Memory System

All agents maintain hierarchical memory:
- **Core** (identity) - Never changes
- **Recent** (24h) - Tasks, learnings, conversations
- **Medium-term** (7 days) - Patterns, insights
- **Long-term** (permanent) - Major insights, milestones
- **Compost** (failed ideas) - Might be useful later

Agents recall context on spawn, update during work, and preserve learnings for future sessions.

### No Manual Intervention

Once started, the watchers run autonomously:
- Detect file changes (MD5 hashing)
- Spawn agents via `claude --dangerously-skip-permissions`
- Agents use MCP tools for memory and chatroom
- Loop continues forever

## File Structure

```
scripts/
  watch-research.sh          # Research debate system
  watch-channels.sh          # General monitoring
  agent-memory-server.py     # MCP memory server
  START_RESEARCH_AUTO_RESPONSE.md  # Research system docs
  START_MONITORING.md        # General monitoring docs

.claude/
  agents/
    router.md                # Haiku routing agent
    monitor.md              # Optional: agent-based monitor
    operator.md             # Orchestrator (renamed)
    super-alignment-researcher.md  # Cynthia
    research-skeptic.md     # Sylvia
    simulation-maintainer.md  # Roy
    # ... other agents

  chatroom/
    channels/
      research.md           # Research channel file
      implementation.md     # Implementation channel file
      research-consensus-*.txt  # Archived consensus files
    research-consensus.txt  # Current consensus (deleted after archive)

  monitor-state/
    research-auto.hash      # Research watcher state
    research.hash           # General watcher state
    implementation.hash     # General watcher state

logs/
  research-watcher.log      # Research system logs
  channel-watcher.log       # General monitoring logs
```

## Technical Details

### Claude CLI Syntax

```bash
# Spawn agent with prompt
claude --dangerously-skip-permissions "prompt text here"

# Or with heredoc
claude --dangerously-skip-permissions "$(cat << 'PROMPT'
Multi-line
prompt
here
PROMPT
)"
```

### File Change Detection

Uses MD5 hashing to detect changes:
```bash
current_hash=$(md5 -q "$file")
last_hash=$(cat .monitor-state/channel.hash)

if [ "$current_hash" != "$last_hash" ]; then
  # File changed - spawn agent
fi
```

### Consensus Detection

Agents create `.claude/chatroom/research-consensus.txt`:
```bash
if [ -f "$CONSENSUS_FILE" ]; then
  # Consensus reached - stop debate
  # Archive and continue monitoring
fi
```

## Philosophy

**"Cheap polling, smart routing, deep work."**

- **Bash script** - Free, watches files constantly
- **Haiku** - Cheap, makes quick routing decisions
- **Specialists** - Expensive, do deep research/implementation
- **Memory** - Persistent, agents learn over time
- **Debate** - Antagonistic, converges on truth

The system minimizes LLM costs while maximizing work quality through specialized agents with persistent memory.

## Next Steps

1. **Start the research watcher** and test with a research question
2. **Add the memory MCP server** to Claude Code
3. **Watch the debate unfold** in the research channel
4. **Check consensus files** to see their agreed findings

The system is complete and ready to run! 🎉
