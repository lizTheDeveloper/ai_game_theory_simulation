'use client';

/**
 * Real-Time Playable Simulation Dashboard
 *
 * Runs simulation in Web Worker at 1 day/second.
 * Displays live metrics and supports pause/resume/speed controls.
 *
 * Features:
 * - Non-blocking simulation (Web Worker)
 * - Real-time metric updates
 * - Pause/Resume/Step controls
 * - Configurable speed (0.5x - 4x)
 * - Delta-based updates (efficient)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationWorkerClient, type StateDelta, type InitialStateSnapshot } from '@/lib/simulationWorkerClient';
import type { ScenarioMode } from '@/types/game';

export default function RealtimePage() {
  // Worker client (created client-side only to avoid SSR hydration mismatch)
  const [client, setClient] = useState<SimulationWorkerClient | null>(null);

  // Simulation state
  const [initialized, setInitialized] = useState(false);
  const [running, setRunning] = useState(false);
  const [month, setMonth] = useState(0);
  const [qualityOfLife, setQualityOfLife] = useState<number | null>(null);
  const [population, setPopulation] = useState<number | null>(null);
  const [aiCount, setAiCount] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioMode>('historical');
  const [error, setError] = useState<string | null>(null);

  // Configuration
  const [seed, setSeed] = useState(42000);
  const [speed, setSpeed] = useState(1.0); // 1x = 1 second/day

  // Performance tracking
  const [fps, setFps] = useState(0);
  const lastUpdateRef = useRef(Date.now());
  const updateCountRef = useRef(0);

  // Create worker client on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !client) {
      try {
        const newClient = new SimulationWorkerClient();
        setClient(newClient);
        console.log('[RealtimePage] Worker client created');
      } catch (error) {
        console.error('[RealtimePage] Failed to create worker client:', error);
        setError(error instanceof Error ? error.message : String(error));
      }
    }
  }, []); // Run once on mount

  // Setup worker event listeners
  useEffect(() => {
    if (!client) return;

    const handleInitialized = (snapshot: InitialStateSnapshot) => {
      setInitialized(true);
      setMonth(snapshot.currentMonth);
      setQualityOfLife(snapshot.qualityOfLife);
      setPopulation(snapshot.population);
      setAiCount(snapshot.aiCount);
      setScenario(snapshot.scenario);
      setError(null);
      console.log('[Realtime] Initialized:', snapshot);
    };

    const handleUpdate = (delta: StateDelta, currentMonth: number, timestamp: number) => {
      // Apply delta to state
      if (delta.currentMonth !== undefined) setMonth(delta.currentMonth);
      if (delta.qualityOfLife !== undefined) setQualityOfLife(delta.qualityOfLife);
      if (delta.population !== undefined) setPopulation(delta.population);
      if (delta.aiCount !== undefined) setAiCount(delta.aiCount);
      if (delta.outcome !== undefined) setOutcome(delta.outcome);

      // Track FPS
      updateCountRef.current++;
      const now = Date.now();
      if (now - lastUpdateRef.current >= 1000) {
        setFps(updateCountRef.current);
        updateCountRef.current = 0;
        lastUpdateRef.current = now;
      }
    };

    const handlePaused = (currentMonth: number) => {
      setRunning(false);
      console.log('[Realtime] Paused at month', currentMonth);
    };

    const handleResumed = (currentMonth: number) => {
      setRunning(true);
      console.log('[Realtime] Resumed at month', currentMonth);
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setRunning(false);
      console.error('[Realtime] Error:', err);
    };

    // Register listeners
    client.on('initialized', handleInitialized);
    client.on('update', handleUpdate);
    client.on('paused', handlePaused);
    client.on('resumed', handleResumed);
    client.on('error', handleError);

    // Cleanup
    return () => {
      client.off('initialized', handleInitialized);
      client.off('update', handleUpdate);
      client.off('paused', handlePaused);
      client.off('resumed', handleResumed);
      client.off('error', handleError);
    };
  }, [client]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.destroy();
      }
    };
  }, [client]);

  // Initialize simulation
  const handleInit = useCallback(() => {
    if (!client || initialized) return;

    try {
      const interval = Math.floor(1000 / speed); // Convert speed to interval
      client.init(seed, scenario, interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [client, initialized, seed, scenario, speed]);

  // Start/pause toggle
  const handleToggleRunning = useCallback(() => {
    if (!client || !initialized) return;

    if (running) {
      client.pause();
    } else {
      client.start();
    }
  }, [client, initialized, running]);

  // Manual step
  const handleStep = useCallback(() => {
    if (!client || !initialized) return;
    client.step();
  }, [client, initialized]);

  // Change speed
  const handleSpeedChange = useCallback((newSpeed: number) => {
    if (!client || !initialized) return;

    setSpeed(newSpeed);
    const interval = Math.floor(1000 / newSpeed);
    client.setSpeed(interval);
  }, [client, initialized]);

  // Format numbers
  const formatNumber = (n: number | null) => {
    if (n === null) return '—';
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(0);
  };

  const formatPercent = (n: number | null) => {
    if (n === null) return '—';
    return `${(n * 100).toFixed(1)}%`;
  };

  // Show loading state while worker client is being created
  if (!client) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real-Time Simulation</h1>
          <p className="text-gray-400">Initializing Web Worker...</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded">
            <h3 className="font-semibold mb-2">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Real-Time Simulation</h1>
        <p className="text-gray-400">Live simulation running at {speed}x speed (1 day every {(1000/speed).toFixed(0)}ms)</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded">
          <h3 className="font-semibold mb-2">Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Initialization */}
      {!initialized && (
        <div className="mb-8 p-6 border border-gray-700 rounded">
          <h2 className="text-2xl font-semibold mb-4">Initialize Simulation</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2">Seed</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Scenario</label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as ScenarioMode)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              >
                <option value="historical">Historical</option>
                <option value="unprecedented">Unprecedented</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleInit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Initialize
          </button>
        </div>
      )}

      {/* Controls */}
      {initialized && (
        <div className="mb-8 flex gap-4 items-center">
          <button
            onClick={handleToggleRunning}
            className={`px-6 py-3 rounded font-semibold ${
              running
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {running ? '⏸️ Pause' : '▶️ Start'}
          </button>

          <button
            onClick={handleStep}
            disabled={running}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold disabled:opacity-50"
          >
            ⏭️ Step
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm">Speed:</label>
            <select
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
            >
              <option value="0.5">0.5x (2s/day)</option>
              <option value="1.0">1x (1s/day)</option>
              <option value="2.0">2x (0.5s/day)</option>
              <option value="4.0">4x (0.25s/day)</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-400">
            {fps} updates/sec
          </div>
        </div>
      )}

      {/* Metrics Dashboard */}
      {initialized && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-gray-900 border border-gray-700 rounded">
            <h3 className="text-sm text-gray-400 mb-2">Month</h3>
            <p className="text-3xl font-bold">{month}</p>
            <p className="text-sm text-gray-500 mt-1">
              Year {Math.floor(month / 12)}
            </p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-700 rounded">
            <h3 className="text-sm text-gray-400 mb-2">Quality of Life</h3>
            <p className="text-3xl font-bold">{formatPercent(qualityOfLife)}</p>
            <div className="mt-2 h-2 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(qualityOfLife || 0) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-700 rounded">
            <h3 className="text-sm text-gray-400 mb-2">Population</h3>
            <p className="text-3xl font-bold">{formatNumber(population)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {population && population > 8e9 ? '📈' : population && population < 7e9 ? '📉' : '➡️'}
            </p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-700 rounded">
            <h3 className="text-sm text-gray-400 mb-2">AI Agents</h3>
            <p className="text-3xl font-bold">{formatNumber(aiCount)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {aiCount && aiCount > 20 ? '🤖' : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Outcome */}
      {outcome && (
        <div className="p-6 bg-purple-900/50 border border-purple-500 rounded">
          <h3 className="text-xl font-semibold mb-2">Simulation Complete</h3>
          <p className="text-lg">Outcome: <span className="font-bold">{outcome}</span></p>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-gray-900 border border-gray-700 rounded text-sm">
        <h4 className="font-semibold mb-2">About Real-Time Mode</h4>
        <ul className="list-disc list-inside text-gray-400 space-y-1">
          <li>Simulation runs in a Web Worker (non-blocking UI)</li>
          <li>Same engine code as Monte Carlo simulations (zero duplication)</li>
          <li>Delta updates only send changed fields (efficient)</li>
          <li>21% performance improvement from async logging</li>
          <li>Player decisions coming in Phase 3 (future work)</li>
        </ul>
      </div>
    </div>
  );
}
