Solution: The N=100 test must be re-run with current code.

ROOT CAUSE:
- N=100 test (seed 42025-42099) was run with OLD version of monteCarloSimulation.ts
- That version did NOT export paradigmTrajectory (added in commit 325cc5d)
- analyzeMCResults.ts expects paradigmTrajectory field, finds null, reports as 'crashed'

EVIDENCE:
1. Seed 42025 output has keys: [criticalEvents, events, outcome, ...] but NO paradigmTrajectory
2. Current code (line 1099) DOES write paradigmTrajectory to output
3. Git history shows paradigmTrajectory export was added in commit 325cc5d

NOT A BUG - just stale test data from before the feature was added.

ACTION REQUIRED:
Re-run N=100 with: npx tsx scripts/monteCarloSimulation.ts --runs=100 --scenario=historical --threshold-scenario=baseline --max-months=240
