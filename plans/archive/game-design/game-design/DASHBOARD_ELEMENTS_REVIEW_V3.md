# Dashboard Elements Review V3

**Game Designer: Maya**
**Date:** 2025-11-25
**Round:** 3 of 4 (Final Refinement)

---

## Updated Scores

| Element | V2 Score | V3 Score | Change |
|---------|----------|----------|--------|
| **Research Tree** | 8.5/10 | **9.0/10** | +0.5 |
| **ARIA Chat** | 7.5/10 | **8.5/10** | +1.0 |
| **Global Map** | 6.5/10 | **8.0/10** | +1.5 |

**Overall:** V3 hits the design brief. Active Loop is now genuinely interactive, ARIA feels context-aware, map cascades are animated. Ready for final polish.

---

## What's Now Excellent?

### Research Tree (9.0/10)
**Nailed it:**
- **Interactive Active Loop** - Defer/Accelerate buttons per item + time delay indicators ("6mo delay") make opportunity cost tangible
- **Reorder + AI Optimize buttons** - Players can manually override OR ask AI for optimal sequence
- **Time estimates update** - "Est. 18 months to completion" at top recalculates as you reorder (implied by dynamic time-delay labels)
- **Opportunity cost visibility** - "Not Prioritized (Delayed)" section shows Personalized Medicine (+8mo), Vertical Farming (+12mo)

**Why it works:** The Active Loop isn't just *showing* recommendations - it's a **functional mission control panel**. Players can see consequences (delays), adjust priorities (reorder), and trust the AI (optimize). This is player agency + intelligent defaults working together.

### ARIA Chat (8.5/10)
**Nailed it:**
- **Context awareness** - "📍 Context: I see you have the Research Tree open with Ocean Alkalinity at P2 in your Active Loop" is *chef's kiss*
- **Reference-aware suggestions** - "If I were you, I'd check: Should I move Ocean Alkalinity from P2 to P1? (Since pH is dropping faster than heat crisis mortality)"
- **Cross-panel integration** - Action buttons like "🔬 Highlight Enhanced Weathering in your tree" and "🌍 Switch to Map → South Asia crisis view"

**Why it works:** ARIA feels like a **co-pilot watching the same dashboard you are**. The suggestions aren't generic - they reference specific items in your Active Loop and observable metrics. This creates the illusion of awareness.

### Global Map (8.0/10)
**Nailed it:**
- **Cascade animations** - Crisis indicators have pulsing ripples (`cascade-ripple` class with `rippleExpand` animation) that visualize propagation
- **Animated flow arrows** - Migration/trade/cascade lines use different animation speeds (`flowAnimation`, `cascadePulse`) and colors (orange for migration, red for cascade)
- **Timeline previews** - Hovering regions shows `data-preview` attribute ("2030: HEAT CRISIS | 2035: 100M climate refugees")
- **Interactive crisis menus** - Clicking 💧 or 🔥 opens contextual actions ("💬 Ask ARIA why this is happening", "🏛️ Propose intervention (15 Political Capital)")

**Why it works:** The map now communicates **temporal dynamics** (timeline scrubber + previews) and **systemic relationships** (cascade animations). It's not a static snapshot - it's a living system you can interrogate.

---

## Final Polish for V4 (Minor Refinements Only)

### Research Tree
**Polish 1: Active Loop drag-and-drop UX**
- Visual feedback when dragging (already has `.loop-node.dragging` class) needs visible swap indicator
- Current: Reorder button likely opens modal. Better: Direct drag handles (⋮⋮ icon) for in-place reordering

**Polish 2: Crisis badge consistency**
- Crisis badges show "🔥 40% coal replacement" - clarify if this is *impact* or *requirement*
- Suggested format: "Addresses: 40% coal replacement" (makes it clear this tech *solves* crisis, not *needs* crisis)

### ARIA Chat
**Polish 1: Suggested questions formatting**
- Current suggestions have two-line format (question + context). Good, but could tighten spacing
- Move context metadata to right-aligned tag instead of second line (saves vertical space)

**Polish 2: Citation interaction**
- Citations show as links ("Rockstrom et al. (2023)") - on hover, show tooltip with abstract snippet
- Current: Tooltip says "Click to view paper abstract" but no visible preview. Add inline expansion on click.

### Global Map
**Polish 1: Layer switcher feedback**
- Layer buttons have hover state but switching layers doesn't visually transform the map enough
- Suggested: Climate layer should recolor regions by temperature delta (not just opacity), Social layer by trust score heatmap

**Polish 2: Timeline scrubber precision**
- Timeline marker is draggable but lacks tick marks for major events
- Add vertical lines at crisis/breakthrough events (already has `.event-marker` divs in timeline-events, but they're hidden)

**Polish 3: Crisis menu positioning**
- Crisis menus are positioned absolutely (style="left: 710px; top: 250px;") - will break on different screen sizes
- Calculate position dynamically based on crisis indicator's actual position

---

## Integration Assessment: V3 Delivers

**Did v3 hit the "make systems responsive" goal?** **Yes.**

**Evidence:**
1. **Active Loop interactivity** - Defer/Accelerate buttons + time estimates → system responds to player input
2. **ARIA context awareness** - References specific panel states ("I see you have Ocean Alkalinity at P2") → system observes player state
3. **Map cascade animations** - Ripples + animated flows → system visualizes propagation in real-time

**What makes v3 production-ready:**
- All three panels now *respond* to player actions (not just display state)
- Cross-panel integration is semantic (ARIA references Active Loop contents, map crises link to research tree)
- Animations are purposeful (cascades show *propagation*, not just decoration)

**Remaining gap (for v4):**
The three panels still feel like separate views of the same data. V4 should make them feel like **one integrated system** - e.g., clicking a crisis on the map should *automatically* highlight relevant research in the tree AND prompt ARIA with context.

---

## V4 Strategic Focus

**Theme:** **Unified interaction model** - all three panels respond to the same selection state.

**Target pattern:**
1. Player clicks South Asia heat crisis on map
2. Map: Region detail panel opens (already works)
3. Research Tree: Heat-relevant techs glow + Active Loop highlights if any match (NEW)
4. ARIA: Auto-suggests "I see you're looking at South Asia heat crisis. Here's why it's accelerating..." (NEW)

**This turns three panels into one coordinated system.**

**Expected V4 scores:** Research Tree 9.5/10, ARIA 9.0/10, Global Map 8.5/10 (final production quality).

---

## Summary

**V3 → V4 is about coordination, not features.**

Each panel is individually excellent. Research Tree has genuinely useful interactivity (reorder, optimize). ARIA feels context-aware. Map animates cascades beautifully.

**Final step:** Make them *talk to each other*. When you interact with one panel, the others should respond. That's when the dashboard becomes a system, not three widgets.

**Polish items are minor** - mostly UX tightening (drag handles, citation previews, layer colors). The hard work is done. V4 can focus on cross-panel state synchronization.

---

**Status:** Ready for v4 (final iteration). No major rework needed, just integration polish.
