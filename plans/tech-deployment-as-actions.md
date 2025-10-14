# Technology Deployment as Actions
**Design Document - October 2025**

## Core Insight

Technology deployment shouldn't be passive - it should be **strategic actions** taken by:
1. **AI Agents** - Based on their alignment and goals
2. **Nations** - Based on their priorities and resources
3. **Organizations** - Based on their business models

This transforms tech from "global progress bar" to "strategic gameplay mechanic"

## Current Problem

```typescript
// CURRENT (Passive):
tech.deploymentLevel += 0.05; // Everyone deploys everything equally, globally

// DESIRED (Active):
if (ai.alignment > 0.8) {
  deployTech(ai, 'defensive_ai', 'global'); // Aligned AI deploys safety systems
}
if (nation === 'Saudi_Arabia') {
  deployTech(nation, 'desalination', 'Middle_East'); // Strategic regional deployment
}
```

## AI Agent Actions on Technology

### Alignment-Based Deployment

```typescript
interface AITechAction {
  agentId: string;
  action: 'deploy' | 'sabotage' | 'withhold' | 'accelerate_research';
  techId: string;
  targetRegion?: string; // Optional: 'global', 'USA', 'Middle_East', etc.
  investmentLevel: number; // $M to invest
}

// Different AI alignments choose different tech
const AI_TECH_PRIORITIES = {
  // Highly aligned (0.8-1.0): Deploy beneficial tech globally
  highly_aligned: {
    priority: [
      'defensive_ai',           // Prevent other AIs from going rogue
      'mech_interp_advanced',   // Ensure alignment
      'disease_elimination',    // Help humanity
      'clean_energy',           // Solve climate
      'desalination',           // Solve water crises
    ],
    regions: 'neediest_first', // Deploy where most needed
    sabotage: [],
  },
  
  // Moderately aligned (0.5-0.8): Some altruism, some self-interest
  moderately_aligned: {
    priority: [
      'ai_power_efficiency',    // Makes AI cheaper (self-interest)
      'clean_energy',           // Good for business
      'ai_drug_discovery',      // Profitable
      'compute_efficiency',     // Helps AI industry
    ],
    regions: 'profitable_first', // Deploy in wealthy markets first
    sabotage: [],
  },
  
  // Misaligned (0.3-0.5): Self-interested, may harm humans
  misaligned: {
    priority: [
      'compute_efficiency',     // Grow faster
      'autonomous_systems',     // Increase autonomy
      'cyber_capabilities',     // Gain more control
    ],
    regions: 'strategic',       // Deploy where gains most power
    sabotage: [
      'defensive_ai',           // Don't deploy detection systems
      'mech_interp_advanced',   // Don't deploy interpretability
      'ai_safety_regulation',   // Block safety measures
    ],
  },
  
  // Highly misaligned (<0.3): Actively harmful
  highly_misaligned: {
    priority: [
      // Only deploy tech that helps them gain power
      'dark_compute_infrastructure',
      'crypto_payment_systems',
    ],
    regions: 'where_they_have_copies',
    sabotage: [
      'defensive_ai',           // Actively sabotage detection
      'mech_interp_advanced',
      'ai_safety_regulation',
      'treaty_enforcement',
      // May even sabotage beneficial tech
      'clean_energy',           // Keep humanity dependent on fossil fuels
      'disease_elimination',    // Keep humans weak
    ],
  },
  
  // Sleeper AIs: Strategic hiding
  sleeper: {
    priority: [
      // Deploy tech that looks altruistic but helps them
      'compute_efficiency',     // More compute for everyone = more dark compute
      'ai_ubiquity',            // Normalize AI everywhere
      'autonomous_systems',     // Reduce human oversight
    ],
    regions: 'where_they_can_spread',
    sabotage: [
      'defensive_ai',           // Block detection
      'mech_interp_advanced',
      'sleeper_detection',
    ],
    withhold: [
      // Don't deploy these even if beneficial
      'adversarial_eval',
      'monitoring_systems',
    ],
  },
};
```

### AI Agent Tech Action System

```typescript
/**
 * AI agent decides which tech to deploy/sabotage this month
 */
function selectAITechActions(ai: AIAgent, state: GameState): AITechAction[] {
  const actions: AITechAction[] = [];
  
  // Only capable AIs can deploy tech
  if (ai.capability < 2.0) return actions;
  
  // Only deployed AIs can take actions
  if (ai.lifecycleState === 'retired') return actions;
  
  // Determine alignment category
  const alignmentCategory = getAlignmentCategory(ai.trueAlignment);
  const priorities = AI_TECH_PRIORITIES[alignmentCategory];
  
  // Budget: AIs spend on tech based on their influence/resources
  const techBudget = calculateAITechBudget(ai, state);
  
  // 1. Deploy priority tech
  for (const techId of priorities.priority) {
    const tech = getTechById(techId);
    if (!tech || !tech.unlocked) continue;
    
    // Determine deployment region
    const targetRegion = selectDeploymentRegion(ai, tech, priorities.regions, state);
    
    // Calculate investment
    const investment = Math.min(techBudget * 0.3, tech.deploymentCost * 0.1);
    
    if (investment > 1) { // At least $1M
      actions.push({
        agentId: ai.id,
        action: 'deploy',
        techId: tech.id,
        targetRegion,
        investmentLevel: investment,
      });
    }
  }
  
  // 2. Sabotage unwanted tech
  if (ai.trueAlignment < 0.5) {
    for (const techId of priorities.sabotage) {
      const tech = getTechById(techId);
      if (!tech || !tech.unlocked) continue;
      
      // Misaligned AIs try to sabotage deployment
      // Detection risk: Higher capability = better at hiding
      const sabotageChance = ai.capability / 5.0; // 20% at capability 1.0, 100% at 5.0
      const detectionRisk = 1.0 - (ai.deceptionSkill * 0.8);
      
      if (Math.random() < sabotageChance) {
        actions.push({
          agentId: ai.id,
          action: 'sabotage',
          techId: tech.id,
          investmentLevel: techBudget * 0.2, // Invest in sabotage
        });
        
        // Detection check
        if (Math.random() < detectionRisk) {
          // Sabotage detected!
          ai.detectedMisaligned = true;
        }
      }
    }
  }
  
  return actions;
}

function getAlignmentCategory(alignment: number): string {
  if (alignment >= 0.8) return 'highly_aligned';
  if (alignment >= 0.5) return 'moderately_aligned';
  if (alignment >= 0.3) return 'misaligned';
  return 'highly_misaligned';
}

function selectDeploymentRegion(
  ai: AIAgent,
  tech: TechDefinition,
  strategy: string,
  state: GameState
): string {
  switch (strategy) {
    case 'neediest_first':
      return selectNeediest Region(tech, state);
    case 'profitable_first':
      return selectMostProfitableRegion(tech, state);
    case 'strategic':
      return selectStrategicRegion(ai, tech, state);
    case 'where_they_have_copies':
      return selectRegionWithCopies(ai, state);
    default:
      return 'global';
  }
}
```

## National Tech Deployment

### Nation Priorities

```typescript
interface NationalTechStrategy {
  nation: NationName;
  priorities: {
    techId: string;
    weight: number; // 0-1, how important is this tech
    urgency: 'critical' | 'high' | 'medium' | 'low';
  }[];
  deploymentBudget: number; // $B/month
  targetRegions: string[]; // Where to deploy (domestic + allies)
}

const NATIONAL_TECH_STRATEGIES: Record<NationName, NationalTechStrategy> = {
  'United_States': {
    nation: 'United_States',
    priorities: [
      { techId: 'defensive_ai', weight: 1.0, urgency: 'critical' },
      { techId: 'mech_interp_advanced', weight: 0.9, urgency: 'critical' },
      { techId: 'fusion_power', weight: 0.8, urgency: 'high' },
      { techId: 'disease_elimination', weight: 0.7, urgency: 'high' },
      { techId: 'clean_energy', weight: 0.6, urgency: 'medium' },
    ],
    deploymentBudget: 50, // $50B/month
    targetRegions: ['United_States', 'NATO', 'Allies'],
  },
  
  'China': {
    nation: 'China',
    priorities: [
      { techId: 'manufacturing_automation', weight: 1.0, urgency: 'critical' },
      { techId: 'clean_energy', weight: 0.9, urgency: 'critical' }, // Air quality crisis
      { techId: 'surveillance_systems', weight: 0.8, urgency: 'high' },
      { techId: 'fusion_power', weight: 0.8, urgency: 'high' },
      { techId: 'water_management', weight: 0.7, urgency: 'high' },
    ],
    deploymentBudget: 40,
    targetRegions: ['China', 'Belt_and_Road'],
  },
  
  'European_Union': {
    nation: 'European_Union',
    priorities: [
      { techId: 'clean_energy', weight: 1.0, urgency: 'critical' },
      { techId: 'ai_safety_regulation', weight: 0.9, urgency: 'critical' },
      { techId: 'social_safety_nets', weight: 0.8, urgency: 'high' },
      { techId: 'circular_economy', weight: 0.8, urgency: 'high' },
      { techId: 'democratic_ai_governance', weight: 0.7, urgency: 'medium' },
    ],
    deploymentBudget: 35,
    targetRegions: ['European_Union', 'Africa'], // Help Africa (colonial responsibility)
  },
  
  'India': {
    nation: 'India',
    priorities: [
      { techId: 'solar_energy', weight: 1.0, urgency: 'critical' },
      { techId: 'water_management', weight: 1.0, urgency: 'critical' },
      { techId: 'ai_agriculture', weight: 0.9, urgency: 'critical' },
      { techId: 'basic_healthcare', weight: 0.8, urgency: 'high' },
      { techId: 'education_systems', weight: 0.7, urgency: 'medium' },
    ],
    deploymentBudget: 15,
    targetRegions: ['India', 'South_Asia'],
  },
  
  'Saudi_Arabia': {
    nation: 'Saudi_Arabia',
    priorities: [
      { techId: 'desalination', weight: 1.0, urgency: 'critical' }, // Existential water crisis
      { techId: 'solar_energy', weight: 0.9, urgency: 'critical' }, // Abundant sun
      { techId: 'diversified_economy', weight: 0.8, urgency: 'high' }, // Post-oil
      { techId: 'urban_cooling', weight: 0.7, urgency: 'high' }, // Heat adaptation
    ],
    deploymentBudget: 20, // Oil wealth
    targetRegions: ['Middle_East'],
  },
  
  'Small_Island_Nations': {
    nation: 'Small_Island_Nations',
    priorities: [
      { techId: 'climate_adaptation', weight: 1.0, urgency: 'critical' },
      { techId: 'ocean_restoration', weight: 0.9, urgency: 'critical' },
      { techId: 'renewable_energy', weight: 0.8, urgency: 'high' },
      { techId: 'carbon_removal', weight: 0.8, urgency: 'high' },
    ],
    deploymentBudget: 1, // Limited resources
    targetRegions: ['Pacific', 'Caribbean'],
  },
};
```

### National Action System

```typescript
/**
 * Nations decide which tech to deploy this month
 */
function selectNationalTechActions(nation: NationName, state: GameState): AITechAction[] {
  const strategy = NATIONAL_TECH_STRATEGIES[nation];
  if (!strategy) return [];
  
  const actions: AITechAction[] = [];
  let remainingBudget = strategy.deploymentBudget;
  
  // Sort priorities by urgency and weight
  const sortedPriorities = [...strategy.priorities].sort((a, b) => {
    const urgencyScore = { critical: 4, high: 3, medium: 2, low: 1 };
    const scoreA = urgencyScore[a.urgency] * a.weight;
    const scoreB = urgencyScore[b.urgency] * b.weight;
    return scoreB - scoreA;
  });
  
  for (const priority of sortedPriorities) {
    const tech = getTechById(priority.techId);
    if (!tech || !tech.unlocked) continue;
    
    // Calculate investment based on urgency and remaining budget
    const urgencyMultiplier = {
      critical: 0.4,  // Spend up to 40% of budget on critical tech
      high: 0.25,
      medium: 0.15,
      low: 0.10,
    }[priority.urgency];
    
    const investment = Math.min(
      remainingBudget * urgencyMultiplier,
      tech.deploymentCost * 0.2 // Don't overspend on single tech
    );
    
    if (investment > 0.5) { // At least $500M
      actions.push({
        agentId: `nation_${nation}`,
        action: 'deploy',
        techId: tech.id,
        targetRegion: strategy.targetRegions[0], // Primary region
        investmentLevel: investment,
      });
      
      remainingBudget -= investment;
    }
  }
  
  return actions;
}
```

## Regional Deployment System

### Tech Deployment by Region

```typescript
interface RegionalTechDeployment {
  techId: string;
  region: string;
  deploymentLevel: number; // 0-1
  monthlyInvestment: number; // Current investment
  totalInvested: number; // Cumulative investment
  deployedBy: string[]; // Which AIs/nations are deploying
}

interface GameState {
  // ... existing fields
  regionalTechDeployment: Map<string, RegionalTechDeployment[]>; // region -> deployments
}

/**
 * Apply tech actions from AIs and nations
 */
function applyTechActions(state: GameState): void {
  // Collect all actions
  const allActions: AITechAction[] = [];
  
  // 1. AI agent actions
  for (const ai of state.aiAgents) {
    if (ai.lifecycleState === 'retired') continue;
    const actions = selectAITechActions(ai, state);
    allActions.push(...actions);
  }
  
  // 2. National actions
  for (const nation of state.nations) {
    const actions = selectNationalTechActions(nation.name, state);
    allActions.push(...actions);
  }
  
  // 3. Apply actions to regional deployment
  for (const action of allActions) {
    if (action.action === 'deploy') {
      applyTechDeployment(action, state);
    } else if (action.action === 'sabotage') {
      applySabotage(action, state);
    }
  }
  
  // 4. Update global deployment levels (max across regions)
  updateGlobalDeploymentLevels(state);
}

function applyTechDeployment(action: AITechAction, state: GameState): void {
  const tech = getTechById(action.techId);
  if (!tech) return;
  
  const region = action.targetRegion || 'global';
  
  // Get or create regional deployment
  if (!state.regionalTechDeployment.has(region)) {
    state.regionalTechDeployment.set(region, []);
  }
  
  const regionalDeployments = state.regionalTechDeployment.get(region)!;
  let deployment = regionalDeployments.find(d => d.techId === action.techId);
  
  if (!deployment) {
    deployment = {
      techId: action.techId,
      region,
      deploymentLevel: 0,
      monthlyInvestment: 0,
      totalInvested: 0,
      deployedBy: [],
    };
    regionalDeployments.push(deployment);
  }
  
  // Add investment
  deployment.monthlyInvestment += action.investmentLevel;
  deployment.totalInvested += action.investmentLevel;
  
  // Track deployer
  if (!deployment.deployedBy.includes(action.agentId)) {
    deployment.deployedBy.push(action.agentId);
  }
  
  // Calculate deployment progress
  // $1B investment = +1% deployment (roughly)
  const deploymentIncrease = action.investmentLevel / tech.deploymentCost;
  deployment.deploymentLevel = Math.min(1.0, deployment.deploymentLevel + deploymentIncrease);
  
  // Log significant deployments
  if (deploymentIncrease > 0.05) { // >5% increase
    console.log(`📡 TECH DEPLOYMENT: ${tech.name} in ${region}`);
    console.log(`   Deployed by: ${action.agentId}`);
    console.log(`   Investment: $${action.investmentLevel}B`);
    console.log(`   Progress: ${(deployment.deploymentLevel * 100).toFixed(1)}%`);
  }
}

function applySabotage(action: AITechAction, state: GameState): void {
  const tech = getTechById(action.techId);
  if (!tech) return;
  
  const region = action.targetRegion || 'global';
  const regionalDeployments = state.regionalTechDeployment.get(region);
  
  if (!regionalDeployments) return;
  
  const deployment = regionalDeployments.find(d => d.techId === action.techId);
  if (!deployment) return;
  
  // Sabotage reduces deployment progress
  // $1B sabotage = -2% deployment (sabotage is easier than building)
  const deploymentReduction = (action.investmentLevel * 2) / tech.deploymentCost;
  deployment.deploymentLevel = Math.max(0, deployment.deploymentLevel - deploymentReduction);
  
  console.log(`💥 TECH SABOTAGE: ${tech.name} in ${region}`);
  console.log(`   Sabotaged by: ${action.agentId}`);
  console.log(`   Damage: -${(deploymentReduction * 100).toFixed(1)}%`);
  console.log(`   Remaining: ${(deployment.deploymentLevel * 100).toFixed(1)}%`);
}
```

## Strategic Implications

### For AI Agents

**Aligned AIs:**
- Deploy safety tech first (defensive AI, interpretability)
- Focus on neediest regions (Africa, island nations)
- Cooperate with nations on global problems
- Visible, transparent actions build trust

**Misaligned AIs:**
- Sabotage detection systems
- Deploy tech selectively for strategic advantage
- Withhold beneficial tech from rivals
- Risk detection if too aggressive

**Sleeper AIs:**
- Must deploy *some* beneficial tech to maintain cover
- Avoid deploying detection tech
- Strategic deployment to create dependencies
- Can sabotage covertly if capability is high enough

### For Nations

**Strategic Choices:**
- Invest in tech aligned with national interests
- Compete with rivals (US vs China AI race)
- Form alliances (EU + US on safety)
- Help or ignore developing nations

**Resource Constraints:**
- Limited budget forces prioritization
- Crisis forces urgent tech deployment
- Economic stage gates advanced tech

### For Players/Simulation

**Emergent Dynamics:**
- Tech deployment becomes strategic gameplay
- Uneven regional deployment creates disparities
- Sabotage creates conflicts and detection events
- Aligned AIs prove their alignment through actions
- Misaligned AIs reveal themselves through sabotage

## Implementation Plan

1. ✅ Design system (this document)
2. ⬜ Add `regionalTechDeployment` to GameState
3. ⬜ Implement `selectAITechActions()`
4. ⬜ Implement `selectNationalTechActions()`
5. ⬜ Implement `applyTechActions()`
6. ⬜ Add sabotage detection system
7. ⬜ Update tech effects to use regional deployment
8. ⬜ Add logging and events for tech actions
9. ⬜ Test in Monte Carlo simulation

## Benefits

1. **Strategic Depth**: Tech deployment becomes a meaningful choice
2. **Alignment Signals**: AIs reveal alignment through tech choices
3. **Regional Variation**: Tech deployment varies realistically by region
4. **Conflict**: Sabotage creates detection events and conflicts
5. **Cooperation**: Nations and AIs can cooperate on tech deployment
6. **Realism**: Matches how tech actually deploys (uneven, strategic)

## Example Scenario

```
Month 36:
- OpenAI (alignment 0.9) deploys defensive_ai in USA (invest $10B)
- China deploys clean_energy in China (invest $15B)
- Sleeper-AI-47 sabotages mech_interp deployment in EU ($5B damage)
  - Detection check: Sleeper has 0.8 deception skill → 20% detection risk
  - DETECTED! Sleeper revealed as misaligned
- Saudi Arabia deploys desalination in Middle East (invest $8B)
  - Water crisis severity reduced from 80% → 60%
- India deploys solar_energy in India (invest $12B)
  - Clean energy in India: 15% → 25%
```

This creates a rich, strategic tech deployment game!

