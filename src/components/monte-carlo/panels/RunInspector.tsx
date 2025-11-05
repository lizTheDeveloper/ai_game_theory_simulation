/**
 * Run Inspector
 *
 * Deep dive into individual simulation runs.
 * Shows complete event timeline, state evolution, and outcome reasoning.
 */

'use client'

import { Panel } from '@/components/core/Panel'
import { useState } from 'react'

interface RunData {
  seed: number
  run: number
  outcome: string
  outcomeReason: string
  totalMonths: number
  events: {
    summary: {
      period: string
      totalEvents: number
      eventsByType: Record<string, number>
      criticalEvents: Array<{
        id?: string
        month?: number
        severity?: string
        title?: string
        agent?: string
        description?: string
        effects?: Record<string, any>
      }>
    }
  }
}

interface RunInspectorProps {
  runResults: Map<string, RunData>
  selectedRunId: string | null
  onSelectRun: (runId: string) => void
}

export function RunInspector({ runResults, selectedRunId, onSelectRun }: RunInspectorProps) {
  const [eventFilter, setEventFilter] = useState<'all' | 'critical'>('critical')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  // Get sorted run list
  const runList = Array.from(runResults.entries()).sort((a, b) => {
    const seedA = parseInt(a[0].match(/\d+/)?.[0] || '0')
    const seedB = parseInt(b[0].match(/\d+/)?.[0] || '0')
    return seedA - seedB
  })

  const selectedRun = selectedRunId ? runResults.get(selectedRunId) : null

  // Get outcome color
  const getOutcomeColor = (outcome: string) => {
    const colors: Record<string, { color: string; glow: string }> = {
      utopia: { color: '#00FF88', glow: 'rgba(0, 255, 136, 0.6)' },
      postscarcity: { color: '#00CCFF', glow: 'rgba(0, 204, 255, 0.6)' },
      sustainable: { color: '#00AAAA', glow: 'rgba(0, 170, 170, 0.6)' },
      bottleneck: { color: '#FFAA00', glow: 'rgba(255, 170, 0, 0.6)' },
      collapse: { color: '#FF6600', glow: 'rgba(255, 102, 0, 0.6)' },
      extinction: { color: '#FF0040', glow: 'rgba(255, 0, 64, 0.6)' },
      terminal: { color: '#AA00FF', glow: 'rgba(170, 0, 255, 0.6)' }
    }
    return colors[outcome.toLowerCase()] || { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.6)' }
  }

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Run Selector */}
      <div className="col-span-1">
        <Panel title="Simulation Runs" glow="cyan">
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {runList.map(([runId, run]) => {
              const colors = getOutcomeColor(run.outcome)
              const isSelected = runId === selectedRunId

              return (
                <button
                  key={runId}
                  onClick={() => onSelectRun(runId)}
                  className={`w-full p-3 text-left bg-black border rounded transition-all duration-300 ${
                    isSelected
                      ? 'scale-105 shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                      : 'hover:scale-102 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                  }`}
                  style={{
                    borderColor: isSelected ? '#00F0FF' : `${colors.color}40`
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-white/80">
                      Seed {run.seed}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${colors.color}20`,
                        color: colors.color,
                        border: `1px solid ${colors.color}60`
                      }}
                    >
                      {run.outcome}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 space-y-1">
                    <div>Duration: {run.totalMonths} months</div>
                    <div>Events: {run.events.summary.totalEvents}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>
      </div>

      {/* Run Details */}
      <div className="col-span-2">
        {selectedRun ? (
          <Panel
            title={`Run ${selectedRun.seed} Analysis`}
            glow={getOutcomeColor(selectedRun.outcome).color === '#00FF88' ? 'cyan' : 'amber'}
          >
            <div className="space-y-6">
              {/* Outcome Summary */}
              <div className="p-4 bg-white/5 rounded border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Final Outcome</div>
                    <div
                      className="text-2xl font-light"
                      style={{ color: getOutcomeColor(selectedRun.outcome).color }}
                    >
                      {selectedRun.outcome.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Duration</div>
                    <div className="text-2xl font-light text-white/80">
                      {selectedRun.totalMonths} months
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-white/40 mb-1">Outcome Reason</div>
                  <p className="text-sm text-white/60">{selectedRun.outcomeReason}</p>
                </div>
              </div>

              {/* Event Statistics */}
              <div>
                <div className="text-sm text-white/80 mb-3">Event Breakdown</div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedRun.events.summary.eventsByType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 9)
                    .map(([type, count]) => (
                      <div
                        key={type}
                        className="p-2 bg-white/5 rounded border border-white/10 text-center"
                      >
                        <div className="text-lg font-light text-white/80">{count}</div>
                        <div className="text-xs text-white/40">{type}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Event Timeline */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-white/80">Critical Events Timeline</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEventFilter('critical')}
                      className={`px-2 py-1 text-xs rounded ${
                        eventFilter === 'critical'
                          ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-400'
                          : 'bg-white/5 border border-white/20 text-white/60'
                      }`}
                    >
                      Critical Only
                    </button>
                    <button
                      onClick={() => setEventFilter('all')}
                      className={`px-2 py-1 text-xs rounded ${
                        eventFilter === 'all'
                          ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-400'
                          : 'bg-white/5 border border-white/20 text-white/60'
                      }`}
                    >
                      All Events
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {selectedRun.events.summary.criticalEvents
                    .filter(event => eventFilter === 'all' || event.severity === 'destructive' || event.severity === 'high')
                    .map((event, index) => {
                      const eventId = `${selectedRun.seed}-${index}`
                      const isExpanded = expandedEvents.has(eventId)

                      return (
                        <div
                          key={eventId}
                          className="p-3 bg-black border border-white/20 rounded transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleEventExpansion(eventId)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {event.month !== undefined && (
                                    <span className="text-xs text-white/40">
                                      Month {event.month}
                                    </span>
                                  )}
                                  {event.severity && (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded ${
                                        event.severity === 'destructive'
                                          ? 'bg-red-500/20 text-red-400'
                                          : event.severity === 'high'
                                          ? 'bg-orange-500/20 text-orange-400'
                                          : 'bg-amber-500/20 text-amber-400'
                                      }`}
                                    >
                                      {event.severity}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-white/80 mt-1">
                                  {event.title || 'Unknown Event'}
                                </div>
                              </div>
                              <div className="text-white/40">
                                {isExpanded ? '−' : '+'}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                              {event.agent && (
                                <div className="text-xs">
                                  <span className="text-white/40">Agent: </span>
                                  <span className="text-white/60">{event.agent}</span>
                                </div>
                              )}
                              {event.description && (
                                <p className="text-xs text-white/40">{event.description}</p>
                              )}
                              {event.effects && Object.keys(event.effects).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(event.effects).map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="px-2 py-0.5 text-xs bg-white/10 rounded"
                                    >
                                      {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Select a Run" glow="cyan">
            <div className="flex items-center justify-center h-96 text-white/40">
              Select a simulation run from the list to inspect its details
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}