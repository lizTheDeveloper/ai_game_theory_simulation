/**
 * Monte Carlo Results API Route
 *
 * Reads Monte Carlo simulation outputs from the monteCarloOutputs directory.
 * Aggregates results across runs for outcome analysis, determinism validation,
 * and statistical summaries.
 */

import { NextResponse } from 'next/server'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

// Get project root
const PROJECT_ROOT = process.cwd()
const MONTE_CARLO_DIR = join(PROJECT_ROOT, 'monteCarloOutputs')

// Types for Monte Carlo data
export interface MonteCarloRunEvents {
  seed: number
  run: number
  scenarioMode?: string
  scenarioDescription?: string
  outcome: string
  outcomeReason: string
  totalMonths: number
  events: {
    summary: {
      period: string
      totalEvents: number
      eventsByType: Record<string, number>
      criticalEvents: Array<{
        month?: number
        severity?: string
        title?: string
        agent?: string
        description?: string
      }>
    }
  }
}

export interface BifurcationMetrics {
  seed: number
  months: number
  outcome: string
  finalPopulation: number
  finalQOL: number
  bifurcations: Record<string, {
    occurred: boolean
    month?: number
    type: string
    threshold: number
  }>
  maxVarianceAmplification: number
  avgDistanceToThresholds: number
  regimeShiftEvents: Array<{
    month: number
    system: string
    amplification: number
  }>
}

export interface AggregatedResults {
  totalRuns: number
  scenarios: Record<string, number>
  outcomeDistribution: Record<string, number>
  runs: Array<{
    seed: number
    scenario: string
    outcome: string
    totalMonths: number
    totalEvents: number
    criticalEventCount: number
    finalPopulation?: number
    finalQOL?: number
    bifurcationsOccurred?: number
    regimeShifts?: number
  }>
  statistics: {
    avgDuration: number
    minDuration: number
    maxDuration: number
    stdDevDuration: number
    avgEvents: number
    avgCriticalEvents: number
    medianDuration: number
  }
  determinismCheck: {
    seedGroups: Record<string, {
      count: number
      outcomes: string[]
      isDeterministic: boolean
      coefficientOfVariation?: number
    }>
    overallDeterministic: boolean
    determinismFailures: string[]
  }
  eventTypeAggregates: Record<string, number>
  criticalEventSummary: Array<{
    title: string
    count: number
    avgMonth: number
    seeds: number[]
  }>
}

// Parse run filename to extract seed and scenario
function parseRunFilename(filename: string): { seed: number; scenario: string; type: string } | null {
  // Pattern: run_{seed}_{scenario}_events.json or bifurcation_metrics_seed{seed}.json
  const eventsMatch = filename.match(/^run_(\d+)_(.+)_events\.json$/)
  if (eventsMatch) {
    return {
      seed: parseInt(eventsMatch[1]),
      scenario: eventsMatch[2],
      type: 'events'
    }
  }

  const bifurcationMatch = filename.match(/^bifurcation_metrics_seed(\d+)\.json$/)
  if (bifurcationMatch) {
    return {
      seed: parseInt(bifurcationMatch[1]),
      scenario: 'unknown',
      type: 'bifurcation'
    }
  }

  return null
}

// Calculate standard deviation
function stdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

// Calculate coefficient of variation
function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  if (avg === 0) return 0
  return (stdDev(values) / avg) * 100
}

// Calculate median
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export async function GET() {
  try {
    // Check if directory exists
    let files: string[]
    try {
      files = await readdir(MONTE_CARLO_DIR)
    } catch {
      return NextResponse.json({
        error: 'Monte Carlo output directory not found',
        message: 'No simulation results available. Run Monte Carlo simulations first.',
        directory: MONTE_CARLO_DIR
      }, { status: 404 })
    }

    // Filter for JSON files
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    if (jsonFiles.length === 0) {
      return NextResponse.json({
        error: 'No Monte Carlo results found',
        message: 'The monteCarloOutputs directory exists but contains no JSON files.',
        directory: MONTE_CARLO_DIR
      }, { status: 404 })
    }

    // Aggregate data
    const eventRuns: MonteCarloRunEvents[] = []
    const bifurcationData: Map<number, BifurcationMetrics> = new Map()
    const scenarios: Record<string, number> = {}
    const outcomeDistribution: Record<string, number> = {}
    const eventTypeAggregates: Record<string, number> = {}
    const criticalEventMap: Map<string, { count: number; months: number[]; seeds: number[] }> = new Map()

    // Read all files
    for (const filename of jsonFiles) {
      const parsed = parseRunFilename(filename)
      if (!parsed) continue // Skip unrecognized files

      const filePath = join(MONTE_CARLO_DIR, filename)

      try {
        const content = await readFile(filePath, 'utf-8')
        const data = JSON.parse(content)

        if (parsed.type === 'events') {
          eventRuns.push(data)

          // Track scenarios
          const scenario = data.scenarioMode || parsed.scenario
          scenarios[scenario] = (scenarios[scenario] || 0) + 1

          // Track outcomes
          const outcome = (data.outcome || 'unknown').toLowerCase()
          outcomeDistribution[outcome] = (outcomeDistribution[outcome] || 0) + 1

          // Aggregate event types
          if (data.events?.summary?.eventsByType) {
            for (const [type, count] of Object.entries(data.events.summary.eventsByType)) {
              eventTypeAggregates[type] = (eventTypeAggregates[type] || 0) + (count as number)
            }
          }

          // Track critical events
          if (data.events?.summary?.criticalEvents) {
            for (const event of data.events.summary.criticalEvents) {
              if (event.title) {
                const existing = criticalEventMap.get(event.title)
                if (existing) {
                  existing.count++
                  if (event.month !== undefined) existing.months.push(event.month)
                  if (!existing.seeds.includes(data.seed)) existing.seeds.push(data.seed)
                } else {
                  criticalEventMap.set(event.title, {
                    count: 1,
                    months: event.month !== undefined ? [event.month] : [],
                    seeds: [data.seed]
                  })
                }
              }
            }
          }
        } else if (parsed.type === 'bifurcation') {
          bifurcationData.set(data.seed, data)
        }
      } catch (err) {
        console.warn(`Failed to parse ${filename}:`, err)
      }
    }

    // Build run summary list
    const runs = eventRuns.map(run => {
      const bifurcation = bifurcationData.get(run.seed)
      return {
        seed: run.seed,
        scenario: run.scenarioMode || 'unknown',
        outcome: run.outcome,
        totalMonths: run.totalMonths,
        totalEvents: run.events?.summary?.totalEvents || 0,
        criticalEventCount: run.events?.summary?.criticalEvents?.length || 0,
        finalPopulation: bifurcation?.finalPopulation,
        finalQOL: bifurcation?.finalQOL,
        bifurcationsOccurred: bifurcation ?
          Object.values(bifurcation.bifurcations).filter(b => b.occurred).length : undefined,
        regimeShifts: bifurcation?.regimeShiftEvents?.length
      }
    })

    // Calculate statistics
    const durations = runs.map(r => r.totalMonths)
    const eventCounts = runs.map(r => r.totalEvents)
    const criticalCounts = runs.map(r => r.criticalEventCount)

    const statistics = {
      avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: Math.min(...durations, Infinity),
      maxDuration: Math.max(...durations, 0),
      stdDevDuration: stdDev(durations),
      avgEvents: eventCounts.length > 0 ? eventCounts.reduce((a, b) => a + b, 0) / eventCounts.length : 0,
      avgCriticalEvents: criticalCounts.length > 0 ? criticalCounts.reduce((a, b) => a + b, 0) / criticalCounts.length : 0,
      medianDuration: median(durations)
    }

    // Determinism check - group by seed and check for consistent outcomes
    const seedGroups: Record<string, { count: number; outcomes: string[]; durations: number[] }> = {}
    for (const run of runs) {
      const key = String(run.seed)
      if (!seedGroups[key]) {
        seedGroups[key] = { count: 0, outcomes: [], durations: [] }
      }
      seedGroups[key].count++
      seedGroups[key].outcomes.push(run.outcome)
      seedGroups[key].durations.push(run.totalMonths)
    }

    const determinismCheck: AggregatedResults['determinismCheck'] = {
      seedGroups: {},
      overallDeterministic: true,
      determinismFailures: []
    }

    for (const [seed, group] of Object.entries(seedGroups)) {
      const uniqueOutcomes = [...new Set(group.outcomes)]
      const isDeterministic = uniqueOutcomes.length === 1
      const cv = coefficientOfVariation(group.durations)

      determinismCheck.seedGroups[seed] = {
        count: group.count,
        outcomes: uniqueOutcomes,
        isDeterministic,
        coefficientOfVariation: cv
      }

      if (!isDeterministic) {
        determinismCheck.overallDeterministic = false
        determinismCheck.determinismFailures.push(
          `Seed ${seed}: outcomes vary (${uniqueOutcomes.join(', ')})`
        )
      }

      // CV > 0.01% indicates non-determinism
      if (cv > 0.01 && group.count > 1) {
        determinismCheck.overallDeterministic = false
        if (!determinismCheck.determinismFailures.some(f => f.includes(`Seed ${seed}`))) {
          determinismCheck.determinismFailures.push(
            `Seed ${seed}: duration CV ${cv.toFixed(4)}% exceeds threshold`
          )
        }
      }
    }

    // Format critical events summary (top 20 by frequency)
    const criticalEventSummary = Array.from(criticalEventMap.entries())
      .map(([title, data]) => ({
        title,
        count: data.count,
        avgMonth: data.months.length > 0
          ? data.months.reduce((a, b) => a + b, 0) / data.months.length
          : 0,
        seeds: data.seeds
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    const result: AggregatedResults = {
      totalRuns: eventRuns.length,
      scenarios,
      outcomeDistribution,
      runs,
      statistics,
      determinismCheck,
      eventTypeAggregates,
      criticalEventSummary
    }

    return NextResponse.json({
      data: result,
      filesProcessed: jsonFiles.length,
      directory: MONTE_CARLO_DIR
    })

  } catch (error) {
    console.error('Error reading Monte Carlo results:', error)
    return NextResponse.json({
      error: 'Failed to read Monte Carlo results',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
