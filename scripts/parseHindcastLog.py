#!/usr/bin/env python3
"""Parse hindcast validation log to extract final metrics."""

import re
import sys
from pathlib import Path

def parse_hindcast_log(log_path):
    """Extract final metrics from each run."""

    results = []
    current_run = None

    with open(log_path, 'r') as f:
        for line in f:
            # Detect run start
            run_match = re.search(r'--- Run (\d+) \(seed: (\d+)\) ---', line)
            if run_match:
                if current_run:
                    results.append(current_run)
                current_run = {
                    'run': int(run_match.group(1)),
                    'seed': int(run_match.group(2)),
                    'temp': None,
                    'pop': None,
                    'bio': None
                }

            # Extract population decline
            pop_match = re.search(r'Population decline: ([0-9.]+)M \(([0-9.]+)%\)', line)
            if pop_match and current_run and current_run['pop'] is None:
                # Calculate final population from decline
                decline_pct = float(pop_match.group(2))
                # Initial pop is 5.32B
                final_pop = 5.32 * (1 - decline_pct / 100)
                current_run['pop'] = final_pop

            # Extract temperature from month 396 (should be near end)
            temp_match = re.search(r'Current Temperature: ([0-9.]+)°C above pre-industrial', line)
            if temp_match and current_run:
                current_run['temp'] = float(temp_match.group(1))

            # Extract biodiversity - look for final value
            # This is trickier - need to find last value for each run

    # Add final run
    if current_run:
        results.append(current_run)

    return results

def calculate_statistics(values):
    """Calculate mean, median, std dev, CV."""
    if not values:
        return None

    import statistics

    mean = statistics.mean(values)
    median = statistics.median(values)
    stdev = statistics.stdev(values) if len(values) > 1 else 0
    cv = (stdev / mean * 100) if mean != 0 else 0

    return {
        'mean': mean,
        'median': median,
        'stdev': stdev,
        'cv': cv,
        'min': min(values),
        'max': max(values)
    }

def main():
    log_path = sys.argv[1] if len(sys.argv) > 1 else 'logs/hindcast/phase11_historical_mode_20251127_133802.log'

    results = parse_hindcast_log(log_path)

    print(f"\n{'='*80}")
    print("HINDCAST VALIDATION RESULTS SUMMARY")
    print(f"{'='*80}\n")

    print(f"Runs processed: {len(results)}\n")

    # Extract metrics
    temps = [r['temp'] for r in results if r['temp'] is not None]
    pops = [r['pop'] for r in results if r['pop'] is not None]

    # Display individual runs
    print("Individual Run Results:")
    print(f"{'Run':<6} {'Seed':<12} {'Temp (°C)':<12} {'Pop (B)':<12}")
    print("-" * 48)
    for r in results:
        temp_str = f"{r['temp']:.2f}" if r['temp'] else "N/A"
        pop_str = f"{r['pop']:.2f}" if r['pop'] else "N/A"
        print(f"{r['run']:<6} {r['seed']:<12} {temp_str:<12} {pop_str:<12}")

    print(f"\n{'='*80}")
    print("AGGREGATE STATISTICS")
    print(f"{'='*80}\n")

    # Temperature statistics
    if temps:
        temp_stats = calculate_statistics(temps)
        print("Temperature Anomaly:")
        print(f"  Mean:   {temp_stats['mean']:.2f}°C")
        print(f"  Median: {temp_stats['median']:.2f}°C")
        print(f"  Std Dev: {temp_stats['stdev']:.3f}°C")
        print(f"  CV:     {temp_stats['cv']:.2f}%")
        print(f"  Range:  {temp_stats['min']:.2f} - {temp_stats['max']:.2f}°C")
        print(f"  Target: 1.28°C ± 10% (1.15 - 1.41°C)")

        # Calculate error
        target = 1.28
        error_pct = abs(temp_stats['mean'] - target) / target * 100
        print(f"  Error:  {error_pct:.1f}%")

    print()

    # Population statistics
    if pops:
        pop_stats = calculate_statistics(pops)
        print("Population:")
        print(f"  Mean:   {pop_stats['mean']:.2f}B")
        print(f"  Median: {pop_stats['median']:.2f}B")
        print(f"  Std Dev: {pop_stats['stdev']:.3f}B")
        print(f"  CV:     {pop_stats['cv']:.2f}%")
        print(f"  Range:  {pop_stats['min']:.2f} - {pop_stats['max']:.2f}B")
        print(f"  Target: 8.12B ± 10% (7.31 - 8.93B)")

        # Calculate error
        target = 8.12
        error_pct = abs(pop_stats['mean'] - target) / target * 100
        print(f"  Error:  {error_pct:.1f}%")

if __name__ == '__main__':
    main()
