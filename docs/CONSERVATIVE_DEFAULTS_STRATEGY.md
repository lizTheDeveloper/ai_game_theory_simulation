# Conservative Defaults Strategy
## Parameter Grounding When Research is Unavailable or Unverified

**Date:** October 29, 2025
**Purpose:** Guide for handling unverified/unavailable research in simulation
**Context:** Citation verification crisis (23% fabrication rate)

---

## Core Principle

**When research is unverified or unavailable, err on the side that makes the simulation HARDER, not easier.**

This is a research tool, not a game. The goal is realistic outcomes, not optimistic ones.

---

## Decision Framework

### Step 1: Attempt Verification

**Before using conservative defaults, exhaust verification options:**

1. **Direct source verification**
   - Check if cited paper exists (Google Scholar, arXiv, publisher)
   - Verify authors match
   - Validate specific claim is in paper

2. **Literature meta-analysis**
   - If single source unavailable, find 3-5 sources on topic
   - Extract range of estimates
   - Document methodology differences

3. **Domain expert consultation**
   - For critical parameters, seek expert review
   - Document expert qualification
   - Get range estimates, not point values

**Only use conservative defaults if:**
- No credible peer-reviewed source exists (2020-2025)
- Multiple contradictory sources (no consensus)
- Source exists but data severely outdated for fast-moving field

### Step 2: Choose Conservative Bound

**For POSITIVE effects (things that help):**
- Breakthroughs → LOWER effectiveness, SLOWER adoption
- Interventions → LOWER success rate, HIGHER cost
- Recovery → SLOWER timescales, LOWER completeness
- AI capabilities (beneficial) → SLOWER growth, LOWER ceiling

**Examples:**
```typescript
// POSITIVE EFFECT: Breakthrough technology adoption
// Literature range: 15-60% adoption in 5 years
// Conservative choice: 15% (lower bound)
const adoptionRate = 0.15; // [CONSERVATIVE - lower bound of literature]

// POSITIVE EFFECT: Climate intervention effectiveness
// Literature range: 10-40% CO2 reduction
// Conservative choice: 10% (lower bound)
const effectiveness = 0.10; // [CONSERVATIVE - lower bound of literature]
```

**For NEGATIVE effects (risks, damages, harms):**
- Catastrophes → HIGHER severity, FASTER onset
- Tipping points → LOWER thresholds, FASTER cascade
- AI risks → HIGHER probability, HIGHER damage
- Resource depletion → FASTER exhaustion

**Examples:**
```typescript
// NEGATIVE EFFECT: Climate tipping point threshold
// Literature range: 1.5-2.5°C above pre-industrial
// Conservative choice: 1.5°C (lower bound = triggers sooner)
const tippingThreshold = 1.5; // [CONSERVATIVE - lower bound for negative effect]

// NEGATIVE EFFECT: AI misalignment risk
// Literature range: 5-30% probability
// Conservative choice: 30% (upper bound = higher risk)
const misalignmentRisk = 0.30; // [CONSERVATIVE - upper bound for negative effect]
```

**For NEUTRAL effects (direction depends on context):**
- Use midpoint of literature range
- Document both directions of uncertainty
- Add ±50% variance in Monte Carlo

### Step 3: Quantify Uncertainty

**Always add uncertainty bands for unverified parameters:**

```typescript
// [CONSERVATIVE_ESTIMATE - no 2024-2025 peer-reviewed source]
const baseValue = 0.25; // midpoint estimate
const uncertaintyRange = 0.5; // ±50%

// In Monte Carlo runs:
const value = baseValue * (1 + (rng() * 2 - 1) * uncertaintyRange);
// Samples uniformly from [0.125, 0.375]
```

**Uncertainty levels:**
- `±25%` - Single outdated source (pre-2022)
- `±50%` - Multiple contradictory sources, or no peer-reviewed source
- `±75%` - Pure estimate, no research basis
- `±100%` - Placeholder only, must verify before use

### Step 4: Document Assumptions

**Every conservative default MUST be documented:**

```typescript
// [CONSERVATIVE_ESTIMATE - Literature range: 20-80%, no consensus]
const governmentAdoptionRate = 0.20; // 20% (lower bound)
// Sources checked:
// - Smith et al. (2022): 65-80% in developed nations
// - Jones et al. (2021): 20-35% in developing nations
// - Williams (2020): 45-60% global average (OUTDATED)
// Conservative choice: Lower bound (developing nation rate)
// Rationale: Simulation includes global south, not just OECD
// Uncertainty: ±50% in Monte Carlo runs
// FLAGGED: Need 2024-2025 global adoption study
```

**Documentation template:**
```typescript
// [CONSERVATIVE_ESTIMATE - {reason}]
const parameterName = value; // {units} ({justification})
// Literature range: {low}-{high}
// Sources checked:
//   - {Author et al. (year): finding}
//   - {Author et al. (year): finding}
// Conservative choice: {lower/upper} bound
// Rationale: {why this direction is conservative}
// Uncertainty: ±{X}% in Monte Carlo runs
// FLAGGED: {what research is needed}
```

---

## Examples by Category

### AI Infrastructure & Resources

```typescript
// Water consumption per GPU-hour
// VERIFIED: Li et al. (2023) - 0.86 L/GPU-hr (scope 1, H100)
// BUT: Data is from 2023, pre-Blackwell (2024)
// Conservative choice: Use 2023 data (higher than 2024 Blackwell: 0.19-0.30 L/GPU-hr)
const waterPerGPUHour = 0.86; // [OUTDATED but CONSERVATIVE]
// Note: 2024 Blackwell hardware uses 0.19-0.30 L/GPU-hr
// Using older, higher estimate as conservative bound
// Uncertainty: ±25% for hardware generation variance
```

### AI Capability Scaling

```typescript
// Implementation success rate
// VERIFIED: BCG/McKinsey (2024) - 26% success, 74% fail/partial
// Conservative choice: Use actual data (not optimistic "30-40%" fabrication)
const implementationSuccessRate = 0.26; // [VERIFIED - BCG/McKinsey 2024]
// Real-world enterprise AI implementations
// High variance: 0-80% depending on org maturity, use case
// Uncertainty: ±50% (bimodal distribution)
```

### Climate Tipping Points

```typescript
// Amazon rainforest dieback threshold
// Literature range: 20-40% deforestation triggers irreversible shift
// Conservative choice: 20% (lower bound = triggers sooner)
const amazonDiebackThreshold = 0.20; // [CONSERVATIVE - lower bound]
// Sources:
// - Lenton et al. (2023): 20-25% (high confidence)
// - IPCC AR6 (2023): 25-40% (medium confidence)
// - Lovejoy & Nobre (2019): 20-25% (regional models)
// Using lowest threshold (most conservative for negative outcome)
// Uncertainty: ±25% (regional variance, climate sensitivity)
```

### Government Response

```typescript
// Policy comprehension lag (months to understand new AI capability)
// NO PEER-REVIEWED SOURCE FOUND
// Allen (2020) CSIS: 36-60 months → FABRICATED (publication doesn't exist)
// Zhang et al. (2021): 12-24 months → FABRICATED (publication doesn't exist)
// Conservative estimate from related literature:
// - Technology diffusion: 24-48 months (Rogers 2003, general tech)
// - Government IT adoption: 36-72 months (Fountain 2001)
// - AI policy lag: Unknown, use upper bound of IT adoption
const policyComprehensionLag = 60; // months [CONSERVATIVE_ESTIMATE]
// Literature range: 24-72 months (general tech adoption)
// No AI-specific peer-reviewed research found
// Using upper bound (longer lag = worse outcomes)
// Uncertainty: ±50% (highly contextual: crisis vs routine)
// FLAGGED: HIGH PRIORITY - Need AI governance comprehension research
```

### Breakthrough Technology Effectiveness

```typescript
// Carbon capture effectiveness (% of emissions captured)
// Literature range: 5-30% of global emissions (various technologies)
// Conservative choice: 10% (lower-mid bound)
const carbonCaptureEffectiveness = 0.10; // [CONSERVATIVE - lower-mid range]
// Sources:
// - IEA (2024): Direct air capture: 5-15% feasible by 2050
// - IPCC AR6 (2023): Point-source capture: 20-30% theoretical max
// - Smith et al. (2023): Combined portfolio: 10-25% realistic
// Using lower-mid estimate (accounts for deployment barriers)
// Uncertainty: ±50% (tech maturity, political will, cost scaling)
```

---

## Red Flags: When NOT to Use Conservative Defaults

### ❌ Don't Use Conservative Defaults If:

**1. You haven't actually looked for research**
- Conservative defaults are a last resort, not first choice
- Must attempt verification first

**2. Research exists but contradicts your preferred narrative**
- If real data shows 26% (BCG/McKinsey), don't use 40% because it's "more optimistic"
- Research realism > narrative preference

**3. You're using it to hide uncertainty**
- Conservative defaults must be documented with `[CONSERVATIVE_ESTIMATE]` tag
- Uncertainty must be quantified (±X%)
- Must be flagged for future verification

**4. It's a critical mechanic**
- For CRITICAL mechanics, find real research or don't implement
- Conservative defaults are for MEDIUM/LOW priority parameters

**5. You're making the model "more realistic" by hand-tuning**
- If you need to tune because outcomes look wrong, fix the model
- Don't add conservative defaults to get "better" results

---

## Verification Priority

**Not all unverified parameters are equal. Prioritize verification by:**

### CRITICAL (must verify or use very conservative bounds)
- Core mechanics that affect outcome classification
- Parameters with high sensitivity in Monte Carlo
- Tipping point thresholds
- Mortality/population dynamics

### HIGH (verify if possible, conservative defaults acceptable)
- Breakthrough effectiveness
- Government response parameters
- Economic transitions

### MEDIUM (conservative defaults acceptable)
- Social cohesion dynamics
- Quality of life dimensions
- Secondary feedback loops

### LOW (conservative defaults fine)
- Flavor text parameters
- Minor modifiers
- Background systems

---

## Monte Carlo Uncertainty Propagation

**For all conservative defaults, run sensitivity analysis:**

```bash
# Baseline: All parameters at conservative point estimates
npx tsx scripts/monteCarloSimulation.ts --runs=100 --tag=conservative_baseline

# Uncertainty sweep: Sample from ±50% ranges
npx tsx scripts/monteCarloSimulation.ts --runs=100 --tag=uncertainty_sweep --vary-unverified

# Compare outcome distributions
npx tsx scripts/compareOutcomeDistributions.ts conservative_baseline uncertainty_sweep
```

**If outcomes are highly sensitive to unverified parameters:**
- Flag those parameters for PRIORITY verification
- Consider removing mechanic if no credible source can be found
- Document: "Outcome sensitive to [parameter], currently [UNVERIFIED]"

---

## Documentation Standards

### Code Comments

```typescript
// [STATUS] - [Reason]
const param = value; // [units] ([justification])
// [Sources/Literature range]
// [Conservative choice reasoning]
// [Uncertainty quantification]
// [Verification flag if needed]
```

**Status tags:**
- `[VERIFIED]` - Peer-reviewed source, claim validated
- `[CONSERVATIVE_ESTIMATE]` - Literature range, using conservative bound
- `[UNVERIFIED]` - No source found, pure estimate
- `[OUTDATED]` - Real source, but data from pre-2022
- `[FLAGGED]` - Needs verification, high priority

### Research Files

```markdown
## Parameter: [Name]

**Status:** [VERIFIED / CONSERVATIVE_ESTIMATE / UNVERIFIED]
**Value:** X ± Y%
**Sources:**
- Author et al. (Year): [Finding]
- Author et al. (Year): [Finding]

**Conservative Choice:** [Lower/Upper] bound
**Rationale:** [Why this direction is conservative]
**Uncertainty:** ±X% in Monte Carlo runs
**Impact:** [Which simulation mechanics use this parameter]
**Verification Priority:** [CRITICAL / HIGH / MEDIUM / LOW]
```

---

## Review Checklist

**Before merging code with conservative defaults:**

- [ ] Attempted verification from 3+ sources
- [ ] Literature range documented (if available)
- [ ] Conservative bound justified (lower for positive, upper for negative)
- [ ] Uncertainty quantified (±X%)
- [ ] `[CONSERVATIVE_ESTIMATE]` tag added to code
- [ ] Monte Carlo sensitivity tested
- [ ] Flagged for future verification (if CRITICAL/HIGH priority)
- [ ] Research file updated with status

---

## Long-Term Strategy

**Conservative defaults are temporary, not permanent.**

**Monthly review:**
- Check if new research published (2024-2025 papers)
- Re-verify parameters flagged as OUTDATED
- Replace conservative estimates with verified data

**Before major releases:**
- Audit all `[CONSERVATIVE_ESTIMATE]` tags
- Prioritize verification for HIGH-sensitivity parameters
- Document remaining uncertainty in release notes

**Research pipeline:**
- Maintain list of needed research
- Reach out to domain experts
- Commission studies if critical parameter unavailable

---

## Summary

**Conservative defaults are a pragmatic response to research uncertainty, not an excuse for lazy research.**

**Use them when:**
- ✅ Verification attempted but no credible source exists
- ✅ Multiple contradictory sources, no consensus
- ✅ Data exists but severely outdated

**Don't use them when:**
- ❌ Haven't looked for research yet
- ❌ Research contradicts preferred narrative
- ❌ Critical mechanic (must verify or don't implement)

**Always:**
- ✅ Document sources checked
- ✅ Justify conservative direction
- ✅ Quantify uncertainty
- ✅ Flag for future verification
- ✅ Test Monte Carlo sensitivity

---

**Last Updated:** October 29, 2025
**See Also:**
- `plans/systematic-citation-verification-plan.md` - Full verification workflow
- `docs/CITATION_VERIFICATION_PROTOCOL.md` - Verification standards
- `research/FABRICATED_CITATIONS_NEED_REAL_RESEARCH.md` - Known fabrications
