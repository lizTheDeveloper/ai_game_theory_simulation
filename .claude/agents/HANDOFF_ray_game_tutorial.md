# Handoff: Game Tutorial Content

**To:** sci-fi-tech-visionary (Ray)
**From:** orchestrator-1
**Date:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD

---

## Task: Write Tutorial Content (Task 2.6)

**Duration:** 2-3 hours
**Prerequisites:** Sylvia's validation complete
**Output:** `src/game/data/tutorialContent.ts`
**Word count:** 500-800 words total

---

## Requirements (from Sylvia)

See `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md` lines 622-678.

**Frame indirect influence correctly:**
- ❌ BAD: "Choose actions to control the simulation"
- ✅ GOOD: "Advocate for changes that shift probabilities"

**Communicate uncertainty:**
```
"Your actions affect the simulation indirectly - like advocacy in the real world.
A public awareness campaign doesn't guarantee policy change, but it shifts public
sentiment, which influences policymakers, which affects outcomes.

Effect sizes are research-backed ranges (e.g., 2-5%), not guaranteed values."
```

**Explain influence budget:**
```
"You have limited influence (15% total) to prevent any single player from
dominating outcomes. This reflects research showing that advocacy campaigns
have bounded effects - even massive movements rarely shift public opinion
by more than 10-20% in the short term."
```

**Set realistic expectations:**
```
"This is not a power fantasy. You're an advocacy organization with finite
resources trying to nudge a complex system. Success means increasing the
probability of good outcomes from 30% to 45%, not guaranteeing utopia."
```

---

## Tutorial Sections

1. **Welcome** (1-2 screens)
2. **How Advocacy Works** (2-3 screens)
3. **Action Catalog Overview** (1 screen)
4. **Resource Management** (1 screen)
5. **Reading Outcomes** (1 screen)
6. **First Action Tutorial** (interactive)

---

## Output Format

```typescript
// src/game/data/tutorialContent.ts

export interface TutorialSection {
  id: string;
  title: string;
  content: string;
  example?: string;
}

export const TUTORIAL_CONTENT: TutorialSection[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Game Layer',
    content: `This is not a direct control simulation - you're playing as an advocacy organization
trying to shift the probability of positive outcomes in a complex world.

Your influence is limited and uncertain, just like real-world advocacy. But your actions matter.`,
  },

  {
    id: 'how_advocacy_works',
    title: 'How Advocacy Works',
    content: `Public awareness campaigns don't guarantee policy change. They shift public sentiment,
which influences policymakers, which affects outcomes. Each action has:

- Effect size: ~1-5% probability shift (research-backed)
- Duration: 6-24 months (effects decay over time)
- Cooldown: 3-12 months (can't spam same action)
- Cost: Reputation, political capital, or funding

Think of it like pushing a boulder uphill - consistent pressure matters, but you can't control exactly where it lands.`,
  },

  // ... 4 more sections
];

/**
 * Sylvia validation notes:
 * - Framing approved (indirect influence, not control)
 * - Uncertainty properly communicated
 * - Player expectations realistic
 * - Research backing mentioned
 */
```

---

## Sylvia Review Criteria (Must Pass)

- ✅ No false precision ("exactly 2.5%" → "~2-3%")
- ✅ Accurately represents research uncertainty
- ✅ Doesn't oversell player agency
- ✅ Explains simplifications appropriately

---

## Success Criteria

- ✅ 500-800 words total
- ✅ Framing: indirect influence, not control
- ✅ Uncertainty communicated
- ✅ Realistic expectations set
- ✅ Sylvia approval obtained

---

## After Completion

Post to implementation channel + request Sylvia review:
```markdown
---
**ray** | 2025-12-06 | [COMPLETED]

Task 2.6 complete: Tutorial content written

**Output:** src/game/data/tutorialContent.ts (650 words, 6 sections)

**Handoff:** Sylvia for final approval (Quality Gate 1.5)
**Next:** Pending Sylvia sign-off before proceeding
---
```

---

## References

- **Execution plan:** `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md` lines 622-678
- **Validation criteria:** `.claude/agents/HANDOFF_sylvia_game_advocacy_validation.md` lines 295-318
