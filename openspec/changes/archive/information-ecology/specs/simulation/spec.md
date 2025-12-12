# Simulation Spec - Information Ecology (DELTA)

**Change type:** ADDED
**Date:** 2025-12-12
**Status:** PROPOSED

---

## ADDED: InformationEcology Interface

**Location:** `src/types/game.ts`

```typescript
/**
 * Information Ecology: Models epistemic environment quality and coordination capacity
 *
 * Research foundation: research/information_ecology_epistemic_degradation_20251202.md
 * Key insight: Even with aligned AI, coordination depends on shared epistemic commons
 *
 * Mechanisms:
 * - Epidemic misinformation spread (SIS/SIR dynamics, R₀ > 1)
 * - Trust erosion during crises (25-50%/month)
 * - Echo chambers and polarization feedback loops
 * - AI-generated content amplification
 * - Fact-checking capacity and decay
 */
interface InformationEcology {
  /**
   * Fraction of information environment consisting of misinformation (0-1)
   * Spread via epidemic dynamics (dI/dt = β × S × I - γ × I)
   * Source: Alotaibi et al. (2024), Scientific Reports 14:18729
   */
  misinformationPrevalence: number;

  /**
   * Trust in institutions (government, media, science) (0-1)
   * Erodes 25-50%/month during crises, recovers slowly in stability
   * Source: 2025 Edelman Trust Barometer, Van Remoortere & Vliegenthart (2025)
   */
  institutionalTrustIndex: number;

  /**
   * Affective polarization (othering + aversion + moralization) (0-1)
   * 0 = minimal polarization, 1 = severe polarization
   * Source: APSR (May 2025), "A New Measure of Affective Polarization"
   */
  polarizationIndex: number;

  /**
   * Network homophily (echo chamber strength) (0-1)
   * Amplifies misinformation transmission by 1.5x-3.0x within clusters
   * Source: ACM CSCW (2025), Truth Social echo chambers
   */
  ecoChamberStrength: number;

  /**
   * Fact-checking infrastructure capacity (0-1)
   * Reduces β (transmission rate), increases γ (recovery rate)
   * Effects decay rapidly (days to weeks) without repeated exposure
   * Source: Capewell et al. (2024), JASP; Nature Human Behaviour (2021)
   */
  factCheckingCapacity: number;

  /**
   * Basic reproduction number (epidemic spread potential)
   * R₀ = β × average_contacts × duration_of_infectiousness
   * R₀ > 1: exponential spread, R₀ < 1: dies out naturally
   * Range: 0.5 - 3.5 (baseline 1.5)
   * Source: Alotaibi et al. (2024), Frontiers in Computer Science (2025)
   */
  basicReproductionNumber: number;

  /**
   * Transmission rate (per-day probability of spreading misinformation)
   * Range: 0.1 - 0.8 per day
   * Higher for emotionally charged content (0.5-0.8)
   * Lower for complex claims (0.1-0.3)
   * Modified by echo chamber strength (1.5x-3.0x within clusters)
   * Source: Alotaibi et al. (2024), Scientific Reports
   */
  transmissionRate: number;

  /**
   * Recovery/awareness rate (per-day probability of correction)
   * Range: 0.05 - 0.2 per day (baseline 0.1 = 10-day belief duration)
   * Inverse is duration of belief before encountering correction
   * Boosted by fact-checking capacity
   * Source: Frontiers in Computer Science (2025), GIFS model
   */
  recoveryRate: number;

  /**
   * Fraction of misinformation created by generative AI (0-1)
   * Increases with advanced AI capabilities
   * AI-generated content harder to distinguish from legitimate sources
   * Source: Frontiers in Computer Science (2025), GIFS model
   */
  aiGeneratedContentFraction: number;

  /**
   * Coordination capacity (ability to implement collective solutions) (0-1)
   * Function of trust × (1 - polarization) × (1 - misinformationPrevalence)
   * Critical threshold: coordination_capacity < 0.2 → major failures likely
   * Source: McCoy et al. (2024), epistemic vulnerability framework
   */
  coordinationCapacity: number;

  /**
   * Overall information environment quality (0-1)
   * Composite metric: trust × (1 - polarization) × (1 - misinformation)
   * Affects governance decision quality, policy implementation
   * Source: Derived from McCoy et al. (2024) epistemic vulnerability index
   */
  epistemicHealth: number;

  /**
   * Regional heterogeneity (0-1)
   * Northern Europe: lower vulnerability (0.30-0.40)
   * US/Spain: moderate vulnerability (0.60-0.70)
   * Eastern Europe: higher vulnerability (0.70-0.80)
   * Source: McCoy et al. (2024), 20-country comparative analysis
   */
  regionalVariance: number;
}
```

---

## ADDED: InformationEcologyPhase

**Location:** `src/simulation/phases/informationEcologyPhase.ts` (new file)
**Execution order:** ~25 (after GovernancePhase, before CoordinatedDeploymentPhase)

**Core mechanics:**

### 1. Epidemic Misinformation Spread

Uses SIS/SIR model adaptation:
```
dI/dt = β × S × I - γ × I
```

Where:
- I = infected (believing misinformation) = misinformationPrevalence
- S = susceptible = 1 - I
- β = transmissionRate (modified by echo chambers, AI amplification)
- γ = recoveryRate (boosted by fact-checking)

**Implementation:**
```typescript
const effectiveTransmissionRate = state.informationEcology.transmissionRate
  × (1 + state.informationEcology.ecoChamberStrength × 1.5)  // Echo chamber amplification
  × (1 + state.informationEcology.aiGeneratedContentFraction × 0.5);  // AI amplification

const susceptible = 1 - state.informationEcology.misinformationPrevalence;
const spread = effectiveTransmissionRate × susceptible × state.informationEcology.misinformationPrevalence;
const recovery = state.informationEcology.recoveryRate × state.informationEcology.misinformationPrevalence;

state.informationEcology.misinformationPrevalence = Math.max(0, Math.min(1,
  state.informationEcology.misinformationPrevalence + (spread - recovery) / 12  // Monthly step
));

// Update R₀
state.informationEcology.basicReproductionNumber =
  effectiveTransmissionRate / state.informationEcology.recoveryRate;
```

### 2. Trust Erosion

**During crises:** -25% to -50% per month
**During stability:** +2% to +5% per month (slow recovery)

```typescript
// Crisis detection: nuclear events, climate disasters, AI failures, war
const inCrisis = (
  state.nuclearWinter.active ||
  state.environmentalMetrics.climateRiskLevel > 0.7 ||
  state.aiGovernance.catastrophicFailures > 0 ||
  state.governance.warStatus.atWar
);

const trustDelta = inCrisis
  ? -0.25 - (state.informationEcology.polarizationIndex × 0.25)  // -25% to -50%
  : 0.02 + (state.informationEcology.epistemicHealth × 0.03);    // +2% to +5%

state.informationEcology.institutionalTrustIndex = Math.max(0, Math.min(1,
  state.informationEcology.institutionalTrustIndex + trustDelta
));
```

### 3. Polarization Feedback Loops

**Drivers:**
- Misinformation prevalence (reinforces outgroup hostility)
- Echo chamber strength (reduces cross-cutting exposure)
- Crisis events (amplify threat perceptions)

**Dampeners:**
- Cross-cutting exposure (diverse networks)
- Successful coordination (builds goodwill)

```typescript
const polarizationPressure =
  state.informationEcology.misinformationPrevalence × 0.1 +
  state.informationEcology.ecoChamberStrength × 0.05 +
  (inCrisis ? 0.1 : 0);

const polarizationDampening =
  (1 - state.informationEcology.ecoChamberStrength) × 0.02 +  // Diverse exposure
  state.informationEcology.coordinationCapacity × 0.03;       // Successful cooperation

state.informationEcology.polarizationIndex = Math.max(0, Math.min(1,
  state.informationEcology.polarizationIndex + (polarizationPressure - polarizationDampening)
));
```

### 4. Fact-Checking Capacity

**Decay rate:** -10% per month (infrastructure requires maintenance)
**Investments:** AI capabilities can boost capacity
**Effectiveness:** Reduces β by up to 50%, increases γ by up to 100%

```typescript
// Natural decay
state.informationEcology.factCheckingCapacity *= 0.90;

// AI-assisted fact-checking (if alignment high)
if (state.aiAlignment > 0.7 && state.aiCapabilities.digital.informationProcessing > 0.5) {
  const aiBoost = state.aiCapabilities.digital.informationProcessing × 0.1;
  state.informationEcology.factCheckingCapacity = Math.min(1,
    state.informationEcology.factCheckingCapacity + aiBoost
  );
}

// Apply fact-checking to epidemic parameters
const factCheckEffect = state.informationEcology.factCheckingCapacity;
state.informationEcology.transmissionRate *= (1 - factCheckEffect × 0.5);  // Reduce spread
state.informationEcology.recoveryRate *= (1 + factCheckEffect);            // Boost recovery
```

### 5. Coordination Capacity Calculation

**Formula:** `trust × (1 - polarization) × (1 - misinformation)`

**Critical threshold:** < 0.2 indicates severe dysfunction

```typescript
state.informationEcology.coordinationCapacity =
  state.informationEcology.institutionalTrustIndex ×
  (1 - state.informationEcology.polarizationIndex) ×
  (1 - state.informationEcology.misinformationPrevalence);

// Epistemic health (similar formula, slightly different weights)
state.informationEcology.epistemicHealth =
  state.informationEcology.institutionalTrustIndex × 0.4 +
  (1 - state.informationEcology.polarizationIndex) × 0.3 +
  (1 - state.informationEcology.misinformationPrevalence) × 0.3;
```

### 6. Logging

```typescript
if (state.informationEcology.basicReproductionNumber > 1.0) {
  console.log(`  📱⚠️ Misinformation spreading exponentially (R₀=${R0.toFixed(2)})`);
}

if (state.informationEcology.coordinationCapacity < 0.3) {
  console.log(`  🤝❌ Coordination severely degraded (capacity=${capacity.toFixed(2)})`);
}

if (state.informationEcology.institutionalTrustIndex < 0.2) {
  console.log(`  🏛️💥 Institutional trust collapsed (${trust.toFixed(2)})`);
}
```

---

## MODIFIED: CoordinatedDeploymentPhase

**Location:** `src/simulation/phases/coordinatedDeploymentPhase.ts`

**Change:** Reduce AI deployment effectiveness by coordination capacity

```typescript
// BEFORE
const deploymentEffectiveness = calculateDeploymentEffectiveness(state);

// AFTER
const baseEffectiveness = calculateDeploymentEffectiveness(state);
const coordinationModifier = state.informationEcology.coordinationCapacity;
const deploymentEffectiveness = baseEffectiveness × (0.5 + coordinationModifier × 0.5);
// Coordination capacity 1.0 → 100% effectiveness
// Coordination capacity 0.5 → 75% effectiveness
// Coordination capacity 0.0 → 50% effectiveness (minimum)

if (coordinationModifier < 0.4) {
  console.log(`  🤖❌ AI recommendations rejected due to epistemic fragmentation`);
}
```

---

## MODIFIED: GovernancePhase

**Location:** `src/simulation/phases/governancePhase.ts`

**Change:** Modify policy decision quality by epistemic health

```typescript
// BEFORE
const policyQuality = calculatePolicyQuality(state);

// AFTER
const basePolicyQuality = calculatePolicyQuality(state);
const epistemicModifier = state.informationEcology.epistemicHealth;
const policyQuality = basePolicyQuality × (0.6 + epistemicModifier × 0.4);
// Epistemic health 1.0 → 100% quality
// Epistemic health 0.5 → 80% quality
// Epistemic health 0.0 → 60% quality (minimum)

if (epistemicModifier < 0.4) {
  console.log(`  🏛️⚠️ Policy implementation hampered by low institutional trust`);
}
```

---

## MODIFIED: AICapabilitiesPhase

**Location:** `src/simulation/phases/aiCapabilitiesPhase.ts`

**Change:** Advanced AI increases AI-generated misinformation fraction

```typescript
// AFTER capability updates
if (state.aiCapabilities.digital.informationProcessing > 0.6) {
  const aiContentIncrease = (state.aiCapabilities.digital.informationProcessing - 0.6) × 0.1;
  state.informationEcology.aiGeneratedContentFraction = Math.min(0.8,
    state.informationEcology.aiGeneratedContentFraction + aiContentIncrease
  );

  if (aiContentIncrease > 0.05) {
    console.log(`  🤖📱 AI-generated content flooding information ecosystem`);
  }
}
```

---

## ADDED: Initialization Values

**Location:** `src/simulation/initialization/createInitialGameState.ts`

```typescript
informationEcology: {
  // Baseline: Moderately polarized democracy (US 2024)
  misinformationPrevalence: 0.25,           // 25% of information environment
  institutionalTrustIndex: 0.40,            // Low but not collapsed (Edelman 2025)
  polarizationIndex: 0.60,                  // Significant affective polarization
  ecoChamberStrength: 0.50,                 // Moderate filter bubbles
  factCheckingCapacity: 0.30,               // Limited infrastructure
  basicReproductionNumber: 1.5,             // Mild exponential growth
  transmissionRate: 0.3,                    // Baseline β (per day)
  recoveryRate: 0.1,                        // Baseline γ (10-day belief duration)
  aiGeneratedContentFraction: 0.10,         // Early AI era (2025)
  coordinationCapacity: 0.50,               // Moderate dysfunction
  epistemicHealth: 0.45,                    // Degraded but functional
  regionalVariance: 0.30,                   // Some heterogeneity
}
```

---

## Testing Requirements

### Unit Tests

**File:** `tests/informationEcologyPhase.test.ts`

**Test cases:**
1. Epidemic dynamics: R₀ > 1 → exponential misinformation growth
2. Epidemic containment: R₀ < 1 → misinformation dies out
3. Trust erosion: Crises reduce trust by 25-50%/month
4. Trust recovery: Stability increases trust slowly
5. Polarization feedback: Misinformation amplifies polarization
6. Fact-checking effectiveness: Reduces β, increases γ
7. Coordination capacity: Formula correctness
8. AI amplification: Advanced AI increases content fraction

### Integration Tests

**File:** `tests/integration/informationEcologyIntegration.test.ts`

**Test cases:**
1. Coordination reduction: Low coordination capacity reduces AI deployment effectiveness
2. Governance quality: Low epistemic health degrades policy quality
3. AI-generated misinformation: Advanced AI capabilities increase content fraction
4. Determinism: Same seed → same results across all mechanics

### Monte Carlo Validation

**Command:** `npx tsx scripts/monteCarloSimulation.ts > logs/mc_information_ecology_$(date +%Y%m%d_%H%M%S).log 2>&1 &`

**Validation criteria:**
- N ≥ 10 runs
- CV < 0.01% for key metrics (determinism)
- Outcome distribution: Expect 20-40% reduction in managed transition probability
- Epistemic fragmentation scenarios reach collapse more frequently

---

## Success Metrics

**Simulation behavior:**
1. Polarized societies (polarization > 0.7, trust < 0.3) struggle to coordinate even with aligned AI
2. Misinformation epidemics (R₀ > 1.5) prevent effective crisis response
3. Fact-checking capacity degrades without investment, allowing misinformation resurgence
4. AI-generated content flooding (fraction > 0.5) overwhelms epistemic infrastructure
5. Coordination capacity < 0.2 results in catastrophic policy failures

**Research alignment:**
1. Trust erosion rates match Edelman Trust Barometer trends
2. R₀ dynamics consistent with epidemic modeling literature
3. Fact-check decay matches JASP (2024) findings
4. Echo chamber amplification matches ACM CSCW (2025) observations

**Outcome impact:**
1. 20-40% reduction in managed transition probability (high polarization scenarios)
2. Utopia outcomes require epistemic health > 0.6 maintained throughout game
3. Collapse outcomes more likely when coordination capacity < 0.3 during crises

---

## References

**Primary research:** `/home/lizthedeveloper_gmail_com/satu/orchestrator/research/information_ecology_epistemic_degradation_20251202.md`

**Key sources:**
- Alotaibi et al. (2024). Scientific Reports 14:18729 (epidemic dynamics)
- Frontiers in Computer Science (2025). DOI: 10.3389/fcomp.2025.1570085 (AI amplification)
- McCoy et al. (2024). Political Communication (epistemic vulnerability)
- 2025 Edelman Trust Barometer (institutional trust trends)
- Van Remoortere & Vliegenthart (2025). Political Communication (affective polarization)
- Capewell et al. (2024). JASP (fact-checking decay)
- ACM CSCW (2025). DOI: 10.1145/3715070.3749241 (echo chambers)

**Total sources:** 15+ peer-reviewed papers (2024-2025)
**Research grade:** A (comprehensive, implementation-ready)
