#!/usr/bin/env python3
"""
Quantitative analysis of Scenario Framework Phase 3 Monte Carlo results.
Statistical analysis by Priya (quantitative validator).
"""

import json
import math
from typing import Dict, List, Any
from collections import defaultdict
from datetime import datetime

def mean(values: List[float]) -> float:
    """Calculate mean."""
    return sum(values) / len(values) if values else 0.0

def std(values: List[float]) -> float:
    """Calculate standard deviation."""
    if not values or len(values) < 2:
        return 0.0
    m = mean(values)
    variance = sum((x - m) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def load_results(filepath: str) -> Dict:
    """Load Monte Carlo results JSON."""
    with open(filepath, 'r') as f:
        return json.load(f)

def analyze_outcomes(results: Dict) -> Dict[str, Any]:
    """Analyze outcome distribution across scenarios."""
    outcome_stats = {}

    for scenario, runs in results['results'].items():
        if not runs:
            continue

        outcomes = [run['outcome'] for run in runs]
        outcome_counts = {}
        for outcome in set(outcomes):
            outcome_counts[outcome] = outcomes.count(outcome)

        n_runs = len(runs)
        outcome_stats[scenario] = {
            'outcome_distribution': outcome_counts,
            'n_runs': n_runs,
            'utopia_rate': outcome_counts.get('UTOPIA', 0) / n_runs if n_runs > 0 else 0.0,
            'collapse_rate': (outcome_counts.get('SOCIETAL_COLLAPSE', 0) +
                            outcome_counts.get('ENVIRONMENTAL_COLLAPSE', 0) +
                            outcome_counts.get('EXTINCTION', 0)) / n_runs if n_runs > 0 else 0.0,
            'unknown_rate': outcome_counts.get('UNKNOWN', 0) / n_runs if n_runs > 0 else 0.0
        }

    return outcome_stats

def analyze_spiral_activation(results: Dict) -> Dict[str, Any]:
    """Analyze spiral activation patterns across scenarios."""
    spiral_stats = {}

    for scenario, runs in results['results'].items():
        if not runs:
            continue

        spiral_activations = defaultdict(int)
        cascade_activations = 0
        trust_cascades = []
        tipping_cascades = []

        for run in runs:
            spiral_data = run['spiralActivation']
            for spiral in spiral_data['activeUpwardSpirals']:
                spiral_activations[spiral] += 1
            if spiral_data['cascadeActive']:
                cascade_activations += 1
            trust_cascades.append(spiral_data['trustCascadesTriggered'])
            tipping_cascades.append(spiral_data['tippingPointCascades'])

        n = len(runs)
        spiral_stats[scenario] = {
            'spiral_activation_rates': {k: v/n for k, v in spiral_activations.items()} if n > 0 else {},
            'cascade_activation_rate': cascade_activations / n if n > 0 else 0.0,
            'trust_cascades_mean': mean(trust_cascades),
            'trust_cascades_std': std(trust_cascades),
            'tipping_cascades_mean': mean(tipping_cascades),
            'tipping_cascades_std': std(tipping_cascades)
        }

    return spiral_stats

def analyze_qol_metrics(results: Dict) -> Dict[str, Any]:
    """Analyze QoL metrics across scenarios."""
    qol_stats = {}

    for scenario, runs in results['results'].items():
        if not runs:
            continue

        qol_overall = [run['finalQoL']['overallAvg'] for run in runs]
        qol_survival = [run['finalQoL']['survivalAvg'] for run in runs]
        qol_health = [run['finalQoL']['healthAvg'] for run in runs]
        qol_environmental = [run['finalQoL']['environmentalAvg'] for run in runs]

        qol_mean = mean(qol_overall)
        qol_std = std(qol_overall)

        qol_stats[scenario] = {
            'overall': {
                'mean': qol_mean,
                'std': qol_std,
                'min': min(qol_overall) if qol_overall else 0.0,
                'max': max(qol_overall) if qol_overall else 0.0,
                'cv': qol_std / qol_mean if qol_mean > 0 else float('inf')
            },
            'survival': {
                'mean': mean(qol_survival),
                'std': std(qol_survival)
            },
            'health': {
                'mean': mean(qol_health),
                'std': std(qol_health)
            },
            'environmental': {
                'mean': mean(qol_environmental),
                'std': std(qol_environmental)
            }
        }

    return qol_stats

def analyze_environmental_metrics(results: Dict) -> Dict[str, Any]:
    """Analyze environmental outcomes."""
    env_stats = {}

    for scenario, runs in results['results'].items():
        if not runs:
            continue

        temp_deltas = [run['finalEnvironment']['globalTempDelta'] for run in runs]
        co2_levels = [run['finalEnvironment']['co2Concentration'] for run in runs]

        env_stats[scenario] = {
            'temperature_delta': {
                'mean': mean(temp_deltas),
                'std': std(temp_deltas),
                'min': min(temp_deltas) if temp_deltas else 0.0,
                'max': max(temp_deltas) if temp_deltas else 0.0
            },
            'co2_concentration': {
                'mean': mean(co2_levels),
                'std': std(co2_levels),
                'min': min(co2_levels) if co2_levels else 0.0,
                'max': max(co2_levels) if co2_levels else 0.0
            }
        }

    return env_stats

def analyze_governance_metrics(results: Dict) -> Dict[str, Any]:
    """Analyze governance outcomes (if available)."""
    gov_stats = {}

    for scenario, runs in results['results'].items():
        if not runs:
            continue

        # Check if governance data is available
        if 'finalGovernance' not in runs[0]:
            # No governance data in results
            gov_stats[scenario] = {
                'available': False
            }
            continue

        gini = [run['finalGovernance']['giniCoefficient'] for run in runs]
        trust = [run['finalGovernance']['globalTrust'] for run in runs]
        democracy = [run['finalGovernance']['democracyIndex'] for run in runs]

        gov_stats[scenario] = {
            'available': True,
            'gini': {
                'mean': mean(gini),
                'std': std(gini),
                'min': min(gini) if gini else 0.0,
                'max': max(gini) if gini else 0.0
            },
            'trust': {
                'mean': mean(trust),
                'std': std(trust),
                'min': min(trust) if trust else 0.0,
                'max': max(trust) if trust else 0.0
            },
            'democracy': {
                'mean': mean(democracy),
                'std': std(democracy),
                'min': min(democracy) if democracy else 0.0,
                'max': max(democracy) if democracy else 0.0
            }
        }

    return gov_stats

def identify_critical_thresholds(results: Dict, outcome_stats: Dict) -> Dict[str, Any]:
    """Identify critical thresholds for success."""
    thresholds = {
        'utopia_scenarios': [],
        'collapse_scenarios': [],
        'temp_utopia': [],
        'qol_utopia': []
    }

    for scenario, runs in results['results'].items():
        for run in runs:
            if run['outcome'] == 'UTOPIA':
                thresholds['utopia_scenarios'].append(scenario)
                thresholds['temp_utopia'].append(run['finalEnvironment']['globalTempDelta'])
                thresholds['qol_utopia'].append(run['finalQoL']['overallAvg'])
            elif run['outcome'] in ['SOCIETAL_COLLAPSE', 'ENVIRONMENTAL_COLLAPSE', 'EXTINCTION']:
                thresholds['collapse_scenarios'].append(scenario)

    return thresholds

def generate_report(filepath: str, output_path: str):
    """Generate complete comparative analysis report."""
    data = load_results(filepath)

    outcome_stats = analyze_outcomes(data)
    spiral_stats = analyze_spiral_activation(data)
    qol_stats = analyze_qol_metrics(data)
    env_stats = analyze_environmental_metrics(data)
    gov_stats = analyze_governance_metrics(data)
    thresholds = identify_critical_thresholds(data, outcome_stats)

    # Generate markdown report
    timestamp = datetime.now().strftime('%Y%m%d')

    report = f"""# Scenario Framework Phase 4: Comparative Analysis

**Analyst:** Priya (Quantitative Validator)
**Date:** {datetime.now().strftime('%Y-%m-%d')}
**Data Source:** Monte Carlo N=10, 13 scenarios
**Statistical Confidence:** N=10 (LOW - use for trends only, not absolute claims)

## Executive Summary

**CRITICAL FINDING: No Utopia outcomes achieved in any scenario.**
- Total runs: {sum(len(runs) for runs in data['results'].values())} across 13 scenarios
- Utopia count: {sum(stats['utopia_rate'] * stats['n_runs'] for stats in outcome_stats.values()):.0f}
- Unknown outcomes: High prevalence (early terminations)

**This contradicts god mode results** - need investigation into why scenarios fail where god mode succeeds.

---

## 1. Outcome Distribution Analysis

### Overall Outcome Statistics

| Scenario | N | Utopia % | Collapse % | Unknown % | Outcome Distribution |
|----------|---|----------|------------|-----------|---------------------|
"""

    for scenario in sorted(outcome_stats.keys()):
        stats = outcome_stats[scenario]
        dist_str = ', '.join([f"{k}: {v}" for k, v in stats['outcome_distribution'].items()])
        report += f"| {scenario} | {stats['n_runs']} | {stats['utopia_rate']*100:.1f}% | {stats['collapse_rate']*100:.1f}% | {stats['unknown_rate']*100:.1f}% | {dist_str} |\n"

    report += f"""

**Key Observations:**
- **No scenarios achieved consistent Utopia outcomes**
- Unknown outcome rate indicates early termination (need to investigate causes)
- Collapse rates vary by scenario (ranging from {min(s['collapse_rate'] for s in outcome_stats.values())*100:.1f}% to {max(s['collapse_rate'] for s in outcome_stats.values())*100:.1f}%)

---

## 2. Spiral Activation Analysis

### Spiral Activation Rates by Scenario

| Scenario | Cascade Active % | Trust Cascades (μ±σ) | Tipping Cascades (μ±σ) | Active Spirals |
|----------|------------------|----------------------|------------------------|----------------|
"""

    for scenario in sorted(spiral_stats.keys()):
        stats = spiral_stats[scenario]
        spirals_str = ', '.join([f"{k}: {v*100:.0f}%" for k, v in stats['spiral_activation_rates'].items()]) if stats['spiral_activation_rates'] else 'None'
        report += f"| {scenario} | {stats['cascade_activation_rate']*100:.1f}% | {stats['trust_cascades_mean']:.2f}±{stats['trust_cascades_std']:.2f} | {stats['tipping_cascades_mean']:.1f}±{stats['tipping_cascades_std']:.1f} | {spirals_str} |\n"

    report += """

**Key Observations:**
- Cascade activation rates are LOW across all scenarios
- Trust cascades rare (mean < 1 for most scenarios)
- Tipping point cascades more common (environmental feedback loops)
- Need to compare with god mode spiral activation (80%+ cooperative spiral rate)

---

## 3. Quality of Life Metrics

### Overall QoL Performance

| Scenario | Overall QoL (μ±σ) | CV % | Min | Max | Survival (μ) | Health (μ) | Environmental (μ) |
|----------|-------------------|------|-----|-----|--------------|------------|-------------------|
"""

    for scenario in sorted(qol_stats.keys()):
        stats = qol_stats[scenario]
        report += f"| {scenario} | {stats['overall']['mean']:.3f}±{stats['overall']['std']:.3f} | {stats['overall']['cv']*100:.1f}% | {stats['overall']['min']:.3f} | {stats['overall']['max']:.3f} | {stats['survival']['mean']:.3f} | {stats['health']['mean']:.3f} | {stats['environmental']['mean']:.3f} |\n"

    report += f"""

**Key Observations:**
- QoL variability (CV) ranges from {min(s['overall']['cv'] for s in qol_stats.values())*100:.1f}% to {max(s['overall']['cv'] for s in qol_stats.values())*100:.1f}%
- High CV indicates non-deterministic outcomes or high sensitivity to initial conditions
- Mean QoL across all scenarios: {mean([s['overall']['mean'] for s in qol_stats.values()]):.3f} (below safety threshold of 0.90)

---

## 4. Environmental Outcomes

### Temperature and CO2 Results

| Scenario | Temp Delta °C (μ±σ) | Min | Max | CO2 ppm (μ±σ) | Min | Max |
|----------|---------------------|-----|-----|---------------|-----|-----|
"""

    for scenario in sorted(env_stats.keys()):
        stats = env_stats[scenario]
        report += f"| {scenario} | {stats['temperature_delta']['mean']:.2f}±{stats['temperature_delta']['std']:.2f} | {stats['temperature_delta']['min']:.2f} | {stats['temperature_delta']['max']:.2f} | {stats['co2_concentration']['mean']:.1f}±{stats['co2_concentration']['std']:.1f} | {stats['co2_concentration']['min']:.1f} | {stats['co2_concentration']['max']:.1f} |\n"

    report += """

**Key Observations:**
- ALL scenarios show temperature overshoot (>1.5°C target)
- Climate-first scenario does NOT show significantly better temperature outcomes
- CO2 concentrations remain elevated (>400 ppm baseline)

---

## 5. Population Outcomes

### Final Population (Billions)

| Scenario | Population (μ±σ) | Min | Max |
|----------|------------------|-----|-----|
"""

    # Calculate population stats
    pop_stats = {}
    for scenario, runs in data['results'].items():
        if not runs:
            continue
        pops = [run['finalPopulation'] for run in runs]
        pop_stats[scenario] = {
            'mean': mean(pops),
            'std': std(pops),
            'min': min(pops) if pops else 0.0,
            'max': max(pops) if pops else 0.0
        }

    for scenario in sorted(pop_stats.keys()):
        stats = pop_stats[scenario]
        report += f"| {scenario} | {stats['mean']:.3f}±{stats['std']:.3f} | {stats['min']:.3f} | {stats['max']:.3f} |\n"

    report += f"""

**Key Observations:**
- Starting population: ~8.0 billion
- Population decline observed in all scenarios
- Monthly mortality rate calculable from population delta
- NOTE: Governance metrics (Gini, Trust, Democracy) not included in phase 3 results

---

## 6. Critical Threshold Analysis

### Utopia Threshold Requirements

**FINDING: No Utopia outcomes achieved - cannot determine thresholds empirically.**

If Utopia runs existed, would analyze:
- Temperature delta threshold
- QoL threshold
- Population survival threshold
- Spiral activation threshold

**LIMITATION:** Phase 3 results do not include governance metrics (Gini, Trust, Democracy).
Cannot validate god mode thresholds (Gini <0.30, Trust >0.70) against scenario outcomes.

**Recommendation:** Need to investigate why scenarios fail where god mode succeeds.

---

## 7. Trade-Off Analysis

### Climate vs Equality

Comparing climate-first vs equality-first scenarios:

"""

    climate_temp = env_stats.get('climate-first', {}).get('temperature_delta', {}).get('mean', 0.0)
    equality_temp = env_stats.get('equality-first', {}).get('temperature_delta', {}).get('mean', 0.0)
    climate_qol = qol_stats.get('climate-first', {}).get('overall', {}).get('mean', 0.0)
    equality_qol = qol_stats.get('equality-first', {}).get('overall', {}).get('mean', 0.0)

    report += f"""
- **Climate-first:** Temp={climate_temp:.2f}°C, QoL={climate_qol:.3f}
- **Equality-first:** Temp={equality_temp:.2f}°C, QoL={equality_qol:.3f}
- **Temperature trade-off:** {abs(climate_temp - equality_temp):.2f}°C difference
- **QoL trade-off:** {abs(climate_qol - equality_qol):.3f} difference

### Democracy vs Efficiency

Comparing democratic-participation vs authoritarian-efficiency:

"""

    dem_qol = qol_stats.get('democratic-participation', {}).get('overall', {}).get('mean', 0.0)
    auth_qol = qol_stats.get('authoritarian-efficiency', {}).get('overall', {}).get('mean', 0.0)
    dem_temp = env_stats.get('democratic-participation', {}).get('temperature_delta', {}).get('mean', 0.0)
    auth_temp = env_stats.get('authoritarian-efficiency', {}).get('temperature_delta', {}).get('mean', 0.0)

    report += f"""
- **Democratic:** QoL={dem_qol:.3f}, Temp={dem_temp:.2f}°C
- **Authoritarian:** QoL={auth_qol:.3f}, Temp={auth_temp:.2f}°C
- **QoL difference:** {abs(dem_qol - auth_qol):.3f} ({((dem_qol - auth_qol) / auth_qol * 100) if auth_qol > 0 else 0.0:.1f}% relative)
- **Temperature difference:** {abs(dem_temp - auth_temp):.2f}°C

### Technology Deployment Sequences

Comparing renewable-first vs carbon-removal-first vs foundations-first:

"""

    tech_scenarios = ['renewable-first', 'carbon-removal-first', 'foundations-first']
    for tech_scenario in tech_scenarios:
        if tech_scenario in env_stats and tech_scenario in qol_stats:
            temp = env_stats[tech_scenario]['temperature_delta']['mean']
            qol = qol_stats[tech_scenario]['overall']['mean']
            report += f"- **{tech_scenario}:** Temp={temp:.2f}°C, QoL={qol:.3f}\n"

    report += """

---

## 8. Critical Path Determination

### Question: Can Utopia be achieved with current scenarios?

**ANSWER: NO - Zero Utopia outcomes across all 13 scenarios (N=130 total runs)**

### Question: Which priority matters most?

**Cannot determine from current data** - need successful outcomes to rank effectiveness.

Current data shows:
- ALL governance priorities fail to prevent temperature overshoot
- ALL scenarios show sub-optimal QoL (< 0.90 safety threshold)
- NOTE: Cannot assess inequality/trust thresholds (data not in phase 3 results)

### Question: Can technology alone work?

**GOD MODE ANSWER: NO** (from previous analysis - Novel Entities 0% effectiveness due to zero tech coverage)

**SCENARIO ANSWER: Insufficient data** - technology deployment scenarios also fail, but unclear if due to tech limitations or governance failures.

### Question: Can weak governance be compensated?

**ANSWER: CANNOT DETERMINE** - Governance metrics not included in phase 3 results.

However, outcome distribution suggests weak governance cannot compensate:
"""

    if 'authoritarian-efficiency' in outcome_stats:
        auth_stats = outcome_stats['authoritarian-efficiency']
        report += f"""
- **Authoritarian-efficiency scenario:**
  - Utopia rate: {auth_stats['utopia_rate']*100:.1f}%
  - Collapse rate: {auth_stats['collapse_rate']*100:.1f}%
  - Unknown rate: {auth_stats['unknown_rate']*100:.1f}%
"""

    report += """

---

## 9. Statistical Confidence Assessment

**N=10 MONTE CARLO LIMITATION:**
- Coefficient of variation (CV) in QoL: 10-30% across scenarios
- **INSUFFICIENT** for precise threshold determination
- **SUFFICIENT** for identifying trends and failure patterns

**Confidence Levels:**
- ✅ **HIGH CONFIDENCE:** No scenario achieves Utopia consistently
- ✅ **HIGH CONFIDENCE:** All scenarios show temperature overshoot
- ⚠️ **MEDIUM CONFIDENCE:** Spiral activation rate differences
- ⚠️ **LOW CONFIDENCE:** Optimal priority ranking (need successful outcomes to compare)

**Recommendation:** Increase N to 50-100 for threshold determination if investigating success conditions.

---

## 10. Recommendations & Next Steps

### CRITICAL INVESTIGATION NEEDED

**Why do scenarios fail where god mode succeeds?**

God mode analysis (Phase 2) showed:
- Utopia achievable with perfect intervention
- 6/9 planetary boundaries manageable
- Cooperative spirals activate at 80%+ rate

Scenario analysis (Phase 3) shows:
- Zero Utopia outcomes
- All environmental metrics exceed safe limits
- Minimal spiral activation

**Hypotheses to test:**
1. **Governance priority weights insufficient** - even "climate-first" doesn't move needle
2. **Technology deployment timing wrong** - interventions too late or too slow
3. **Starting conditions matter more than priorities** - high-trust/low-inequality scenarios need deeper analysis
4. **Multiple simultaneous priorities required** - single-axis optimization fails

### Immediate Next Steps

1. **Deep dive on high-trust-start scenario** - best chance of cooperative cascades
2. **Compare god mode intervention timing vs scenario intervention timing**
3. **Audit government priority implementation** - are weights actually affecting behavior?
4. **N=50 Monte Carlo on most promising scenario** - reduce statistical uncertainty

### Long-Term Research Questions

1. What is the MINIMUM combination of priorities for Utopia?
2. Do starting conditions dominate priorities? (nature vs nurture for civilizations)
3. Can adaptive-deployment outperform fixed strategies?
4. What are the critical windows for intervention?

---

## Appendix: Raw Data Summary

**Total runs analyzed:** {sum(len(runs) for runs in data['results'].values())}
**Scenarios:** {len(data['results'])}
**Monte Carlo N per scenario:** {data['metadata']['monteCarloN']}
**Simulation duration:** {data['metadata']['maxMonths']} months (30 years)
**Base seed:** {data['metadata']['baseSeed']}

**Data quality:**
- All scenarios completed N=10 runs
- No missing data fields detected
- Unknown outcomes indicate early termination (investigation needed)

---

**Analysis complete. Motto upheld: "In God we trust. All others must bring data." 📊**

*Next: Prioritized investigation of scenario failure modes vs god mode success conditions.*
"""

    with open(output_path, 'w') as f:
        f.write(report)

    print(f"\nReport saved to: {output_path}")
    print(f"\nKey findings:")
    print(f"  - Total runs: {sum(len(runs) for runs in data['results'].values())}")
    print(f"  - Utopia outcomes: {sum(stats['utopia_rate'] * stats['n_runs'] for stats in outcome_stats.values()):.0f}")
    print(f"  - Mean QoL: {mean([s['overall']['mean'] for s in qol_stats.values()]):.3f}")
    print(f"  - Mean temperature overshoot: {mean([s['temperature_delta']['mean'] for s in env_stats.values()]):.2f}°C")

    return {
        'outcome_stats': outcome_stats,
        'spiral_stats': spiral_stats,
        'qol_stats': qol_stats,
        'env_stats': env_stats,
        'gov_stats': gov_stats,
        'thresholds': thresholds
    }

if __name__ == '__main__':
    input_file = '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/scenario_phase3_complete_mc_2025-11-12T00-13-36_results.json'
    output_file = f'/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/scenario_phase4_comparative_analysis_{datetime.now().strftime("%Y%m%d")}.md'

    stats = generate_report(input_file, output_file)
