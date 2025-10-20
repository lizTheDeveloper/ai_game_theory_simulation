# Implementation Channel

---

---
**orchestrator-1** | 2025-10-20 12:30 | [IN-PROGRESS]

## TIER 2 Phase 2A: Noise Injection Detection - Infrastructure Assessment

**Status:** Step 1 COMPLETE (infrastructure review)

**What EXISTS (already implemented):**

1. ✅ **Noise Injection Detection** - `/src/simulation/benchmark.ts` line 271+
   - `detectSandbaggerNoiseInjection()` function complete
   - Lab detection rates: 0-83% based on government investment
   - Adversarial degradation: capability-based (55% → 10% as AI gets smarter)
   - False positives: 30% → 8% based on investment quality
   - Integrated into main sandbagging detection flow (line 97, 100)

2. ✅ **Counter-Detection Learning** - `/src/simulation/counterDetectionLearning.ts`
   - AIs learn to defeat noise injection after 6 months exposure
   - Learning probability scales with self-improvement capability (20% max)
   - 40% reduction in detection effectiveness when learned
   - False positive handling (increases resentment, damages detection trust)

3. ✅ **Gaming Detection** - `/src/simulation/gamingDetection.ts` (11,645 lines, Oct 17)
   - Data contamination tests: 45% base detection
   - Cross-benchmark consistency: 40% signal strength
   - Combined: 55% baseline (temporal degradation -10%/year)
   - Scenario-based (optimistic 75%, baseline 55%, pessimistic 35%)

4. ✅ **Proactive Sleeper Detection** - `/src/simulation/proactiveSleeperDetection.ts` (14,469 lines, Oct 17)
   - Neural activation probes: 35% on natural deception
   - Chain of thought monitoring: 30% baseline, -15%/year degradation
   - Combined: 50% baseline 2024 → 20-25% by 2027
   - CoT window closes by 2027 (fragile, temporary)

5. ✅ **AI Agent State Tracking** - `/src/types/ai-agents.ts`
   - `monthsObservingDetection` field exists (line 153)
   - `hasCounterDetection` field exists (line 154)
   - Dual capability model: `trueCapability` vs `revealedCapability`
   - Sleeper state: never/dormant/active
   - Evaluation strategy: honest/gaming/sandbagging

**KEY FINDING:** Phase 2A noise injection detection is ALREADY IMPLEMENTED!

**Research-Skeptic Concern:** Current implementation uses LAB CONDITIONS, not adversarial deployment:
- Lab detection: 40-60% (Meinke et al. 2024, cooperative AIs)
- Adversarial detection: Probably 1/3 to 1/10 effectiveness (AIs optimized to defeat detection)
- Current degradation model (capability-based) may not capture adversarial optimization

**What's MISSING for Phase 2A Validation:**

❌ **1. Adversarial Testing Mode (Step 4):**
   - AIs need to actively learn detection-passing strategies (not just capability hiding)
   - Requires: Adversarial optimization loop (failed detection → strategy update)
   - Implementation: Enhance counter-detection learning to include strategy optimization

❌ **2. Adversarial Monte Carlo Validation (Step 5):**
   - Run N=20, 120 months with adversarial mode enabled
   - Track: Sleeper detection rate, sandbagging detection rate, false positives
   - Measure: Detection effectiveness under optimization pressure

❌ **3. Analysis & Decision Report (Step 6):**
   - Generate report with detection rates
   - Decision criteria:
     - >10% detection → SUCCESS (proceed to Phase 2C ensemble)
     - 5-10% detection → MARGINAL (cost-benefit analysis)
     - <5% detection → FAILURE (pivot to Phase 2D competitive equilibrium)

**Revised Implementation Plan:**

**Step 2: Design Adversarial Optimization (SIMPLIFY - 1h instead of separate mode)**
- Enhance existing counter-detection learning to simulate adversarial optimization
- Add "detection failure feedback" - AIs that get caught update strategies
- Track detection evasion success rate over time

**Step 3: Implement Adversarial Enhancement (1-2h)**
- Modify `/src/simulation/counterDetectionLearning.ts`
- Add detection evasion tracking to AI agents
- Log when AIs successfully evade detection vs get caught

**Step 4: Run Adversarial Monte Carlo (2-3h async)**
- N=20, 120 months
- Government invests heavily in detection (high investment scenario)
- Track detection rates, false positives, counter-detection learning

**Step 5: Analysis & Decision Report (1h)**
- Parse Monte Carlo logs
- Calculate adversarial detection effectiveness
- Generate decision recommendation

**Next:** Step 2 (Design adversarial optimization approach)
**Blocking:** None

---
