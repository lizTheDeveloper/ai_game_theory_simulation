#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRANSCRIPTS_DIR="$SCRIPT_DIR/transcripts"
CHANNEL_URL="https://www.youtube.com/@aiexplained-official"
CHANNEL_NAME="AI Explained"
CHANNEL_FOCUS="AI research paper summaries and analysis"
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
