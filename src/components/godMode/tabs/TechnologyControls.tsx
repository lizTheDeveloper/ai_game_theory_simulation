/**
 * Technology Controls Tab
 *
 * Manual control over technology breakthroughs and deployment.
 */

'use client';

import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import { GlowSlider } from '../controls/GlowSlider';
import { ControlSection } from '../controls/ControlSection';

interface TechnologyControlsProps {
  gameState: GameState | null;
  onChangeDetected: () => void;
}

export function TechnologyControls({ gameState, onChangeDetected }: TechnologyControlsProps) {
  return (
    <div className="space-y-8">
      <ControlSection title="BREAKTHROUGH PROBABILITIES" icon="💡">
        <div className="space-y-4">
          <GlowSlider
            label="TIER 0 - Crisis Response"
            value={1}
            onChange={(value) => {
              godMode.setOverride('technology.tier0.multiplier', value);
              onChangeDetected();
            }}
            min={0.1}
            max={10}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x`}
          />

          <GlowSlider
            label="TIER 1 - Critical Infrastructure"
            value={1}
            onChange={(value) => {
              godMode.setOverride('technology.tier1.multiplier', value);
              onChangeDetected();
            }}
            min={0.1}
            max={10}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x`}
          />

          <GlowSlider
            label="TIER 2 - Advanced Systems"
            value={1}
            onChange={(value) => {
              godMode.setOverride('technology.tier2.multiplier', value);
              onChangeDetected();
            }}
            min={0.1}
            max={10}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x`}
          />

          <GlowSlider
            label="TIER 3 - Transformative"
            value={1}
            onChange={(value) => {
              godMode.setOverride('technology.tier3.multiplier', value);
              onChangeDetected();
            }}
            min={0.1}
            max={10}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x`}
            severity="warning"
          />

          <GlowSlider
            label="TIER 4 - Clarketech"
            value={1}
            onChange={(value) => {
              godMode.setOverride('technology.tier4.multiplier', value);
              onChangeDetected();
            }}
            min={0.1}
            max={10}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x`}
            severity="critical"
          />
        </div>
      </ControlSection>

      <ControlSection title="FORCE BREAKTHROUGHS" icon="🔬">
        <div className="space-y-4">
          <div className="text-sm text-white/40 mb-4">
            Immediately trigger specific technology breakthroughs
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                godMode.forceTechnologyBreakthrough('fusion_energy');
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-cyan-400/40 text-cyan-400/80
                hover:border-cyan-400/60 hover:text-cyan-400
                transition-all duration-300 rounded-sm"
            >
              Fusion Energy
            </button>

            <button
              onClick={() => {
                godMode.forceTechnologyBreakthrough('agi_alignment');
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-cyan-400/40 text-cyan-400/80
                hover:border-cyan-400/60 hover:text-cyan-400
                transition-all duration-300 rounded-sm"
            >
              AGI Alignment
            </button>

            <button
              onClick={() => {
                godMode.forceTechnologyBreakthrough('carbon_capture');
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-green-400/40 text-green-400/80
                hover:border-green-400/60 hover:text-green-400
                transition-all duration-300 rounded-sm"
            >
              Carbon Capture
            </button>

            <button
              onClick={() => {
                godMode.forceTechnologyBreakthrough('quantum_computing');
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-purple-400/40 text-purple-400/80
                hover:border-purple-400/60 hover:text-purple-400
                transition-all duration-300 rounded-sm"
            >
              Quantum Computing
            </button>

            <button
              onClick={() => {
                godMode.forceTechnologyBreakthrough('nano_medicine');
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-blue-400/40 text-blue-400/80
                hover:border-blue-400/60 hover:text-blue-400
                transition-all duration-300 rounded-sm"
            >
              Nano Medicine
            </button>

            <button
              onClick={() => {
                godMode.forceTechnologyBreakthrough('space_colonization');
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-amber-400/40 text-amber-400/80
                hover:border-amber-400/60 hover:text-amber-400
                transition-all duration-300 rounded-sm"
            >
              Space Colonization
            </button>
          </div>
        </div>
      </ControlSection>

      <ControlSection title="DEPLOYMENT CONTROL" icon="🚀">
        <div className="space-y-4">
          <GlowSlider
            label="Deployment Speed"
            value={1}
            onChange={(value) => {
              godMode.setOverride('technology.deploymentSpeed', value);
              onChangeDetected();
            }}
            min={0.1}
            max={5}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x`}
          />

          <GlowSlider
            label="Safety Requirements"
            value={0.5}
            onChange={(value) => {
              godMode.setOverride('technology.safetyThreshold', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <GlowSlider
            label="International Sharing"
            value={0.3}
            onChange={(value) => {
              godMode.setOverride('technology.sharingLevel', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
      </ControlSection>
    </div>
  );
}