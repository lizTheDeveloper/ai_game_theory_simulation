/**
 * Environment Controls Tab
 *
 * Manual control over environmental parameters and planetary boundaries.
 */

'use client';

import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import { GlowSlider } from '../controls/GlowSlider';
import { ControlSection } from '../controls/ControlSection';

interface EnvironmentControlsProps {
  gameState: GameState | null;
  onChangeDetected: () => void;
}

export function EnvironmentControls({ gameState, onChangeDetected }: EnvironmentControlsProps) {
  return (
    <div className="space-y-8">
      <ControlSection title="PLANETARY BOUNDARIES" icon="🌍">
        <div className="grid grid-cols-2 gap-6">
          <GlowSlider
            label="Temperature Anomaly"
            value={1.2}
            onChange={(value) => {
              godMode.overridePlanetaryBoundary('temperature', value);
              onChangeDetected();
            }}
            min={0}
            max={6}
            step={0.1}
            displayValue={(v) => `+${v.toFixed(1)}°C`}
            severity={1.2 > 2 ? 'critical' : 1.2 > 1.5 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Ocean Acidification"
            value={8.0}
            onChange={(value) => {
              godMode.overridePlanetaryBoundary('oceanPH', value);
              onChangeDetected();
            }}
            min={7.0}
            max={8.3}
            step={0.01}
            displayValue={(v) => `pH ${v.toFixed(2)}`}
            severity={8.0 < 7.8 ? 'critical' : 8.0 < 7.95 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Biodiversity Loss"
            value={30}
            onChange={(value) => {
              godMode.overridePlanetaryBoundary('biodiversity', value);
              onChangeDetected();
            }}
            min={0}
            max={100}
            step={1}
            displayValue={(v) => `${v.toFixed(0)}% lost`}
            severity={30 > 50 ? 'critical' : 30 > 30 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Freshwater Depletion"
            value={2000}
            onChange={(value) => {
              godMode.overridePlanetaryBoundary('freshwater', value);
              onChangeDetected();
            }}
            min={0}
            max={5000}
            step={50}
            displayValue={(v) => `${v} km³/yr`}
            severity={2000 > 4000 ? 'critical' : 2000 > 2800 ? 'warning' : 'normal'}
          />
        </div>
      </ControlSection>

      <ControlSection title="CLIMATE PARAMETERS" icon="🌡️">
        <div className="grid grid-cols-2 gap-6">
          <GlowSlider
            label="CO₂ Emissions Rate"
            value={36}
            onChange={(value) => {
              godMode.setEnvironmentalParameter('co2EmissionsRate', value);
              onChangeDetected();
            }}
            min={0}
            max={100}
            step={1}
            displayValue={(v) => `${v} GtCO₂/yr`}
          />

          <GlowSlider
            label="Arctic Ice Coverage"
            value={40}
            onChange={(value) => {
              godMode.setEnvironmentalParameter('arcticIce', value);
              onChangeDetected();
            }}
            min={0}
            max={100}
            step={1}
            displayValue={(v) => `${v}%`}
            severity={40 < 20 ? 'critical' : 40 < 40 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Extreme Weather Frequency"
            value={1.5}
            onChange={(value) => {
              godMode.setEnvironmentalParameter('extremeWeatherMultiplier', value);
              onChangeDetected();
            }}
            min={0.5}
            max={5}
            step={0.1}
            displayValue={(v) => `${v.toFixed(1)}x baseline`}
          />

          <GlowSlider
            label="Sea Level Rise"
            value={0.3}
            onChange={(value) => {
              godMode.setEnvironmentalParameter('seaLevelRise', value);
              onChangeDetected();
            }}
            min={0}
            max={5}
            step={0.1}
            displayValue={(v) => `+${v.toFixed(1)}m`}
            severity={0.3 > 1 ? 'critical' : 0.3 > 0.5 ? 'warning' : 'normal'}
          />
        </div>
      </ControlSection>

      <ControlSection title="CRISIS TRIGGERS" icon="⚠️">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              godMode.triggerCrisis('climate_tipping', 1);
              onChangeDetected();
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-red-400/40 text-red-400/80
              hover:border-red-400/60 hover:text-red-400
              transition-all duration-300 rounded-sm"
          >
            Climate Tipping Point
          </button>

          <button
            onClick={() => {
              godMode.triggerCrisis('ecosystem_collapse', 0.8);
              onChangeDetected();
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-amber-400/40 text-amber-400/80
              hover:border-amber-400/60 hover:text-amber-400
              transition-all duration-300 rounded-sm"
          >
            Ecosystem Collapse
          </button>

          <button
            onClick={() => {
              godMode.preventCrisis('all_environmental');
              onChangeDetected();
            }}
            className="px-4 py-2 text-sm font-light uppercase tracking-wider
              border border-green-400/40 text-green-400/80
              hover:border-green-400/60 hover:text-green-400
              transition-all duration-300 rounded-sm"
          >
            Stabilize Environment
          </button>
        </div>
      </ControlSection>
    </div>
  );
}