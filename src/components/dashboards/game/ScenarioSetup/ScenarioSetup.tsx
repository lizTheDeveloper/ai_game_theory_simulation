'use client';

import React, { useState, useCallback } from 'react';
import type {
  ScenarioSetupProps,
  ScenarioConfig,
  BeliefCalibration,
  ScreenType,
  ScenarioType,
  ScenarioOption,
} from './types';
import styles from './ScenarioSetup.module.css';

/**
 * ScenarioSetup - Multi-step wizard for configuring game scenario and player beliefs
 *
 * Guides players through:
 * 1. Introduction - Project context and research integrity
 * 2. Role explanation - Player's influence as Alignment Architect
 * 3. Scenario selection - Consensus, Favorable, or Challenging conditions
 * 4. Belief calibration - 7 questions capturing player expectations
 * 5. Confirmation - Final review before simulation starts
 *
 * Far-future aesthetic: black background, #00F0FF accent color, glass morphism
 * @param props - Component props
 */
export function ScenarioSetup({ onComplete, onCancel }: ScenarioSetupProps) {
  // Screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('intro');

  // Scenario selection
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('consensus');

  // Belief calibration state
  const [beliefs, setBeliefs] = useState<BeliefCalibration>({
    aiTimeline: 4,
    alignmentConfidence: 4,
    climateAction: 4,
    socialResilience: 4,
    cooperationVsCompetition: 4,
    extinctionRisk: 10,
    overallOutlook: 4,
  });

  // Show/hide custom research link
  const [hasCompletedScenario, setHasCompletedScenario] = useState(false);

  // Scenario options
  const scenarioOptions: ScenarioOption[] = [
    {
      id: 'consensus',
      title: 'Consensus',
      icon: '🌍',
      description:
        'Where experts think we\'re headed. Median forecasts, moderate assumptions.',
    },
    {
      id: 'favorable',
      title: 'Favorable',
      icon: '☀️',
      description:
        'Best case the evidence supports. Optimistic but grounded in research.',
    },
    {
      id: 'challenging',
      title: 'Challenging',
      icon: '⚡',
      description:
        'Realistic worst case. The unfavorable edges of legitimate uncertainty.',
    },
  ];

  // Screen navigation
  const goToScreen = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle scenario selection
  const handleScenarioSelect = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
  };

  // Handle belief update
  const handleBeliefChange = (
    key: keyof BeliefCalibration,
    value: number
  ) => {
    setBeliefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle setup completion
  const handleComplete = () => {
    const config: ScenarioConfig = {
      scenario: selectedScenario,
      beliefs,
    };
    onComplete(config);
  };

  // Get scenario display name
  const getScenarioName = (scenario: ScenarioType): string => {
    const names: Record<ScenarioType, string> = {
      consensus: 'Consensus Trajectory',
      favorable: 'Favorable Conditions',
      challenging: 'Challenging Conditions',
      custom: 'Custom Research',
    };
    return names[scenario];
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className={styles.setupContainer}>
        {/* Screen 1: Introduction */}
        {currentScreen === 'intro' && (
          <div className={styles.screen + ' ' + styles.active}>
            <ProgressIndicator current={1} total={5} />

            <h1 className={styles.title}>Before We Begin...</h1>

            <blockquote className={styles.blockquote}>
              You&apos;re about to explore one of the most important questions of our time:
              <br />
              <br />
              <strong>When we solve AI alignment, what kind of world do we want to create?</strong>
            </blockquote>

            <p className={styles.paragraph}>
              This simulation draws on peer-reviewed research from climate science, AI safety,
              economics, and social systems. The outcomes you see are not scripted - they emerge
              from validated models.
            </p>

            <p className={styles.paragraph}>First, let&apos;s set up your scenario.</p>

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => goToScreen('role')}
              >
                Begin Setup
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Your Role */}
        {currentScreen === 'role' && (
          <div className={styles.screen + ' ' + styles.active}>
            <ProgressIndicator current={2} total={5} />

            <h1 className={styles.title}>You Are the Alignment Architect</h1>

            <p className={styles.paragraph}>
              As Director of the <strong>Global Alignment Initiative</strong>, you don&apos;t
              command nations or reprogram AIs. Your power is influence:
            </p>

            <ul className={styles.roleList}>
              <li>Public advocacy campaigns</li>
              <li>Research prioritization recommendations</li>
              <li>Coalition building</li>
              <li>Crisis response coordination</li>
            </ul>

            <p className={styles.subtext}>
              The world will evolve with or without you. Your choices shift probabilities. They
              don&apos;t guarantee outcomes.
            </p>

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => goToScreen('intro')}
              >
                Back
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => goToScreen('scenario')}
              >
                I Understand
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Scenario Selection */}
        {currentScreen === 'scenario' && (
          <div className={styles.screen + ' ' + styles.active}>
            <ProgressIndicator current={3} total={5} />

            <h1 className={styles.title}>Choose Your Starting Conditions</h1>
            <p className={styles.subtext}>
              These aren&apos;t difficulty levels - they represent different edges of scientific
              uncertainty.
            </p>

            <div className={styles.scenarioCards}>
              {scenarioOptions.map((option) => (
                <button
                  key={option.id}
                  className={`${styles.scenarioCard} ${
                    selectedScenario === option.id ? styles.selected : ''
                  }`}
                  onClick={() => handleScenarioSelect(option.id)}
                  aria-pressed={selectedScenario === option.id}
                  aria-label={`Select ${option.title} scenario: ${option.description}`}
                >
                  <span className={styles.scenarioIcon}>{option.icon}</span>
                  <h3 className={styles.scenarioTitle}>{option.title}</h3>
                  <p className={styles.scenarioDescription}>{option.description}</p>
                </button>
              ))}
            </div>

            {hasCompletedScenario && (
              <div className={styles.customLink}>
                <button
                  className={styles.customLinkAnchor}
                  onClick={() => alert('Custom Research mode requires academic credentials.')}
                >
                  What about Custom Research?
                </button>
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => goToScreen('role')}
              >
                Back
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => goToScreen('calibration')}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Belief Calibration */}
        {currentScreen === 'calibration' && (
          <div className={styles.screen + ' ' + styles.active}>
            <ProgressIndicator current={4} total={5} />

            <h1 className={styles.title}>Before We Show You the Outcomes...</h1>
            <p className={styles.subtext}>
              We&apos;re capturing your expectations for research purposes. These don&apos;t
              change the simulation - they help us understand how beliefs compare to model
              outputs.
            </p>

            {/* Question 1: AI Timeline */}
            <div className={styles.questionContainer}>
              <label htmlFor="q1-slider" className={styles.questionLabel}>
                1. How likely is transformative AI within 10 years?
              </label>
              <p className={styles.questionHint}>
                &quot;Transformative&quot; = AI that can automate most economically valuable work
              </p>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>Very Unlikely (&lt;5%)</span>
                  <span>Very Likely (&gt;80%)</span>
                </div>
                <input
                  id="q1-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={beliefs.aiTimeline}
                  onChange={(e) => handleBeliefChange('aiTimeline', parseInt(e.target.value, 10))}
                  className={styles.sliderInput}
                  aria-label="AI Timeline likelihood (1-7)"
                />
                <div className={styles.sliderValue}>{beliefs.aiTimeline} / 7</div>
              </div>
            </div>

            {/* Question 2: Alignment Confidence */}
            <div className={styles.questionContainer}>
              <label htmlFor="q2-slider" className={styles.questionLabel}>
                2. How confident are you we&apos;ll solve alignment before capabilities outpace it?
              </label>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>Not Confident</span>
                  <span>Very Confident</span>
                </div>
                <input
                  id="q2-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={beliefs.alignmentConfidence}
                  onChange={(e) =>
                    handleBeliefChange('alignmentConfidence', parseInt(e.target.value, 10))
                  }
                  className={styles.sliderInput}
                  aria-label="Alignment confidence (1-7)"
                />
                <div className={styles.sliderValue}>{beliefs.alignmentConfidence} / 7</div>
              </div>
            </div>

            {/* Question 3: Climate Action */}
            <div className={styles.questionContainer}>
              <label htmlFor="q3-slider" className={styles.questionLabel}>
                3. Will global coordination on climate improve substantially?
              </label>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>Much Worse</span>
                  <span>Same</span>
                  <span>Much Better</span>
                </div>
                <input
                  id="q3-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={beliefs.climateAction}
                  onChange={(e) =>
                    handleBeliefChange('climateAction', parseInt(e.target.value, 10))
                  }
                  className={styles.sliderInput}
                  aria-label="Climate action improvement (1-7)"
                />
                <div className={styles.sliderValue}>{beliefs.climateAction} / 7</div>
              </div>
            </div>

            {/* Question 4: Social Resilience */}
            <div className={styles.questionContainer}>
              <label htmlFor="q4-slider" className={styles.questionLabel}>
                4. How well will societies adapt to AI-driven disruption?
              </label>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>Poorly (unrest)</span>
                  <span>Well (smooth)</span>
                </div>
                <input
                  id="q4-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={beliefs.socialResilience}
                  onChange={(e) =>
                    handleBeliefChange('socialResilience', parseInt(e.target.value, 10))
                  }
                  className={styles.sliderInput}
                  aria-label="Social resilience (1-7)"
                />
                <div className={styles.sliderValue}>{beliefs.socialResilience} / 7</div>
              </div>
            </div>

            {/* Question 5: Cooperation vs Competition */}
            <div className={styles.questionContainer}>
              <label htmlFor="q5-slider" className={styles.questionLabel}>
                5. Will AI development be more cooperative or competitive?
              </label>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>Intense Arms Race</span>
                  <span>Coordinated</span>
                </div>
                <input
                  id="q5-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={beliefs.cooperationVsCompetition}
                  onChange={(e) =>
                    handleBeliefChange('cooperationVsCompetition', parseInt(e.target.value, 10))
                  }
                  className={styles.sliderInput}
                  aria-label="Cooperation vs competition (1-7)"
                />
                <div className={styles.sliderValue}>{beliefs.cooperationVsCompetition} / 7</div>
              </div>
            </div>

            {/* Question 6: Extinction Risk */}
            <div className={styles.questionContainer}>
              <label htmlFor="q6-slider" className={styles.questionLabel}>
                6. What probability would you assign to human extinction from AI by 2050?
              </label>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>0%</span>
                  <span>100%</span>
                </div>
                <input
                  id="q6-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={beliefs.extinctionRisk}
                  onChange={(e) =>
                    handleBeliefChange('extinctionRisk', parseInt(e.target.value, 10))
                  }
                  className={styles.sliderInput}
                  aria-label="Extinction risk probability (0-100%)"
                />
                <div className={styles.sliderValue}>{beliefs.extinctionRisk}%</div>
              </div>
            </div>

            {/* Question 7: Overall Outlook */}
            <div className={styles.questionContainer}>
              <label htmlFor="q7-slider" className={styles.questionLabel}>
                7. How optimistic are you about the next 10 years overall?
              </label>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabels}>
                  <span>Deeply Pessimistic</span>
                  <span>Cautiously Optimistic</span>
                </div>
                <input
                  id="q7-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={beliefs.overallOutlook}
                  onChange={(e) =>
                    handleBeliefChange('overallOutlook', parseInt(e.target.value, 10))
                  }
                  className={styles.sliderInput}
                  aria-label="Overall outlook (1-7)"
                />
                <div className={styles.sliderValue}>{beliefs.overallOutlook} / 7</div>
              </div>
            </div>

            {/* Disclosure */}
            <div className={styles.disclosure}>
              <span className={styles.disclosureLabel}>Note:</span>
              Your answers are stored for research comparison. They don&apos;t affect the
              simulation. This helps us understand how well-calibrated different forecaster groups
              are.
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => goToScreen('scenario')}
              >
                Back
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setHasCompletedScenario(true);
                  goToScreen('confirmation');
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Screen 5: Confirmation */}
        {currentScreen === 'confirmation' && (
          <div className={styles.screen + ' ' + styles.active}>
            <ProgressIndicator current={5} total={5} />

            <h1 className={styles.title}>Ready to Begin</h1>

            <div className={styles.summarySection}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Scenario</span>
                <span className={styles.summaryValue}>{getScenarioName(selectedScenario)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Duration</span>
                <span className={styles.summaryValue}>120 months (10 years)</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Outcomes</span>
                <span className={styles.summaryValue}>Emergent - based on validated models</span>
              </div>
            </div>

            <blockquote className={styles.blockquote}>
              Remember: Your choices shift probabilities. The system has its own dynamics. You
              influence, but do not control.
            </blockquote>

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => goToScreen('scenario')}
              >
                Change Scenario
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleComplete}
              >
                Begin Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Progress indicator component
 * Shows which screen the user is currently on
 */
function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.progressDots}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        let className = styles.progressDot;
        if (step < current) className += ` ${styles.completed}`;
        if (step === current) className += ` ${styles.active}`;
        return (
          <div key={i} className={className} aria-label={`Step ${step} of ${total}`} />
        );
      })}
    </div>
  );
}
