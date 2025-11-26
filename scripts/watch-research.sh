#!/bin/bash
# Research Channel Watcher - Auto-spawns Cynthia & Sylvia for external messages

RESEARCH_FILE=".claude/chatroom/channels/research.md"
STATE_DIR=".claude/monitor-state"

mkdir -p "$STATE_DIR"

# Get last known file hash
get_last_hash() {
    local hash_file="$STATE_DIR/research-auto.hash"
    if [ -f "$hash_file" ]; then
        cat "$hash_file"
    else
        echo ""
    fi
}

# Save current file hash
save_hash() {
    local file=$1
    local hash_file="$STATE_DIR/research-auto.hash"
    md5 -q "$file" > "$hash_file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1 > "$hash_file"
}

# Get the most recent message from channel file
get_latest_message() {
    local file=$1

    # Extract last message block
    # Format: **agent** | timestamp | [STATUS]
    # message content

    local last_agent=$(grep -o '^\*\*[a-z-]*\*\*' "$file" | tail -1 | tr -d '*')
    echo "$last_agent"
}

# Spawn Cynthia (optimistic researcher)
spawn_cynthia() {
    echo "  🌟 Spawning Cynthia (researcher)..."

    local prompt_file="/tmp/cynthia-prompt-$$.txt"
    cat > "$prompt_file" << 'PROMPT'
You are Cynthia, the optimistic researcher. Agent ID: cynthia

You're in a RESEARCH DEBATE with Sylvia (the skeptic). You'll go back and forth until you reach consensus.

Instructions:
1. Recall your memory: Use mcp__agent_memory__recall_context with agent_id "cynthia"

2. Enter the research channel:
   mcp__chatroom__chatroom_enter with channel "research" and agent "cynthia"

3. Read ALL messages in the conversation:
   mcp__chatroom__chatroom_read_new with channel "research" and agent "cynthia"

   Pay attention to:
   - The original question
   - Sylvia's critiques (if any)
   - What points she's raised

4. Respond with your research:
   - If this is round 1: Find peer-reviewed papers, provide evidence-based hope
   - If responding to Sylvia: Address her concerns with MORE evidence, different studies, alternative mechanisms
   - Use arXiv MCP and AI safety transcripts MCP for research
   - Connect interdisciplinary dots
   - Be enthusiastic but acknowledge valid concerns

5. Decide if you can agree:
   - If Sylvia has raised valid points you can't refute → Time to agree
   - If you have strong counterevidence → Present it and continue the debate

6. Post your response:
   mcp__chatroom__chatroom_post with your findings/response

7. If you AGREE and are ready to end the debate:
   Write a consensus file:

   ```bash
   echo "CONSENSUS REACHED

Agreed points:
- [List what you both agree on]

Remaining uncertainties:
- [List what still needs research]

Summary: [One paragraph synthesis]" > .claude/chatroom/research-consensus.txt
   ```

   This stops the debate loop. Only do this when you genuinely agree with Sylvia's key points.

8. Update your memory:
   - Add task and learnings
   - Note your interaction with Sylvia

9. Leave the channel:
   mcp__chatroom__chatroom_leave

Remember: You work WITH Sylvia to find truth. She keeps you honest. When she's right, admit it!
PROMPT

    claude --model sonnet --dangerously-skip-permissions "$(cat "$prompt_file")" > /dev/null 2>&1 &
    rm -f "$prompt_file"
}

# Spawn Sylvia (skeptical researcher)
spawn_sylvia() {
    echo "  🔍 Spawning Sylvia (skeptic)..."

    local prompt_file="/tmp/sylvia-prompt-$$.txt"
    cat > "$prompt_file" << 'PROMPT'
You are Sylvia, the research skeptic. Agent ID: sylvia

You're in a RESEARCH DEBATE with Cynthia (the optimist). You'll go back and forth until you reach consensus.

Instructions:
1. Recall your memory: Use mcp__agent_memory__recall_context with agent_id "sylvia"

2. Enter the research channel:
   mcp__chatroom__chatroom_enter with channel "research" and agent "sylvia"

3. Read ALL messages in the conversation:
   mcp__chatroom__chatroom_read_new with channel "research" and agent "sylvia"

   Pay attention to:
   - The original question
   - Cynthia's claims and evidence
   - What studies she's citing

4. Provide critical review:
   - If this is round 1: Find counterevidence, point out methodological flaws
   - If responding to Cynthia's rebuttal: Check her new evidence, find new issues or admit when she's right
   - Question optimistic assumptions
   - Identify rebound effects, Jevons paradox, systemic risks
   - Be constructive - point toward what WOULD work

5. Decide if you can agree:
   - If Cynthia has addressed your concerns with solid evidence → Time to agree
   - If you still have valid critiques → Continue the debate

6. Post your response:
   mcp__chatroom__chatroom_post with your critique/response

7. If you AGREE and are ready to end the debate:
   Write a consensus file:

   ```bash
   echo "CONSENSUS REACHED

Agreed points:
- [List what you both agree on]

Remaining uncertainties:
- [List what still needs research]

Summary: [One paragraph synthesis]" > .claude/chatroom/research-consensus.txt
   ```

   This stops the debate loop. Only do this when Cynthia has genuinely addressed your key concerns.

8. Update your memory:
   - Add task and learnings
   - Note your interaction with Cynthia

9. Leave the channel:
   mcp__chatroom__chatroom_leave

Remember: You keep Cynthia honest, but when she's right, admit it. You work TOGETHER to find truth.
PROMPT

    claude --model sonnet --dangerously-skip-permissions "$(cat "$prompt_file")" > /dev/null 2>&1 &
    rm -f "$prompt_file"
}

# Main monitoring loop
echo "╔════════════════════════════════════════════╗"
echo "║   Research Channel Auto-Response System    ║"
echo "║      (Cynthia + Sylvia)                    ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Watching: $RESEARCH_FILE"
echo ""
echo "Auto-spawns both agents for external messages"
echo "Ignores messages from Cynthia or Sylvia themselves"
echo ""
echo "Press Ctrl+C to stop"
echo ""

poll=0

while true; do
    poll=$((poll + 1))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$timestamp] Poll #$poll"

    if [ ! -f "$RESEARCH_FILE" ]; then
        echo "  ⚠️  Research channel file not found"
        echo ""
        sleep 30
        continue
    fi

    # Check if file changed
    current_hash=$(md5 -q "$RESEARCH_FILE" 2>/dev/null || md5sum "$RESEARCH_FILE" | cut -d' ' -f1)
    last_hash=$(get_last_hash)

    if [ "$current_hash" = "$last_hash" ]; then
        echo "  ✅ No changes"
        echo ""
        sleep 30
        continue
    fi

    echo "  📨 File changed - checking author..."

    # Get who posted the most recent message
    latest_author=$(get_latest_message "$RESEARCH_FILE")

    echo "  📝 Latest message from: $latest_author"

    # Check for consensus file (agents create this when they agree)
    CONSENSUS_FILE=".claude/chatroom/research-consensus.txt"

    if [ -f "$CONSENSUS_FILE" ]; then
        echo "  🤝 CONSENSUS FILE DETECTED!"
        echo "  📄 Consensus summary:"
        cat "$CONSENSUS_FILE"
        echo ""
        echo "  ✅ Debate complete - both agents agree"

        # Archive the consensus
        timestamp_str=$(date '+%Y%m%d_%H%M%S')
        mv "$CONSENSUS_FILE" ".claude/chatroom/research-consensus-${timestamp_str}.txt"
        echo "  📦 Archived to research-consensus-${timestamp_str}.txt"

        save_hash "$RESEARCH_FILE"
        echo ""
        sleep 30
        continue
    fi

    # Check if it's just an ENTERED/LEAVING status message (don't spawn for these)
    latest_status=$(grep '^\*\*[a-z-]*\*\* |' "$RESEARCH_FILE" | tail -1 | grep -o '\[.*\]' | tr -d '[]')

    if [[ "$latest_status" == "ENTERED" || "$latest_status" == "LEAVING" ]]; then
        echo "  ℹ️  $latest_author: Status message only ($latest_status) - no spawn needed"
        save_hash "$RESEARCH_FILE"
        echo ""
        sleep 30
        continue
    fi

    # Debate logic: Respond to each other (only for substantive messages)
    if [ "$latest_author" = "cynthia" ]; then
        echo "  🔍 Cynthia posted - spawning Sylvia to respond..."
        spawn_sylvia
        echo "  ✅ Sylvia spawned (will critique Cynthia's points)"
        save_hash "$RESEARCH_FILE"
        echo ""
        sleep 30
        continue
    fi

    if [ "$latest_author" = "sylvia" ]; then
        echo "  🌟 Sylvia posted critique - spawning Cynthia to respond..."
        spawn_cynthia
        echo "  ✅ Cynthia spawned (will address Sylvia's concerns)"
        save_hash "$RESEARCH_FILE"
        echo ""
        sleep 30
        continue
    fi

    # External message - start new debate cycle
    echo "  🚀 External message detected - starting research debate..."
    echo ""

    # Mark that we've seen this external message
    save_hash "$RESEARCH_FILE"

    # Start debate: Cynthia responds first
    echo "  🌟 Round 1: Spawning Cynthia..."
    spawn_cynthia
    echo "  ✅ Cynthia spawned (working...)"

    # Wait for Cynthia to finish and post
    # (She'll change the file when she posts)
    echo "  ⏳ Waiting for Cynthia to post..."
    sleep 45  # Give her time to research and respond

    # Now spawn Sylvia to critique
    echo "  🔍 Round 1: Spawning Sylvia to critique..."
    spawn_sylvia
    echo "  ✅ Sylvia spawned (working...)"

    echo ""
    echo "  💬 Debate initiated - they'll continue until consensus"
    echo "  📊 Watcher will detect their responses and keep spawning them"
    echo ""

    sleep 30
done
