# Subplan 1E: System Health Grid

**Phase:** 1 (Mission Control)
**Agent Assignment:** Agent 5
**Duration:** 1-2 days
**Priority:** MEDIUM
**Dependencies:** Phase 0 complete, Phase -1C complete (overview API)

---

## Context

Display 9-module grid showing health of all major systems.

### Research Justification

**Wang et al. (2023):**
> "Cognitive load threshold: ≤9 modules per tier prevents user overwhelm (N=56 study)."

### 9 System Categories

1. Environmental (planetary boundaries)
2. Social (cohesion, trust, meaning)
3. Technological (AI risk, safety debt)
4. Governmental (effectiveness, democracy)
5. Economic (growth, inequality)
6. Nuclear (deterrence, risk)
7. Detection (sleeper, gaming)
8. Welfare (AI welfare dimensions)
9. Crises (active cascades)

---

## Implementation

```typescript
// src/components/dashboard/SystemHealthGrid.tsx

export function SystemHealthGrid() {
  const { data, isLoading } = useOverviewData();

  if (isLoading) return <LoadingSpinner />;

  const systems = [
    { name: 'Environmental', health: data.systemHealth.environmental, icon: Leaf },
    { name: 'Social', health: data.systemHealth.social, icon: Users },
    { name: 'Technological', health: data.systemHealth.technological, icon: Cpu },
    { name: 'Governmental', health: data.systemHealth.governmental, icon: Building },
    { name: 'Economic', health: data.systemHealth.economic, icon: DollarSign },
    { name: 'Nuclear', health: data.systemHealth.nuclear, icon: Radiation },
    { name: 'Detection', health: data.systemHealth.detection, icon: Eye },
    { name: 'Welfare', health: data.systemHealth.welfare, icon: Heart },
    { name: 'Crises', health: data.systemHealth.crises, icon: AlertTriangle },
  ];

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-xl font-bold mb-4">System Health</h2>

      <div className="grid grid-cols-3 gap-4">
        {systems.map(system => (
          <SystemCard key={system.name} system={system} />
        ))}
      </div>
    </div>
  );
}

function SystemCard({ system }) {
  const Icon = system.icon;
  const healthColor = {
    green: 'success',
    amber: 'warning',
    red: 'danger',
  }[system.health];

  return (
    <button
      className="glass p-4 rounded-lg hover:scale-105 transition-transform"
      onClick={() => router.push(`/dashboard/${system.name.toLowerCase()}`)}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 text-${healthColor}`} />
        <div>
          <div className="text-sm font-semibold">{system.name}</div>
          <StatusIndicator status={system.health} size="sm" />
        </div>
      </div>
    </button>
  );
}
```

---

## Acceptance Criteria

✅ Exactly 9 system cards (≤9 modules per tier)
✅ Color-coded health (green/amber/red)
✅ Icons for each system
✅ Click card → navigate to detail dashboard
✅ Grid layout (3×3)
✅ Hover effects

---

## Deliverables

**Files:**
- `src/components/dashboard/SystemHealthGrid.tsx` (~80 lines)

---

**Last Updated:** October 22, 2025
