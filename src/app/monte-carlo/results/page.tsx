/**
 * Monte Carlo Results Viewer Page
 *
 * Real-time visualization of Monte Carlo simulation results.
 * Displays outcomes, timelines, events, and parameter sweep comparisons.
 */

import { MonteCarloResultsViewer } from '@/components/monte-carlo/MonteCarloResultsViewer'

export default function MonteCarloResultsPage() {
  return (
    <div className="min-h-screen bg-black">
      <MonteCarloResultsViewer />
    </div>
  )
}

export const metadata = {
  title: 'Monte Carlo Results Viewer | Superalignment to Utopia',
  description: 'Real-time visualization and analysis of Monte Carlo simulation results'
}