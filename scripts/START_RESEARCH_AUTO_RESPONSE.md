# Research Channel Auto-Response System

## Overview

Automatically spawns **Cynthia (optimistic researcher)** and **Sylvia (skeptical reviewer)** whenever an external message appears in the research channel.

They respond to the same request, providing both optimistic research and critical review.

## How It Works

```
1. Bash script watches research channel file
   ↓
2. External message detected → Spawn Cynthia
   ↓
3. Cynthia researches and posts findings
   ↓
4. Cynthia's post detected → Spawn Sylvia
   ↓
5. Sylvia critiques and posts concerns
   ↓
6. Sylvia's post detected → Spawn Cynthia
   ↓
7. Cynthia addresses concerns with more evidence
   ↓
8. Repeat back-and-forth until...
   ↓
9. One of them writes consensus file → Debate ends
```

**The Debate Loop:**
They work **antagonistically** until they agree. Each critique spawns a response. The loop continues until one agent creates `.claude/chatroom/research-consensus.txt` indicating they've reached consensus.

## Start Watching

### Foreground (testing)

```bash
bash scripts/watch-research.sh
```

### Background (production)

```bash
bash scripts/watch-research.sh > logs/research-watcher.log 2>&1 &
echo $! > .research-watcher.pid

# Check logs
tail -f logs/research-watcher.log

# Stop
kill $(cat .research-watcher.pid)
```

## Example Flow: Antagonistic Debate to Consensus

```
User posts to #research:
"Can someone research climate tipping points? Need 2024 papers."

[Round 1]
  🌟 Cynthia spawned
  Cynthia: "Great news! Found 5 papers showing tipping points are manageable with intervention..."

[Watcher detects Cynthia's post]
  🔍 Sylvia spawned
  Sylvia: "Hold on - paper X assumes linear responses. What about cascading effects? Jevons paradox?"

[Round 2]
  🌟 Cynthia spawned (responding to Sylvia)
  Cynthia: "Fair point on cascades. Found 3 more papers on non-linear dynamics. BUT intervention windows exist..."

[Watcher detects Cynthia's response]
  🔍 Sylvia spawned
  Sylvia: "Those intervention windows assume coordination that doesn't exist. Political economy problems..."

[Round 3]
  🌟 Cynthia spawned
  Cynthia: "You're right about coordination challenges. But bottom-up initiatives show promise. See: X, Y, Z..."

[Watcher detects Cynthia's response]
  🔍 Sylvia spawned
  Sylvia: "Okay, that's more realistic. Bottom-up + selective intervention could work. I agree."
  [Sylvia writes consensus file]

[Watcher detects consensus file]
  🤝 CONSENSUS REACHED!
  📄 Summary: "Tipping points are serious but manageable with bottom-up initiatives + selective intervention..."
  ✅ Debate complete

[Ready for next external message...]
```

## Their Dynamic

**Cynthia (Voice: Samantha)**
- Optimistic realist
- Finds evidence-based hope
- "This tech could solve everything!"
- Searches for possibility space

**Sylvia (Voice: Daniel)**
- Cynical but constructive
- Finds counterevidence
- "...assuming zero rebound effects. See: Jevons paradox."
- Keeps Cynthia honest

**Together:** They work antagonistically until they converge on truth. The debate isn't scripted - it continues until they genuinely agree.

## Consensus Mechanism

**How they signal agreement:**

Either agent can create `.claude/chatroom/research-consensus.txt` when they're ready to end the debate:

```bash
echo "CONSENSUS REACHED

Agreed points:
- Tipping points are serious threats
- Bottom-up initiatives show promise
- Selective intervention windows exist
- Coordination remains a challenge

Remaining uncertainties:
- Political economy constraints
- Timeline variability across regions

Summary: Climate tipping points are serious but potentially manageable through
combined bottom-up initiatives and selective intervention, though political
coordination remains challenging." > .claude/chatroom/research-consensus.txt
```

**What happens:**
1. Watcher detects consensus file
2. Displays summary in logs
3. Archives to `research-consensus-TIMESTAMP.txt`
4. Stops spawning agents for this debate
5. Ready for next external message

**Only create consensus when:**
- They've genuinely addressed each other's concerns
- Both have found evidence they can accept
- Remaining disagreements are minor or acknowledged as uncertainties

## Running Both Watchers

You can run multiple watchers simultaneously:

```bash
# Terminal 1: General coordination (orchestrator-based)
bash scripts/watch-channels.sh > logs/channel-watcher.log 2>&1 &

# Terminal 2: Research auto-response (Cynthia + Sylvia)
bash scripts/watch-research.sh > logs/research-watcher.log 2>&1 &
```

Or in background:
```bash
# Start both
bash scripts/watch-channels.sh > logs/channel-watcher.log 2>&1 &
echo $! > .watcher.pid

bash scripts/watch-research.sh > logs/research-watcher.log 2>&1 &
echo $! > .research-watcher.pid

# Stop both
kill $(cat .watcher.pid) $(cat .research-watcher.pid)
rm .watcher.pid .research-watcher.pid
```

## State Management

State stored in `.claude/monitor-state/research-auto.hash`

To reset (force check all messages):
```bash
rm .claude/monitor-state/research-auto.hash
```

## Difference from Orchestrator Flow

**Orchestrator flow (watch-channels.sh):**
- Haiku router decides what to do
- Can spawn operator to coordinate complex work
- More flexible routing

**Research auto-response (watch-research.sh):**
- Always spawns Cynthia + Sylvia
- No routing decision needed
- Focused on research balance

Use whichever fits your workflow!

## Stopping

```bash
# If foreground
Press Ctrl+C

# If background
kill $(cat .research-watcher.pid)
rm .research-watcher.pid
```

## Files

- `scripts/watch-research.sh` - Main watcher
- `.claude/chatroom/channels/research.md` - Research channel
- `.claude/monitor-state/research-auto.hash` - State tracking
- `logs/research-watcher.log` - Logs (if background)
