/**
 * Batch Progress Tracker
 *
 * Displays progress of running Monte Carlo batch.
 * Shows overall completion, worker status, and parameter group progress.
 */

'use client'

import { useMonteCarlo } from '@/lib/contexts/MonteCarloContext'
import { Panel } from '@/components/core/Panel'
import { useEffect, useState } from 'react'

export function BatchProgressTracker() {
  const { progress, isRunning, pauseSweep, cancelSweep } = useMonteCarlo()

  // Calculate elapsed and remaining time
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning || !progress) {
      setElapsedSeconds(0)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((progress.currentTime - progress.startTime) / 1000)
      setElapsedSeconds(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, progress])

  if (!progress) {
    return null
  }

  const progressPercent = (progress.progress * 100).toFixed(1)
  const remainingMinutes = progress.estimatedTimeRemaining
    ? Math.ceil(progress.estimatedTimeRemaining / 60000)
    : null

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  const elapsedSecondsDisplay = elapsedSeconds % 60

  return (
    <Panel title="Batch Progress" glow={isRunning ? 'cyan' : 'none'}>
      <div className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--white-60)' }}>
              Overall Progress
            </span>
            <span className="text-lg font-medium">
              {progress.completedRuns}/{progress.totalRuns} ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-black/40 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress.progress * 100}%` }}
            />
          </div>
        </div>

        {/* Worker Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-cyan-500/10 rounded">
            <div className="text-2xl font-light">{progress.runningRuns}</div>
            <div className="text-xs" style={{ color: 'var(--white-40)' }}>Running</div>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded">
            <div className="text-2xl font-light">{progress.queuedRuns}</div>
            <div className="text-xs" style={{ color: 'var(--white-40)' }}>Queued</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded">
            <div className="text-2xl font-light">{progress.failedRuns}</div>
            <div className="text-xs" style={{ color: 'var(--white-40)' }}>Failed</div>
          </div>
        </div>

        {/* Time Stats */}
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--white-60)' }}>
          <div>
            <span style={{ color: 'var(--white-40)' }}>Elapsed: </span>
            {elapsedMinutes}m {elapsedSecondsDisplay}s
          </div>
          {remainingMinutes !== null && (
            <div>
              <span style={{ color: 'var(--white-40)' }}>Remaining: </span>
              ~{remainingMinutes}m
            </div>
          )}
        </div>

        {/* Parameter Groups (if sweep) */}
        {progress.isSweep && progress.sweepGroups && progress.sweepGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm mb-3" style={{ color: 'var(--white-60)' }}>
              Parameter Groups
            </div>
            <div className="space-y-2">
              {progress.sweepGroups.slice(0, 5).map((group, idx) => {
                // Calculate completion for this group
                const groupCompleted = group.simulationIds.filter(id => {
                  // This is a simplified check - in a full implementation,
                  // we'd query the actual status from the manager
                  return true // Placeholder
                }).length

                const groupProgress = (groupCompleted / group.simulationIds.length) * 100

                return (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ color: 'var(--white-60)' }}>
                        {group.parameterName}: {group.parameterValue}
                      </span>
                      <span style={{ color: 'var(--white-40)' }}>
                        {groupCompleted}/{group.simulationIds.length}
                      </span>
                    </div>
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500/50 transition-all duration-500"
                        style={{ width: `${groupProgress}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        {isRunning && (
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <button
              onClick={pauseSweep}
              className="flex-1 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded text-amber-400 text-sm transition-all"
              disabled
            >
              Pause (TODO)
            </button>
            <button
              onClick={cancelSweep}
              className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-400 text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </Panel>
  )
}
