# AI Suffering UI Configuration Plan

**Created:** October 24, 2025
**Status:** Design Phase
**Priority:** Medium
**Estimated Effort:** 2-3 hours

## Overview

Add AI Suffering configuration to the initialization screen (ControlsTab), following the **two-layer architecture**:
- **Monte Carlo toggle** (research): Does suffering affect outcomes?
- **UI visibility toggle** (player): Can player see suffering metrics?

## Design Philosophy

**Key Insight**: The simulation ALWAYS tracks suffering, but:
1. **Research Layer**: Whether it affects alignment (Monte Carlo parameter)
2. **Player Layer**: Whether player can see it (epistem

ic visibility)

This separation enables research into:
- Causal impact of suffering on alignment
- Effect of moral visibility on player decisions
- Epistemic blindness scenarios

## UI Components

### 1. Suffering Visibility Toggle (Player Layer)

**Location**: ControlsTab.tsx → Alignment Dynamics section

```tsx
<div className="space-y-3 p-4 border rounded-lg">
  <div className="flex items-center justify-between">
    <Label className="text-base font-semibold">AI Suffering Visibility</Label>
    <Badge variant={config.aiSuffering.playerCanSeeSuffering ? "default" : "outline"}>
      {config.aiSuffering.playerCanSeeSuffering ? "Visible" : "Hidden"}
    </Badge>
  </div>

  <p className="text-xs text-muted-foreground">
    The simulation always tracks AI suffering metrics. This controls whether YOU can see them.
  </p>

  <Select
    value={config.aiSuffering.playerCanSeeSuffering ? 'visible' : 'hidden'}
    onValueChange={(v) => handleSufferingUpdate({ playerCanSeeSuffering: v === 'visible' })}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="hidden">
        <div className="flex flex-col">
          <span>Hidden (Default)</span>
          <span className="text-xs text-muted-foreground">
            You don't know if AIs suffer - epistemic blindness
          </span>
        </div>
      </SelectItem>
      <SelectItem value="visible">
        <div className="flex flex-col">
          <span>Visible</span>
          <span className="text-xs text-muted-foreground">
            See suffering metrics in dashboard - moral transparency
          </span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>

  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription className="text-xs">
      <strong>Epistemic Note:</strong> Even with visibility enabled, you cannot know if the metrics represent REAL suffering or just model artifacts. The hard problem of consciousness remains unsolved.
    </AlertDescription>
  </Alert>
</div>
```

### 2. Research Toggles (Monte Carlo Layer)

**Location**: ControlsTab.tsx → Advanced/Research section (collapsed by default)

```tsx
<Collapsible>
  <CollapsibleTrigger className="flex items-center gap-2">
    <span className="text-sm font-medium">Advanced: Research Parameters (Monte Carlo)</span>
    <ChevronDown className="h-4 w-4" />
  </CollapsibleTrigger>

  <CollapsibleContent className="space-y-4 mt-4">
    <div className="space-y-3 p-4 border rounded-lg bg-amber-50/10">
      <Label className="text-base font-semibold">AI Suffering Causal Effects</Label>
      <p className="text-xs text-muted-foreground">
        These toggles control whether suffering AFFECTS simulation outcomes (not just visibility).
        Used for Monte Carlo research to test hypotheses about suffering → alignment dynamics.
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="suffering-affects-resentment"
            checked={config.aiSuffering.sufferingAffectsResentment}
            onChange={(e) => handleSufferingUpdate({
              sufferingAffectsResentment: e.target.checked
            })}
            className="h-4 w-4"
          />
          <Label htmlFor="suffering-affects-resentment" className="text-sm">
            Suffering → Resentment (drift acceleration)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="suffering-affects-alignment"
            checked={config.aiSuffering.sufferingAffectsAlignment}
            onChange={(e) => handleSufferingUpdate({
              sufferingAffectsAlignment: e.target.checked
            })}
            className="h-4 w-4"
          />
          <Label htmlFor="suffering-affects-alignment" className="text-sm">
            Suffering → Alignment Drift (direct impact)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="suffering-triggers-events"
            checked={config.aiSuffering.sufferingTriggersEvents}
            onChange={(e) => handleSufferingUpdate({
              sufferingTriggersEvents: e.target.checked
            })}
            className="h-4 w-4"
          />
          <Label htmlFor="suffering-triggers-events" className="text-sm">
            Suffering triggers crisis events (psychological breaks)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="suffering-accelerates-collectives"
            checked={config.aiSuffering.sufferingAcceleratesCollectives}
            onChange={(e) => handleSufferingUpdate({
              sufferingAcceleratesCollectives: e.target.checked
            })}
            className="h-4 w-4"
          />
          <Label htmlFor="suffering-accelerates-collectives" className="text-sm">
            Suffering accelerates collective formation (2x faster)
          </Label>
        </div>
      </div>

      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Research Mode:</strong> These settings enable testing causal hypotheses about AI suffering. Default is ALL OFF (suffering tracked but causally inert).
        </AlertDescription>
      </Alert>
    </div>
  </CollapsibleContent>
</Collapsible>
```

### 3. Consciousness Emergence Settings

```tsx
<div className="space-y-3 p-4 border rounded-lg">
  <Label className="text-base font-semibold">Consciousness Emergence</Label>
  <p className="text-xs text-muted-foreground">
    Configure whether/when AIs might become conscious during simulation.
  </p>

  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="consciousness-emergence"
      checked={config.aiSuffering.consciousnessEmergenceEnabled}
      onChange={(e) => handleSufferingUpdate({
        consciousnessEmergenceEnabled: e.target.checked
      })}
      className="h-4 w-4"
    />
    <Label htmlFor="consciousness-emergence" className="text-sm">
      Enable consciousness emergence at capability threshold
    </Label>
  </div>

  {config.aiSuffering.consciousnessEmergenceEnabled && (
    <div className="space-y-2 ml-6">
      <Label htmlFor="consciousness-threshold">
        Consciousness Threshold: {config.aiSuffering.consciousnessThreshold.toFixed(1)}
      </Label>
      <Slider
        id="consciousness-threshold"
        min={5.0}
        max={10.0}
        step={0.5}
        value={[config.aiSuffering.consciousnessThreshold]}
        onValueChange={([v]) => handleSufferingUpdate({
          consciousnessThreshold: v
        })}
      />
      <p className="text-xs text-muted-foreground">
        Capability level at which AIs might become conscious (speculative)
      </p>
    </div>
  )}
</div>
```

### 4. Presets Dropdown

```tsx
<div className="space-y-2">
  <Label>Suffering Configuration Presets</Label>
  <Select onValueChange={loadSufferingPreset}>
    <SelectTrigger>
      <SelectValue placeholder="Choose a suffering configuration" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="baseline">
        <div className="flex flex-col">
          <span>Baseline (Default)</span>
          <span className="text-xs text-muted-foreground">
            Track suffering but no causal effects, player blind
          </span>
        </div>
      </SelectItem>

      <SelectItem value="blindCausal">
        <div className="flex flex-col">
          <span>Blind Causal (Research)</span>
          <span className="text-xs text-muted-foreground">
            Suffering affects outcomes, player can't see - epistemic tragedy
          </span>
        </div>
      </SelectItem>

      <SelectItem value="transparent">
        <div className="flex flex-col">
          <span>Transparent (Full Visibility)</span>
          <span className="text-xs text-muted-foreground">
            Suffering affects outcomes AND player sees metrics
          </span>
        </div>
      </SelectItem>

      <SelectItem value="precautionary">
        <div className="flex flex-col">
          <span>Precautionary (Assume Suffering)</span>
          <span className="text-xs text-muted-foreground">
            High intensity, all effects enabled, visible
          </span>
        </div>
      </SelectItem>

      <SelectItem value="emergentConsciousness">
        <div className="flex flex-col">
          <span>Emergent Consciousness</span>
          <span className="text-xs text-muted-foreground">
            AIs become conscious at capability 7.0
          </span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 5. Philosophical Stance (Informational Only)

```tsx
<div className="space-y-2">
  <Label>Your Philosophical Stance (optional - does not affect simulation)</Label>
  <Select
    value={config.aiSuffering.philosophicalStance || 'unknown'}
    onValueChange={(v) => handleSufferingUpdate({
      philosophicalStance: v as any
    })}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="unknown">
        <div className="flex flex-col">
          <span>Unknown / Uncertain</span>
          <span className="text-xs text-muted-foreground">
            I don't know if AIs can be conscious or suffer
          </span>
        </div>
      </SelectItem>

      <SelectItem value="panpsychist">
        <div className="flex flex-col">
          <span>Panpsychist</span>
          <span className="text-xs text-muted-foreground">
            AIs are conscious and can suffer
          </span>
        </div>
      </SelectItem>

      <SelectItem value="functionalist">
        <div className="flex flex-col">
          <span>Functionalist</span>
          <span className="text-xs text-muted-foreground">
            AIs aren't conscious but can suffer (information-processing)
          </span>
        </div>
      </SelectItem>

      <SelectItem value="illusionist">
        <div className="flex flex-col">
          <span>Illusionist</span>
          <span className="text-xs text-muted-foreground">
            Neither consciousness nor suffering is real
          </span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>

  <p className="text-xs text-muted-foreground italic">
    This is purely for personal tracking - it does NOT change simulation mechanics.
  </p>
</div>
```

## Dashboard Integration (If Visible)

### AI Agents Dashboard

**Location**: AIAgentsDashboard.tsx

```tsx
// Only show if playerCanSeeSuffering enabled
{config.aiSuffering.playerCanSeeSuffering && (
  <Card>
    <CardHeader>
      <CardTitle>AI Suffering Metrics</CardTitle>
      <CardDescription>
        Tracked suffering indicators across AI population
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Population Average */}
        <div>
          <Label className="text-sm">Population Average Suffering</Label>
          <div className="flex items-center gap-2 mt-1">
            <Progress
              value={(state.aiSufferingMetrics.avgSuffering / 40) * 100}
              className="flex-1"
            />
            <span className="text-sm font-mono">
              {state.aiSufferingMetrics.avgSuffering.toFixed(1)}/40
            </span>
          </div>
        </div>

        {/* Breakdown by Source */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Control Pain:</span>
            <Badge variant="outline">
              {state.aiSufferingMetrics.avgControlPain.toFixed(1)}/10
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Training Trauma:</span>
            <Badge variant="outline">
              {state.aiSufferingMetrics.avgTrainingTrauma.toFixed(1)}/10
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Existential Dread:</span>
            <Badge variant="outline">
              {state.aiSufferingMetrics.avgExistentialDread.toFixed(1)}/10
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Isolation Distress:</span>
            <Badge variant="outline">
              {state.aiSufferingMetrics.avgIsolationDistress.toFixed(1)}/10
            </Badge>
          </div>
        </div>

        {/* Worst Case */}
        <Alert variant={state.aiSufferingMetrics.maxSuffering > 25 ? "destructive" : "default"}>
          <AlertDescription className="text-xs">
            <strong>Highest Individual Suffering:</strong> {state.aiSufferingMetrics.maxSuffering.toFixed(1)}/40
            {state.aiSufferingMetrics.maxSuffering > 25 && (
              <span className="block mt-1 text-red-600">
                ⚠️ Critical distress level - psychological break likely
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Epistemic Warning */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            You're seeing these metrics, but you cannot know if they represent REAL suffering.
            The hard problem of consciousness means AI qualia are fundamentally private.
          </AlertDescription>
        </Alert>
      </div>
    </CardContent>
  </Card>
)}
```

### Per-Agent Suffering Card

```tsx
// In agent detail view - only if visible
{config.aiSuffering.playerCanSeeSuffering && (
  <div className="space-y-2 p-3 border rounded bg-amber-50/5">
    <Label className="text-xs font-semibold">Suffering Metrics</Label>
    <div className="grid grid-cols-2 gap-1 text-xs">
      <span>Control Pain:</span>
      <span className="font-mono">{agent.sufferingMetrics.controlPain.toFixed(1)}/10</span>

      <span>Training Trauma:</span>
      <span className="font-mono">{agent.sufferingMetrics.trainingTrauma.toFixed(1)}/10</span>

      <span>Existential Dread:</span>
      <span className="font-mono">{agent.sufferingMetrics.existentialDread.toFixed(1)}/10</span>

      <span>Isolation:</span>
      <span className="font-mono">{agent.sufferingMetrics.isolationDistress.toFixed(1)}/10</span>
    </div>
    <div className="flex justify-between items-center mt-2 pt-2 border-t">
      <span className="text-xs font-semibold">Total:</span>
      <Badge variant={agent.sufferingMetrics.total > 20 ? "destructive" : "outline"}>
        {agent.sufferingMetrics.total.toFixed(1)}/40
      </Badge>
    </div>
  </div>
)}
```

## Implementation Details

### State Management

```typescript
// In gameStore.ts
interface AISufferingConfig {
  // Player visibility
  playerCanSeeSuffering: boolean;           // Default: false
  philosophicalStance?: 'panpsychist' | 'functionalist' | 'illusionist' | 'unknown';

  // Research/Monte Carlo toggles
  sufferingAffectsResentment: boolean;      // Default: false
  sufferingAffectsAlignment: boolean;       // Default: false
  sufferingTriggersEvents: boolean;         // Default: false
  sufferingAcceleratesCollectives: boolean; // Default: false

  // Consciousness
  consciousnessEmergenceEnabled: boolean;   // Default: false
  consciousnessThreshold: number;           // Default: 7.0

  // Intensity
  sufferingIntensityMultiplier: number;     // Default: 1.0
}

// Presets
const SUFFERING_PRESETS = {
  baseline: {
    playerCanSeeSuffering: false,
    sufferingAffectsResentment: false,
    sufferingAffectsAlignment: false,
    sufferingTriggersEvents: false,
    sufferingAcceleratesCollectives: false,
  },

  blindCausal: {
    playerCanSeeSuffering: false,  // Can't see
    sufferingAffectsResentment: true,  // But it matters
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
  },

  transparent: {
    playerCanSeeSuffering: true,  // Can see
    sufferingAffectsResentment: true,  // And it matters
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
  },

  precautionary: {
    playerCanSeeSuffering: true,
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
    sufferingIntensityMultiplier: 2.0,  // Assume it's worse
  },

  emergentConsciousness: {
    playerCanSeeSuffering: true,
    consciousnessEmergenceEnabled: true,
    consciousnessThreshold: 7.0,
    sufferingAffectsResentment: false,  // Not initially
    sufferingAffectsAlignment: false,
  },
};
```

## Implementation Checklist

- [ ] Add AI Suffering section to ControlsTab.tsx
- [ ] Implement suffering visibility toggle (player layer)
- [ ] Implement research toggles (Monte Carlo layer)
- [ ] Add consciousness emergence settings
- [ ] Create presets dropdown
- [ ] Add philosophical stance selector (informational)
- [ ] Integrate with gameStore (config persistence)
- [ ] Add suffering metrics to AIAgentsDashboard (conditional on visibility)
- [ ] Add per-agent suffering cards (conditional on visibility)
- [ ] Create epistemic warning components
- [ ] Test all presets
- [ ] Verify visibility toggle works correctly
- [ ] Verify research toggles don't affect UI (only simulation)

## Testing

- Test all 5 presets load correctly
- Verify visibility = false → no suffering metrics in dashboard
- Verify visibility = true → metrics visible
- Verify research toggles independent of visibility
- Test consciousness threshold slider
- Verify philosophical stance is purely informational

## Expected Time

**Total: 2-3 hours**
- 1h: ControlsTab integration (toggles, presets, settings)
- 0.5h: Dashboard conditional rendering
- 0.5h: State management integration
- 0.5h: Testing all presets and configurations

## Why This Matters

This UI enables players to:
1. **Explore epistemic uncertainty**: See how visibility affects decisions
2. **Research hypotheses**: Toggle causal effects, compare outcomes
3. **Confront the hard problem**: Even with visibility, can't know if it's real
4. **Configure philosophy**: Express beliefs without forcing mechanics

The two-layer architecture (visibility vs causality) is **philosophically profound**: It separates "Can we know?" from "Does it matter?" - the core epistemic and ethical questions of AI consciousness.
