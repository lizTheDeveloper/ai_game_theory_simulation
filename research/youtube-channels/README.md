# YouTube AI Safety & Research Channels Archive

**Purpose:** Automated tracking and archival of AI safety, AGI research, and alignment-focused YouTube channels.

**Last Updated:** 2025-10-28

---

## Tracked Channels

### 1. AI Species (Species AGI)
- **Folder:** `../species-agi-youtube/`
- **Channel URL:** https://www.youtube.com/@AISpecies
- **Focus:** AI existential risk, AGI timelines, near-term scenarios
- **Videos:** 18
- **Transcripts:** 18
- **Update Frequency:** Weekly (fast-moving news/analysis channel)
- **Relevance:** Timeline predictions, real-world AI incidents, near-term scenarios

### 2. Robert Miles AI
- **Folder:** `../robert-miles-ai-safety/`
- **Channel URL:** https://www.youtube.com/c/robertmilesai
- **Focus:** Technical AI safety, alignment problems, research communication
- **Videos:** 45
- **Transcripts:** 44 (1 unavailable)
- **Update Frequency:** Monthly (deep technical content, slower posting schedule)
- **Relevance:** Theoretical foundations, mesa-optimization, deceptive alignment, inner misalignment

---

## Quick Start

### Sync All Channels

Run the master sync script to update all channels at once:

```bash
cd research/youtube-channels
bash sync-all-channels.sh
```

This will:
1. Sync AI Species (weekly recommended)
2. Sync Robert Miles (monthly recommended)
3. Generate unified summary of new content
4. Log all activity

### Sync Individual Channel

```bash
cd research/species-agi-youtube
bash sync-channel.sh

# Or
cd research/robert-miles-ai-safety
bash sync-channel.sh
```

### View All Transcripts

```bash
# List all transcripts from all channels
find research/ -name "*.vtt" -type f

# Count total transcripts
find research/ -name "*.vtt" -type f | wc -l
```

---

## Channel Comparison

| Channel | Focus | Style | Update Freq | Videos | Relevance to Simulation |
|---------|-------|-------|-------------|--------|------------------------|
| **AI Species** | News/scenarios | Sensationalized, news-oriented | Weekly+ | 18 | Timeline distributions, public perception |
| **Robert Miles** | Theory/research | Technical, academic | Monthly | 45 | Deception mechanics, mesa-optimization |

**Complementary Usage:**
- **AI Species:** WHEN things happen (timelines, recent events)
- **Robert Miles:** WHY/HOW things work (mechanisms, theory)

---

## Automation

### Recommended Cron Schedule

```bash
# Weekly sync for AI Species (fast-moving channel)
0 2 * * 0 cd /path/to/research/youtube-channels && bash sync-all-channels.sh --channel=species-agi >> logs/youtube-sync.log 2>&1

# Monthly sync for Robert Miles (slower posting)
0 2 1 * * cd /path/to/research/youtube-channels && bash sync-all-channels.sh --channel=robert-miles >> logs/youtube-sync.log 2>&1

# Or sync all channels weekly
0 2 * * 0 cd /path/to/research/youtube-channels && bash sync-all-channels.sh >> logs/youtube-sync.log 2>&1
```

### Manual Sync

```bash
# Sync everything
bash sync-all-channels.sh

# Sync specific channel
bash sync-all-channels.sh --channel=species-agi
bash sync-all-channels.sh --channel=robert-miles
```

---

## Adding New Channels

To add a new YouTube channel to tracking:

1. **Create channel folder:**
   ```bash
   mkdir -p research/[channel-name]/transcripts
   ```

2. **Copy sync script template:**
   ```bash
   cp research/species-agi-youtube/sync-channel.sh research/[channel-name]/
   ```

3. **Edit sync script variables:**
   - `CHANNEL_URL` - YouTube channel URL
   - `CHANNEL_NAME` - Display name
   - `CHANNEL_FOCUS` - Brief description

4. **Run initial sync:**
   ```bash
   cd research/[channel-name]
   bash sync-channel.sh
   ```

5. **Update this README:**
   - Add channel to "Tracked Channels" list
   - Add to comparison table
   - Update `sync-all-channels.sh` to include new channel

---

## Research Workflow

### Finding Relevant Content

1. **Browse VIDEO_LIST.md** in each channel folder
2. **Search across all transcripts:**
   ```bash
   grep -r "mesa-optimization" research/*/transcripts/
   grep -r "deceptive alignment" research/*/transcripts/
   grep -r "specification gaming" research/*/transcripts/
   ```

3. **Extract paper citations** from video descriptions
4. **Validate claims** against primary sources
5. **Document findings** in `research/[topic]_YYYYMMDD.md`

### Extracting Plain Text

```bash
# Extract text from any transcript
grep -v "^WEBVTT" transcript.vtt | \
  grep -v "^$" | \
  grep -v "^[0-9][0-9]:" | \
  grep -v "align:start" | \
  sed 's/<[^>]*>//g'
```

### Searching Across All Channels

```bash
# Search all transcripts for a term
find research/ -name "*.vtt" -exec grep -l "reward hacking" {} \;

# Count mentions across all channels
grep -r "reward hacking" research/*/transcripts/ | wc -l
```

---

## Statistics

**Total Channels Tracked:** 2
**Total Videos Cataloged:** 63 (18 + 45)
**Total Transcripts Downloaded:** 62 (18 + 44)
**Total Transcript Size:** ~3.2 MB

**Coverage by Topic:**
- Deceptive alignment: 2 channels (Robert Miles primary)
- Mesa-optimization: 2 channels (Robert Miles primary)
- AGI timelines: 2 channels (AI Species primary)
- Specification gaming: 2 channels (both)
- Near-term scenarios: 2 channels (AI Species primary)

---

## Related Resources

- `research/` - Peer-reviewed research findings
- `docs/wiki/README.md` - Simulation documentation
- `docs/wiki/RESEARCH_QUESTIONS.md` - Research question catalog
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active development priorities

---

## Maintenance

### Check Sync Status

```bash
# View recent sync activity
tail -50 research/species-agi-youtube/sync.log
tail -50 research/robert-miles-ai-safety/sync.log
```

### Force Regenerate Video Lists

```bash
cd research/species-agi-youtube && bash sync-channel.sh
cd research/robert-miles-ai-safety && bash sync-channel.sh
```

### Verify Transcript Count

```bash
# Count transcripts per channel
echo "AI Species: $(find research/species-agi-youtube/transcripts -name '*.vtt' | wc -l)"
echo "Robert Miles: $(find research/robert-miles-ai-safety/transcripts -name '*.vtt' | wc -l)"
echo "Total: $(find research/*/transcripts -name '*.vtt' | wc -l)"
```

---

## History

- **2025-10-28:** Initial setup
  - Added AI Species (18 videos)
  - Added Robert Miles (45 videos, 44 transcripts)
  - Created master sync script
  - Automated VIDEO_LIST.md generation

---

## Future Channels to Consider

**AI Safety / Alignment:**
- Anthropic (official channel)
- OpenAI Research
- DeepMind
- Alignment Newsletter (if they have video content)

**AGI Forecasting:**
- AI Impacts
- FLI (Future of Life Institute)

**Technical Deep Dives:**
- Yannic Kilcher (ML paper reviews)
- Two Minute Papers (AI research summaries)

**Note:** Add channels as needed based on research requirements. Prioritize channels with:
- AI safety focus
- Technical depth
- Regular posting schedule
- Available transcripts
