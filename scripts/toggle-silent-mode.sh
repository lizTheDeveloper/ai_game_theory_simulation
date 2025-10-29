#!/bin/bash

# Toggle silent mode for voice notifications
# Default is SILENT - must explicitly disable to hear voices

SILENT_FILE=".claude/silent-mode"

# Read current state (default to enabled if file doesn't exist)
CURRENT_STATE="enabled"
if [ -f "$SILENT_FILE" ]; then
  CURRENT_STATE=$(cat "$SILENT_FILE")
fi

if [ "$CURRENT_STATE" = "disabled" ]; then
  # Currently loud - make silent
  echo "enabled" > "$SILENT_FILE"
  echo "🔇 Silent mode ENABLED - Voice notifications OFF (default)"
else
  # Currently silent - make loud
  echo "disabled" > "$SILENT_FILE"
  echo "🔊 Silent mode DISABLED - Voice notifications ON"
  say -v Samantha "Silent mode disabled. You will now hear notifications."
fi
