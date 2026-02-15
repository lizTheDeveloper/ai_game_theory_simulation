# Information Ecology + Supply Chain Cascades Integration Plan

**Date:** December 13, 2025
**Session:** 84
**Priority:** HIGH (H-1 from Session 81 architecture review)
**Effort:** 4-6 hours (full bidirectional integration)

---

## Motivation

**Architecture Review H-1:** "Information Ecology and Supply Chain Cascades operate independently despite logical interaction points"

**Research Support:**
- Information ecology research (2025-12-02) explicitly covers **crisis response degradation** from epistemic issues
- Supply chain research (2025-12-12) documents **Texas freeze 2021** as example of infrastructure→social trust cascade
- Both systems individually validated (QG1 B+, QG2 B+, Monte Carlo PASS)

**Impact:** Missed emergent dynamics during collapse scenarios. Integration will reveal coordination-infrastructure feedback loops.

---

## Integration Architecture

### Direction 1: Epistemic Degradation → Cascade Vulnerability

**Mechanism:** Low shared epistemic reality reduces coordination capacity during infrastructure crises

**Research Justification:**
> "Crisis Response: Misinformation about crisis (e.g., climate, pandemic) delays action. R₀ > 1 for crisis-related misinformation → exponential spread. Time cost: 6-24 month delay in coordinated response due to epistemic degradation."
> — information_ecology_epistemic_degradation_20251202.md, section 4

**Implementation:**
1. **Read:** `state.informationEcology.sharedEpistemicReality` (0-1 scale)
2. **Modify:** Cascade spread probability in `supplyChainCascades.ts`
3. **Formula:**
   ```typescript
   // Baseline cascade spread: 0.74 (74% probability)
   // Epistemic modifier: sharedEpistemicReality < 0.4 → increased vulnerability

   const epistemicModifier = state.informationEcology?.sharedEpistemicReality ?? 1.0;
   const cascadeSpreadMultiplier = epistemicModifier < 0.4
     ? 1.3  // 30% increased spread probability in degraded epistemic environment
     : 1.0;

   const effectiveCascadeSpread = baseCascadeSpread * cascadeSpreadMultiplier;
   ```

**Files to modify:**
- `src/simulation/supplyChainCascades.ts` (propagateCascades function)

**Validation:**
- Unit test: Low epistemic reality → higher cascade spread
- Monte Carlo: Check collapse scenarios show stronger cascades with polarization

---

### Direction 2: Supply Chain Cascades → Epistemic Shocks

**Mechanism:** Prolonged infrastructure disruptions trigger misinformation cascades and trust erosion

**Research Justification:**
> "Texas freeze 2021: 3-day power disruption → 12M people water disruption → social coordination breakdown"
> — supply_chain_cascades_20251212.md, section 3

> "Epistemic shocks: Nuclear events, AI deception revelations, extinction risk communications trigger immediate degradation"
> — InformationEcologyPhase.ts, lines 136-181

**Implementation:**
1. **Detect:** Infrastructure cascades lasting > 7 days (week-long disruption threshold)
2. **Trigger:** Epistemic shock event similar to ExogenousShockPhase patterns
3. **Formula:**
   ```typescript
   // In SupplyChainCascadesPhase.ts, after cascade propagation

   if (cascade.durationHours > 168) {  // 7 days = 168 hours
     const shockMagnitude = Math.min(
       0.3,  // Cap at 30% trust erosion
       (cascade.durationHours - 168) / 720 * 0.2  // Scale with duration
     );

     state.events.push({
       month: state.currentMonth,
       description: `🚨💧 Infrastructure cascade (${(cascade.durationHours/24).toFixed(0)} days) triggers epistemic shock`,
       type: 'crisis',
       magnitude: shockMagnitude
     });

     // InformationEcologyPhase will process this event
   }
   ```

**Files to modify:**
- `src/simulation/engine/phases/SupplyChainCascadesPhase.ts` (after cascade detection)
- `src/simulation/engine/phases/InformationEcologyPhase.ts` (add infrastructure cascade to shock detection)

**Validation:**
- Unit test: Long cascades → epistemic shock events
- Monte Carlo: Check collapse scenarios show trust erosion from infrastructure failures

---

## Phase Ordering

**Current ordering:**
- InformationEcologyPhase: **18.0**
- SupplyChainCascadesPhase: **36.5**

**Flow:**
```
[InformationEcologyPhase 18.0]
  → writes sharedEpistemicReality, processes epistemic shocks
       ↓
[SupplyChainCascadesPhase 36.5]
  → reads sharedEpistemicReality (Direction 1)
  → emits infrastructure cascade events (Direction 2, processed next step)
       ↓
[Next step: InformationEcologyPhase 18.0]
  → processes infrastructure cascade events from previous step
```

**Latency:** Direction 2 has 1-month lag (cascade event processed next step). This is acceptable - epistemic impacts of infrastructure failures take time to propagate.

---

## GameState Changes

**No new state fields required.** Integration uses existing fields:
- `state.informationEcology.sharedEpistemicReality` (already exists)
- `state.events` array (already exists)
- `state.supplyChainCascades.activeCascades` (already exists)

**Type safety:** All fields already in GameState interface, no breaking changes.

---

## Testing Strategy

### Unit Tests
1. **Epistemic modifier test:**
   - Given: sharedEpistemicReality = 0.3 (degraded)
   - When: Cascade propagation occurs
   - Then: Cascade spread probability increased by 30%

2. **Cascade shock trigger test:**
   - Given: Active cascade lasting 10 days (240 hours)
   - When: SupplyChainCascadesPhase executes
   - Then: Epistemic shock event emitted with appropriate magnitude

3. **No false positives test:**
   - Given: Short cascade (3 days)
   - When: SupplyChainCascadesPhase executes
   - Then: No epistemic shock event emitted

### Integration Test
1. **Bidirectional feedback test:**
   - Given: Initial epistemic degradation (polarization event)
   - When: Infrastructure crisis occurs
   - Then: Cascade spreads faster → triggers epistemic shock → further epistemic degradation

### Monte Carlo Validation
1. **N ≥ 10 runs** with same seed
2. **CV < 0.01%** (determinism check)
3. **Outcome distribution:** Check that collapse scenarios show coordinated degradation (epistemic + infrastructure)
4. **Regression check:** Ensure utopia/managed transition probabilities don't degrade

---

## Risk Assessment

**LOW RISK INTEGRATION:**
- Read-only access to informationEcology state (Direction 1)
- Event emission pattern already used by multiple phases (Direction 2)
- No breaking changes to GameState interface
- Fail-safe defaults (`?? 1.0` for missing informationEcology)

**Potential issues:**
- Circular feedback could amplify collapse scenarios excessively
- Need to validate collapse acceleration is research-consistent

**Mitigation:**
- Conservative modifiers (1.3x spread increase, 0.3 max shock magnitude)
- Monte Carlo validation will reveal if feedback too strong
- Can adjust parameters if needed

---

## Success Criteria

✅ **Implementation complete** when:
1. Epistemic modifier affects cascade spread probability
2. Long cascades trigger epistemic shock events
3. Unit tests pass (3 tests minimum)
4. Monte Carlo N=10 runs deterministic (CV < 0.01%)
5. No regressions in utopia/managed transition probabilities
6. Code review by architecture-skeptic (Grade B+ or higher)

---

## Research Citations

**Direction 1 (Epistemic → Cascade):**
- Alotaibi et al. (2024) - Epidemic misinformation spread models
- McCoy et al. (2024) - Epistemic vulnerability and coordination capacity
- Information Ecology research file (2025-12-02)

**Direction 2 (Cascade → Epistemic):**
- Nirandjan et al. (2024) - Infrastructure cascade propagation (One Earth)
- Texas freeze 2021 case study - Infrastructure → social trust cascade
- Supply Chain Cascades research file (2025-12-12)

**Both directions grounded in peer-reviewed 2024-2025 research.**

---

## Next Steps

1. ✅ Research validation COMPLETE (existing research covers both directions)
2. → Spawn simulation-maintainer agent for implementation
3. → Unit tests via test writer agents
4. → Monte Carlo validation via priya agent
5. → Architecture review via architecture-skeptic agent
6. → Documentation via wiki-documentation-updater agent
7. → Archive completion via architect agent

**Estimated timeline:** 4-6 hours for full implementation + validation
