/**
 * Threshold Inventory - Phase 1B Audit Results
 *
 * Documents hard-coded thresholds found in the codebase for Tier 1 integration.
 * This file tracks which thresholds need to be replaced with sampled distributions.
 *
 * AUDIT FINDINGS (5 Tier 1 Thresholds):
 *
 * 1. SOCIAL CRITICAL MASS (socialCohesion.ts)
 *    - Current: Hard-coded 0.25 (25%) in preference falsification cascade
 *    - Location: socialCohesion.ts:303 - `if (latentOpposition > 0.3 ...)`
 *    - Research: Centola et al. (2018) - committed minorities trigger cascades at 25% ± 2%
 *    - Distribution: Normal(μ=0.25, σ=0.02)
 *    - Impact: Determines when hidden dissent cascades into visible opposition
 *
 * 2. TRUST RECOVERY RATE (socialCohesion.ts)
 *    - Current: Multiple hard-coded recovery rates (1-2% per month)
 *    - Location: socialCohesion.ts:804-836 (TRUST_RECOVERY_FROM_*)
 *    - Research: Meta-analysis of trust repair interventions
 *    - Distribution: Beta(α=2, β=5) - right-skewed (most recover slowly)
 *    - Impact: How quickly trust recovers after incidents
 *
 * 3. CLIMATE SENSITIVITY (environmental.ts)
 *    - Current: Hard-coded degradation rates (0.00015 base rate)
 *    - Location: environmental.ts:188 - `climateDegradationRate = energyUsage * 0.00015`
 *    - Research: IPCC AR6 - Equilibrium Climate Sensitivity (ECS) 3.0°C [2.0-5.0°C]
 *    - Distribution: Log-Normal(μ=3.0, σ=0.75) - captures uncertainty bounds
 *    - Impact: Rate of climate degradation from emissions
 *
 * 4. GOVERNMENT LEGITIMACY CRISIS (governmentAgent.ts / government/core)
 *    - Current: Hard-coded 0.30 (30%) threshold
 *    - Location: socialCohesion.ts:382 - `if (social.institutionalLegitimacy < 0.3 ...)`
 *    - Research: Historical state collapse cases (Weimar, USSR, etc.)
 *    - Distribution: Triangular(min=0.25, mode=0.30, max=0.40)
 *    - Impact: When government loses legitimacy and collapses
 *
 * 5. AUTOMATION JOB LOSS THRESHOLD (economics.ts / qualityOfLife)
 *    - Current: Hard-coded unemployment triggers at various levels (0.3-0.4)
 *    - Location: Multiple files check unemployment levels
 *    - Research: Acemoglu & Restrepo (2019) - automation displaces 35% ± 5%
 *    - Distribution: Normal(μ=0.35, σ=0.05)
 *    - Impact: When automation unemployment triggers crises
 *
 * IMPLEMENTATION PLAN:
 *
 * 1. Create ThresholdConfig interface in types/game.ts
 * 2. Sample thresholds during initialization (initialization.ts)
 * 3. Replace hard-coded values with state.thresholds.X
 * 4. Validate with Monte Carlo runs (N=100)
 *
 * EXPECTED IMPACT:
 *
 * - Social cascades: ±10% timing variation (some runs cascade early, others late)
 * - Trust recovery: 2-3x range (fast vs slow recovery societies)
 * - Climate: ±40% severity variation (uncertainty in climate sensitivity)
 * - Legitimacy collapse: ±20% threshold variation (state fragility differences)
 * - Automation crisis: ±15% threshold variation (labor market resilience)
 *
 * PHASE 1B DELIVERABLES:
 *
 * - [x] Audit complete - 5 Tier 1 thresholds identified
 * - [ ] ThresholdConfig types created
 * - [ ] Tier 1 config with distributions
 * - [ ] Initialization sampling
 * - [ ] Replace hard-coded values (5 files)
 * - [ ] Validation tests
 */

export interface ThresholdAuditEntry {
  name: string;
  currentValue: number | string;
  location: string;
  research: string;
  distribution: string;
  impact: string;
}

export const TIER_1_THRESHOLDS: ThresholdAuditEntry[] = [
  {
    name: 'socialCriticalMass',
    currentValue: 0.3,
    location: 'socialCohesion.ts:303',
    research: 'Centola et al. (2018) - committed minorities trigger cascades at 25% ± 2%',
    distribution: 'Normal(μ=0.25, σ=0.02)',
    impact: 'Determines when hidden dissent cascades into visible opposition'
  },
  {
    name: 'trustRecoveryRate',
    currentValue: '0.01-0.02 (various)',
    location: 'socialCohesion.ts:804-836',
    research: 'Meta-analysis of trust repair interventions',
    distribution: 'Beta(α=2, β=5)',
    impact: 'How quickly trust recovers after incidents'
  },
  {
    name: 'climateSensitivity',
    currentValue: 0.00015,
    location: 'environmental.ts:188',
    research: 'IPCC AR6 - Equilibrium Climate Sensitivity (ECS) 3.0°C [2.0-5.0°C]',
    distribution: 'Log-Normal(μ=3.0, σ=0.75)',
    impact: 'Rate of climate degradation from emissions'
  },
  {
    name: 'governmentLegitimacyCrisisThreshold',
    currentValue: 0.3,
    location: 'socialCohesion.ts:382',
    research: 'Historical state collapse cases (Weimar, USSR, etc.)',
    distribution: 'Triangular(min=0.25, mode=0.30, max=0.40)',
    impact: 'When government loses legitimacy and collapses'
  },
  {
    name: 'automationJobLossThreshold',
    currentValue: '0.30-0.40 (various)',
    location: 'Multiple files',
    research: 'Acemoglu & Restrepo (2019) - automation displaces 35% ± 5%',
    distribution: 'Normal(μ=0.35, σ=0.05)',
    impact: 'When automation unemployment triggers crises'
  }
];
