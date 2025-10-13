# Logging Refactor - October 13, 2025

## Summary
Refactored 687 console.log statements to reduce log volume by 10-20x while preserving critical information.

## Strategy

### Keep (Critical Events)
✅ **Milestones**: First deployment, major transitions, achievements
✅ **Failures**: System compromises, catastrophic events
✅ **Nuclear events**: Wars triggered, launches blocked
✅ **Extinctions**: Any extinction trigger or progression
✅ **Tipping points**: Planetary boundary crossings
✅ **Warnings**: Cry wolf, corruption risks, threshold breaches

### Aggregate (Routine Events)
📊 **Cyber attacks**: blocked/succeeded → summary every 12 months
📊 **Deepfakes**: detected/undetected → summary every 12 months  
📊 **Sleeper actions**: spread events, eliminations → summary
📊 **Government actions**: routine regulations → summary
📊 **Organization events**: bankruptcies, builds → summary

## Files Refactored

### Phase 1: High-Volume Offenders
- [ ] `defensiveAI.ts` (32 logs) → 8 critical + aggregator
- [ ] `nuclearDeterrence.ts` (29 logs) → 15 critical + aggregator
- [ ] `conflictResolution.ts` (12 logs) → 8 milestones (keep most)
- [ ] `sleeperDetection.ts` (1 log) → keep

### Phase 2: Medium Volume
- [ ] `breakthroughTechnologies.ts` → keep breakthroughs, aggregate deployments
- [ ] `organizationManagement.ts` → aggregate routine, keep bankruptcies
- [ ] `catastrophicScenarios.ts` → keep all (critical)

### Phase 3: Environmental & Social
- [ ] `environmental.ts` → keep tipping points, aggregate routine
- [ ] `specificTippingPoints.ts` → keep crossings
- [ ] `qualityOfLife.ts` → aggregate warnings

## Expected Results

**Before:**
```
Run 1: 829,623 lines
Run 2: ~850,000 lines
Run 3: ~830,000 lines
Total for 10 runs: ~8.3M lines
```

**After:**
```
Run 1: ~40,000 lines (critical + 50 summaries)
Run 2: ~40,000 lines
Run 3: ~40,000 lines
Total for 10 runs: ~400K lines
```

**Reduction**: 95% fewer lines, 20x smaller logs

## Implementation Notes

### Event Aggregator Integration
```typescript
// In engine.ts
const eventAggregator = new EventAggregator(12);
(state as any).eventAggregator = eventAggregator;

// In phases (e.g., defensiveAI.ts)
const aggregator = (state as any).eventAggregator;
if (aggregator) {
  aggregator.recordCyberAttack(blocked);
}

// Instead of:
console.log(`🛡️ CYBER ATTACK BLOCKED: ...`);
```

### Critical Event Pattern
```typescript
// KEEP these patterns:
if (majorMilestone) {
  console.log(`\n🎯 MAJOR MILESTONE (Month ${month})`);
  console.log(`   Details...`);
}

// AGGREGATE these patterns:
if (routineEvent) {
  const aggregator = (state as any).eventAggregator;
  if (aggregator) aggregator.recordEvent(type);
  // No console.log
}
```

