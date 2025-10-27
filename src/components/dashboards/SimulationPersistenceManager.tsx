/**
 * Simulation Persistence Manager
 *
 * Provides UI for managing saved simulations:
 * - Auto-resume modal for most recent compatible simulation
 * - Grid/list views of all saved simulations
 * - Version compatibility warnings
 * - Simulation details modal
 * - Actions: Continue, Download, Delete
 *
 * Phase 2.1 of simulation persistence implementation.
 */

'use client'

import { useState, useEffect } from 'react'
import { eventDatabase, type SimulationMetadata, SIMULATION_STATE_VERSION } from '@/lib/eventDatabase'
import { Panel } from '@/components/core/Panel'
import type { ScenarioMode } from '@/types/game'

type ViewMode = 'grid' | 'list'

interface SimulationPersistenceManagerProps {
  onResumeSimulation: (simulationId: string) => void
  onStartNew: () => void
  currentSimulationId?: string | null
}

export function SimulationPersistenceManager({
  onResumeSimulation,
  onStartNew,
  currentSimulationId
}: SimulationPersistenceManagerProps) {
  const [simulations, setSimulations] = useState<SimulationMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showAutoResume, setShowAutoResume] = useState(false)
  const [autoResumeCountdown, setAutoResumeCountdown] = useState(3)
  const [selectedSimulation, setSelectedSimulation] = useState<SimulationMetadata | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Load simulations on mount
  useEffect(() => {
    loadSimulations()
  }, [])

  // Auto-resume logic: Show modal if most recent simulation exists and is compatible
  useEffect(() => {
    if (simulations.length > 0 && !currentSimulationId) {
      const mostRecent = simulations[0]
      const isCompatible = mostRecent.version === SIMULATION_STATE_VERSION

      if (isCompatible && !mostRecent.isRunning) {
        setSelectedSimulation(mostRecent)
        setShowAutoResume(true)
      }
    }
  }, [simulations, currentSimulationId])

  // Auto-resume countdown timer
  useEffect(() => {
    if (showAutoResume && autoResumeCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoResumeCountdown(autoResumeCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [showAutoResume, autoResumeCountdown])

  // Auto-resume action when countdown reaches zero
  useEffect(() => {
    if (showAutoResume && autoResumeCountdown === 0 && selectedSimulation) {
      handleResumeSimulation(selectedSimulation.id)
    }
  }, [showAutoResume, autoResumeCountdown, selectedSimulation])

  // Load view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('simulationViewMode')
    if (saved === 'list' || saved === 'grid') {
      setViewMode(saved)
    }
  }, [])

  const loadSimulations = async () => {
    setLoading(true)
    try {
      const sims = await eventDatabase.listSimulations()
      setSimulations(sims)
    } catch (error) {
      console.error('[PersistenceManager] Failed to load simulations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSimulation = (simulationId: string) => {
    setShowAutoResume(false)
    onResumeSimulation(simulationId)
  }

  const handleDeleteSimulation = async (simulationId: string) => {
    if (!confirm('Delete this simulation permanently? This cannot be undone.')) {
      return
    }

    try {
      await eventDatabase.deleteSimulation(simulationId)
      await loadSimulations()
    } catch (error) {
      console.error('[PersistenceManager] Failed to delete simulation:', error)
      alert('Failed to delete simulation. See console for details.')
    }
  }

  const handleDownloadSimulation = async (simulationId: string) => {
    try {
      const stored = await eventDatabase.loadSimulation(simulationId)
      if (!stored) {
        alert('Simulation not found')
        return
      }

      const json = JSON.stringify(stored, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `simulation_${simulationId}_${stored.currentMonth}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('[PersistenceManager] Failed to download simulation:', error)
      alert('Failed to download simulation. See console for details.')
    }
  }

  const handleViewDetails = (simulation: SimulationMetadata) => {
    setSelectedSimulation(simulation)
    setShowDetailsModal(true)
  }

  const handleToggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(newMode)
    localStorage.setItem('simulationViewMode', newMode)
  }

  const handleClearAllData = async () => {
    if (!confirm('Delete ALL simulations, events, and data? This cannot be undone.')) {
      return
    }

    // Double confirmation for safety
    if (!confirm('Are you absolutely sure? This will permanently delete all saved simulations and event history.')) {
      return
    }

    try {
      await eventDatabase.clearAll()
      await eventDatabase.clearAllSimulations()
      await loadSimulations()
      alert('All data cleared successfully.')
    } catch (error) {
      console.error('[PersistenceManager] Failed to clear all data:', error)
      alert('Failed to clear data. See console for details.')
    }
  }

  const handleImportSimulation = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const stored = JSON.parse(text)

        // Validate structure
        if (!stored.id || !stored.gameState || !stored.simulationId) {
          alert('Invalid simulation file format. Missing required fields.')
          return
        }

        // Check if simulation with this ID already exists
        const existing = await eventDatabase.loadSimulation(stored.simulationId)
        if (existing) {
          if (!confirm(`Simulation ${stored.simulationId} already exists. Overwrite?`)) {
            return
          }
        }

        // Save the imported simulation
        await eventDatabase.saveSimulation(stored.simulationId, stored.gameState, false)
        await loadSimulations()
        alert('Simulation imported successfully.')
      } catch (error) {
        console.error('[PersistenceManager] Failed to import simulation:', error)
        alert('Failed to import simulation. Invalid file format or corrupted data.')
      }
    }
    input.click()
  }

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  const formatScenarioName = (scenario: ScenarioMode): string => {
    const names: Record<ScenarioMode, string> = {
      historical: 'Historical Events',
      unprecedented: 'Unprecedented Events'
    }
    return names[scenario] || scenario
  }

  const isCompatible = (simulation: SimulationMetadata): boolean => {
    return simulation.version === SIMULATION_STATE_VERSION
  }

  const getCardStatusClass = (simulation: SimulationMetadata): string => {
    if (simulation.id === currentSimulationId) {
      return 'border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse-slow'
    }
    if (!isCompatible(simulation)) {
      return 'border-amber-400/40 bg-amber-900/10'
    }
    return 'border-white/20 hover:border-white/60'
  }

  const getCardStatusBadge = (simulation: SimulationMetadata) => {
    if (simulation.id === currentSimulationId) {
      return (
        <div className="absolute top-4 right-4 px-2 py-1 bg-cyan-400/20 border border-cyan-400/60 rounded text-xs text-cyan-400">
          RUNNING
        </div>
      )
    }
    if (!isCompatible(simulation)) {
      return (
        <div className="absolute top-4 right-4 px-2 py-1 bg-amber-400/20 border border-amber-400/60 rounded text-xs text-amber-400">
          ⚠ OLD VERSION
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-8">
        <Panel title="Loading Simulations">
          <div className="flex items-center gap-3">
            <div className="status-indicator status-normal animate-pulse" />
            <span>Loading saved simulations...</span>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Auto-Resume Modal */}
      {showAutoResume && selectedSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black border border-cyan-400/60 rounded-sm p-8 max-w-2xl w-full shadow-[0_0_40px_rgba(0,240,255,0.4)]">
            <h2 className="text-2xl mb-4 text-center">RESUMING SIMULATION</h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-1000"
                  style={{ width: `${((3 - autoResumeCountdown) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Simulation Info */}
            <div className="text-center mb-6 space-y-2">
              <p className="text-lg">
                Seed {selectedSimulation.seed} • {formatScenarioName(selectedSimulation.scenario)} • Month {selectedSimulation.currentMonth}
              </p>
              <p className="text-white/60">
                Last saved: {formatTimeAgo(selectedSimulation.lastUpdated)}
              </p>
              <p className="text-cyan-400 text-2xl font-light animate-pulse">
                {autoResumeCountdown}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowAutoResume(false)
                  setAutoResumeCountdown(3)
                }}
                className="px-6 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm hover:border-white/40 hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowAutoResume(false)
                  setAutoResumeCountdown(3)
                  onStartNew()
                }}
                className="px-6 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm hover:border-white/40 hover:bg-white/10 transition-all"
              >
                START NEW INSTEAD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black border border-white/20 rounded-sm p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl">SIMULATION DETAILS</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Configuration */}
              <div>
                <h3 className="text-white/40 uppercase text-xs tracking-wider mb-2">Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-white/60 text-sm">Seed:</span>
                    <span className="ml-2">{selectedSimulation.seed}</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Scenario:</span>
                    <span className="ml-2">{formatScenarioName(selectedSimulation.scenario)}</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Started:</span>
                    <span className="ml-2">{new Date(selectedSimulation.startDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Last Saved:</span>
                    <span className="ml-2">{formatTimeAgo(selectedSimulation.lastUpdated)}</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Version:</span>
                    <span className="ml-2">{selectedSimulation.version} {isCompatible(selectedSimulation) ? '(compatible)' : '(incompatible)'}</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Events Logged:</span>
                    <span className="ml-2">{selectedSimulation.eventCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-white/40 uppercase text-xs tracking-wider mb-2">Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Month {selectedSimulation.currentMonth} of 120</span>
                    <span>{Math.round((selectedSimulation.currentMonth / 120) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${(selectedSimulation.currentMonth / 120) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Current State */}
              <div>
                <h3 className="text-white/40 uppercase text-xs tracking-wider mb-2">Current State</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-white/60 text-sm">Population:</span>
                    <span className="ml-2">{selectedSimulation.population.toFixed(2)}B</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Quality of Life:</span>
                    <span className="ml-2">{(selectedSimulation.qualityOfLife * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">AI Capability:</span>
                    <span className="ml-2">{selectedSimulation.aiCapability.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Version Incompatibility Warning */}
              {!isCompatible(selectedSimulation) && (
                <div className="border border-amber-400/40 bg-amber-900/10 rounded p-4">
                  <h3 className="text-amber-400 mb-2">⚠ VERSION INCOMPATIBILITY DETECTED</h3>
                  <p className="text-sm text-white/80 mb-2">
                    This simulation was created with version {selectedSimulation.version} and cannot be resumed with the current version {SIMULATION_STATE_VERSION}.
                  </p>
                  <p className="text-sm text-white/60">
                    You can still download this simulation for analysis.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {isCompatible(selectedSimulation) && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleResumeSimulation(selectedSimulation.id)
                    }}
                    className="px-6 py-2 bg-cyan-400/10 border border-cyan-400/60 text-cyan-400 rounded-sm hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                  >
                    CONTINUE SIMULATION
                  </button>
                )}
                <button
                  onClick={() => handleDownloadSimulation(selectedSimulation.id)}
                  className="px-6 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm hover:border-white/40 hover:bg-white/10 transition-all"
                >
                  DOWNLOAD JSON
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleDeleteSimulation(selectedSimulation.id)
                  }}
                  className="px-6 py-2 bg-red-900/20 border border-red-400/40 text-red-400 rounded-sm hover:bg-red-900/30 transition-all"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">SIMULATION ARCHIVE</h1>
        <div className="flex gap-2">
          <button
            onClick={handleToggleViewMode}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white/10' : 'bg-white/5'} border border-white/20 hover:border-white/40 transition-all`}
          >
            LIST
          </button>
          <button
            onClick={handleToggleViewMode}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-white/10' : 'bg-white/5'} border border-white/20 hover:border-white/40 transition-all`}
          >
            GRID
          </button>
          <button
            onClick={handleImportSimulation}
            className="px-3 py-1 rounded text-sm bg-white/5 border border-white/20 hover:border-white/40 transition-all"
          >
            IMPORT
          </button>
          {simulations.length > 0 && (
            <button
              onClick={handleClearAllData}
              className="px-3 py-1 rounded text-sm bg-red-900/20 border border-red-400/40 text-red-400 hover:bg-red-900/30 transition-all"
            >
              CLEAR ALL DATA
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {simulations.length === 0 && (
        <div className="text-center py-16">
          <div className="text-white/40 text-6xl mb-4">∧∧∧∧∧</div>
          <h2 className="text-xl mb-2">NO SIMULATIONS YET</h2>
          <p className="text-white/60 mb-6">
            Begin your research into AI alignment<br />
            and humanity&apos;s possible futures
          </p>
          <button
            onClick={onStartNew}
            className="px-8 py-3 bg-cyan-400/10 border border-cyan-400/60 text-cyan-400 rounded-sm hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            + START FIRST SIMULATION
          </button>
        </div>
      )}

      {/* Grid View */}
      {simulations.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className={`bg-black border rounded-sm p-6 transition-all duration-200 relative overflow-hidden hover:transform hover:-translate-y-1 ${getCardStatusClass(sim)}`}
            >
              {getCardStatusBadge(sim)}

              <div className="mb-4">
                <h3 className="text-lg mb-1">SEED {sim.seed}</h3>
                <p className="text-white/60 text-sm">{formatScenarioName(sim.scenario)}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${(sim.currentMonth / 120) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1">Month {sim.currentMonth} of 120</p>
              </div>

              {/* Metrics */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Population:</span>
                  <span>{sim.population.toFixed(2)}B</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">QoL:</span>
                  <span>{(sim.qualityOfLife * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">AI Cap:</span>
                  <span>{sim.aiCapability.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-xs text-white/40 mb-4">
                {formatTimeAgo(sim.lastUpdated)} • v{sim.version}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isCompatible(sim) ? (
                  <button
                    onClick={() => handleResumeSimulation(sim.id)}
                    className="flex-1 px-4 py-2 bg-cyan-400/10 border border-cyan-400/60 text-cyan-400 rounded-sm text-sm hover:bg-cyan-400/20 transition-all"
                  >
                    CONTINUE
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadSimulation(sim.id)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm text-sm hover:border-white/40 hover:bg-white/10 transition-all"
                  >
                    DOWNLOAD
                  </button>
                )}
                <button
                  onClick={() => handleViewDetails(sim)}
                  className="px-4 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm text-sm hover:border-white/40 hover:bg-white/10 transition-all"
                >
                  ···
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {simulations.length > 0 && viewMode === 'list' && (
        <div className="space-y-4">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className={`bg-black border rounded-sm p-6 transition-all duration-200 ${getCardStatusClass(sim)}`}
            >
              <div className="flex items-center gap-6">
                {/* Status Indicator */}
                <div className="w-4">
                  {sim.id === currentSimulationId ? (
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                  ) : !isCompatible(sim) ? (
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  )}
                </div>

                {/* Seed & Scenario */}
                <div className="w-32">
                  <p className="font-semibold">{sim.seed}</p>
                  <p className="text-sm text-white/60">{formatScenarioName(sim.scenario)}</p>
                </div>

                {/* Progress */}
                <div className="w-24">
                  <p className="text-sm">{sim.currentMonth}/120</p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${(sim.currentMonth / 120) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex-1 flex gap-8">
                  <div>
                    <p className="text-xs text-white/40">POP</p>
                    <p className="text-sm">{sim.population.toFixed(2)}B</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">QOL</p>
                    <p className="text-sm">{(sim.qualityOfLife * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">AI CAP</p>
                    <p className="text-sm">{sim.aiCapability.toFixed(2)}</p>
                  </div>
                </div>

                {/* Time & Version */}
                <div className="w-40 text-right">
                  <p className="text-sm">{formatTimeAgo(sim.lastUpdated)}</p>
                  <p className="text-xs text-white/40">v{sim.version}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {isCompatible(sim) ? (
                    <button
                      onClick={() => handleResumeSimulation(sim.id)}
                      className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/60 text-cyan-400 rounded-sm text-sm hover:bg-cyan-400/20 transition-all"
                    >
                      CONTINUE
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadSimulation(sim.id)}
                      className="px-4 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm text-sm hover:border-white/40 hover:bg-white/10 transition-all"
                    >
                      DOWNLOAD
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(sim)}
                    className="px-4 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm text-sm hover:border-white/40 hover:bg-white/10 transition-all"
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => handleDeleteSimulation(sim.id)}
                    className="px-4 py-2 bg-white/5 border border-white/20 text-white/80 rounded-sm text-sm hover:border-white/40 hover:bg-white/10 transition-all"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start New Button */}
      {simulations.length > 0 && (
        <button
          onClick={onStartNew}
          className="w-full py-4 bg-cyan-400/10 border border-cyan-400/60 text-cyan-400 rounded-sm hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all text-lg"
        >
          + START NEW SIMULATION
        </button>
      )}
    </div>
  )
}
