/**
 * Threshold Config Modal Section
 *
 * Compact version of threshold configuration for the initialization modal.
 * Shows research-backed threshold distributions with editing capability.
 */

'use client';

import { useState } from 'react';

interface ThresholdInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultMin: number;
  defaultMax: number;
  defaultMode?: number;
  type: 'Normal' | 'Beta' | 'Triangular' | 'Uniform';
  unit: string;
}

const THRESHOLDS: ThresholdInfo[] = [
  {
    id: 'climateSensitivity',
    name: 'Climate Sensitivity',
    icon: '🌍',
    description: 'Equilibrium temperature increase per CO₂ doubling. IPCC AR6: 2.5-4.0°C likely, 2.0-5.0°C very likely.',
    defaultMin: 2.0,
    defaultMax: 5.0,
    type: 'Normal',
    unit: '°C'
  },
  {
    id: 'socialCriticalMass',
    name: 'Social Critical Mass',
    icon: '👥',
    description: 'Committed minority size needed to flip majority opinion. Centola (2018): ~25% tipping point.',
    defaultMin: 0.20,
    defaultMax: 0.30,
    type: 'Normal',
    unit: ''
  },
  {
    id: 'trustRecoveryRate',
    name: 'Trust Recovery Rate',
    icon: '🛡️',
    description: 'How quickly trust recovers after failures (asymmetric - slower than loss). Meta-analysis: 0.5-3% monthly with intervention.',
    defaultMin: 0.005,
    defaultMax: 0.03,
    type: 'Beta',
    unit: '/mo'
  },
  {
    id: 'automationJobLossThreshold',
    name: 'Automation Job Loss Crisis',
    icon: '💼',
    description: 'Unemployment level at which automation-driven crises trigger. Acemoglu & Restrepo (2019): 25-45% threshold range.',
    defaultMin: 0.25,
    defaultMax: 0.45,
    type: 'Normal',
    unit: ''
  },
  {
    id: 'governmentLegitimacyCrisisThreshold',
    name: 'Gov Legitimacy Crisis',
    icon: '🏛️',
    description: 'Government legitimacy level triggering state collapse or revolution. Historical cases: Weimar, USSR, Arab Spring (25-40%).',
    defaultMin: 0.25,
    defaultMode: 0.30,
    defaultMax: 0.40,
    type: 'Triangular',
    unit: ''
  },
  {
    id: 'surveillanceDystopiaThreshold',
    name: 'Surveillance Dystopia',
    icon: '👁️',
    description: 'Surveillance intensity enabling stable authoritarian control. Historical cases: East Germany Stasi, China, North Korea (65-80%).',
    defaultMin: 0.65,
    defaultMax: 0.80,
    type: 'Uniform',
    unit: ''
  },
  {
    id: 'automationDisplacementCrisisThreshold',
    name: 'Automation Unemployment Crisis',
    icon: '📉',
    description: 'Unemployment rate triggering social crisis. Historical: Great Depression 25%, Spain youth 56%, expert estimates 40-60%.',
    defaultMin: 0.40,
    defaultMode: 0.50,
    defaultMax: 0.60,
    type: 'Triangular',
    unit: ''
  },
  {
    id: 'aiRecursiveImprovementThreshold',
    name: 'AI Recursive Improvement',
    icon: '🔄',
    description: 'Monthly capability multiplier enabling takeoff. Analogs: Moore\'s Law 1.5×/yr, AlphaGo Zero 1.5×/day. HIGHLY SPECULATIVE.',
    defaultMin: 1.2,
    defaultMax: 1.5,
    type: 'Uniform',
    unit: '×/mo'
  },
  {
    id: 'resentmentRevoltTriggerThreshold',
    name: 'Resentment Revolt',
    icon: '😡',
    description: 'Composite resentment (inequality + political exclusion + AI privilege + control erosion) triggering mass revolt. French/Russian Revolutions, Occupy, Arab Spring (60-80%).',
    defaultMin: 0.60,
    defaultMode: 0.70,
    defaultMax: 0.80,
    type: 'Triangular',
    unit: ''
  },
];

/**
 * Threshold slider positions [0.0, 1.0]
 * - 0.0 = pessimistic extreme (lowest value in distribution)
 * - 0.5 = median/mode (central estimate)
 * - 1.0 = optimistic extreme (highest value in distribution)
 */
export interface ThresholdSliders {
  [key: string]: number;
}

interface ThresholdConfigModalProps {
  sliders?: ThresholdSliders;
  onChange?: (sliders: ThresholdSliders | undefined) => void;
}

export function ThresholdConfigModal({ sliders, onChange }: ThresholdConfigModalProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSliderChange = (id: string, value: number) => {
    if (!onChange) return;

    const currentSliders = sliders || {};
    const newSliders = {
      ...currentSliders,
      [id]: value
    };

    onChange(newSliders);
  };

  const handleResetToDefaults = () => {
    onChange?.(undefined);
  };

  /**
   * Get slider position for a threshold (0.0-1.0)
   * Returns 0.5 (median) if not customized
   */
  const getSliderPosition = (id: string): number => {
    return sliders?.[id] ?? 0.5;
  };

  /**
   * Compute the actual threshold value at a given slider position
   * Uses linear interpolation (for triangular, approximate)
   */
  const computeValueAtPosition = (threshold: ThresholdInfo, position: number): number => {
    const { defaultMin, defaultMax, defaultMode } = threshold;

    // Clamp position to [0, 1]
    const p = Math.max(0, Math.min(1, position));

    // For triangular distributions with mode
    if (defaultMode !== undefined) {
      if (p <= 0.5) {
        // Left half: interpolate from min to mode
        return defaultMin + (defaultMode - defaultMin) * (p * 2);
      } else {
        // Right half: interpolate from mode to max
        return defaultMode + (defaultMax - defaultMode) * ((p - 0.5) * 2);
      }
    }

    // For uniform distributions: linear interpolation
    return defaultMin + (defaultMax - defaultMin) * p;
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === '°C') return `${value.toFixed(1)}${unit}`;
    if (unit === '/mo' || unit === '/yr') return `${(value * 100).toFixed(1)}%${unit}`;
    if (unit === '×/mo') return `${value.toFixed(2)}${unit}`;
    if (unit === '') return `${(value * 100).toFixed(0)}%`;
    return value.toFixed(2);
  };

  return (
    <div>
      <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>
        THRESHOLD UNCERTAINTY
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-cyan-400 hover:text-cyan-300"
        >
          [{expanded ? 'collapse' : 'view 9 thresholds'}]
        </button>
      </label>

      {!expanded ? (
        <div className="text-xs px-3 py-2 bg-black/50 border border-white/10 rounded" style={{ color: 'var(--white-60)' }}>
          {sliders && Object.keys(sliders).length > 0 ? (
            <>Custom slider positions - {Object.keys(sliders).length} threshold{Object.keys(sliders).length > 1 ? 's' : ''} modified</>
          ) : (
            <>Scenario-based sampling: 9 critical parameters with epistemic uncertainty</>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto px-3 py-3 bg-black/50 border border-white/10 rounded">
          {/* Reset button */}
          {sliders && Object.keys(sliders).length > 0 && (
            <div className="flex items-center justify-end pb-2 border-b" style={{ borderColor: 'var(--white-10)' }}>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-xs px-2 py-1 bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 rounded"
              >
                Reset All to Scenario
              </button>
            </div>
          )}

          {/* Threshold list */}
          {THRESHOLDS.map((threshold, idx) => {
            const sliderPosition = getSliderPosition(threshold.id);
            const computedValue = computeValueAtPosition(threshold, sliderPosition);
            const isModified = sliders?.[threshold.id] !== undefined;

            return (
              <div
                key={threshold.id}
                className="space-y-1 pb-2"
                style={{
                  borderBottom: idx < THRESHOLDS.length - 1 ? '1px solid var(--white-5)' : 'none'
                }}
              >
                {/* Threshold header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{threshold.icon}</span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--white-80)' }}
                      >
                        {threshold.name}
                      </span>
                      {isModified && <span className="text-xs text-yellow-400" title="Modified from scenario">●</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--cyan-400)' }}>
                        {formatValue(computedValue, threshold.unit)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--white-50)', lineHeight: '1.4' }}>
                    {threshold.description}
                  </p>
                </div>

                {/* Slider control */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: 'var(--white-40)', minWidth: '70px' }}>Pessimistic</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={sliderPosition}
                      onChange={(e) => handleSliderChange(threshold.id, parseFloat(e.target.value))}
                      className="flex-1"
                      style={{
                        accentColor: 'var(--cyan-500)'
                      }}
                    />
                    <span style={{ color: 'var(--white-40)', minWidth: '70px', textAlign: 'right' }}>Optimistic</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--white-50)' }}>
                    <span>{formatValue(threshold.defaultMin, threshold.unit)}</span>
                    <span>{sliderPosition === 0.5 ? 'Median' : `${(sliderPosition * 100).toFixed(0)}th percentile`}</span>
                    <span>{formatValue(threshold.defaultMax, threshold.unit)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="text-xs pt-2 mt-2 border-t" style={{ color: 'var(--white-40)', borderColor: 'var(--white-10)' }}>
            💡 Scenario sets default positions. Adjust individual sliders to override specific thresholds while keeping others scenario-based.
          </div>
        </div>
      )}
    </div>
  );
}
