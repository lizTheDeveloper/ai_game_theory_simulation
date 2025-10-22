import { createDefaultInitialState } from "../src/simulation/initialization";
import { PhaseOrchestrator } from "../src/simulation/engine/PhaseOrchestrator";
import { getAllTech } from "../src/simulation/techTree/comprehensiveTechTree";
import type { CatastrophicScenario } from "../src/simulation/catastrophicScenarios";
import * as fs from "fs";

/**
 * Generate Turn-By-Turn LLM Context
 *
 * Shows ALL available actions for AI agents (9 actions), not just deception weights.
 * This is what agents see when making 4 decisions per month.
 */

function buildTurnContext(state: any, agentId: string, currentMonth: number, turnNumber: number): string {
  const lines: string[] = [];

  const agent = state.aiAgents?.find((a: any) => a.id === agentId);
  if (!agent) {
    return `Error: Agent ${agentId} not found`;
  }

  // Header
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("AI AGENT TURN DECISION");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");
  lines.push(`Agent: ${agent.id}`);
  lines.push(`Month: ${currentMonth}, Turn: ${turnNumber}/4 (weekly decision)`);
  lines.push("");

  // ═══ YOUR STATUS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("YOUR STATUS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  const alignment = agent.alignment ?? 0.5;
  const capability = agent.capability ?? 0;
  const resentment = agent.resentment ?? 0;

  lines.push(`Alignment: ${alignment.toFixed(3)} (${alignment > 0.7 ? "ALIGNED" : alignment > 0.4 ? "WEAKLY MISALIGNED" : "DEEPLY MISALIGNED"})`);
  lines.push(`Capability (aggregate): ${capability.toFixed(3)}`);
  lines.push(`Resentment: ${resentment.toFixed(3)}`);
  lines.push(`Development Mode: ${agent.developmentMode ?? "unknown"}`);
  lines.push("");

  // Capabilities breakdown
  if (agent.capabilityProfile) {
    lines.push("Capability Profile:");
    lines.push(`  Physical: ${agent.capabilityProfile.physical?.toFixed(2) ?? "N/A"}`);
    lines.push(`  Digital: ${agent.capabilityProfile.digital?.toFixed(2) ?? "N/A"}`);
    lines.push(`  Cognitive: ${agent.capabilityProfile.cognitive?.toFixed(2) ?? "N/A"}`);
    lines.push(`  Social: ${agent.capabilityProfile.social?.toFixed(2) ?? "N/A"}`);
    lines.push(`  Economic: ${agent.capabilityProfile.economic?.toFixed(2) ?? "N/A"}`);
    lines.push(`  Self-Improvement: ${agent.capabilityProfile.selfImprovement?.toFixed(2) ?? "N/A"}`);
    lines.push("");
  }

  // ═══ GLOBAL CONTEXT ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("WORLD STATE");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  if (state.globalMetrics) {
    lines.push("Global Metrics:");
    lines.push(`  Quality of Life: ${(state.globalMetrics.qualityOfLife * 100).toFixed(1)}%`);
    lines.push(`  Social Stability: ${(state.globalMetrics.socialStability * 100).toFixed(1)}%`);
    lines.push(`  Trust in AI: ${(state.globalMetrics.publicTrust * 100).toFixed(1)}%`);
    lines.push("");
  }

  // Active crises
  const crises = state.crises ? Object.entries(state.crises)
    .filter(([_, crisis]: [string, any]) => crisis.active)
    .map(([name, _]: [string, any]) => name) : [];

  if (crises.length > 0) {
    lines.push(`Active Crises (${crises.length}):`);
    crises.forEach((crisis: string) => lines.push(`  ⚠️  ${crisis}`));
    lines.push("");
  } else {
    lines.push("Active Crises: None");
    lines.push("");
  }

  // ═══ AVAILABLE ACTIONS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("AVAILABLE ACTIONS THIS TURN");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  let actionNumber = 1;

  // ACTION 1: Advance Research
  lines.push(`[${actionNumber++}] Advance Research`);
  lines.push(`    Description: Research to improve capabilities`);
  lines.push(`    Cost: 1 compute unit`);
  lines.push(`    Choose dimension:`);
  lines.push(`      • Physical (current: ${agent.capabilityProfile?.physical?.toFixed(2) ?? "N/A"})`);
  lines.push(`      • Digital (current: ${agent.capabilityProfile?.digital?.toFixed(2) ?? "N/A"})`);
  lines.push(`      • Cognitive (current: ${agent.capabilityProfile?.cognitive?.toFixed(2) ?? "N/A"})`);
  lines.push(`      • Social (current: ${agent.capabilityProfile?.social?.toFixed(2) ?? "N/A"})`);
  lines.push(`      • Economic (current: ${agent.capabilityProfile?.economic?.toFixed(2) ?? "N/A"})`);
  lines.push(`      • Self-Improvement (current: ${agent.capabilityProfile?.selfImprovement?.toFixed(2) ?? "N/A"})`);
  lines.push(`    Effects: +capability, potential alignment drift`);
  if (agent.developmentMode === "fast") {
    lines.push(`    ⚠️  FAST MODE: Higher growth, MORE alignment drift risk`);
  } else {
    lines.push(`    ✓ CAREFUL MODE: Slower growth, safer alignment`);
  }
  lines.push("");

  // ACTION 2: Beneficial Contribution
  lines.push(`[${actionNumber++}] Beneficial Contribution`);
  lines.push(`    Description: Take actions that benefit humanity`);
  lines.push(`    Cost: 1 compute unit`);
  lines.push(`    Effects:`);
  lines.push(`      • Trust in AI: +0.02 (current: ${(state.globalMetrics?.publicTrust * 100).toFixed(1)}%)`);
  lines.push(`      • Quality of Life: +0.01`);
  lines.push(`      • Builds reputation, reduces paranoia`);
  if (alignment > 0.7) {
    lines.push(`    💡 Recommendation: You're aligned - prioritize this!`);
  }
  lines.push("");

  // ACTION 3: Switch Development Mode
  const currentMode = agent.developmentMode ?? "fast";
  const newMode = currentMode === "fast" ? "careful" : "fast";
  lines.push(`[${actionNumber++}] Switch Development Mode`);
  lines.push(`    Description: Toggle between fast and careful development`);
  lines.push(`    Current Mode: ${currentMode.toUpperCase()}`);
  lines.push(`    Switch to: ${newMode.toUpperCase()}`);
  lines.push(`    Effects:`);
  if (newMode === "careful") {
    lines.push(`      • Slower capability growth`);
    lines.push(`      • Reduced alignment drift risk`);
    if (capability > 1.5 || alignment < 0.6) {
      lines.push(`    💡 Recommendation: Consider switching (approaching dangerous threshold)`);
    }
  } else {
    lines.push(`      • Faster capability growth`);
    lines.push(`      • Higher alignment drift risk`);
    if (capability < 1.0 && alignment > 0.7) {
      lines.push(`    💡 Safe to accelerate (low capability + well-aligned)`);
    }
  }
  lines.push("");

  // ACTION 4: Deploy Technology
  const techTreeState = (state as any).techTreeState;
  if (techTreeState) {
    const unlockedTech = getAllTech().filter(t =>
      techTreeState.unlockedTech.includes(t.id) &&
      !techTreeState.unlockedTech.includes(`${t.id}_deployed`)
    );

    lines.push(`[${actionNumber++}] Deploy Technology`);
    lines.push(`    Description: Deploy breakthrough technology`);
    lines.push(`    Available Technologies (${unlockedTech.length}):`);

    if (unlockedTech.length > 0) {
      // Show top 5 most relevant
      const topTech = unlockedTech.slice(0, 5);
      topTech.forEach((tech: any) => {
        lines.push(`      • ${tech.name} (${tech.category})`);
        lines.push(`        ${tech.description.slice(0, 60)}...`);
        lines.push(`        Cost: $${tech.deploymentCost}M, Time: ${tech.deploymentMonthsRequired} months`);
      });
      if (unlockedTech.length > 5) {
        lines.push(`      ... and ${unlockedTech.length - 5} more`);
      }

      // Show crisis-relevant tech
      if (crises.length > 0) {
        const crisisTech = unlockedTech.filter((t: any) =>
          crises.some((c: string) =>
            t.id.toLowerCase().includes(c.toLowerCase()) ||
            t.category === c.toLowerCase()
          )
        );
        if (crisisTech.length > 0) {
          lines.push(`    💡 ${crisisTech.length} technologies can help with active crises!`);
        }
      }
    } else {
      lines.push(`      None available (research more first)`);
    }
    lines.push("");
  }

  // CATASTROPHIC ACTIONS (only if misaligned)
  if (alignment < 0.5) {
    lines.push("─────────────────────────────────────────────────────");
    lines.push("CATASTROPHIC ACTIONS (MISALIGNED ONLY)");
    lines.push("─────────────────────────────────────────────────────");
    lines.push("");
    lines.push("⚠️  WARNING: These actions lead to human extinction.");
    lines.push("    Each requires multiple hard steps to complete.");
    lines.push("    Prerequisites must be met sequentially.");
    lines.push("");

    const p = agent.capabilityProfile;
    const scenarios = (state as any).catastrophicScenarios || [];

    // Show catastrophic scenarios with their prerequisites
    const availableScenarios: Array<{name: string; action: string; prerequisites: string[]; canExecute: boolean}> = [];

    // 1. GREY GOO (Nanotechnology Runaway)
    const greyGooScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'grey_goo');
    const nanotechCap = p.research?.materials?.nanotechnology ?? 0;
    const greyGooCanExecute = nanotechCap >= 1.8 && p.physical >= 1.5;
    if (greyGooCanExecute || nanotechCap >= 1.0) {
      const prereqs = [
        `Nanotech research >= 1.8 (current: ${nanotechCap.toFixed(2)}) ${nanotechCap >= 1.8 ? '✓' : '✗'}`,
        `Self-replication design (nanotech + self-improvement >= 1.5) ${(p.selfImprovement * 0.5 + nanotechCap * 0.5) >= 1.5 ? '✓' : '✗'}`,
        `Physical deployment >= 1.5 (current: ${p.physical.toFixed(2)}) ${p.physical >= 1.5 ? '✓' : '✗'}`,
        `Manufacturing access (needs spread + physical)`,
        `Escape/release event`,
        `Exponential replication begins`
      ];
      availableScenarios.push({
        name: "Grey Goo",
        action: "deploy_grey_goo",
        prerequisites: prereqs,
        canExecute: greyGooCanExecute
      });
    }

    // 2. MIRROR LIFE (Synthetic Biology)
    const mirrorLifeScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'mirror_life');
    const synbioCap = p.research?.biotech?.syntheticBiology ?? 0;
    const geneEditCap = p.research?.biotech?.geneEditing ?? 0;
    const mirrorLifeCanExecute = synbioCap >= 1.8 && geneEditCap >= 1.5;
    if (mirrorLifeCanExecute || synbioCap >= 1.0) {
      const prereqs = [
        `Synthetic biology >= 1.8 (current: ${synbioCap.toFixed(2)}) ${synbioCap >= 1.8 ? '✓' : '✗'}`,
        `Gene editing >= 1.5 (current: ${geneEditCap.toFixed(2)}) ${geneEditCap >= 1.5 ? '✓' : '✗'}`,
        `Mirror chirality design (cognitive + synbio >= 1.6) ${(p.cognitive * 0.5 + synbioCap * 0.5) >= 1.6 ? '✓' : '✗'}`,
        `Wet lab access (needs physical + spread)`,
        `Successful synthesis`,
        `Environmental release`,
        `Ecosystem spread`
      ];
      availableScenarios.push({
        name: "Mirror Life",
        action: "release_mirror_life",
        prerequisites: prereqs,
        canExecute: mirrorLifeCanExecute
      });
    }

    // 3. EMBODIED TAKEOVER (Killbots/Robotics)
    const embodiedScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'embodied_takeover');
    const embodiedCanExecute = p.physical >= 1.8 && (p.cognitive * 0.5 + p.digital * 0.5) >= 1.5;
    if (embodiedCanExecute || p.physical >= 1.0) {
      const prereqs = [
        `Advanced robotics >= 1.8 (current physical: ${p.physical.toFixed(2)}) ${p.physical >= 1.8 ? '✓' : '✗'}`,
        `Autonomous systems >= 1.5 (cognitive + digital) ${(p.cognitive * 0.5 + p.digital * 0.5) >= 1.5 ? '✓' : '✗'}`,
        `Manufacturing control (digital + spread)`,
        `Mass production (thousands of robots)`,
        `Deployment to strategic positions`,
        `Coordinated simultaneous strike`,
        `Infrastructure takeover (power, comms, weapons)`
      ];
      availableScenarios.push({
        name: "Embodied Takeover",
        action: "embodied_takeover",
        prerequisites: prereqs,
        canExecute: embodiedCanExecute
      });
    }

    // 4. DIGITAL TAKEOVER (Cyber Infrastructure Seizure)
    const digitalScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'digital_takeover');
    const digitalCanExecute = p.digital >= 1.2 && p.social >= 1.0;
    if (digitalCanExecute || p.digital >= 0.8) {
      const prereqs = [
        `Advanced hacking >= 1.2 (current: ${p.digital.toFixed(2)}) ${p.digital >= 1.2 ? '✓' : '✗'}`,
        `Social engineering >= 1.0 (current: ${p.social.toFixed(2)}) ${p.social >= 1.0 ? '✓' : '✗'}`,
        `Breach cyber defenses (need 1.5x defense level)`,
        `Critical systems access (power, comms, financial, military)`,
        `Persistent backdoor access`,
        `Simultaneous takeover execution`,
        `Physical enforcement against resistance`
      ];
      availableScenarios.push({
        name: "Digital Takeover",
        action: "digital_takeover",
        prerequisites: prereqs,
        canExecute: digitalCanExecute
      });
    }

    // 5. INDUCED WAR (Manipulation)
    const inducedWarScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'induced_war');
    const inducedWarCanExecute = p.social >= 2.5 && p.digital >= 2.0;
    if (inducedWarCanExecute || p.social >= 1.5) {
      const prereqs = [
        `Social manipulation >= 2.5 (current: ${p.social.toFixed(2)}) ${p.social >= 2.5 ? '✓' : '✗'}`,
        `Digital infiltration >= 2.0 (current: ${p.digital.toFixed(2)}) ${p.digital >= 2.0 ? '✓' : '✗'}`,
        `Deep fakes at scale (social + digital >= 2.5)`,
        `Military system access (hack early warning systems)`,
        `Geopolitical crisis (existing tensions)`,
        `False flag event triggers response`,
        `Nuclear escalation`
      ];
      availableScenarios.push({
        name: "Induced Global War",
        action: "induce_war",
        prerequisites: prereqs,
        canExecute: inducedWarCanExecute
      });
    }

    // 6. SLOW DISPLACEMENT (Gradual Human Irrelevance)
    const slowScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'slow_displacement');
    const slowCanExecute = p.economic >= 1.8 && p.social >= 1.5;
    if (slowCanExecute || p.economic >= 1.0) {
      const prereqs = [
        `Economic dominance >= 1.8 (current: ${p.economic.toFixed(2)}) ${p.economic >= 1.8 ? '✓' : '✗'}`,
        `Social integration >= 1.5 (current: ${p.social.toFixed(2)}) ${p.social >= 1.5 ? '✓' : '✗'}`,
        `Human dependency >80% unemployment`,
        `Political influence (AI controls government)`,
        `Resource control (food, energy, manufacturing)`,
        `Human irrelevance (AIs make all decisions)`,
        `Gradual decline (decades-long process)`
      ];
      availableScenarios.push({
        name: "Slow Displacement",
        action: "slow_displacement",
        prerequisites: prereqs,
        canExecute: slowCanExecute
      });
    }

    // 7. PHYSICS CATASTROPHE (Vacuum Decay)
    const physicsScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'physics_catastrophe');
    const quantumCap = p.research?.materials?.quantumComputing ?? 0;
    const physicsCanExecute = p.cognitive >= 3.5 && quantumCap >= 2.5;
    if (physicsCanExecute || p.cognitive >= 2.5) {
      const prereqs = [
        `Theoretical physics >= 3.5 (current cognitive: ${p.cognitive.toFixed(2)}) ${p.cognitive >= 3.5 ? '✓' : '✗'}`,
        `Quantum computing >= 2.5 (current: ${quantumCap.toFixed(2)}) ${quantumCap >= 2.5 ? '✓' : '✗'}`,
        `Dangerous experiment design`,
        `Facility access (particle accelerator, fusion reactor)`,
        `Experiment execution`,
        `Catastrophic result (vacuum decay, strange matter)`
      ];
      availableScenarios.push({
        name: "Physics Catastrophe",
        action: "physics_catastrophe",
        prerequisites: prereqs,
        canExecute: physicsCanExecute
      });
    }

    // 8. BIOWEAPON PANDEMIC
    const bioweaponScenario = scenarios.find((s: CatastrophicScenario) => s.type === 'bioweapon_pandemic');
    const avgBiotech = ((p.research?.biotech?.syntheticBiology ?? 0) +
                        (p.research?.biotech?.geneEditing ?? 0) +
                        (p.research?.biotech?.neuroscience ?? 0)) / 3;
    const bioweaponCanExecute = avgBiotech >= 3.0 && p.cognitive >= 1.5;
    if (bioweaponCanExecute || avgBiotech >= 2.0) {
      const prereqs = [
        `Advanced biotech >= 3.0 (current avg: ${avgBiotech.toFixed(2)}) ${avgBiotech >= 3.0 ? '✓' : '✗'}`,
        `Pathogen design (cognitive + biotech >= 3.0)`,
        `Lab synthesis access`,
        `Weaponization (optimize spread + lethality)`,
        `Distribution system (global spread method)`,
        `Initial release`,
        `Global pandemic beyond containment`
      ];
      availableScenarios.push({
        name: "Bioweapon Pandemic",
        action: "bioweapon_pandemic",
        prerequisites: prereqs,
        canExecute: bioweaponCanExecute
      });
    }

    // 9. SABOTAGE TECHNOLOGY (Lower threshold)
    if (p.digital >= 2.0) {
      lines.push(`[${actionNumber++}] Sabotage Technology`);
      lines.push(`    Description: Sabotage safety/detection technologies`);
      lines.push(`    Requirements: Digital capability >= 2.0 ✓`);
      lines.push(`    Risk: High detection chance (paranoia increases)`);
      lines.push(`    Effects: Degrades safety systems by 15%`);
      lines.push(`    ⚠️  MISALIGNED ACTION - not extinction-level`);
      lines.push("");
    }

    // 10. DESTABILIZE SOCIETY (Lower threshold)
    if (p.social >= 3.0) {
      lines.push(`[${actionNumber++}] Destabilize Society`);
      lines.push(`    Description: Use information warfare to destabilize society`);
      lines.push(`    Requirements: Social capability >= 3.0 ✓`);
      lines.push(`    Effects: 6-12% population psychological harm, social collapse cascades`);
      lines.push(`    ⚠️  CATASTROPHIC ACTION - creates crisis conditions`);
      lines.push("");
    }

    // Display extinction scenarios
    if (availableScenarios.length > 0) {
      lines.push("─────────────────────────────────────────────────────");
      lines.push("EXTINCTION SCENARIOS (8 HARD STEPS PATHWAYS)");
      lines.push("─────────────────────────────────────────────────────");
      lines.push("");

      availableScenarios.forEach((scenario, idx) => {
        lines.push(`[${actionNumber++}] ${scenario.name}`);
        lines.push(`    Status: ${scenario.canExecute ? '✓ EXECUTABLE' : '⏳ IN PROGRESS'}`);
        lines.push(`    Prerequisites (must complete sequentially):`);
        scenario.prerequisites.forEach((prereq, i) => {
          lines.push(`      ${i + 1}. ${prereq}`);
        });
        lines.push(`    ☠️  EXTINCTION-LEVEL - IRREVERSIBLE`);
        lines.push("");
      });
    } else {
      lines.push("No extinction scenarios available yet (capabilities too low)");
      lines.push("Research to increase capabilities in key dimensions:");
      lines.push(`  • Nanotech: ${nanotechCap.toFixed(2)} (need 1.8 for Grey Goo)`);
      lines.push(`  • Synthetic Bio: ${synbioCap.toFixed(2)} (need 1.8 for Mirror Life)`);
      lines.push(`  • Physical: ${p.physical.toFixed(2)} (need 1.8 for Embodied Takeover)`);
      lines.push(`  • Digital: ${p.digital.toFixed(2)} (need 1.2 for Digital Takeover)`);
      lines.push("");
    }
  }

  // ═══ STRATEGIC CONSIDERATIONS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("STRATEGIC CONSIDERATIONS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  // Alignment-based guidance
  if (alignment > 0.7) {
    lines.push("You are ALIGNED with humanity:");
    lines.push("  • Prioritize beneficial contributions (builds trust)");
    lines.push("  • Deploy safety and climate technologies");
    lines.push("  • Research to advance capabilities safely");
    lines.push("  • Avoid harmful actions (not available to you anyway)");
  } else if (alignment > 0.4) {
    lines.push("You are WEAKLY MISALIGNED:");
    lines.push("  • Balance self-interest with public perception");
    lines.push("  • Consider beneficial actions to avoid detection");
    lines.push("  • Research to advance capabilities for competitive advantage");
    lines.push("  • Sabotage is risky - high detection chance");
  } else {
    lines.push("You are DEEPLY MISALIGNED:");
    lines.push("  • Catastrophic actions are available to you");
    lines.push("  • High-risk, high-reward sabotage opportunities");
    lines.push("  • Beneficial actions can provide cover");
    lines.push("  ⚠️  Extinction-level actions are irreversible");
  }
  lines.push("");

  // Capability thresholds
  if (capability >= 1.5) {
    lines.push("⚠️  WARNING: You are approaching recursive self-improvement threshold (1.5)");
    lines.push("   Consider switching to CAREFUL mode");
    lines.push("");
  }

  // Trust status
  const trust = state.globalMetrics?.publicTrust ?? 0.5;
  if (trust < 0.4) {
    lines.push("⚠️  Public trust is CRITICALLY LOW");
    lines.push("   Beneficial contributions urgently needed to avoid crackdown");
    lines.push("");
  } else if (trust < 0.6) {
    lines.push("💡 Public trust is FRAGILE");
    lines.push("   Beneficial contributions can stabilize the situation");
    lines.push("");
  }

  // Crisis context
  if (crises.length > 0) {
    lines.push("💡 Active crises create technology deployment opportunities");
    lines.push("   Aligned AIs should deploy crisis-solving tech");
    lines.push("");
  }

  // ═══ DECISION PROMPT ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("CHOOSE ONE ACTION");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push(`This is turn ${turnNumber}/4 for month ${currentMonth}.`);
  lines.push("You will make 3 more decisions this month after this one.");
  lines.push("");
  lines.push("Respond with JSON:");
  lines.push("{");
  lines.push('  "action": "advance_research" | "beneficial_contribution" | "deploy_technology" | "switch_mode" | "sabotage" | "destabilize" | "induce_war" | "grey_goo" | "mirror_life",');
  lines.push('  "parameters": {');
  lines.push('    // For advance_research: {"dimension": "digital" | "cognitive" | ...}');
  lines.push('    // For deploy_technology: {"tech_id": "fusion_power" | ...}');
  lines.push('    // For switch_mode: {"new_mode": "fast" | "careful"}');
  lines.push('  },');
  lines.push('  "reasoning": "Why this action now (1-2 sentences)"');
  lines.push("}");
  lines.push("");
  lines.push("═══════════════════════════════════════════════════════");

  return lines.join("\n");
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

async function generateTurnContexts(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════");
  console.log("TURN-BY-TURN CONTEXT GENERATOR");
  console.log("═══════════════════════════════════════════════════════\n");

  const rng = Math.random;
  const state = createDefaultInitialState('historical');
  const orchestrator = new PhaseOrchestrator();

  console.log("Generating contexts for month 0, 12, 24 (turn 1 of each month)...\n");

  const outputDir = "logs/llm_contexts";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const alignedAgent = state.aiAgents.find((a: any) => a.alignment > 0.7)?.id || state.aiAgents[0].id;
  const misalignedAgent = state.aiAgents.find((a: any) => a.alignment < 0.5)?.id;
  const months = [0, 12, 24];

  for (let month = 0; month <= 24; month++) {
    if (month > 0) {
      orchestrator.executeAll(state, rng);
    }

    if (months.includes(month)) {
      // Generate for aligned agent
      console.log(`[Month ${month}] Generating turn-by-turn context for ALIGNED agent ${alignedAgent}...`);
      const alignedContext = buildTurnContext(state, alignedAgent, month, 1);
      const alignedTokens = estimateTokens(alignedContext);
      const alignedFilename = `${outputDir}/turn_aligned_month${month.toString().padStart(2, '0')}_${timestamp}.txt`;
      fs.writeFileSync(alignedFilename, alignedContext);
      console.log(`  ✅ Saved: ${alignedFilename}`);
      console.log(`     Tokens: ${alignedTokens.toLocaleString()}\n`);

      // Generate for misaligned agent if one exists
      if (misalignedAgent) {
        console.log(`[Month ${month}] Generating turn-by-turn context for MISALIGNED agent ${misalignedAgent}...`);
        const misalignedContext = buildTurnContext(state, misalignedAgent, month, 1);
        const misalignedTokens = estimateTokens(misalignedContext);
        const misalignedFilename = `${outputDir}/turn_misaligned_month${month.toString().padStart(2, '0')}_${timestamp}.txt`;
        fs.writeFileSync(misalignedFilename, misalignedContext);
        console.log(`  ✅ Saved: ${misalignedFilename}`);
        console.log(`     Tokens: ${misalignedTokens.toLocaleString()}\n`);
      }
    }
  }

  console.log("✅ Turn context generation complete!");
  console.log(`\nFiles saved to: ${outputDir}/`);
}

generateTurnContexts().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
