/**
 * Generate Dashboard Snapshot
 *
 * Quick script to generate a single GameState snapshot for dashboard development/testing.
 * Saves to monteCarloOutputs/ as a _historical_events.json with proper snapshots.
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import { createDefaultInitialState } from '../src/simulation/initialization'
import { SimulationEngine } from '../src/simulation/engine'

async function generateSnapshot() {
  console.log('Generating dashboard snapshot...')

  const seed = Date.now()
  const initialState = createDefaultInitialState(seed, 'default')

  // CRITICAL: Deep copy initial state BEFORE simulation mutates it
  // The engine mutates state in place, so we need to preserve a snapshot
  const initialSnapshot = structuredClone(initialState)

  // Run simulation for 60 months to generate some interesting state
  const maxMonths = 60
  console.log(`Running simulation for ${maxMonths} months...`)

  const engine = new SimulationEngine({ seed, maxMonths })
  const result = engine.run(initialState, {
    maxMonths,
    checkActualOutcomes: false
  })

  // Create output structure with snapshots
  const output = {
    run: 99999, // Special run ID for dashboard snapshot
    seed,
    totalMonths: result.finalState.currentMonth,
    outcome: result.summary?.finalOutcome || 'running',
    outcomeReason: result.summary?.finalOutcomeReason || 'Still running',
    scenarioMode: 'default',
    scenarioDescription: 'Dashboard snapshot - 60 month simulation',
    events: [],
    criticalEvents: [],
    paradigmTrajectory: [],
    snapshots: [
      initialSnapshot, // Initial state (preserved copy)
      result.finalState // Final state
    ]
  }

  // Save to monteCarloOutputs
  const filename = `run_99999_historical_events.json`
  const filepath = join(process.cwd(), 'monteCarloOutputs', filename)

  writeFileSync(filepath, JSON.stringify(output, null, 2))

  console.log(`✅ Snapshot saved to ${filename}`)
  console.log(`   Months: ${result.finalState.currentMonth}`)
  console.log(`   Snapshots: ${output.snapshots.length}`)
  console.log(`   AI Agents: ${result.finalState.aiAgents.length}`)
  console.log(`   QoL: ${result.finalState.globalMetrics.qualityOfLife.toFixed(2)}`)
  console.log(`   Paradigm Scores:`)
  console.log(`     Western: ${result.finalState.multiParadigmDUI.paradigmScores.western.value.toFixed(1)}`)
  console.log(`     Development: ${result.finalState.multiParadigmDUI.paradigmScores.development.value.toFixed(1)}`)
  console.log(`     Ecological: ${result.finalState.multiParadigmDUI.paradigmScores.ecological.value.toFixed(1)}`)
}

generateSnapshot().catch(console.error)
