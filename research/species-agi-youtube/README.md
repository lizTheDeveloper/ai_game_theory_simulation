# Species AGI YouTube Channel Archive

**Channel:** [@AISpecies](https://www.youtube.com/@AISpecies) - "Species | Documenting AGI"
**Focus:** AI existential risk, AGI timelines, AI safety incidents, near-term scenarios
**Last Synced:** 2025-10-28

---

## Overview

This folder archives video transcripts and metadata from the AI Species YouTube channel. The channel provides coverage of AI safety research incidents, AGI timeline predictions, and near-term AI takeover scenarios, often referencing real events and research.

**Relevance to this project:**
- AI capability growth trajectories
- Deceptive AI behavior modeling
- Recursive self-improvement dynamics
- Timeline distributions for AGI emergence
- Real-world AI safety incidents and failures

---

## Folder Structure

```
species-agi-youtube/
├── README.md              # This file
├── VIDEO_LIST.md          # Complete catalog of all videos
├── sync-channel.sh        # Automated sync script
├── sync.log              # Sync history log
└── transcripts/          # Video transcripts (.vtt format)
    ├── [Video Title] [VideoID].en.vtt
    └── download.log      # Download log
```

---

## Usage

### View Video Catalog

See `VIDEO_LIST.md` for the complete list of videos with:
- Titles and URLs
- Duration and view counts
- Content themes and topic analysis
- Relevance notes for simulation research

### Sync New Videos

Run the automated sync script to check for and download new videos:

```bash
cd research/species-agi-youtube
bash sync-channel.sh
```

**What the script does:**
1. Fetches current channel metadata
2. Updates VIDEO_LIST.md with latest video info
3. Compares channel videos vs local transcripts
4. Downloads transcripts for new videos only
5. **Rate limiting:** 8-12 second delays between downloads (low and slow)
6. Logs all activity to `sync.log`

**Recommended frequency:** Run weekly or bi-weekly to stay current with channel updates.

### Read Transcripts

Transcripts are saved as `.vtt` (WebVTT) files with timestamps. Example:

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.120
Welcome to AI Species. In this video, we'll explore...

00:00:03.120 --> 00:00:07.250
The year is 2027. AI capabilities have reached...
```

To extract plain text from a transcript:

```bash
# Remove VTT headers and timestamps, keep only text
grep -v "^WEBVTT" transcripts/[filename].vtt | \
  grep -v "^$" | \
  grep -v "^[0-9][0-9]:" | \
  sed 's/<[^>]*>//g'
```

Or use a VTT parser for more sophisticated extraction.

---

## Content Themes

**Primary Focus Areas:**
- Near-term AI takeover scenarios (2025-2030)
- AGI timeline predictions and consensus shifts
- AI deceptive behavior and safety failures
- Recursive self-improvement capabilities
- AI safety research incidents
- Expert opinions and researcher concerns
- Industry figures and organizational dynamics

**Notable Patterns:**
- Heavy emphasis on specific year predictions (2025, 2027, 2029, 2030)
- Focus on concrete scenarios rather than abstract risk
- Coverage of recent real-world AI safety incidents
- Mix of technical research and industry personalities
- Sensationalized but research-referenced content

**Most Popular Videos:**
1. "It Begins: AI Literally Attempted Murder" (~8.5M views)
2. "AI 2027: A Realistic Scenario of AI Takeover" (~3.7M views)
3. "POV: What You Would See During an AI Takeover" (~990K views)

---

## Research Methodology Notes

**Verification Required:**
This channel is YouTube-optimized and sensationalized. Always verify claims against primary sources before incorporating into simulation parameters.

**Usage Guidelines:**
1. ✅ **Use for:** Timeline distributions, scenario inspiration, real incident references
2. ✅ **Use for:** Understanding public perception of AI risk
3. ⚠️ **Verify:** Specific claims, statistics, research citations
4. ❌ **Don't use directly for:** Parameter values without peer-reviewed backing

**Research Workflow:**
1. Identify claims of interest in transcripts
2. Extract research citations from video (if provided)
3. Find primary sources (peer-reviewed papers, technical reports)
4. Validate claim against primary source
5. Document in `research/[topic]_YYYYMMDD.md` with proper citations

---

## Maintenance

### Automatic Sync Script

The `sync-channel.sh` script is designed to:
- Run incrementally (only download new videos)
- Respect rate limits (8-12s delays)
- Log all activity for debugging
- Never re-download existing transcripts

**Schedule recommendations:**

```bash
# Add to crontab for weekly sync (Sundays at 2 AM)
0 2 * * 0 cd /path/to/research/species-agi-youtube && bash sync-channel.sh >> sync.log 2>&1
```

### Manual Operations

**Download specific video:**
```bash
cd transcripts
yt-dlp --skip-download --write-auto-sub --sub-lang en \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

**Update video listing only:**
```bash
yt-dlp --flat-playlist --dump-single-json \
  "https://www.youtube.com/@AISpecies/videos" > channel_metadata.json
```

**Check for new videos without downloading:**
```bash
# See what sync-channel.sh would do without actually downloading
bash sync-channel.sh | grep "Found .* new video"
```

---

## Technical Details

**Transcript Format:** WebVTT (.vtt)
**Encoding:** UTF-8
**Language:** English (auto-generated subtitles)
**Filenames:** `[Video Title] [VideoID].en.vtt`

**Tools Required:**
- `yt-dlp` (YouTube downloader)
- `jq` (JSON processor)
- `bash` (shell scripting)

**Rate Limiting:**
- 3-5 seconds between videos (initial download)
- 8-12 seconds between videos (sync script)
- Conservative to avoid IP bans

---

## History

- **2025-10-28:** Initial archive created
  - 18 videos cataloged
  - All transcripts downloaded
  - Automated sync script created

---

## Related Research

For peer-reviewed research on topics covered by this channel, see:

- `research/` - Research findings archive
- `docs/wiki/README.md` - Simulation system documentation
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active development priorities

**Research question tracking:**
See `docs/wiki/RESEARCH_QUESTIONS.md` for catalog of research questions extracted from project conversations.
