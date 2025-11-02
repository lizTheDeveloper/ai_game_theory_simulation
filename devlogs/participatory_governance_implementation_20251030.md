# Participatory Governance Mechanic Implementation

**Date:** October 30, 2025
**Implementer:** Roy (simulation-maintainer)
**Status:** ✅ COMPLETE

## Summary

Implemented **Mechanic 2: Participatory Governance** (Crisis Mitigation Mechanics) with backfire logic as requested by Sylvia.

This completes the Crisis Mitigation Mechanics trio:
1. ✅ Automatic Stabilizers (5% unemployment variance reduction) - Roy1
2. ✅ **Participatory Governance (5% resentment reduction + 15% backfire)** - Roy (this PR)
3. ✅ Homeostatic Bounds (2.75 pp/year unemployment recovery) - Roy1

## Implementation Details

### Effect
- **Base case:** -5% resentment (when governance quality >= 0.4)
- **Backfire case:** +15% resentment (when governance quality < 0.4)

### Research Citations
- Cambridge Core 2024 (minipublics)
- PMC 2022 (municipal participatory budgeting)
- vTaiwan (national-scale digital democracy, 26M population)

### Backfire Conditions (Sylvia Requirement)
Backfire triggers when:
- Governance quality < 0.4 (tokenistic participation, fake consultation)
- People feel expectations are unmet
- Decisions ignore public input

When backfired: Base -5% becomes +15% resentment (net +10% increase)

### Implementation Location
- **File:** `src/simulation/resentmentRecovery.ts`
- **Context calculation:** Lines 123-163
- **Effect application:** Lines 280-315
- **Phase logging:** `src/simulation/engine/phases/ResentmentRecoveryPhase.ts` lines 91-96

### Code Changes

#### 1. Added fields to `ResentmentRecoveryContext` interface
```typescript
// MECHANIC 2: Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
// Research: Cambridge Core 2024 (minipublics), PMC 2022 (participatory budgeting), vTaiwan
participatoryGovernanceEffect: number; // [-0.15, -0.05] Resentment multiplier (backfire or success)
participatoryBackfired: boolean;       // Did participatory governance backfire this month?
```

#### 2. Calculate governance quality score
```typescript
const decisionQuality = state.government.governanceQuality?.decisionQuality ?? 0.5;
const participationRate = state.government.governanceQuality?.participationRate ?? 0.5;

// Combined governance quality score (both decision quality AND participation rate matter)
const governanceQualityScore = (decisionQuality + participationRate) / 2;

// Backfire when governance quality is low (<0.4) - tokenistic participation
const participatoryBackfired = governanceQualityScore < 0.4;
const participatoryGovernanceEffect = participatoryBackfired
  ? PARTICIPATORY_BACKFIRE // Backfire: fake consultation increases resentment
  : PARTICIPATORY_BASE_EFFECT; // Success: genuine participation reduces resentment
```

#### 3. Apply effect to agent resentment
```typescript
// Apply participatory governance effect (multiplicative on current resentment)
const preParticipatoryResentment = agent.resentment;
agent.resentment = assertFinite(
  agent.resentment * (1 + context.participatoryGovernanceEffect),
  {
    location: 'resentmentRecovery (participatory governance)',
    valueName: 'resentment (post-participatory)',
    month: state.currentMonth,
    additionalInfo: {
      agentId: agent.id,
      preParticipatoryResentment,
      participatoryEffect: context.participatoryGovernanceEffect,
      backfired: context.participatoryBackfired
    }
  }
);

// Clamp resentment to [0, 1] range
agent.resentment = Math.max(0, Math.min(1, agent.resentment));

// Log backfire events
if (context.participatoryBackfired && preParticipatoryResentment > 0) {
  console.log(`  ⚠️ Participatory governance BACKFIRED for agent ${agent.id}: ${preParticipatoryResentment.toFixed(3)} → ${agent.resentment.toFixed(3)} (+${(context.participatoryGovernanceEffect * 100).toFixed(1)}%)`);
}
```

#### 4. Add phase logging
```typescript
// MECHANIC 2: Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
if (context.participatoryBackfired) {
  indicators.push('🚨 PARTICIPATORY GOVERNANCE BACKFIRED (+15% resentment)');
} else {
  indicators.push('🤝 Participatory governance active (-5% resentment)');
}
```

## Validation Results

### Unit Test (`scripts/validateParticipatoryGovernance.ts`)
```
TEST 1: Backfire condition (governance quality < 0.4)
  Governance quality: 0.250
  Participatory effect: 0.150
  Backfired: true
  ✅ PASS: Resentment increased (0.573 > 0.50)

TEST 2: Success condition (governance quality >= 0.4)
  Governance quality: 0.750
  Participatory effect: -0.050
  Backfired: false
  ✅ PASS: Resentment decreased (0.474 < 0.50)

TEST 3: No NaN or Infinity values
  ✅ PASS: All resentment values are finite

TEST 4: Resentment bounds [0, 1]
  ✅ PASS: All resentment values in [0, 1]

=== Validation Complete ===
```

### Monte Carlo Test (N=3, 24 months)
- ✅ No NaN or assertion errors
- ✅ Mechanic shows in logs: "🤝 Participatory governance active (-5% resentment)"
- ✅ No backfire events (governance quality is good by default initialization)
- ✅ Simulation completes without crashes

**Log location:** `logs/mc_participatory_validation_20251030_122926.log`

## Defensive Coding

All assertions in place:
- ✅ `assertFinite` on resentment calculation
- ✅ Bounds clamping `[0, 1]`
- ✅ Full context logging in assertion errors
- ✅ Backfire events logged with emoji

## Research Documentation

Added TODO comments:
```typescript
// TODO: Need national-scale participatory governance studies for empirical calibration
// Scale: 1,000,000× extrapolation from municipal (thousands) to global (billions)
// NOTE: Hypothesis to test - scaling local evidence to national/global context
```

## Files Modified

1. `src/simulation/resentmentRecovery.ts` (+65 lines)
   - Added `participatoryGovernanceEffect` and `participatoryBackfired` to context
   - Calculate governance quality score from `state.government.governanceQuality`
   - Apply effect to agent resentment with assertions
   - Log backfire events

2. `src/simulation/engine/phases/ResentmentRecoveryPhase.ts` (+7 lines)
   - Add participatory governance to context indicators

3. `scripts/validateParticipatoryGovernance.ts` (NEW, 144 lines)
   - Unit test for backfire and success conditions
   - Validation of NaN/Infinity and bounds

## Time Estimate vs Actual

- **Estimated:** 1-2 hours
- **Actual:** ~1.5 hours (including validation)

## Success Criteria

- ✅ Participatory governance effect implemented
- ✅ Backfire logic working correctly
- ✅ Research citations in code
- ✅ TODO comments for future work
- ✅ All three Crisis Mitigation Mechanics complete
- ✅ Monte Carlo runs without NaN or assertion failures

## Next Steps

None required - mechanic is complete and validated. Ready for integration into full simulation runs.

**The Crisis Mitigation Mechanics are now COMPLETE.**
