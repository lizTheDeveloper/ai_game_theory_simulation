#!/bin/bash
# Validate emoji event map for duplicates

echo "=== Emoji Event Map Validation ==="
echo ""

# Extract emojis and count
echo "Total events defined:"
grep -c "^[^#].*|" docs/EMOJI_EVENT_MAP.txt

echo ""
echo "Checking for duplicate emojis..."
DUPES=$(awk -F'|' '/^[^#]/ && NF==2 {gsub(/^[ \t]+|[ \t]+$/, "", $1); print $1}' docs/EMOJI_EVENT_MAP.txt | sort | uniq -c | awk '$1 > 1')

if [ -z "$DUPES" ]; then
    echo "✅ No duplicates found! All emojis are unique."
    exit 0
else
    echo "❌ DUPLICATES FOUND:"
    echo "$DUPES"
    exit 1
fi
