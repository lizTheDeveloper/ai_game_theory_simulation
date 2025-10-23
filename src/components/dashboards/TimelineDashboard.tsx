/**
 * Timeline Dashboard - Phase 9
 *
 * Filterable event log with cause-effect chains and milestones.
 * Reference: /designs/11_timeline.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo, useState } from "react"

export function TimelineDashboard() {
  const { currentState, trajectory, loadCurrent } = useSimulation()
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadCurrent()
  }, [])

  // Extract events from current state and trajectory
  const events = useMemo(() => {
    if (!currentState) return []

    const allEvents: any[] = []

    // Historical events from current state
    if (currentState.eventLog) {
      currentState.eventLog.forEach((event: any) => {
        allEvents.push({
          month: event.month,
          type: event.type,
          category: event.category || 'system',
          description: event.description,
          severity: event.severity || 'normal',
          agent: event.agent || 'system',
        })
      })
    }

    // Extract major events from trajectory
    if (trajectory.length > 0) {
      // Sample: Crisis activations, tech breakthroughs, tipping points
      trajectory.forEach((state, idx) => {
        // Check for ecosystem collapse trigger
        if (state.ecosystemCollapse?.triggered && idx > 0 && !trajectory[idx - 1].ecosystemCollapse?.triggered) {
          allEvents.push({
            month: state.currentMonth,
            type: 'tipping_point',
            category: 'environmental',
            description: 'Ecosystem collapse triggered',
            severity: 'critical',
            agent: 'system',
          })
        }

        // Check for tipping points
        if (state.specificTippingPoints) {
          const tp = state.specificTippingPoints
          if (tp.amazon?.triggered && idx > 0 && !trajectory[idx - 1].specificTippingPoints?.amazon?.triggered) {
            allEvents.push({
              month: state.currentMonth,
              type: 'tipping_point',
              category: 'environmental',
              description: 'Amazon rainforest dieback initiated',
              severity: 'critical',
              agent: 'system',
            })
          }
        }
      })
    }

    // Sort by month
    return allEvents.sort((a, b) => b.month - a.month)
  }, [currentState, trajectory])

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events
    return events.filter(e => e.category === filterType)
  }, [events, filterType])

  // Event categories
  const categories = useMemo(() => {
    const cats = new Set(events.map(e => e.category))
    return Array.from(cats)
  }, [events])

  // Stats
  const stats = useMemo(() => {
    const critical = events.filter(e => e.severity === 'critical').length
    const warning = events.filter(e => e.severity === 'warning').length
    const normal = events.filter(e => e.severity === 'normal').length

    return {
      total: events.length,
      critical,
      warning,
      normal,
    }
  }, [events])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Timeline</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Historical Event Log with Cause-Effect Chains
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Events"
          value={stats.total}
          status="normal"
        />
        <MetricCard
          label="Critical Events"
          value={stats.critical}
          status={stats.critical > 10 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="Warning Events"
          value={stats.warning}
          status="normal"
        />
        <MetricCard
          label="Current Month"
          value={currentState.currentMonth || 0}
          status="normal"
        />
      </div>

      {/* Filter Controls */}
      <Panel title="Event Filters">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'all'
                ? 'glow-cyan'
                : ''
            }`}
            style={{
              backgroundColor: filterType === 'all' ? 'rgba(0, 240, 255, 0.1)' : 'var(--color-near-black)',
              border: '1px solid var(--white-10)',
              color: filterType === 'all' ? 'var(--color-cyan)' : 'var(--white-60)',
            }}
          >
            All ({events.length})
          </button>
          {categories.map(cat => {
            const count = events.filter(e => e.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterType === cat ? 'glow-cyan' : ''
                }`}
                style={{
                  backgroundColor: filterType === cat ? 'rgba(0, 240, 255, 0.1)' : 'var(--color-near-black)',
                  border: '1px solid var(--white-10)',
                  color: filterType === cat ? 'var(--color-cyan)' : 'var(--white-60)',
                }}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </Panel>

      {/* Event Timeline */}
      <Panel title={`Event Log (${filteredEvents.length} events)`}>
        <div className="space-y-2">
          {filteredEvents.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--white-40)' }}>
              No events recorded yet. Events will appear as the simulation progresses.
            </p>
          )}

          {filteredEvents.slice(0, 50).map((event, idx) => (
            <div
              key={`${event.month}-${idx}`}
              className="p-3 rounded flex items-start gap-3"
              style={{
                backgroundColor: 'var(--color-near-black)',
                border: `1px solid ${
                  event.severity === 'critical' ? 'var(--color-red)' :
                  event.severity === 'warning' ? 'var(--color-amber)' :
                  'var(--white-10)'
                }`,
                boxShadow: event.severity === 'critical' ? '0 0 10px rgba(255, 0, 64, 0.2)' : 'none'
              }}
            >
              {/* Month Badge */}
              <div
                className="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  color: 'var(--color-cyan)',
                  minWidth: '80px',
                  textAlign: 'center',
                }}
              >
                Month {event.month}
              </div>

              {/* Event Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{event.description}</span>
                  {event.severity === 'critical' && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(255, 0, 64, 0.1)',
                        color: 'var(--color-red)',
                      }}
                    >
                      CRITICAL
                    </span>
                  )}
                  {event.severity === 'warning' && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(255, 176, 0, 0.1)',
                        color: 'var(--color-amber)',
                      }}
                    >
                      WARNING
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                  <span className="capitalize">{event.category}</span>
                  <span>•</span>
                  <span className="capitalize">{event.type.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span>{event.agent}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length > 50 && (
            <div className="text-xs text-center py-3" style={{ color: 'var(--white-40)' }}>
              Showing 50 of {filteredEvents.length} events
            </div>
          )}
        </div>
      </Panel>

      {/* Key Milestones */}
      <Panel title="Key Milestones">
        <div className="space-y-3 text-sm" style={{ color: 'var(--white-60)' }}>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: 'var(--color-cyan)' }} />
            <div>
              <div className="font-semibold mb-1">Simulation Start</div>
              <div className="text-xs" style={{ color: 'var(--white-40)' }}>
                Month 0 - Initial state: 8B population, basic RLHF deployed, planetary boundaries monitoring begins
              </div>
            </div>
          </div>

          {stats.critical > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: 'var(--color-red)' }} />
              <div>
                <div className="font-semibold mb-1">Critical Events</div>
                <div className="text-xs" style={{ color: 'var(--white-40)' }}>
                  {stats.critical} critical events recorded (tipping points, crises, extinction risks)
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: 'var(--color-green)' }} />
            <div>
              <div className="font-semibold mb-1">Current State</div>
              <div className="text-xs" style={{ color: 'var(--white-40)' }}>
                Month {currentState.currentMonth} - {stats.total} total events recorded
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Timeline Explanation */}
      <Panel title="Timeline Interpretation">
        <div className="space-y-2 text-sm" style={{ color: 'var(--white-60)' }}>
          <p>
            <strong>Event Categories:</strong> System events (automated), agent decisions (AI/government/society),
            environmental changes (planetary boundaries), social dynamics (trust, cohesion), and technological breakthroughs.
          </p>
          <p>
            <strong>Severity Levels:</strong> Normal (routine updates), Warning (potential risks), Critical (immediate threats or major shifts).
          </p>
          <p>
            <strong>Cause-Effect Chains:</strong> Many events trigger cascades. For example, a planetary boundary breach
            may trigger a crisis, which triggers government response, which affects AI development and social trust.
          </p>
        </div>
      </Panel>
    </div>
  )
}
