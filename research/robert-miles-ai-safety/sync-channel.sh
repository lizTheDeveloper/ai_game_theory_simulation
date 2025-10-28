#!/bin/bash

# Robert Miles AI Safety Channel Sync Script
# Syncs transcripts and video metadata from Robert Miles AI channel
# Usage: bash sync-channel.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRANSCRIPTS_DIR="$SCRIPT_DIR/transcripts"
CHANNEL_URL="https://www.youtube.com/c/robertmilesai/videos"
CHANNEL_NAME="Robert Miles AI"
CHANNEL_FOCUS="Technical AI safety, alignment problems, research communication"
LOG_FILE="$SCRIPT_DIR/sync.log"

echo "=== Robert Miles AI Safety Channel Sync ===" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Create transcripts directory if it doesn't exist
mkdir -p "$TRANSCRIPTS_DIR"

# Step 1: Update video listing
echo "📋 Fetching channel metadata..." | tee -a "$LOG_FILE"
yt-dlp --flat-playlist --dump-single-json "$CHANNEL_URL" > /tmp/robertmiles_metadata.json 2>&1

# Count videos
TOTAL_VIDEOS=$(cat /tmp/robertmiles_metadata.json | jq '.entries | length')
echo "Found $TOTAL_VIDEOS videos on channel" | tee -a "$LOG_FILE"

# Step 2: Auto-generate VIDEO_LIST.md
echo "📝 Generating video catalog..." | tee -a "$LOG_FILE"

cat > "$SCRIPT_DIR/VIDEO_LIST.md" << EOF
# ${CHANNEL_NAME} - Video Catalog

**Channel:** [${CHANNEL_NAME}](${CHANNEL_URL})
**Focus:** ${CHANNEL_FOCUS}
**Last Updated:** $(date +%Y-%m-%d)
**Total Videos:** ${TOTAL_VIDEOS}

---

## Video List

EOF

# Append video details with better formatting
cat /tmp/robertmiles_metadata.json | jq -r '
  .entries[] |
  "### \(.title)\n- **URL:** https://www.youtube.com/watch?v=\(.id)\n- **Duration:** \((.duration // 0) / 60 | floor)m \((.duration // 0) % 60)s\n- **Views:** \(if .view_count then (.view_count | tostring | tonumber | . / 1000 | floor | tostring + "K") else "N/A" end)\n- **Video ID:** \(.id)\n\n"
' >> "$SCRIPT_DIR/VIDEO_LIST.md"

# Add usage notes footer
cat >> "$SCRIPT_DIR/VIDEO_LIST.md" << 'EOF'

---

## Usage Notes

To download any video:
```bash
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"
```

To download with subtitles:
```bash
yt-dlp --write-sub --sub-lang en "https://www.youtube.com/watch?v=VIDEO_ID"
```

To get just the transcript:
```bash
yt-dlp --skip-download --write-sub --sub-lang en "https://www.youtube.com/watch?v=VIDEO_ID"
```
EOF

echo "✓ Video catalog updated" | tee -a "$LOG_FILE"

# Step 3: Check for new videos by comparing with existing transcripts
echo "" | tee -a "$LOG_FILE"
echo "🔍 Checking for new transcripts..." | tee -a "$LOG_FILE"

# Get list of video IDs from channel
cat /tmp/robertmiles_metadata.json | jq -r '.entries[].id' > /tmp/channel_video_ids.txt

# Get list of video IDs we already have transcripts for
# Extract video IDs from filenames like "Title [VideoID].en.vtt"
if [ -d "$TRANSCRIPTS_DIR" ]; then
  find "$TRANSCRIPTS_DIR" -name "*.vtt" | sed -E 's/.*\[([a-zA-Z0-9_-]{11})\].*/\1/' | sort -u > /tmp/existing_video_ids.txt 2>/dev/null || touch /tmp/existing_video_ids.txt
else
  touch /tmp/existing_video_ids.txt
fi

# Find new videos (videos on channel but not in our transcripts)
NEW_VIDEOS=$(comm -23 <(sort /tmp/channel_video_ids.txt) <(sort /tmp/existing_video_ids.txt))
NEW_COUNT=$(echo "$NEW_VIDEOS" | grep -v '^$' | wc -l | xargs)

if [ "$NEW_COUNT" -eq 0 ]; then
  echo "✓ No new videos found - all transcripts up to date" | tee -a "$LOG_FILE"
else
  echo "📥 Found $NEW_COUNT new video(s) to download" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"

  # Download new transcripts ONE AT A TIME with delays
  COUNTER=0
  for VIDEO_ID in $NEW_VIDEOS; do
    if [ -z "$VIDEO_ID" ]; then
      continue
    fi

    COUNTER=$((COUNTER + 1))
    VIDEO_URL="https://www.youtube.com/watch?v=$VIDEO_ID"

    # Get video title for better logging
    TITLE=$(cat /tmp/robertmiles_metadata.json | jq -r ".entries[] | select(.id==\"$VIDEO_ID\") | .title")

    echo "  [$COUNTER/$NEW_COUNT] Downloading transcript for: $TITLE" | tee -a "$LOG_FILE"
    echo "  Video ID: $VIDEO_ID" | tee -a "$LOG_FILE"

    # Download with conservative rate limiting
    cd "$TRANSCRIPTS_DIR"
    yt-dlp \
      --skip-download \
      --write-auto-sub \
      --sub-lang en \
      --sub-format vtt \
      --output "%(title)s [%(id)s].%(ext)s" \
      "$VIDEO_URL" 2>&1 | grep -v "WARNING" | tee -a "$LOG_FILE" || echo "  ⚠️ Failed to download transcript (may not be available)" | tee -a "$LOG_FILE"

    # CONSERVATIVE DELAY: 8-12 seconds between each video
    if [ $COUNTER -lt $NEW_COUNT ]; then
      DELAY=$((8 + RANDOM % 5))  # Random delay between 8-12 seconds
      echo "  💤 Waiting ${DELAY}s before next download..." | tee -a "$LOG_FILE"
      sleep $DELAY
    fi
    echo "" | tee -a "$LOG_FILE"
  done

  echo "✓ Downloaded $NEW_COUNT new transcript(s)" | tee -a "$LOG_FILE"
fi

# Step 4: Summary
echo "" | tee -a "$LOG_FILE"
echo "=== Summary ===" | tee -a "$LOG_FILE"
echo "Total videos on channel: $TOTAL_VIDEOS" | tee -a "$LOG_FILE"
echo "New transcripts downloaded: $NEW_COUNT" | tee -a "$LOG_FILE"
TRANSCRIPT_COUNT=$(find "$TRANSCRIPTS_DIR" -name "*.vtt" | wc -l | xargs)
echo "Total transcripts stored: $TRANSCRIPT_COUNT" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "=======================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Cleanup temp files
rm -f /tmp/robertmiles_metadata.json /tmp/channel_video_ids.txt /tmp/existing_video_ids.txt

echo "✨ Sync complete! Check VIDEO_LIST.md for updated catalog."
