# Dashboard Elements Review V2

**Game Designer: Maya**
**Date:** 2025-11-24
**Round:** 2 of 4 (Iterative Refinement)

---

## Updated Scores

| Element | V1 Score | V2 Score | Change |
|---------|----------|----------|--------|
| **Research Tree** | 7.5/10 | **8.5/10** | +1.0 |
| **ARIA Chat** | 6.0/10 | **7.5/10** | +1.5 |
| **Global Map** | 5.5/10 | **6.5/10** | +1.0 |

**Overall:** Solid iteration. Each element shows meaningful improvement in player agency and information flow.

---

## What Improved vs V1?

### Research Tree (+1.0)
**Strong improvements:**
- **Active Loop panel** - Game-changer. Shows 3 concurrent priorities with crisis context (e.g., "South Asia Heat Crisis NOW: Death toll climbing")
- **Notification badges** - "12/21 Unlocked" creates clear progression visibility
- **Crisis relevance badges** - "⚠️ Closer to trifecta" and "🔥 12% cost multiplier" connect research to stakes
- **Recommend button** - "Execute Recommendation" bridges analysis → action gap

**What works:** The Active Loop transforms the tree from passive knowledge into active decision-making. Players can see *why* they need Advanced Battery Storage *now* (crisis context), not just *what* it does.

### ARIA Chat (+1.5)
**Strong improvements:**
- **Conversation history** - Previous exchange visible ("Why is ocean pH dropping so fast?") creates continuity
- **Warmer personality** - "IF I WERE YOU, I'D CHECK:" feels less clinical, more advisory
- **Action bridges** - Three suggestion icons (🔬 show research, 📊 compare scenario, 💀 cascading effects) directly link to other panels

**What works:** ARIA now feels like a strategic partner, not a help menu. The "IF I WERE YOU" framing + actionable suggestions creates player buy-in.

### Global Map (+1.0)
**Strong improvements:**
- **Connection lines** - Dashed lines between regions (South Asia → neighbors) show cascade propagation
- **Relationship tooltips** - Hovering shows connections (implied by design)
- **Regional detail panel** - South Asia sidebar shows 6/9 boundaries crossed, active crises, clear metrics

**What works:** The map now communicates *relationships* not just *status*. Players can see how South Asia's collapse could destabilize neighbors.

---

## Top 2-3 Improvements for V3 (Round 2 Refinement)

### Research Tree
**Priority 1: Active Loop Interactivity**
- Make the "Active Loop" panel *clickable* - selecting an item instantly opens its detail card below
- Add "Defer" button next to "Execute Recommendation" (teaches opportunity cost)
- Show time-to-completion estimate ("18 months at current priorities")

**Priority 2: Opportunity Cost Clarity**
- When hovering "Advanced Battery Storage", highlight what *won't* get done (e.g., "Delays: Personalized Medicine by 8 months")
- This is the core strategic trade-off - v3 should make it visceral

### ARIA Chat
**Priority 1: Context Awareness**
- ARIA's responses should reference *what's on screen* - "I see you're looking at South Asia. Their water shortage..."
- This creates the feeling ARIA is watching *with* you, not responding to isolated queries

**Priority 2: Tutorial Scaffolding**
- First-time users get tutorial prompts ("Try asking: What happens if I ignore climate?")
- After 10 interactions, ARIA's tone shifts to assume player competence

### Global Map
**Priority 1: Cascade Visualization**
- When hovering a region, *animate* the cascade propagation (dashed lines pulse outward)
- Show "If South Asia collapses → 850M refugees → neighbors destabilize" flowchart on hover

**Priority 2: Layer Interactivity**
- Clicking a layer filter (CLIMATE, SOCIAL, AI) should *dim* non-relevant connection lines
- This lets players toggle between "climate cascade view" and "AI capability spread view"

**Priority 3: Temporal Dimension**
- Bottom timeline should be draggable - scrub backward to see "South Asia was stable in Month 20, what changed?"
- Compare mode: Split-screen showing current state vs baseline scenario

---

## Integration Assessment: Active Loop Panel

**Does it work?** **Yes, emphatically.**

**Why it succeeds:**
1. **Urgency without noise** - Shows 3 priorities, not 21. Clear hierarchy.
2. **Crisis context** - "South Asia Heat Crisis NOW" ties research decisions to *lives* (not abstract metrics)
3. **Actionable** - "Execute Recommendation" button creates direct player agency
4. **Opportunity cost framing** - Shows what you're *not* doing (other 18 unlocked techs)

**What makes it good game design:**
- **Reduces analysis paralysis** - Players don't need to scan 21 techs, just validate/override 3 recommendations
- **Teaches priority** - The AI is showing its reasoning (crisis relevance, cost multipliers), not just dictating
- **Respects player autonomy** - Recommend ≠ require. Players can override, but the default is intelligent

**Integration risks (watch for v3):**
- If ARIA says "prioritize ocean alkalinity" but Active Loop shows "prioritize battery storage", players won't know who to trust
- **Fix:** ARIA's suggestions should *reference* the Active Loop ("I agree with the recommendation for Advanced Battery, but consider...")

**Next-level integration (v4):**
- Let players *drag* items from the tree into the Active Loop panel (manual override)
- Active Loop becomes the "mission control" - players compose their 3-priority queue, then execute

---

## V3 Strategic Focus

**Theme:** Refine what's working, deepen interactivity.

**Do more of:**
- Active Loop as decision hub (make it *more* central, not just a sidebar)
- ARIA as context-aware advisor (reference what player is looking at)
- Map as cascade visualization (animate propagation, show temporal change)

**Avoid:**
- Feature creep - v2 added a lot, v3 should *deepen* those features, not add new ones
- Over-tutorialization - Let players discover ARIA's depth through use, don't front-load 10 tooltips

**Round 2 positioning:** V1 was "show the systems", V2 was "connect the systems", **V3 should be "make the systems responsive"** (clicks do things, hovers show consequences, changes propagate).

---

## Summary

**V2 → V3 is about interaction depth, not feature breadth.**

The Active Loop proved the concept: giving players *smart defaults with override capability* works. Now apply that pattern everywhere:
- ARIA: Smart suggestions with override (ask your own questions)
- Map: Smart layer filtering with override (toggle what matters)
- Research: Smart priorities with override (defer/replace recommendations)

**Target V3 scores:** Research Tree 9.0, ARIA 8.5, Global Map 7.5 (realistic for round 2 refinement).
