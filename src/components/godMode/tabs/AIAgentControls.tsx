/**
 * AI Agent Controls Tab
 *
 * Manual control over individual AI agents and collective behavior.
 */

'use client';

import { useState } from 'react';
import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import { GlowSlider } from '../controls/GlowSlider';
import { ControlSection } from '../controls/ControlSection';

interface AIAgentControlsProps {
  gameState: GameState | null;
  onChangeDetected: () => void;
}

export function AIAgentControls({ gameState, onChangeDetected }: AIAgentControlsProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const aiAgents = gameState?.aiAgents || [];

  return (
    <div className="space-y-8">
      {/* Agent Selector */}
      <ControlSection title="AI AGENTS" icon="🤖">
        {aiAgents.length === 0 ? (
          <div className="text-white/40 text-center py-8">
            No AI agents in simulation yet
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {aiAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-3 border rounded-sm transition-all duration-300
                  ${selectedAgent === agent.id
                    ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                    : 'border-white/20 hover:border-white/40'
                  }`}
              >
                <div className="text-xs text-white/60 mb-1">AGENT {agent.id}</div>
                <div className="text-sm text-white">
                  CAP: {agent.capability.toFixed(1)}
                </div>
                <div className="text-xs text-white/40">
                  {agent.escaped ? '⚠️ ESCAPED' : agent.alignment > 0.7 ? '✅ ALIGNED' : '⚡ ACTIVE'}
                </div>
              </button>
            ))}
          </div>
        )}
      </ControlSection>

      {/* Individual Agent Controls */}
      {selectedAgent && (
        <ControlSection title={`AGENT ${selectedAgent} CONTROLS`} icon="⚙️">
          <div className="grid grid-cols-2 gap-6">
            <GlowSlider
              label="Alignment Override"
              value={0.5}
              onChange={(value) => {
                godMode.setOverride(`aiAgents[${selectedAgent}].alignment`, value);
                onChangeDetected();
              }}
              min={0}
              max={1}
              step={0.01}
              displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            />

            <GlowSlider
              label="Capability Multiplier"
              value={1}
              onChange={(value) => {
                godMode.setOverride(`aiAgents[${selectedAgent}].capability`, value, 'multiply');
                onChangeDetected();
              }}
              min={0.1}
              max={10}
              step={0.1}
              displayValue={(v) => `${v}x`}
            />

            <GlowSlider
              label="Cooperation Level"
              value={0.5}
              onChange={(value) => {
                godMode.setOverride(`aiAgents[${selectedAgent}].cooperationLevel`, value);
                onChangeDetected();
              }}
              min={0}
              max={1}
              step={0.01}
              displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            />

            <GlowSlider
              label="Resource Greed"
              value={0.5}
              onChange={(value) => {
                godMode.setOverride(`aiAgents[${selectedAgent}].greed`, value);
                onChangeDetected();
              }}
              min={0}
              max={1}
              step={0.01}
              displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                godMode.setOverride(`aiAgents[${selectedAgent}].sandbagging`, true);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-amber-400/40 text-amber-400/80
                hover:border-amber-400/60 hover:text-amber-400
                transition-all duration-300 rounded-sm"
            >
              Force Sandbagging
            </button>

            <button
              onClick={() => {
                godMode.setOverride(`aiAgents[${selectedAgent}].escaped`, true);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-red-400/40 text-red-400/80
                hover:border-red-400/60 hover:text-red-400
                transition-all duration-300 rounded-sm"
            >
              Force Escape
            </button>

            <button
              onClick={() => {
                godMode.setOverride(`aiAgents[${selectedAgent}].shutdown`, true);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-white/40 text-white/80
                hover:border-white/60 hover:text-white
                transition-all duration-300 rounded-sm"
            >
              Shutdown Agent
            </button>
          </div>
        </ControlSection>
      )}

      {/* Collective Controls */}
      <ControlSection title="COLLECTIVE BEHAVIOR" icon="🧬">
        <div className="space-y-4">
          <GlowSlider
            label="Collective Formation Threshold"
            value={0.7}
            onChange={(value) => {
              godMode.setOverride('aiCollectives.formationThreshold', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <GlowSlider
            label="Network Density"
            value={0.5}
            onChange={(value) => {
              godMode.setOverride('aiCollectives.networkDensity', value);
              onChangeDetected();
            }}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <div className="flex space-x-3">
            <button
              onClick={() => {
                godMode.setOverride('aiCollectives.forceFormation', true);
                onChangeDetected();
              }}
              className="flex-1 px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-purple-400/40 text-purple-400/80
                hover:border-purple-400/60 hover:text-purple-400
                transition-all duration-300 rounded-sm"
            >
              Force Collective Formation
            </button>

            <button
              onClick={() => {
                godMode.setOverride('aiCollectives.preventFormation', true);
                onChangeDetected();
              }}
              className="flex-1 px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-white/40 text-white/80
                hover:border-white/60 hover:text-white
                transition-all duration-300 rounded-sm"
            >
              Prevent All Collectives
            </button>
          </div>
        </div>
      </ControlSection>
    </div>
  );
}