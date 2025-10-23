# Subplan 1D: Active Crises Panel

**Phase:** 1 (Mission Control)
**Agent Assignment:** Agent 4
**Duration:** 1-2 days
**Priority:** HIGH
**Dependencies:** Phase 0 complete, Phase -1D complete (crises API)

---

## Context

Display active crises with severity, affected population, and intervention windows.

### Crisis Types (10 total)
- Phosphorus depletion
- Freshwater scarcity
- Ocean acidification
- Novel entities pollution
- Wet bulb temperature events
- Nuclear escalation
- Genocide
- Antimicrobial resistance
- Famine cascades
- Societal collapse

---

## Implementation

```typescript
// src/components/dashboard/ActiveCrisesPanel.tsx

export function ActiveCrisesPanel() {
  const { data, isLoading } = useCrisesData();

  if (isLoading) return <LoadingSpinner />;

  const activeCrises = data.activeCrises;

  if (activeCrises.length === 0) {
    return (
      <div className="glass p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Active Crises</h2>
        <div className="text-center text-success py-8">
          ✓ No Active Crises
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-xl font-bold mb-4">
        Active Crises ({activeCrises.length})
      </h2>

      <div className="space-y-3">
        {activeCrises.map(crisis => (
          <CrisisCard key={crisis.type} crisis={crisis} />
        ))}
      </div>
    </div>
  );
}

interface CrisisCardProps {
  crisis: {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedPopulation: number;
    interventionWindow: number; // months
    cascadeMultiplier: number;
  };
}

function CrisisCard({ crisis }: CrisisCardProps) {
  const severityColor = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }[crisis.severity];

  return (
    <div className={`glass border-l-4 border-${severityColor} p-4 rounded`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{crisis.type}</h3>
          <div className="text-xs text-gray-400 mt-1">
            {formatLargeNumber(crisis.affectedPopulation)} people affected
          </div>
        </div>
        <Badge color={severityColor}>{crisis.severity.toUpperCase()}</Badge>
      </div>

      <div className="flex gap-4 mt-3 text-xs">
        <div>
          <span className="text-gray-500">Intervention Window:</span>
          <span className="ml-2 font-mono">{crisis.interventionWindow} months</span>
        </div>
        <div>
          <span className="text-gray-500">Cascade Multiplier:</span>
          <span className="ml-2 font-mono">{crisis.cascadeMultiplier.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

✅ Crisis cards render for all active crises
✅ Severity color-coded (critical/high/medium/low)
✅ Affected population formatted (2.5B)
✅ Intervention window shown in months
✅ Cascade multiplier displayed
✅ Empty state if no crises
✅ Click crisis → navigate to Crisis Dashboard

---

## Deliverables

**Files:**
- `src/components/dashboard/ActiveCrisesPanel.tsx` (~100 lines)
- `src/hooks/useCrisesData.ts` (~30 lines)

---

**Last Updated:** October 22, 2025
