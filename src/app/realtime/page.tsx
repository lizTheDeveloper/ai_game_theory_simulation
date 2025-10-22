'use client';

/**
 * Real-Time Simulation Dashboard - Elysium Edition
 *
 * Ultra-futuristic dashboard inspired by Elysium (2013) medical/systems interfaces.
 * High-contrast, data-dense, clean geometry, glowing accents.
 *
 * Features:
 * - Comprehensive metric visualization (40+ data points)
 * - Multi-panel layout organized by system
 * - Real-time sparkline trends
 * - Color-coded severity indicators
 * - Glowing effects for critical states
 * - Web Worker-based non-blocking simulation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationWorkerClient, type StateDelta, type InitialStateSnapshot } from '@/lib/simulationWorkerClient';
import { Sparkline } from '@/components/Sparkline';
import type { ScenarioMode } from '@/types/game';

// History tracking for sparklines
interface MetricHistory {
  qualityOfLife: number[];
  population: number[];
  aiCapability: number[];
  climateChange: number[];
  socialCohesion: number[];
  extinctionRisk: number[];
  dystopiaRisk: number[];
  utopiaProgress: number[];
}

// Panel component for consistent styling
interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'amber' | 'red' | 'green';
}

const Panel: React.FC<PanelProps> = ({ title, children, className = '', glow }) => {
  const glowColors = {
    cyan: 'shadow-[0_0_20px_rgba(0,240,255,0.3)]',
    amber: 'shadow-[0_0_20px_rgba(255,176,0,0.3)]',
    red: 'shadow-[0_0_20px_rgba(255,0,64,0.3)]',
    green: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]'
  };

  return (
    <div className={`bg-black/90 border border-white/10 p-4 ${glow ? glowColors[glow] : ''} ${className}`}>
      <h3 className="text-xs font-light uppercase tracking-[0.2em] text-white/40 mb-3">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
};

// Metric display component
interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'yellow' | 'red' | 'cyan' | 'white';
  sparkline?: number[];
  className?: string;
}

const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit = '',
  trend,
  color = 'white',
  sparkline,
  className = ''
}) => {
  const colorMap = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
    white: 'text-white'
  };

  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

  return (
    <div className={`${className}`}>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-light tabular-nums ${colorMap[color]}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-white/40">{unit}</span>}
        {trend && <span className="text-sm text-white/40">{trendIcon}</span>}
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="mt-2">
          <Sparkline
            data={sparkline}
            width={120}
            height={25}
            color={color === 'green' ? '#00FF88' :
                   color === 'yellow' ? '#FFB000' :
                   color === 'red' ? '#FF0040' :
                   color === 'cyan' ? '#00F0FF' : '#FFFFFF'}
            showArea
          />
        </div>
      )}
    </div>
  );
};

export default function RealtimeDashboard() {
  // Worker client
  const [client, setClient] = useState<SimulationWorkerClient | null>(null);

  // Simulation state
  const [initialized, setInitialized] = useState(false);
  const [running, setRunning] = useState(false);
  const [scenario, setScenario] = useState<ScenarioMode>('historical');
  const [error, setError] = useState<string | null>(null);

  // Core metrics
  const [month, setMonth] = useState(0);
  const [qualityOfLife, setQualityOfLife] = useState<number | null>(null);
  const [population, setPopulation] = useState<number | null>(null);
  const [aiCount, setAiCount] = useState<number | null>(null);

  // AI System
  const [avgAICapability, setAvgAICapability] = useState<number | null>(null);
  const [alignedAICount, setAlignedAICount] = useState<number | null>(null);
  const [misalignedAICount, setMisalignedAICount] = useState<number | null>(null);
  const [sleeperAgentCount, setSleeperAgentCount] = useState<number | null>(null);

  // Environmental
  const [climateChange, setClimateChange] = useState<number | null>(null);
  const [resourceDepletion, setResourceDepletion] = useState<number | null>(null);
  const [biodiversityLoss, setBiodiversityLoss] = useState<number | null>(null);
  const [pollutionLevel, setPollutionLevel] = useState<number | null>(null);
  const [planetaryBoundariesCrossed, setPlanetaryBoundariesCrossed] = useState<number | null>(null);
  const [environmentalDebtLevel, setEnvironmentalDebtLevel] = useState<number | null>(null);

  // Social
  const [socialCohesion, setSocialCohesion] = useState<number | null>(null);
  const [institutionalTrust, setInstitutionalTrust] = useState<number | null>(null);
  const [meaningLevel, setMeaningLevel] = useState<number | null>(null);
  const [socialDebtLevel, setSocialDebtLevel] = useState<number | null>(null);

  // Crisis
  const [activeCrises, setActiveCrises] = useState<Array<{ type: string; severity: number; duration: number }>>([]);
  const [phosphorusDepletion, setPhosphorusDepletion] = useState<number | null>(null);
  const [freshwaterStress, setFreshwaterStress] = useState<number | null>(null);
  const [oceanAcidification, setOceanAcidification] = useState<number | null>(null);
  const [novelEntitiesLevel, setNovelEntitiesLevel] = useState<number | null>(null);

  // Government
  const [governmentAIRegulation, setGovernmentAIRegulation] = useState<number | null>(null);
  const [governmentInvestment, setGovernmentInvestment] = useState<number | null>(null);
  const [governmentComprehension, setGovernmentComprehension] = useState<number | null>(null);
  const [internationalCooperation, setInternationalCooperation] = useState<number | null>(null);

  // Technology
  const [deployedTechCount, setDeployedTechCount] = useState<number | null>(null);
  const [techRiskLevel, setTechRiskLevel] = useState<number | null>(null);

  // Outcomes
  const [dystopiaProgression, setDystopiaProgression] = useState<number | null>(null);
  const [utopiaProgress, setUtopiaProgress] = useState<number | null>(null);
  const [extinctionProbability, setExtinctionProbability] = useState<number | null>(null);
  const [outcomeType, setOutcomeType] = useState<string>('In Progress');
  const [activeSpirals, setActiveSpirals] = useState<Array<{ type: string; strength: number; duration: number }>>([]);

  // Multi-Paradigm DUI
  const [westernLiberalIndex, setWesternLiberalIndex] = useState<number | null>(null);
  const [developmentIndex, setDevelopmentIndex] = useState<number | null>(null);
  const [ecologicalIndex, setEcologicalIndex] = useState<number | null>(null);
  const [indigenousIndex, setIndigenousIndex] = useState<number | null>(null);

  // Event log
  const [events, setEvents] = useState<Array<{
    month: number;
    message: string;
    type: string;
    category?: string;
  }>>([]);

  // Configuration
  const [seed, setSeed] = useState(42000);
  const [speed, setSpeed] = useState(1.0);

  // Performance tracking
  const [fps, setFps] = useState(0);
  const lastUpdateRef = useRef(Date.now());
  const updateCountRef = useRef(0);

  // Metric history for sparklines (keep last 50 points)
  const [history, setHistory] = useState<MetricHistory>({
    qualityOfLife: [],
    population: [],
    aiCapability: [],
    climateChange: [],
    socialCohesion: [],
    extinctionRisk: [],
    dystopiaRisk: [],
    utopiaProgress: []
  });

  // Create worker client on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !client) {
      try {
        const newClient = new SimulationWorkerClient();
        setClient(newClient);
        console.log('[Dashboard] Worker client created');
      } catch (error) {
        console.error('[Dashboard] Failed to create worker client:', error);
        setError(error instanceof Error ? error.message : String(error));
      }
    }
  }, []);

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
      console.log('[Dashboard] Initialized:', snapshot);
    };

    const handleUpdate = (delta: StateDelta, currentMonth: number, timestamp: number) => {
      // Apply delta to state
      if (delta.currentMonth !== undefined) setMonth(delta.currentMonth);
      if (delta.qualityOfLife !== undefined) {
        setQualityOfLife(delta.qualityOfLife);
        setHistory(h => ({
          ...h,
          qualityOfLife: [...h.qualityOfLife.slice(-49), delta.qualityOfLife!]
        }));
      }
      if (delta.population !== undefined) {
        setPopulation(delta.population);
        setHistory(h => ({
          ...h,
          population: [...h.population.slice(-49), delta.population!]
        }));
      }

      // AI System
      if (delta.aiCount !== undefined) setAiCount(delta.aiCount);
      if (delta.avgAICapability !== undefined) {
        setAvgAICapability(delta.avgAICapability);
        setHistory(h => ({
          ...h,
          aiCapability: [...h.aiCapability.slice(-49), delta.avgAICapability!]
        }));
      }
      if (delta.alignedAICount !== undefined) setAlignedAICount(delta.alignedAICount);
      if (delta.misalignedAICount !== undefined) setMisalignedAICount(delta.misalignedAICount);
      if (delta.sleeperAgentCount !== undefined) setSleeperAgentCount(delta.sleeperAgentCount);

      // Environmental
      if (delta.climateChange !== undefined) {
        setClimateChange(delta.climateChange);
        setHistory(h => ({
          ...h,
          climateChange: [...h.climateChange.slice(-49), delta.climateChange!]
        }));
      }
      if (delta.resourceDepletion !== undefined) setResourceDepletion(delta.resourceDepletion);
      if (delta.biodiversityLoss !== undefined) setBiodiversityLoss(delta.biodiversityLoss);
      if (delta.pollutionLevel !== undefined) setPollutionLevel(delta.pollutionLevel);
      if (delta.planetaryBoundariesCrossed !== undefined) setPlanetaryBoundariesCrossed(delta.planetaryBoundariesCrossed);
      if (delta.environmentalDebtLevel !== undefined) setEnvironmentalDebtLevel(delta.environmentalDebtLevel);

      // Social
      if (delta.socialCohesion !== undefined) {
        setSocialCohesion(delta.socialCohesion);
        setHistory(h => ({
          ...h,
          socialCohesion: [...h.socialCohesion.slice(-49), delta.socialCohesion!]
        }));
      }
      if (delta.institutionalTrust !== undefined) setInstitutionalTrust(delta.institutionalTrust);
      if (delta.meaningLevel !== undefined) setMeaningLevel(delta.meaningLevel);
      if (delta.socialDebtLevel !== undefined) setSocialDebtLevel(delta.socialDebtLevel);

      // Crisis
      if (delta.activeCrises !== undefined) setActiveCrises(delta.activeCrises);
      if (delta.phosphorusDepletion !== undefined) setPhosphorusDepletion(delta.phosphorusDepletion);
      if (delta.freshwaterStress !== undefined) setFreshwaterStress(delta.freshwaterStress);
      if (delta.oceanAcidification !== undefined) setOceanAcidification(delta.oceanAcidification);
      if (delta.novelEntitiesLevel !== undefined) setNovelEntitiesLevel(delta.novelEntitiesLevel);

      // Government
      if (delta.governmentAIRegulation !== undefined) setGovernmentAIRegulation(delta.governmentAIRegulation);
      if (delta.governmentInvestment !== undefined) setGovernmentInvestment(delta.governmentInvestment);
      if (delta.governmentComprehension !== undefined) setGovernmentComprehension(delta.governmentComprehension);
      if (delta.internationalCooperation !== undefined) setInternationalCooperation(delta.internationalCooperation);

      // Technology
      if (delta.deployedTechCount !== undefined) setDeployedTechCount(delta.deployedTechCount);
      if (delta.techRiskLevel !== undefined) setTechRiskLevel(delta.techRiskLevel);

      // Outcomes
      if (delta.dystopiaProgression !== undefined) {
        setDystopiaProgression(delta.dystopiaProgression);
        setHistory(h => ({
          ...h,
          dystopiaRisk: [...h.dystopiaRisk.slice(-49), delta.dystopiaProgression!]
        }));
      }
      if (delta.utopiaProgress !== undefined) {
        setUtopiaProgress(delta.utopiaProgress);
        setHistory(h => ({
          ...h,
          utopiaProgress: [...h.utopiaProgress.slice(-49), delta.utopiaProgress!]
        }));
      }
      if (delta.extinctionProbability !== undefined) {
        setExtinctionProbability(delta.extinctionProbability);
        setHistory(h => ({
          ...h,
          extinctionRisk: [...h.extinctionRisk.slice(-49), delta.extinctionProbability!]
        }));
      }
      if (delta.outcomeType !== undefined) setOutcomeType(delta.outcomeType);
      if (delta.activeSpirals !== undefined) setActiveSpirals(delta.activeSpirals);

      // Multi-Paradigm DUI
      if (delta.westernLiberalIndex !== undefined) setWesternLiberalIndex(delta.westernLiberalIndex);
      if (delta.developmentIndex !== undefined) setDevelopmentIndex(delta.developmentIndex);
      if (delta.ecologicalIndex !== undefined) setEcologicalIndex(delta.ecologicalIndex);
      if (delta.indigenousIndex !== undefined) setIndigenousIndex(delta.indigenousIndex);

      // Track FPS
      updateCountRef.current++;
      const now = Date.now();
      if (now - lastUpdateRef.current >= 1000) {
        setFps(updateCountRef.current);
        updateCountRef.current = 0;
        lastUpdateRef.current = now;
      }

      // Add significant events to log
      if (delta.events && delta.events.length > 0) {
        setEvents(prev => [
          ...prev.slice(-49),
          ...delta.events!.map(e => ({
            month: currentMonth,
            message: e.description,
            type: e.severity || 'info',
            category: e.category
          }))
        ]);
      }
    };

    const handlePaused = (currentMonth: number) => {
      setRunning(false);
      console.log('[Dashboard] Paused at month', currentMonth);
    };

    const handleResumed = (currentMonth: number) => {
      setRunning(true);
      console.log('[Dashboard] Resumed at month', currentMonth);
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setRunning(false);
      console.error('[Dashboard] Error:', err);
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
      const interval = Math.floor(1000 / speed);
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
      setRunning(false);
    } else {
      client.start();
      setRunning(true);
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

  // Format helpers
  const formatNumber = (n: number | null, decimals = 2): string => {
    if (n === null) return '—';
    if (n >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(decimals)}K`;
    return n.toFixed(decimals);
  };

  const formatPercent = (n: number | null): string => {
    if (n === null) return '—';
    return `${(n * 100).toFixed(1)}%`;
  };

  // Determine severity colors
  const getSeverityColor = (value: number, thresholds: { green: number; yellow: number; red: number }): 'green' | 'yellow' | 'red' => {
    if (value >= thresholds.red) return 'red';
    if (value >= thresholds.yellow) return 'yellow';
    return 'green';
  };

  // Loading state
  if (!client) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-light mb-4 text-cyan-400 animate-pulse">
            INITIALIZING SIMULATION ENGINE
          </div>
          <div className="text-white/40">Establishing Web Worker connection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header Bar */}
      <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-light tracking-[0.2em] uppercase">
            <span className="text-cyan-400">Simulation</span> Dashboard
          </h1>
          <div className="text-xs text-white/40">
            {scenario === 'historical' ? 'HISTORICAL MODE' : 'UNPRECEDENTED MODE'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-white/40">
            {fps} FPS | {speed}x Speed
          </div>
          {initialized && (
            <div className="text-sm text-cyan-400">
              Month {month} • Year {Math.floor(month / 12)}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/50 text-red-400">
          <div className="font-semibold mb-1">System Error</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Initialization Panel */}
      {!initialized && (
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <Panel title="Initialize Simulation" className="w-96">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-2">RNG SEED</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value))}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">SCENARIO</label>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as ScenarioMode)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                >
                  <option value="historical">Historical</option>
                  <option value="unprecedented">Unprecedented</option>
                </select>
              </div>
              <button
                onClick={handleInit}
                className="w-full px-4 py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/30 transition-all"
              >
                INITIALIZE
              </button>
            </div>
          </Panel>
        </div>
      )}

      {/* Main Dashboard */}
      {initialized && (
        <div className="flex flex-col h-[calc(100vh-60px)]">
          {/* Control Bar */}
          <div className="px-6 py-3 border-b border-white/10 flex items-center gap-4 bg-black/50">
            <button
              onClick={handleToggleRunning}
              className={`px-6 py-2 font-light tracking-wider transition-all ${
                running
                  ? 'bg-yellow-500/20 border border-yellow-400 text-yellow-400 hover:bg-yellow-400/30'
                  : 'bg-green-500/20 border border-green-400 text-green-400 hover:bg-green-400/30'
              }`}
            >
              {running ? 'PAUSE' : 'START'}
            </button>

            <button
              onClick={handleStep}
              disabled={running}
              className="px-4 py-2 bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 disabled:opacity-30 font-light tracking-wider"
            >
              STEP
            </button>

            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40">SPEED:</label>
              <select
                value={speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-black border border-white/20 px-3 py-1 text-sm text-white"
              >
                <option value="0.5">0.5x</option>
                <option value="1.0">1.0x</option>
                <option value="2.0">2.0x</option>
                <option value="4.0">4.0x</option>
              </select>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-12 gap-4 min-h-full">
              {/* Left Column - Core Metrics & AI */}
              <div className="col-span-3 space-y-4">
                {/* Core Metrics */}
                <Panel title="Core Systems" glow={extinctionProbability && extinctionProbability > 0.5 ? 'red' : undefined}>
                  <div className="space-y-4">
                    <Metric
                      label="Quality of Life"
                      value={formatPercent(qualityOfLife)}
                      color={qualityOfLife && qualityOfLife > 1 ? 'green' : qualityOfLife && qualityOfLife < 0.8 ? 'red' : 'yellow'}
                      sparkline={history.qualityOfLife}
                    />
                    <Metric
                      label="Population"
                      value={population ? `${population.toFixed(2)}` : '—'}
                      unit="billion"
                      trend={population && population > 8 ? 'up' : population && population < 7 ? 'down' : 'stable'}
                      sparkline={history.population}
                    />
                    <Metric
                      label="Extinction Risk"
                      value={formatPercent(extinctionProbability)}
                      color={extinctionProbability && extinctionProbability > 0.5 ? 'red' : extinctionProbability && extinctionProbability > 0.2 ? 'yellow' : 'green'}
                      sparkline={history.extinctionRisk}
                    />
                  </div>
                </Panel>

                {/* AI Systems */}
                <Panel title="AI Ecosystem" glow={misalignedAICount && misalignedAICount > alignedAICount! ? 'amber' : undefined}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Metric
                        label="Total Agents"
                        value={aiCount || 0}
                        color="cyan"
                      />
                      <Metric
                        label="Capability"
                        value={formatPercent(avgAICapability)}
                        color="cyan"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-white/30 mb-1">Aligned</div>
                        <div className="text-green-400 text-lg">{alignedAICount || 0}</div>
                      </div>
                      <div>
                        <div className="text-white/30 mb-1">Misaligned</div>
                        <div className="text-yellow-400 text-lg">{misalignedAICount || 0}</div>
                      </div>
                      <div>
                        <div className="text-white/30 mb-1">Sleepers</div>
                        <div className="text-red-400 text-lg">{sleeperAgentCount || 0}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <Sparkline
                        data={history.aiCapability}
                        width={240}
                        height={30}
                        color="#00F0FF"
                        showArea
                      />
                    </div>
                  </div>
                </Panel>

                {/* Multi-Paradigm DUI */}
                <Panel title="Paradigm Perspectives">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Western Liberal</span>
                      <span className="text-sm text-white">{formatPercent(westernLiberalIndex)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Development</span>
                      <span className="text-sm text-white">{formatPercent(developmentIndex)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Ecological</span>
                      <span className="text-sm text-white">{formatPercent(ecologicalIndex)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Indigenous</span>
                      <span className="text-sm text-white">{formatPercent(indigenousIndex)}</span>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Center Column - Environmental & Social */}
              <div className="col-span-3 space-y-4">
                {/* Environmental Systems */}
                <Panel
                  title="Planetary Systems"
                  glow={planetaryBoundariesCrossed && planetaryBoundariesCrossed >= 6 ? 'red' :
                        planetaryBoundariesCrossed && planetaryBoundariesCrossed >= 3 ? 'amber' : undefined}
                >
                  <div className="space-y-4">
                    <Metric
                      label="Boundaries Crossed"
                      value={`${planetaryBoundariesCrossed || 0}/9`}
                      color={planetaryBoundariesCrossed && planetaryBoundariesCrossed >= 6 ? 'red' :
                             planetaryBoundariesCrossed && planetaryBoundariesCrossed >= 3 ? 'yellow' : 'green'}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Metric
                        label="Climate"
                        value={formatPercent(climateChange)}
                        color={climateChange && climateChange > 0.5 ? 'red' : 'yellow'}
                      />
                      <Metric
                        label="Resources"
                        value={formatPercent(resourceDepletion)}
                        color={resourceDepletion && resourceDepletion < 0.3 ? 'red' : 'yellow'}
                      />
                      <Metric
                        label="Biodiversity"
                        value={formatPercent(biodiversityLoss)}
                        color={biodiversityLoss && biodiversityLoss < 0.5 ? 'red' : 'yellow'}
                      />
                      <Metric
                        label="Pollution"
                        value={formatPercent(pollutionLevel)}
                        color={pollutionLevel && pollutionLevel > 0.5 ? 'red' : 'yellow'}
                      />
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-xs text-white/30 mb-1">Environmental Debt</div>
                      <div className="text-2xl text-yellow-400">{environmentalDebtLevel?.toFixed(1) || '0.0'}</div>
                    </div>
                  </div>
                </Panel>

                {/* Social Systems */}
                <Panel title="Social Fabric" glow={socialCohesion && socialCohesion < 0.3 ? 'amber' : undefined}>
                  <div className="space-y-4">
                    <Metric
                      label="Social Cohesion"
                      value={formatPercent(socialCohesion)}
                      color={socialCohesion && socialCohesion < 0.3 ? 'red' : socialCohesion && socialCohesion < 0.6 ? 'yellow' : 'green'}
                      sparkline={history.socialCohesion}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Metric
                        label="Trust"
                        value={formatPercent(institutionalTrust)}
                        color={institutionalTrust && institutionalTrust < 0.3 ? 'red' : 'yellow'}
                      />
                      <Metric
                        label="Meaning"
                        value={formatPercent(meaningLevel)}
                        color={meaningLevel && meaningLevel < 0.3 ? 'red' : 'yellow'}
                      />
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-xs text-white/30 mb-1">Social Debt</div>
                      <div className="text-2xl text-yellow-400">{socialDebtLevel?.toFixed(1) || '0.0'}</div>
                    </div>
                  </div>
                </Panel>

                {/* Crisis Indicators */}
                <Panel title="Active Crises" glow={activeCrises.length > 2 ? 'red' : activeCrises.length > 0 ? 'amber' : undefined}>
                  {activeCrises.length === 0 ? (
                    <div className="text-white/30 text-sm">No active crises</div>
                  ) : (
                    <div className="space-y-2">
                      {activeCrises.map((crisis, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-xs text-white/60">{crisis.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-red-400">{(crisis.severity * 100).toFixed(0)}%</span>
                            <span className="text-xs text-white/30">{crisis.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-white/30 mb-1">Phosphorus</div>
                      <div className={phosphorusDepletion && phosphorusDepletion > 0.5 ? 'text-red-400' : 'text-white/60'}>
                        {formatPercent(phosphorusDepletion)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/30 mb-1">Freshwater</div>
                      <div className={freshwaterStress && freshwaterStress > 0.5 ? 'text-red-400' : 'text-white/60'}>
                        {formatPercent(freshwaterStress)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/30 mb-1">Ocean pH</div>
                      <div className={oceanAcidification && oceanAcidification < 8.0 ? 'text-red-400' : 'text-white/60'}>
                        {oceanAcidification?.toFixed(2) || '8.2'}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/30 mb-1">Chemicals</div>
                      <div className={novelEntitiesLevel && novelEntitiesLevel > 0.5 ? 'text-red-400' : 'text-white/60'}>
                        {formatPercent(novelEntitiesLevel)}
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Right Side - Government, Tech, Outcomes */}
              <div className="col-span-3 space-y-4">
                {/* Government & Governance */}
                <Panel title="Governance">
                  <div className="space-y-3">
                    <Metric
                      label="AI Regulation"
                      value={formatPercent(governmentAIRegulation)}
                      color={governmentAIRegulation && governmentAIRegulation > 0.7 ? 'green' : 'yellow'}
                    />
                    <Metric
                      label="Comprehension"
                      value={formatPercent(governmentComprehension)}
                      color={governmentComprehension && governmentComprehension < 0.3 ? 'red' : 'yellow'}
                    />
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <Metric
                        label="Investment"
                        value={formatNumber(governmentInvestment, 0)}
                        color="white"
                      />
                      <Metric
                        label="Cooperation"
                        value={formatPercent(internationalCooperation)}
                        color="white"
                      />
                    </div>
                  </div>
                </Panel>

                {/* Technology */}
                <Panel title="Technology">
                  <div className="space-y-3">
                    <Metric
                      label="Deployed Technologies"
                      value={deployedTechCount || 0}
                      color={deployedTechCount && deployedTechCount > 30 ? 'green' : 'yellow'}
                    />
                    <Metric
                      label="Tech Risk Level"
                      value={formatPercent(techRiskLevel)}
                      color={techRiskLevel && techRiskLevel > 0.5 ? 'red' : 'yellow'}
                    />
                  </div>
                </Panel>

                {/* Outcome Trajectories */}
                <Panel
                  title="Outcome Trajectories"
                  glow={dystopiaProgression && dystopiaProgression > 0.7 ? 'red' :
                        utopiaProgress && utopiaProgress > 0.7 ? 'green' : undefined}
                >
                  <div className="space-y-4">
                    <Metric
                      label="Dystopia Risk"
                      value={formatPercent(dystopiaProgression)}
                      color={dystopiaProgression && dystopiaProgression > 0.5 ? 'red' : 'yellow'}
                      sparkline={history.dystopiaRisk}
                    />
                    <Metric
                      label="Utopia Progress"
                      value={formatPercent(utopiaProgress)}
                      color={utopiaProgress && utopiaProgress > 0.5 ? 'green' : 'white'}
                      sparkline={history.utopiaProgress}
                    />
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-xs text-white/30 mb-1">Current Trajectory</div>
                      <div className={`text-lg font-light ${
                        outcomeType === 'Utopia' ? 'text-green-400' :
                        outcomeType === 'Dystopia' ? 'text-red-400' :
                        outcomeType === 'Extinction' ? 'text-red-600' :
                        'text-white/60'
                      }`}>
                        {outcomeType}
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Upward Spirals */}
                {activeSpirals.length > 0 && (
                  <Panel title="Active Spirals" glow="green">
                    <div className="space-y-2">
                      {activeSpirals.map((spiral, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-xs text-green-400">{spiral.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{(spiral.strength * 100).toFixed(0)}%</span>
                            <span className="text-xs text-white/30">{spiral.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}
              </div>

              {/* Far Right - Event Stream */}
              <div className="col-span-3">
                <Panel title="Event Stream" className="h-full">
                  <div className="h-[calc(100vh-280px)] overflow-y-auto space-y-2 pr-2">
                    {events.length === 0 ? (
                      <div className="text-white/30 text-sm">Waiting for events...</div>
                    ) : (
                      events.slice().reverse().map((event, idx) => (
                        <div key={idx} className="text-xs border-l-2 pl-2 py-1 border-white/10">
                          <div className="flex items-start gap-2">
                            <span className="text-white/30 font-mono">M{event.month}</span>
                            <span className={
                              event.type === 'critical' ? 'text-red-400' :
                              event.type === 'high' ? 'text-orange-400' :
                              event.type === 'medium' ? 'text-yellow-400' :
                              'text-white/60'
                            }>
                              {event.message}
                            </span>
                          </div>
                          {event.category && (
                            <span className="text-[10px] text-white/20 ml-10">
                              [{event.category.toUpperCase()}]
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}