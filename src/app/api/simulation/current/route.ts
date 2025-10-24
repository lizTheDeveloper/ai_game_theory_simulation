/**
 * API Route: Get Current Simulation State
 *
 * NOTE: This endpoint is deprecated. The simulation runs client-side in a Web Worker.
 * Click "Configure & Start" in the navigation to initialize the simulation.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  // Return empty state so dashboards don't error on load
  // The real simulation runs in the Web Worker after clicking "Configure & Start"
  return NextResponse.json({
    message: 'No simulation running. Click "Configure & Start" to begin.',
    data: {
      currentMonth: 0,
      aiAgents: [],
      // Minimal stub state so dashboards render without errors
    }
  })
}
