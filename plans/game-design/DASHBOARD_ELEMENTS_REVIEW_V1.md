# Dashboard Elements Review - V1 Mockups
## Game Design Perspective

**Reviewer:** Maya (Game Designer)
**Date:** 2025-11-24
**Round:** 1 of 4 (Focus: BIG issues - information hierarchy, player agency, engagement hooks)

---

## Executive Summary

The three elements show strong individual craft but **lack cohesion as a dashboard ecosystem**. Each feels like it was designed in isolation. The Research Tree is closest to production-ready (7.5/10), ARIA Chat has strong bones but needs clarity on player value (6/10), and the Global Map is visually striking but informationally sparse (5.5/10).

**Critical gap:** None of these elements create "one more turn" hooks. They're informational displays, not engagement drivers. A player could look at all three and think "okay, so what do I DO?"

---

## 1. Research Tree

### Score: 7.5/10

### What's Working Well

**Information density:** The tier-based layout with AI capability ranges (0.0-0.5, 0.5-1.0, etc.) immediately communicates progression structure. Players can scan horizontally to see what's available now vs. what's coming.

**Visual status clarity:** The color coding (green=deployed, orange=researching, gray=locked, white=available) is instantly readable. The legend is clear but could be moved to reduce clutter.

**Research Focus panel:** The bottom three cards showing active research with progress bars, costs, timelines, and citations is EXCELLENT. This is where player agency lives. The prerequisite chips are perfect.

**Research citations visible:** Showing actual papers (MIT Energy Initiative, Kenya GiveDirectly) grounds the simulation in reality and supports the "research tool" framing.

### Top Improvements Needed for V2

**1. CRITICAL: Add "Recommend Research" affordance to every AVAILABLE card**

Right now, the top grid shows status but doesn't invite action. Every white-bordered "Available" card should have a subtle interaction hint (e.g., "Recommend" button appears on hover). Players should be able to click Personalized Medicine and see it added to Research Focus as a recommendation.

**Current state:** "Here's what exists"
**Needed state:** "Here's what exists - what should we prioritize?"

**2. Make the stakes visible - why does each tech matter RIGHT NOW?**

Cards show what technologies do (Universal Basic Income provides payments) but not why they're urgent. Add a small crisis indicator or impact preview:
- "Universal Basic Income" → "🚨 Addresses: Automation unemployment (62% risk)"
- "Fusion Energy" → "⚡ Could replace: 40% fossil fuel capacity"

This connects research choices to active world state (from Global Map crises).

**3. Show opportunity cost in Research Focus**

The three active research cards are great, but they don't communicate: "You can only fund 3 things - what are you giving up?" Add a small "X other available" counter and a "Change priorities" interaction that forces players to consider tradeoffs.

### Integration Concerns

**Disconnected from ARIA Chat:** ARIA should be able to answer "Why is Value Alignment Training taking so long?" or "Should we prioritize Fusion Energy given our energy crisis?" But there's no visual connection between these two panels.

**Disconnected from Global Map:** Climate crises on the map should visually pulse or highlight relevant research tree categories (CLIMATE, ENERGY). If South Asia has water shortage, the OCEAN/CLIMATE techs should glow subtly.

---

## 2. ARIA Chat

### Score: 6/10

### What's Working Well

**Pause state integration:** The yellow bar "Simulation paused - take your time" with Resume button is perfect. Reinforces that player can think without pressure.

**Information clarity:** ARIA's response about ocean pH is dense with data (445 ppm CO2, -15% buffer capacity, 8% deployment) but formatted readably. The cyan highlight on specific values is good.

**Suggested questions:** The three follow-up prompts (show research backing, compare to baseline, cascading effects) are EXACTLY what players need. They guide inquiry without forcing it.

**Free-text input:** Allows open-ended exploration, which is critical for the "research tool" framing.

### Top Improvements Needed for V2

**1. CRITICAL: Show why the player should care about this conversation**

Right now it's just information exchange. Where's the hook to ACTION? After ARIA explains ocean pH, there should be a "Recommend response" option that bridges to Research Tree or Global Map:

```
[🔬 Explore ocean alkalinity research]  [🌍 View affected regions]  [Ask another question]
```

These buttons should be contextual - they appear based on conversation topic and create loops to other dashboard elements.

**2. Make ARIA's personality more distinct**

The response reads like a Wikipedia article, not a competent-calm-wry advisor. Per the Game Design Doc, ARIA should sound like "senior researcher who's seen a lot, but hasn't lost hope."

**Current:** "Ocean acidification is accelerating due to three factors:"
**Better:** "The ocean pH situation... yeah, it's not great. Three things are making it worse:"

**Current:** "Suggested Questions" (clinical)
**Better:** "You might want to ask:" or "If I were you, I'd check:"

**3. Add conversation history/context awareness**

If this is a persistent advisor, show recent topics in a subtle sidebar or breadcrumb trail. Players should be able to revisit "Wait, what did ARIA say about ocean pH?" without scrolling through chat history.

### Integration Concerns

**No visible connection to simulation state:** When ARIA says "Ocean buffer capacity declining (carbonate saturation -15%)", is that visible anywhere on the Global Map? Should South Asia's ocean regions be color-coded to match?

**Unclear when to use ARIA vs other panels:** Is ARIA for explaining what's already happening, or for exploring what COULD happen? The design doesn't make this clear. Needs a clearer niche: **ARIA = Your "Why?" engine.**

---

## 3. Global Map

### Score: 5.5/10

### What's Working Well

**Visual drama:** The 3D floating regions with color-coded health states (green/yellow/orange/red) create immediate emotional impact. You FEEL the crisis.

**Region detail panel:** South Asia's sidebar showing Quality of Life (0.35), Planetary Boundaries (6/9 breached), Social Stability (0.25) is exactly the right level of detail. The active crisis chips (Water Shortage, Heat Stress, Food Crisis) are perfect.

**Layer switcher:** The top-right layer buttons (COMPOSITE, CLIMATE, SOCIAL, AI, ECONOMIC, GEOPOLITICAL) promise deep exploration of different lenses.

**Timeline scrubber:** The bottom timeline with color-coded history (showing stressed/crisis/collapse periods) is EXCELLENT for showing trajectory.

### Top Improvements Needed for V2

**1. CRITICAL: The map is beautiful but EMPTY of actionable information**

Right now it's a status display. What can players DO with this information? Every crisis chip should be clickable with options:

```
Click "🔥 Heat Stress" →
  - Ask ARIA why this is happening
  - View relevant research (Climate → Enhanced Weathering)
  - Propose intervention (if political capital available)
  - Compare to other regions
```

The map should be an **action hub**, not just a visualization.

**2. Show RELATIONSHIPS between regions, not just individual states**

The floating regions are visually disconnected. Where are the flows? Migration arrows, trade dependencies, technology transfer, climate cascade effects? Example:

- India water crisis → Bangladesh migration → social stability impact
- China AI breakthrough → regional capability spillover → geopolitical tension

These relationships are central to the simulation's complexity but invisible here.

**3. Make the layer switcher more than decoration**

Right now "COMPOSITE" is selected but there's no indication what happens when you click CLIMATE or AI. Does the region coloring change? Do new icons appear? Preview this in hover states or show a split-screen comparison mode.

The layers promise different perspectives but don't deliver on "Aha, THAT'S why this region is collapsing."

### Integration Concerns

**Completely disconnected from Research Tree:** If South Asia has Water Shortage crisis, why isn't there a visual connection to "Enhanced Weathering" or "Desalination" research? Add subtle pulse animations or connecting lines between crises and relevant tech.

**Timeline doesn't connect to decisions:** The scrubber shows history but not "When did I recommend UBI?" or "When did fusion deployment start?" Player agency is invisible.

---

## Integration Analysis: Do They Work Together as a Dashboard Ecosystem?

### Current State: **4/10 (Siloed)**

**What's missing:**

**1. No visual connections between panels**

When ARIA explains ocean pH, the Global Map should highlight affected regions. When you click a crisis on the map, relevant research should pulse in the Research Tree. These are separate screens right now.

**2. No unified interaction language**

- Research Tree: Passive display + bottom panel for action
- ARIA Chat: Conversational + suggested questions
- Global Map: Hover for detail + timeline navigation

Each has its own UX paradigm. There's no consistent "verb set" across panels.

**3. No clear information flow / player loop**

What's the intended pattern? Should players:
- Start with map → identify crisis → ask ARIA → check research → take action?
- Start with research → see options → check map for urgency → decide priority?

Without a designed flow, players will randomly click and get lost.

### Proposed Integration Patterns for V2

**Pattern 1: Crisis → Response Loop**

```
Map crisis (Water Shortage)
  → ARIA explains (climate + infrastructure + policy factors)
  → Research Tree highlights (Enhanced Weathering, Desalination)
  → Player recommends research
  → Map shows projected impact (simulation paused for preview)
```

**Pattern 2: Research → Impact Loop**

```
Research Tree shows "Fusion Energy: 78% complete"
  → Map highlights regions that would benefit most
  → ARIA explains "Fusion deployment could replace 40% coal in South Asia, reducing..."
  → Player sees projected QoL impact
```

**Pattern 3: Inquiry Loop**

```
Player asks ARIA "Why is social stability falling?"
  → ARIA explains with data
  → Map zooms to affected regions
  → Research Tree shows relevant social techs (UBI, Digital Literacy)
  → Player can drill deeper or take action
```

**Implementation:** These loops require **cross-panel highlighting/animation** and **shared state** (clicked item in one panel affects others).

---

## "One More Turn" Hooks: Currently Missing

**Critical gap:** Nothing here creates compulsion to keep playing. Compare to great strategy games:

| Game | Hook Mechanic | Our Equivalent (Missing) |
|------|--------------|-------------------------|
| Civilization | "Just one more turn to finish this wonder" | "Fusion Energy 78% - ONE MORE MONTH" |
| XCOM | "I have to see if this mission succeeds" | "Water crisis intervention - will it work?" |
| Factorio | "Just need to optimize this one bottleneck" | "If I prioritize UBI, does stability improve?" |

**What's needed:**

**1. Progress visibility that creates anticipation**

Research Tree shows progress bars (good) but doesn't create tension. Add:
- "Breakthrough expected in 3 months" countdown
- "Funding at risk - political capital low" warnings
- "Competing nations ahead in AI race" competitive pressure

**2. Immediate feedback loops**

Right now everything feels "set it and forget it." Need:
- Real-time crisis escalation ("Water Shortage → FAMINE in 2 months without intervention")
- Research breakthroughs that unlock new options MID-SESSION
- Visible improvement from player choices ("Your UBI recommendation increased stability by 12%")

**3. Meaningful choices with visible consequences**

The Research Focus panel is closest to this, but needs:
- "Choose 2 of 5 urgent priorities" forced tradeoffs
- "This research will take 18 months - crisis may escalate before completion" tension
- "Other nations researching competing tech" race pressure

---

## Recommendations Summary for V2

### Research Tree (Highest Priority)
1. Add "Recommend" interaction to all AVAILABLE cards
2. Show crisis relevance on each card (why this tech matters NOW)
3. Communicate opportunity cost in Research Focus panel

### ARIA Chat (Medium Priority)
1. Add action bridges to other panels (Explore research / View regions)
2. Strengthen personality/voice to match advisor role
3. Add conversation history/context awareness

### Global Map (Highest Priority)
1. Make crises clickable with action options
2. Visualize relationships/flows between regions
3. Clarify what layer switcher actually does

### Integration (CRITICAL for V2)
1. Implement cross-panel highlighting (crisis → relevant research)
2. Design primary player loop (Crisis → ARIA → Research → Action)
3. Add "one more turn" hooks (countdown timers, breakthrough anticipation, visible impact)

---

## Final Thought: Information vs Engagement

These mockups excel at **information display** but underperform on **player engagement**. They're dashboards for VIEWING the simulation, not dashboards for PLAYING it.

**The shift needed:** From "Here's what's happening" to "Here's what's happening - what will you do?"

Every panel needs affordances for ACTION, not just OBSERVATION. The simulation is a research tool, yes, but the player is a Director with agency. Right now, they feel like a spectator.

**V2 goal:** Make every panel answer two questions:
1. What's happening? (V1 does this well)
2. What can I do about it? (V1 doesn't answer this)

---

## Appendix: Cross-Reference to Design Docs

Based on review of GAME_DESIGN_DOCUMENT.md:

**Alignment with "Indirect Agency" principle:** ⚠️ PARTIAL
- Research Tree shows indirect influence (recommend research) ✓
- But doesn't show probability shifts or uncertainty bands ✗
- Missing "projected probability shifts (with uncertainty bands)" from Phase 3 Interface

**Alignment with "Progressive Disclosure" principle:** ✓ GOOD
- Overview Dashboard: Map provides global health (simple)
- System Deep Dives: Region detail panel, Research cards
- Intervention Interface: Research Focus panel (partial)
- Analysis Mode: Not shown in mockups

**Alignment with "No Hidden Parameters" principle:** ✓ EXCELLENT
- Research cards show costs, timelines, requirements, citations
- Map shows composite + layer breakdowns
- ARIA provides numerical data with sources

**Alignment with "Crisis Opening" narrative:** ⚠️ UNCLEAR
- Map shows crises (Water Shortage, Heat Stress, Food Crisis) ✓
- But unclear if this is Month 1 or Month 54
- No visual urgency cues ("This requires immediate response")
- Timeline scrubber shows Month 54/120 - this is MID-GAME, not opening

**Alignment with "AI Advisor" personality:** ⚠️ NEEDS WORK
- ARIA's tone is clinical/Wikipedia, not "competent-calm-wry"
- Missing personality traits from spec (slightly wry, seen a lot, hasn't lost hope)
- Suggested questions are functional but not character-driven

---

**Next Steps for Round 2:**
- Implement top 3 improvements per element
- Add cross-panel interaction (highlight crisis → relevant research)
- Introduce ONE "one more turn" hook mechanism
- Test with: "Can a new player figure out what to DO in 30 seconds?"
