# YouTube Transcript Automation System

Automated daily sync of YouTube transcripts, embeddings rebuild, and SQLite database updates.

## Quick Start

### 1. Install the Daily Scheduler

```bash
cd /Users/annhoward/src/superalignmenttoutopia
bash scripts/install-transcript-scheduler.sh install
```

This will:
- Set up a launchd job to run daily at 2:00 AM
- Automatically sync all YouTube channels
- Rebuild FAISS indexes
- Update SQLite database
- Log everything to `logs/sync-embeddings_*.log`

### 2. Check Status

```bash
bash scripts/install-transcript-scheduler.sh status
```

Shows:
- Whether scheduler is installed and running
- Schedule details (daily at 2:00 AM)
- Recent log files
- Launchd logs

### 3. Test Run (Optional)

```bash
bash scripts/install-transcript-scheduler.sh run-now
```

Runs the sync immediately instead of waiting for 2:00 AM. Useful for testing.

### 4. Uninstall (If Needed)

```bash
bash scripts/install-transcript-scheduler.sh uninstall
```

Removes the launchd scheduler.

---

## What It Does Automatically

Every night at 2:00 AM, the system will:

1. **Sync YouTube Channels**
   - Read `research/youtube-channels/channels.txt`
   - Check each channel for new videos
   - Download transcripts for new videos
   - Rate-limited (8-12 seconds between downloads)

2. **Rebuild Embeddings**
   - Scan all `.vtt` transcript files
   - Extract and clean text
   - Chunk into 512-word segments (128-word overlap)
   - Generate 384-dimensional embeddings
   - Build FAISS indexes (master + per-channel)

3. **Update SQLite Database**
   - Store video metadata (title, channel, URL, file path)
   - Store chunk text and positions
   - Create indexes for fast queries
   - Update statistics

4. **Log Everything**
   - Timestamped log: `logs/sync-embeddings_YYYYMMDD_HHMMSS.log`
   - Summary: transcript count, videos indexed, chunks created
   - Errors/warnings captured for debugging

---

## Files Created

### Scripts

- **`sync-and-rebuild-embeddings.sh`** - Master sync script (called by launchd)
- **`install-transcript-scheduler.sh`** - Installer/manager for scheduler
- **`com.superalignment.transcripts.plist`** - Launchd configuration

### Launchd Files (After Install)

- `~/Library/LaunchAgents/com.superalignment.transcripts.plist` - Active scheduler

### Logs

- `logs/sync-embeddings_*.log` - Timestamped sync logs
- `logs/launchd-transcripts-stdout.log` - Launchd standard output
- `logs/launchd-transcripts-stderr.log` - Launchd error output

### Data Files (Updated Automatically)

- `research/embeddings/transcripts.db` - SQLite database (metadata)
- `research/embeddings/youtube_transcripts.index` - Master FAISS index
- `research/embeddings/<channel>.index` - Per-channel FAISS indexes
- `research/embeddings/index_stats.json` - Index statistics

---

## Adding New Channels

To add a new YouTube channel to the automation:

1. Edit `research/youtube-channels/channels.txt`
2. Add line: `URL | Display Name | Description`
3. Next sync (2:00 AM or `run-now`) will automatically:
   - Create channel folder
   - Download transcripts
   - Add to embeddings index
   - Update SQLite database

Example:
```
https://www.youtube.com/@someAIChannel | Some AI Channel | AI ethics and policy
```

No code changes needed!

---

## Manual Operations

### Run Sync Manually

```bash
bash scripts/sync-and-rebuild-embeddings.sh
```

Same as scheduled run, but starts immediately.

### Sync Only (No Rebuild)

```bash
cd research/youtube-channels
bash auto-sync.sh
```

Downloads new transcripts without rebuilding indexes.

### Rebuild Only (No Sync)

```bash
source .venv/bin/activate
python scripts/build-transcript-embeddings-sqlite.py
```

Rebuilds indexes from existing transcripts without downloading.

### Search Transcripts

```bash
source .venv/bin/activate

# Interactive
python scripts/search-transcripts-sqlite.py

# Command-line
python scripts/search-transcripts-sqlite.py "mesa-optimization"

# Channel-specific
python scripts/search-transcripts-sqlite.py "channel:robert-miles-ai-safety alignment"
```

---

## Scheduler Details

### Launchd Configuration

- **Label:** `com.superalignment.transcripts`
- **Schedule:** Daily at 2:00 AM
- **Working Directory:** `/Users/annhoward/src/superalignmenttoutopia`
- **Runs on:** Login? No (only at scheduled time)
- **Restart on failure:** No

### Environment

The scheduler runs with:
- Standard system PATH
- Python virtual environment (`.venv`) auto-activated
- All output logged to files

### Logs Location

All logs are saved to `logs/` directory:
- Sync logs: `sync-embeddings_YYYYMMDD_HHMMSS.log`
- Launchd stdout: `launchd-transcripts-stdout.log`
- Launchd stderr: `launchd-transcripts-stderr.log`

---

## Troubleshooting

### Check if scheduler is running

```bash
bash scripts/install-transcript-scheduler.sh status
```

### View recent logs

```bash
# Most recent sync log
ls -t logs/sync-embeddings_*.log | head -1 | xargs cat

# Launchd logs
cat logs/launchd-transcripts-stdout.log
cat logs/launchd-transcripts-stderr.log
```

### Test the sync script manually

```bash
bash scripts/install-transcript-scheduler.sh run-now
```

This runs the full sync immediately so you can see any errors.

### Reinstall scheduler

```bash
bash scripts/install-transcript-scheduler.sh uninstall
bash scripts/install-transcript-scheduler.sh install
```

### Check launchd directly

```bash
# List all launch agents
launchctl list | grep transcripts

# Check specific job
launchctl list com.superalignment.transcripts

# Force start job
launchctl start com.superalignment.transcripts
```

---

## Performance

### Typical Run Times

- **Sync (no new videos):** 30-60 seconds
- **Sync (5 new videos):** 2-5 minutes (rate-limited downloads)
- **Rebuild embeddings (100 videos):** 3-5 minutes
- **Total (with new videos):** 5-10 minutes

### Resource Usage

- **CPU:** High during embedding generation (2-3 minutes)
- **Memory:** ~500 MB peak (loading model + embeddings)
- **Disk:** ~1-2 MB per video (transcripts + chunks)
- **Network:** Minimal (only metadata + transcripts, not videos)

### Optimization

The system is designed to run overnight when:
- CPU/memory usage won't impact other work
- Network bandwidth is available
- Long-running tasks won't interrupt user

---

## Architecture

### Flow Diagram

```
2:00 AM Daily
    ↓
Launch Daemon Triggers
    ↓
sync-and-rebuild-embeddings.sh
    ↓
┌─────────────────────────────────┐
│ 1. Sync YouTube Channels        │
│    - Read channels.txt          │
│    - Download new transcripts   │
│    - Rate-limited (8-12s)       │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. Activate Python Venv         │
│    - Source .venv/bin/activate  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. Rebuild Embeddings           │
│    - Extract text from VTT      │
│    - Chunk text (512 words)     │
│    - Generate embeddings        │
│    - Build FAISS indexes        │
│    - Update SQLite database     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. Log Results                  │
│    - Transcript count           │
│    - Videos indexed             │
│    - Chunks created             │
│    - Errors/warnings            │
└─────────────────────────────────┘
```

### Dependencies

- **yt-dlp:** YouTube transcript download
- **Python 3.x:** Embedding generation
- **sentence-transformers:** Embedding model
- **FAISS:** Vector similarity search
- **SQLite3:** Metadata storage
- **launchd:** macOS scheduler

---

## Security & Privacy

### What Gets Downloaded

- Video metadata (title, channel, URL, duration)
- Transcript text (closed captions/subtitles)
- **NO video files** (--skip-download flag)
- **NO personal data** (public videos only)

### Rate Limiting

- 8-12 second delays between downloads
- Prevents IP bans from YouTube
- Respectful of YouTube's terms of service

### Data Storage

- All data stored locally on your machine
- No external APIs or cloud services
- SQLite database is portable (single file)

---

## Integration with Simulation

The transcript embeddings can be used to:

1. **Research Parameter Discovery**
   ```bash
   python scripts/search-transcripts-sqlite.py "AGI timeline compute scaling"
   ```

2. **Validate Mechanics**
   ```bash
   python scripts/search-transcripts-sqlite.py "mesa-optimization inner alignment empirical"
   ```

3. **Find Expert Quotes**
   ```bash
   python scripts/search-transcripts-sqlite.py "channel:robert-miles-ai-safety instrumental convergence"
   ```

4. **Cross-Reference Claims**
   - Search for topics mentioned in simulation
   - Find source videos for citations
   - Validate parameter choices with expert commentary

See `docs/wiki/RESEARCH_QUESTIONS.md` for questions that can be answered with transcript search.

---

## Related Documentation

- `research/youtube-channels/README.md` - Channel management system
- `research/embeddings/README.md` - Embeddings system details
- `scripts/build-transcript-embeddings-sqlite.py` - SQLite build script
- `scripts/search-transcripts-sqlite.py` - Search interface

---

## Support

If the scheduler isn't working:

1. Check status: `bash scripts/install-transcript-scheduler.sh status`
2. View logs: `cat logs/launchd-transcripts-stderr.log`
3. Test manually: `bash scripts/install-transcript-scheduler.sh run-now`
4. Reinstall: `bash scripts/install-transcript-scheduler.sh uninstall && bash scripts/install-transcript-scheduler.sh install`

For Python/embedding issues:
- Ensure `.venv` exists: `python3 -m venv .venv`
- Reinstall packages: `source .venv/bin/activate && pip install -r requirements.txt`
- Check FAISS: `python -c "import faiss; print('FAISS OK')"`
