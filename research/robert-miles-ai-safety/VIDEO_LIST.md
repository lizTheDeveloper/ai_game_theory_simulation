# Robert Miles AI Safety Channel - Video Catalog

**Channel:** [Robert Miles AI](https://www.youtube.com/c/robertmilesai)
**Focus:** Technical AI safety, alignment problems, research communication
**Last Updated:** 2025-10-28
**Total Videos:** 45

This channel provides deep technical explanations of AI safety research and alignment problems, aimed at making academic research accessible.

---

## Channel Overview

Robert Miles is a prominent AI safety educator and researcher who creates in-depth technical videos explaining:
- Inner and outer alignment problems
- Mesa-optimization and deceptive alignment
- AI safety research papers and concepts
- Practical approaches to AI safety

**Content Style:**
- Technical but accessible explanations
- Research paper breakdowns
- Conceptual frameworks for AI safety
- Career advice for AI safety researchers

---

## Video List

### Tech is Good, AI Will Be Different
- **URL:** https://www.youtube.com/watch?v=zATXsGm_xJo
- **Duration:** 9m 29s
- **Views:** ~61K
- **Topics:** Technology impact, AI uniqueness

### AI Safety Career Advice! (And So Can You!)
- **URL:** https://www.youtube.com/watch?v=OpufM6yK4Go
- **Duration:** 23m 42s
- **Views:** ~68K
- **Topics:** Career paths, AI safety research

### Using Dangerous AI, But Safely?
- **URL:** https://www.youtube.com/watch?v=0pgEMWy70Qk
- **Duration:** 30m 38s
- **Views:** ~143K
- **Topics:** Safe deployment, risk management

### AI Ruined My Year
- **URL:** https://www.youtube.com/watch?v=2ziuPUeewK0
- **Duration:** 45m 59s (longest video)
- **Views:** ~265K
- **Topics:** AI developments, personal perspective

### Why Does AI Lie, and What Can We Do About It?
- **URL:** https://www.youtube.com/watch?v=w65p_IIp6JY
- **Duration:** 9m 24s
- **Views:** ~275K
- **Topics:** Deception, truthfulness

### We Were Right! Real Inner Misalignment
- **URL:** https://www.youtube.com/watch?v=zkbPdEHEyEI
- **Duration:** 11m 47s
- **Views:** ~263K
- **Topics:** Inner misalignment, empirical findings

### Intro to AI Safety, Remastered
- **URL:** https://www.youtube.com/watch?v=pYXy-A4siMw
- **Duration:** 18m 5s
- **Views:** ~186K
- **Topics:** AI safety fundamentals, overview

### Deceptive Misaligned Mesa-Optimisers? It's More Likely Than You Think...
- **URL:** https://www.youtube.com/watch?v=IeWljQw3UgQ
- **Duration:** 10m 20s
- **Views:** ~90K
- **Topics:** Mesa-optimization, deceptive alignment

### The OTHER AI Alignment Problem: Mesa-Optimizers and Inner Alignment
- **URL:** https://www.youtube.com/watch?v=bJLcIBixGj8
- **Duration:** 23m 24s
- **Views:** ~258K
- **Topics:** Inner alignment, mesa-optimizers

### Quantilizers: AI That Doesn't Try Too Hard
- **URL:** https://www.youtube.com/watch?v=gdKMG6kTl6Y
- **Duration:** 9m 54s
- **Views:** ~89K
- **Topics:** Quantilizers, satisficing

### Sharing the Benefits of AI: The Windfall Clause
- **URL:** https://www.youtube.com/watch?v=7i_f4Kbpgn4
- **Duration:** 11m 44s
- **Views:** ~82K
- **Topics:** Economic distribution, AI benefits

### 10 Reasons to Ignore AI Safety
- **URL:** https://www.youtube.com/watch?v=9i1WlcCudpU
- **Duration:** 16m 29s
- **Views:** ~357K (most popular)
- **Topics:** Counter-arguments, skepticism

### 9 Examples of Specification Gaming
- **URL:** https://www.youtube.com/watch?v=nKJlF-olKmg
- **Duration:** 9m 40s
- **Views:** ~320K
- **Topics:** Reward hacking, specification gaming

### Training AI Without Writing A Reward Function, with Reward Modelling
- **URL:** https://www.youtube.com/watch?v=PYylPRX6z4Q
- **Duration:** 17m 52s
- **Views:** ~252K
- **Topics:** Reward modeling, RLHF

### AI That Doesn't Try Too Hard - Maximizers and Satisficers
- **URL:** https://www.youtube.com/watch?v=Ao4jwLwT36M
- **Duration:** 14m 46s
- **Views:** ~192K
- **Topics:** Maximizers vs satisficers

---

## Content Themes

**Core Technical Topics:**
- **Inner/Outer Alignment:** Mesa-optimization, goal misgeneralization
- **Deceptive Alignment:** Strategic deception, hiding capabilities
- **Reward Specification:** Specification gaming, proxy objectives
- **Safety Approaches:** Quantilizers, satisficers, reward modeling

**Research Communication:**
- Detailed paper breakdowns
- Mathematical concepts explained intuitively
- Historical context for AI safety ideas
- Connections between different research threads

**Relevance to This Project:**
- Mesa-optimization → AI agents hiding true goals
- Specification gaming → AIs exploiting reward functions
- Inner misalignment → True vs revealed capabilities
- Deceptive alignment → Strategic behavior, sandbagging

**Key Insight:** Robert Miles provides the **theoretical foundations** for many mechanics in this simulation (inner misalignment, deceptive behavior, strategic sandbagging).

---

## Most Relevant Videos for This Simulation

**Must-watch for understanding simulation mechanics:**

1. **"We Were Right! Real Inner Misalignment"** - Empirical evidence of inner misalignment
2. **"Deceptive Misaligned Mesa-Optimisers"** - Theoretical basis for AI deception
3. **"9 Examples of Specification Gaming"** - Real-world examples of reward hacking
4. **"Why Does AI Lie?"** - Mechanisms behind AI deception
5. **"The OTHER AI Alignment Problem"** - Mesa-optimization fundamentals

**For parameter validation:**
- "Intro to AI Safety, Remastered" - Overview of AI safety problems
- "Training AI Without Writing A Reward Function" - RLHF/reward modeling

---

## Research Quality

**Strengths:**
- Deep technical accuracy (Robert Miles has formal AI safety background)
- Cites academic papers and research
- Explains mathematical concepts clearly
- Updates videos when research develops

**Usage for Simulation:**
- ✅ **Highly reliable** for theoretical concepts
- ✅ **Excellent** for understanding mechanisms (mesa-optimization, deception)
- ✅ **Use directly** for conceptual validation
- ⚠️ **Cross-reference** for empirical parameters (still check papers)

**Research Workflow:**
1. Watch videos for conceptual understanding
2. Extract paper citations from video descriptions
3. Read primary sources for parameter values
4. Validate mechanisms against academic literature
5. Document in `research/[topic]_YYYYMMDD.md`

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

---

## Paper Citations

Robert Miles videos typically include paper citations in video descriptions. Key papers referenced:

- **Risks from Learned Optimization** (Hubinger et al.) - Mesa-optimization
- **Goal Misgeneralization** papers - Inner alignment failures
- **Specification Gaming** examples (DeepMind) - Reward hacking
- **Truthful AI** research - Deception mechanisms

(Check individual video descriptions for full citation lists)
