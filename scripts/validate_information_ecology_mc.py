#!/usr/bin/env python3
"""
Monte Carlo Validation for Information Ecology System
Priya's Statistical Analysis

Validates:
1. Determinism (CV < 0.01% for identical seeds)
2. Impact validation (coordination drop during nuclear events)
3. Distribution validation (realistic ranges, expected patterns)
4. Parameter sampling (CV > 10% for stochastic parameters)
"""

import json
import glob
import numpy as np
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

def coefficient_of_variation(values: List[float]) -> float:
    """Calculate CV as (std/mean) * 100"""
    if not values or len(values) < 2:
        return 0.0
    mean = np.mean(values)
    if mean == 0:
        return 0.0
    std = np.std(values, ddof=1)
    return (std / mean) * 100.0

def load_bifurcation_metrics(seed: int) -> Dict:
    """Load bifurcation metrics file for a seed"""
    path = f"monteCarloOutputs/bifurcation_metrics_seed{seed}.json"
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def load_event_log(seed: int) -> Dict:
    """Load unprecedented/historical events for a seed"""
    for pattern in [f"run_{seed}_unprecedented_events.json", f"run_{seed}_historical_events.json"]:
        path = f"monteCarloOutputs/{pattern}"
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            continue
    return None

def extract_nuclear_events(events_data: Dict) -> List[Dict]:
    """Extract nuclear detonation events"""
    if not events_data or 'events' not in events_data:
        return []

    # Events are nested: events.summary.criticalEvents
    nuclear_events = []
    summary = events_data['events'].get('summary', {})
    critical_events = summary.get('criticalEvents', [])

    for event in critical_events:
        if isinstance(event, dict):
            title = event.get('title', '')
            if 'NUCLEAR' in title.upper() or 'DETONATION' in title.upper():
                nuclear_events.append(event)
    return nuclear_events

def analyze_determinism():
    """Test 1: Determinism validation with seed 42000"""
    print("\n" + "="*80)
    print("TEST 1: DETERMINISM VALIDATION (Seed 42000)")
    print("="*80)

    # The test ran 3 times with same seed
    # Check if we have data from the recent determinism test
    metrics = load_bifurcation_metrics(42000)

    if not metrics:
        print("❌ BLOCKED: No bifurcation metrics found for seed 42000")
        print("   Need to extract snapshot data from logs instead")
        return

    print(f"\n📊 Bifurcation metrics for seed 42000:")
    print(f"   Months simulated: {metrics['months']}")
    print(f"   Outcome: {metrics['outcome']}")
    print(f"   Final population: {metrics['finalPopulation']:.3f}B")
    print(f"   Final QoL: {metrics['finalQOL']:.3f}")

    # For determinism, we need multiple runs with SAME seed
    # Let's check if there are snapshot files in logs
    print("\n⚠️  NOTE: Bifurcation metrics don't include Information Ecology fields")
    print("   Need to parse log files or check if snapshots were written to disk")

def analyze_parameter_sampling():
    """Test 4: Parameter sampling verification"""
    print("\n" + "="*80)
    print("TEST 4: PARAMETER SAMPLING VERIFICATION")
    print("="*80)

    # Load recent Monte Carlo runs (seed 42000-42020)
    seeds = range(42000, 42020)

    # We need to extract initial parameters from snapshots
    # But bifurcation metrics don't include IE parameters
    # Need to check event logs or snapshots

    print("\n⚠️  NOTE: Bifurcation metrics don't track IE parameters")
    print("   Need snapshot files with factCheckHalfLife, misinformationR0")
    print("   These should be in monthly snapshots if logging.ts fix is working")

def analyze_impact_validation():
    """Test 2: Impact validation - coordination drop during nuclear events"""
    print("\n" + "="*80)
    print("TEST 2: IMPACT VALIDATION (Nuclear Events)")
    print("="*80)

    seeds_with_nuclear = []
    coordination_drops = []

    # Scan recent runs for nuclear events
    for seed in range(42000, 42020):
        events = load_event_log(seed)
        if not events:
            continue

        nuclear_events = extract_nuclear_events(events)
        if nuclear_events:
            seeds_with_nuclear.append(seed)
            print(f"\n🔥 Seed {seed}: {len(nuclear_events)} nuclear event(s)")
            for event in nuclear_events:
                print(f"   Month {event.get('month', 'N/A')}: {event.get('title', 'Unknown')}")

    if not seeds_with_nuclear:
        print("\n⚠️  No nuclear events found in recent runs (seeds 42000-42019)")
        print("   Cannot validate coordination capacity impact")
    else:
        print(f"\n✅ Found nuclear events in {len(seeds_with_nuclear)} runs")
        print("   Need snapshot data to measure coordination capacity before/after")

def analyze_outcome_distributions():
    """Test 3: Distribution validation"""
    print("\n" + "="*80)
    print("TEST 3: OUTCOME DISTRIBUTION VALIDATION")
    print("="*80)

    outcomes = []
    final_populations = []
    final_qols = []
    months_simulated = []

    for seed in range(42000, 42020):
        metrics = load_bifurcation_metrics(seed)
        if not metrics:
            continue

        outcomes.append(metrics['outcome'])
        final_populations.append(metrics['finalPopulation'])
        final_qols.append(metrics['finalQOL'])
        months_simulated.append(metrics['months'])

    if not outcomes:
        print("❌ BLOCKED: No bifurcation metrics found for recent runs")
        return

    # Outcome distribution
    outcome_counts = defaultdict(int)
    for outcome in outcomes:
        outcome_counts[outcome] += 1

    print(f"\n📊 Outcome Distribution (N={len(outcomes)} runs):")
    for outcome, count in sorted(outcome_counts.items(), key=lambda x: -x[1]):
        pct = (count / len(outcomes)) * 100
        print(f"   {outcome:15s}: {count:2d} runs ({pct:5.1f}%)")

    # Final population distribution
    if final_populations:
        print(f"\n📊 Final Population Distribution:")
        print(f"   Mean:   {np.mean(final_populations):.3f}B")
        print(f"   Median: {np.median(final_populations):.3f}B")
        print(f"   Std:    {np.std(final_populations):.3f}B")
        print(f"   Min:    {np.min(final_populations):.3f}B")
        print(f"   Max:    {np.max(final_populations):.3f}B")
        print(f"   CV:     {coefficient_of_variation(final_populations):.2f}%")

    # Simulation length distribution
    if months_simulated:
        print(f"\n📊 Simulation Length Distribution:")
        print(f"   Mean:   {np.mean(months_simulated):.1f} months")
        print(f"   Median: {np.median(months_simulated):.1f} months")
        print(f"   Min:    {np.min(months_simulated)} months")
        print(f"   Max:    {np.max(months_simulated)} months")

        early_terminations = sum(1 for m in months_simulated if m < 120)
        pct_early = (early_terminations / len(months_simulated)) * 100
        print(f"   Early terminations (<120 months): {early_terminations}/{len(months_simulated)} ({pct_early:.1f}%)")

def main():
    print("\n🔬 PRIYA'S MONTE CARLO VALIDATION - INFORMATION ECOLOGY")
    print("="*80)
    print("Research simulation rigor: CV < 0.01% for determinism")
    print("Expected impacts: 20-40% coordination drop during nuclear events")
    print("="*80)

    # Run all analyses
    analyze_determinism()
    analyze_impact_validation()
    analyze_outcome_distributions()
    analyze_parameter_sampling()

    # Summary
    print("\n" + "="*80)
    print("VALIDATION SUMMARY")
    print("="*80)
    print("\n✅ AVAILABLE DATA:")
    print("   - Bifurcation metrics (outcome, population, QoL)")
    print("   - Event logs (nuclear events, unprecedented events)")
    print("   - 20 Monte Carlo runs (seeds 42000-42019)")

    print("\n⚠️  BLOCKED - MISSING DATA:")
    print("   - Snapshot files with Information Ecology metrics")
    print("   - Monthly snapshots for before/after analysis")
    print("   - Initial parameter values (factCheckHalfLife, misinformationR0)")

    print("\n🔍 NEXT STEPS:")
    print("   1. Check if snapshot files are written to disk")
    print("   2. Parse log files for Information Ecology phase output")
    print("   3. Extract epistemicHealth, coordinationCapacity from snapshots")
    print("   4. Rerun determinism test with snapshot export enabled")

    print("\n📊 PRELIMINARY FINDINGS:")
    print("   - High early termination rate (need to check if DYSTOPIA outcomes)")
    print("   - Nuclear events present in recent runs (good for impact validation)")
    print("   - Bifurcation metrics available but lack IE fields")

if __name__ == "__main__":
    main()
