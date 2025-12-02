# Threshold Uncertainty UI Integration Plan

**Date:** October 26, 2025
**Purpose:** Add UI controls for Phase 1 & Phase 2 threshold sampling during simulation initialization
**Complexity:** ~4-6 hours (UI design, component creation, state management, integration)

---

## User Mental Model

**Target Users:** Researchers/analysts running Monte Carlo simulations

**Key Questions Users Need Answered:**
1. "What assumptions am I making about uncertain thresholds?"
2. "How will different runs vary based on these thresholds?"
3. "Can I adjust these ranges to test scenarios?"

**Core Insight:** Make epistemic uncertainty **visible and controllable**, not hidden.

---

## UX Design: Progressive Disclosure

### Default View (Collapsed)
```
┌─────────────────────────────────────────────────────┐
│ ⚙️ THRESHOLD UNCERTAINTY (10 thresholds)            │
│ ├─ Using research-backed distributions              │
│ └─ [Show Details ▼]                                 │
└─────────────────────────────────────────────────────┘
```

**Rationale:** Most users want research defaults. One-click to understand what's happening.

### Expanded View (Tier 1 - Empirical)
```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ THRESHOLD UNCERTAINTY                             [▲]    │
│                                                              │
│ === TIER 1: Empirical Thresholds (High Confidence) ===      │
│                                                              │
│ 🌍 Climate Sensitivity (°C warming per CO₂ doubling)        │
│ ├─ Distribution: Normal(μ=3.0, σ=0.5)                       │
│ ├─ Range: 2.0 - 4.5°C (95% CI)                              │
│ ├─ [──────●──────] Triangular visualization                 │
│ ├─ Source: IPCC AR6 (2021), Sherwood et al. (2020)          │
│ └─ Why it matters: Controls climate tipping point timing    │
│                                                              │
│ 👥 Social Critical Mass (population fraction)               │
│ ├─ Distribution: Triangular(0.15, 0.20, 0.25)               │
│ ├─ Range: 15-25% (Mode: 20%)                                │
│ ├─ [────●────] Peak at 20%                                  │
│ ├─ Source: Centola (2018), Nyhan & Reifler (2019)           │
│ └─ Why it matters: Threshold for social movements/norms     │
│                                                              │
│ [5 more Tier 1 thresholds...]                               │
│                                                              │
│ === TIER 2: Historical Ranges (Moderate Confidence) ===     │
│                                                              │
│ 🏛️ Government Legitimacy Crisis (legitimacy %)              │
│ ├─ Distribution: Triangular(0.25, 0.30, 0.40)               │
│ ├─ Range: 25-40% (Mode: 30%)                                │
│ ├─ [──●──] Most collapses at ~30%                           │
│ ├─ Source: Weimar, USSR, Arab Spring case studies           │
│ └─ Why it matters: State collapse threshold                 │
│                                                              │
│ [4 more Tier 2 thresholds...]                               │
│                                                              │
│ [Reset to Defaults] [Use Custom Distributions]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Visual Design Elements

### Distribution Visualizer (Sparkline)

**Triangular Distribution:**
```
    ●
   ╱ ╲
  ╱   ╲
 ╱     ╲
├───┼───┤
min mode max
```

**Normal Distribution:**
```
    ╭─●─╮
   ╱     ╲
  ╱       ╲
 ╱         ╲
├────┼────┤
 μ-σ  μ  μ+σ
```

**Uniform Distribution:**
```
┌────────┐
│        │
│        │
├────────┤
min     max
```

### Icons by Threshold
- 🌍 Climate Sensitivity
- 👥 Social Critical Mass
- 🛡️ Trust Recovery
- 🤖 Automation Displacement
- 🏛️ Government Legitimacy
- 👁️ Surveillance Dystopia
- 🔄 AI Recursive Improvement
- 😡 Resentment Revolt

---

## Information Architecture

### Tier 1: Empirical Thresholds (5 thresholds)
1. **Climate Sensitivity** - Normal(3.0, 0.5), IPCC AR6
2. **Social Critical Mass** - Triangular(0.15, 0.20, 0.25), Centola (2018)
3. **Trust Recovery Time** - Log-Normal(μ=3.0, σ=0.5), Schweitzer et al. (2013)
4. **Automation Transition Speed** - Beta(α=2, β=5), Acemoglu & Restrepo (2022)
5. **Detection Ceiling** - Beta(α=2, β=3), Adversarial evaluation research

### Tier 2: Historical Ranges (5 thresholds)
1. **Government Legitimacy Crisis** - Triangular(0.25, 0.30, 0.40), State collapse cases
2. **Surveillance Dystopia** - Uniform(0.65, 0.80), Authoritarian states
3. **Automation Displacement** - Triangular(0.40, 0.50, 0.60), Industrial Revolution
4. **AI Recursive Improvement** - Uniform(1.2, 1.5), Technological analogs
5. **Resentment Revolt Trigger** - Triangular(0.60, 0.70, 0.80), Historical revolutions

---

## Component Structure

```typescript
// New components
src/components/thresholds/
├── ThresholdConfigSection.tsx       // Main collapsible section
├── ThresholdDistributionControl.tsx // Individual threshold editor
├── DistributionVisualizer.tsx       // Sparkline visualization
└── ThresholdPresetSelector.tsx      // Preset scenarios (optional Phase 2)

// Updated components
src/components/tabs/ControlsTab.tsx  // Add threshold section
src/lib/contexts/SimulationWorkerContext.tsx // Accept threshold overrides
```

---

## Implementation Phases

### Phase 1: Read-Only Display (2-3 hours)
**Goal:** Show users what thresholds are being sampled

**Tasks:**
1. Create `ThresholdConfigSection.tsx` - Collapsible section with Tier 1 & 2 lists
2. Create `DistributionVisualizer.tsx` - SVG sparklines for distribution shapes
3. Add section to `ControlsTab.tsx` between scenario and alignment config
4. Display research-backed defaults (no editing yet)

**UI Features:**
- ✅ Show all 10 thresholds with distributions
- ✅ Visual sparklines (Triangular/Normal/Uniform/Beta)
- ✅ Research citations and "Why it matters" descriptions
- ✅ Collapsible by tier (Tier 1 vs Tier 2)
- ❌ No editing (Phase 2)

### Phase 2: Custom Distribution Override (2-3 hours)
**Goal:** Let advanced users adjust ranges for scenario testing

**Tasks:**
1. Add "Use Custom Distributions" mode toggle
2. Create `ThresholdDistributionControl.tsx` - Sliders for min/mode/max
3. Update worker context to accept threshold overrides
4. Pass custom thresholds to `createInitialState()`

**UI Features:**
- ✅ Toggle between "Research Defaults" and "Custom"
- ✅ Sliders for min/mode/max (where applicable)
- ✅ Live preview of distribution shape updates
- ✅ Reset to defaults button
- ✅ Warning if ranges deviate significantly from research

---

## State Management

### ThresholdConfig Interface
```typescript
interface ThresholdConfig {
  useDefaults: boolean;  // true = research-backed, false = custom
  overrides?: {
    tier1?: Partial<Tier1Thresholds>;
    tier2?: Partial<Tier2Thresholds>;
  };
}
```

### Integration with Worker
```typescript
// ControlsTab.tsx state
const [thresholdConfig, setThresholdConfig] = useState<ThresholdConfig>({
  useDefaults: true
});

// Pass to worker on initialization
workerContext.initialize({
  scenario: selectedScenario,
  thresholds: thresholdConfig.useDefaults
    ? undefined  // Use defaults
    : sampleCustomThresholds(thresholdConfig.overrides)
});
```

### Worker Changes
```typescript
// simulationWorker.ts
case 'INITIALIZE': {
  const state = createInitialState(
    message.scenario,
    message.seed,
    message.thresholds  // NEW: Optional pre-sampled thresholds
  );
  // ...
}
```

---

## Copy & Descriptions

### Section Header
**Title:** "Threshold Uncertainty Configuration"
**Subtitle:** "Control how uncertain parameters are sampled across simulation runs"

### Tier 1 Header
**Title:** "Tier 1: Empirical Thresholds (High Confidence)"
**Description:** "Based on peer-reviewed research with statistical confidence intervals"

### Tier 2 Header
**Title:** "Tier 2: Historical Ranges (Moderate Confidence)"
**Description:** "Derived from historical case studies and technological analogs"

### Individual Threshold Format
```
[Icon] [Threshold Name] ([Unit])
├─ Distribution: [Type]([params])
├─ Range: [min] - [max] ([Mode if triangular])
├─ [Visualization]
├─ Source: [Research citation]
└─ Why it matters: [1 sentence impact explanation]
```

---

## Accessibility & UX Polish

1. **Keyboard Navigation:** All controls accessible via Tab/Enter
2. **Screen Readers:** Proper ARIA labels for distribution visualizations
3. **Tooltips:** Hover over distribution types for explanations
4. **Help Text:** Link to `/docs/wiki/README.md#threshold-uncertainty` for details
5. **Mobile Responsive:** Stack threshold cards vertically on small screens
6. **Loading States:** Show skeleton while fetching defaults
7. **Error States:** Handle invalid custom ranges gracefully

---

## Testing Checklist

### Functional Tests
- [ ] Default view shows 10 thresholds collapsed
- [ ] Expand shows Tier 1 (5) and Tier 2 (5) thresholds
- [ ] Distribution visualizers render correctly for each type
- [ ] Custom mode allows editing ranges
- [ ] Reset button restores research defaults
- [ ] Custom thresholds pass to worker correctly
- [ ] Multiple simulation runs sample different values

### Visual Tests
- [ ] Sparklines render for all distribution types
- [ ] Layout works on mobile (320px width)
- [ ] Dark mode compatibility (far-future aesthetic)
- [ ] Icons render correctly
- [ ] Tooltips position correctly

### Edge Cases
- [ ] Invalid ranges (min > max) show error
- [ ] Extreme ranges show warning
- [ ] Switching scenarios resets thresholds
- [ ] Worker handles missing threshold overrides gracefully

---

## Future Enhancements (Not in Scope)

1. **Scenario Presets** - "Conservative", "Moderate", "Extreme" threshold bundles
2. **Monte Carlo Integration** - Visual display of threshold variation across N runs
3. **Sensitivity Analysis** - Show which thresholds most affect outcomes
4. **Export/Import** - Save custom threshold configs as JSON
5. **Historical Replay** - Load thresholds from previous simulation runs

---

## File Changes

### New Files (3)
1. `/src/components/thresholds/ThresholdConfigSection.tsx` (~200 lines)
2. `/src/components/thresholds/DistributionVisualizer.tsx` (~100 lines)
3. `/plans/threshold-uncertainty-ui-plan.md` (this file)

### Modified Files (3)
1. `/src/components/tabs/ControlsTab.tsx` - Add threshold section (~50 lines)
2. `/src/lib/contexts/SimulationWorkerContext.tsx` - Accept threshold overrides (~20 lines)
3. `/src/workers/simulationWorker.ts` - Handle threshold initialization (~10 lines)

### Total Effort
- Phase 1 (Read-Only): 2-3 hours
- Phase 2 (Custom Override): 2-3 hours
- **Total: 4-6 hours**

---

## Success Criteria

**Must Have:**
- ✅ Users can see all 10 thresholds with research citations
- ✅ Distribution shapes visually represented
- ✅ Collapsed by default (progressive disclosure)
- ✅ "Why it matters" explanations for each threshold

**Should Have:**
- ✅ Custom distribution override mode
- ✅ Reset to defaults functionality
- ✅ Warning for extreme deviations

**Nice to Have:**
- 🎯 Preset scenario bundles
- 🎯 Monte Carlo threshold variation display
- 🎯 Export/import custom configs

---

**Last Updated:** October 26, 2025
