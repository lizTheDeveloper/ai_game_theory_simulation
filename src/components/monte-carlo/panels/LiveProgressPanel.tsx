/**
 * Live Progress Panel
 *
 * Real-time visualization of Monte Carlo batch progress as simulations run.
 * Shows completion status, ETA, queue status, and per-worker activity.
 */

'use client'

import { type MonteCarloBatchProgress } from '@/lib/MonteCarloManager'
import { Panel } from '@/components/core/Panel'
import { useEffect, useState } from 'react'

interface LiveProgressPanelProps {
  progress: MonteCarloBatchProgress
  onCancel?: () => void
}

export function LiveProgressPanel({ progress, onCancel }: LiveProgressPanelProps) {
  const [pulseActive, setPulseActive] = useState(false)

  // Pulse animation when running
  useEffect(() => {
    if (progress.runningRuns > 0) {
      const interval = setInterval(() => {
        setPulseActive(prev => !prev)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [progress.runningRuns])

  // Calculate ETA
  const getETA = () => {
    if (!progress.estimatedTimeRemaining) return 'Calculating...'

    const seconds = Math.floor(progress.estimatedTimeRemaining / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Calculate run rate
  const getRunRate = () => {
    const elapsed = progress.currentTime - progress.startTime
    if (elapsed <= 0) return 0

    const runsPerMs = progress.completedRuns / elapsed
    return (runsPerMs * 1000 * 60).toFixed(1) // Runs per minute
  }

  const progressPercentage = progress.progress * 100

  return (
    <Panel
      title="Monte Carlo Batch Progress"
      glow={progress.runningRuns > 0 ? 'cyan' : 'green'}
    >
      <div className="space-y-6">
        {/* Main Progress Bar */}
        <div className="relative">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>Progress: {progressPercentage.toFixed(1)}%</span>
            <span>{progress.completedRuns} / {progress.totalRuns} runs</span>
          </div>

          <div className="h-8 bg-black border border-white/20 rounded overflow-hidden">
            <div
              className={`h-full relative transition-all duration-500 ${
                progress.runningRuns > 0
                  ? 'bg-cyan-500/30 shadow-[inset_0_0_20px_rgba(0,240,255,0.5)]'
                  : 'bg-green-500/30 shadow-[inset_0_0_20px_rgba(0,255,136,0.5)]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Animated glow pulse */}
              {progress.runningRuns > 0 && (
                <div
                  className={`absolute inset-0 bg-cyan-400/20 transition-opacity duration-2000 ${
                    pulseActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-5 gap-4">
          {/* Running */}
          <div className="text-center p-3 bg-cyan-500/10 border border-cyan-400/30 rounded">
            <div className="text-2xl font-light text-cyan-400">
              {progress.runningRuns}
            </div>
            <div className="text-xs text-white/40 mt-1">Running</div>
            {progress.runningRuns > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-cyan-400/20 rounded overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Queued */}
          <div className="text-center p-3 bg-amber-500/10 border border-amber-400/30 rounded">
            <div className="text-2xl font-light text-amber-400">
              {progress.queuedRuns}
            </div>
            <div className="text-xs text-white/40 mt-1">Queued</div>
          </div>

          {/* Completed */}
          <div className="text-center p-3 bg-green-500/10 border border-green-400/30 rounded">
            <div className="text-2xl font-light text-green-400">
              {progress.completedRuns}
            </div>
            <div className="text-xs text-white/40 mt-1">Completed</div>
          </div>

          {/* Failed */}
          <div className="text-center p-3 bg-red-500/10 border border-red-400/30 rounded">
            <div className="text-2xl font-light text-red-400">
              {progress.failedRuns}
            </div>
            <div className="text-xs text-white/40 mt-1">Failed</div>
          </div>

          {/* ETA */}
          <div className="text-center p-3 bg-purple-500/10 border border-purple-400/30 rounded">
            <div className="text-xl font-light text-purple-400">
              {getETA()}
            </div>
            <div className="text-xs text-white/40 mt-1">ETA</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="text-sm">
            <span className="text-white/40">Run Rate: </span>
            <span className="text-white/80">{getRunRate()} runs/min</span>
          </div>

          <div className="text-sm">
            <span className="text-white/40">Workers: </span>
            <span className="text-white/80">
              {progress.activeSimulations || 0} active / {progress.queuedSimulations || 0} queued
            </span>
          </div>

          {onCancel && progress.runningRuns > 0 && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-xs bg-red-500/20 border border-red-400/60 rounded
                         text-red-400 hover:bg-red-500/30 transition-all duration-300"
            >
              Cancel Batch
            </button>
          )}
        </div>

        {/* Sweep Groups (if parameter sweep) */}
        {progress.isSweep && progress.sweepGroups && (
          <div className="pt-4 border-t border-white/10">
            <div className="text-xs text-white/40 mb-2">Parameter Sweep Progress</div>
            <div className="space-y-2">
              {progress.sweepGroups.slice(0, 3).map((group, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-white/60 w-32 truncate">
                    {group.label}
                  </span>
                  <div className="flex-1 h-2 bg-black border border-white/20 rounded overflow-hidden">
                    <div
                      className="h-full bg-purple-500/30"
                      style={{
                        width: `${(group.runs?.filter(r => r.outcome).length || 0) / group.simulationIds.length * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/40">
                    {group.runs?.filter(r => r.outcome).length || 0}/{group.simulationIds.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}