'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { ResearchScenarioId } from '@/game/types';
import styles from './scenario-picker.module.css';

/**
 * Outcome probability distribution
 */
export interface OutcomeDistribution {
  utopia: number;
  flourishing: number;
  stable: number;
  decline: number;
  dystopia: number;
  collapse: number;
  extinction: number;
}

/**
 * Scenario definition for display
 */
export interface ScenarioDisplay {
  id: ResearchScenarioId;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  outcomeDistribution: OutcomeDistribution;
  challenges: string[];
  strategies: string[];
  researchBasis: string[];
}

/**
 * ScenarioPicker props
 */
export interface ScenarioPickerProps {
  /** Currently selected scenario */
  selectedScenario: ResearchScenarioId;
  /** Callback when scenario changes */
  onScenarioChange: (scenario: ResearchScenarioId) => void;
  /** Whether picker is in compact mode */
  compact?: boolean;
  /** Whether scenarios can be changed (false during active game) */
  canChange?: boolean;
}

/**
 * Predefined scenarios with their distributions
 * Based on research from the scenario files
 */
const SCENARIO_DATA: ScenarioDisplay[] = [
  {
    id: 'baseline',
    name: 'Consensus Trajectory',
    description: 'Starting conditions reflect median expert expectations from 2025 calibration data. Uses default initialization values with no overrides.',
    shortDescription: 'Median expert forecasts',
    icon: '01',
    outcomeDistribution: {
      utopia: 0.08,
      flourishing: 0.15,
      stable: 0.28,
      decline: 0.25,
      dystopia: 0.14,
      collapse: 0.08,
      extinction: 0.02,
    },
    challenges: [
      'Climate change following current trajectory',
      'AI development outpacing governance',
      'Social instability from automation',
      'Fragmented international cooperation',
    ],
    strategies: [
      'Observe dynamics to understand baseline',
      'Use minimal interventions strategically',
      'Focus on critical junctures',
    ],
    researchBasis: [
      'Epoch AI (2024) - AI capability benchmarks',
      'IPCC AR6 (2023) - Climate trajectory',
      'V-Dem (2024) - Democracy metrics',
    ],
  },
  {
    id: 'optimistic',
    name: 'Best Case Supported',
    description: 'Upper bounds of research uncertainty ranges. High trust, strong institutions, proactive governance. Tests if favorable conditions enable better outcomes.',
    shortDescription: 'Favorable uncertainty bounds',
    icon: '02',
    outcomeDistribution: {
      utopia: 0.18,
      flourishing: 0.32,
      stable: 0.28,
      decline: 0.12,
      dystopia: 0.06,
      collapse: 0.03,
      extinction: 0.01,
    },
    challenges: [
      'Maintaining momentum after early gains',
      'Coordinating final optimization steps',
      'Avoiding complacency from success',
      'Managing expectations',
    ],
    strategies: [
      'Leverage high trust for ambitious proposals',
      'Build international coalitions early',
      'Invest heavily in alignment research',
      'Maintain social cohesion through equity',
    ],
    researchBasis: [
      'Amodei (2024) - Alignment researcher surveys',
      'IPCC AR6 (2023) - Paris Agreement targets',
      'OECD (2024) - Strong institutions metrics',
    ],
  },
  {
    id: 'pessimistic',
    name: 'Realistic Worst Case',
    description: 'Lower bounds of research uncertainty ranges. Low trust, weak institutions, fragmented cooperation. Tests if poor starting conditions lead to worse outcomes.',
    shortDescription: 'Challenging uncertainty bounds',
    icon: '03',
    outcomeDistribution: {
      utopia: 0.03,
      flourishing: 0.08,
      stable: 0.18,
      decline: 0.28,
      dystopia: 0.22,
      collapse: 0.15,
      extinction: 0.06,
    },
    challenges: [
      'Low trust makes cooperation difficult',
      'Weak institutions limit policy',
      'Misinformation undermines action',
      'Limited intervention windows',
      'Time pressure from accelerating crises',
    ],
    strategies: [
      'Build trust before ambitious proposals',
      'Target critical junctures precisely',
      'Build grassroots coalitions',
      'Prioritize stabilization over optimization',
    ],
    researchBasis: [
      'Christiano (2024) - Fast takeoff scenarios',
      'IPCC AR6 (2023) - RCP 8.5 pathway',
      'V-Dem (2024) - Democratic backsliding',
    ],
  },
];

/**
 * Get color for outcome category
 */
function getOutcomeColor(outcome: keyof OutcomeDistribution): string {
  const colors: Record<keyof OutcomeDistribution, string> = {
    utopia: '#00FF88',
    flourishing: '#00F0FF',
    stable: '#FFFFFF',
    decline: '#FFB000',
    dystopia: '#FF6B00',
    collapse: '#FF4040',
    extinction: '#FF0040',
  };
  return colors[outcome];
}

/**
 * Get label for outcome category
 */
function getOutcomeLabel(outcome: keyof OutcomeDistribution): string {
  const labels: Record<keyof OutcomeDistribution, string> = {
    utopia: 'Utopia',
    flourishing: 'Flourishing',
    stable: 'Stable',
    decline: 'Decline',
    dystopia: 'Dystopia',
    collapse: 'Collapse',
    extinction: 'Extinction',
  };
  return labels[outcome];
}

/**
 * ScenarioPicker - Display and select from 3 research-validated scenarios
 *
 * Far-future Elysium-inspired aesthetic:
 * - Clean scenario cards with subtle glow
 * - Horizontal bar chart for outcome distributions
 * - Research sources shown for credibility
 */
export function ScenarioPicker({
  selectedScenario,
  onScenarioChange,
  compact = false,
  canChange = true,
}: ScenarioPickerProps) {
  const [expandedScenario, setExpandedScenario] = useState<ResearchScenarioId | null>(null);

  // Get selected scenario data
  const selectedData = useMemo(() => {
    return SCENARIO_DATA.find(s => s.id === selectedScenario) ?? SCENARIO_DATA[0];
  }, [selectedScenario]);

  // Handle scenario selection
  const handleSelect = useCallback((scenarioId: ResearchScenarioId) => {
    if (canChange) {
      onScenarioChange(scenarioId);
    }
  }, [canChange, onScenarioChange]);

  // Toggle expanded view
  const toggleExpanded = useCallback((scenarioId: ResearchScenarioId) => {
    setExpandedScenario(prev => prev === scenarioId ? null : scenarioId);
  }, []);

  if (compact) {
    return (
      <div className={styles.compactPicker}>
        <span className={styles.compactLabel}>Scenario:</span>
        <span className={styles.compactValue}>{selectedData.name}</span>
        <span className={styles.compactIcon}>{selectedData.icon}</span>
      </div>
    );
  }

  return (
    <div className={styles.picker}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Starting Scenario</h2>
        <p className={styles.subtitle}>
          These represent edges of scientific uncertainty, not difficulty levels
        </p>
      </div>

      {/* Scenario Cards */}
      <div className={styles.scenarioGrid}>
        {SCENARIO_DATA.map(scenario => {
          const isSelected = selectedScenario === scenario.id;
          const isExpanded = expandedScenario === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`${styles.scenarioCard} ${isSelected ? styles.selected : ''} ${!canChange ? styles.locked : ''}`}
              onClick={() => handleSelect(scenario.id)}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <span className={styles.scenarioIcon}>{scenario.icon}</span>
                <div className={styles.scenarioTitleArea}>
                  <h3 className={styles.scenarioName}>{scenario.name}</h3>
                  <p className={styles.scenarioShort}>{scenario.shortDescription}</p>
                </div>
                {isSelected && <span className={styles.selectedBadge}>Active</span>}
              </div>

              {/* Outcome Distribution Mini Bar */}
              <div className={styles.distributionMini}>
                {(Object.entries(scenario.outcomeDistribution) as [keyof OutcomeDistribution, number][]).map(([outcome, prob]) => (
                  <div
                    key={outcome}
                    className={styles.miniBarSegment}
                    style={{
                      width: `${prob * 100}%`,
                      backgroundColor: getOutcomeColor(outcome),
                    }}
                    title={`${getOutcomeLabel(outcome)}: ${(prob * 100).toFixed(0)}%`}
                  />
                ))}
              </div>

              {/* Expand/Collapse Button */}
              <button
                className={styles.expandBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(scenario.id);
                }}
              >
                {isExpanded ? 'Less' : 'More'}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className={styles.expandedDetails}>
                  <p className={styles.fullDescription}>{scenario.description}</p>

                  {/* Full Distribution */}
                  <div className={styles.distributionFull}>
                    <h4 className={styles.detailTitle}>Outcome Distribution</h4>
                    {(Object.entries(scenario.outcomeDistribution) as [keyof OutcomeDistribution, number][]).map(([outcome, prob]) => (
                      <div key={outcome} className={styles.distRow}>
                        <span
                          className={styles.distLabel}
                          style={{ color: getOutcomeColor(outcome) }}
                        >
                          {getOutcomeLabel(outcome)}
                        </span>
                        <div className={styles.distBar}>
                          <div
                            className={styles.distBarFill}
                            style={{
                              width: `${prob * 100}%`,
                              backgroundColor: getOutcomeColor(outcome),
                              boxShadow: `0 0 10px ${getOutcomeColor(outcome)}40`,
                            }}
                          />
                        </div>
                        <span className={styles.distValue}>{(prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Challenges */}
                  <div className={styles.challengeSection}>
                    <h4 className={styles.detailTitle}>Key Challenges</h4>
                    <ul className={styles.challengeList}>
                      {scenario.challenges.map((challenge, i) => (
                        <li key={i} className={styles.challengeItem}>{challenge}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Strategies */}
                  <div className={styles.strategySection}>
                    <h4 className={styles.detailTitle}>Recommended Strategies</h4>
                    <ul className={styles.strategyList}>
                      {scenario.strategies.map((strategy, i) => (
                        <li key={i} className={styles.strategyItem}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Research Basis */}
                  <div className={styles.researchSection}>
                    <h4 className={styles.detailTitle}>Research Basis</h4>
                    <ul className={styles.researchList}>
                      {scenario.researchBasis.map((source, i) => (
                        <li key={i} className={styles.researchItem}>{source}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note about uncertainty */}
      <div className={styles.uncertaintyNote}>
        Probabilities show expected outcome distributions from Monte Carlo simulations.
        Actual results will vary based on simulation dynamics and player actions.
      </div>
    </div>
  );
}

export default ScenarioPicker;
