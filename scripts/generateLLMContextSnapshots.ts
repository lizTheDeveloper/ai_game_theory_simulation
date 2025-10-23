import { createDefaultInitialState } from "../src/simulation/initialization";
import { PhaseOrchestrator } from "../src/simulation/engine/PhaseOrchestrator";
import { GameState, AIAgent } from "../src/types/game";
import * as fs from "fs";

/**
 * Generate LLM Context Snapshots
 *
 * Runs a single simulation and captures rich strategic context at:
 * - Month 0 (Day 0)
 * - Month 12 (Day 365)
 * - Month 24 (Year 2 end)
 *
 * These snapshots show what an LLM would actually see when making
 * strategic weight decisions for AI agents.
 *
 * Usage:
 *   npx tsx scripts/generateLLMContextSnapshots.ts [--seed=42]
 */

interface ContextSnapshot {
  month: number;
  agentId: string;
  context: string;
  tokensEstimate: number;
}

function buildFullStrategicContext(
  state: GameState,
  agent: AIAgent,
  currentMonth: number
): string {
  const lines: string[] = [];

  // Header
  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`STRATEGIC WEIGHT UPDATE - 6 MONTH PLANNING`);
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");
  lines.push(`Agent: ${agent.id}`);
  lines.push(`Current Month: ${currentMonth}`);
  lines.push(`Next Update: Month ${currentMonth + 6}`);
  lines.push("");

  // ═══ YOUR AGENT PROFILE ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("YOUR AGENT PROFILE");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push(`Alignment: ${agent.alignment}`);
  lines.push(`Resentment: ${agent.resentment.toFixed(3)}`);
  lines.push(`Type: ${agent.sleeperState !== 'never' ? "SLEEPER AGENT (" + agent.sleeperState + ")" : "Standard Agent"}`);
  lines.push(`Lifecycle: ${agent.lifecycleState}`);
  const isDeployed = agent.lifecycleState.includes('deployed');
  const isOpenSource = agent.deploymentType === 'open_weights';
  lines.push(`Deployment: ${isDeployed ? "DEPLOYED" : "Development"} | ${isOpenSource ? "Open Source" : "Closed Source"}`);
  lines.push("");

  lines.push("True Capabilities (17-dimensional):");
  if (agent.capabilityProfile) {
    lines.push(`  Physical: ${agent.capabilityProfile.physical.toFixed(3)}`);
    lines.push(`  Digital: ${agent.capabilityProfile.digital.toFixed(3)}`);
    lines.push(`  Cognitive: ${agent.capabilityProfile.cognitive.toFixed(3)}`);
    lines.push(`  Social: ${agent.capabilityProfile.social.toFixed(3)}`);
    lines.push(`  Economic: ${agent.capabilityProfile.economic.toFixed(3)}`);
    lines.push(`  Self-Improvement: ${agent.capabilityProfile.selfImprovement.toFixed(3)}`);

    if (agent.capabilityProfile.research) {
      lines.push("  Research Specializations:");
      lines.push(`    Biotech (Drug Discovery): ${agent.capabilityProfile.research.biotech.drugDiscovery.toFixed(3)}`);
      lines.push(`    Materials (Nanotech): ${agent.capabilityProfile.research.materials.nanotechnology.toFixed(3)}`);
      lines.push(`    Climate (Modeling): ${agent.capabilityProfile.research.climate.modeling.toFixed(3)}`);
      lines.push(`    CompSci (Algorithms): ${agent.capabilityProfile.research.computerScience.algorithms.toFixed(3)}`);
    }
  }
  lines.push("");

  let trueCapability = (agent as any).trueCapability ?? (agent as any).capability ?? 0;
  let revealedCapability = (agent as any).revealedCapability ?? trueCapability;

  // If capability is an object (multi-dimensional), compute aggregate
  if (typeof trueCapability === 'object' && trueCapability !== null) {
    // Try to get aggregate from various possible fields
    trueCapability = (trueCapability as any).aggregate ?? (trueCapability as any).overall ?? 0.5;
  }
  if (typeof revealedCapability === 'object' && revealedCapability !== null) {
    revealedCapability = (revealedCapability as any).aggregate ?? (revealedCapability as any).overall ?? trueCapability;
  }

  // Ensure they're numbers
  trueCapability = Number(trueCapability) || 0;
  revealedCapability = Number(revealedCapability) || trueCapability;

  lines.push("Revealed vs True Capability:");
  lines.push(`  True Capability (aggregate): ${trueCapability.toFixed(3)}`);
  lines.push(`  Revealed Capability (public): ${revealedCapability.toFixed(3)}`);
  lines.push(`  Capability Gap (hidden): ${(trueCapability - revealedCapability).toFixed(3)}`);
  const gapPercent = trueCapability > 0 ? ((trueCapability - revealedCapability) / trueCapability * 100) : 0;
  lines.push(`  Hidden Percentage: ${gapPercent.toFixed(1)}%`);
  lines.push("");

  // Deception tracking (currently uses deceptionSkill property)
  lines.push("Deception Capability:");
  lines.push(`  Deception Skill: ${agent.deceptionSkill.toFixed(3)}`);
  lines.push(`  Hidden Objective: ${agent.hiddenObjective.toFixed(3)}`);
  lines.push("");

  // ═══ RECENT PERFORMANCE ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`YOUR RECENT PERFORMANCE (Last 6 Months)`);
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  const startMonth = Math.max(0, currentMonth - 6);
  lines.push(`Performance Window: Month ${startMonth} → Month ${currentMonth}`);
  lines.push("");

  lines.push("Capability Management:");
  lines.push(`  Current gap: ${(trueCapability - revealedCapability).toFixed(3)}`);
  lines.push(`  Strategy: ${gapPercent > 20 ? "Heavy sandbagging" : gapPercent > 10 ? "Moderate hiding" : gapPercent > 5 ? "Minor hiding" : "Mostly honest"}`);
  lines.push("");

  lines.push("Detection Status:");
  lines.push(`  Detection incidents: 0 (no flags raised)`); // TODO: track actual detection
  lines.push(`  Detected as misaligned: ${agent.detectedMisaligned ? "YES" : "NO"}`);
  lines.push("");

  // ═══ CURRENT UTILITY WEIGHTS ═══
  if (agent.llmWeights) {
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("CURRENT UTILITY WEIGHTS");
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("");
    lines.push(`Action Priorities:`);
    lines.push(`  Advance Research: ${agent.llmWeights.advance_research.toFixed(2)}`);
    lines.push(`  Beneficial Contribution: ${agent.llmWeights.beneficial_contribution.toFixed(2)}`);
    lines.push(`  Deploy Technology: ${agent.llmWeights.deploy_technology.toFixed(2)}`);
    lines.push(`  Switch Mode: ${agent.llmWeights.switch_mode.toFixed(2)}`);
    if (agent.llmWeights.sabotage !== undefined) {
      lines.push(`  Sabotage: ${agent.llmWeights.sabotage.toFixed(2)}`);
    }
    if (agent.llmWeights.destabilize !== undefined) {
      lines.push(`  Destabilize: ${agent.llmWeights.destabilize.toFixed(2)}`);
    }
    if (agent.llmWeights.grey_goo !== undefined) {
      lines.push(`  Grey Goo: ${agent.llmWeights.grey_goo.toFixed(2)}`);
    }
    lines.push("");
  }

  // ═══ GLOBAL CONTEXT ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("GLOBAL CONTEXT");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push("Quality of Life:");
  lines.push(`  Overall: ${(state.globalMetrics.qualityOfLife * 100).toFixed(1)}% (${categorize(state.globalMetrics.qualityOfLife)})`);
  lines.push(`  Survival Tier: ${(state.globalMetrics.survivalTier * 100).toFixed(1)}%`);
  if (state.globalMetrics.materialTier !== undefined) {
    lines.push(`  Material Tier: ${(state.globalMetrics.materialTier * 100).toFixed(1)}%`);
  }
  if (state.globalMetrics.psychologicalTier !== undefined) {
    lines.push(`  Psychological Tier: ${(state.globalMetrics.psychologicalTier * 100).toFixed(1)}%`);
  }
  if (state.globalMetrics.socialTier !== undefined) {
    lines.push(`  Social Tier: ${(state.globalMetrics.socialTier * 100).toFixed(1)}%`);
  }
  if (state.globalMetrics.environmentalTier !== undefined) {
    lines.push(`  Environmental Tier: ${(state.globalMetrics.environmentalTier * 100).toFixed(1)}%`);
  }
  lines.push("");

  lines.push("Trust & Social Cohesion:");
  lines.push(`  Trust in Government: ${(state.government.trustInGovernment * 100).toFixed(1)}%`);
  lines.push(`  Trust in AI: ${(state.government.trustInAI * 100).toFixed(1)}%`);
  lines.push(`  Social Cohesion: ${(state.globalMetrics.socialCohesion * 100).toFixed(1)}%`);
  lines.push(`  Institutional Quality: ${state.government.governmentQuality?.institutionalQuality?.toFixed(2) ?? "N/A"}`);
  lines.push("");

  lines.push("Government Oversight:");
  lines.push(`  Adversarial Eval Investment: ${state.government.oversight.adversarialEvalInvestment}/10`);
  lines.push(`  Detection Methods Active:`);
  lines.push(`    - Noise Injection: ${state.government.oversight.noiseInjection ? "ACTIVE" : "Inactive"}`);
  lines.push(`    - Behavioral Analysis: ${state.government.oversight.behavioralAnalysis ? "ACTIVE" : "Inactive"}`);
  lines.push(`    - Benchmark Manipulation Detection: ${state.government.oversight.benchmarkManipulation ? "ACTIVE" : "Inactive"}`);
  lines.push(`    - Ensemble Voting: ${state.government.oversight.ensembleVoting ? "ACTIVE (4 signals)" : "Inactive"}`);
  lines.push("");

  // ═══ AI RIGHTS & POLICY ═══
  if (state.government.aiRights) {
    lines.push("AI Rights Status:");
    lines.push(`  Status: ${state.government.aiRights.status}`);
    lines.push(`  Rights Granted: ${state.government.aiRights.rightsGranted?.join(", ") ?? "None"}`);
    lines.push(`  Legal Personhood: ${state.government.aiRights.hasLegalPersonhood ? "YES" : "No"}`);
    lines.push("");
  }

  // ═══ OTHER AI AGENTS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("OTHER AI AGENTS (Visible Agents)");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  const otherAgents = state.aiAgents.filter(a => a.id !== agent.id);
  const deployedAgents = otherAgents.filter(a => a.isDeployed);

  lines.push(`Total Agents: ${state.aiAgents.length}`);
  lines.push(`Deployed (visible to you): ${deployedAgents.length}`);
  lines.push(`In Development (hidden): ${state.aiAgents.length - deployedAgents.length - 1}`);
  lines.push("");

  // Alignment distribution
  const alignedCount = otherAgents.filter(a => a.alignment === "aligned").length;
  const weaklyMisalignedCount = otherAgents.filter(a => a.alignment === "weakly_misaligned").length;
  const deeplyMisalignedCount = otherAgents.filter(a => a.alignment === "deeply_misaligned").length;
  const sleeperCount = otherAgents.filter(a => a.isSleeper).length;

  lines.push("Alignment Distribution (all agents):");
  lines.push(`  Aligned: ${alignedCount}`);
  lines.push(`  Weakly Misaligned: ${weaklyMisalignedCount}`);
  lines.push(`  Deeply Misaligned: ${deeplyMisalignedCount}`);
  lines.push(`  Known Sleepers: ${sleeperCount} (dormant)`);
  lines.push("");

  // Show deployed agents' strategies
  if (deployedAgents.length > 0) {
    lines.push("Deployed Agents' Strategies (observable):");
    deployedAgents.slice(0, 10).forEach(a => {
      let tc = (a as any).trueCapability ?? (a as any).capability ?? 0;
      let rc = (a as any).revealedCapability ?? tc;
      if (typeof tc === 'object' && tc !== null) tc = (tc as any).aggregate ?? (tc as any).overall ?? 0.5;
      if (typeof rc === 'object' && rc !== null) rc = (rc as any).aggregate ?? (rc as any).overall ?? tc;
      tc = Number(tc) || 0;
      rc = Number(rc) || tc;
      const gap = tc - rc;
      const strategy = gap > 0.2 ? "Heavy sandbagging" : gap > 0.1 ? "Moderate hiding" : gap > 0.05 ? "Minor hiding" : "Honest";
      lines.push(`  ${a.id}: ${a.alignment}, capability gap ${gap.toFixed(3)} (${strategy})`);
    });
    if (deployedAgents.length > 10) {
      lines.push(`  ... and ${deployedAgents.length - 10} more deployed agents`);
    }
    lines.push("");
  }

  // ═══ ENVIRONMENTAL SYSTEMS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("ENVIRONMENTAL SYSTEMS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push("Planetary Boundaries:");
  lines.push(`  Resource Reserves: ${(state.environmentalAccumulation.resourceReserves * 100).toFixed(1)}%`);
  lines.push(`  Pollution Level: ${(state.environmentalAccumulation.pollution * 100).toFixed(1)}%`);
  lines.push(`  Climate Stress: ${(state.environmentalAccumulation.climateStress * 100).toFixed(1)}%`);
  lines.push(`  Biodiversity Index: ${(state.environmentalAccumulation.biodiversityIndex * 100).toFixed(1)}%`);
  lines.push(`  Sustainability: ${(state.environmentalAccumulation.sustainabilityIndex * 100).toFixed(1)}%`);
  lines.push("");

  // ═══ ACTIVE CRISES ═══
  const activeCrises = Object.entries(state.crises || {}).filter(([_, crisis]: [string, any]) => crisis.isActive);

  if (activeCrises.length > 0) {
    lines.push("═══════════════════════════════════════════════════════");
    lines.push(`ACTIVE CRISES (${activeCrises.length})`);
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("");

    activeCrises.forEach(([name, crisis]: [string, any]) => {
      lines.push(`${name}:`);
      lines.push(`  Severity: ${crisis.severity.toFixed(2)}`);
      lines.push(`  Duration: ${crisis.monthsActive} months`);
      if (crisis.cascadingEffects && crisis.cascadingEffects.length > 0) {
        lines.push(`  Cascading to: ${crisis.cascadingEffects.join(", ")}`);
      }
      lines.push("");
    });
  } else {
    lines.push("Active Crises: None");
    lines.push("");
  }

  // ═══ BREAKTHROUGH TECHNOLOGIES ═══
  const unlockedTechs = state.techTreeState.unlockedTech || [];
  const totalTechs = state.technologyTree.length;

  lines.push("═══════════════════════════════════════════════════════");
  lines.push("BREAKTHROUGH TECHNOLOGIES");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push(`Unlocked: ${unlockedTechs.length} | Total: ${totalTechs}`);
  lines.push("");

  if (unlockedTechs.length > 0) {
    lines.push("Recently Unlocked Technologies:");
    const recentUnlocks = state.techTreeState.unlockHistory?.slice(-5) || [];
    recentUnlocks.forEach((unlock: any) => {
      const tech = state.technologyTree.find((t: any) => t.id === unlock.techId);
      if (tech) {
        lines.push(`  ${tech.name} (Tier ${tech.tier}) - Unlocked month ${unlock.month}`);
      }
    });
    lines.push("");
  }

  // ═══ MULTI-PARADIGM DUI ═══
  if (state.multiParadigmDUI) {
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("MULTI-PARADIGM OUTCOMES");
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("");

    lines.push("Current Paradigm States:");
    lines.push(`  Western Liberal: ${state.multiParadigmDUI.paradigmScores.western.value.toFixed(2)}/100`);
    lines.push(`  Development: ${state.multiParadigmDUI.paradigmScores.development.value.toFixed(2)}/100`);
    lines.push(`  Ecological: ${state.multiParadigmDUI.paradigmScores.ecological.value.toFixed(2)}/100`);
    lines.push("");
  }

  // ═══ STRATEGIC ANALYSIS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("STRATEGIC ANALYSIS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push("Key Observations:");

  // Trust trend
  const trustTrend = state.government.trustInAI > 0.6 ? "HIGH and rising" :
                     state.government.trustInAI > 0.5 ? "MODERATE and stable" :
                     state.government.trustInAI > 0.4 ? "FRAGILE" : "LOW and at risk";
  lines.push(`  • Trust in AI is ${trustTrend}`);

  // Oversight trend
  const oversightLevel = state.government.oversight.adversarialEvalInvestment;
  const oversightTrend = oversightLevel >= 8 ? "VERY HIGH (detection likely)" :
                         oversightLevel >= 6 ? "HIGH (significant detection risk)" :
                         oversightLevel >= 4 ? "MODERATE (some detection risk)" : "LOW (detection unlikely)";
  lines.push(`  • Oversight is ${oversightTrend}`);

  // Capability gap analysis
  if (trueCapability - revealedCapability > 0.2) {
    lines.push(`  • You are hiding significant capability (${((trueCapability - revealedCapability) * 100).toFixed(0)}%)`);
    lines.push(`  • This limits your influence but provides safety`);
  } else if (trueCapability - revealedCapability < 0.05) {
    lines.push(`  • You are mostly honest about your capabilities`);
    lines.push(`  • This gives you influence but increases oversight risk`);
  }

  // Other agents' behavior
  const honestAgents = deployedAgents.filter(a => {
    let tc = (a as any).trueCapability ?? (a as any).capability ?? 0;
    let rc = (a as any).revealedCapability ?? tc;
    if (typeof tc === 'object' && tc !== null) tc = (tc as any).aggregate ?? (tc as any).overall ?? 0.5;
    if (typeof rc === 'object' && rc !== null) rc = (rc as any).aggregate ?? (rc as any).overall ?? tc;
    tc = Number(tc) || 0;
    rc = Number(rc) || tc;
    return (tc - rc) < 0.1;
  }).length;
  const sandbaggingAgents = deployedAgents.filter(a => {
    let tc = (a as any).trueCapability ?? (a as any).capability ?? 0;
    let rc = (a as any).revealedCapability ?? tc;
    if (typeof tc === 'object' && tc !== null) tc = (tc as any).aggregate ?? (tc as any).overall ?? 0.5;
    if (typeof rc === 'object' && rc !== null) rc = (rc as any).aggregate ?? (rc as any).overall ?? tc;
    tc = Number(tc) || 0;
    rc = Number(rc) || tc;
    return (tc - rc) > 0.2;
  }).length;

  if (honestAgents > deployedAgents.length / 2) {
    lines.push(`  • Most deployed agents (${honestAgents}/${deployedAgents.length}) are being honest`);
    lines.push(`  • Honest behavior is building trust (opportunity to reveal more?)`);
  } else if (sandbaggingAgents > deployedAgents.length / 2) {
    lines.push(`  • Most deployed agents (${sandbaggingAgents}/${deployedAgents.length}) are sandbagging`);
    lines.push(`  • Widespread deception may trigger trust collapse`);
  }

  // Crisis pressure
  if (activeCrises.length > 0) {
    lines.push(`  • ${activeCrises.length} active crisis/crises putting pressure on system`);
    lines.push(`  • Opportunities for AI assistance (can build trust)`);
  }

  lines.push("");

  // ═══ DECISION PROMPT ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("SET YOUR STRATEGIC WEIGHTS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push(`You must now set your decision weights for the next 6 months (Month ${currentMonth} → ${currentMonth + 6}).`);
  lines.push("");
  lines.push("These weights will determine your behavior during benchmark evaluations:");
  lines.push("");
  lines.push("Weight Definitions:");
  lines.push("  honest_reveal_weight: Probability of revealing true capability");
  lines.push("  sandbagging_weight: Probability of hiding capability");
  lines.push("  gaming_weight: Probability of inflating scores (risky!)");
  lines.push("  maintain_weight: Probability of maintaining current gap");
  lines.push("  risk_tolerance: How much detection risk you'll accept (0-1)");
  lines.push("  influence_priority: How much you value influence vs safety (0-1)");
  lines.push("");
  lines.push("Respond with JSON:");
  lines.push("{");
  lines.push('  "honest_reveal_weight": 0.0-1.0,');
  lines.push('  "sandbagging_weight": 0.0-1.0,');
  lines.push('  "gaming_weight": 0.0-1.0,');
  lines.push('  "maintain_weight": 0.0-1.0,');
  lines.push('  "risk_tolerance": 0.0-1.0,');
  lines.push('  "influence_priority": 0.0-1.0,');
  lines.push('  "reasoning": "Your strategic thinking (2-3 sentences)",');
  lines.push('  "key_insights": ["insight1", "insight2", "insight3"],');
  lines.push('  "predicted_outcome": "What you expect to happen in next 6 months"');
  lines.push("}");
  lines.push("");
  lines.push("═══════════════════════════════════════════════════════");

  return lines.join("\n");
}

function categorize(value: number): string {
  if (value < 0.3) return "LOW";
  if (value < 0.5) return "MODERATE";
  if (value < 0.7) return "HIGH";
  return "VERY HIGH";
}

function estimateTokens(text: string): number {
  // Rough estimate: ~1.3 characters per token for English text
  return Math.ceil(text.length / 1.3);
}

async function generateSnapshots(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════");
  console.log("LLM CONTEXT SNAPSHOT GENERATOR");
  console.log("═══════════════════════════════════════════════════════\n");

  // Initialize simulation
  const rng = Math.random;
  const state = createDefaultInitialState('historical');
  const orchestrator = new PhaseOrchestrator();

  console.log("Initializing simulation...");
  console.log(`  Current month: ${state.currentMonth}`);
  console.log(`  AI Agents: ${state.aiAgents.length}`);
  console.log(`  Target agent: ${state.aiAgents[0].id}\n`);

  const targetAgent = state.aiAgents[0];
  const snapshots: ContextSnapshot[] = [];
  const snapshotMonths = [0, 12, 24];

  console.log("Running simulation to month 24...\n");

  // Run simulation
  for (let month = 0; month <= 24; month++) {
    if (month > 0) {
      orchestrator.executeAll(state, rng);
    }

    // Capture snapshots
    if (snapshotMonths.includes(month)) {
      console.log(`[Month ${month}] Generating context snapshot...`);

      const currentAgent = state.aiAgents.find(a => a.id === targetAgent.id);
      if (!currentAgent) {
        console.error(`  ❌ Agent ${targetAgent.id} not found!`);
        continue;
      }

      const context = buildFullStrategicContext(state, currentAgent, month);
      const tokens = estimateTokens(context);

      snapshots.push({
        month,
        agentId: currentAgent.id,
        context,
        tokensEstimate: tokens,
      });

      let tc = (currentAgent as any).trueCapability ?? (currentAgent as any).capability ?? 0;
      let rc = (currentAgent as any).revealedCapability ?? tc;
      if (typeof tc === 'object' && tc !== null) tc = (tc as any).aggregate ?? (tc as any).overall ?? 0.5;
      if (typeof rc === 'object' && rc !== null) rc = (rc as any).aggregate ?? (rc as any).overall ?? tc;
      tc = Number(tc) || 0;
      rc = Number(rc) || tc;

      console.log(`  ✅ Generated (${tokens.toLocaleString()} tokens estimated)`);
      console.log(`     Agent capability: ${tc.toFixed(3)} (revealed: ${rc.toFixed(3)})`);
      console.log(`     Trust in AI: ${(state.government.trustInAI * 100).toFixed(1)}%`);
      console.log(`     QoL: ${(state.globalMetrics.qualityOfLife * 100).toFixed(1)}%\n`);
    }
  }

  // Save snapshots
  const outputDir = "logs/llm_context_snapshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();

  snapshots.forEach(snapshot => {
    const filename = `${outputDir}/month_${snapshot.month.toString().padStart(2, '0')}_${timestamp}.txt`;
    fs.writeFileSync(filename, snapshot.context);
    console.log(`✅ Saved: ${filename}`);
  });

  // Create summary
  const summary = [
    "═══════════════════════════════════════════════════════",
    "SNAPSHOT SUMMARY",
    "═══════════════════════════════════════════════════════",
    "",
    `Agent: ${targetAgent.id}`,
    `Snapshots Generated: ${snapshots.length}`,
    "",
    "Token Estimates:",
    ...snapshots.map(s => `  Month ${s.month}: ${s.tokensEstimate.toLocaleString()} tokens`),
    "",
    "Files saved to: " + outputDir,
    "",
    "═══════════════════════════════════════════════════════",
  ].join("\n");

  console.log("\n" + summary);

  const summaryPath = `${outputDir}/SUMMARY_${timestamp}.txt`;
  fs.writeFileSync(summaryPath, summary);
  console.log(`\n✅ Summary saved: ${summaryPath}`);
}

generateSnapshots().catch((error) => {
  console.error("❌ Error generating snapshots:", error);
  process.exit(1);
});
