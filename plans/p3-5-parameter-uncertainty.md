# P3.5: Continuous Parameter Uncertainty

**Status:** Not yet implemented
**Estimated Time:** 6-8 hours
**Priority:** LOW
**Category:** Enhancement - Uncertainty Modeling

## Overview

Add continuous parameter uncertainty sampling for robust uncertainty quantification across all model parameters.

## Problem

Current simulation uses point estimates for parameters (e.g., `cascadeMortalityRate = 0.005`). Real-world parameters have uncertainty bounds:
- Mortality rates: ±20-50% uncertainty
- Economic parameters: ±30-100% uncertainty
- AI capability growth: ±200-500% uncertainty (highly uncertain)

## Proposed Solution

### Parameter Uncertainty System

```typescript
interface UncertainParameter {
  name: string;
  nominalValue: number; // Best estimate
  distribution: 'normal' | 'lognormal' | 'uniform';
  uncertainty: {
    lowerBound: number;
    upperBound: number;
    standardDeviation?: number; // For normal/lognormal
  };
  correlatedWith?: string[]; // Other parameters that correlate
}

interface ParameterSample {
  seed: number;
  parameters: Map<string, number>; // Sampled values for this run
}

function sampleParameters(config: SimulationConfig): ParameterSample {
  const sample = new Map<string, number>();

  config.uncertainParameters.forEach(param => {
    let value: number;

    switch (param.distribution) {
      case 'normal':
        value = randomNormal(param.nominalValue, param.uncertainty.standardDeviation);
        value = clamp(value, param.uncertainty.lowerBound, param.uncertainty.upperBound);
        break;

      case 'lognormal':
        value = randomLogNormal(param.nominalValue, param.uncertainty.standardDeviation);
        break;

      case 'uniform':
        value = randomUniform(param.uncertainty.lowerBound, param.uncertainty.upperBound);
        break;
    }

    sample.set(param.name, value);
  });

  // Handle correlations
  applyCorrelations(sample, config.uncertainParameters);

  return { seed: config.seed, parameters: sample };
}
```

### Example Uncertain Parameters

```typescript
const uncertainParameters: UncertainParameter[] = [
  {
    name: 'cascadeMortalityRate',
    nominalValue: 0.005,
    distribution: 'lognormal',
    uncertainty: { lowerBound: 0.002, upperBound: 0.015 } // 0.2% to 1.5%
  },
  {
    name: 'aiCapabilityGrowthRate',
    nominalValue: 0.0905,
    distribution: 'lognormal',
    uncertainty: { lowerBound: 0.03, upperBound: 0.20 } // High uncertainty
  },
  {
    name: 'climateChangeRate',
    nominalValue: 0.0006,
    distribution: 'normal',
    uncertainty: { lowerBound: 0.0003, upperBound: 0.0012 },
    correlatedWith: ['biodiversityLossRate'] // Climate and biodiversity linked
  }
];
```

### Sensitivity Analysis

```typescript
function runSensitivityAnalysis(baseConfig: SimulationConfig, runs: number): SensitivityResults {
  const results: SimulationResult[] = [];

  for (let i = 0; i < runs; i++) {
    const paramSample = sampleParameters(baseConfig);
    const config = { ...baseConfig, parameterSample };
    const result = runSimulation(config);
    results.push(result);
  }

  // Compute sensitivity metrics
  return analyzeSensitivity(results);
}
```

## Expected Impact

- Robust uncertainty quantification (confidence intervals for all outcomes)
- Identify which parameters drive outcomes most strongly
- More honest about forecast uncertainty

## Test Criteria

- [ ] 100-run Monte Carlo shows outcome distributions (not point estimates)
- [ ] Can generate confidence intervals: "50% chance of 2-5B population"
- [ ] Sensitivity analysis identifies top 5 most influential parameters

## References

- Uncertainty quantification literature
- Monte Carlo methods
- Latin hypercube sampling

## Files to Create

- `/src/simulation/parameterUncertainty.ts` - Sampling logic
- `/src/analysis/sensitivityAnalysis.ts` - Sensitivity analysis
- `/tests/sensitivity/` - Sensitivity test suite

## Files to Modify

- `/src/types/game.ts` - Add UncertainParameter, ParameterSample types
- `/src/simulation/initialization.ts` - Sample parameters at initialization
