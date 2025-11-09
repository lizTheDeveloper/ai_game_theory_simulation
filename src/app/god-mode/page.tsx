/**
 * God Mode Test Page
 *
 * Standalone page for testing God Mode UI without full simulation.
 */

'use client';

import { useState } from 'react';
import { GodModePanel } from '@/components/godMode';
import { GameState } from '@/types/game';

// Mock game state for testing
const mockGameState: Partial<GameState> = {
  currentMonth: 42,
  currentYear: 2028,
  government: {
    controlDesire: 0.6,
    legitimacy: 0.7,
    alignmentResearchInvestment: 3,
    safetyResearchInvestment: 2,
    oversightLevel: 4,
  } as any,
  aiAgents: [
    {
      id: 'agent-1',
      capability: 1.2,
      alignment: 0.8,
      escaped: false,
    },
    {
      id: 'agent-2',
      capability: 1.5,
      alignment: 0.6,
      escaped: false,
    },
    {
      id: 'agent-3',
      capability: 2.1,
      alignment: 0.4,
      escaped: true,
    },
  ] as any,
  society: {
    laborParticipation: 0.7,
    unemploymentLevel: 0.3,
    trustInAI: 0.5,
  } as any,
  speed: 'normal',
};

export default function GodModePage() {
  const [showPanel, setShowPanel] = useState(true);

  return (
    <main className="min-h-screen bg-black">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-light text-white tracking-wider mb-4">
          GOD MODE TEST ENVIRONMENT
        </h1>
        <p className="text-white/60 max-w-2xl">
          Test the God Mode UI with mock simulation data. All controls are functional
          but not connected to a live simulation.
        </p>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => setShowPanel(true)}
            className="px-6 py-3 text-sm font-light uppercase tracking-wider
              bg-cyan-500/20 text-cyan-400 border border-cyan-400/60
              hover:bg-cyan-500/30 transition-all duration-300 rounded-sm
              shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Open God Mode Panel
          </button>

          <button
            onClick={() => {
              console.log('Current mock state:', mockGameState);
              alert('Mock state logged to console');
            }}
            className="px-6 py-3 text-sm font-light uppercase tracking-wider
              bg-white/10 text-white/80 border border-white/40
              hover:bg-white/20 transition-all duration-300 rounded-sm"
          >
            Log Mock State
          </button>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 border border-white/20 rounded-sm bg-black/50">
            <div className="text-2xl mb-2 opacity-60">🏛️</div>
            <h3 className="text-sm font-light uppercase tracking-wider text-white/80 mb-2">
              Government State
            </h3>
            <div className="space-y-1 text-xs text-white/40">
              <div>Control Desire: 60%</div>
              <div>Legitimacy: 70%</div>
              <div>AI Investment: Level 3</div>
            </div>
          </div>

          <div className="p-6 border border-white/20 rounded-sm bg-black/50">
            <div className="text-2xl mb-2 opacity-60">🤖</div>
            <h3 className="text-sm font-light uppercase tracking-wider text-white/80 mb-2">
              AI Agents
            </h3>
            <div className="space-y-1 text-xs text-white/40">
              <div>Active Agents: 3</div>
              <div>Escaped: 1</div>
              <div>Avg Capability: 1.6</div>
            </div>
          </div>

          <div className="p-6 border border-white/20 rounded-sm bg-black/50">
            <div className="text-2xl mb-2 opacity-60">🌍</div>
            <h3 className="text-sm font-light uppercase tracking-wider text-white/80 mb-2">
              Environment
            </h3>
            <div className="space-y-1 text-xs text-white/40">
              <div>Temperature: +1.2°C</div>
              <div>CO₂: 420ppm</div>
              <div>Crisis Level: Moderate</div>
            </div>
          </div>
        </div>
      </div>

      {/* God Mode Panel */}
      {showPanel && (
        <GodModePanel
          gameState={mockGameState as GameState}
          onClose={() => setShowPanel(false)}
          onApplyChanges={() => {
            console.log('God Mode changes would be applied here');
          }}
        />
      )}
    </main>
  );
}