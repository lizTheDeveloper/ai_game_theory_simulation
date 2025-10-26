/**
 * Timeline Dashboard - Phase 9
 *
 * Recent event log with filtering and severity tracking.
 * Shows last 100 events from live simulation updates.
 * Reference: /designs/11_timeline.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"
import { eventDatabase } from "@/lib/eventDatabase"
import { useEffect, useMemo, useState, useRef } from "react"

interface TimelineEvent {
  month: number
  type: string
  category: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  agent: string
}

export function TimelineDashboard() {
  const { lastUpdate, initialized, startDate, seed, scenario } = useSimulationWorker()
  const [filterType, setFilterType] = useState<string>('all')
  const [eventHistory, setEventHistory] = useState<TimelineEvent[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Generate unique simulation ID
  const simulationId = `${seed}_${scenario}`

  // Store events in IndexedDB as they arrive
  useEffect(() => {
    if (!lastUpdate?.events || lastUpdate.events.length === 0) return

    const storeEvents = async () => {
      const eventsToStore = lastUpdate.events.map(e => ({
        id: `${simulationId}_${e.type}_${e.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: e.timestamp ?? lastUpdate.currentMonth ?? 0,
        type: e.type,
        category: e.category || 'system',
        description: e.description,
        severity: e.severity || 'low',
      }))

      try {
        await eventDatabase.addEvents(simulationId, eventsToStore)

        // Update total count
        const count = await eventDatabase.getEventCount(simulationId)
        setTotalEvents(count)

        // Reload events to show updates
        loadInitialEvents()
      } catch (error) {
        console.error('[Timeline] Error storing events:', error)
      }
    }

    storeEvents()
  }, [lastUpdate, simulationId])

  // Load initial events on mount or when simulation ID changes
  const loadInitialEvents = async () => {
    try {
      const events = await eventDatabase.getEvents(simulationId, 50)
      setEventHistory(events.map(e => ({
        month: e.timestamp,
        type: e.type,
        category: e.category,
        description: e.description,
        severity: e.severity,
        agent: 'system',
      })))
      setHasMore(events.length === 50)
    } catch (error) {
      console.error('[Timeline] Error loading events:', error)
    }
  }

  useEffect(() => {
    if (initialized) {
      loadInitialEvents()
    }
  }, [initialized, simulationId])

  // Load more events when scrolling (infinite scroll)
  const loadMoreEvents = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    try {
      const oldestTimestamp = eventHistory.length > 0
        ? Math.min(...eventHistory.map(e => e.month))
        : undefined

      const moreEvents = await eventDatabase.getEvents(simulationId, 50, oldestTimestamp)

      if (moreEvents.length === 0) {
        setHasMore(false)
      } else {
        setEventHistory(prev => [
          ...prev,
          ...moreEvents.map(e => ({
            month: e.timestamp,
            type: e.type,
            category: e.category,
            description: e.description,
            severity: e.severity,
            agent: 'system',
          }))
        ])
        setHasMore(moreEvents.length === 50)
      }
    } catch (error) {
      console.error('[Timeline] Error loading more events:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Detect scroll to bottom
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && hasMore && !loadingMore) {
        loadMoreEvents()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, eventHistory])

  // Use accumulated event history
  const events = eventHistory

  // Helper function to convert month offset to calendar date
  // Uses the simulation's startDate to calculate real calendar dates
  const formatMonthYear = (monthOffset: number): string => {
    if (!startDate) {
      return `Month ${monthOffset}`;
    }

    // Calculate the date by adding monthOffset months to startDate
    const targetDate = new Date(startDate);
    targetDate.setMonth(targetDate.getMonth() + monthOffset);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }

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
    const high = events.filter(e => e.severity === 'high').length
    const medium = events.filter(e => e.severity === 'medium').length
    const low = events.filter(e => e.severity === 'low').length

    return {
      total: events.length,
      critical,
      high,
      medium,
      low,
    }
  }, [events])

  if (!initialized) {
    return (
      <div className="p-8">
        <Panel title="Not Initialized">
          Click "Configure & Start" to initialize the simulation
        </Panel>
      </div>
    )
  }

  if (!lastUpdate) {
    return <div className="p-8">Waiting for simulation update...</div>
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
          status={stats.critical > 5 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="High Severity"
          value={stats.high}
          status={stats.high > 10 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Current Date"
          value={formatMonthYear(lastUpdate.currentMonth || 0)}
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
      <Panel title={`Event Log (${filteredEvents.length} loaded, ${totalEvents} total)`}>
        <div
          ref={scrollContainerRef}
          className="space-y-2"
          style={{
            maxHeight: '600px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}
        >
          {filteredEvents.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--white-40)' }}>
              No events recorded yet. Events will appear as the simulation progresses.
            </p>
          )}

          {filteredEvents.map((event, idx) => (
            <div
              key={`${event.month}-${idx}`}
              className="p-3 rounded flex items-start gap-3"
              style={{
                backgroundColor: 'var(--color-near-black)',
                border: `1px solid ${
                  event.severity === 'critical' ? 'var(--color-red)' :
                  event.severity === 'high' ? 'var(--color-amber)' :
                  event.severity === 'medium' ? 'var(--white-20)' :
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
                  minWidth: '120px',
                  textAlign: 'center',
                }}
              >
                {formatMonthYear(event.month)}
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
                  {event.severity === 'high' && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(255, 176, 0, 0.1)',
                        color: 'var(--color-amber)',
                      }}
                    >
                      HIGH
                    </span>
                  )}
                  {event.severity === 'medium' && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        color: 'var(--color-cyan)',
                      }}
                    >
                      MEDIUM
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

          {/* Loading indicator */}
          {loadingMore && (
            <div className="text-xs text-center py-4" style={{ color: 'var(--color-cyan)' }}>
              Loading more events...
            </div>
          )}

          {/* End of timeline indicator */}
          {!hasMore && filteredEvents.length > 0 && (
            <div className="text-xs text-center py-4" style={{ color: 'var(--white-40)' }}>
              ⦿ Beginning of simulation (Month 0)
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
                {formatMonthYear(0)} - Initial state: 8B population, basic RLHF deployed, planetary boundaries monitoring begins
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
                {formatMonthYear(lastUpdate.currentMonth || 0)} - {stats.total} recent events tracked
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
            environmental changes (planetary boundaries), social dynamics (trust, cohesion), technological breakthroughs,
            and governance updates.
          </p>
          <p>
            <strong>Severity Levels:</strong> Low (routine updates), Medium (notable changes), High (potential risks),
            Critical (immediate threats or major shifts).
          </p>
          <p>
            <strong>Recent Events:</strong> This dashboard shows the last 100 events from the live simulation.
            Events accumulate as the simulation progresses. Filter by category to focus on specific types of changes.
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
