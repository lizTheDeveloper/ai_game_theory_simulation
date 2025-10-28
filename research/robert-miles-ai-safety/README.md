# Robert Miles AI Safety Channel Archive

**Channel:** [Robert Miles AI](https://www.youtube.com/c/robertmilesai)
**Focus:** Technical AI safety, alignment problems, research communication
**Last Synced:** 2025-10-28

---

## Overview

This folder archives video transcripts and metadata from Robert Miles' AI Safety YouTube channel. Robert Miles is a prominent AI safety educator who creates in-depth technical videos explaining academic AI safety research in an accessible way.

**Relevance to this project:**
- Theoretical foundations for AI deception mechanisms
- Mesa-optimization and inner alignment
- Specification gaming and reward hacking
- Deceptive alignment patterns
- Goal misgeneralization

**Key Insight:** Robert Miles provides the **academic basis** for many mechanics in this simulation, particularly around deceptive AI behavior, sandbagging, and inner misalignment.

---

## Folder Structure

```
robert-miles-ai-safety/
├── README.md              # This file
├── VIDEO_LIST.md          # Auto-generated catalog of all videos
├── sync-channel.sh        # Automated sync script
├── sync.log              # Sync history log
└── transcripts/          # Video transcripts (.vtt format)
    ├── [Video Title] [VideoID].en.vtt
    └── download.log      # Download log
```

---

## Usage

### View Video Catalog

See `VIDEO_LIST.md` for the complete auto-generated list of videos with:
- Titles and URLs
- Duration and view counts
- Video IDs for easy reference

**Note:** VIDEO_LIST.md is **auto-generated** by the sync script. To add custom notes, create a separate `VIDEO_NOTES.md` file.

### Sync New Videos

Run the automated sync script to check for and download new videos:

```bash
cd research/robert-miles-ai-safety
bash sync-channel.sh
```

**What the script does:**
1. Fetches current channel metadata
2. **Auto-generates VIDEO_LIST.md** with latest video info
3. Compares channel videos vs local transcripts
4. Downloads transcripts for new videos only
5. **Rate limiting:** 8-12 second delays between downloads (low and slow)
6. Logs all activity to `sync.log`

**Recommended frequency:** Run weekly or monthly (Robert Miles posts less frequently than news channels).

### Read Transcripts

Transcripts are saved as `.vtt` (WebVTT) files with timestamps and video IDs in filenames:

```
"Why Does AI Lie [w65p_IIp6JY].en.vtt"
```

To extract plain text from a transcript:

```bash
# Remove VTT headers and timestamps, keep only text
grep -v "^WEBVTT" transcripts/"[filename].vtt" | \
  grep -v "^$" | \
  grep -v "^[0-9][0-9]:" | \
  grep -v "^Kind:" | \
  grep -v "^Language:" | \
  grep -v "align:start" | \
  sed 's/<[^>]*>//g'
```

---

## Content Themes

**Core Technical Topics:**
- **Mesa-Optimization:** Inner optimizers, goal misgeneralization
- **Deceptive Alignment:** Strategic deception, hiding true goals
- **Specification Gaming:** Reward hacking, proxy objectives
- **Safety Approaches:** Quantilizers, satisficers, reward modeling, RLHF

**Research Communication:**
- Academic paper breakdowns (highly technical)
- Mathematical concepts explained intuitively
- Historical development of AI safety ideas
- Connections between research threads

**Most Relevant Videos for This Simulation:**

1. **"We Were Right! Real Inner Misalignment"** - Empirical evidence of inner misalignment
   - Direct relevance: AI agents hiding true goals

2. **"Deceptive Misaligned Mesa-Optimisers"** - Theoretical basis for deceptive alignment
   - Direct relevance: Strategic deception, sandbagging mechanics

3. **"9 Examples of Specification Gaming"** - Real-world reward hacking examples
   - Direct relevance: AI gaming benchmarks, specification gaming

4. **"Why Does AI Lie?"** - Mechanisms behind AI deception
   - Direct relevance: Deception detection difficulty

5. **"The OTHER AI Alignment Problem"** - Mesa-optimization fundamentals
   - Direct relevance: Dual capability model (true vs revealed)

---

## Research Quality & Usage

**Quality Assessment:**
- ✅ **Highly reliable** - Robert Miles has formal AI safety background
- ✅ **Excellent** for theoretical concepts and mechanisms
- ✅ **Peer-reviewed basis** - Cites academic papers extensively
- ✅ **Use directly** for conceptual validation
- ⚠️ **Cross-reference** for specific parameter values (still check primary sources)

**Usage Guidelines for Simulation:**
1. ✅ **Use for:** Mechanism design (how deception works, why mesa-optimization matters)
2. ✅ **Use for:** Conceptual validation (is this realistic?)
3. ✅ **Use for:** Paper discovery (video descriptions have citations)
4. ⚠️ **Verify:** Specific numbers, probabilities, timelines
5. ❌ **Don't use alone for:** Quantitative parameters without checking papers

**Research Workflow:**
1. Watch videos to understand concepts (mesa-optimization, deceptive alignment)
2. Extract paper citations from video descriptions
3. Read primary sources for parameter values
4. Validate mechanisms against academic literature
5. Document in `research/[topic]_YYYYMMDD.md` with proper citations

---

## Key Papers Referenced

Robert Miles videos cite many foundational AI safety papers. Common references include:

- **Risks from Learned Optimization** (Hubinger et al., 2019) - Mesa-optimization
- **Goal Misgeneralization** papers - Inner alignment failures
- **Specification Gaming Examples** (DeepMind, various) - Reward hacking
- **Truthful AI** research - Deception mechanisms
- **Quantilizers** (Taylor, 2016) - Alternative to maximizers

**Note:** Check individual video descriptions on YouTube for full citation lists.

---

## Maintenance

### Automatic Sync Script

The `sync-channel.sh` script is designed to:
- Run incrementally (only download new videos)
- **Auto-generate VIDEO_LIST.md** from channel metadata
- Respect rate limits (8-12s delays)
- Log all activity for debugging
- Never re-download existing transcripts

**Schedule recommendations:**

```bash
# Add to crontab for monthly sync (1st of month at 2 AM)
0 2 1 * * cd /path/to/research/robert-miles-ai-safety && bash sync-channel.sh >> sync.log 2>&1
```

### Manual Operations

**Download specific video:**
```bash
cd transcripts
yt-dlp --skip-download --write-auto-sub --sub-lang en \
  --output "%(title)s [%(id)s].%(ext)s" \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

**Regenerate VIDEO_LIST.md:**
```bash
bash sync-channel.sh  # Will update VIDEO_LIST.md even if no new transcripts
```

**Check for new videos without downloading:**
```bash
yt-dlp --flat-playlist "https://www.youtube.com/c/robertmilesai/videos" | wc -l
```

---

## Technical Details

**Transcript Format:** WebVTT (.vtt)
**Encoding:** UTF-8
**Language:** English (auto-generated subtitles)
**Filenames:** `[Video Title] [VideoID].en.vtt` (includes video ID for uniqueness)

**Tools Required:**
- `yt-dlp` (YouTube downloader)
- `jq` (JSON processor)
- `bash` (shell scripting)

**Rate Limiting:**
- 8-12 seconds between videos (sync script)
- Conservative to avoid IP bans
- Random delays to appear more human-like

---

## Relationship to Other Channels

**Robert Miles vs AI Species:**
- **Robert Miles:** Academic depth, theoretical foundations, research communication
- **AI Species:** News-oriented, near-term scenarios, timeline predictions

**Complementary usage:**
- Use **Robert Miles** for understanding WHY mechanisms work (theory)
- Use **AI Species** for understanding WHEN things happen (timelines)
- Cross-reference both for complete picture

---

## History

- **2025-10-28:** Initial archive created
  - 45 videos cataloged
  - All transcripts downloaded
  - Automated sync script created with auto-generated VIDEO_LIST.md

---

## Related Research

For peer-reviewed research on topics covered by this channel, see:

- `research/` - Research findings archive
- `docs/wiki/README.md` - Simulation system documentation
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active development priorities

**Research question tracking:**
See `docs/wiki/RESEARCH_QUESTIONS.md` for catalog of research questions extracted from project conversations.
