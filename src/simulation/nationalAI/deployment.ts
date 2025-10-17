/**
 * National AI Deployment & Capability Development
 *
 * Handles:
 * - Domestic presence tracking (which orgs/AIs belong to which nations)
 * - Indigenous capability development
 * - Open source frontier updates
 * - Espionage mechanics
 * - Export controls
 */

import { GameState, GameEvent } from '@/types/game';
import { NationName } from '@/types/nationalAI';
import { CountryInteractionCache } from './interactionCache';

// ============================================================================
// DOMESTIC PRESENCE
// ============================================================================

/**
 * Update which organizations and AI models belong to which nations
 */
export function updateDomesticPresence(state: GameState): void {
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

/**
 * Update indigenous AI capabilities based on domestic development
 */
export function updateIndigenousCapabilities(state: GameState, cache: CountryInteractionCache): void {
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
      const usNation = cache.usNation;
      if (!usNation) continue;

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

/**
 * Update open source frontier and propagate to all nations
 */
export function updateOpenSourceFrontier(state: GameState): void {
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

  // Propagate open source to ALL nations (universal access)
  for (const nation of natAI.nations) {
    nation.openSourceCapability = natAI.openSourceFrontier.frontierCapability;
  }
}

// ============================================================================
// EXPORT CONTROLS
// ============================================================================

/**
 * Apply US export controls on China & Russia
 */
export function applyExportControls(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;

  const usNation = cache.usNation;
  const chinaNation = cache.chinaNation;
  const russiaNation = cache.nationMap.get('Russia');

  if (!usNation || !chinaNation || !russiaNation) return;

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

/**
 * Update espionage attempts and successful thefts
 */
export function updateEspionage(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;
  const espionage = natAI.espionage;

  const usNation = cache.usNation;
  const chinaNation = cache.chinaNation;
  const russiaNation = cache.nationMap.get('Russia');

  if (!usNation || !chinaNation || !russiaNation) return;

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

/**
 * Calculate effective capabilities (max of all sources)
 */
export function updateEffectiveCapabilities(state: GameState): void {
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

/**
 * Update strategic positions (gaps, leaders)
 */
export function updateStrategicPositions(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;

  // Use cached global leader
  natAI.globalLeader = cache.globalLeader;
  natAI.globalFrontier = cache.globalFrontier;

  const usNation = cache.usNation;
  const chinaNation = cache.chinaNation;

  if (!usNation || !chinaNation) return;

  // Calculate gaps using cache
  for (const nation of natAI.nations) {
    nation.leading = nation.nation === cache.globalLeader;
    nation.gap = cache.globalFrontier - nation.effectiveCapability;
    nation.gapFromUS = usNation.effectiveCapability - nation.effectiveCapability;
    nation.gapFromChina = chinaNation.effectiveCapability - nation.effectiveCapability;
  }
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
