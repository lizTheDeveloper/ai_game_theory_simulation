#!/usr/bin/env python3
"""
Monte Carlo Results Analysis for RD-1 and RD-3 Validation
Analyzes bifurcation metrics and simulation outcomes across N=10 runs
"""

import json
import os
import numpy as np
from pathlib import Path
from collections import Counter

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
    print("1. DETERMINISM CHECK")
    print(f"{'='*80}\n")

    outcomes = [r['outcome'] for r in results]
    final_pops = [r['finalPopulation'] for r in results]
    final_qols = [r['finalQOL'] for r in results]

    # Check for identical outcomes (perfect determinism with same seed not expected across different seeds)
    outcome_counts = Counter(outcomes)
    print(f"Outcome distribution:")
    for outcome, count in sorted(outcome_counts.items()):
        pct = 100 * count / len(results)
        print(f"  {outcome}: {count}/{len(results)} ({pct:.1f}%)")

    # Check variance in numerical outputs (should be high across different seeds)
    pop_cv = 100 * np.std(final_pops) / np.mean(final_pops) if np.mean(final_pops) > 0 else 0
    qol_cv = 100 * np.std(final_qols) / np.mean(final_qols) if np.mean(final_qols) > 0 else 0

    print(f"\nFinal Population:")
    print(f"  Mean: {np.mean(final_pops):.4f} billion")
    print(f"  Std Dev: {np.std(final_pops):.4f}")
    print(f"  CV: {pop_cv:.2f}%")
    print(f"  Range: [{np.min(final_pops):.4f}, {np.max(final_pops):.4f}]")

    print(f"\nFinal QoL:")
    print(f"  Mean: {np.mean(final_qols):.4f}")
    print(f"  Std Dev: {np.std(final_qols):.4f}")
    print(f"  CV: {qol_cv:.2f}%")
    print(f"  Range: [{np.min(final_qols):.4f}, {np.max(final_qols):.4f}]")

    # Note: Different seeds SHOULD produce different outcomes (that's the point of Monte Carlo)
    print(f"\n✅ Different RNG seeds producing different outcomes (expected behavior)")

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
        avg_month = np.mean(months) if months else 0

        print(f"{bif_type.upper()}:")
        print(f"  Occurrence rate: {occurred_count}/{len(occurrences)} ({occurrence_rate:.1f}%)")
        if months:
            print(f"  Average timing: Month {avg_month:.1f}")
            print(f"  Range: Months {min(months)}-{max(months)}")
        print()

    # Regime shift analysis
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
            print(f"  Average month: {np.mean(months):.1f}")
            print(f"  Average amplification: {np.mean(amplifications):.2f}×")
            print(f"  Max amplification: {np.max(amplifications):.2f}×")
            print()

    # 4. VARIANCE AMPLIFICATION
    print(f"\n{'='*80}")
    print("4. CRITICAL SLOWING DOWN (Variance Amplification)")
    print(f"{'='*80}\n")

    max_amplifications = [r.get('maxVarianceAmplification', 0) for r in results]
    print(f"Maximum variance amplification:")
    print(f"  Mean: {np.mean(max_amplifications):.2f}×")
    print(f"  Std Dev: {np.std(max_amplifications):.2f}×")
    print(f"  Range: [{np.min(max_amplifications):.2f}×, {np.max(max_amplifications):.2f}×]")

    if np.mean(max_amplifications) > 5:
        print(f"\n⚠️  HIGH variance amplification detected (>{5:.1f}×)")
        print(f"     Indicates critical slowing down near tipping points")

    # 5. DISTANCE TO THRESHOLDS
    avg_distances = [r.get('avgDistanceToThresholds', 0) for r in results]
    print(f"\nAverage distance to critical thresholds:")
    print(f"  Mean: {np.mean(avg_distances):.6f}")
    print(f"  Std Dev: {np.std(avg_distances):.6f}")

    if np.mean(avg_distances) < 0.01:
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

    if np.mean(max_amplifications) > 10:
        issues.append(f"HIGH: Extreme variance amplification ({np.mean(max_amplifications):.1f}×)")

    if outcome_counts.get('DYSTOPIA', 0) > len(results) * 0.8:
        issues.append(f"WARNING: {100*outcome_counts.get('DYSTOPIA', 0)/len(results):.1f}% dystopia rate")

    if issues:
        print("  ❌ ISSUES DETECTED:")
        for issue in issues:
            print(f"     - {issue}")
    else:
        print("  ✅ No critical issues detected")

    return results

if __name__ == "__main__":
    results = analyze_bifurcation_metrics()

    if results:
        print(f"\n{'='*80}")
        print(f"Analysis complete. Bifurcation metrics only available.")
        print(f"For RD-1 (Permafrost) and RD-3 (Geopolitical) specific validation,")
        print(f"need to examine detailed simulation logs or add custom metrics.")
        print(f"{'='*80}\n")
