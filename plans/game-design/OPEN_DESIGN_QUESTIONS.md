# Open Design Questions

**Status:** Active Discussion
**Last Updated:** November 25, 2025

These questions require resolution before Phase 2 implementation can proceed. Each question has stakeholder positions documented and requires user decision when perspectives conflict.

---

## CRITICAL: Game Timeline Duration

**Question:** Should the game run for 10 years (120 months), 100 years (1200 months), or use variable-speed turns?

**Raised By:** User (November 25, 2025)
**Affects:** Phase 2 implementation, player experience design, research integrity
**Priority:** CRITICAL - Foundational to entire game design

### Maya's Position (Game Design / Engagement)

**Concern:** 1200 turns is too long - risks losing player attention

**Arguments:**
- Players need to see consequences of choices reasonably quickly
- "100 years" sounds like a grind, not an engaging experience
- Each turn needs to feel meaningful
- Modern game attention spans: 10-40 hours, not 100+ hours
- Risk: Players abandon before seeing long-term consequences anyway

**Recommendation:** 10 years (120 months) with compressed timescales for teaching purposes

### Sylvia's Position (Research Integrity / Accuracy)

**Concern:** 10 years teaches the WRONG lesson about planetary systems

**Arguments:**
- Planetary boundaries operate on 50-100 year timescales (research-grounded)
- Climate recovery/collapse: decades to centuries
- Biodiversity restoration: 30-100 years minimum
- Intergenerational effects: THE POINT of "What happens after alignment?"
- Ocean acidification, AMOC collapse, permafrost feedback: 50+ year dynamics
- If we compress to 10 years, we misrepresent how these systems actually work
- **Core question of simulation:** "What happens AFTER we solve alignment?" - needs generational timescales

**Recommendation:** 100 years (1200 months) to match actual system dynamics

### Proposed Compromise: Asymmetric Turn Structure

**Duration:** 100 years total, ~160 turns

**Turn Structure:**
- **Years 1-10 (120 turns):** Monthly turns - High player agency, crisis response
  - Intensive decision-making
  - AI emergence window
  - Critical junctures frequent

- **Years 11-40 (30 turns):** Yearly turns - Medium player agency, observe trajectory
  - Major interventions only
  - Watch initial choices play out
  - Course corrections possible

- **Years 41-100 (12 turns):** 5-year turns - Low player agency, witness outcomes
  - Final state convergence
  - Planetary-scale effects visible
  - Intergenerational consequences clear

**What This Teaches:**
1. "The choices I make NOW set trajectories that play out for DECADES"
2. "I can't micromanage the future - I set initial conditions"
3. "Consequences lag - what looks good at Year 10 might collapse at Year 40"
4. "Temporal discounting is a cognitive bias" - most players will over-optimize for Act 1, crash in Act 3

**Implementation Complexity:** Medium
- Simulation already supports long runs (hindcasting = 408 months)
- Turn speed logic needs implementation
- UI needs to communicate time compression clearly

### User Decision Required

**Options:**
1. **Accept Maya's position:** 10 years, optimize for engagement
2. **Accept Sylvia's position:** 100 years, optimize for accuracy
3. **Accept compromise:** Asymmetric turns (160 total)
4. **Other:** User proposes alternative

**Default (No Decision):** Sylvia's position holds (Research Integrity Authority)

**To Decide:** Document decision in this file with rationale

---

## Other Open Questions

### From Phase 1 Technical Spec

1. **Influence Decay**
   - Question: Should player influence effects decay over time, or be permanent?
   - Status: Maya recommends decay to prevent "spend early" exploit
   - Required: Before Phase 2

2. **Coalition Complexity**
   - Question: How complex should coalition mechanics be in Phase 1?
   - Status: Pending
   - Required: Before Phase 2

3. **Custom Scenarios**
   - Question: Should custom scenarios (for academic users) be Phase 1 or Phase 2?
   - Status: Pending
   - Required: Phase priority decision

4. **Counterfactual Tracking**
   - Question: Should we track baseline runs for "what if" comparison?
   - Status: Pending (would show impact of player choices)
   - Required: Before Phase 3

5. **Minimal UI for Phase 1**
   - Question: What's the minimal UI needed for Phase 1 testing?
   - Status: Pending
   - Required: Before Phase 1 conclusion

---

## Decision Process

When Maya and Sylvia disagree:

1. Both document positions in this file
2. Evidence provided:
   - Maya: Gameplay rationale + player experience data
   - Sylvia: Research integrity concerns + specific risks
3. User decides
4. Decision documented with rationale

**Default:** If no user decision, Sylvia's position holds (Research Integrity Authority per GAME_DEVELOPMENT_ROADMAP.md)

---

## Approval Tracking

| Question | Maya | Sylvia | User | Status |
|----------|------|--------|------|--------|
| Game Timeline | 10 years | 100 years | Pending | OPEN |
| Influence Decay | Yes (decay) | Pending | Pending | OPEN |
| Coalition Complexity | Pending | Pending | Pending | OPEN |
| Custom Scenarios | Pending | Pending | Pending | OPEN |
| Counterfactuals | Pending | Pending | Pending | OPEN |

---

## Document History

- **2025-11-25:** Created, added Game Timeline question (User raised, CRITICAL priority)
