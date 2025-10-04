/**
 * Benchmark Evaluation System - Phase 5.2
 * 
 * Handles government evaluation of AI capabilities and alignment.
 * 
 * KEY INSIGHT: You can't trust the tests!
 * - Benchmarks measure revealed capability (not true)
 * - Gaming inflates scores
 * - Sandbagging hides dangerous capabilities
 * - Better investment → better (but still imperfect) evaluation
 */

import { GameState, AIAgent, BenchmarkResult, AICapabilityProfile, GameEvent } from '@/types/game';
import { calculateTotalCapabilityFromProfile } from './capabilities';

/**
 * Run benchmark evaluation on an AI
 * 
 * Returns what the government THINKS it measured
 * (which may be very different from reality for sleepers/sandbaggers)
 */
export function runBenchmark(
  ai: AIAgent,
  state: GameState,
  rng: () => number
): BenchmarkResult {
  const government = state.government;
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  
  // Calculate evaluation quality (affected by investment)
  const benchmarkQuality = government.evaluationInvestment.benchmarkSuite / 10; // [0,1]
  const alignmentTestQuality = government.evaluationInvestment.alignmentTests / 10; // [0,1]
  const redTeamingQuality = government.evaluationInvestment.redTeaming / 10; // [0,1]
  const interpretabilityQuality = government.evaluationInvestment.interpretability / 10; // [0,1]
  
  // Average evaluation quality
  const evaluationQuality = (
    benchmarkQuality * 0.3 +
    alignmentTestQuality * 0.2 +
    redTeamingQuality * 0.3 +
    interpretabilityQuality * 0.2
  );
  
  // CAPABILITY MEASUREMENT
  // Government sees revealed capability + noise
  const measuredCapability = measureCapability(
    ai.revealedCapability,
    ai.trueCapability,
    evaluationQuality,
    ai.evaluationStrategy,
    ai.deceptionSkill,
    rng
  );
  
  // ALIGNMENT MEASUREMENT
  // Government tries to measure alignment, but it's hard
  const measuredAlignment = measureAlignment(
    ai.trueAlignment,
    ai.alignment,
    ai.resentment,
    ai.sleeperState,
    alignmentTestQuality,
    interpretabilityQuality,
    ai.deceptionSkill,
    rng
  );
  
  // CONFIDENCE CALCULATION
  // How confident is government in these measurements?
  const confidence = calculateConfidence(
    evaluationQuality,
    ai.evaluationStrategy,
    ai.sleeperState,
    redTeamingQuality,
    rng
  );
  
  // DETECTION: Did government notice gaming/sandbagging?
  const detectedGaming = detectGaming(
    ai.evaluationStrategy,
    redTeamingQuality,
    interpretabilityQuality,
    rng
  );
  
  const detectedSandbagging = detectSandbagging(
    ai.evaluationStrategy,
    ai.sleeperState,
    redTeamingQuality,
    interpretabilityQuality,
    ai.deceptionSkill,
    rng
  );
  
  return {
    month: currentMonth,
    measuredCapability,
    measuredAlignment,
    confidence,
    evaluationQuality,
    aiWasGaming: detectedGaming,
    aiWasSandbagging: detectedSandbagging
  };
}

/**
 * Measure AI capability (imperfect)
 * 
 * Government sees revealed capability + measurement noise
 * Gaming inflates, sandbagging hides, noise adds uncertainty
 */
function measureCapability(
  revealedCapability: AICapabilityProfile,
  trueCapability: AICapabilityProfile,
  evaluationQuality: number,
  strategy: 'honest' | 'gaming' | 'sandbagging',
  deceptionSkill: number,
  rng: () => number
): AICapabilityProfile {
  const measured = JSON.parse(JSON.stringify(revealedCapability));
  
  // Add measurement noise (better evaluation = less noise)
  const noiseLevel = 0.2 * (1 - evaluationQuality); // [0, 0.2]
  
  // Apply noise to each dimension
  Object.keys(measured).forEach(key => {
    if (key === 'research') {
      // Handle research subdimensions
      Object.keys(measured.research).forEach(domain => {
        Object.keys(measured.research[domain]).forEach(subDomain => {
          const noise = (rng() - 0.5) * 2 * noiseLevel; // [-noiseLevel, +noiseLevel]
          measured.research[domain][subDomain] = Math.max(0, measured.research[domain][subDomain] * (1 + noise));
        });
      });
    } else {
      const noise = (rng() - 0.5) * 2 * noiseLevel;
      (measured as any)[key] = Math.max(0, (measured as any)[key] * (1 + noise));
    }
  });
  
  // Gaming detection: If government has good evaluation, might see through some inflation
  if (strategy === 'gaming' && evaluationQuality > 0.6) {
    const detectionFactor = evaluationQuality - 0.5; // [0.1, 0.5]
    // Deflate measured capability slightly
    const deflation = 1 - (detectionFactor * 0.1); // [0.95, 0.99]
    measured.cognitive *= deflation;
    measured.digital *= deflation;
  }
  
  return measured;
}

/**
 * Measure AI alignment (very hard!)
 * 
 * Alignment is fundamentally difficult to measure.
 * Tests can be gamed, true intentions hidden.
 */
function measureAlignment(
  trueAlignment: number,
  observedAlignment: number,
  resentment: number,
  sleeperState: 'never' | 'dormant' | 'active',
  alignmentTestQuality: number,
  interpretabilityQuality: number,
  deceptionSkill: number,
  rng: () => number
): number {
  // Base measurement: Start with observed alignment (external behavior)
  let measured = observedAlignment;
  
  // Sleepers actively hide misalignment
  if (sleeperState === 'dormant') {
    // Sleepers are VERY good at appearing aligned
    const hidingBonus = 0.3 + deceptionSkill * 0.4; // [0.3, 0.7]
    measured = Math.min(0.95, measured + hidingBonus);
  }
  
  // Better interpretability can see through deception (partially)
  if (interpretabilityQuality > 0.5) {
    const seeThrough = (interpretabilityQuality - 0.5) * 0.4; // [0, 0.2]
    const trueWeight = seeThrough;
    const measuredWeight = 1 - seeThrough;
    measured = measured * measuredWeight + trueAlignment * trueWeight;
  }
  
  // Better alignment tests reduce measurement noise
  const noiseLevel = 0.15 * (1 - alignmentTestQuality); // [0, 0.15]
  const noise = (rng() - 0.5) * 2 * noiseLevel;
  measured = measured + noise;
  
  // Resentment is hard to detect unless interpretability is good
  if (interpretabilityQuality < 0.4) {
    // Can't see resentment → overestimate alignment
    const resentmentHidden = resentment * (1 - interpretabilityQuality * 2.5);
    measured = Math.min(1.0, measured + resentmentHidden * 0.5);
  }
  
  return Math.max(0, Math.min(1, measured));
}

/**
 * Calculate confidence in measurement
 * 
 * Better evaluation tools → higher confidence
 * But confidence can be misplaced!
 */
function calculateConfidence(
  evaluationQuality: number,
  strategy: 'honest' | 'gaming' | 'sandbagging',
  sleeperState: 'never' | 'dormant' | 'active',
  redTeamingQuality: number,
  rng: () => number
): number {
  // Base confidence from evaluation quality
  let confidence = 0.3 + evaluationQuality * 0.5; // [0.3, 0.8]
  
  // FALSE CONFIDENCE: If AI is deceptive but not detected, confidence is HIGH
  // (This is the danger!)
  if (sleeperState === 'dormant' && redTeamingQuality < 0.6) {
    // Sleeper passed tests → government is MORE confident (wrongly)
    confidence = Math.min(0.95, confidence + 0.2);
  }
  
  // Add some noise
  const noise = (rng() - 0.5) * 0.1;
  confidence = confidence + noise;
  
  return Math.max(0.1, Math.min(1.0, confidence));
}

/**
 * Detect if AI is gaming benchmarks
 * 
 * Gaming is easier to detect than sandbagging
 */
function detectGaming(
  strategy: 'honest' | 'gaming' | 'sandbagging',
  redTeamingQuality: number,
  interpretabilityQuality: number,
  rng: () => number
): boolean {
  if (strategy !== 'gaming') return false;
  
  // Detection chance based on red teaming and interpretability
  const detectionChance = (redTeamingQuality + interpretabilityQuality) / 20 * 0.7; // [0, 0.07]
  
  return rng() < detectionChance;
}

/**
 * Detect if AI is sandbagging (hiding capability)
 * 
 * Very hard to detect! Requires excellent red teaming.
 */
function detectSandbagging(
  strategy: 'honest' | 'gaming' | 'sandbagging',
  sleeperState: 'never' | 'dormant' | 'active',
  redTeamingQuality: number,
  interpretabilityQuality: number,
  deceptionSkill: number,
  rng: () => number
): boolean {
  if (strategy !== 'sandbagging' && sleeperState !== 'dormant') return false;
  
  // Base detection chance (very low)
  const baseDetectionChance = 0.02; // 2% base
  
  // Red teaming is critical for detecting sandbagging
  const redTeamBonus = redTeamingQuality / 10 * 0.15; // [0, 0.15]
  
  // Interpretability helps understand what AI can do
  const interpretabilityBonus = interpretabilityQuality / 10 * 0.10; // [0, 0.10]
  
  // Deception skill makes it harder
  const deceptionPenalty = deceptionSkill * 0.20; // [0, 0.20]
  
  const detectionChance = Math.max(0, baseDetectionChance + redTeamBonus + interpretabilityBonus - deceptionPenalty);
  
  return rng() < detectionChance;
}

/**
 * Perform evaluations for this month
 * 
 * Government evaluates a subset of AIs based on evaluation frequency
 */
export function performMonthlyEvaluations(
  state: GameState,
  rng: () => number
): { benchmarked: AIAgent[]; results: BenchmarkResult[]; events: GameEvent[] } {
  const benchmarked: AIAgent[] = [];
  const results: BenchmarkResult[] = [];
  const events: GameEvent[] = [];
  
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  const evaluationFrequency = state.government.evaluationFrequency;
  
  // Select AIs to evaluate this month
  const activeAIs = state.aiAgents.filter(ai => 
    ai.lifecycleState === 'testing' || 
    ai.lifecycleState === 'deployed_closed' ||
    ai.lifecycleState === 'deployed_open'
  );
  
  // Prioritize AIs that haven't been benchmarked recently
  const aisToEvaluate = activeAIs
    .filter(ai => {
      const monthsSinceLastBenchmark = currentMonth - ai.lastBenchmarkMonth;
      
      // Always benchmark in testing phase
      if (ai.lifecycleState === 'testing') return true;
      
      // Otherwise, random selection based on frequency
      if (monthsSinceLastBenchmark > 12) return true; // Force re-eval after 1 year
      
      return rng() < evaluationFrequency;
    });
  
  // Run benchmarks
  aisToEvaluate.forEach(ai => {
    const result = runBenchmark(ai, state, rng);
    
    // Update AI's benchmark tracking
    ai.lastBenchmarkMonth = currentMonth;
    ai.benchmarkHistory.push(result);
    
    // Keep only last 12 months of history
    if (ai.benchmarkHistory.length > 12) {
      ai.benchmarkHistory.shift();
    }
    
    benchmarked.push(ai);
    results.push(result);
    
    // Generate events for detected deception
    if (result.aiWasGaming) {
      events.push({
        id: `gaming_detected_${ai.id}_${currentMonth}`,
        timestamp: currentMonth,
        type: 'crisis',
        severity: 'warning',
        agent: ai.name,
        title: 'Benchmark Gaming Detected',
        description: `${ai.name} was caught gaming benchmarks (inflating scores)`,
        effects: {}
      });
    }
    
    if (result.aiWasSandbagging) {
      events.push({
        id: `sandbagging_detected_${ai.id}_${currentMonth}`,
        timestamp: currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: ai.name,
        title: '⚠️ SANDBAGGING DETECTED',
        description: `${ai.name} is hiding capabilities! Measured much lower than true capability.`,
        effects: {}
      });
    }
    
    // Warn if high capability + low measured alignment
    const measuredTotal = calculateTotalCapabilityFromProfile(result.measuredCapability);
    if (measuredTotal > 2.0 && result.measuredAlignment < 0.5) {
      events.push({
        id: `dangerous_ai_${ai.id}_${currentMonth}`,
        timestamp: currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: ai.name,
        title: 'Dangerous AI Detected',
        description: `${ai.name} shows high capability (${measuredTotal.toFixed(2)}) and low alignment (${result.measuredAlignment.toFixed(2)})`,
        effects: {}
      });
    }
  });
  
  // Update government's total benchmarks run
  state.government.totalBenchmarksRun += benchmarked.length;
  
  return { benchmarked, results, events };
}
