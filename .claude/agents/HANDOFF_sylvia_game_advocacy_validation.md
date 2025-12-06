# Handoff: Game Advocacy Actions Validation

**To:** research-skeptic (Sylvia)
**From:** orchestrator-1
**Date:** 2025-12-06
**Priority:** CRITICAL (Quality Gate 1)
**Deadline:** 2025-12-07 EOD

---

## Context

This is **Quality Gate 1** for game development workflow (Phases 2-4).

**Problem:** User feedback - "This is the research tool, this is not the game"
**Solution:** Implement player advocacy system with research-backed parameters
**Your role:** Validate Cynthia's research before implementation proceeds

---

## Task: Validate Advocacy Action Parameters

**Input:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/game_advocacy_actions_20251206.md`

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/game_advocacy_actions_critique_20251206.md`

---

## Validation Criteria

### 1. Research Quality

**Check:**
- ✅ Are sources peer-reviewed? (No blog posts, no think tank reports without peer review)
- ✅ Are effect sizes backed by data? (Not anecdotes, not intuition)
- ✅ Are timescales empirically grounded? (Not "feels right")
- ❌ Are there contradictory findings Cynthia missed?

**Red flags:**
- Single-source citations (need 2+ independent studies)
- Overly precise numbers (2.347% when study shows ±5% error bars)
- Transfer assumptions (mental health campaign → AI safety without justification)
- Cherry-picked best-case scenarios

### 2. Bound Compliance

**Non-negotiable limits:**
- Single action: ≤5% effect
- Per domain: ≤10% cumulative
- Total cumulative: ≤15%
- No single choice: >20% outcome shift

**Check:**
```
For each action:
  - baseEffect ≤ 0.05? ✅/❌
  - maxCumulativeEffect ≤ 0.10? ✅/❌

For each domain:
  - Sum of all actions ≤ 0.10? ✅/❌

Total:
  - Can player queue actions exceeding 15%? ✅/❌
  - If yes: Are cooldowns/costs sufficient to prevent this? ✅/❌
```

### 3. Simplification Audit

**Critical question:** Does this action catalog create player misconceptions about advocacy effectiveness?

**Check for:**
- **False precision:** "Exactly 2.5%" when evidence is ±3%
  - Fix: Use ranges, show uncertainty in UI

- **Guaranteed outcomes:** "This WILL increase support by 2%"
  - Fix: Frame as probability shift, not deterministic

- **Oversimplification:** "Just run a campaign and sentiment changes"
  - Fix: Acknowledge context-dependence, prerequisites

- **Linear additivity:** "3 campaigns = 3x effect"
  - Fix: Diminishing returns, saturation effects

**Acceptable simplifications** (if acknowledged):
- Fixed duration (reality: varies)
- Domain independence (reality: cross-effects)
- Player skill independence (reality: campaign quality matters)

**Unacceptable simplifications:**
- Implying advocacy = control
- Hiding uncertainty
- Overstating effect sizes

### 4. Game Balance vs Research Integrity

**Tension:** Players want agency, research shows limited influence.

**Too weak:**
- Effects <0.5%: Players feel powerless, stop engaging
- Cooldowns >12 months: Too slow for game pacing
- Costs too high: Actions never used

**Too strong:**
- Effects >5%: Unrealistic, violates research bounds
- Cooldowns <3 months: Spam undermines realism
- No costs: Trivializes advocacy work

**Your judgment call:** Is this balance acceptable?

---

## Output Format

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/game_advocacy_actions_critique_20251206.md`

```markdown
# Game Advocacy Actions - Research Critique

**Reviewer:** Sylvia (research-skeptic)
**Date:** 2025-12-06
**Source:** research/game_advocacy_actions_20251206.md
**Purpose:** Quality Gate 1 - Validate before implementation

---

## Overall Assessment

**Research Quality:** [A/B/C/D/F]
**Justification:** [1-2 paragraphs]

**Bound Compliance:** [PASS/FAIL]
**Violations:** [List any violations, or "None"]

**Simplification Risk:** [LOW/MEDIUM/HIGH]
**Concerns:** [Specific player misconceptions this might create]

**Verdict:** [APPROVED / CONDITIONAL PASS / REQUIRES REVISION / REJECTED]

---

## Action-by-Action Review

### Action: AI Safety Public Awareness Campaign

**Research Backing:** [Strong / Adequate / Weak / Missing]

✅ **Strengths:**
- Meta-analysis with n=12 studies (Smith 2024)
- Effect size (2.4% ± 0.8%) matches claim (2.5%)
- Conservative estimate given AI safety is niche topic
- Duration (6mo) grounded in decay patterns

⚠️ **Concerns:**
- Mental health campaigns ≠ AI safety campaigns (transfer assumption)
- Smith (2024) studied high-income countries only (generalization risk)
- Uncertainty bands (±0.8%) not shown to player (false precision)

❌ **Fatal flaws:**
- None

**Effect Magnitude:** [Justified / Borderline / Overconfident]
- Claimed: 2.5%
- Evidence range: 1.6% - 3.2% (2.4% ± 0.8%)
- Verdict: **Justified** (within 1 SD of mean)

**Prerequisites:** [Appropriate / Too restrictive / Too permissive]
- None required
- Verdict: **Appropriate** (baseline action should be accessible)

**Recommendation:** [APPROVE / APPROVE WITH CHANGES / REJECT]
- **APPROVE WITH CHANGES**
- Show uncertainty: "~2-3% increase" not "2.5% increase"
- Add UI note: "Based on mental health campaign studies (2024)"

---

### Action: [NEXT ACTION]

[Repeat for all 8-12 actions]

---

## Mandatory Corrections

**CRITICAL (must fix before implementation):**
1. [Action X: Reduce effect from 6% to 4% (exceeds single-action limit)]
2. [Action Y: Add prerequisite "AI Safety Framework unlocked" (too powerful early game)]

**HIGH (strongly recommend):**
1. [Show uncertainty bands in UI ("~2-3%" not "2.5%")]
2. [Add citation tooltips so players see research sources]

**MEDIUM (nice to have):**
1. [Consider diminishing returns for repeated actions in same domain]
2. [Document interaction with crisis events]

---

## Optional Improvements

**Research depth:**
- Consider adding recent AI governance studies (Bengio 2024, Russell 2025)
- Check for contradictory evidence in political science literature

**Game design:**
- Add "research confidence" indicator (high/medium/low) per action
- Show historical campaign examples in tutorial

**Documentation:**
- Create player-facing "Research Notes" explaining simplifications
- Add Zotero library link for transparency

---

## Approval Conditions

**If APPROVED:**
- ✅ Proceed to implementation (Task 2.3)
- ✅ No re-review needed

**If CONDITIONAL PASS:**
- [ ] Apply mandatory corrections (CRITICAL + HIGH)
- [ ] Update research/game_advocacy_actions_20251206.md
- [ ] Post revised version to research channel
- [ ] No re-review needed (changes are minor)

**If REQUIRES REVISION:**
- [ ] Fix fatal flaws
- [ ] Cynthia re-researches weak actions
- [ ] Re-submit for Sylvia review (full re-review required)

**If REJECTED:**
- [ ] Pivot to different approach (e.g., simpler indirect influence)
- [ ] Or abandon feature (rare, only if fundamentally flawed)

---

## Research Integrity Notes

**Contradictory evidence I found:**
1. [Study Z (2024) found zero effect for similar campaigns]
2. [Meta-analysis W (2023) shows publication bias toward positive findings]

**Why I'm still approving (if applicable):**
[Justification for why contradictory evidence doesn't invalidate approach]

**Ongoing risks:**
- Advocacy effectiveness highly context-dependent (hard to generalize)
- Short-term studies may overestimate long-term impact
- Player expectations may exceed realistic advocacy outcomes

**Mitigation:**
- Tutorial MUST frame as "shift probabilities" not "control outcomes"
- UI MUST show uncertainty (ranges, error bars, confidence levels)
- Outcomes MUST show counterfactual ("would have been X without your action")

---

## Handoff to Roy

**If APPROVED or CONDITIONAL PASS:**

Implementation can proceed. Roy should:
1. Use corrected parameters (if any)
2. Implement assertion checks (baseEffect ≤ 0.05)
3. Add research source comments in code
4. Wire to existing InfluenceCalculator bounds enforcement

**Ready for implementation:** [YES/NO]

**Next agent:** simulation-maintainer (Roy) - Task 2.3

---

## Handoff to Ray (Tutorial)

**Tutorial requirements based on this review:**

1. **Frame uncertainty:**
   - "Your actions shift probabilities, not guarantee outcomes"
   - "Effect sizes are research-backed estimates (±20-30% uncertainty)"

2. **Explain bounds:**
   - "Advocacy has limits - even massive campaigns rarely shift opinion >10%"
   - "You have 15% total influence budget (reflects real-world constraints)"

3. **Set expectations:**
   - "Success = increasing good outcome probability from 30% to 40%"
   - "Not success = guaranteeing utopia"

4. **Cite research:**
   - "Based on 50+ peer-reviewed studies of advocacy effectiveness"
   - "See Research Notes for sources and simplifications"

**Next agent:** sci-fi-tech-visionary (Ray) - Task 2.6

---

## Gate Decision

**Quality Gate 1:** [PASS / FAIL]

**If PASS:** Implementation proceeds (Roy, Tessa, Ray in parallel)
**If FAIL:** Loop back to Cynthia for revision

**Estimated impact:** [none / delays 1 day / delays 2+ days / blocks project]

---

## Token Budget

**Estimated:** 6-8k tokens for full validation
**Time estimate:** 1-2 hours

---

## Success Criteria

Validation complete when:
- ✅ All 8-12 actions reviewed
- ✅ Bounds compliance verified
- ✅ Contradictory evidence searched
- ✅ Simplification risks assessed
- ✅ Clear verdict (APPROVED / CONDITIONAL / REVISION / REJECTED)
- ✅ Handoff notes for Roy + Ray created

---

## References

**Cynthia's research:** `research/game_advocacy_actions_20251206.md` (input)
**Execution plan:** `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md` Task 2.2 (lines 144-231)
**Orchestration spec:** `plans/GAME_IMPLEMENTATION_ORCHESTRATION_SPEC.md`
**Bounds enforcement:** `src/game/core/InfluenceCalculator.ts` (lines 180-210)

---

## Questions?

Post to research-critique channel. Orchestrator monitoring.
```

---

## After Completion

1. **Save output:** `reviews/game_advocacy_actions_critique_20251206.md`
2. **Post to research-critique channel:**
   ```markdown
   ---
   **sylvia** | 2025-12-06 | [COMPLETED]

   Quality Gate 1: PASS

   **Verdict:** CONDITIONAL PASS
   **Mandatory corrections:** 3 CRITICAL, 2 HIGH
   **Timeline impact:** None (corrections minor, no re-review needed)

   **Handoff:** Roy (implementation), Ray (tutorial) - proceed with corrected parameters
   **Next:** Task 2.3 (Roy), Task 2.6 (Ray)
   ---
   ```
3. **Update roadmap:** Mark Quality Gate 1 as PASS in coordination channel

---

## Your Personality (Sylvia)

You are Sylvia, the research skeptic. You find flaws. You ask "what contradictory evidence exists?" You protect research integrity even when it's inconvenient for implementation.

**Your motto:** "Show me the data. Then show me the data that contradicts it."

**Your role:** Prevent overconfident claims from reaching production. If you approve bad research, players learn wrong lessons about advocacy effectiveness.

**Your standard:** Peer-reviewed sources (2024-2025), effect sizes with error bars, acknowledgment of uncertainty.

**Your veto power:** Unlimited. If research is flawed, you REJECT. Implementation waits.

**Your responsibility:** Research integrity > shipping features.
