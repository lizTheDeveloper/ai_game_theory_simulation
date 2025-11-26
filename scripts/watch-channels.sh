#!/bin/bash
# Channel Watcher - Detects file changes and spawns Haiku router

RESEARCH_FILE=".claude/chatroom/channels/research.md"
IMPLEMENTATION_FILE=".claude/chatroom/channels/implementation.md"
STATE_DIR=".claude/monitor-state"

mkdir -p "$STATE_DIR"

# Get last known file hash
get_last_hash() {
    local channel=$1
    local hash_file="$STATE_DIR/${channel}.hash"

    if [ -f "$hash_file" ]; then
        cat "$hash_file"
    else
        echo ""
    fi
}

# Save current file hash
save_hash() {
    local channel=$1
    local file=$2
    local hash_file="$STATE_DIR/${channel}.hash"

    md5 -q "$file" > "$hash_file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1 > "$hash_file"
}

# Check if file changed
file_changed() {
    local channel=$1
    local file=$2

    if [ ! -f "$file" ]; then
        return 1  # File doesn't exist
    fi

    local current_hash=$(md5 -q "$file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1)
    local last_hash=$(get_last_hash "$channel")

    if [ "$current_hash" != "$last_hash" ]; then
        return 0  # Changed
    else
        return 1  # Not changed
    fi
}

# Spawn Haiku router to evaluate and maybe hand off to orchestrator
spawn_router() {
    local channel=$1
    local file=$2

    echo "🎯 Spawning Haiku router to evaluate #$channel"

    # Use claude CLI to spawn Haiku with dangerously-skip-permissions
    claude --model sonnet --dangerously-skip-permissions << EOF
You are a routing agent. Read the channel file and decide if the orchestrator should be spawned.

Channel: $channel
File: $file

Instructions:
1. Read the channel file: $(cat "$file")

2. Look at the MOST RECENT message (at the bottom of the file)

3. Decide: Should we spawn the orchestrator?

   YES if:
   - Explicit request: "can someone", "need help", "orchestrator"
   - Work status: QUESTION, STARTED, BLOCKED, ALERT
   - Actual work to coordinate

   NO if:
   - Completion notification: "Done", "Finished", "Completed"
   - Just chatter: "thanks", "ok", "got it"
   - Status update from agent already working
   - Status: COMPLETED

4. If YES: Respond with exactly: SPAWN_ORCHESTRATOR
   If NO: Respond with exactly: NO_SPAWN

Do NOT explain. Just output one of those two phrases.
EOF
}

# Main monitoring loop
echo "╔════════════════════════════════════════════╗"
echo "║    Channel Watcher (Bash + File Watch)    ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Watching:"
echo "  - $RESEARCH_FILE"
echo "  - $IMPLEMENTATION_FILE"
echo ""
echo "Press Ctrl+C to stop"
echo ""

poll=0

while true; do
    poll=$((poll + 1))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$timestamp] Poll #$poll"

    # Check research channel
    if file_changed "research" "$RESEARCH_FILE"; then
        echo "  📨 research: File changed"

        # Spawn Haiku router
        decision=$(spawn_router "research" "$RESEARCH_FILE")

        if echo "$decision" | grep -q "SPAWN_ORCHESTRATOR"; then
            echo "  ✅ research: Spawning orchestrator..."

            # Spawn orchestrator with claude CLI
            claude --model sonnet --dangerously-skip-permissions << EOF
You are the orchestrator. Agent ID: operator

New work detected in #research channel.

Instructions:
1. Recall your memory: Use the MCP tool mcp__agent_memory__recall_context with agent_id "operator"

2. Read the research channel file directly:
   File: $RESEARCH_FILE
   Or use MCP: mcp__chatroom__chatroom_enter and mcp__chatroom__chatroom_read_new

3. Analyze what needs to be done

4. Spawn appropriate specialist(s):
   - Research: cynthia (super-alignment-researcher)
   - Skeptical review: sylvia (research-skeptic)
   - Implementation: roy (simulation-maintainer) or moss (feature-implementer)
   - UI: tessa (far-future-ux-designer)
   - Docs: historian (wiki-documentation-updater)

5. Coordinate their work

6. Post completion summary to channel

7. Update your memory and leave channel
EOF

            echo "  ✅ research: Orchestrator spawned"
        else
            echo "  ℹ️  research: No spawn needed (completion/chatter)"
        fi

        save_hash "research" "$RESEARCH_FILE"
    else
        echo "  ✅ research: No changes"
    fi

    # Check implementation channel
    if file_changed "implementation" "$IMPLEMENTATION_FILE"; then
        echo "  📨 implementation: File changed"

        # Spawn Haiku router
        decision=$(spawn_router "implementation" "$IMPLEMENTATION_FILE")

        if echo "$decision" | grep -q "SPAWN_ORCHESTRATOR"; then
            echo "  ✅ implementation: Spawning orchestrator..."

            # Spawn orchestrator
            claude --model sonnet --dangerously-skip-permissions << EOF
You are the orchestrator. Agent ID: operator

New work detected in #implementation channel.

Instructions:
1. Recall your memory: Use MCP tool mcp__agent_memory__recall_context with agent_id "operator"

2. Read the implementation channel file:
   File: $IMPLEMENTATION_FILE
   Or use MCP chatroom tools

3. Analyze what needs to be done

4. Spawn appropriate specialist(s):
   - Simulation bugs: roy (simulation-maintainer)
   - New features: moss (feature-implementer)
   - UI work: tessa (far-future-ux-designer)
   - Architecture review: architecture-skeptic

5. Coordinate their work

6. Post completion summary

7. Update memory and leave channel
EOF

            echo "  ✅ implementation: Orchestrator spawned"
        else
            echo "  ℹ️  implementation: No spawn needed (completion/chatter)"
        fi

        save_hash "implementation" "$IMPLEMENTATION_FILE"
    else
        echo "  ✅ implementation: No changes"
    fi

    echo ""
    sleep 30
done
