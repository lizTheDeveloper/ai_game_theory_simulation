#!/bin/bash

# Master YouTube Channel Sync Script
# Syncs all tracked AI safety/research YouTube channels
# Usage: bash sync-all-channels.sh [--channel=name]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/sync-master.log"

# Parse command line arguments
SPECIFIC_CHANNEL=""
if [ $# -gt 0 ]; then
  case "$1" in
    --channel=*)
      SPECIFIC_CHANNEL="${1#*=}"
      ;;
    *)
      echo "Usage: bash sync-all-channels.sh [--channel=species-agi|robert-miles]"
      exit 1
      ;;
  esac
fi

echo "======================================" | tee -a "$LOG_FILE"
echo "YouTube Channels Master Sync" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Define channels
declare -A CHANNELS
CHANNELS["species-agi"]="$RESEARCH_DIR/species-agi-youtube"
CHANNELS["robert-miles"]="$RESEARCH_DIR/robert-miles-ai-safety"

# Track statistics
TOTAL_NEW=0
TOTAL_CHANNELS=0
SYNC_RESULTS=""

# Function to sync a single channel
sync_channel() {
  local CHANNEL_KEY=$1
  local CHANNEL_DIR=$2
  local CHANNEL_DISPLAY=$3

  echo "─────────────────────────────────────" | tee -a "$LOG_FILE"
  echo "📺 Syncing: $CHANNEL_DISPLAY" | tee -a "$LOG_FILE"
  echo "─────────────────────────────────────" | tee -a "$LOG_FILE"

  if [ ! -d "$CHANNEL_DIR" ]; then
    echo "⚠️  Channel directory not found: $CHANNEL_DIR" | tee -a "$LOG_FILE"
    return 1
  fi

  if [ ! -f "$CHANNEL_DIR/sync-channel.sh" ]; then
    echo "⚠️  Sync script not found: $CHANNEL_DIR/sync-channel.sh" | tee -a "$LOG_FILE"
    return 1
  fi

  cd "$CHANNEL_DIR"

  # Run channel sync and capture output
  SYNC_OUTPUT=$(bash sync-channel.sh 2>&1)
  echo "$SYNC_OUTPUT" | tee -a "$LOG_FILE"

  # Extract new video count from output
  NEW_COUNT=$(echo "$SYNC_OUTPUT" | grep -o "New transcripts downloaded: [0-9]*" | grep -o "[0-9]*" || echo "0")
  TOTAL_NEW=$((TOTAL_NEW + NEW_COUNT))

  # Get total transcript count
  TRANSCRIPT_COUNT=$(find transcripts -name "*.vtt" 2>/dev/null | wc -l | xargs)

  SYNC_RESULTS="${SYNC_RESULTS}  ✓ ${CHANNEL_DISPLAY}: ${NEW_COUNT} new, ${TRANSCRIPT_COUNT} total\n"
  TOTAL_CHANNELS=$((TOTAL_CHANNELS + 1))

  echo "" | tee -a "$LOG_FILE"
  cd "$SCRIPT_DIR"
}

# Sync channels
if [ -n "$SPECIFIC_CHANNEL" ]; then
  # Sync only specified channel
  case "$SPECIFIC_CHANNEL" in
    species-agi)
      sync_channel "species-agi" "${CHANNELS[species-agi]}" "AI Species"
      ;;
    robert-miles)
      sync_channel "robert-miles" "${CHANNELS[robert-miles]}" "Robert Miles AI"
      ;;
    *)
      echo "❌ Unknown channel: $SPECIFIC_CHANNEL" | tee -a "$LOG_FILE"
      echo "Available channels: species-agi, robert-miles" | tee -a "$LOG_FILE"
      exit 1
      ;;
  esac
else
  # Sync all channels
  sync_channel "species-agi" "${CHANNELS[species-agi]}" "AI Species"
  sync_channel "robert-miles" "${CHANNELS[robert-miles]}" "Robert Miles AI"
fi

# Summary
echo "======================================" | tee -a "$LOG_FILE"
echo "Summary" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo -e "$SYNC_RESULTS" | tee -a "$LOG_FILE"
echo "Channels synced: $TOTAL_CHANNELS" | tee -a "$LOG_FILE"
echo "Total new transcripts: $TOTAL_NEW" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Update README statistics
TOTAL_TRANSCRIPTS=$(find "$RESEARCH_DIR"/*/transcripts -name "*.vtt" 2>/dev/null | wc -l | xargs)
echo "📊 Total transcripts across all channels: $TOTAL_TRANSCRIPTS" | tee -a "$LOG_FILE"

echo ""
echo "✨ Master sync complete!"
echo "   - Check $LOG_FILE for full details"
echo "   - Review individual channel logs for errors"
echo "   - Run 'find research/ -name \"*.vtt\" | wc -l' to verify total count"
