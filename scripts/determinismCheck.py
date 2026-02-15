#!/usr/bin/env python3
"""
Determinism check for Monte Carlo runs

Compares same seed + same mode across different run batches to detect non-determinism.
Expected: CV < 0.01% for deterministic simulations
"""

import json
import glob
import os
from collections import defaultdict
from math import sqrt

def calculate_cv(values):
    """Calculate coefficient of variation (as percentage)"""
    if len(values) < 2:
        return float('nan')

    mean = sum(values) / len(values)
    if abs(mean) < 1e-10:
        return float('nan')

    variance = sum((v - mean) ** 2 for v in values) / len(values)
    std_dev = sqrt(variance)

    return (std_dev / abs(mean)) * 100

def main():
    os.chdir('/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/monteCarloOutputs')

    # Group runs by (seed, mode)
    runs = defaultdict(list)

    for filepath in glob.glob('run_*_events.json'):
        with open(filepath) as f:
            data = json.load(f)

        seed = data.get('seed')
        mode = data.get('scenarioMode')

        if seed is None or mode is None:
            continue

        # Extract metrics
        initial = data.get('snapshots', {}).get('initial', {})
        final = data.get('snapshots', {}).get('final', {})

        metrics = {
            'informationIntegrity': final.get('informationIntegrity'),
            'socialStability': final.get('socialStability'),
            'trustInAI': final.get('trustInAI'),
            'outcome': data.get('outcome'),
        }

        runs[(seed, mode)].append(metrics)

    print("📊 DETERMINISM CHECK - Monte Carlo Validation\\n")
    print("="*80 + "\\n")

    # Count repetitions
    repetition_counts = defaultdict(int)
    for (seed, mode), run_list in runs.items():
        repetition_counts[len(run_list)] += 1

    print(f"Total unique (seed, mode) pairs: {len(runs)}")
    print(f"Repetitions distribution:")
    for count, num_pairs in sorted(repetition_counts.items()):
        print(f"  {count} runs: {num_pairs} pairs")

    # Find pairs with multiple runs (for determinism testing)
    repeated_pairs = [(k, v) for k, v in runs.items() if len(v) > 1]

    if not repeated_pairs:
        print("\\n❌ No repeated (seed, mode) pairs found - cannot test determinism")
        print("For determinism test, need 2+ runs with IDENTICAL seed + mode")
        return

    print(f"\\nPairs with multiple runs (testable): {len(repeated_pairs)}\\n")

    # Calculate CV for each repeated pair
    all_cvs = []
    determinism_failures = []

    for (seed, mode), run_list in sorted(repeated_pairs)[:10]:  # Show first 10
        print(f"Seed {seed}, Mode {mode} ({len(run_list)} runs):")

        # Extract values
        info_values = [r['informationIntegrity'] for r in run_list if r['informationIntegrity'] is not None]
        social_values = [r['socialStability'] for r in run_list if r['socialStability'] is not None]
        trust_values = [r['trustInAI'] for r in run_list if r['trustInAI'] is not None]
        outcomes = [r['outcome'] for r in run_list]

        # Calculate CVs
        cv_info = calculate_cv(info_values) if info_values else float('nan')
        cv_social = calculate_cv(social_values) if social_values else float('nan')
        cv_trust = calculate_cv(trust_values) if trust_values else float('nan')

        # Check outcomes
        unique_outcomes = set(outcomes)
        outcomes_identical = len(unique_outcomes) == 1

        # Status
        def status(cv):
            if cv != cv:  # NaN check
                return '⚠️ '
            elif cv < 0.01:
                return '✅'
            elif cv < 0.1:
                return '⚠️ '
            else:
                return '❌'

        print(f"  Information Integrity CV: {cv_info:.4f}% {status(cv_info)}")
        print(f"  Social Stability CV:      {cv_social:.4f}% {status(cv_social)}")
        print(f"  Trust in AI CV:           {cv_trust:.4f}% {status(cv_trust)}")
        print(f"  Outcomes: {', '.join(outcomes)} {'✅' if outcomes_identical else '❌'}")

        # Track failures
        if cv_info >= 0.01:
            determinism_failures.append(f"{seed}/{mode}/informationIntegrity: {cv_info:.4f}%")
        if cv_social >= 0.01:
            determinism_failures.append(f"{seed}/{mode}/socialStability: {cv_social:.4f}%")
        if cv_trust >= 0.01:
            determinism_failures.append(f"{seed}/{mode}/trustInAI: {cv_trust:.4f}%")
        if not outcomes_identical:
            determinism_failures.append(f"{seed}/{mode}/outcome: {unique_outcomes}")

        # Collect CVs
        for cv in [cv_info, cv_social, cv_trust]:
            if cv == cv:  # Not NaN
                all_cvs.append(cv)

        print()

    # Overall verdict
    print("\\n" + "="*80 + "\\n")

    if all_cvs:
        avg_cv = sum(all_cvs) / len(all_cvs)
        max_cv = max(all_cvs)

        print(f"AGGREGATE STATISTICS:\\n")
        print(f"  Average CV: {avg_cv:.4f}%")
        print(f"  Maximum CV: {max_cv:.4f}%")
        print(f"  Metrics tested: {len(all_cvs)}")

        print(f"\\nDETERMINISM VERDICT:\\n")

        if avg_cv < 0.01:
            print(f"  ✅ PASS - Average CV: {avg_cv:.4f}% < 0.01%")
            print(f"  Simulation is deterministic.\\n")
        elif avg_cv < 0.1:
            print(f"  ⚠️  CONDITIONAL PASS - Average CV: {avg_cv:.4f}%")
            print(f"  Nearly deterministic, but exceeds strict threshold.\\n")
        else:
            print(f"  ❌ FAIL - Average CV: {avg_cv:.4f}% > 0.1%")
            print(f"  Non-deterministic behavior detected.\\n")

        if determinism_failures:
            print(f"FAILURES ({len(determinism_failures)}):\\n")
            for failure in determinism_failures[:20]:  # Show first 20
                print(f"  {failure}")
            if len(determinism_failures) > 20:
                print(f"  ... and {len(determinism_failures) - 20} more")
            print()
    else:
        print("⚠️  No valid CVs calculated - insufficient data\\n")

if __name__ == '__main__':
    main()
