/**
 * Government Controls Tab
 *
 * Manual control over government decisions, policies, and priorities.
 */

'use client';

import { useState, useCallback } from 'react';
import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import { GlowSlider } from '../controls/GlowSlider';
import { ControlSection } from '../controls/ControlSection';
import { RadioGroup } from '../controls/RadioGroup';

interface GovernmentControlsProps {
  gameState: GameState | null;
  onChangeDetected: () => void;
}

export function GovernmentControls({ gameState, onChangeDetected }: GovernmentControlsProps) {
  const [policyOverrides, setPolicyOverrides] = useState<Record<string, any>>({});

  const handleSliderChange = useCallback((path: string, value: number) => {
    godMode.setOverride(path, value);
    setPolicyOverrides(prev => ({ ...prev, [path]: value }));
    onChangeDetected();
  }, [onChangeDetected]);

  const handleChoiceChange = useCallback((path: string, value: string) => {
    godMode.setOverride(path, value);
    setPolicyOverrides(prev => ({ ...prev, [path]: value }));
    onChangeDetected();
  }, [onChangeDetected]);

  const currentValues = {
    controlDesire: gameState?.government?.controlDesire ?? 0.5,
    legitimacy: gameState?.government?.legitimacy ?? 0.7,
    alignmentInvestment: gameState?.government?.alignmentResearchInvestment ?? 0,
    safetyInvestment: gameState?.government?.safetyResearchInvestment ?? 0,
    oversightLevel: gameState?.government?.oversightLevel ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Policy Actions Section */}
      <ControlSection title="POLICY ACTIONS" icon="📜">
        <div className="space-y-6">
          {/* UBI Implementation */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 uppercase tracking-wider">
              Universal Basic Income Policy
            </label>
            <RadioGroup
              name="ubi-policy"
              options={[
                { value: 'none', label: 'NO UBI', description: 'Let market forces prevail' },
                { value: 'means_tested', label: 'MEANS-TESTED', description: 'Support only those in need' },
                { value: 'job_guarantee', label: 'JOB GUARANTEE', description: 'Provide work, not handouts' },
                { value: 'generous', label: 'GENEROUS UBI', description: 'Full income replacement' }
              ]}
              value={policyOverrides['government.ubiPolicy'] || 'none'}
              onChange={(value) => handleChoiceChange('government.ubiPolicy', value)}
            />
          </div>

          {/* AI Regulation */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 uppercase tracking-wider">
              AI Regulation Approach
            </label>
            <RadioGroup
              name="ai-regulation"
              options={[
                { value: 'none', label: 'NO REGULATION', description: 'Free market innovation' },
                { value: 'large_companies', label: 'LARGE COMPANIES', description: 'Target big tech only' },
                { value: 'compute_threshold', label: 'COMPUTE THRESHOLD', description: 'Regulate by compute power' },
                { value: 'capability_ceiling', label: 'CAPABILITY CEILING', description: 'Hard limits on AI power' }
              ]}
              value={policyOverrides['government.regulationApproach'] || 'none'}
              onChange={(value) => handleChoiceChange('government.regulationApproach', value)}
            />
          </div>
        </div>
      </ControlSection>

      {/* Priority Weights Section */}
      <ControlSection title="PRIORITY WEIGHTS" icon="⚖️">
        <div className="grid grid-cols-2 gap-6">
          <GlowSlider
            label="Control Desire"
            value={policyOverrides['government.controlDesire'] ?? currentValues.controlDesire}
            onChange={(value) => handleSliderChange('government.controlDesire', value)}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            severity={currentValues.controlDesire > 0.7 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Legitimacy"
            value={policyOverrides['government.legitimacy'] ?? currentValues.legitimacy}
            onChange={(value) => handleSliderChange('government.legitimacy', value)}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            severity={currentValues.legitimacy < 0.3 ? 'critical' : 'normal'}
          />

          <GlowSlider
            label="Unemployment Response"
            value={policyOverrides['government.unemploymentWeight'] ?? 15}
            onChange={(value) => handleSliderChange('government.unemploymentWeight', value)}
            min={0}
            max={50}
            step={1}
            displayValue={(v) => `${v}x`}
          />

          <GlowSlider
            label="AI Threat Response"
            value={policyOverrides['government.threatWeight'] ?? 5}
            onChange={(value) => handleSliderChange('government.threatWeight', value)}
            min={0}
            max={20}
            step={1}
            displayValue={(v) => `${v}x`}
          />

          <GlowSlider
            label="Climate Priority"
            value={policyOverrides['government.climatePriority'] ?? 0.5}
            onChange={(value) => handleSliderChange('government.climatePriority', value)}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
            severity={currentValues.climatePriority < 0.3 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="International Cooperation"
            value={policyOverrides['government.cooperationLevel'] ?? 0.5}
            onChange={(value) => handleSliderChange('government.cooperationLevel', value)}
            min={0}
            max={1}
            step={0.01}
            displayValue={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
      </ControlSection>

      {/* Investment Levels Section */}
      <ControlSection title="RESEARCH INVESTMENTS" icon="🔬">
        <div className="grid grid-cols-3 gap-6">
          <GlowSlider
            label="Alignment Research"
            value={policyOverrides['government.alignmentResearchInvestment'] ?? currentValues.alignmentInvestment}
            onChange={(value) => handleSliderChange('government.alignmentResearchInvestment', value)}
            min={0}
            max={10}
            step={1}
            displayValue={(v) => `Level ${v}`}
            severity={currentValues.alignmentInvestment < 3 && gameState?.aiAgents?.length > 0 ? 'warning' : 'normal'}
          />

          <GlowSlider
            label="Safety Research"
            value={policyOverrides['government.safetyResearchInvestment'] ?? currentValues.safetyInvestment}
            onChange={(value) => handleSliderChange('government.safetyResearchInvestment', value)}
            min={0}
            max={10}
            step={1}
            displayValue={(v) => `Level ${v}`}
          />

          <GlowSlider
            label="Oversight Framework"
            value={policyOverrides['government.oversightLevel'] ?? currentValues.oversightLevel}
            onChange={(value) => handleSliderChange('government.oversightLevel', value)}
            min={0}
            max={10}
            step={1}
            displayValue={(v) => `Level ${v}`}
          />
        </div>
      </ControlSection>

      {/* Action Queue Section */}
      <ControlSection title="ACTION QUEUE" icon="📋">
        <div className="space-y-4">
          <div className="text-sm text-white/40">
            Queue specific government actions to execute on next simulation step
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                // Queue a specific action
                // godMode.queueGovernmentAction(action);
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-cyan-400/40 text-cyan-400/80 hover:border-cyan-400/60
                hover:text-cyan-400 transition-all duration-300 rounded-sm
                hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              QUEUE UBI IMPLEMENTATION
            </button>
            <button
              onClick={() => {
                // Queue a specific action
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-cyan-400/40 text-cyan-400/80 hover:border-cyan-400/60
                hover:text-cyan-400 transition-all duration-300 rounded-sm
                hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              QUEUE AI REGULATION
            </button>
            <button
              onClick={() => {
                // Queue a specific action
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-cyan-400/40 text-cyan-400/80 hover:border-cyan-400/60
                hover:text-cyan-400 transition-all duration-300 rounded-sm
                hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              DECLARE EMERGENCY
            </button>
            <button
              onClick={() => {
                // Queue a specific action
                onChangeDetected();
              }}
              className="px-4 py-2 text-sm font-light uppercase tracking-wider
                border border-cyan-400/40 text-cyan-400/80 hover:border-cyan-400/60
                hover:text-cyan-400 transition-all duration-300 rounded-sm
                hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              INTERNATIONAL SUMMIT
            </button>
          </div>
        </div>
      </ControlSection>

      {/* Current State Display */}
      <ControlSection title="CURRENT STATE" icon="📊">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-white/40 uppercase tracking-wider">Control Desire</div>
            <div className="text-2xl font-light text-white tabular-nums">
              {(currentValues.controlDesire * 100).toFixed(0)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-white/40 uppercase tracking-wider">Legitimacy</div>
            <div className="text-2xl font-light text-white tabular-nums">
              {(currentValues.legitimacy * 100).toFixed(0)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-white/40 uppercase tracking-wider">AI Investment</div>
            <div className="text-2xl font-light text-white tabular-nums">
              Level {currentValues.alignmentInvestment}
            </div>
          </div>
        </div>
      </ControlSection>
    </div>
  );
}