#!/bin/bash

# Auto-Sync YouTube Channels
# Reads channels.txt and automatically syncs all listed channels
# Creates folder structure and sync scripts as needed
# Usage: bash auto-sync.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$(dirname "$SCRIPT_DIR")"
CHANNELS_FILE="$SCRIPT_DIR/channels.txt"
LOG_FILE="$SCRIPT_DIR/auto-sync.log"

echo "========================================" | tee -a "$LOG_FILE"
echo "YouTube Auto-Sync System" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if channels.txt exists
if [ ! -f "$CHANNELS_FILE" ]; then
  echo "❌ Error: channels.txt not found" | tee -a "$LOG_FILE"
  echo "   Create it with:" | tee -a "$LOG_FILE"
  echo "   echo 'https://www.youtube.com/@channel | Display Name | Focus' > channels.txt" | tee -a "$LOG_FILE"
  exit 1
fi

# Function to generate folder name from URL
generate_folder_name() {
  local URL=$1
  # Extract channel handle/ID from URL and sanitize
  echo "$URL" | sed -E 's|https?://||' | sed 's|www.||' | sed 's|youtube.com/||' | sed 's|/@||' | sed 's|/c/||' | sed 's|/user/||' | sed 's|/videos||' | sed 's|/||g' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g'
}

# Parse channels.txt and process each channel
CHANNEL_COUNT=0
NEW_CHANNELS=0
SYNCED_CHANNELS=0

while IFS='|' read -r URL DISPLAY_NAME FOCUS_DESC; do
  # Skip empty lines and comments
  [[ -z "$URL" || "$URL" =~ ^[[:space:]]*# ]] && continue

  # Trim whitespace
  URL=$(echo "$URL" | xargs)
  DISPLAY_NAME=$(echo "$DISPLAY_NAME" | xargs)
  FOCUS_DESC=$(echo "$FOCUS_DESC" | xargs)

  # Skip if any field is empty
  [[ -z "$URL" || -z "$DISPLAY_NAME" || -z "$FOCUS_DESC" ]] && continue

  CHANNEL_COUNT=$((CHANNEL_COUNT + 1))

  echo "─────────────────────────────────────" | tee -a "$LOG_FILE"
  echo "📺 Processing: $DISPLAY_NAME" | tee -a "$LOG_FILE"
  echo "   URL: $URL" | tee -a "$LOG_FILE"
  echo "─────────────────────────────────────" | tee -a "$LOG_FILE"

  # Generate folder name
  FOLDER_NAME=$(generate_folder_name "$URL")
  CHANNEL_DIR="$RESEARCH_DIR/$FOLDER_NAME"

  echo "   Folder: $FOLDER_NAME" | tee -a "$LOG_FILE"

  # Check if channel folder exists
  if [ ! -d "$CHANNEL_DIR" ]; then
    echo "   🆕 New channel detected - setting up..." | tee -a "$LOG_FILE"
    NEW_CHANNELS=$((NEW_CHANNELS + 1))

    # Create folder structure
    mkdir -p "$CHANNEL_DIR/transcripts"
    echo "   ✓ Created folder structure" | tee -a "$LOG_FILE"

    # Create sync script
    cat > "$CHANNEL_DIR/sync-channel.sh" << 'SYNCSCRIPT'
#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRANSCRIPTS_DIR="$SCRIPT_DIR/transcripts"
CHANNEL_URL="__CHANNEL_URL__"
CHANNEL_NAME="__CHANNEL_NAME__"
CHANNEL_FOCUS="__CHANNEL_FOCUS__"
LOG_FILE="$SCRIPT_DIR/sync.log"

echo "=== $CHANNEL_NAME Sync ===" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
mkdir -p "$TRANSCRIPTS_DIR"

# Fetch metadata
echo "📋 Fetching channel metadata..." | tee -a "$LOG_FILE"
TEMP_META="/tmp/$(basename $SCRIPT_DIR)_meta.json"
yt-dlp --flat-playlist --dump-single-json "$CHANNEL_URL/videos" > "$TEMP_META" 2>&1

TOTAL_VIDEOS=$(cat "$TEMP_META" | jq '.entries | length')
echo "Found $TOTAL_VIDEOS videos" | tee -a "$LOG_FILE"

# Generate VIDEO_LIST.md
cat > "$SCRIPT_DIR/VIDEO_LIST.md" << EOF
# ${CHANNEL_NAME} - Video Catalog
**Channel:** [${CHANNEL_NAME}](${CHANNEL_URL})
**Focus:** ${CHANNEL_FOCUS}
**Last Updated:** $(date +%Y-%m-%d)
**Total Videos:** ${TOTAL_VIDEOS}
---
## Video List
EOF

cat "$TEMP_META" | jq -r '.entries[] | "### \(.title)\n- **URL:** https://www.youtube.com/watch?v=\(.id)\n- **Duration:** \((.duration // 0) / 60 | floor)m \((.duration // 0) % 60)s\n- **Views:** \(if .view_count then (.view_count | tostring | tonumber | . / 1000 | floor | tostring + "K") else "N/A" end)\n- **Video ID:** \(.id)\n\n"' >> "$SCRIPT_DIR/VIDEO_LIST.md"

echo "✓ Video catalog updated" | tee -a "$LOG_FILE"

# Check for new transcripts
cat "$TEMP_META" | jq -r '.entries[].id' > /tmp/channel_ids.txt
if [ -d "$TRANSCRIPTS_DIR" ] && [ "$(ls -A "$TRANSCRIPTS_DIR"/*.vtt 2>/dev/null)" ]; then
  find "$TRANSCRIPTS_DIR" -name "*.vtt" | sed -E 's/.*\[([a-zA-Z0-9_-]{11})\].*/\1/' | sort -u > /tmp/existing_ids.txt 2>/dev/null || touch /tmp/existing_ids.txt
else
  touch /tmp/existing_ids.txt
fi

NEW_VIDEOS=$(comm -23 <(sort /tmp/channel_ids.txt) <(sort /tmp/existing_ids.txt))
NEW_COUNT=$(echo "$NEW_VIDEOS" | grep -v '^$' | wc -l | xargs)

if [ "$NEW_COUNT" -eq 0 ]; then
  echo "✓ No new videos" | tee -a "$LOG_FILE"
else
  echo "📥 Downloading $NEW_COUNT new transcripts..." | tee -a "$LOG_FILE"
  COUNTER=0
  for VIDEO_ID in $NEW_VIDEOS; do
    [ -z "$VIDEO_ID" ] && continue
    COUNTER=$((COUNTER + 1))
    TITLE=$(cat "$TEMP_META" | jq -r ".entries[] | select(.id==\"$VIDEO_ID\") | .title")
    echo "  [$COUNTER/$NEW_COUNT] $TITLE" | tee -a "$LOG_FILE"
    cd "$TRANSCRIPTS_DIR"
    yt-dlp --skip-download --write-auto-sub --sub-lang en --sub-format vtt --output "%(title)s [%(id)s].%(ext)s" "https://www.youtube.com/watch?v=$VIDEO_ID" 2>&1 | grep -v "WARNING" | tee -a "$LOG_FILE" || true
    if [ $COUNTER -lt $NEW_COUNT ]; then
      DELAY=$((8 + RANDOM % 5))
      echo "  💤 ${DELAY}s..." | tee -a "$LOG_FILE"
      sleep $DELAY
    fi
  done
fi

TRANSCRIPT_COUNT=$(find "$TRANSCRIPTS_DIR" -name "*.vtt" | wc -l | xargs)
echo "✓ Total transcripts: $TRANSCRIPT_COUNT" | tee -a "$LOG_FILE"
rm -f "$TEMP_META" /tmp/channel_ids.txt /tmp/existing_ids.txt
echo "Completed: $(date)" | tee -a "$LOG_FILE"
SYNCSCRIPT

    # Replace placeholders
    sed -i '' "s|__CHANNEL_URL__|$URL|g" "$CHANNEL_DIR/sync-channel.sh"
    sed -i '' "s|__CHANNEL_NAME__|$DISPLAY_NAME|g" "$CHANNEL_DIR/sync-channel.sh"
    sed -i '' "s|__CHANNEL_FOCUS__|$FOCUS_DESC|g" "$CHANNEL_DIR/sync-channel.sh"
    chmod +x "$CHANNEL_DIR/sync-channel.sh"

    echo "   ✓ Created sync script" | tee -a "$LOG_FILE"

    # Create README
    cat > "$CHANNEL_DIR/README.md" << READMEEOF
# $DISPLAY_NAME Channel Archive

**Channel:** [$DISPLAY_NAME]($URL)
**Focus:** $FOCUS_DESC
**Last Synced:** $(date +%Y-%m-%d)

## Usage

Sync new videos:
\`\`\`bash
cd research/$FOLDER_NAME
bash sync-channel.sh
\`\`\`

View catalog: \`VIDEO_LIST.md\`
READMEEOF

    echo "   ✓ Created README" | tee -a "$LOG_FILE"
  fi

  # Run sync
  echo "   🔄 Running sync..." | tee -a "$LOG_FILE"
  cd "$CHANNEL_DIR"
  if bash sync-channel.sh 2>&1 | tee -a "$LOG_FILE"; then
    SYNCED_CHANNELS=$((SYNCED_CHANNELS + 1))
    echo "   ✓ Sync completed" | tee -a "$LOG_FILE"
  else
    echo "   ⚠️ Sync had errors (check log)" | tee -a "$LOG_FILE"
  fi

  echo "" | tee -a "$LOG_FILE"

done < "$CHANNELS_FILE"

# Summary
echo "========================================" | tee -a "$LOG_FILE"
echo "Summary" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Channels in list: $CHANNEL_COUNT" | tee -a "$LOG_FILE"
echo "New channels setup: $NEW_CHANNELS" | tee -a "$LOG_FILE"
echo "Channels synced: $SYNCED_CHANNELS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_TRANSCRIPTS=$(find "$RESEARCH_DIR"/*/transcripts -name "*.vtt" 2>/dev/null | wc -l | xargs)
echo "📊 Total transcripts: $TOTAL_TRANSCRIPTS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

echo ""
echo "✨ Auto-sync complete!"
echo "   - $NEW_CHANNELS new channels added"
echo "   - $SYNCED_CHANNELS channels synced"
echo "   - Check $LOG_FILE for details"
