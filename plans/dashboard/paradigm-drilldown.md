# Subplan 1A: Paradigm Cards with Drill-Down ✨

**Phase:** 1 (Mission Control)
**Agent Assignment:** Agent 1
**Duration:** 2-3 days
**Priority:** HIGHEST (user requested feature!)
**Dependencies:** Phase 0 complete, Phase -1C complete (paradigms API)

---

## Context

**USER REQUESTED FEATURE:**
> "I think something that would be cool is to click on the paradigms and be able to drill down into the indicators that make up that paradigm's overall score"

This is the signature feature of the Mission Control dashboard.

### Key Documents
- **API Endpoint:** `/api/dashboard/paradigms` (Subplan -1C)
- **Design Spec:** `docs/design/dashboard-redesign-spec.md` (Paradigm drill-down)

---

## Feature Requirements

### 4 Paradigm Score Cards

1. **Western Liberal** (cyan)
   - Democracy Index
   - Civil Liberties
   - Rule of Law
   - Economic Freedom

2. **Development** (green)
   - Life Expectancy
   - Quality of Life
   - GDP per Capita

3. **Ecological** (light green)
   - 9 Planetary Boundaries (climate, biosphere, land, water, etc.)

4. **Indigenous** (amber)
   - Social Trust
   - Community Infrastructure
   - Meaning & Purpose

### Click Interaction → Side Panel

**Behavior:**
- Click paradigm card → side panel slides in from right (300ms)
- Panel shows 4-19 indicators (depends on paradigm)
- Each indicator: progress bar + 12-month sparkline + current value
- Regional breakdown (15 countries) available
- Click outside or ESC key → panel slides out

**Visual:**
- Glass morphism background
- Glow effect matching paradigm color
- Smooth animations

---

## Implementation

### 1. Paradigm Card Component
```typescript
// src/components/dashboard/ParadigmCard.tsx

interface ParadigmCardProps {
  paradigm: {
    id: string;
    name: string;
    overallScore: number;
    status: 'utopia' | 'hybrid' | 'dystopia';
  };
  onClick: () => void;
}

export function ParadigmCard({ paradigm, onClick }: ParadigmCardProps) {
  const color = getParadigmColor(paradigm.id);
  const statusColor = paradigm.status === 'utopia' ? 'green' :
                      paradigm.status === 'dystopia' ? 'red' : 'amber';

  return (
    <button
      onClick={onClick}
      className="glass p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer"
      style={{ borderColor: color }}
    >
      <div className="text-sm text-gray-400">{paradigm.name}</div>
      <div className="text-4xl font-bold glow-cyan mt-2">
        {(paradigm.overallScore * 100).toFixed(1)}
      </div>
      <div className={`text-xs mt-2 badge-${statusColor}`}>
        {paradigm.status.toUpperCase()}
      </div>
    </button>
  );
}
```

### 2. Drill-Down Side Panel
```typescript
// src/components/dashboard/ParadigmDrillDown.tsx

interface ParadigmDrillDownProps {
  paradigmId: string | null;
  onClose: () => void;
}

export function ParadigmDrillDown({ paradigmId, onClose }: ParadigmDrillDownProps) {
  const { data, isLoading } = useParadigmData();

  if (!paradigmId) return null;

  const paradigm = data?.paradigms.find(p => p.id === paradigmId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] glass-dark z-50 p-8 overflow-y-auto slide-left">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{paradigm?.name} Indicators</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Indicators List */}
        <div className="space-y-6">
          {paradigm?.indicators.map(indicator => (
            <IndicatorCard key={indicator.name} indicator={indicator} />
          ))}
        </div>
      </div>
    </>
  );
}
```

### 3. Indicator Card Component
```typescript
// src/components/dashboard/IndicatorCard.tsx

interface IndicatorCardProps {
  indicator: {
    name: string;
    description: string;
    current: number;
    threshold: number;
    status: 'good' | 'warning' | 'critical';
    trend: 'improving' | 'worsening' | 'stable';
    sparkline: number[];
    regionalBreakdown?: Record<string, number>;
  };
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  return (
    <div className="glass p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{indicator.name}</h3>
          <p className="text-xs text-gray-400">{indicator.description}</p>
        </div>
        <StatusIndicator status={indicator.status} />
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-800 rounded-full mt-3">
        <div
          className={`absolute h-full rounded-full bg-${getStatusColor(indicator.status)}`}
          style={{ width: `${(indicator.current / indicator.threshold) * 100}%` }}
        />
      </div>

      {/* Current Value + Trend */}
      <div className="flex justify-between items-center mt-2 text-sm">
        <span className="font-mono">{indicator.current.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <TrendArrow trend={indicator.trend} />
          <LineChart data={indicator.sparkline} width={80} height={20} />
        </div>
      </div>

      {/* Regional Breakdown (Collapsible) */}
      {indicator.regionalBreakdown && (
        <RegionalBreakdown data={indicator.regionalBreakdown} />
      )}
    </div>
  );
}
```

### 4. Main Dashboard Integration
```typescript
// src/app/dashboard/page.tsx

export default function MissionControlPage() {
  const [selectedParadigm, setSelectedParadigm] = useState<string | null>(null);
  const { data } = useParadigmData();

  return (
    <div>
      {/* 4 Paradigm Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {data?.paradigms.map(paradigm => (
          <ParadigmCard
            key={paradigm.id}
            paradigm={paradigm}
            onClick={() => setSelectedParadigm(paradigm.id)}
          />
        ))}
      </div>

      {/* Other mission control sections... */}

      {/* Drill-Down Panel */}
      <ParadigmDrillDown
        paradigmId={selectedParadigm}
        onClose={() => setSelectedParadigm(null)}
      />
    </div>
  );
}
```

---

## Acceptance Criteria

✅ 4 paradigm cards render with scores + status
✅ Click card → side panel slides in (300ms)
✅ Panel shows all indicators for paradigm:
  - Western Liberal: 4 indicators
  - Development: 3+ indicators
  - Ecological: 9 indicators
  - Indigenous: 3+ indicators
✅ Each indicator shows:
  - Progress bar (current vs threshold)
  - Status (good/warning/critical)
  - Trend arrow
  - 12-month sparkline
✅ Regional breakdown available (collapsible)
✅ Click outside or ESC closes panel
✅ Smooth animations (slide-left, fade-in)
✅ Accessibility: keyboard navigation, ARIA labels

---

## Deliverables

**Files:**
- `src/components/dashboard/ParadigmCard.tsx` (~80 lines)
- `src/components/dashboard/ParadigmDrillDown.tsx` (~150 lines)
- `src/components/dashboard/IndicatorCard.tsx` (~120 lines)
- `src/components/dashboard/RegionalBreakdown.tsx` (~80 lines)
- `src/hooks/useParadigmData.ts` (~30 lines)

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation (Phase 0 + -1C must be complete)
