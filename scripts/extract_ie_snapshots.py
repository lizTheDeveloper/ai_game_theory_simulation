#!/usr/bin/env python3
"""
Extract Information Ecology metrics from Monte Carlo run logs
"""

import json
import glob
from pathlib import Path

def extract_ie_from_run(seed: int):
    """Extract IE metrics from a single run's log file"""
    # Try both event types
    for pattern in [f"run_{seed}_unprecedented_events.json", f"run_{seed}_historical_events.json"]:
        path = f"monteCarloOutputs/{pattern}"
        try:
            with open(path, 'r') as f:
                data = json.load(f)

            # Check if snapshots exist
            if 'snapshots' not in data:
                continue

            snapshots = data['snapshots']

            # Check initial snapshot
            initial = snapshots.get('initial', {})
            final = snapshots.get('final', {})

            # Check for IE fields
            ie_fields = ['epistemicHealth', 'polarization', 'socialTrust', 'sharedReality',
                        'misinformationLoad', 'factCheckHalfLife', 'misinformationR0', 'coordinationCapacity']

            initial_ie = {field: initial.get(field) for field in ie_fields}
            final_ie = {field: final.get(field) for field in ie_fields}

            return {
                'seed': seed,
                'totalMonths': data.get('totalMonths', 0),
                'outcome': data.get('outcome', 'unknown'),
                'initial': initial_ie,
                'final': final_ie,
                'has_ie_data': any(v is not None for v in initial_ie.values())
            }
        except FileNotFoundError:
            continue
        except Exception as e:
            print(f"Error processing seed {seed}: {e}")
            continue

    return None

def main():
    print("🔍 EXTRACTING INFORMATION ECOLOGY METRICS FROM SNAPSHOTS")
    print("="*80)

    seeds_with_ie = []
    seeds_without_ie = []

    for seed in range(42000, 42020):
        result = extract_ie_from_run(seed)
        if result:
            if result['has_ie_data']:
                seeds_with_ie.append(result)
                print(f"✅ Seed {seed}: IE data found")
                print(f"   Months: {result['totalMonths']}, Outcome: {result['outcome']}")
                print(f"   Initial epistemic health: {result['initial']['epistemicHealth']}")
                print(f"   Final epistemic health: {result['final']['epistemicHealth']}")
                print(f"   Initial coordination: {result['initial']['coordinationCapacity']}")
                print(f"   Final coordination: {result['final']['coordinationCapacity']}")
            else:
                seeds_without_ie.append(seed)
                print(f"⚠️  Seed {seed}: No IE data in snapshots")
        else:
            print(f"❌ Seed {seed}: No run log found")

    print("\n" + "="*80)
    print(f"SUMMARY:")
    print(f"  Seeds with IE data: {len(seeds_with_ie)}")
    print(f"  Seeds without IE data: {len(seeds_without_ie)}")

    if seeds_with_ie:
        print("\n📊 AGGREGATE STATISTICS:")

        # Extract all values
        initial_epistemic = [s['initial']['epistemicHealth'] for s in seeds_with_ie if s['initial']['epistemicHealth'] is not None]
        final_epistemic = [s['final']['epistemicHealth'] for s in seeds_with_ie if s['final']['epistemicHealth'] is not None]

        initial_coord = [s['initial']['coordinationCapacity'] for s in seeds_with_ie if s['initial']['coordinationCapacity'] is not None]
        final_coord = [s['final']['coordinationCapacity'] for s in seeds_with_ie if s['final']['coordinationCapacity'] is not None]

        if initial_epistemic and final_epistemic:
            import numpy as np
            print(f"\n  Epistemic Health:")
            print(f"    Initial - Mean: {np.mean(initial_epistemic):.3f}, Std: {np.std(initial_epistemic):.3f}")
            print(f"    Final   - Mean: {np.mean(final_epistemic):.3f}, Std: {np.std(final_epistemic):.3f}")

            deltas = [f - i for i, f in zip(initial_epistemic, final_epistemic)]
            print(f"    Change  - Mean: {np.mean(deltas):.3f}, Std: {np.std(deltas):.3f}")

        if initial_coord and final_coord:
            import numpy as np
            print(f"\n  Coordination Capacity:")
            print(f"    Initial - Mean: {np.mean(initial_coord):.3f}, Std: {np.std(initial_coord):.3f}")
            print(f"    Final   - Mean: {np.mean(final_coord):.3f}, Std: {np.std(final_coord):.3f}")

            deltas = [f - i for i, f in zip(initial_coord, final_coord)]
            print(f"    Change  - Mean: {np.mean(deltas):.3f}, Std: {np.std(deltas):.3f}")

            # Check for drops >20% (nuclear event threshold)
            severe_drops = sum(1 for d in deltas if d < -0.20)
            print(f"    Severe drops (>20%): {severe_drops}/{len(deltas)} runs")

if __name__ == "__main__":
    main()
