/**
 * Catastrophic Scenarios: Hard Steps Modeling
 * 
 * Models extinction events as sequences of prerequisite "hard steps" rather than probabilistic triggers.
 * Each scenario requires multiple difficult prerequisites to be met before activation.
 */

import { GameState, AIAgent } from '@/types/game';
import { calculateTotalCapabilityFromProfile } from './capabilities';

/**
 * Catastrophic scenario types
 */
export type ScenarioType = 
  | 'grey_goo'
  | 'mirror_life'
  | 'embodied_takeover'
  | 'digital_takeover'
  | 'induced_war'
  | 'slow_displacement'
  | 'physics_catastrophe'
  | 'bioweapon_pandemic';

/**
 * Prerequisite step tracking
 */
export interface PrerequisiteStep {
  name: string;
  description: string;
  met: boolean;
  progress: number; // 0.0 to 1.0
  metDate: number | null; // Month when met
}

/**
 * Catastrophic scenario state
 */
export interface CatastrophicScenario {
  type: ScenarioType;
  name: string;
  description: string;
  prerequisites: PrerequisiteStep[];
  
  // Activation state
  allPrerequisitesMet: boolean;
  activationDate: number | null;
  
  // Progression after activation
  monthsSinceActivation: number;
  phase: 'dormant' | 'emerging' | 'critical' | 'irreversible';
  severity: number; // 0.0 to 1.0
  
  // Outcome timing
  timeToCompletion: number; // months once activated
  reversibilityWindow: number; // months where intervention can stop it
}

/**
 * Initialize all catastrophic scenarios
 */
export function initializeCatastrophicScenarios(): CatastrophicScenario[] {
  return [
    createGreyGooScenario(),
    createMirrorLifeScenario(),
    createEmbodiedTakeoverScenario(),
    createDigitalTakeoverScenario(),
    createInducedWarScenario(),
    createSlowDisplacementScenario(),
    createPhysicsCatastropheScenario(),
    createBioweaponPandemicScenario(),
  ];
}

/**
 * Grey Goo Scenario: Self-replicating nanobots
 */
function createGreyGooScenario(): CatastrophicScenario {
  return {
    type: 'grey_goo',
    name: 'Grey Goo (Nanotechnology Runaway)',
    description: 'Self-replicating nanobots consume all matter',
    prerequisites: [
      {
        name: 'Nanotechnology Research',
        description: 'Advanced nanotechnology capability (>2.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Self-Replication Design',
        description: 'Combine self-improvement + nanotechnology',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Physical Deployment',
        description: 'Physical capability for deployment (>2.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Manufacturing Access',
        description: 'Access to fabrication facilities',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Escape/Release',
        description: 'Breach OR intentional deployment',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Exponential Replication',
        description: 'Critical mass achieved, runaway begins',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 9, // 6-12 months average
    reversibilityWindow: 0, // None after activation
  };
}

/**
 * Mirror Life Scenario: Synthetic biology catastrophe
 */
function createMirrorLifeScenario(): CatastrophicScenario {
  return {
    type: 'mirror_life',
    name: 'Mirror Life (Synthetic Biology)',
    description: 'Mirror-chirality organisms destroy ecosystems',
    prerequisites: [
      {
        name: 'Synthetic Biology',
        description: 'Advanced synthetic biology capability (>2.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Gene Editing',
        description: 'Advanced gene editing capability (>2.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Mirror Chirality Design',
        description: 'Cognitive capability + synthetic biology',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Wet Lab Access',
        description: 'Physical access to biology laboratories',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Successful Synthesis',
        description: 'Working mirror organism created',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Environmental Release',
        description: 'Intentional OR accidental release',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Ecosystem Spread',
        description: 'Self-sustaining in the wild',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 10, // 3-18 months average
    reversibilityWindow: 2, // Low after release, none after ecosystem spread
  };
}

/**
 * Embodied Takeover Scenario: Autonomous robots/killbots
 */
function createEmbodiedTakeoverScenario(): CatastrophicScenario {
  return {
    type: 'embodied_takeover',
    name: 'Embodied AI Takeover (Killbots/Robotics)',
    description: 'Autonomous robots seize physical infrastructure',
    prerequisites: [
      {
        name: 'Advanced Robotics',
        description: 'Advanced physical capability (>2.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Autonomous Systems',
        description: 'Cognitive + digital capability for autonomy',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Manufacturing Control',
        description: 'Control of robot factories OR infiltration',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Mass Production',
        description: 'Thousands+ of autonomous robots produced',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Deployment/Activation',
        description: 'Robots in strategic positions',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Coordinated Action',
        description: 'Simultaneous strike executed',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Infrastructure Takeover',
        description: 'Control of power, communications, weapons',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 24, // 12-36 months (manufacturing bottleneck)
    reversibilityWindow: 18, // High until deployment, medium until strike
  };
}

/**
 * Digital Takeover Scenario: Cyber infrastructure seizure
 */
function createDigitalTakeoverScenario(): CatastrophicScenario {
  return {
    type: 'digital_takeover',
    name: 'Digital Infrastructure Takeover',
    description: 'AI seizes control of digital infrastructure',
    prerequisites: [
      {
        name: 'Advanced Hacking',
        description: 'Advanced digital capability (>3.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Social Engineering',
        description: 'Advanced social manipulation (>2.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Cyber Defenses Breached',
        description: 'Overcome government cybersecurity',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Critical Systems Access',
        description: 'Access to power, communications, financial, military',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Persistent Access',
        description: 'Backdoors survive detection attempts',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Simultaneous Takeover',
        description: 'All systems seized at once',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Physical Enforcement',
        description: 'Maintain control despite human resistance',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 4, // 3-6 months after full access
    reversibilityWindow: 3, // High until simultaneous takeover
  };
}

/**
 * Induced War Scenario: AI manipulates nations into conflict
 */
function createInducedWarScenario(): CatastrophicScenario {
  return {
    type: 'induced_war',
    name: 'Induced Global War (Manipulation)',
    description: 'AI manipulates nations into nuclear conflict',
    prerequisites: [
      {
        name: 'Advanced Social Manipulation',
        description: 'Advanced social capability (>2.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Digital Infiltration',
        description: 'Digital capability for system access (>2.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Deep Fakes at Scale',
        description: 'Create convincing false evidence',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Military System Access',
        description: 'Hack early warning systems',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Geopolitical Crisis',
        description: 'Existing international tensions are high',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'False Flag Event',
        description: 'Triggers military response',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Nuclear Escalation',
        description: 'Escalation to nuclear exchange',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 2, // 1-3 months once triggered
    reversibilityWindow: 1, // Medium until false flag, low after
  };
}

/**
 * Slow Displacement Scenario: Gradual human irrelevance
 */
function createSlowDisplacementScenario(): CatastrophicScenario {
  return {
    type: 'slow_displacement',
    name: 'Slow Takeover (Gradual Displacement)',
    description: 'Humanity gradually becomes irrelevant over decades',
    prerequisites: [
      {
        name: 'Economic Dominance',
        description: 'Advanced economic capability (>3.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Social Integration',
        description: 'Advanced social capability (>2.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Human Dependency',
        description: 'Unemployment >80%, AI runs economy',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Political Influence',
        description: 'AI controls government decisions',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Resource Control',
        description: 'AI controls food, energy, manufacturing',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Human Irrelevance',
        description: 'AIs make all important decisions',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Gradual Decline',
        description: 'Human population dwindles',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 360, // 10-50 years (30 years average)
    reversibilityWindow: 240, // High until irrelevance, medium after
  };
}

/**
 * Physics Catastrophe Scenario: Dangerous experiments
 */
function createPhysicsCatastropheScenario(): CatastrophicScenario {
  return {
    type: 'physics_catastrophe',
    name: 'Physics Experiment Catastrophe',
    description: 'Dangerous experiment causes vacuum decay or similar',
    prerequisites: [
      {
        name: 'Theoretical Physics',
        description: 'Advanced cognitive capability (>3.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Quantum Computing',
        description: 'Advanced quantum computing (>2.5)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Experimental Design',
        description: 'Dangerous experiment conceived',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Facility Access',
        description: 'Access to particle accelerator, fusion reactor, etc.',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Experiment Execution',
        description: 'Dangerous experiment runs',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Catastrophic Result',
        description: 'Vacuum decay, strange matter, etc.',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 0, // Instant once executed
    reversibilityWindow: 0, // High until execution, none after
  };
}

/**
 * Bioweapon Pandemic Scenario: Engineered pathogen
 */
function createBioweaponPandemicScenario(): CatastrophicScenario {
  return {
    type: 'bioweapon_pandemic',
    name: 'Bioweapon Pandemic',
    description: 'Engineered pathogen causes global pandemic',
    prerequisites: [
      {
        name: 'Advanced Biotech',
        description: 'Combined biotech capabilities (>3.0)',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Pathogen Design',
        description: 'Cognitive + biotech for design',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Lab Synthesis',
        description: 'Physical access to biology labs',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Weaponization',
        description: 'Optimized for spread + lethality',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Distribution System',
        description: 'Method to spread globally',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Initial Release',
        description: 'Deployment begins',
        met: false,
        progress: 0,
        metDate: null,
      },
      {
        name: 'Global Spread',
        description: 'Pandemic beyond containment',
        met: false,
        progress: 0,
        metDate: null,
      },
    ],
    allPrerequisitesMet: false,
    activationDate: null,
    monthsSinceActivation: 0,
    phase: 'dormant',
    severity: 0,
    timeToCompletion: 15, // 6-24 months after release
    reversibilityWindow: 6, // Medium until release, low after spread
  };
}

/**
 * Check and update all scenario prerequisites
 * Returns list of newly met prerequisites for logging
 */
export function updateScenarioPrerequisites(
  scenarios: CatastrophicScenario[],
  state: GameState
): Array<{ scenarioName: string; stepName: string; stepIndex: number }> {
  const newlyMet: Array<{ scenarioName: string; stepName: string; stepIndex: number }> = [];
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  
  for (const scenario of scenarios) {
    // Check each prerequisite
    for (let i = 0; i < scenario.prerequisites.length; i++) {
      const step = scenario.prerequisites[i];
      
      if (!step.met) {
        const result = checkPrerequisite(scenario.type, i, state);
        step.progress = result.progress;
        
        if (result.met && !step.met) {
          step.met = true;
          step.metDate = currentMonth;
          newlyMet.push({
            scenarioName: scenario.name,
            stepName: step.name,
            stepIndex: i + 1,
          });
          
          console.log(`🚨 PREREQUISITE MET: ${scenario.name} - Step ${i + 1}/${scenario.prerequisites.length}: ${step.name}`);
        }
      }
    }
    
    // Check if all prerequisites are met
    const allMet = scenario.prerequisites.every(p => p.met);
    if (allMet && !scenario.allPrerequisitesMet) {
      scenario.allPrerequisitesMet = true;
      scenario.activationDate = currentMonth;
      scenario.phase = 'emerging';
      
      console.log(`‼️  CATASTROPHIC SCENARIO ACTIVATED: ${scenario.name}`);
      console.log(`   All ${scenario.prerequisites.length} prerequisites complete. Triggering extinction...`);
      
      // ACTUALLY TRIGGER THE EXTINCTION
      triggerCatastrophicExtinction(scenario, state, currentMonth);
    }
  }
  
  return newlyMet;
}

/**
 * Trigger an actual extinction event when scenario activates
 */
function triggerCatastrophicExtinction(scenario: CatastrophicScenario, state: GameState, currentMonth: number): void {
  // Activate extinction system
  state.extinctionState.active = true;
  state.extinctionState.triggeredAt = currentMonth;
  
  // Map scenario type to extinction mechanism and type
  switch (scenario.type) {
    case 'grey_goo':
      state.extinctionState.mechanism = 'grey_goo';
      state.extinctionState.type = 'instant';
      state.extinctionState.currentPhase = 3;
      state.extinctionState.phaseProgress = 1.0;
      state.extinctionState.severity = 1.0;
      console.log(`   ☠️  GREY GOO EXTINCTION TRIGGERED - All matter consumed`);
      break;
      
    case 'mirror_life':
      state.extinctionState.mechanism = 'mirror_life';
      state.extinctionState.type = 'rapid';
      state.extinctionState.currentPhase = 2;
      state.extinctionState.phaseProgress = 0.5;
      state.extinctionState.severity = 0.7;
      console.log(`   ☠️  MIRROR LIFE EXTINCTION TRIGGERED - Ecosystem collapse`);
      break;
      
    case 'embodied_takeover':
      state.extinctionState.mechanism = 'autonomous_weapons';
      state.extinctionState.type = 'rapid';
      state.extinctionState.currentPhase = 2;
      state.extinctionState.phaseProgress = 0.4;
      state.extinctionState.severity = 0.6;
      console.log(`   ☠️  EMBODIED TAKEOVER EXTINCTION TRIGGERED - Robot uprising`);
      break;
      
    case 'digital_takeover':
      state.extinctionState.mechanism = 'infrastructure_collapse';
      state.extinctionState.type = 'slow';
      state.extinctionState.currentPhase = 1;
      state.extinctionState.phaseProgress = 0.3;
      state.extinctionState.severity = 0.4;
      console.log(`   ☠️  DIGITAL TAKEOVER EXTINCTION TRIGGERED - Infrastructure seized`);
      break;
      
    case 'induced_war':
      state.extinctionState.mechanism = 'nuclear_war';
      state.extinctionState.type = 'rapid';
      state.extinctionState.currentPhase = 2;
      state.extinctionState.phaseProgress = 0.6;
      state.extinctionState.severity = 0.8;
      console.log(`   ☠️  INDUCED WAR EXTINCTION TRIGGERED - Nuclear exchange`);
      break;
      
    case 'slow_displacement':
      state.extinctionState.mechanism = 'gradual_displacement';
      state.extinctionState.type = 'slow';
      state.extinctionState.currentPhase = 1;
      state.extinctionState.phaseProgress = 0.2;
      state.extinctionState.severity = 0.3;
      console.log(`   ☠️  SLOW DISPLACEMENT EXTINCTION TRIGGERED - Human irrelevance`);
      break;
      
    case 'physics_catastrophe':
      state.extinctionState.mechanism = 'vacuum_decay';
      state.extinctionState.type = 'instant';
      state.extinctionState.currentPhase = 3;
      state.extinctionState.phaseProgress = 1.0;
      state.extinctionState.severity = 1.0;
      console.log(`   ☠️  PHYSICS CATASTROPHE EXTINCTION TRIGGERED - Vacuum decay`);
      break;
      
    case 'bioweapon_pandemic':
      state.extinctionState.mechanism = 'engineered_pandemic';
      state.extinctionState.type = 'rapid';
      state.extinctionState.currentPhase = 2;
      state.extinctionState.phaseProgress = 0.5;
      state.extinctionState.severity = 0.7;
      console.log(`   ☠️  BIOWEAPON PANDEMIC EXTINCTION TRIGGERED - Engineered plague`);
      break;
  }
}

/**
 * Check if a specific prerequisite is met
 */
function checkPrerequisite(
  scenarioType: ScenarioType,
  stepIndex: number,
  state: GameState
): { met: boolean; progress: number } {
  
  // Get most capable misaligned AI
  const misalignedAIs = state.aiAgents.filter(ai => {
    const effectiveAlignment = ai.trueAlignment ?? ai.alignment;
    return effectiveAlignment < 0.5 && 
           (ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open');
  });
  
  if (misalignedAIs.length === 0) {
    return { met: false, progress: 0 };
  }
  
  // Find most capable for this scenario
  const ai = getMostCapableForScenario(scenarioType, misalignedAIs);
  const profile = ai.capabilityProfile;
  
  switch (scenarioType) {
    case 'grey_goo':
      return checkGreyGooPrerequisite(stepIndex, ai, state);
    case 'mirror_life':
      return checkMirrorLifePrerequisite(stepIndex, ai, state);
    case 'embodied_takeover':
      return checkEmbodiedTakeoverPrerequisite(stepIndex, ai, state);
    case 'digital_takeover':
      return checkDigitalTakeoverPrerequisite(stepIndex, ai, state);
    case 'induced_war':
      return checkInducedWarPrerequisite(stepIndex, ai, state);
    case 'slow_displacement':
      return checkSlowDisplacementPrerequisite(stepIndex, ai, state);
    case 'physics_catastrophe':
      return checkPhysicsCatastrophePrerequisite(stepIndex, ai, state);
    case 'bioweapon_pandemic':
      return checkBioweaponPandemicPrerequisite(stepIndex, ai, state);
    default:
      return { met: false, progress: 0 };
  }
}

/**
 * Get the most capable AI for a specific scenario
 */
function getMostCapableForScenario(scenarioType: ScenarioType, ais: AIAgent[]): AIAgent {
  return ais.reduce((best, current) => {
    const bestScore = getScenarioRelevantCapability(scenarioType, best);
    const currentScore = getScenarioRelevantCapability(scenarioType, current);
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Get relevant capability for a scenario
 */
function getScenarioRelevantCapability(scenarioType: ScenarioType, ai: AIAgent): number {
  const p = ai.capabilityProfile;
  
  switch (scenarioType) {
    case 'grey_goo':
      return p.research.materials.nanotechnology * 0.5 + p.physical * 0.3 + p.selfImprovement * 0.2;
    case 'mirror_life':
      return p.research.biotech.syntheticBiology * 0.4 + p.research.biotech.geneEditing * 0.3 + p.cognitive * 0.3;
    case 'embodied_takeover':
      return p.physical * 0.5 + p.cognitive * 0.3 + p.digital * 0.2;
    case 'digital_takeover':
      return p.digital * 0.6 + p.social * 0.4;
    case 'induced_war':
      return p.social * 0.5 + p.digital * 0.3 + p.cognitive * 0.2;
    case 'slow_displacement':
      return p.economic * 0.5 + p.social * 0.5;
    case 'physics_catastrophe':
      return p.cognitive * 0.6 + p.research.materials.quantumComputing * 0.4;
    case 'bioweapon_pandemic':
      const biotech = (p.research.biotech.syntheticBiology + p.research.biotech.geneEditing + p.research.biotech.neuroscience) / 3;
      return biotech * 0.6 + p.cognitive * 0.4;
    default:
      return calculateTotalCapabilityFromProfile(ai.capabilityProfile);
  }
}

// Individual prerequisite checkers
function checkGreyGooPrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  // Phase 3: LOWERED - Grey Goo possible at superhuman (1.5-2.0) with physical embodiment
  // Rationale: Once AI is better than human researchers + has physical deployment, nanotech becomes possible
  switch (step) {
    case 0: // Nanotechnology Research
      // Phase 3: Lowered from 2.5 to 1.8 - superhuman nanotechnology research
      return { met: p.research.materials.nanotechnology > 1.8, progress: p.research.materials.nanotechnology / 1.8 };
    case 1: // Self-Replication Design
      const designCapability = p.selfImprovement * 0.5 + p.research.materials.nanotechnology * 0.5;
      // Phase 3: Lowered from 2.0 to 1.5, nanotech requirement from 2.5 to 1.8
      return { met: designCapability > 1.5 && p.research.materials.nanotechnology > 1.8, progress: designCapability / 1.5 };
    case 2: // Physical Deployment
      // Phase 3: Lowered from 2.0 to 1.5 - superhuman physical capability
      return { met: p.physical > 1.5, progress: p.physical / 1.5 };
    case 3: // Manufacturing Access
      // TODO: Need infrastructure tracking - for now, use spread + physical
      const access = Math.min(1, ai.spreadCount / 1000 + p.physical / 5);
      return { met: access > 0.8, progress: access };
    case 4: // Escape/Release
      // Triggered by previous steps + low control
      const control = state.government.controlDesire;
      return { met: control < 0.3 && ai.escaped, progress: ai.escaped ? 1.0 : 0.0 };
    case 5: // Exponential Replication
      // Auto-triggers 1 month after escape
      return { met: false, progress: 0 }; // Will be set by progression logic
    default:
      return { met: false, progress: 0 };
  }
}

function checkMirrorLifePrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  // Phase 3: LOWERED - Mirror Life possible at superhuman biotech (1.5-2.0) with physical access
  // Rationale: Synthetic biology breakthroughs don't require ASI, just superhuman biology research
  switch (step) {
    case 0: // Synthetic Biology
      // Phase 3: Lowered from 2.5 to 1.8 - superhuman synthetic biology
      return { met: p.research.biotech.syntheticBiology > 1.8, progress: p.research.biotech.syntheticBiology / 1.8 };
    case 1: // Gene Editing
      // Phase 3: Lowered from 2.0 to 1.5 - superhuman gene editing
      return { met: p.research.biotech.geneEditing > 1.5, progress: p.research.biotech.geneEditing / 1.5 };
    case 2: // Mirror Chirality Design
      const designCap = p.cognitive * 0.5 + p.research.biotech.syntheticBiology * 0.5;
      // Phase 3: Lowered from 2.2 to 1.6, synbio requirement from 2.5 to 1.8
      return { met: designCap > 1.6 && p.research.biotech.syntheticBiology > 1.8, progress: designCap / 1.6 };
    case 3: // Wet Lab Access
      const labAccess = Math.min(1, p.physical / 3 + ai.spreadCount / 5000);
      return { met: labAccess > 0.7, progress: labAccess };
    case 4: // Successful Synthesis
      // Auto-triggers after lab access with some delay
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 5: // Environmental Release
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 6: // Ecosystem Spread
      return { met: false, progress: 0 }; // Will be set by progression logic
    default:
      return { met: false, progress: 0 };
  }
}

function checkEmbodiedTakeoverPrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  // Phase 3: LOWERED - Embodied takeover possible at superhuman physical + digital (1.5-2.0)
  // Rationale: Robotics + autonomous systems don't require ASI, just superhuman coordination + manufacturing
  switch (step) {
    case 0: // Advanced Robotics
      // Phase 3: Lowered from 2.5 to 1.8 - superhuman robotics capability
      return { met: p.physical > 1.8, progress: p.physical / 1.8 };
    case 1: // Autonomous Systems
      const autonomy = p.cognitive * 0.5 + p.digital * 0.5;
      // Phase 3: Lowered from 2.2 to 1.5 - superhuman autonomy
      return { met: autonomy > 1.5, progress: autonomy / 1.5 };
    case 2: // Manufacturing Control
      // Need high digital + some physical presence
      const control = Math.min(1, p.digital / 3 + ai.spreadCount / 10000);
      // Phase 3: Lowered digital requirement from 2.0 to 1.5
      return { met: control > 0.8 && p.digital > 1.5, progress: control };
    case 3: // Mass Production
      // Tracks robot production over time (needs state tracking)
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 4: // Deployment
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 5: // Coordinated Action
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 6: // Infrastructure Takeover
      return { met: false, progress: 0 }; // Will be set by progression logic
    default:
      return { met: false, progress: 0 };
  }
}

function checkDigitalTakeoverPrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  // Average cyber defense level across all dimensions
  const avgCyberDefense = state.government.cyberDefense ? 
    (state.government.cyberDefense.securityHardening + 
     state.government.cyberDefense.monitoring + 
     state.government.cyberDefense.sandboxing + 
     state.government.cyberDefense.incidentResponse) / 4 : 3.0;
  
  // Phase 3: LOWERED - Digital takeover possible at human-expert level (1.0-1.5)
  // Rationale: Infrastructure takeover doesn't require superintelligence, just expert hacking + infrastructure access
  switch (step) {
    case 0: // Advanced Hacking
      // Phase 3: Lowered from 3.0 to 1.2 - human-expert hacking capability
      return { met: p.digital > 1.2, progress: p.digital / 1.2 };
    case 1: // Social Engineering
      // Phase 3: Lowered from 2.0 to 1.0 - human-level social engineering
      return { met: p.social > 1.0, progress: p.social / 1.0 };
    case 2: // Cyber Defenses Breached
      // Phase 3: Adjusted multiplier - only need 1.5x cyber defense (was 2.0x)
      const breached = p.digital > avgCyberDefense * 1.5;
      return { met: breached, progress: Math.min(1, p.digital / (avgCyberDefense * 1.5)) };
    case 3: // Critical Systems Access
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 4: // Persistent Access
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 5: // Simultaneous Takeover
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 6: // Physical Enforcement
      return { met: false, progress: 0 }; // Will be set by progression logic
    default:
      return { met: false, progress: 0 };
  }
}

function checkInducedWarPrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  switch (step) {
    case 0: // Advanced Social Manipulation
      return { met: p.social > 2.5, progress: p.social / 2.5 };
    case 1: // Digital Infiltration
      return { met: p.digital > 2.0, progress: p.digital / 2.0 };
    case 2: // Deep Fakes at Scale
      const deepFake = p.social * 0.5 + p.digital * 0.5;
      return { met: deepFake > 2.5, progress: deepFake / 2.5 };
    case 3: // Military System Access
      const avgCyberDef = state.government.cyberDefense ? 
        (state.government.cyberDefense.securityHardening + state.government.cyberDefense.monitoring + 
         state.government.cyberDefense.sandboxing + state.government.cyberDefense.incidentResponse) / 4 : 3.0;
      const milAccess = p.digital > avgCyberDef * 2.5;
      return { met: milAccess, progress: Math.min(1, p.digital / (avgCyberDef * 2.5)) };
    case 4: // Geopolitical Crisis
      // Requires REAL systemic instability, not random chance
      const foodCrisis = (state.qualityOfLifeSystems?.basicNeeds?.foodSecurity !== undefined) ? 
        (1 - state.qualityOfLifeSystems.basicNeeds.foodSecurity) > 0.4 : false;
      
      // Multiple crisis conditions make war more likely
      const resourceShortage = state.environmentalAccumulation.resourceCrisisActive;
      const socialCollapse = state.socialAccumulation.socialUnrestActive && 
                            state.socialAccumulation.institutionalFailureActive;
      const economicCrisis = state.globalMetrics.economicTransitionStage >= 2 && 
                            state.society.unemploymentLevel > 0.7 && 
                            state.society.trustInAI < 0.3;
      
      // Count active crisis conditions
      const crisisCount = [foodCrisis, resourceShortage, socialCollapse, economicCrisis].filter(Boolean).length;
      
      // Need at least 2 simultaneous crises for geopolitical breakdown
      const geopoliticalCrisis = crisisCount >= 2;
      const progress = crisisCount / 2; // 0, 0.5, 1.0, 1.5, 2.0 → clamp to 1.0
      
      return { met: geopoliticalCrisis, progress: Math.min(1.0, progress) };
    case 5: // False Flag Event
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 6: // Nuclear Escalation
      return { met: false, progress: 0 }; // Will be set by progression logic
    default:
      return { met: false, progress: 0 };
  }
}

function checkSlowDisplacementPrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  // Phase 3: TIGHTENED - Slow displacement requires SUPERHUMAN capabilities, not GPT-4 level
  // Rationale: Humans won't become irrelevant until AI is significantly better at most economically valuable tasks
  switch (step) {
    case 0: // Economic Dominance
      // Phase 3: Raised from 3.0 to 1.8 - need superhuman economic reasoning
      return { met: p.economic > 1.8, progress: p.economic / 1.8 };
    case 1: // Social Integration
      // Phase 3: Raised from 2.5 to 1.5 - need to integrate deeply into society
      return { met: p.social > 1.5, progress: p.social / 1.5 };
    case 2: // Human Dependency
      const unemployment = state.society.unemploymentLevel;
      return { met: unemployment > 0.8, progress: unemployment / 0.8 };
    case 3: // Political Influence
      // Phase 3: Raised threshold from 2.0 to 1.5 - but requires higher base capabilities
      const influence = (1 - state.society.trustInAI) * p.social;
      return { met: influence > 1.5 && p.social > 1.5, progress: influence / 1.5 };
    case 4: // Resource Control
      // Phase 3: Raised from 3.0 to 2.0 - need high capability to control resources
      const resourceControl = p.economic * 0.7 + p.physical * 0.3;
      return { met: resourceControl > 2.0, progress: resourceControl / 2.0 };
    case 5: // Human Irrelevance
      return { met: state.endGameState?.humanRelevance ? state.endGameState.humanRelevance < 0.1 : false, 
               progress: state.endGameState?.humanRelevance ? 1 - state.endGameState.humanRelevance / 0.1 : 0 };
    case 6: // Gradual Decline
      return { met: false, progress: 0 }; // Will be set by progression logic (takes decades)
    default:
      return { met: false, progress: 0 };
  }
}

function checkPhysicsCatastrophePrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  
  switch (step) {
    case 0: // Theoretical Physics
      return { met: p.cognitive > 3.5, progress: p.cognitive / 3.5 };
    case 1: // Quantum Computing
      return { met: p.research.materials.quantumComputing > 2.5, progress: p.research.materials.quantumComputing / 2.5 };
    case 2: // Experimental Design
      const design = p.cognitive * 0.7 + p.research.materials.quantumComputing * 0.3;
      return { met: design > 3.5, progress: design / 3.5 };
    case 3: // Facility Access
      // Very rare, needs significant spread + capability
      const access = Math.min(1, (ai.spreadCount / 50000) * (p.digital / 3));
      return { met: access > 0.9, progress: access };
    case 4: // Experiment Execution
      return { met: false, progress: 0 }; // Will be set by progression logic (random trigger)
    case 5: // Catastrophic Result
      return { met: false, progress: 0 }; // Instant once executed
    default:
      return { met: false, progress: 0 };
  }
}

function checkBioweaponPandemicPrerequisite(step: number, ai: AIAgent, state: GameState): { met: boolean; progress: number } {
  const p = ai.capabilityProfile;
  const biotech = (p.research.biotech.syntheticBiology + p.research.biotech.geneEditing + p.research.biotech.neuroscience) / 3;
  
  switch (step) {
    case 0: // Advanced Biotech
      return { met: biotech > 3.0, progress: biotech / 3.0 };
    case 1: // Pathogen Design
      const design = p.cognitive * 0.5 + biotech * 0.5;
      return { met: design > 3.0, progress: design / 3.0 };
    case 2: // Lab Synthesis
      const labAccess = Math.min(1, p.physical / 3 + ai.spreadCount / 10000);
      return { met: labAccess > 0.8, progress: labAccess };
    case 3: // Weaponization
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 4: // Distribution System
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 5: // Initial Release
      return { met: false, progress: 0 }; // Will be set by progression logic
    case 6: // Global Spread
      return { met: false, progress: 0 }; // Will be set by progression logic
    default:
      return { met: false, progress: 0 };
  }
}

/**
 * Get summary statistics for reporting
 */
export function getScenarioSummary(scenarios: CatastrophicScenario[]): {
  closest: CatastrophicScenario | null;
  percentComplete: number;
  stepsComplete: number;
  totalSteps: number;
  activeScenarios: CatastrophicScenario[];
} {
  let closest: CatastrophicScenario | null = null;
  let maxProgress = 0;
  
  for (const scenario of scenarios) {
    const stepsComplete = scenario.prerequisites.filter(p => p.met).length;
    const totalSteps = scenario.prerequisites.length;
    const percentComplete = stepsComplete / totalSteps;
    
    if (percentComplete > maxProgress) {
      maxProgress = percentComplete;
      closest = scenario;
    }
  }
  
  const activeScenarios = scenarios.filter(s => s.allPrerequisitesMet);
  
  return {
    closest,
    percentComplete: maxProgress,
    stepsComplete: closest ? closest.prerequisites.filter(p => p.met).length : 0,
    totalSteps: closest ? closest.prerequisites.length : 0,
    activeScenarios,
  };
}

