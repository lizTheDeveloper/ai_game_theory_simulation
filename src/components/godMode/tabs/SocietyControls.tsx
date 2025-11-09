/**
 * Society Controls Tab
 *
 * Manual control over society responses and social cohesion.
 */

'use client';

import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import { GlowSlider } from '../controls/GlowSlider';
import { ControlSection } from '../controls/ControlSection';

interface SocietyControlsProps {
  gameState: GameState | null;
  onChangeDetected: () => void;
}

export function SocietyControls({ gameState, onChangeDetected }: SocietyControlsProps) {
  return (
    <div className="space-y-8">
      <ControlSection title="POPULATION RESPONSES" icon="🤝">
        <div className="grid grid-cols-2 gap-6">
          <GlowSlider
            label="Labor Participation"
            value={gameState?.society?.laborParticipation || 0.7}
            onChange={(value) => {
              godMode.setSocietyResponse('laborParticipation', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <GlowSlider
            label="Protest Threshold"
            value={0.5}
            onChange={(value) => {
              godMode.setSocietyResponse('protestThreshold', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            severity={0.3 < 0.3 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Technology Adoption Rate"
            value={0.5}
            onChange={(value) => {
              godMode.setSocietyResponse('techAdoption', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <GlowSlider
            label="Political Engagement"
            value={0.5}
            onChange={(value) => {
              godMode.setSocietyResponse('politicalEngagement', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
      </ControlSection>

      <ControlSection title="SOCIAL COHESION" icon="🔗">
        <div className="grid grid-cols-2 gap-6">
          <GlowSlider
            label="Trust in AI"
            value={gameState?.society?.trustInAI || 0.5}
            onChange={(value) => {
              godMode.setSocietyResponse('trustInAI', value);
              onChangeDetected();
            }}
            min={-1}
            max={1}
            step={0.01}
            displayValue={(v) => v >= 0 ? `+${(v * 100).toFixed(0)}%` : `${(v * 100).toFixed(0)}%`}
            severity={-1 < -0.5 ? 'critical' : -1 < 0 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Institutional Trust"
            value={0.6}
            onChange={(value) => {
              godMode.setSocietyResponse('institutionalTrust', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            severity={0.6 < 0.3 ? 'critical' : 'normal'}
          />

          <GlowSlider
            label="Social Solidarity"
            value={0.5}
            onChange={(value) => {
              godMode.setSocietyResponse('socialSolidarity', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <GlowSlider
            label="Meaning & Purpose"
            value={0.5}
            onChange={(value) => {
              godMode.setSocietyResponse('meaning', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            severity={0.5 < 0.3 ? 'warning' : 'normal'}
          />
        </div>
      </ControlSection>

      <ControlSection title="CRISIS RESPONSES" icon="🚨">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                godMode.setSocietyResponse('panicMode', 1);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-red-400/40 text-red-400/80
                hover:border-red-400/60 hover:text-red-400
                transition-all duration-300 rounded-sm"
            >
              Trigger Panic
            </button>

            <button
              onClick={() => {
                godMode.setSocietyResponse('massProtest', 1);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-amber-400/40 text-amber-400/80
                hover:border-amber-400/60 hover:text-amber-400
                transition-all duration-300 rounded-sm"
            >
              Mass Protests
            </button>

            <button
              onClick={() => {
                godMode.setSocietyResponse('solidarity', 1);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-green-400/40 text-green-400/80
                hover:border-green-400/60 hover:text-green-400
                transition-all duration-300 rounded-sm"
            >
              Unity Response
            </button>
          </div>
        </div>
      </ControlSection>
    </div>
  );
}