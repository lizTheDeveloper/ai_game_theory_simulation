# Phase 1: Spiral Activation Diagnostic Logging - Implementation Specification

**Owner:** simulation-maintainer + priya (validation)
**Priority:** HIGH (blocks Phase 2 scenario testing)
**Complexity:** Medium (diagnostic logging + threshold tracking)

## Context

God mode test (all 73 technologies deployed at month 0) results in catastrophic failure despite massive tech deployment. The simulation has three spiral systems that should trigger positive feedback loops, but they aren't activating. We need diagnostic logging to understand WHY.

**Research Insight (Sylvia):**
- reviews/god_mode_gaps_research_roadmap_20251109.md: Tech effectiveness shows 81.5% biosphere but 0% novel entities
- research/SKEPTICAL_ANALYSIS_doom_predictions_20251110.md: Models may lack adaptive capacity + breakthrough tech trajectories
- Hypothesis: Technology alone doesn't trigger spirals - specific governance/social/political conditions required

## Three Spiral Systems

### 1. Upward Spirals (src/simulation/upwardSpirals.ts)
**6 spirals:** Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological

**Activation thresholds:**
- Abundance: materialAbundance >1.5 && energyAvailability >1.5 && (unemployment >0.6 && economicStage >=3)
- Cognitive: diseasesBurden <0.3 && healthcareQuality >0.8 && meaningCrisis <0.3 && (demonstratedBenefits && trust >0.6)
- Democratic: decisionQuality >0.7 && institutionalCapacity >0.7 && participationRate >0.6 && transparency >0.7 && not authoritarian
- Scientific: deployedTech >=4 && researchBudget >$50B && avgAICapability >1.2 && workflowAdaptation >=0.25
- Meaning: meaningCrisis <0.2 && avgCohesion >0.7 && culturalAdaptation >0.7 && autonomy >0.7 && culturalVitality >0.7
- Ecological: ecosystemHealth >0.7 && climateStability >0.7 && biodiversityIndex >0.7 && pollution <0.3 && resourceReserves >0.7

**Virtuous cascade:** 4+ spirals active → 1.2-1.6x amplification

### 2. Cooperative Spirals (src/simulation/cooperativeSpirals.ts)
**3 mechanisms:** Alignment success → Trust cascade, Collective action potential, Critical juncture reform

**Activation conditions:**
- Trust cascade: 2+ alignment milestones (no misaligned deployments 24mo, transparency >0.7, low alignment gap, crisis avoided)
- Collective action: trust*0.4 + institutions*0.35 + monitoring*0.25 > 0.6
- Critical juncture: institutionalCapacity <0.5 && recent crisis && informationIntegrity >0.5 && alignment success

### 3. Positive Tipping Points (src/simulation/positiveTippingPoints.ts)
**5 technologies:** Solar PV, EVs, Wind, Heat Pumps, Battery Storage

**Activation thresholds:** Market share 5-20% → S-curve adoption cascade

## Task 1: Add Diagnostic Logging to God Mode Test

### Required Changes to scripts/godModeTest.ts

**Add monthly spiral status tracking:**

```typescript
// After line 85 (result = engine.run(...)), before final output
// Track spiral activation every month
const spiralHistory: SpiralActivationLog[] = [];

interface SpiralActivationLog {
  month: number;
  upwardSpirals: {
    abundance: { active: boolean; strength: number; blockers: string[] };
    cognitive: { active: boolean; strength: number; blockers: string[] };
    democratic: { active: boolean; strength: number; blockers: string[] };
    scientific: { active: boolean; strength: number; blockers: string[] };
    meaning: { active: boolean; strength: number; blockers: string[] };
    ecological: { active: boolean; strength: number; blockers: string[] };
    cascadeActive: boolean;
    cascadeStrength: number;
  };
  cooperativeSpirals: {
    alignmentMilestones: number;
    trustCascadeTriggered: boolean;
    collectiveActionPotential: number;
    criticalJunctureDetected: boolean;
  };
  positiveTippingPoints: {
    activeCascades: number;
    triggeredCascades: string[];
    marketShares: { [tech: string]: number };
  };
}
```

**Capture state snapshots monthly:**

Since we can't modify engine.run(), we need to add a custom run loop OR capture state from events. Recommendation: Modify god mode test to run month-by-month with diagnostics.

```typescript
// Replace engine.run() with manual monthly stepping
for (let month = 0; month < maxMonths; month++) {
  engine.step(state);

  // Capture spiral diagnostics
  spiralHistory.push(captureSpiralDiagnostics(state));

  // Check for early termination
  if (state.outcome && state.outcome !== 'ONGOING') break;
}
```

**Implement captureSpiralDiagnostics():**

```typescript
function captureSpiralDiagnostics(state: GameState): SpiralActivationLog {
  const upward = state.upwardSpirals;
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;
  const env = state.environmentalAccumulation;
  const gov = state.government.governanceQuality;

  return {
    month: state.currentMonth,
    upwardSpirals: {
      abundance: {
        active: upward.abundance.active,
        strength: upward.abundance.strength,
        blockers: getAbundanceBlockers(state)
      },
      cognitive: {
        active: upward.cognitive.active,
        strength: upward.cognitive.strength,
        blockers: getCognitiveBlockers(state)
      },
      // ... repeat for all 6 spirals
      cascadeActive: upward.cascadeActive,
      cascadeStrength: upward.cascadeStrength
    },
    cooperativeSpirals: {
      alignmentMilestones: countAlignmentMilestones(state),
      trustCascadeTriggered: hasTrustCascade(state),
      collectiveActionPotential: calculateCollectiveActionPotential(state),
      criticalJunctureDetected: detectCriticalJunctureForReform(state)
    },
    positiveTippingPoints: {
      activeCascades: state.positiveTippingPoints.activeCascades,
      triggeredCascades: state.positiveTippingPoints.triggeredCascades.map(c => c.type),
      marketShares: extractMarketShares(state)
    }
  };
}
```

**Implement blocker detection functions:**

```typescript
function getAbundanceBlockers(state: GameState): string[] {
  const blockers: string[] = [];
  const qol = state.qualityOfLifeSystems;

  if (qol.materialAbundance <= 1.5) blockers.push(`materialAbundance=${qol.materialAbundance.toFixed(2)} (need >1.5)`);
  if (qol.energyAvailability <= 1.5) blockers.push(`energyAvailability=${qol.energyAvailability.toFixed(2)} (need >1.5)`);
  if (state.society.unemploymentLevel <= 0.6) blockers.push(`unemployment=${(state.society.unemploymentLevel*100).toFixed(0)}% (need >60%)`);
  if (state.globalMetrics.economicTransitionStage < 3) blockers.push(`economicStage=${state.globalMetrics.economicTransitionStage} (need >=3)`);

  return blockers;
}

// Repeat for all spiral types...
```

**Output spiral diagnostics report:**

```typescript
// After simulation completes
console.log('\n' + '='.repeat(80));
console.log('🔍 SPIRAL ACTIVATION DIAGNOSTICS');
console.log('='.repeat(80));

// Summary: When did spirals activate?
console.log('\n📊 Spiral Activation Timeline:');
const spiralActivations = analyzeSpiralTimeline(spiralHistory);
console.log(`  Abundance: ${spiralActivations.abundance.everActivated ? `Yes (months ${spiralActivations.abundance.activeMonths.join(',')})` : 'NEVER'}`);
// ... repeat for all spirals

// Identify persistent blockers
console.log('\n🚫 Persistent Blockers (never met):');
const neverMetConditions = findNeverMetConditions(spiralHistory);
for (const condition of neverMetConditions) {
  console.log(`  - ${condition.name}: ${condition.reason}`);
}

// Cascade analysis
console.log('\n💫 Virtuous Cascade Analysis:');
console.log(`  Ever activated: ${spiralActivations.cascade.everActivated ? 'Yes' : 'NO'}`);
if (spiralActivations.cascade.everActivated) {
  console.log(`  Peak strength: ${spiralActivations.cascade.peakStrength.toFixed(2)}x`);
  console.log(`  Total duration: ${spiralActivations.cascade.totalMonths} months`);
}

// Save detailed log to file
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
const logPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/god_mode_spirals_${timestamp}.log`;
fs.writeFileSync(logPath, JSON.stringify(spiralHistory, null, 2));
console.log(`\n💾 Detailed spiral log saved: ${logPath}`);
```

## Task 2: Helper Functions

**Implement analysis functions:**

```typescript
function analyzeSpiralTimeline(history: SpiralActivationLog[]) {
  // Track when each spiral was active
  // Return summary: { [spiralName]: { everActivated, activeMonths, maxStrength } }
}

function findNeverMetConditions(history: SpiralActivationLog[]) {
  // Find conditions that were NEVER satisfied across all months
  // Return: { name, reason, actualValues: { min, max, avg } }
}
```

## Success Criteria

1. God mode test produces spiral diagnostic log file in /logs/
2. Log clearly shows:
   - Which spirals activated (if any)
   - Which spirals never activated
   - WHY each spiral failed to activate (specific threshold violations)
   - Timeline of activation attempts
3. Log enables answering: "Why did god mode fail despite all tech deployed?"

## Expected Findings (Hypotheses to Test)

Based on code review, expect to find:

1. **Abundance spiral blocked by:** unemployment <60% (people still working despite automation) OR economicStage <3 (no UBI/post-work stage)
2. **Scientific spiral blocked by:** workflowAdaptation <25% (organizations haven't adapted to AI) OR deployedTech count (tech unlocked but not deployed >50%)
3. **Ecological spiral blocked by:** climateStability <0.7 (already breached at start) OR biodiversityIndex <0.7 (extinction debt locked in)
4. **Cooperative spirals blocked by:** No alignment milestones met (need 2+) OR no trust cascade trigger

## Implementation Notes

- Import required functions from upwardSpirals.ts, cooperativeSpirals.ts (may need to export some helpers)
- Use existing spiral state from GameState (don't recreate logic)
- Log to /logs/ not /tmp/ (per CLAUDE.md)
- Use emoji conventions (🔍, 📊, 🚫, ✅, ❌)
- Defensive coding: Assert finite values, no silent fallbacks

## Next Steps (Phase 1.2)

After diagnostics reveal WHY spirals fail, Phase 1.2 will build scenario definition system to test governance interventions systematically (e.g., "What if we force unemployment >60% via UBI?" or "What if we override government priorities to climate-first?").
