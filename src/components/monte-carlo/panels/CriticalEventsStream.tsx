/**
 * Critical Events Stream
 *
 * Real-time feed of critical events across all simulation runs.
 * Shows events as they occur with severity-based visual encoding.
 */

'use client'

import { Panel } from '@/components/core/Panel'
import { useEffect, useState, useRef } from 'react'

interface Event {
  id?: string
  month?: number
  severity?: string
  title?: string
  agent?: string
  description?: string
  effects?: Record<string, any>
}

interface CriticalEventsStreamProps {
  events: Array<{
    runId: string
    month: number
    event: Event
  }>
  isLive?: boolean
}

// Severity color mapping
const SEVERITY_COLORS = {
  destructive: {
    color: '#FF0040',
    glow: 'rgba(255, 0, 64, 0.6)',
    pulse: true
  },
  high: {
    color: '#FF6600',
    glow: 'rgba(255, 102, 0, 0.6)',
    pulse: false
  },
  medium: {
    color: '#FFAA00',
    glow: 'rgba(255, 170, 0, 0.6)',
    pulse: false
  },
  low: {
    color: '#00AAAA',
    glow: 'rgba(0, 170, 170, 0.6)',
    pulse: false
  }
}

export function CriticalEventsStream({ events, isLive = false }: CriticalEventsStreamProps) {
  const [filteredEvents, setFilteredEvents] = useState(events)
  const [severityFilter, setSeverityFilter] = useState<string | 'all'>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filter events by severity
  useEffect(() => {
    if (severityFilter === 'all') {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(e => e.event.severity === severityFilter))
    }
  }, [events, severityFilter])

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredEvents, autoScroll])

  // Get emoji from event title (if present)
  const extractEmoji = (title: string) => {
    const emojiMatch = title?.match(/^[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)
    return emojiMatch ? emojiMatch[0] : null
  }

  // Format event time
  const formatTime = (runId: string, month: number) => {
    const runMatch = runId.match(/run_?(\d+)/)
    const runNum = runMatch ? runMatch[1] : '?'
    return `Run ${runNum} • Month ${month}`
  }

  return (
    <Panel
      title={
        <div className="flex items-center justify-between">
          <span>Critical Events Stream</span>
          {isLive && (
            <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-400/60 rounded text-green-400">
              LIVE
            </span>
          )}
        </div>
      }
      glow={isLive ? 'green' : 'cyan'}
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 pb-4 border-b border-white/10">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
              severityFilter === 'all'
                ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-400'
                : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setSeverityFilter('destructive')}
            className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
              severityFilter === 'destructive'
                ? 'bg-red-500/20 border border-red-400/60 text-red-400'
                : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
            }`}
          >
            Destructive
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
              severityFilter === 'high'
                ? 'bg-orange-500/20 border border-orange-400/60 text-orange-400'
                : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
            }`}
          >
            High
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-white/20"
              />
              Auto-scroll
            </label>
          </div>
        </div>

        {/* Event Stream */}
        <div
          ref={scrollRef}
          className="h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-track-black scrollbar-thumb-white/20"
        >
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No events match the selected filter
            </div>
          ) : (
            filteredEvents.map((item, index) => {
              const severity = item.event.severity || 'low'
              const colors = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low
              const emoji = extractEmoji(item.event.title || '')

              return (
                <div
                  key={`${item.runId}-${item.month}-${index}`}
                  className={`p-3 bg-black border rounded transition-all duration-300 hover:scale-[1.02] ${
                    colors.pulse ? 'animate-pulse' : ''
                  }`}
                  style={{
                    borderColor: `${colors.color}60`,
                    boxShadow: `0 0 10px ${colors.glow}`
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Emoji Icon */}
                    {emoji && (
                      <div
                        className="text-2xl flex-shrink-0"
                        style={{
                          filter: `drop-shadow(0 0 8px ${colors.glow})`
                        }}
                      >
                        {emoji}
                      </div>
                    )}

                    {/* Event Content */}
                    <div className="flex-1 space-y-1">
                      {/* Title and Time */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="font-medium text-sm"
                          style={{ color: colors.color }}
                        >
                          {item.event.title?.replace(/^[^\w\s]+\s*/, '') || 'Unknown Event'}
                        </div>
                        <div className="text-xs text-white/40 flex-shrink-0">
                          {formatTime(item.runId, item.month)}
                        </div>
                      </div>

                      {/* Agent */}
                      {item.event.agent && (
                        <div className="text-xs text-white/60">
                          Agent: {item.event.agent}
                        </div>
                      )}

                      {/* Description */}
                      {item.event.description && (
                        <p className="text-xs text-white/40 mt-1">
                          {item.event.description}
                        </p>
                      )}

                      {/* Effects */}
                      {item.event.effects && Object.keys(item.event.effects).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.event.effects).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 text-xs bg-white/10 rounded"
                              style={{
                                borderLeft: `2px solid ${colors.color}`
                              }}
                            >
                              {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Live indicator at bottom */}
          {isLive && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/40">Streaming live events...</span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-white/40">Total Events:</span>
            <div className="text-lg font-light text-white/80">{events.length}</div>
          </div>
          <div>
            <span className="text-white/40">Unique Runs:</span>
            <div className="text-lg font-light text-white/80">
              {new Set(events.map(e => e.runId)).size}
            </div>
          </div>
          <div>
            <span className="text-white/40">Avg Month:</span>
            <div className="text-lg font-light text-white/80">
              {events.length > 0
                ? Math.round(events.reduce((sum, e) => sum + e.month, 0) / events.length)
                : 0}
            </div>
          </div>
          <div>
            <span className="text-white/40">Destructive:</span>
            <div className="text-lg font-light text-red-400">
              {events.filter(e => e.event.severity === 'destructive').length}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}