# Handoff: Game UI Implementation

**To:** far-future-ux-designer (Tessa)
**From:** orchestrator-1
**Date:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD

---

## Task: Build Action Panel UI + Event Display

**Duration:** 5-7 hours total
**Prerequisites:** Roy's implementation complete (Tasks 2.3-2.4)
**Output:**
- `src/components/dashboards/game/ActionPanel.tsx`
- `src/components/dashboards/game/EventLog.tsx`
- `src/components/dashboards/game/OutcomeChart.tsx`

---

## Component 1: ActionPanel (Task 2.5)

See `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md` lines 506-618 for detailed requirements.

**Visual layout:**
```
┌─────────────────────────────────────────┐
│ Player Resources                        │
│ 🌟 Reputation: ███████░░░ 75/100       │
│ 🏛️ Political Capital: █████░░░░░ 55/100│
│ 💰 Funding: $2.3B                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Available Actions                       │
├─────────────────────────────────────────┤
│ [🤖 AI Safety Awareness]                │
│ ~2-3% safety support increase (6 months)│
│ Cost: 10 reputation, 15 political       │
│ Cooldown: 3 months                      │
│                              [QUEUE] ←  │
└─────────────────────────────────────────┘
```

**Key requirements:**
- Show uncertainty ranges (~2-3% not 2.5%)
- Disable buttons on cooldown/insufficient resources
- Use Elysium-inspired far-future aesthetic (clean, minimal, soft blue/white)
- Wire to `GameStateProvider.queueAdvocacyAction()`

**Component structure:**
```tsx
'use client';
import { useGameState } from '@/game/providers/GameStateProvider';

export function ActionPanel() {
  const { gameSession, gameState } = useGameState();
  const [actions, setActions] = useState([]);
  const [resources, setResources] = useState({});

  const handleQueueAction = (actionId: string) => {
    const result = gameSession?.queueAdvocacyAction(actionId);
    // Show success/error notification
  };

  return (
    <div className="action-panel">
      <ResourceDisplay resources={resources} />
      <ActionList actions={actions} onQueue={handleQueueAction} />
      <PendingDecisions decisions={gameState?.decisionHistory} />
    </div>
  );
}
```

---

## Component 2: EventLog (Task 4.2)

See `plans/PHASE4_INTEGRATION_POLISH_EXECUTION_PLAN.md` lines 31-39.

**Requirements:**
- Replace mock events with real simulation events
- Filter by severity (info, warning, critical)
- Add attribution: "Your advocacy contributed to this" vs "Despite your actions..."
- Wire to `SimulationObserver`

**Visual layout:**
```
┌──────────────────────────────────────┐
│ Event Log (filter: all ▼)            │
├──────────────────────────────────────┤
│ 🌍✅ Month 45: Climate coalition     │
│      Your US-China dialogue          │
│      contributed to this success     │
│                                      │
│ ☢️💥 Month 37: Nuclear escalation    │
│      This happened despite your      │
│      cooperation actions             │
│                                      │
│ 🤖🔬 Month 22: AI alignment          │
│      breakthrough                    │
│      Your research funding helped    │
└──────────────────────────────────────┘
```

---

## Component 3: OutcomeChart (Task 4.1)

See `plans/PHASE4_INTEGRATION_POLISH_EXECUTION_PLAN.md` lines 19-29.

**Requirements:**
- Show outcome distribution (utopia → extinction) as probability bars
- Display how probabilities shift after player actions
- Show uncertainty bands (not false precision)
- Compare baseline vs player-influenced trajectory

**Visual layout:**
```
Outcome Probabilities (with player actions vs baseline)

Utopia       ████░░░░░░ 10% (baseline: 5%)
Flourishing  ██████░░░░ 18% (baseline: 12%)
Stable       ████████░░ 25% (baseline: 28%)
Decline      ██████░░░░ 22% (baseline: 25%)
Dystopia     ████░░░░░░ 15% (baseline: 18%)
Collapse     ██░░░░░░░░  8% (baseline: 10%)
Extinction   ░░░░░░░░░░  2% (baseline:  2%)

Your actions increased positive outcomes by ~5%
```

---

## Styling (Elysium-inspired aesthetic)

**Color palette:**
- Background: Soft white (#FAFBFC)
- Text: Dark gray (#2C3E50)
- Primary: Soft blue (#5DADE2)
- Success: Muted green (#52C77A)
- Warning: Soft orange (#F39C12)
- Critical: Muted red (#E74C3C)

**Typography:**
- Clean, sans-serif (Inter, SF Pro, Helvetica)
- Generous spacing
- Subtle animations on hover

**Key principle:** Communicate complexity without overwhelming. Show uncertainty without false precision.

---

## Testing

```bash
# Component tests
npm test src/components/dashboards/game/ActionPanel.test.tsx

# Visual regression (if Storybook configured)
npm run storybook
```

---

## Success Criteria

- ✅ ActionPanel shows actions, resources, cooldowns, costs
- ✅ EventLog shows real simulation events with attribution
- ✅ OutcomeChart shows probability distributions
- ✅ Uncertainty communicated (ranges, not false precision)
- ✅ Far-future aesthetic (Elysium-inspired)
- ✅ Integration with GameStateProvider works

---

## After Completion

Post to implementation channel:
```markdown
---
**tessa** | 2025-12-06 | [COMPLETED]

Tasks 2.5 + 4.1-4.2 complete: Game UI components

**Files changed:**
- src/components/dashboards/game/ActionPanel.tsx (NEW)
- src/components/dashboards/game/EventLog.tsx (NEW)
- src/components/dashboards/game/OutcomeChart.tsx (NEW)

**Testing:** ✅ Component tests pass, visual regression clean

**Handoff:** Ready for architecture review
**Next:** architecture-skeptic performance review
---
```

---

## References

- **Execution plans:** `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md` Task 2.5, `plans/PHASE4_INTEGRATION_POLISH_EXECUTION_PLAN.md` Tasks 4.1-4.2
- **GameStateProvider:** `src/game/providers/GameStateProvider.tsx`
- **Action catalog:** `src/game/data/advocacyActions.ts` (Roy's output)
