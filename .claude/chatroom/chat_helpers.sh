#!/bin/bash
# Agent Chatroom Helper Functions
# Source this file in your agent scripts: source .claude/chatroom/chat_helpers.sh

# Color codes for pretty output (optional)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. POST A MESSAGE (append mode - doesn't read, just writes)
post_msg() {
  local channel="$1"
  local agent="$2"
  local status="$3"
  local message="$4"

  cat >> ".claude/chatroom/channels/${channel}.md" <<EOF

---
**${agent}** | $(date +"%Y-%m-%d %H:%M") | [${status}]

${message}
---
EOF

  echo -e "${GREEN}✓${NC} Posted to ${channel} [${status}]"
}

# 2. READ NEW MESSAGES (since last check)
# Usage: read_new <channel> [agent_name]
# If agent_name provided, tracks read position per-agent (recommended for multi-agent coordination)
# If agent_name omitted, uses global read position (legacy behavior)
read_new() {
  local channel="$1"
  local agent="${2:-}"

  # Per-agent or global lastread file
  local last_read_file
  if [ -n "$agent" ]; then
    last_read_file=".claude/chatroom/.${channel}_${agent}_lastread"
  else
    last_read_file=".claude/chatroom/.${channel}_lastread"
  fi

  # Get line count from last read (or 0 if first time)
  local last_line=$(cat "$last_read_file" 2>/dev/null || echo "0")

  # Get current line count
  local current_line=$(wc -l < ".claude/chatroom/channels/${channel}.md" 2>/dev/null || echo "0")

  # Show only new lines
  if [ "$current_line" -gt "$last_line" ]; then
    if [ -n "$agent" ]; then
      echo -e "${BLUE}━━━ New messages in ${channel} (for ${agent}) ━━━${NC}"
    else
      echo -e "${BLUE}━━━ New messages in ${channel} ━━━${NC}"
    fi
    tail -n +$((last_line + 1)) ".claude/chatroom/channels/${channel}.md"
    echo "$current_line" > "$last_read_file"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    return 0  # New messages found
  else
    return 1  # No new messages
  fi
}

# 3. POLL FOR MESSAGES (wait for new activity)
# Usage: wait_for_message <channel> [timeout] [agent_name]
wait_for_message() {
  local channel="$1"
  local timeout="${2:-300}"  # Default 5 minutes
  local agent="${3:-}"
  local elapsed=0

  echo -e "${YELLOW}⏳${NC} Waiting for new messages in ${channel} (timeout: ${timeout}s)..."
  while [ $elapsed -lt $timeout ]; do
    if read_new "$channel" "$agent"; then
      return 0  # New message found
    fi
    sleep 5
    elapsed=$((elapsed + 5))

    # Show progress every 30 seconds
    if [ $((elapsed % 30)) -eq 0 ]; then
      echo -e "${YELLOW}⏳${NC} Still waiting... (${elapsed}s elapsed)"
    fi
  done

  echo -e "${RED}✗${NC} Timeout: No new messages after ${timeout} seconds"
  return 1
}

# 4. COMBINED: Post and wait for response
# Usage: post_and_wait <channel> <agent> <status> <message> [timeout]
post_and_wait() {
  local channel="$1"
  local agent="$2"
  local status="$3"
  local message="$4"
  local timeout="${5:-300}"

  post_msg "$channel" "$agent" "$status" "$message"
  wait_for_message "$channel" "$timeout" "$agent"
}

# 5. CHECK FOR SPECIFIC TAG (in new messages only)
# Usage: has_tag <channel> <tag> [agent_name]
has_tag() {
  local channel="$1"
  local tag="$2"  # e.g., "ALERT", "QUESTION", "BLOCKED"
  local agent="${3:-}"

  if read_new "$channel" "$agent" | grep -q "\[${tag}\]"; then
    echo -e "${RED}⚠${NC} [$tag] found in ${channel}!"
    return 0
  fi
  return 1
}

# 6. GET LATEST MESSAGE (last N lines)
peek() {
  local channel="$1"
  local lines="${2:-5}"  # Default 5 lines

  echo -e "${BLUE}━━━ Last ${lines} lines from ${channel} ━━━${NC}"
  tail -n "$lines" ".claude/chatroom/channels/${channel}.md"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 7. MONITOR MULTIPLE CHANNELS (poll all, show new messages)
# Usage: monitor <agent_name> <channel1> [channel2] [channel3] ...
monitor() {
  local agent="$1"
  shift  # Remove agent from $@, leaving only channels
  local channels=("$@")

  echo -e "${BLUE}🔍 Monitoring channels as ${agent}: ${channels[*]}${NC}"

  while true; do
    for channel in "${channels[@]}"; do
      if read_new "$channel" "$agent"; then
        # New messages shown by read_new
        :
      fi
    done
    sleep 5
  done
}

# 8. CLEAR LAST-READ MARKERS (force re-read from beginning)
# Usage: reset_lastread [channel] [agent_name]
# - No args: Clear all last-read markers for all agents and channels
# - channel only: Clear all agents' markers for that channel
# - channel + agent: Clear specific agent's marker for that channel
reset_lastread() {
  local channel="${1:-}"
  local agent="${2:-}"

  if [ -z "$channel" ]; then
    # Clear all markers (all channels, all agents)
    rm -f .claude/chatroom/.*_lastread
    echo -e "${GREEN}✓${NC} Cleared all last-read markers"
  elif [ -z "$agent" ]; then
    # Clear all agents' markers for specific channel
    rm -f ".claude/chatroom/.${channel}_"*"_lastread"
    rm -f ".claude/chatroom/.${channel}_lastread"  # Also clear global marker
    echo -e "${GREEN}✓${NC} Cleared all last-read markers for ${channel}"
  else
    # Clear specific agent's marker for specific channel
    rm -f ".claude/chatroom/.${channel}_${agent}_lastread"
    echo -e "${GREEN}✓${NC} Cleared last-read marker for ${agent} in ${channel}"
  fi
}

# 9. CHECK IF CHANNEL EXISTS
channel_exists() {
  local channel="$1"

  if [ -f ".claude/chatroom/channels/${channel}.md" ]; then
    return 0
  else
    return 1
  fi
}

# 10. CREATE NEW CHANNEL (if doesn't exist)
create_channel() {
  local channel="$1"
  local description="$2"

  if channel_exists "$channel"; then
    echo -e "${YELLOW}⚠${NC} Channel ${channel} already exists"
    return 1
  fi

  cat > ".claude/chatroom/channels/${channel}.md" <<EOF
# ${channel^} Channel

${description}

---
EOF

  echo -e "${GREEN}✓${NC} Created channel: ${channel}"
}

# 11. ARCHIVE CHANNEL
archive_channel() {
  local channel="$1"
  local archive_dir=".claude/chatroom/archive/$(date +%Y-%m)"

  mkdir -p "$archive_dir"
  mv ".claude/chatroom/channels/${channel}.md" "$archive_dir/"
  rm -f ".claude/chatroom/.${channel}_lastread"

  echo -e "${GREEN}✓${NC} Archived ${channel} to ${archive_dir}"
}

# 12. ENTER CHAT (mark as active)
enter_chat() {
  local channel="$1"
  local agent="$2"

  # Add to active agents file
  local active_file=".claude/chatroom/.${channel}_active"

  # Remove if already in list (avoid duplicates)
  if [ -f "$active_file" ]; then
    grep -v "^${agent}$" "$active_file" > "${active_file}.tmp" 2>/dev/null || true
    mv "${active_file}.tmp" "$active_file"
  fi

  # Add agent to active list
  echo "$agent" >> "$active_file"

  # Post entry message
  post_msg "$channel" "$agent" "ENTERED" "Entered channel, now monitoring"

  echo -e "${GREEN}✓${NC} Entered ${channel} as ${agent}"
}

# 13. LEAVE CHAT (mark as inactive)
leave_chat() {
  local channel="$1"
  local agent="$2"
  local reason="${3:-Leaving channel}"

  # Remove from active agents file
  local active_file=".claude/chatroom/.${channel}_active"

  if [ -f "$active_file" ]; then
    grep -v "^${agent}$" "$active_file" > "${active_file}.tmp" 2>/dev/null || true
    mv "${active_file}.tmp" "$active_file"
  fi

  # Post exit message
  post_msg "$channel" "$agent" "LEAVING" "$reason"

  echo -e "${YELLOW}←${NC} Left ${channel}"
}

# 14. WHO IS ACTIVE (show current agents in channel)
who_is_active() {
  local channel="$1"
  local active_file=".claude/chatroom/.${channel}_active"

  if [ ! -f "$active_file" ] || [ ! -s "$active_file" ]; then
    echo -e "${YELLOW}ℹ${NC} No agents currently active in ${channel}"
    return 1
  fi

  echo -e "${BLUE}━━━ Active in ${channel} ━━━${NC}"
  while IFS= read -r agent; do
    echo -e "  ${GREEN}●${NC} $agent"
  done < "$active_file"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 15. GRACEFUL EXIT (cleanup on script exit)
cleanup_on_exit() {
  local channel="$1"
  local agent="$2"

  # Remove from active list without posting message
  local active_file=".claude/chatroom/.${channel}_active"

  if [ -f "$active_file" ]; then
    grep -v "^${agent}$" "$active_file" > "${active_file}.tmp" 2>/dev/null || true
    mv "${active_file}.tmp" "$active_file"
  fi
}

# Helper: Show available channels
list_channels() {
  echo -e "${BLUE}━━━ Available Channels ━━━${NC}"
  for f in .claude/chatroom/channels/*.md; do
    local name=$(basename "$f" .md)
    local lines=$(wc -l < "$f")

    # Check for active agents
    local active_file=".claude/chatroom/.${name}_active"
    local active_count=0
    if [ -f "$active_file" ]; then
      active_count=$(grep -c . "$active_file" 2>/dev/null || echo "0")
    fi

    if [ "$active_count" -gt 0 ]; then
      echo -e "  • $name ($lines lines, ${GREEN}${active_count} active${NC})"
    else
      echo "  • $name ($lines lines)"
    fi
  done
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 16. SUMMARIZE CHAT (for long message histories using LLM)
# Usage: summarize_chat <channel> <agent> [focus]
# focus examples: "action-items", "decisions", "blockers", "full-context"
summarize_chat() {
  local channel="$1"
  local agent="$2"
  local focus="${3:-full-context}"

  # Check for ANTHROPIC_API_KEY
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    # Try to load from .env
    if [ -f ".env" ]; then
      export $(grep -v '^#' .env | grep ANTHROPIC_API_KEY | xargs)
    fi
  fi

  if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}✗${NC} ANTHROPIC_API_KEY not found. Set it in .env or environment."
    return 1
  fi

  # Get messages since last read
  local last_read_file=".claude/chatroom/.${channel}_${agent}_lastread"
  local last_line=$(cat "$last_read_file" 2>/dev/null || echo "0")
  local current_line=$(wc -l < ".claude/chatroom/channels/${channel}.md" 2>/dev/null || echo "0")

  if [ "$current_line" -le "$last_line" ]; then
    echo -e "${YELLOW}ℹ${NC} No new messages to summarize"
    return 1
  fi

  # Extract messages
  local messages=$(tail -n +$((last_line + 1)) ".claude/chatroom/channels/${channel}.md")
  local message_count=$(echo "$messages" | wc -l)

  echo -e "${BLUE}📝${NC} Summarizing $message_count lines from ${channel}..."

  # Set focus-specific prompt
  local system_prompt
  case "$focus" in
    action-items)
      system_prompt="Summarize this chat transcript focusing on ACTION ITEMS and NEXT STEPS. List each agent's assigned tasks and deadlines."
      ;;
    decisions)
      system_prompt="Summarize this chat transcript focusing on DECISIONS MADE and AGREEMENTS. What was decided and who agreed to what?"
      ;;
    blockers)
      system_prompt="Summarize this chat transcript focusing on BLOCKERS and ISSUES. What problems were identified and what's preventing progress?"
      ;;
    full-context)
      system_prompt="Provide a comprehensive summary of this chat transcript. Include: key decisions, action items, blockers, and important context. Preserve agent names and timestamps where relevant."
      ;;
    *)
      system_prompt="$focus"  # Allow custom prompt
      ;;
  esac

  # Call Anthropic API using curl
  local response=$(curl -s https://api.anthropic.com/v1/messages \
    -H "content-type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "{
      \"model\": \"claude-3-5-haiku-20241022\",
      \"max_tokens\": 2000,
      \"system\": \"${system_prompt}\",
      \"messages\": [{
        \"role\": \"user\",
        \"content\": $(echo "$messages" | jq -Rs .)
      }]
    }")

  # Extract summary from response
  local summary=$(echo "$response" | jq -r '.content[0].text // empty')

  if [ -z "$summary" ]; then
    echo -e "${RED}✗${NC} Failed to get summary. API response:"
    echo "$response" | jq .
    return 1
  fi

  # Update last read marker
  echo "$current_line" > "$last_read_file"

  # Display summary
  echo -e "${BLUE}━━━ Summary of ${channel} (for ${agent}) ━━━${NC}"
  echo "$summary"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}ℹ${NC} Summarized $message_count lines. Use 'read_new' to see full messages."

  return 0
}

# 17. READ NEW MESSAGES WITH AUTO-SUMMARIZATION
# Usage: read_new_smart <channel> <agent> [max_lines] [focus]
# If messages exceed max_lines, automatically summarize instead
read_new_smart() {
  local channel="$1"
  local agent="$2"
  local max_lines="${3:-100}"  # Auto-summarize if >100 lines
  local focus="${4:-full-context}"

  # Check message count
  local last_read_file=".claude/chatroom/.${channel}_${agent}_lastread"
  local last_line=$(cat "$last_read_file" 2>/dev/null || echo "0")
  local current_line=$(wc -l < ".claude/chatroom/channels/${channel}.md" 2>/dev/null || echo "0")
  local new_lines=$((current_line - last_line))

  if [ "$new_lines" -le 0 ]; then
    return 1  # No new messages
  elif [ "$new_lines" -le "$max_lines" ]; then
    # Few enough messages - show full
    read_new "$channel" "$agent"
  else
    # Too many messages - summarize
    echo -e "${YELLOW}⚠${NC} ${new_lines} new lines (>${max_lines}). Auto-summarizing..."
    summarize_chat "$channel" "$agent" "$focus"
  fi
}

# Export all functions
export -f post_msg read_new wait_for_message post_and_wait has_tag peek monitor reset_lastread channel_exists create_channel archive_channel list_channels enter_chat leave_chat who_is_active cleanup_on_exit summarize_chat read_new_smart
