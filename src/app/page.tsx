'use client';

/**
 * Real-Time Simulation Dashboard - Paradigm-Focused Edition
 *
 * Ultra-futuristic dashboard with Multi-Paradigm DUI as centerpiece.
 * Inspired by Elysium (2013) medical/systems interfaces.
 * High-contrast, data-dense, clean geometry, glowing accents.
 *
 * Features:
 * - Multi-Paradigm DUI histogram with sparklines (front & center)
 * - Comprehensive economic indicators panel
 * - Expanded government information with active policies
 * - Real-time sparkline trends throughout
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
  // Paradigm histories
  westernLiberal: number[];
  development: number[];
  ecological: number[];
  indigenous: number[];
  // Economic histories
  gdp: number[];
  employment: number[];
  inequality: number[];
  inflation: number[];
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

// Paradigm Time Series component - shows historical values over time
interface ParadigmTimeSeriesProps {
  name: string;
  value: number;
  color: string;
  history?: number[];
  trend?: 'up' | 'down' | 'stable';
  allHistories?: {
    westernLiberal: number[];
    development: number[];
    ecological: number[];
    indigenous: number[];
  };
  currentDay?: number; // Current day of simulation (1-30) for progressive reveal
}

const ParadigmTimeSeries: React.FC<ParadigmTimeSeriesProps> = ({ name, value, color, history, trend, allHistories, currentDay = 1 }) => {
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const percentage = (value * 100).toFixed(1);

  // Determine status based on value
  const status = value >= 0.7 ? 'OPTIMAL' : value >= 0.4 ? 'STABLE' : value >= 0.2 ? 'WARNING' : 'CRITICAL';
  const statusColor = value >= 0.7 ? 'text-green-400' : value >= 0.4 ? 'text-cyan-400' : value >= 0.2 ? 'text-yellow-400' : 'text-red-400';

  // Progressive reveal based on simulation day:
  // - Simulation runs fast (1 month every 30 seconds)
  // - Display progressively reveals data as simulation advances
  // - Each simulation month is spread across 30 daily display points
  // - Day 1: show 1 point, Day 15: show 15 points, Day 30: show 30 points

  // Convert history to percentage values
  const fullHistory = (history || []).map(v => v * 100);

  // Progressive reveal within current month:
  // - Take the current month's value (last value in history)
  // - Repeat it across currentDay data points only
  // - This creates data that progressively grows from 1→30 points
  const currentValue = fullHistory[fullHistory.length - 1] || 50;
  const historyPercentages = Array(currentDay).fill(currentValue);

  console.log(`[${name}] currentDay=${currentDay}, historyPercentages.length=${historyPercentages.length}, should extend to ${(currentDay/30*100).toFixed(1)}%`);

  // Calculate min/max for better visualization
  const minValue = Math.min(...(historyPercentages.length > 0 ? historyPercentages : [0]));
  const maxValue = Math.max(...(historyPercentages.length > 0 ? historyPercentages : [100]));
  const range = maxValue - minValue || 100;

  return (
    <div className="space-y-4">
      {/* Header with name and current value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-light text-white/90">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${statusColor} font-mono uppercase tracking-wider`}>{status}</span>
          <span className="text-sm text-white/40">{trendIcon}</span>
          <span className="text-2xl font-light text-white tabular-nums">{percentage}%</span>
        </div>
      </div>

      {/* Time Series Area Chart */}
      <div className="relative bg-black border border-white/20 overflow-hidden" style={{ height: '120px' }}>
        {historyPercentages.length > 1 ? (
          <>
            {/* Chart container with proper sizing */}
            <div className="w-full h-full relative">
              {/* Reference lines at 20%, 40%, 70% thresholds */}
              <div className="absolute inset-0 pointer-events-none px-2">
                {/* 70% threshold - optimal */}
                <div
                  className="absolute w-full border-t border-green-400/20"
                  style={{ top: `${100 - ((70 - minValue) / range * 100)}%` }}
                >
                  <span className="absolute -top-2 right-0 text-[9px] text-green-400/40">70%</span>
                </div>
                {/* 40% threshold - stable */}
                <div
                  className="absolute w-full border-t border-cyan-400/20"
                  style={{ top: `${100 - ((40 - minValue) / range * 100)}%` }}
                >
                  <span className="absolute -top-2 right-0 text-[9px] text-cyan-400/40">40%</span>
                </div>
                {/* 20% threshold - warning */}
                <div
                  className="absolute w-full border-t border-yellow-400/20"
                  style={{ top: `${100 - ((20 - minValue) / range * 100)}%` }}
                >
                  <span className="absolute -top-2 right-0 text-[9px] text-yellow-400/40">20%</span>
                </div>
              </div>

              {/* Main sparkline with area fill - constrained to container */}
              <div className="absolute inset-0 p-1">
                <Sparkline
                  data={historyPercentages}
                  width={280}
                  height={114}
                  color={color}
                  showArea
                  strokeWidth={2}
                  className="mx-auto"
                  minValue={0}
                  maxValue={100}
                  maxDataPoints={30}
                />
              </div>
            </div>

            {/* Time labels - Always show full month range (Day 1 to Day 30) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-white/30">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-white/20 text-sm">Collecting historical data...</div>
          </div>
        )}
      </div>

      {/* Status box with insight */}
      <div className="p-2 rounded bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/40">
            {historyPercentages.length > 10 && (
              <>
                {/* Show average over last 10 months */}
                <span>10mo avg: {(historyPercentages.slice(-10).reduce((a, b) => a + b, 0) / 10).toFixed(1)}%</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Current:</span>
            <span className={`text-sm font-medium ${statusColor}`}>{percentage}%</span>
          </div>
        </div>
      </div>
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
  const [day, setDay] = useState(1);
  const [calendarDate, setCalendarDate] = useState<string | null>(null);
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
  const [activePolicies, setActivePolicies] = useState<string[]>([]);
  const [legislativeActivity, setLegislativeActivity] = useState<number>(0);
  const [publicTrust, setPublicTrust] = useState<number | null>(null);

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

  // Economic Indicators (simulated for now)
  const [gdp, setGdp] = useState<number>(100);
  const [employment, setEmployment] = useState<number>(0.95);
  const [wealthInequality, setWealthInequality] = useState<number>(0.35);
  const [inflationRate, setInflationRate] = useState<number>(0.02);

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
    utopiaProgress: [],
    westernLiberal: [],
    development: [],
    ecological: [],
    indigenous: [],
    gdp: [],
    employment: [],
    inequality: [],
    inflation: []
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

    const handleInitialized = (snapshot: InitialStateSnapshot, startDate: string) => {
      setInitialized(true);
      setMonth(snapshot.currentMonth);
      setDay(1);
      setCalendarDate(startDate);
      setQualityOfLife(snapshot.qualityOfLife);
      setPopulation(snapshot.population);
      setAiCount(snapshot.aiCount);
      setScenario(snapshot.scenario);
      setError(null);
      console.log('[Dashboard] Initialized:', snapshot, 'Start date:', startDate);
    };

    const handleUpdate = (delta: StateDelta, currentMonth: number, currentDay: number, date: string, timestamp: number) => {
      // Update calendar
      setDay(currentDay);
      setCalendarDate(date);
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
      if (delta.institutionalTrust !== undefined) {
        setInstitutionalTrust(delta.institutionalTrust);
        setPublicTrust(delta.institutionalTrust); // Mirror as public trust for now
      }
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
      if (delta.westernLiberalIndex !== undefined) {
        setWesternLiberalIndex(delta.westernLiberalIndex);
        setHistory(h => ({
          ...h,
          westernLiberal: [...h.westernLiberal.slice(-49), delta.westernLiberalIndex!]
        }));
      }
      if (delta.developmentIndex !== undefined) {
        setDevelopmentIndex(delta.developmentIndex);
        setHistory(h => ({
          ...h,
          development: [...h.development.slice(-49), delta.developmentIndex!]
        }));
      }
      if (delta.ecologicalIndex !== undefined) {
        setEcologicalIndex(delta.ecologicalIndex);
        setHistory(h => ({
          ...h,
          ecological: [...h.ecological.slice(-49), delta.ecologicalIndex!]
        }));
      }
      if (delta.indigenousIndex !== undefined) {
        setIndigenousIndex(delta.indigenousIndex);
        setHistory(h => ({
          ...h,
          indigenous: [...h.indigenous.slice(-49), delta.indigenousIndex!]
        }));
      }

      // Simulate economic changes based on other metrics
      if (delta.qualityOfLife !== undefined) {
        const newGdp = gdp * (1 + (delta.qualityOfLife - 1) * 0.02);
        setGdp(newGdp);
        setHistory(h => ({
          ...h,
          gdp: [...h.gdp.slice(-49), newGdp]
        }));
      }

      if (delta.socialCohesion !== undefined) {
        const newEmployment = 0.95 * delta.socialCohesion;
        setEmployment(newEmployment);
        setHistory(h => ({
          ...h,
          employment: [...h.employment.slice(-49), newEmployment]
        }));

        const newInequality = 0.35 + (1 - delta.socialCohesion) * 0.3;
        setWealthInequality(newInequality);
        setHistory(h => ({
          ...h,
          inequality: [...h.inequality.slice(-49), newInequality]
        }));
      }

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

      // Simulate policy changes
      if (delta.governmentAIRegulation && delta.governmentAIRegulation > 0.5) {
        setActivePolicies(['AI Safety Act', 'Compute Monitoring', 'Capability Disclosure']);
        setLegislativeActivity(0.7);
      } else {
        setActivePolicies(['Basic AI Guidelines']);
        setLegislativeActivity(0.3);
      }
    };

    const handleDayUpdate = (currentDay: number, date: string) => {
      setDay(currentDay);
      setCalendarDate(date);
    };

    const handlePaused = (currentMonth: number, currentDay: number) => {
      setRunning(false);
      console.log('[Dashboard] Paused at month', currentMonth, 'day', currentDay);
    };

    const handleResumed = (currentMonth: number, currentDay: number) => {
      setRunning(true);
      console.log('[Dashboard] Resumed at month', currentMonth, 'day', currentDay);
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setRunning(false);
      console.error('[Dashboard] Error:', err);
    };

    // Register listeners
    client.on('initialized', handleInitialized);
    client.on('update', handleUpdate);
    client.on('dayUpdate', handleDayUpdate);
    client.on('paused', handlePaused);
    client.on('resumed', handleResumed);
    client.on('error', handleError);

    // Cleanup
    return () => {
      client.off('initialized', handleInitialized);
      client.off('update', handleUpdate);
      client.off('dayUpdate', handleDayUpdate);
      client.off('paused', handlePaused);
      client.off('resumed', handleResumed);
      client.off('error', handleError);
    };
  }, [client, gdp]);

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
      // Calculate interval: 30000ms base (30 seconds = 1 month at 1x speed)
      // Speed multiplier: 0.5x = 60s/month, 1x = 30s/month, 2x = 15s/month, 4x = 7.5s/month
      const interval = Math.floor(30000 / speed);
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
    // Calculate interval: 30000ms base (30 seconds = 1 month at 1x speed)
    // Speed multiplier: 0.5x = 60s/month, 1x = 30s/month, 2x = 15s/month, 4x = 7.5s/month
    const interval = Math.floor(30000 / newSpeed);
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

  const formatMultiplier = (n: number | null): string => {
    if (n === null) return '—';
    // For values > 2.0, display as "Nx baseline"
    // For values <= 2.0, display as percentage
    if (n > 2.0) {
      return `${n.toFixed(1)}x`;
    }
    return `${(n * 100).toFixed(1)}%`;
  };

  // Determine paradigm trends
  const getParadigmTrend = (history: number[]): 'up' | 'down' | 'stable' => {
    if (history.length < 2) return 'stable';
    const recent = history.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const lastValue = history[history.length - 1];
    if (lastValue > avg * 1.05) return 'up';
    if (lastValue < avg * 0.95) return 'down';
    return 'stable';
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
            Superalignment <span className="text-cyan-400">to</span> Utopia
          </h1>
          <div className="text-xs text-white/40">
            {scenario === 'historical' ? 'HISTORICAL MODE' : 'UNPRECEDENTED MODE'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-white/40">
            {fps} FPS | {speed}x Speed
          </div>
          {initialized && calendarDate && (
            <div className="text-sm text-cyan-400 flex items-center gap-3">
              <span>{new Date(calendarDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/60">Day {day} of 30</span>
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
                value={speed.toFixed(1)}
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
            <div className="space-y-6">
              {/* Top Section - Multi-Paradigm DUI (Full Width) */}
              <Panel
                title="Multi-Paradigm Dystopia/Utopia Indicators"
                className="col-span-12"
                glow={
                  (westernLiberalIndex !== null && westernLiberalIndex < 0.2) ||
                  (developmentIndex !== null && developmentIndex < 0.2) ||
                  (ecologicalIndex !== null && ecologicalIndex < 0.2) ||
                  (indigenousIndex !== null && indigenousIndex < 0.2)
                    ? 'red'
                    : (westernLiberalIndex !== null && westernLiberalIndex > 0.7) &&
                      (developmentIndex !== null && developmentIndex > 0.7) &&
                      (ecologicalIndex !== null && ecologicalIndex > 0.7) &&
                      (indigenousIndex !== null && indigenousIndex > 0.7)
                    ? 'green'
                    : undefined
                }
              >
                <div className="grid grid-cols-2 gap-6">
                  <ParadigmTimeSeries
                    name="Western Liberal"
                    value={westernLiberalIndex || 0}
                    color="#00F0FF"
                    history={history.westernLiberal}
                    trend={getParadigmTrend(history.westernLiberal)}
                    allHistories={history}
                    currentDay={day}
                  />
                  <ParadigmTimeSeries
                    name="Development"
                    value={developmentIndex || 0}
                    color="#00FF88"
                    history={history.development}
                    trend={getParadigmTrend(history.development)}
                    allHistories={history}
                    currentDay={day}
                  />
                  <ParadigmTimeSeries
                    name="Ecological"
                    value={ecologicalIndex || 0}
                    color="#90EE90"
                    history={history.ecological}
                    trend={getParadigmTrend(history.ecological)}
                    allHistories={history}
                    currentDay={day}
                  />
                  <ParadigmTimeSeries
                    name="Indigenous"
                    value={indigenousIndex || 0}
                    color="#FFB000"
                    history={history.indigenous}
                    trend={getParadigmTrend(history.indigenous)}
                    allHistories={history}
                    currentDay={day}
                  />
                </div>

                {/* Paradigm divergence indicator */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-white/40">PARADIGM DIVERGENCE</div>
                  <div className="text-sm text-white">
                    {(() => {
                      const values = [westernLiberalIndex, developmentIndex, ecologicalIndex, indigenousIndex].filter(v => v !== null) as number[];
                      if (values.length === 0) return '—';
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const divergence = max - min;
                      return (
                        <span className={divergence > 0.5 ? 'text-red-400' : divergence > 0.3 ? 'text-yellow-400' : 'text-green-400'}>
                          {(divergence * 100).toFixed(1)}% {divergence > 0.5 ? '(CRITICAL)' : divergence > 0.3 ? '(WARNING)' : '(ALIGNED)'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </Panel>

              {/* Main Grid */}
              <div className="grid grid-cols-12 gap-4">
                {/* Left Column - Economic Indicators & Core Metrics */}
                <div className="col-span-3 space-y-4">
                  {/* Economic Indicators */}
                  <Panel title="Economic Systems" glow={wealthInequality > 0.5 ? 'amber' : undefined}>
                    <div className="space-y-4">
                      <Metric
                        label="GDP Index"
                        value={formatNumber(gdp, 1)}
                        trend={gdp > 100 ? 'up' : gdp < 100 ? 'down' : 'stable'}
                        color={gdp > 100 ? 'green' : gdp < 90 ? 'red' : 'yellow'}
                        sparkline={history.gdp}
                      />
                      <Metric
                        label="Employment"
                        value={formatPercent(employment)}
                        color={employment > 0.9 ? 'green' : employment < 0.8 ? 'red' : 'yellow'}
                        sparkline={history.employment}
                      />
                      <Metric
                        label="Wealth Inequality"
                        value={`${(wealthInequality * 100).toFixed(1)}`}
                        unit="Gini"
                        color={wealthInequality > 0.5 ? 'red' : wealthInequality > 0.35 ? 'yellow' : 'green'}
                        sparkline={history.inequality}
                      />
                      <Metric
                        label="Inflation Rate"
                        value={formatPercent(inflationRate)}
                        color={inflationRate > 0.05 ? 'red' : inflationRate < 0 ? 'yellow' : 'green'}
                        sparkline={history.inflation}
                      />
                    </div>
                  </Panel>

                  {/* Core Systems */}
                  <Panel title="Core Systems">
                    <div className="space-y-4">
                      <Metric
                        label="Quality of Life"
                        value={formatMultiplier(qualityOfLife)}
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
                    </div>
                  </Panel>
                </div>

                {/* Center-Left - Government & Policy */}
                <div className="col-span-3 space-y-4">
                  {/* Expanded Government */}
                  <Panel title="Government & Policy" glow={publicTrust && publicTrust < 0.3 ? 'red' : undefined}>
                    <div className="space-y-4">
                      <Metric
                        label="Public Trust"
                        value={formatPercent(publicTrust)}
                        color={publicTrust && publicTrust < 0.3 ? 'red' : publicTrust && publicTrust < 0.6 ? 'yellow' : 'green'}
                      />
                      <Metric
                        label="AI Regulation"
                        value={formatMultiplier(governmentAIRegulation)}
                        color={governmentAIRegulation && governmentAIRegulation > 0.7 ? 'green' : 'yellow'}
                      />
                      <Metric
                        label="Comprehension"
                        value={formatPercent(governmentComprehension)}
                        color={governmentComprehension && governmentComprehension < 0.3 ? 'red' : 'yellow'}
                      />

                      <div className="pt-3 border-t border-white/10">
                        <div className="text-xs text-white/30 mb-2">ACTIVE POLICIES</div>
                        {activePolicies.length > 0 ? (
                          <div className="space-y-1">
                            {activePolicies.map((policy, idx) => (
                              <div key={idx} className="text-xs text-cyan-400 flex items-center gap-1">
                                <span className="text-white/30">•</span>
                                {policy}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-white/30">No active policies</div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
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

                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/30">Legislative Activity</span>
                          <span className="text-sm text-white">{formatPercent(legislativeActivity)}</span>
                        </div>
                      </div>
                    </div>
                  </Panel>

                  {/* AI Ecosystem */}
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
                          value={formatMultiplier(avgAICapability)}
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
                    </div>
                  </Panel>
                </div>

                {/* Center-Right - Environmental & Social */}
                <div className="col-span-3 space-y-4">
                  {/* Planetary Systems */}
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

                  {/* Social Fabric */}
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
                </div>

                {/* Far Right - Event Stream & Outcomes */}
                <div className="col-span-3 space-y-4">
                  {/* Outcome Trajectories (Smaller) */}
                  <Panel
                    title="Outcome Trajectories"
                    glow={dystopiaProgression && dystopiaProgression > 0.7 ? 'red' :
                          utopiaProgress && utopiaProgress > 0.7 ? 'green' : undefined}
                  >
                    <div className="space-y-3">
                      <Metric
                        label="Dystopia Risk"
                        value={formatPercent(dystopiaProgression)}
                        color={dystopiaProgression && dystopiaProgression > 0.5 ? 'red' : 'yellow'}
                      />
                      <Metric
                        label="Utopia Progress"
                        value={formatPercent(utopiaProgress)}
                        color={utopiaProgress && utopiaProgress > 0.5 ? 'green' : 'white'}
                      />
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-xs text-white/30 mb-1">Trajectory</div>
                        <div className={`text-sm font-light ${
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

                  {/* Active Crises */}
                  <Panel title="Active Crises" glow={activeCrises.length > 2 ? 'red' : activeCrises.length > 0 ? 'amber' : undefined}>
                    {activeCrises.length === 0 ? (
                      <div className="text-white/30 text-sm">No active crises</div>
                    ) : (
                      <div className="space-y-2">
                        {activeCrises.slice(0, 5).map((crisis, idx) => (
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
                  </Panel>

                  {/* Event Stream */}
                  <Panel title="Event Stream" className="h-[300px]">
                    <div className="h-[250px] overflow-y-auto space-y-2 pr-2">
                      {events.length === 0 ? (
                        <div className="text-white/30 text-sm">Waiting for events...</div>
                      ) : (
                        events.slice().reverse().slice(0, 20).map((event, idx) => (
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
                          </div>
                        ))
                      )}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}