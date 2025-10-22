/**
 * API Route: Get Monte Carlo Results
 *
 * Returns aggregated statistics from Monte Carlo runs.
 */

import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const outputDir = join(process.cwd(), 'monteCarloOutputs')

    // Get all JSON files
    const files = await readdir(outputDir)
    const jsonFiles = files
      .filter(f => f.match(/run_\d+_.*\.json$/))
      .sort()
      .slice(offset, offset + limit)

    // Read all runs
    const runs = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFile(join(outputDir, file), 'utf-8')
        const data = JSON.parse(content)
        return {
          file,
          seed: data.seed,
          outcome: data.outcome,
          totalMonths: data.totalMonths,
          scenarioMode: data.scenarioMode
        }
      })
    )

    // Calculate statistics
    const outcomeDistribution = runs.reduce((acc, run) => {
      acc[run.outcome] = (acc[run.outcome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      total: runs.length,
      runs,
      statistics: {
        outcomeDistribution,
        avgMonths: runs.reduce((sum, r) => sum + r.totalMonths, 0) / runs.length
      }
    })
  } catch (error) {
    console.error('Error reading Monte Carlo results:', error)
    return NextResponse.json(
      { error: 'Failed to read Monte Carlo results' },
      { status: 500 }
    )
  }
}
