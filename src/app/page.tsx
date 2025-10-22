/**
 * Dashboard Demo Page
 *
 * Showcases the far-future design system with sample simulation data.
 */

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"

export default function HomePage() {
  // Sample data for demonstration
  const sampleSparkline = [45, 52, 48, 58, 62, 55, 60, 58, 65, 70, 68, 72]

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Simulation Dashboard</h1>
        <p style={{ color: 'var(--white-40)' }}>
          AI Alignment → Human Flourishing Research Simulation
        </p>
      </div>

      {/* Status Row */}
      <div className="flex gap-6 mb-8">
        <StatusIndicator status="normal" label="System Normal" />
        <StatusIndicator status="warning" label="Climate Warning" />
        <StatusIndicator status="critical" label="Crisis Active" />
        <StatusIndicator status="extinction" label="Extinction Risk" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Global Population"
          value={7.2}
          unit="B"
          sparkline={sampleSparkline}
          status="normal"
          trend="stable"
        />
        <MetricCard
          label="Quality of Life"
          value={0.68}
          sparkline={sampleSparkline}
          status="warning"
          trend="down"
        />
        <MetricCard
          label="AI Capability"
          value={4.2}
          sparkline={sampleSparkline}
          status="critical"
          trend="up"
        />
        <MetricCard
          label="Alignment Score"
          value={0.34}
          sparkline={sampleSparkline}
          status="critical"
          trend="down"
        />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Panel title="Multi-Paradigm DUI" glow="cyan">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-western-liberal)' }}>
                Western Liberal
              </div>
              <div className="text-3xl font-light">52.3</div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-development)' }}>
                Development
              </div>
              <div className="text-3xl font-light">74.6</div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-ecological)' }}>
                Ecological
              </div>
              <div className="text-3xl font-light text-red-500">12.8</div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-indigenous)' }}>
                Indigenous
              </div>
              <div className="text-3xl font-light">50.0</div>
            </div>
          </div>
        </Panel>

        <Panel title="Active Crises" glow="amber">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Climate Change</span>
              <StatusIndicator status="critical" />
            </div>
            <div className="flex items-center justify-between">
              <span>Biodiversity Loss</span>
              <StatusIndicator status="critical" />
            </div>
            <div className="flex items-center justify-between">
              <span>Ocean Acidification</span>
              <StatusIndicator status="warning" />
            </div>
          </div>
        </Panel>
      </div>

      {/* Full-width Panel */}
      <Panel title="System Status">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Environmental Debt
            </div>
            <div className="text-2xl font-light">High</div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Social Stability
            </div>
            <div className="text-2xl font-light">0.42</div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Tech Risk
            </div>
            <div className="text-2xl font-light">Moderate</div>
          </div>
        </div>
      </Panel>

      {/* Footer Note */}
      <div className="mt-12 text-center" style={{ color: 'var(--white-30)' }}>
        <p className="text-xs">
          Design System: Elysium-inspired • 2100s Far-Future Aesthetic
        </p>
        <p className="text-xs mt-1">
          Reference: /designs/00_design_system.md
        </p>
      </div>
    </main>
  )
}
