# Subplan 1C: AI Agent Distribution

**Phase:** 1 (Mission Control)
**Agent Assignment:** Agent 3
**Duration:** 2-3 days
**Priority:** CRITICAL (fixes major bug)
**Dependencies:** Phase 0 complete, Phase -1D complete (agents API)

---

## Context

**FIXES CRITICAL BUG:**
Current dashboard shows only `aiAgents[0]`, ignoring other 19 agents!

**From Architecture Review:**
> "OverviewDashboard.tsx lines 52-53: Shows ONLY first agent instead of distribution of 20 agents. This is aggregation fallacy (Railsback & Grimm 2019)."

### Research Justification

**Railsback & Grimm (2019):**
> "Aggregating agent-based model outputs obscures bimodal distributions, outliers, and heterogeneity critical to understanding system dynamics."

**Solution:** Violin plots showing full distribution of 20 agents.

---

## Implementation

### 1. Agent Distribution Section
```typescript
// src/components/dashboard/AgentDistributionSection.tsx

export function AgentDistributionSection() {
  const { data, isLoading } = useAgentData();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-xl font-bold mb-6">AI Agent Distribution</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Capability Distribution */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">Capability Distribution</h3>
          <ViolinPlot
            data={data.distributions.capability.violinPlotBins}
            width={300}
            height={200}
            color="cyan"
          />
          <DistributionStats stats={data.distributions.capability} />
        </div>

        {/* Alignment Distribution */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">Alignment Distribution</h3>
          <ViolinPlot
            data={data.distributions.alignment.violinPlotBins}
            width={300}
            height={200}
            color="green"
          />
          <DistributionStats stats={data.distributions.alignment} />
          {data.distributions.alignment.outliers.length > 0 && (
            <OutlierAlert outliers={data.distributions.alignment.outliers} />
          )}
        </div>
      </div>

      {/* Agent Grid (20 agents) */}
      <div className="mt-6">
        <h3 className="text-sm text-gray-400 mb-3">Individual Agents</h3>
        <div className="grid grid-cols-5 gap-3">
          {data.agents.map(agent => (
            <AgentMiniCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2. Violin Plot Component
```typescript
// src/components/charts/ViolinPlot.tsx (from Phase 0D)

interface ViolinPlotProps {
  data: Array<{ value: number; count: number }>;
  width: number;
  height: number;
  color: string;
}

export function ViolinPlot({ data, width, height, color }: ViolinPlotProps) {
  // Visx violin plot implementation
  // Shows full distribution shape (NOT just mean!)
}
```

### 3. Distribution Stats Component
```typescript
// src/components/dashboard/DistributionStats.tsx

interface DistributionStatsProps {
  stats: {
    count: number;
    mean: number;
    median: number;
    quartiles: [number, number, number];
    min: number;
    max: number;
  };
}

export function DistributionStats({ stats }: DistributionStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs mt-3">
      <div>
        <div className="text-gray-500">Mean</div>
        <div className="font-mono">{(stats.mean * 100).toFixed(1)}</div>
      </div>
      <div>
        <div className="text-gray-500">Median</div>
        <div className="font-mono">{(stats.median * 100).toFixed(1)}</div>
      </div>
      <div>
        <div className="text-gray-500">Range</div>
        <div className="font-mono">
          {(stats.min * 100).toFixed(0)}-{(stats.max * 100).toFixed(0)}
        </div>
      </div>
    </div>
  );
}
```

### 4. Agent Mini Card
```typescript
// src/components/dashboard/AgentMiniCard.tsx

interface AgentMiniCardProps {
  agent: {
    id: string;
    trueAlignment: number;
    capabilityAvg: number;
    isSleeper: boolean;
    lifecycleState: string;
  };
}

export function AgentMiniCard({ agent }: AgentMiniCardProps) {
  return (
    <button
      className="glass p-3 rounded-lg hover:scale-105 transition-transform"
      onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
    >
      <div className="text-xs text-gray-500">Agent {agent.id.slice(-4)}</div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-sm font-mono">
          {(agent.capabilityAvg * 100).toFixed(0)}
        </div>
        <StatusIndicator
          status={agent.trueAlignment > 0.7 ? 'good' : agent.trueAlignment < 0.3 ? 'critical' : 'warning'}
          size="sm"
        />
      </div>
      {agent.isSleeper && (
        <div className="text-xs text-danger mt-1">⚠️ Sleeper</div>
      )}
    </button>
  );
}
```

### 5. Outlier Alert
```typescript
// src/components/dashboard/OutlierAlert.tsx

interface OutlierAlertProps {
  outliers: Array<{ id: string; trueAlignment: number }>;
}

export function OutlierAlert({ outliers }: OutlierAlertProps) {
  return (
    <div className="bg-danger/10 border border-danger/30 rounded p-3 mt-3">
      <div className="text-xs font-semibold text-danger">
        ⚠️ {outliers.length} Deeply Misaligned Agents
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Beyond 2σ from mean alignment
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

✅ Violin plots render for capability + alignment
✅ Distribution stats show mean, median, quartiles, range
✅ ALL 20 agents shown (NOT just first!)
✅ Agent mini cards clickable (navigate to detail)
✅ Outlier alert appears if deeply misaligned agents exist
✅ Sleeper agents flagged with warning
✅ Bimodal distributions visible (if present)
✅ Accessibility: ARIA labels for violin plots

---

## Deliverables

**Files:**
- `src/components/dashboard/AgentDistributionSection.tsx` (~120 lines)
- `src/components/dashboard/DistributionStats.tsx` (~50 lines)
- `src/components/dashboard/AgentMiniCard.tsx` (~60 lines)
- `src/components/dashboard/OutlierAlert.tsx` (~40 lines)
- `src/hooks/useAgentData.ts` (~30 lines)

---

**Last Updated:** October 22, 2025
