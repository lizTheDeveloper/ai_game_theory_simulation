/**
 * Quality of Life Detail Panel
 *
 * Drill-down panel showing 17-dimensional QoL breakdown across 6 tiers.
 * Displays individual indicators with progress bars and 12-month sparklines.
 *
 * Tiers:
 * - Tier 0: Survival Fundamentals (4 indicators)
 * - Tier 1: Basic Needs (3 indicators)
 * - Tier 2: Psychological (4 indicators)
 * - Tier 3: Social (4 indicators)
 * - Tier 4: Health & Longevity (3 indicators)
 * - Tier 5: Environmental (3 indicators)
 * - Tier 6: Distribution (Elysium detection)
 */

'use client'

import { useEffect, useRef } from 'react';
import type { StateDelta } from '@/lib/simulationWorkerClient';

interface QoLDetailPanelProps {
  data: StateDelta;
  onClose: () => void;
}

interface TierSection {
  name: string;
  description: string;
  indicators: Array<{
    name: string;
    value: number;
    max: number;
    unit: string;
    historyKey: keyof NonNullable<StateDelta['history']> | null;
    isInverted?: boolean;  // True if lower is better (e.g., pollution, disease burden)
  }>;
}

export function QoLDetailPanel({ data, onClose }: QoLDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const qol = data.qualityOfLifeBreakdown;
  if (!qol) {
    return null;
  }

  // Define tier structure
  const tiers: TierSection[] = [
    {
      name: 'Tier 0: Survival Fundamentals',
      description: 'Basic survival requirements - cannot be averaged away',
      indicators: [
        { name: 'Food Security', value: qol.survivalFundamentals.foodSecurity, max: 1.5, unit: '', historyKey: 'qolTier0Avg' },
        { name: 'Water Security', value: qol.survivalFundamentals.waterSecurity, max: 1.5, unit: '', historyKey: null },
        { name: 'Thermal Habitability', value: qol.survivalFundamentals.thermalHabitability, max: 1, unit: '', historyKey: null },
        { name: 'Shelter Security', value: qol.survivalFundamentals.shelterSecurity, max: 1, unit: '', historyKey: null },
      ],
    },
    {
      name: 'Tier 1: Basic Needs',
      description: 'Material goods, energy, and physical safety',
      indicators: [
        { name: 'Material Abundance', value: qol.basicNeeds.materialAbundance, max: 2, unit: '', historyKey: 'qolTier1Avg' },
        { name: 'Energy Availability', value: qol.basicNeeds.energyAvailability, max: 2, unit: '', historyKey: null },
        { name: 'Physical Safety', value: qol.basicNeeds.physicalSafety, max: 1, unit: '', historyKey: null },
      ],
    },
    {
      name: 'Tier 2: Psychological Needs',
      description: 'Mental health, meaning, social connection, autonomy',
      indicators: [
        { name: 'Mental Health', value: qol.psychological.mentalHealth, max: 1, unit: '', historyKey: 'qolTier2Avg' },
        { name: 'Meaning & Purpose', value: qol.psychological.meaningAndPurpose, max: 1, unit: '', historyKey: null },
        { name: 'Social Connection', value: qol.psychological.socialConnection, max: 1, unit: '', historyKey: null },
        { name: 'Autonomy', value: qol.psychological.autonomy, max: 1, unit: '', historyKey: null },
      ],
    },
    {
      name: 'Tier 3: Social Needs',
      description: 'Political freedom, information integrity, community, culture',
      indicators: [
        { name: 'Political Freedom', value: qol.social.politicalFreedom, max: 1, unit: '', historyKey: 'qolTier3Avg' },
        { name: 'Information Integrity', value: qol.social.informationIntegrity, max: 1, unit: '', historyKey: null },
        { name: 'Community Strength', value: qol.social.communityStrength, max: 1, unit: '', historyKey: null },
        { name: 'Cultural Vitality', value: qol.social.culturalVitality, max: 1, unit: '', historyKey: null },
      ],
    },
    {
      name: 'Tier 4: Health & Longevity',
      description: 'Healthcare quality, longevity gains, disease burden',
      indicators: [
        { name: 'Healthcare Quality', value: qol.healthLongevity.healthcareQuality, max: 1, unit: '', historyKey: 'qolTier4Avg' },
        { name: 'Longevity Gains', value: qol.healthLongevity.longevityGains, max: 2, unit: '', historyKey: null },
        { name: 'Disease Burden', value: qol.healthLongevity.diseasesBurden, max: 1, unit: '', historyKey: null, isInverted: true },
      ],
    },
    {
      name: 'Tier 5: Environmental',
      description: 'Ecosystem health, climate stability, pollution levels',
      indicators: [
        { name: 'Ecosystem Health', value: qol.environmental.ecosystemHealth, max: 1, unit: '', historyKey: 'qolTier5Avg' },
        { name: 'Climate Stability', value: qol.environmental.climateStability, max: 1, unit: '', historyKey: null },
        { name: 'Pollution Level', value: qol.environmental.pollutionLevel, max: 1, unit: '', historyKey: null, isInverted: true },
      ],
    },
  ];

  // Render mini sparkline for tier average
  const renderSparkline = (historyKey: keyof NonNullable<StateDelta['history']> | null) => {
    if (!historyKey || !data.history) return null;

    const history = data.history[historyKey] as number[] | undefined;
    if (!history || history.length === 0) return null;

    const max = Math.max(...history, 0.1); // Avoid division by zero
    const width = 60;
    const height = 20;
    const points = history.map((val, i) => {
      const x = (i / Math.max(history.length - 1, 1)) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block ml-2">
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>
    );
  };

  // Get color for indicator value
  const getIndicatorColor = (value: number, max: number, isInverted?: boolean) => {
    const normalizedValue = value / max;
    const threshold = isInverted ? 1 - normalizedValue : normalizedValue;

    if (threshold >= 0.7) return 'var(--color-green)';
    if (threshold >= 0.5) return 'var(--color-cyan)';
    if (threshold >= 0.3) return 'var(--color-amber)';
    return 'var(--color-red)';
  };

  // Elysium pattern detection
  const hasElysiumPattern = qol.distribution.isDystopicInequality;
  const hasRegionalDystopia = qol.distribution.isRegionalDystopia;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative h-full w-full max-w-3xl animate-slide-in-right overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-near-black)',
          borderLeft: '1px solid var(--white-20)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 border-b"
          style={{
            backgroundColor: 'var(--color-pure-black)',
            borderColor: 'var(--white-20)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-light">Quality of Life Breakdown</h2>
            <button
              onClick={onClose}
              className="text-2xl opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--white-80)' }}
            >
              ×
            </button>
          </div>
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            17 dimensions across 6 tiers • {data.currentMonth} months
          </p>

          {/* Elysium Alert */}
          {(hasElysiumPattern || hasRegionalDystopia) && (
            <div
              className="mt-4 p-3 rounded"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-red)',
              }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-red)' }}>
                    {hasElysiumPattern ? 'Elysium Pattern Detected' : 'Regional Dystopia'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--white-60)' }}>
                    {hasElysiumPattern
                      ? 'Elite prosperity while masses suffer - extreme inequality'
                      : '>30% of population in crisis zones while others thrive'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tier Sections */}
          {tiers.map((tier, tierIdx) => (
            <div
              key={tierIdx}
              className="p-4 rounded"
              style={{
                backgroundColor: 'var(--color-pure-black)',
                border: '1px solid var(--white-10)',
              }}
            >
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--white-90)' }}>
                    {tier.name}
                  </h3>
                  {tier.indicators[0].historyKey && renderSparkline(tier.indicators[0].historyKey)}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  {tier.description}
                </p>
              </div>

              {/* Indicators */}
              <div className="space-y-3">
                {tier.indicators.map((indicator, idx) => {
                  const displayValue = indicator.isInverted
                    ? (indicator.max - indicator.value)  // Invert for display
                    : indicator.value;
                  const percentage = (displayValue / indicator.max) * 100;
                  const color = getIndicatorColor(indicator.value, indicator.max, indicator.isInverted);

                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-1 text-xs">
                        <span style={{ color: 'var(--white-70)' }}>{indicator.name}</span>
                        <span style={{ color: 'var(--white-90)' }} className="font-semibold">
                          {indicator.value.toFixed(2)}{indicator.unit} / {indicator.max}{indicator.unit}
                          {indicator.isInverted && ' (lower is better)'}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded"
                        style={{ backgroundColor: 'var(--white-10)' }}
                      >
                        <div
                          className="h-full rounded transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, percentage))}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Tier 6: Distribution (Elysium Detection) */}
          <div
            className="p-4 rounded"
            style={{
              backgroundColor: 'var(--color-pure-black)',
              border: `1px solid ${hasElysiumPattern ? 'var(--color-red)' : 'var(--white-10)'}`,
            }}
          >
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'var(--white-90)' }}>
                  Tier 6: Distribution & Inequality
                </h3>
                {renderSparkline('qolGini')}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                Detect "Elysium" scenarios - elite utopia while masses suffer
              </p>
            </div>

            {/* Distribution Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div style={{ color: 'var(--white-60)' }}>Gini Coefficient</div>
                <div className="text-base font-semibold mt-1" style={{ color: qol.distribution.globalGini > 0.45 ? 'var(--color-red)' : 'var(--white-90)' }}>
                  {qol.distribution.globalGini.toFixed(3)}
                  {qol.distribution.globalGini > 0.45 && ' ⚠️'}
                </div>
                <div className="text-xs" style={{ color: 'var(--white-40)' }}>
                  {qol.distribution.globalGini > 0.45 ? 'Unstable inequality' : 'Acceptable'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--white-60)' }}>Regional Variance</div>
                <div className="text-base font-semibold mt-1" style={{ color: 'var(--white-90)' }}>
                  {qol.distribution.regionalVariance.toFixed(3)}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--white-60)' }}>Best Region QoL</div>
                <div className="text-base font-semibold mt-1" style={{ color: 'var(--color-green)' }}>
                  {qol.distribution.bestRegionQoL.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--white-60)' }}>Worst Region QoL</div>
                <div className="text-base font-semibold mt-1" style={{ color: 'var(--color-red)' }}>
                  {qol.distribution.worstRegionQoL.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--white-60)' }}>Median Region QoL</div>
                <div className="text-base font-semibold mt-1" style={{ color: 'var(--white-90)' }}>
                  {qol.distribution.medianRegionQoL.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--white-60)' }}>Crisis-Affected Population</div>
                <div className="text-base font-semibold mt-1" style={{ color: qol.distribution.crisisAffectedFraction > 0.3 ? 'var(--color-red)' : 'var(--white-90)' }}>
                  {(qol.distribution.crisisAffectedFraction * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
