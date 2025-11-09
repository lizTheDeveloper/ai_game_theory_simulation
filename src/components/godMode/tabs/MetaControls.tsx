/**
 * Meta Controls Tab
 *
 * Simulation-level controls including phase management and time control.
 */

'use client';

import { useState } from 'react';
import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import { ControlSection } from '../controls/ControlSection';

interface MetaControlsProps {
  gameState: GameState | null;
  onChangeDetected: () => void;
}

const PHASE_LIST = [
  'time-advancement',
  'ai-agent-actions',
  'government-actions',
  'society-actions',
  'organization-turns',
  'crisis-detection',
  'environmental-feedback',
  'technology-progress',
  'outcome-calculation',
  'event-collection',
];

export function MetaControls({ gameState, onChangeDetected }: MetaControlsProps) {
  const [stepMode, setStepMode] = useState(false);
  const [pausedPhases, setPausedPhases] = useState<Set<string>>(new Set());

  const handleToggleStepMode = () => {
    if (stepMode) {
      godMode.disableStepMode();
    } else {
      godMode.enableStepMode();
    }
    setStepMode(!stepMode);
    onChangeDetected();
  };

  const handleTogglePhase = (phaseId: string) => {
    const newPaused = new Set(pausedPhases);
    if (pausedPhases.has(phaseId)) {
      newPaused.delete(phaseId);
      godMode.setPauseOnDecision(phaseId, false);
    } else {
      newPaused.add(phaseId);
      godMode.setPauseOnDecision(phaseId, true);
    }
    setPausedPhases(newPaused);
    onChangeDetected();
  };

  return (
    <div className="space-y-8">
      <ControlSection title="SIMULATION CONTROL" icon="⚙️">
        <div className="space-y-4">
          {/* Step Mode Toggle */}
          <div className="flex items-center justify-between p-3 border border-white/20 rounded-sm">
            <div>
              <div className="text-sm text-white/80 uppercase tracking-wider">
                Step Mode
              </div>
              <div className="text-xs text-white/40 mt-1">
                Pause between each simulation phase
              </div>
            </div>
            <button
              onClick={handleToggleStepMode}
              className={`px-4 py-2 text-sm font-light uppercase tracking-wider
                rounded-sm transition-all duration-300
                ${stepMode
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-white/10 text-white/60 border border-white/20 hover:border-white/40'
                }`}
            >
              {stepMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-between p-3 border border-white/20 rounded-sm">
            <div>
              <div className="text-sm text-white/80 uppercase tracking-wider">
                Simulation Speed
              </div>
              <div className="text-xs text-white/40 mt-1">
                Control simulation execution speed
              </div>
            </div>
            <div className="flex space-x-2">
              {['paused', 'slow', 'normal', 'fast', 'max'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    godMode.setOverride('speed', speed);
                    onChangeDetected();
                  }}
                  className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm
                    transition-all duration-300
                    ${gameState?.speed === speed
                      ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/60'
                      : 'text-white/40 border border-white/20 hover:border-white/40'
                    }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Time Jump */}
          <div className="flex items-center justify-between p-3 border border-white/20 rounded-sm">
            <div>
              <div className="text-sm text-white/80 uppercase tracking-wider">
                Time Jump
              </div>
              <div className="text-xs text-white/40 mt-1">
                Skip to specific month
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="1000"
                className="w-24 px-2 py-1 text-sm bg-black border border-white/20 rounded-sm
                  text-white/80 focus:border-cyan-400/60 focus:outline-none"
                placeholder="Month"
              />
              <button
                className="px-3 py-1 text-xs uppercase tracking-wider
                  border border-cyan-400/40 text-cyan-400/80
                  hover:border-cyan-400/60 hover:text-cyan-400
                  transition-all duration-300 rounded-sm"
              >
                Jump
              </button>
            </div>
          </div>
        </div>
      </ControlSection>

      <ControlSection title="PHASE CONTROL" icon="🔄">
        <div className="space-y-2">
          <div className="text-xs text-white/40 mb-3">
            Select phases to pause on (requires step mode)
          </div>
          {PHASE_LIST.map((phase) => (
            <label
              key={phase}
              className={`flex items-center justify-between p-2 border rounded-sm
                cursor-pointer transition-all duration-300
                ${pausedPhases.has(phase)
                  ? 'border-amber-400/40 bg-amber-400/10'
                  : 'border-white/10 hover:border-white/20'
                }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={pausedPhases.has(phase)}
                  onChange={() => handleTogglePhase(phase)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
                  ${pausedPhases.has(phase)
                    ? 'border-amber-400 bg-amber-400/20'
                    : 'border-white/40'
                  }`}
                >
                  {pausedPhases.has(phase) && (
                    <div className="w-2 h-2 bg-amber-400 rounded-sm" />
                  )}
                </div>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  {phase}
                </span>
              </div>
              {pausedPhases.has(phase) && (
                <span className="text-xs text-amber-400">PAUSE</span>
              )}
            </label>
          ))}
        </div>
      </ControlSection>

      <ControlSection title="DEBUG OPTIONS" icon="🐛">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              godMode.setOverride('debug.logAll', true);
              onChangeDetected();
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-white/40 text-white/80
              hover:border-white/60 hover:text-white
              transition-all duration-300 rounded-sm"
          >
            Enable Verbose Logging
          </button>

          <button
            onClick={() => {
              godMode.setOverride('debug.disableRng', true);
              onChangeDetected();
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-white/40 text-white/80
              hover:border-white/60 hover:text-white
              transition-all duration-300 rounded-sm"
          >
            Deterministic Mode
          </button>

          <button
            onClick={() => {
              console.log('Current GameState:', gameState);
              alert('GameState logged to console');
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-cyan-400/40 text-cyan-400/80
              hover:border-cyan-400/60 hover:text-cyan-400
              transition-all duration-300 rounded-sm"
          >
            Dump State
          </button>

          <button
            onClick={() => {
              const overrides = godMode['overrides'];
              console.log('Active Overrides:', Array.from(overrides.entries()));
              alert(`${overrides.size} overrides logged to console`);
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-cyan-400/40 text-cyan-400/80
              hover:border-cyan-400/60 hover:text-cyan-400
              transition-all duration-300 rounded-sm"
          >
            Show Overrides
          </button>
        </div>
      </ControlSection>
    </div>
  );
}