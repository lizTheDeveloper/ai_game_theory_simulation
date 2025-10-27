/**
 * Monte Carlo Parameter Sweep Page
 *
 * Main interface for configuring and running Monte Carlo parameter sweeps.
 * Phase 2: Configuration + Progress Tracking
 */

'use client'

import { MonteCarloProvider } from '@/lib/contexts/MonteCarloContext'
import { MonteCarloConfigPanel } from '@/components/monte-carlo/MonteCarloConfigPanel'
import { BatchProgressTracker } from '@/components/monte-carlo/BatchProgressTracker'

function MonteCarloPageContent() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light mb-2">Monte Carlo Parameter Sweep</h1>
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Explore parameter space and analyze sensitivity across multiple simulation runs
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration Panel */}
          <div className="lg:col-span-1">
            <MonteCarloConfigPanel />
          </div>

          {/* Right: Progress and Results */}
          <div className="lg:col-span-2 space-y-6">
            <BatchProgressTracker />

            {/* Placeholder for future phases */}
            <div className="p-8 bg-black/20 border border-white/10 rounded text-center" style={{ color: 'var(--white-40)' }}>
              <p className="text-sm">Results visualization coming in Phase 3</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function MonteCarloPage() {
  return (
    <MonteCarloProvider>
      <MonteCarloPageContent />
    </MonteCarloProvider>
  )
}
