#!/usr/bin/env python3
"""
Monte Carlo Results Analysis for RD-1 and RD-3 Validation
Analyzes bifurcation metrics and simulation outcomes across N=10 runs
No external dependencies (pure Python stdlib)
"""

import json
import os
import math
from pathlib import Path
from collections import Counter

def mean(values):
    """Calculate mean"""
    return sum(values) / len(values) if values else 0

def std_dev(values):
    """Calculate standard deviation"""
    if not values or len(values) < 2:
        return 0
    m = mean(values)
    variance = sum((x - m) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def analyze_bifurcation_metrics():
    """Analyze bifurcation metrics files for seeds 42000-42009"""
    output_dir = Path(__file__).parent.parent / "monteCarloOutputs"

    results = []
    for seed in range(42000, 42010):
        filepath = output_dir / f"bifurcation_metrics_seed{seed}.json"
        if filepath.exists():
            with open(filepath) as f:
                data = json.load(f)
                results.append(data)

    if not results:
        print("❌ No bifurcation metrics files found for seeds 42000-42009")
        return None

    print(f"\n{'='*80}")
    print(f"MONTE CARLO VALIDATION: RD-1 Permafrost + RD-3 Geopolitical Conflict")
    print(f"{'='*80}\n")
    print(f"Runs analyzed: N={len(results)}")
    print(f"Seeds: {results[0]['seed']} - {results[-1]['seed']}\n")

    # 1. DETERMINISM CHECK
    print(f"\n{'='*80}")
    print("1. OUTCOME DISTRIBUTION")
    print(f"{'='*80}\n")

    outcomes = [r['outcome'] for r in results]
    final_pops = [r['finalPopulation'] for r in results]
    final_qols = [r['finalQOL'] for r in results]

    # Check for identical outcomes
    outcome_counts = Counter(outcomes)
    print(f"Outcome distribution:")
    for outcome, count in sorted(outcome_counts.items()):
        pct = 100 * count / len(results)
        print(f"  {outcome}: {count}/{len(results)} ({pct:.1f}%)")

    # Check variance in numerical outputs
    pop_mean = mean(final_pops)
    pop_std = std_dev(final_pops)
    pop_cv = 100 * pop_std / pop_mean if pop_mean > 0 else 0

    qol_mean = mean(final_qols)
    qol_std = std_dev(final_qols)
    qol_cv = 100 * qol_std / qol_mean if qol_mean > 0 else 0

    print(f"\nFinal Population:")
    print(f"  Mean: {pop_mean:.4f} billion")
    print(f"  Std Dev: {pop_std:.4f}")
    print(f"  CV: {pop_cv:.2f}%")
    print(f"  Range: [{min(final_pops):.4f}, {max(final_pops):.4f}]")

    print(f"\nFinal QoL:")
    print(f"  Mean: {qol_mean:.4f}")
    print(f"  Std Dev: {qol_std:.4f}")
    print(f"  CV: {qol_cv:.2f}%")
    print(f"  Range: [{min(final_qols):.4f}, {max(final_qols):.4f}]")

    # 2. BIFURCATION ANALYSIS
    print(f"\n{'='*80}")
    print("2. BIFURCATION & TIPPING POINT ANALYSIS")
    print(f"{'='*80}\n")

    bifurcation_types = {
        'environmental': [],
        'social': [],
        'economic': [],
        'governance': [],
        'technology': [],
        'flourishing': []
    }

    for result in results:
        for bif_type, bif_data in result['bifurcations'].items():
            bifurcation_types[bif_type].append(bif_data)

    for bif_type, occurrences in bifurcation_types.items():
        occurred_count = sum(1 for b in occurrences if b.get('occurred', False))
        occurrence_rate = 100 * occurred_count / len(occurrences)

        months = [b.get('month', 0) for b in occurrences if b.get('occurred', False)]
        avg_month = mean(months) if months else 0

        print(f"{bif_type.upper()}:")
        print(f"  Occurrence rate: {occurred_count}/{len(occurrences)} ({occurrence_rate:.1f}%)")
        if months:
            print(f"  Average timing: Month {avg_month:.1f}")
            print(f"  Range: Months {min(months)}-{max(months)}")
        print()

    # 3. Regime shift analysis
    print(f"\n{'='*80}")
    print("3. REGIME SHIFT EVENTS")
    print(f"{'='*80}\n")

    all_regime_shifts = []
    for result in results:
        all_regime_shifts.extend(result.get('regimeShiftEvents', []))

    if all_regime_shifts:
        shift_by_system = {}
        for shift in all_regime_shifts:
            system = shift['system']
            if system not in shift_by_system:
                shift_by_system[system] = []
            shift_by_system[system].append(shift)

        for system, shifts in sorted(shift_by_system.items()):
            months = [s['month'] for s in shifts]
            amplifications = [s['amplification'] for s in shifts]

            print(f"{system.upper()} regime shifts:")
            print(f"  Count: {len(shifts)} events across {len(results)} runs")
            print(f"  Average month: {mean(months):.1f}")
            print(f"  Average amplification: {mean(amplifications):.2f}×")
            print(f"  Max amplification: {max(amplifications):.2f}×")
            print()

    # 4. VARIANCE AMPLIFICATION
    print(f"\n{'='*80}")
    print("4. CRITICAL SLOWING DOWN (Variance Amplification)")
    print(f"{'='*80}\n")

    max_amplifications = [r.get('maxVarianceAmplification', 0) for r in results]
    amp_mean = mean(max_amplifications)
    amp_std = std_dev(max_amplifications)

    print(f"Maximum variance amplification:")
    print(f"  Mean: {amp_mean:.2f}×")
    print(f"  Std Dev: {amp_std:.2f}×")
    print(f"  Range: [{min(max_amplifications):.2f}×, {max(max_amplifications):.2f}×]")

    if amp_mean > 5:
        print(f"\n⚠️  HIGH variance amplification detected (>{5:.1f}×)")
        print(f"     Indicates critical slowing down near tipping points")

    # 5. DISTANCE TO THRESHOLDS
    avg_distances = [r.get('avgDistanceToThresholds', 0) for r in results]
    dist_mean = mean(avg_distances)
    dist_std = std_dev(avg_distances)

    print(f"\nAverage distance to critical thresholds:")
    print(f"  Mean: {dist_mean:.6f}")
    print(f"  Std Dev: {dist_std:.6f}")

    if dist_mean < 0.01:
        print(f"\n⚠️  VERY CLOSE to critical thresholds (< 0.01)")
        print(f"     System is near tipping points")

    # SUMMARY STATISTICS
    print(f"\n{'='*80}")
    print("5. SUMMARY & ASSESSMENT")
    print(f"{'='*80}\n")

    # Crash rate
    crash_rate = 100 * sum(1 for r in results if r.get('crashed', False)) / len(results)
    print(f"Crash rate: {crash_rate:.1f}%")

    # Most common outcome
    most_common_outcome = outcome_counts.most_common(1)[0]
    print(f"Most common outcome: {most_common_outcome[0]} ({100*most_common_outcome[1]/len(results):.1f}%)")

    # Overall stability assessment
    print(f"\nSTABILITY ASSESSMENT:")

    issues = []
    if crash_rate > 0:
        issues.append(f"CRITICAL: {crash_rate:.1f}% crash rate")

    if amp_mean > 10:
        issues.append(f"HIGH: Extreme variance amplification ({amp_mean:.1f}×)")

    if outcome_counts.get('DYSTOPIA', 0) > len(results) * 0.8:
        issues.append(f"WARNING: {100*outcome_counts.get('DYSTOPIA', 0)/len(results):.1f}% dystopia rate")

    if issues:
        print("  ⚠️  ISSUES DETECTED:")
        for issue in issues:
            print(f"     - {issue}")
    else:
        print("  ✅ No critical stability issues detected")

    print(f"\n{'='*80}")
    print("NOTE: Bifurcation metrics only. For RD-1 (Permafrost) and RD-3 (Geopolitical)")
    print("specific validation, need to examine detailed simulation state or logs.")
    print(f"{'='*80}\n")

    return results

if __name__ == "__main__":
    analyze_bifurcation_metrics()
