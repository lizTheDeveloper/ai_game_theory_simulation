/**
 * API Route: Get Current Simulation State
 *
 * Returns the most recent GameState from simulation outputs.
 */

import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const outputDir = join(process.cwd(), 'monteCarloOutputs')

    // Get all JSON files
    const files = await readdir(outputDir)
    const jsonFiles = files
      .filter(f => f.endsWith('_historical_events.json'))
      .sort()
      .reverse() // Most recent first

    if (jsonFiles.length === 0) {
      return NextResponse.json(
        { error: 'No simulation outputs found' },
        { status: 404 }
      )
    }

    // Read the most recent file
    const filePath = join(outputDir, jsonFiles[0])
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    return NextResponse.json({
      file: jsonFiles[0],
      data
    })
  } catch (error) {
    console.error('Error reading simulation state:', error)
    return NextResponse.json(
      { error: 'Failed to read simulation state' },
      { status: 500 }
    )
  }
}
