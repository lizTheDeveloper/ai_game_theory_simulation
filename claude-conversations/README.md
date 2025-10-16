# Claude Code Conversation Backups

This directory contains backups of all Claude Code conversation history for this project.

## Source
- **Original Locations:**
  - `~/.claude/projects/-Users-annhoward-src-superalignmenttoutopia/` → backed up to root
  - `~/.claude/projects/-Users-annhoward-src-ai-game-theory-simulation/` → backed up to `ai-game-theory-simulation/`
- **Initial Backup Date:** October 16, 2025
- **Total Files:** 19+ conversation sessions across 2 projects
- **Total Size:** ~89 MB (growing)

## Directory Structure
```
claude-conversations/
├── backup-conversations.sh      # Automated backup script
├── backup.log                   # Backup history log
├── README.md                    # This file
├── *.jsonl                      # superalignmenttoutopia conversations
└── ai-game-theory-simulation/   # Other project conversations
    └── *.jsonl
```

## Automated Backups

### Quick Start

Run the backup script manually:
```bash
./claude-conversations/backup-conversations.sh
```

### Automation Options

#### Option 1: Daily Cron Job (Recommended)

Add to your crontab to run daily at 11 PM:
```bash
# Edit crontab
crontab -e

# Add this line:
0 23 * * * cd /Users/annhoward/src/superalignmenttoutopia && ./claude-conversations/backup-conversations.sh >> claude-conversations/backup.log 2>&1
```

#### Option 2: After Each Claude Code Session

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
# Backup Claude Code conversations on shell exit
trap 'cd /Users/annhoward/src/superalignmenttoutopia && ./claude-conversations/backup-conversations.sh' EXIT
```

#### Option 3: Git Pre-Commit Hook

Automatically backup before each commit:
```bash
# Create hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
./claude-conversations/backup-conversations.sh > /dev/null 2>&1
EOF

# Make executable
chmod +x .git/hooks/pre-commit
```

#### Option 4: Manual Reminders

Set a reminder to run manually weekly/monthly depending on usage.

### Backup Script Details

The `backup-conversations.sh` script:
- ✓ Backs up **multiple projects** (currently: 2 projects)
- ✓ Copies all `.jsonl` files from `~/.claude/projects/` to this directory
- ✓ Organizes projects into subdirectories (except main project)
- ✓ Shows visual progress with colored output
- ✓ Logs backup events with timestamps to `backup.log`
- ✓ Reports file counts and total size per project
- ✓ Handles errors gracefully
- ✓ Only copies changed/new files (overwrites existing)

### Adding More Projects

To back up additional Claude Code projects, edit `backup-conversations.sh`:

1. Find the `PROJECTS` array near the top:
```bash
PROJECTS=(
    "-Users-annhoward-src-superalignmenttoutopia"
    "-Users-annhoward-src-ai-game-theory-simulation"
)
```

2. Add the project directory name from `~/.claude/projects/`:
```bash
PROJECTS=(
    "-Users-annhoward-src-superalignmenttoutopia"
    "-Users-annhoward-src-ai-game-theory-simulation"
    "-Users-annhoward-src-your-new-project"  # Add here
)
```

3. Test the backup:
```bash
./claude-conversations/backup-conversations.sh
```

The script will automatically create subdirectories for each additional project.

## File Format

Conversations are stored in `.jsonl` (JSON Lines) format. Each line is a valid JSON object representing a message in the conversation.

## Files

| File | Size | Last Modified |
|------|------|---------------|
| `08fd9a4a-bf7c-4428-bbfb-1bcc351365ef.jsonl` | 2.6 MB | Oct 16 11:40 |
| `09d3e15a-1fb7-49ce-b3d5-a5ff791f1990.jsonl` | 13 MB | Oct 16 11:52 |
| `17553a18-35bd-4476-9d87-aa2a2ea37f5f.jsonl` | 3.7 KB | Oct 15 14:08 |
| `1e6206b9-c624-4d81-9877-9da6cff2767f.jsonl` | 5.9 MB | Oct 16 14:56 |
| `58dd10a3-6e48-4447-80bd-ed0f6c8ff41a.jsonl` | 17 MB | Oct 15 11:47 |
| `8083e9c0-9b40-4ea2-a820-1b295695d599.jsonl` | 57 KB | Oct 16 15:01 |
| `925350d2-a173-4c18-a31d-8de862ddc233.jsonl` | 4.2 MB | Oct 16 11:44 |
| `a69f330d-4cab-4195-ba55-0e4092d392cd.jsonl` | 3.2 MB | Oct 16 15:01 |
| `be2a61d9-8068-4a0f-b993-cafe11474c1d.jsonl` | 2.5 MB | Oct 16 13:09 |
| `f2bf8768-9eb1-480a-90f1-6c3135ccb15b.jsonl` | 2.4 MB | Oct 16 14:55 |
| `ff9e339c-f429-4768-bf92-061174dc2194.jsonl` | 2.7 MB | Oct 15 11:44 |

## Viewing Conversations

These files are not easily human-readable in raw format. Third-party tools exist for viewing/exporting:
- [claude-conversation-extractor](https://github.com/ZeroSumQuant/claude-conversation-extractor)
- [claude-code-history-viewer](https://github.com/jhlee0409/claude-code-history-viewer)

Alternatively, you can parse the JSONL format with any JSON parser:
```bash
# View first message of a conversation
head -1 <filename>.jsonl | jq '.'

# Count messages in a conversation
wc -l < <filename>.jsonl

# Extract all user messages
jq 'select(.role == "user") | .content' <filename>.jsonl
```

## Notes

- Each session file represents one continuous conversation with Claude Code
- Files are named with UUIDs (session IDs)
- The largest conversations (13-17 MB) represent the most extensive development sessions
- These backups preserve the full project development history for reference
