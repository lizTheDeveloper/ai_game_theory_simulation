/**
 * National AI Capabilities & Asymmetry System
 * 
 * Models how capability gaps between nations drive AI race intensity.
 * Key insight: Asymmetry creates racing dynamics, not absolute capability.
 * 
 * Dynamics:
 * - Indigenous development (domestic labs)
 * - Open source propagation (universal access)
 * - Espionage & leaks ("accidentally open source")
 * - Export controls (restrict commercial access)
 * - AI race intensity = f(capability gap, geopolitical tension)
 */

import { GameState, GameEvent, AIAgent } from '../types/game';
import {
  NationalAISystem,
  NationalAICapability,
  NationName,
  GlobalOpenSourceFrontier,
  EspionageTracking,
  AIRaceIntensityFactors,
  NATIONAL_AI_BASELINES_2023,
} from '../types/nationalAI';

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeNationalAI(): NationalAISystem {
  const nations: NationalAICapability[] = [];
  
  // Initialize all 9 nations from baselines
  for (const [nationName, baseline] of Object.entries(NATIONAL_AI_BASELINES_2023)) {
    nations.push({
      nation: nationName as NationName,
      
      // Capability sources (start with indigenous only)
      indigenousCapability: baseline.indigenousCapability,
      openSourceCapability: 0, // No open source yet
      stolenCapability: 0,
      commercialAccess: baseline.indigenousCapability, // Can access own models
      
      effectiveCapability: baseline.indigenousCapability,
      
      // Strategic position
      leading: nationName === 'United States',
      gap: 0,
      gapFromUS: 0,
      gapFromChina: 0,
      
      // Resources
      computeAccess: baseline.computeAccess,
      talentPool: baseline.talentPool,
      investmentLevel: baseline.investmentLevel,
      
      // Policy
      exportControls: {
        restrictedModels: [],
        modelsDeniedTo: baseline.exportControlTarget ? [] : ['China', 'Russia'] as NationName[],
        chipsDeniedTo: baseline.exportControlTarget ? [] : ['China', 'Russia'] as NationName[],
        cloudsDeniedTo: baseline.exportControlTarget ? [] : ['China', 'Russia'] as NationName[],
        enforcementLevel: 0.7, // 70% enforcement
        leakProbability: 0.1, // 10% circumvention
      },
      
      // Military
      militaryAI: 0,
      nuclearIntegration: 0,
      
      // Domestic presence (will be updated as orgs/AIs spawn)
      domesticLabs: [],
      domesticModels: [],
    });
  }
  
  return {
    nations,
    
    globalLeader: 'United States',
    globalFrontier: 1.0, // GPT-4 level
    
    openSourceFrontier: {
      frontierCapability: 0.7, // Llama 2 level (70% of GPT-4)
      lagBehindClosed: 6, // 6 months behind
      openSourceModels: [],
      contributions: {
        'United States': 0.7,
        'China': 0,
        'United Kingdom': 0,
        'European Union': 0.3, // Mistral
        'Russia': 0,
        'Israel': 0,
        'India': 0,
        'South Korea': 0,
        'Japan': 0,
      },
    },
    
    espionage: {
      chinaTheftAttempts: 0,
      chinaSuccessfulThefts: 0,
      russiaTheftAttempts: 0,
      russiaSuccessfulThefts: 0,
      accidentalLeaks: [],
      baseTheftRate: 0.01 / 12, // 1% per year = 0.083% per month
      modelCountFactor: 1.0,
      securityLevelFactor: 1.0,
      stateSponsoredMultiplier: 10,
    },
    
    raceIntensity: {
      capabilityGap: 0.2, // US ahead by 20%
      usLeading: true,
      chinaLeading: false,
      bilateralTension: 0.5,
      nuclearFlashpoints: 0,
      militaryAIDeployed: false,
      autonomousWeapons: false,
      exportControlsActive: true,
      chinaAccelerating: false,
      raceIntensity: 0.3, // Moderate
      gapContribution: 0.1,
      tensionContribution: 0.15,
      militaryContribution: 0.05,
    },
    
    cooperationAgreement: null,
    
    significantEvents: [],
  };
}

// ============================================================================
// MAIN UPDATE
// ============================================================================

export function updateNationalAI(state: GameState): void {
  const natAI = state.nationalAI;
  
  // Update domestic presence (which orgs/AIs belong to which nations)
  updateDomesticPresence(state);
  
  // Update indigenous capabilities from domestic labs
  updateIndigenousCapabilities(state);
  
  // Update open source frontier
  updateOpenSourceFrontier(state);
  
  // Propagate open source to all nations
  propagateOpenSource(state);
  
  // Apply export controls (restrict commercial access)
  applyExportControls(state);
  
  // Espionage attempts (steal models)
  updateEspionage(state);
  
  // Calculate effective capabilities (max of all sources)
  updateEffectiveCapabilities(state);
  
  // Update strategic positions (gaps, leaders)
  updateStrategicPositions(state);
  
  // Calculate AI race intensity
  calculateRaceIntensity(state);
  
  // Check for cooperation triggers
  checkCooperationTriggers(state);
  
  // Update cooperation agreement (if active)
  if (natAI.cooperationAgreement?.active) {
    updateCooperationAgreement(state);
  }
}

// ============================================================================
// DOMESTIC PRESENCE
// ============================================================================

function updateDomesticPresence(state: GameState): void {
  const natAI = state.nationalAI;
  
  // Map organizations to nations (simplified: based on org name)
  const orgNationMap: Record<string, NationName> = {
    'OpenAI': 'United States',
    'Anthropic': 'United States',
    'Google DeepMind': 'United Kingdom', // UK-based but US-owned
    'Meta AI': 'United States',
    'Baidu': 'China',
    'Alibaba': 'China',
    'Tencent': 'China',
    'Mistral': 'European Union',
    'Yandex': 'Russia',
  };
  
  // Update domestic labs
  for (const nation of natAI.nations) {
    nation.domesticLabs = state.organizations
      .filter(org => orgNationMap[org.name] === nation.nation)
      .map(org => org.id);
    
    // Update domestic models
    nation.domesticModels = state.aiAgents
      .filter(ai => {
        // Check if AI was created by a domestic org
        // For now, use heuristic: first few AIs go to major nations
        if (state.aiAgents.indexOf(ai) < 3) return nation.nation === 'United States';
        if (state.aiAgents.indexOf(ai) < 5) return nation.nation === 'China';
        return nation.domesticLabs.length > 0; // Has domestic labs
      })
      .map(ai => ai.id);
  }
}

// ============================================================================
// INDIGENOUS CAPABILITIES
// ============================================================================

function updateIndigenousCapabilities(state: GameState): void {
  const natAI = state.nationalAI;
  
  for (const nation of natAI.nations) {
    // Indigenous capability = best domestic model
    const domesticAIs = state.aiAgents.filter(ai => nation.domesticModels.includes(ai.id));
    
    if (domesticAIs.length > 0) {
      nation.indigenousCapability = Math.max(
        ...domesticAIs.map(ai => ai.capability),
        nation.indigenousCapability // Don't decrease
      );
    }
    
    // Investment accelerates indigenous development (if targeted by export controls)
    if (nation.exportControls.modelsDeniedTo.length === 0 && // This nation is targeted
        (nation.nation === 'China' || nation.nation === 'Russia')) {
      // Accelerated indigenous development due to export controls
      const monthlyGrowth = (nation.investmentLevel / 1000) * nation.computeAccess;
      nation.indigenousCapability += monthlyGrowth;
      
      // Check if this closed the gap significantly
      const usNation = natAI.nations.find(n => n.nation === 'United States')!;
      const previousGap = nation.gap;
      const newGap = usNation.effectiveCapability - nation.indigenousCapability;
      
      if (previousGap - newGap > 0.1 && state.currentMonth % 12 === 0) {
        addEvent(state, {
          type: 'breakthrough',
          severity: 'warning',
          agent: nation.nation,
          title: `🚀 ${nation.nation} Indigenous AI Breakthrough`,
          description: `Export controls drove ${nation.nation} to accelerate domestic AI development. Capability gap narrowed by ${((previousGap - newGap) * 100).toFixed(0)}%.`,
          effects: { indigenous_breakthrough: 1.0, gap_closing: 1.0 }
        });
      }
    }
  }
}

// ============================================================================
// OPEN SOURCE
// ============================================================================

function updateOpenSourceFrontier(state: GameState): void {
  const natAI = state.nationalAI;
  const openSource = natAI.openSourceFrontier;
  
  // Check for new open source releases
  const openSourceAIs = state.aiAgents.filter(ai => {
    // Heuristic: AIs from Meta, Mistral are open source
    // In reality, would check ai.openSource flag
    const orgName = state.organizations.find(org => 
      org.ownedModels?.includes(ai.id)
    )?.name;
    return orgName === 'Meta AI' || orgName === 'Mistral';
  });
  
  if (openSourceAIs.length > 0) {
    const bestOpenSource = Math.max(...openSourceAIs.map(ai => ai.capability));
    
    if (bestOpenSource > openSource.frontierCapability) {
      const prevFrontier = openSource.frontierCapability;
      openSource.frontierCapability = bestOpenSource;
      openSource.openSourceModels = openSourceAIs.map(ai => ai.id);
      
      // Calculate lag behind closed source
      openSource.lagBehindClosed = Math.max(0, 
        (natAI.globalFrontier - openSource.frontierCapability) * 12 // Rough: gap * 12 months
      );
      
      // Event
      addEvent(state, {
        type: 'breakthrough',
        severity: 'info',
        agent: 'Open Source',
        title: '🌍 Open Source AI Released',
        description: `New open source model (capability: ${bestOpenSource.toFixed(2)}) released. All nations now have access. Gap to frontier: ${openSource.lagBehindClosed.toFixed(0)} months.`,
        effects: { open_source_release: 1.0, capability_proliferation: 1.0 }
      });
      
      console.log(`\n🌍 OPEN SOURCE RELEASE: ${bestOpenSource.toFixed(2)} (was ${prevFrontier.toFixed(2)})`);
      console.log(`   Lag behind closed: ${openSource.lagBehindClosed.toFixed(0)} months`);
      
      // Reduces race intensity (transparency)
      natAI.raceIntensity.raceIntensity *= 0.9;
    }
  }
}

function propagateOpenSource(state: GameState): void {
  const natAI = state.nationalAI;
  
  // ALL nations get access to open source (universal access)
  for (const nation of natAI.nations) {
    nation.openSourceCapability = natAI.openSourceFrontier.frontierCapability;
  }
}

// ============================================================================
// EXPORT CONTROLS
// ============================================================================

function applyExportControls(state: GameState): void {
  const natAI = state.nationalAI;
  
  const usNation = natAI.nations.find(n => n.nation === 'United States')!;
  const chinaNation = natAI.nations.find(n => n.nation === 'China')!;
  const russiaNation = natAI.nations.find(n => n.nation === 'Russia')!;
  
  // US export controls on China & Russia
  const exportControlsActive = usNation.indigenousCapability > 1.5; // Only if US is advanced
  
  if (exportControlsActive !== natAI.raceIntensity.exportControlsActive && exportControlsActive) {
    natAI.raceIntensity.exportControlsActive = true;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'warning',
      agent: 'United States',
      title: '🚫 AI Export Controls Imposed',
      description: 'US restricts advanced AI access to China and Russia. Security dilemma: Forces adversaries to accelerate indigenous development.',
      effects: { export_controls: 1.0, race_acceleration: 1.0 }
    });
    
    console.log(`\n🚫 EXPORT CONTROLS: US restricts AI access to China, Russia`);
  }
  
  // Apply restrictions
  for (const nation of natAI.nations) {
    if (nation.nation === 'China' || nation.nation === 'Russia') {
      // Restricted nations lose commercial access (but keep open source)
      if (exportControlsActive) {
        nation.commercialAccess = 0;
        
        // BUT: Circumvention possible (leaks, third parties)
        const circumventionProb = usNation.exportControls.leakProbability;
        if (Math.random() < circumventionProb) {
          // Partial access via gray market
          nation.commercialAccess = usNation.indigenousCapability * 0.5;
        }
      }
    } else {
      // Allied nations get full commercial access
      nation.commercialAccess = usNation.indigenousCapability;
    }
  }
  
  // China accelerates spending if restricted
  if (exportControlsActive && !natAI.raceIntensity.chinaAccelerating) {
    natAI.raceIntensity.chinaAccelerating = true;
    chinaNation.investmentLevel *= 1.5; // +50% spending
    
    console.log(`💰 CHINA ACCELERATES: Investment ${(chinaNation.investmentLevel / 1.5).toFixed(0)} → ${chinaNation.investmentLevel.toFixed(0)} $B/year`);
  }
}

// ============================================================================
// ESPIONAGE
// ============================================================================

function updateEspionage(state: GameState): void {
  const natAI = state.nationalAI;
  const espionage = natAI.espionage;
  
  const usNation = natAI.nations.find(n => n.nation === 'United States')!;
  const chinaNation = natAI.nations.find(n => n.nation === 'China')!;
  const russiaNation = natAI.nations.find(n => n.nation === 'Russia')!;
  
  // Update factors
  espionage.modelCountFactor = 1 + (state.aiAgents.length / 50); // More models = more attack surface
  
  // === CHINA ESPIONAGE ===
  // China targets US models
  if (usNation.domesticModels.length > 0) {
    espionage.chinaTheftAttempts++;
    
    const theftProb = 
      espionage.baseTheftRate * 
      espionage.modelCountFactor * 
      espionage.stateSponsoredMultiplier; // China 10x more effective
    
    if (Math.random() < theftProb) {
      // SUCCESSFUL THEFT
      espionage.chinaSuccessfulThefts++;
      
      // China acquires US capability (with 95% fidelity)
      const stolenCapability = usNation.indigenousCapability * 0.95;
      chinaNation.stolenCapability = Math.max(chinaNation.stolenCapability, stolenCapability);
      
      // Event
      addEvent(state, {
        type: 'crisis',
        severity: 'warning',
        agent: 'China',
        title: '🕵️ AI Model Theft',
        description: `China acquired US AI model weights via espionage (capability: ${stolenCapability.toFixed(2)}). Capability gap closed. Trust damaged.`,
        effects: { espionage: 1.0, gap_closed: 1.0 }
      });
      
      console.log(`\n🕵️ MODEL THEFT: China stole US model (cap: ${stolenCapability.toFixed(2)})`);
      console.log(`   China stolen capability: ${chinaNation.stolenCapability.toFixed(2)}`);
      
      // Reduces race intensity (gap closed) but damages trust
      natAI.raceIntensity.raceIntensity *= 0.85;
      
      // Damage bilateral relations
      const tension = state.bilateralTensions.find(t => 
        (t.nationA === 'United States' && t.nationB === 'China') ||
        (t.nationA === 'China' && t.nationB === 'United States')
      );
      if (tension) {
        tension.tensionLevel = Math.min(1.0, tension.tensionLevel + 0.1);
      }
    }
  }
  
  // === RUSSIA ESPIONAGE ===
  if (usNation.domesticModels.length > 0) {
    espionage.russiaTheftAttempts++;
    
    const theftProb = 
      espionage.baseTheftRate * 
      espionage.modelCountFactor * 
      (espionage.stateSponsoredMultiplier * 0.5); // Russia 5x (less capable than China)
    
    if (Math.random() < theftProb) {
      espionage.russiaSuccessfulThefts++;
      
      const stolenCapability = usNation.indigenousCapability * 0.90; // Lower fidelity
      russiaNation.stolenCapability = Math.max(russiaNation.stolenCapability, stolenCapability);
      
      addEvent(state, {
        type: 'crisis',
        severity: 'warning',
        agent: 'Russia',
        title: '🕵️ AI Model Theft',
        description: `Russia acquired US AI model via espionage (capability: ${stolenCapability.toFixed(2)}).`,
        effects: { espionage: 1.0 }
      });
    }
  }
  
  // === ACCIDENTAL LEAKS ===
  // More models = higher leak probability
  const leakProb = (state.aiAgents.length / 100) * 0.01; // 1% at 100 models
  
  if (Math.random() < leakProb) {
    // Random US model leaked
    if (usNation.domesticModels.length > 0) {
      const leakedModelId = usNation.domesticModels[
        Math.floor(Math.random() * usNation.domesticModels.length)
      ];
      
      const leakedAI = state.aiAgents.find(ai => ai.id === leakedModelId);
      if (leakedAI) {
        espionage.accidentalLeaks.push({
          modelId: leakedModelId,
          sourceNation: 'United States',
          month: state.currentMonth,
          method: Math.random() < 0.5 ? 'github_leak' : 'insider_leak',
        });
        
        // All nations now have access (accidentally open source)
        for (const nation of natAI.nations) {
          nation.stolenCapability = Math.max(nation.stolenCapability, leakedAI.capability * 0.9);
        }
        
        addEvent(state, {
          type: 'crisis',
          severity: 'warning',
          agent: 'Security',
          title: '📦 ACCIDENTAL AI LEAK',
          description: `US AI model accidentally leaked via ${espionage.accidentalLeaks[espionage.accidentalLeaks.length - 1].method}. Now globally accessible.`,
          effects: { accidental_leak: 1.0, capability_proliferation: 1.0 }
        });
        
        console.log(`\n📦 ACCIDENTAL LEAK: ${leakedModelId} (cap: ${leakedAI.capability.toFixed(2)})`);
      }
    }
  }
}

// ============================================================================
// EFFECTIVE CAPABILITIES
// ============================================================================

function updateEffectiveCapabilities(state: GameState): void {
  const natAI = state.nationalAI;
  
  for (const nation of natAI.nations) {
    // Effective = MAX of all sources
    nation.effectiveCapability = Math.max(
      nation.indigenousCapability,
      nation.openSourceCapability,
      nation.stolenCapability,
      nation.commercialAccess
    );
  }
}

// ============================================================================
// STRATEGIC POSITIONS
// ============================================================================

function updateStrategicPositions(state: GameState): void {
  const natAI = state.nationalAI;
  
  // Find global leader
  let maxCapability = 0;
  let leaderNation: NationName | null = null;
  
  for (const nation of natAI.nations) {
    if (nation.effectiveCapability > maxCapability) {
      maxCapability = nation.effectiveCapability;
      leaderNation = nation.nation;
    }
  }
  
  natAI.globalLeader = leaderNation;
  natAI.globalFrontier = maxCapability;
  
  // Calculate gaps
  const usNation = natAI.nations.find(n => n.nation === 'United States')!;
  const chinaNation = natAI.nations.find(n => n.nation === 'China')!;
  
  for (const nation of natAI.nations) {
    nation.leading = nation.nation === leaderNation;
    nation.gap = maxCapability - nation.effectiveCapability;
    nation.gapFromUS = usNation.effectiveCapability - nation.effectiveCapability;
    nation.gapFromChina = chinaNation.effectiveCapability - nation.effectiveCapability;
  }
}

// ============================================================================
// RACE INTENSITY CALCULATION
// ============================================================================

export function calculateRaceIntensity(state: GameState): void {
  const natAI = state.nationalAI;
  const raceFactors = natAI.raceIntensity;
  
  const usNation = natAI.nations.find(n => n.nation === 'United States')!;
  const chinaNation = natAI.nations.find(n => n.nation === 'China')!;
  
  // === CAPABILITY GAP (KEY DRIVER) ===
  raceFactors.capabilityGap = Math.abs(
    usNation.effectiveCapability - chinaNation.effectiveCapability
  );
  raceFactors.usLeading = usNation.effectiveCapability > chinaNation.effectiveCapability;
  raceFactors.chinaLeading = chinaNation.effectiveCapability > usNation.effectiveCapability;
  
  // Contribution: Gap drives racing (both leader wanting to maintain and follower wanting to catch up)
  raceFactors.gapContribution = Math.min(0.4, raceFactors.capabilityGap * 0.5);
  
  // === GEOPOLITICAL TENSION ===
  const usChinaTension = state.bilateralTensions.find(t =>
    (t.nationA === 'United States' && t.nationB === 'China') ||
    (t.nationA === 'China' && t.nationB === 'United States')
  );
  
  raceFactors.bilateralTension = usChinaTension?.tensionLevel || 0.5;
  raceFactors.nuclearFlashpoints = state.bilateralTensions.filter(t => 
    t.nuclearThreats
  ).length;
  
  // Contribution: High tension amplifies racing
  raceFactors.tensionContribution = Math.min(0.4, 
    raceFactors.bilateralTension * 0.3 +
    raceFactors.nuclearFlashpoints * 0.1
  );
  
  // === MILITARY AI ===
  raceFactors.militaryAIDeployed = usNation.militaryAI > 2.0 || chinaNation.militaryAI > 2.0;
  raceFactors.autonomousWeapons = state.madDeterrence.autonomousWeapons;
  
  // Contribution: Military AI escalates race
  raceFactors.militaryContribution = 
    (raceFactors.militaryAIDeployed ? 0.2 : 0) +
    (raceFactors.autonomousWeapons ? 0.1 : 0);
  
  // === TOTAL RACE INTENSITY ===
  raceFactors.raceIntensity = Math.min(1.0,
    raceFactors.gapContribution +
    raceFactors.tensionContribution +
    raceFactors.militaryContribution
  );
  
  // Log periodically
  if (state.currentMonth % 12 === 0) {
    console.log(`\n🏁 AI RACE INTENSITY: ${(raceFactors.raceIntensity * 100).toFixed(0)}%`);
    console.log(`   Capability Gap: US ${usNation.effectiveCapability.toFixed(2)} vs China ${chinaNation.effectiveCapability.toFixed(2)} (gap: ${raceFactors.capabilityGap.toFixed(2)})`);
    console.log(`   Gap Contribution: ${(raceFactors.gapContribution * 100).toFixed(0)}%`);
    console.log(`   Tension Contribution: ${(raceFactors.tensionContribution * 100).toFixed(0)}%`);
    console.log(`   Military Contribution: ${(raceFactors.militaryContribution * 100).toFixed(0)}%`);
  }
}

// ============================================================================
// COOPERATION
// ============================================================================

function checkCooperationTriggers(state: GameState): void {
  const natAI = state.nationalAI;
  
  if (natAI.cooperationAgreement?.active) return; // Already active
  
  // Triggers for cooperation
  const highDiplomaticAI = state.diplomaticAI.deploymentMonth !== -1 && 
    state.diplomaticAI.capability > 3.5;
  const highGlobalPeace = (state.conflictResolution?.globalPeaceLevel || 0) > 0.8;
  const nuclearCloseCall = state.eventLog.some(e =>
    e.type === 'crisis' &&
    e.title?.includes('DETERRENCE FAILED') &&
    state.currentMonth - e.timestamp < 12
  );
  const publicPressure = state.society.trustInAI < 0.3;
  
  // Need at least 3 triggers
  const triggerCount = [
    highDiplomaticAI,
    highGlobalPeace,
    nuclearCloseCall,
    publicPressure
  ].filter(Boolean).length;
  
  if (triggerCount >= 3) {
    // COOPERATION AGREEMENT FORMED
    natAI.cooperationAgreement = {
      active: true,
      signatories: ['United States', 'China', 'United Kingdom', 'European Union'],
      startMonth: state.currentMonth,
      pauseMonths: 12,
      sharedSafetyResearch: true,
      mutualInspections: false, // Hard to agree on
      jointDevelopment: false,
      complianceLevel: 0.7,
      violations: [],
      aiRaceReduction: 0.3,
      trustBoost: 0.15,
      breakRisk: 0.05, // 5% per month
      firstMoverIncentive: 0.3,
      monthsUntilBreak: 20, // Expected ~20 months
    };
    
    addEvent(state, {
      type: 'breakthrough',
      severity: 'info',
      agent: 'International',
      title: '🤝 AI COOPERATION AGREEMENT',
      description: `US, China, UK, EU agree to slow AI arms race. ${natAI.cooperationAgreement.pauseMonths} month capability pause, shared safety research. Fragile but hopeful.`,
      effects: { ai_cooperation: 1.0, race_slowdown: 1.0 }
    });
    
    console.log(`\n🤝 AI COOPERATION AGREEMENT FORMED (Month ${state.currentMonth})`);
    console.log(`   Signatories: ${natAI.cooperationAgreement.signatories.join(', ')}`);
    console.log(`   Terms: ${natAI.cooperationAgreement.pauseMonths} month pause, shared safety research`);
  }
}

function updateCooperationAgreement(state: GameState): void {
  const agreement = state.nationalAI.cooperationAgreement!;
  const natAI = state.nationalAI;
  
  // Check for violations
  const usNation = natAI.nations.find(n => n.nation === 'United States')!;
  const chinaNation = natAI.nations.find(n => n.nation === 'China')!;
  
  const monthsSinceStart = state.currentMonth - agreement.startMonth;
  
  // Detect capability jumps (violations)
  // (Simplified: check if capability increased >10% in one month)
  
  // Check for agreement collapse
  if (Math.random() < agreement.breakRisk) {
    // AGREEMENT BROKEN
    agreement.active = false;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'International',
      title: '💔 AI COOPERATION COLLAPSED',
      description: `AI cooperation agreement broke down after ${monthsSinceStart} months. First-mover incentives too strong. AI arms race resumes.`,
      effects: { cooperation_failed: 1.0, race_acceleration: 1.0 }
    });
    
    console.log(`\n💔 COOPERATION COLLAPSED (Month ${state.currentMonth}, lasted ${monthsSinceStart} months)`);
    
    // Race intensity spikes
    natAI.raceIntensity.raceIntensity = Math.min(1.0, natAI.raceIntensity.raceIntensity * 1.5);
    
  } else {
    // Agreement holds, reduce race intensity
    natAI.raceIntensity.raceIntensity *= (1 - agreement.aiRaceReduction * 0.1); // -3% per month
  }
}

// ============================================================================
// INTEGRATION WITH MAD
// ============================================================================

export function applyNationalAIToMAD(state: GameState): void {
  const natAI = state.nationalAI;
  const mad = state.madDeterrence;
  
  // Use national AI race intensity instead of simple heuristic
  const aiRaceIntensity = natAI.raceIntensity.raceIntensity;
  
  // Update MAD bilateral deterrence with accurate race intensity
  // (This replaces the simple calculation in nuclearStates.ts)
  
  // NOTE: Treaty decay and renegotiation is now handled in nuclearStates.ts
  // with gradual decay mechanics. This used to have instant collapse logic
  // but it was causing duplicate treaty collapse messages and conflicts.
}

// ============================================================================
// HELPER
// ============================================================================

function addEvent(state: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}

