#!/bin/bash

# Add New YouTube Channel Script
# Automates the entire process of adding a new channel to the research archive
# Usage: bash add-channel.sh <channel-url> <folder-name> <display-name> <focus-description>

set -e

if [ $# -lt 4 ]; then
  echo "Usage: bash add-channel.sh <channel-url> <folder-name> <display-name> <focus-description>"
  echo ""
  echo "Example:"
  echo "  bash add-channel.sh \\"
  echo "    'https://www.youtube.com/@aiexplained-official' \\"
  echo "    'ai-explained-official' \\"
  echo "    'AI Explained' \\"
  echo "    'AI research paper summaries and analysis'"
  echo ""
  exit 1
fi

CHANNEL_URL="$1"
FOLDER_NAME="$2"
DISPLAY_NAME="$3"
FOCUS_DESC="$4"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$(dirname "$SCRIPT_DIR")"
NEW_CHANNEL_DIR="$RESEARCH_DIR/$FOLDER_NAME"

echo "========================================"
echo "Adding New YouTube Channel"
echo "========================================"
echo "Channel URL: $CHANNEL_URL"
echo "Folder Name: $FOLDER_NAME"
echo "Display Name: $DISPLAY_NAME"
echo "Focus: $FOCUS_DESC"
echo ""

# Step 1: Check if channel already exists
if [ -d "$NEW_CHANNEL_DIR" ]; then
  echo "❌ Error: Channel folder already exists: $NEW_CHANNEL_DIR"
  echo "   Remove it first or choose a different folder name."
  exit 1
fi

# Step 2: Verify channel is accessible
echo "📡 Verifying channel accessibility..."
if ! yt-dlp --flat-playlist --print "%(title)s" "$CHANNEL_URL/videos" >/dev/null 2>&1; then
  echo "❌ Error: Cannot access channel. Check the URL and try again."
  exit 1
fi

# Get video count
VIDEO_COUNT=$(yt-dlp --flat-playlist --print "%(title)s" "$CHANNEL_URL/videos" 2>&1 | wc -l | xargs)
echo "✓ Channel accessible: $VIDEO_COUNT videos found"
echo ""

# Estimate time
ESTIMATED_MINUTES=$((VIDEO_COUNT * 10 / 60))
echo "⏱️  Estimated initial sync time: ~$ESTIMATED_MINUTES minutes (with rate limiting)"
echo ""

# Step 3: Create folder structure
echo "📁 Creating folder structure..."
mkdir -p "$NEW_CHANNEL_DIR/transcripts"
echo "✓ Created: $NEW_CHANNEL_DIR/transcripts"

# Step 4: Create sync script
echo "📝 Generating sync script..."

cat > "$NEW_CHANNEL_DIR/sync-channel.sh" << 'SYNCSCRIPT'
#!/bin/bash

# [CHANNEL_NAME] YouTube Channel Sync Script
# Syncs transcripts and video metadata from [CHANNEL_NAME] channel
# Usage: bash sync-channel.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRANSCRIPTS_DIR="$SCRIPT_DIR/transcripts"
CHANNEL_URL="[CHANNEL_URL_PLACEHOLDER]"
CHANNEL_NAME="[CHANNEL_NAME_PLACEHOLDER]"
CHANNEL_FOCUS="[CHANNEL_FOCUS_PLACEHOLDER]"
LOG_FILE="$SCRIPT_DIR/sync.log"

echo "=== [CHANNEL_NAME] Sync ===" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Create transcripts directory if it doesn't exist
mkdir -p "$TRANSCRIPTS_DIR"

# Step 1: Update video listing
echo "📋 Fetching channel metadata..." | tee -a "$LOG_FILE"
TEMP_METADATA="/tmp/[FOLDER_NAME_PLACEHOLDER]_metadata.json"
yt-dlp --flat-playlist --dump-single-json "$CHANNEL_URL/videos" > "$TEMP_METADATA" 2>&1

# Count videos
TOTAL_VIDEOS=$(cat "$TEMP_METADATA" | jq '.entries | length')
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
cat "$TEMP_METADATA" | jq -r '
  .entries[] |
  "### \(.title)\n- **URL:** https://www.youtube.com/watch?v=\(.id)\n- **Duration:** \((.duration // 0) / 60 | floor)m \((.duration // 0) % 60)s\n- **Views:** \(if .view_count then (.view_count | tostring | tonumber | . / 1000 | floor | tostring + "K") else "N/A" end)\n- **Video ID:** \(.id)\n\n"
' >> "$SCRIPT_DIR/VIDEO_LIST.md"

# Add usage notes footer
cat >> "$SCRIPT_DIR/VIDEO_LIST.md" << 'FOOTER'

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
FOOTER

echo "✓ Video catalog updated" | tee -a "$LOG_FILE"

# Step 3: Check for new videos by comparing with existing transcripts
echo "" | tee -a "$LOG_FILE"
echo "🔍 Checking for new transcripts..." | tee -a "$LOG_FILE"

# Get list of video IDs from channel
cat "$TEMP_METADATA" | jq -r '.entries[].id' > /tmp/channel_video_ids.txt

# Get list of video IDs we already have transcripts for
# Extract video IDs from filenames like "Title [VideoID].en.vtt"
if [ -d "$TRANSCRIPTS_DIR" ] && [ "$(ls -A "$TRANSCRIPTS_DIR"/*.vtt 2>/dev/null)" ]; then
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
    TITLE=$(cat "$TEMP_METADATA" | jq -r ".entries[] | select(.id==\"$VIDEO_ID\") | .title")

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
rm -f "$TEMP_METADATA" /tmp/channel_video_ids.txt /tmp/existing_video_ids.txt

echo "✨ Sync complete! Check VIDEO_LIST.md for updated catalog."
SYNCSCRIPT

# Replace placeholders in sync script
sed -i '' "s|\[CHANNEL_URL_PLACEHOLDER\]|$CHANNEL_URL|g" "$NEW_CHANNEL_DIR/sync-channel.sh"
sed -i '' "s|\[CHANNEL_NAME_PLACEHOLDER\]|$DISPLAY_NAME|g" "$NEW_CHANNEL_DIR/sync-channel.sh"
sed -i '' "s|\[CHANNEL_FOCUS_PLACEHOLDER\]|$FOCUS_DESC|g" "$NEW_CHANNEL_DIR/sync-channel.sh"
sed -i '' "s|\[FOLDER_NAME_PLACEHOLDER\]|$FOLDER_NAME|g" "$NEW_CHANNEL_DIR/sync-channel.sh"

chmod +x "$NEW_CHANNEL_DIR/sync-channel.sh"
echo "✓ Created sync script: $NEW_CHANNEL_DIR/sync-channel.sh"

# Step 5: Create README
echo "📖 Creating README..."

cat > "$NEW_CHANNEL_DIR/README.md" << READMECONTENT
# $DISPLAY_NAME Channel Archive

**Channel:** [$DISPLAY_NAME]($CHANNEL_URL)
**Focus:** $FOCUS_DESC
**Last Synced:** $(date +%Y-%m-%d)

---

## Overview

This folder archives video transcripts and metadata from the $DISPLAY_NAME YouTube channel.

**Relevance to this project:**
- (Add relevance notes here)

---

## Folder Structure

\`\`\`
$FOLDER_NAME/
├── README.md              # This file
├── VIDEO_LIST.md          # Auto-generated catalog of all videos
├── sync-channel.sh        # Automated sync script
├── sync.log              # Sync history log
└── transcripts/          # Video transcripts (.vtt format)
    └── [Video Title] [VideoID].en.vtt
\`\`\`

---

## Usage

### Sync New Videos

\`\`\`bash
cd research/$FOLDER_NAME
bash sync-channel.sh
\`\`\`

### View Video Catalog

See \`VIDEO_LIST.md\` for the auto-generated list of all videos.

---

## Maintenance

Run the sync script regularly to check for new videos:

\`\`\`bash
bash sync-channel.sh
\`\`\`

The script will:
- Fetch latest channel metadata
- Auto-generate VIDEO_LIST.md
- Download only new transcripts
- Use rate limiting (8-12s delays)
- Log all activity to sync.log
READMECONTENT

echo "✓ Created README: $NEW_CHANNEL_DIR/README.md"

# Step 6: Run initial sync
echo ""
read -p "Run initial sync now? This will download all $VIDEO_COUNT transcripts (~$ESTIMATED_MINUTES min). (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🚀 Starting initial sync..."
  echo "   (Running in background - check sync.log for progress)"
  echo ""

  cd "$NEW_CHANNEL_DIR"
  bash sync-channel.sh > sync.log 2>&1 &
  SYNC_PID=$!

  echo "✓ Initial sync started in background (PID: $SYNC_PID)"
  echo "   Monitor progress: tail -f $NEW_CHANNEL_DIR/sync.log"
  echo ""
else
  echo "⏭️  Skipping initial sync. Run manually when ready:"
  echo "   cd $NEW_CHANNEL_DIR && bash sync-channel.sh"
  echo ""
fi

# Step 7: Instructions for updating master tracking
echo "========================================"
echo "✅ Channel Added Successfully!"
echo "========================================"
echo ""
echo "Channel folder: $NEW_CHANNEL_DIR"
echo ""
echo "📝 Next steps:"
echo "  1. Update research/youtube-channels/README.md"
echo "     - Add channel to 'Tracked Channels' list"
echo "     - Add to comparison table"
echo ""
echo "  2. Update research/youtube-channels/sync-all-channels.sh"
echo "     - Add channel to CHANNELS array"
echo "     - Add sync_channel call"
echo ""
echo "  3. Monitor initial sync (if running):"
echo "     tail -f $NEW_CHANNEL_DIR/sync.log"
echo ""
