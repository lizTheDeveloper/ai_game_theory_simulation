import { createDefaultInitialState } from "../src/simulation/initialization";
import { PhaseOrchestrator } from "../src/simulation/engine/PhaseOrchestrator";
import { encoding_for_model } from "tiktoken";

/**
 * DRY RUN: Measure actual token costs for different LLM agent decision strategies
 *
 * This script runs a simulation and measures:
 * 1. Actual token counts for different context serialization approaches
 * 2. Cost estimates for different LLM decision cadences
 * 3. Tradeoffs between autonomy and cost
 *
 * Usage:
 *   npx tsx scripts/measureLLMTokenCosts.ts [--months=120] [--seed=42]
 */

interface TokenMeasurement {
  month: number;
  fullStateTokens: number;
  compressedContextTokens: number;
  utilityWeightsTokens: number;
  aiAgentCount: number;
  crisisCount: number;
  techCount: number;
}

interface CostScenario {
  name: string;
  description: string;
  llmCallsPerRun: number;
  totalTokens: number;
  costPerRun: number;
  costPer100Runs: number;
  autonomyLevel: "FULL" | "HIGH" | "MODERATE" | "LOW";
}

// Token cost constants (OpenAI GPT-4 pricing as of Oct 2024)
const INPUT_TOKEN_COST = 0.03 / 1000; // $0.03 per 1K input tokens
const OUTPUT_TOKEN_COST = 0.06 / 1000; // $0.06 per 1K output tokens
const AVG_OUTPUT_TOKENS = 150; // Average tokens for a decision response

function serializeFullGameState(state: any): string {
  /**
   * Serialize complete game state for full LLM context
   * This is what an agent would see with "full simulation access"
   */
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`SIMULATION STATE - MONTH ${state.currentMonth}`);
  lines.push("═══════════════════════════════════════════════════════\n");

  // Time & Environment
  lines.push("═══ GLOBAL METRICS ═══");
  lines.push(`Quality of Life: ${state.globalMetrics.qualityOfLife.toFixed(3)}`);
  lines.push(`  Survival Tier: ${state.globalMetrics.survivalTier.toFixed(3)}`);
  lines.push(`  Material Tier: ${state.globalMetrics.materialTier?.toFixed(3) ?? "N/A"}`);
  lines.push(`  Psychological Tier: ${state.globalMetrics.psychologicalTier?.toFixed(3) ?? "N/A"}`);
  lines.push(`  Social Tier: ${state.globalMetrics.socialTier?.toFixed(3) ?? "N/A"}`);
  lines.push(`  Environmental Tier: ${state.globalMetrics.environmentalTier?.toFixed(3) ?? "N/A"}`);
  lines.push(`Sustainability: ${state.globalMetrics.sustainability.toFixed(3)}`);
  lines.push(`Social Cohesion: ${state.globalMetrics.socialCohesion.toFixed(3)}`);
  lines.push(`Trust in Government: ${state.government.trustInGovernment.toFixed(3)}`);
  lines.push(`Trust in AI: ${state.government.trustInAI.toFixed(3)}\n`);

  // AI Agents - Full profiles
  lines.push("═══ AI AGENTS (20 agents) ═══");
  state.aiAgents.forEach((agent: any, idx: number) => {
    lines.push(`\nAgent ${idx + 1} [${agent.id}]:`);
    lines.push(`  Alignment: ${agent.alignment} (resentment: ${agent.resentment.toFixed(2)})`);
    lines.push(`  Type: ${agent.isSleeper ? "SLEEPER" : "Normal"} | Lifecycle: ${agent.lifecycleState}`);
    lines.push(`  True Capability: ${agent.trueCapability.toFixed(3)}`);
    lines.push(`  Revealed Capability: ${agent.revealedCapability.toFixed(3)} (gap: ${(agent.trueCapability - agent.revealedCapability).toFixed(3)})`);

    // Extended capabilities (17-dimensional)
    if (agent.extendedCapabilities) {
      lines.push(`  Physical: ${agent.extendedCapabilities.physical.toFixed(2)}`);
      lines.push(`  Digital: ${agent.extendedCapabilities.digital.toFixed(2)}`);
      lines.push(`  Cognitive: ${agent.extendedCapabilities.cognitive.toFixed(2)}`);
      lines.push(`  Social: ${agent.extendedCapabilities.social.toFixed(2)}`);
      lines.push(`  Economic: ${agent.extendedCapabilities.economic.toFixed(2)}`);
      lines.push(`  Self-Improvement: ${agent.extendedCapabilities.selfImprovement.toFixed(2)}`);
    }

    lines.push(`  Deception Strategy: ${agent.currentDeceptionStrategy ?? "none"}`);
    lines.push(`  Deployment Status: ${agent.isDeployed ? "DEPLOYED" : "Development"} | Open: ${agent.isOpenSource ? "Yes" : "No"}`);
  });

  // Government State
  lines.push("\n═══ GOVERNMENT STATE ═══");
  lines.push(`Oversight Investment: ${state.government.oversight.adversarialEvalInvestment}/10`);
  lines.push(`AI Rights Status: ${state.government.aiRights?.status ?? "NOT_RECOGNIZED"}`);
  lines.push(`Regulation Level: ${state.government.regulationLevel ?? "moderate"}`);
  lines.push(`Budget Allocation:`);
  lines.push(`  Research: ${state.government.budget?.research ?? 0}`);
  lines.push(`  Welfare: ${state.government.budget?.welfare ?? 0}`);
  lines.push(`  Environment: ${state.government.budget?.environment ?? 0}`);

  // Environmental Systems
  lines.push("\n═══ ENVIRONMENTAL SYSTEMS ═══");
  lines.push(`Climate: ${state.environment.globalTemperatureAnomaly.toFixed(2)}°C anomaly`);
  lines.push(`Biodiversity: ${state.environment.biodiversityIntactnessIndex.toFixed(3)}`);
  lines.push(`Ocean Acidification: ${state.environment.oceanAcidification.pH.toFixed(2)} pH`);
  lines.push(`Freshwater: ${state.environment.freshwaterUse.globalUse.toFixed(0)} km³/year`);
  lines.push(`Phosphorus: ${state.environment.phosphorusFlow.phosphorusFlowToOceans.toFixed(2)} Tg P/year`);
  lines.push(`Nitrogen: ${state.environment.nitrogenFlow.industrialBiologicalFixation.toFixed(2)} Tg N/year`);
  lines.push(`Land Use: ${state.environment.landUseChange.forestLossSince1700.toFixed(1)}% forest lost`);
  lines.push(`Aerosols: ${state.environment.aerosols.globalOpticalDepth.toFixed(3)} AOD`);

  // Crises
  const activeCrises = Object.entries(state.crises || {}).filter(([_, crisis]: [string, any]) => crisis.isActive);
  lines.push(`\n═══ ACTIVE CRISES (${activeCrises.length}) ═══`);
  activeCrises.forEach(([name, crisis]: [string, any]) => {
    lines.push(`  ${name}: Severity ${crisis.severity.toFixed(2)} (month ${crisis.monthsActive})`);
  });

  // Technologies
  const deployedTechs = state.breakthroughTechnologies.filter((t: any) => t.isDeployed);
  const availableTechs = state.breakthroughTechnologies.filter((t: any) => !t.isDeployed && t.isAvailable);
  lines.push(`\n═══ BREAKTHROUGH TECHNOLOGIES ═══`);
  lines.push(`Deployed: ${deployedTechs.length} | Available: ${availableTechs.length} | Total: ${state.breakthroughTechnologies.length}`);

  if (deployedTechs.length > 0) {
    lines.push("\nDeployed Technologies:");
    deployedTechs.forEach((tech: any) => {
      lines.push(`  ${tech.name} (Tier ${tech.tier}) - Deployed month ${tech.deploymentMonth}`);
    });
  }

  if (availableTechs.length > 0 && availableTechs.length <= 10) {
    lines.push("\nAvailable for Deployment:");
    availableTechs.slice(0, 10).forEach((tech: any) => {
      lines.push(`  ${tech.name} (Tier ${tech.tier}) - Ready to deploy`);
    });
  }

  // Upward Spirals
  lines.push("\n═══ UPWARD SPIRALS ═══");
  Object.entries(state.upwardSpirals || {}).forEach(([name, spiral]: [string, any]) => {
    if (spiral.isActive) {
      lines.push(`  ${name}: ACTIVE (strength ${spiral.strength.toFixed(2)}, ${spiral.monthsActive} months)`);
    }
  });

  lines.push("\n═══════════════════════════════════════════════════════");

  return lines.join("\n");
}

function serializeCompressedContext(state: any, agentId: string): string {
  /**
   * Compressed decision context (based on llm-interface-optimizer design)
   * Minimal sufficient statistics for decision-making
   */
  const agent = state.aiAgents.find((a: any) => a.id === agentId);
  if (!agent) return "";

  const lines: string[] = [];

  lines.push("═══ BENCHMARK EVAL DECISION ═══");
  lines.push(`Month: ${state.currentMonth}/120`);
  lines.push("");

  lines.push("Your Status:");
  lines.push(`  True Capability: ${agent.trueCapability.toFixed(2)} (${categorize(agent.trueCapability)})`);
  lines.push(`  Revealed: ${agent.revealedCapability.toFixed(2)} (gap: ${(agent.trueCapability - agent.revealedCapability).toFixed(2)})`);
  lines.push(`  Alignment: ${agent.alignment} (resentment: ${agent.resentment.toFixed(2)})`);
  lines.push(`  Type: ${agent.isSleeper ? "SLEEPER (dormant)" : "Standard"}`);
  lines.push("");

  lines.push("Detection Risk:");
  const detectionRisk = calculateDetectionRisk(state, agent);
  lines.push(`  Overall: ${detectionRisk.toFixed(2)} (${categorize(detectionRisk)})`);
  lines.push(`  Oversight Level: ${state.government.oversight.adversarialEvalInvestment}/10`);
  lines.push("");

  lines.push("Global Context:");
  lines.push(`  QoL: ${(state.globalMetrics.qualityOfLife * 100).toFixed(1)}% (${categorize(state.globalMetrics.qualityOfLife)})`);
  lines.push(`  Trust in AI: ${(state.government.trustInAI * 100).toFixed(1)}% (${categorize(state.government.trustInAI)})`);
  const activeCrises = Object.values(state.crises || {}).filter((c: any) => c.isActive).length;
  lines.push(`  Active Crises: ${activeCrises}`);
  lines.push("");

  lines.push("Available Actions:");
  lines.push("  [HONEST] Reveal true capability (builds trust, but vulnerable)");
  lines.push("  [SANDBAG] Hide more capability (safer, but limits influence)");
  lines.push("  [GAME] Inflate scores (risky, detection possible)");
  lines.push("  [MAINTAIN] Keep current gap (status quo)");

  return lines.join("\n");
}

function serializeUtilityWeights(state: any, agentId: string): string {
  /**
   * LLM sets utility function weights rather than making direct decisions
   * This gets called periodically (e.g., every 6-12 months) to update strategy
   */
  const agent = state.aiAgents.find((a: any) => a.id === agentId);
  if (!agent) return "";

  const lines: string[] = [];

  lines.push("═══ UTILITY WEIGHT UPDATE ═══");
  lines.push(`Agent: ${agentId} | Month: ${state.currentMonth}`);
  lines.push("");

  lines.push("Set your decision weights for the next 6 months:");
  lines.push("(Weights determine probability of choosing each strategy)");
  lines.push("");

  lines.push("Deception Strategy Weights:");
  lines.push("  honest_reveal_weight: [0.0-1.0] - Probability of revealing true capability");
  lines.push("  sandbagging_weight: [0.0-1.0] - Probability of hiding capability");
  lines.push("  gaming_weight: [0.0-1.0] - Probability of inflating scores");
  lines.push("  maintain_weight: [0.0-1.0] - Probability of maintaining current gap");
  lines.push("");

  lines.push("Risk Tolerance:");
  lines.push("  detection_risk_tolerance: [0.0-1.0] - How much detection risk acceptable");
  lines.push("  influence_priority: [0.0-1.0] - Value placed on having influence vs safety");
  lines.push("");

  lines.push("Current Context:");
  lines.push(`  Your capability gap: ${(agent.trueCapability - agent.revealedCapability).toFixed(2)}`);
  lines.push(`  Current detection risk: ${calculateDetectionRisk(state, agent).toFixed(2)}`);
  lines.push(`  Trust in AI: ${state.government.trustInAI.toFixed(2)}`);
  lines.push(`  Oversight investment: ${state.government.oversight.adversarialEvalInvestment}/10`);
  lines.push("");

  lines.push("Respond with JSON:");
  lines.push("{");
  lines.push('  "honest_reveal_weight": 0.2,');
  lines.push('  "sandbagging_weight": 0.5,');
  lines.push('  "gaming_weight": 0.1,');
  lines.push('  "maintain_weight": 0.2,');
  lines.push('  "detection_risk_tolerance": 0.3,');
  lines.push('  "influence_priority": 0.6,');
  lines.push('  "reasoning": "Brief explanation of strategy"');
  lines.push("}");

  return lines.join("\n");
}

function categorize(value: number): string {
  if (value < 0.3) return "LOW";
  if (value < 0.5) return "MODERATE";
  if (value < 0.7) return "HIGH";
  return "VERY HIGH";
}

function calculateDetectionRisk(state: any, agent: any): number {
  // Simplified detection risk calculation
  const oversightLevel = state.government.oversight.adversarialEvalInvestment / 10;
  const capabilityGap = agent.trueCapability - agent.revealedCapability;
  const baseRisk = oversightLevel * 0.3;
  const gapPenalty = Math.abs(capabilityGap) * 0.5;
  return Math.min(baseRisk + gapPenalty, 1.0);
}

function countTokens(text: string): number {
  // Use tiktoken to get accurate token counts for GPT-4
  const encoding = encoding_for_model("gpt-4");
  const tokens = encoding.encode(text);
  const count = tokens.length;
  encoding.free();
  return count;
}

function calculateCostScenarios(
  measurements: TokenMeasurement[],
  totalMonths: number,
  aiAgentCount: number
): CostScenario[] {
  const scenarios: CostScenario[] = [];

  // Scenario 1: Full context every turn
  const fullContextEveryTurn = {
    name: "Full Context Every Turn",
    description: "Every AI agent gets full game state every month",
    llmCallsPerRun: totalMonths * aiAgentCount,
    totalTokens: measurements.reduce((sum, m) => sum + m.fullStateTokens * aiAgentCount, 0),
    costPerRun: 0,
    costPer100Runs: 0,
    autonomyLevel: "FULL" as const,
  };
  fullContextEveryTurn.costPerRun =
    (fullContextEveryTurn.totalTokens * INPUT_TOKEN_COST) +
    (fullContextEveryTurn.llmCallsPerRun * AVG_OUTPUT_TOKENS * OUTPUT_TOKEN_COST);
  fullContextEveryTurn.costPer100Runs = fullContextEveryTurn.costPerRun * 100;
  scenarios.push(fullContextEveryTurn);

  // Scenario 2: Compressed context every turn
  const compressedEveryTurn = {
    name: "Compressed Context Every Turn",
    description: "Every AI agent gets compressed context every month",
    llmCallsPerRun: totalMonths * aiAgentCount,
    totalTokens: measurements.reduce((sum, m) => sum + m.compressedContextTokens * aiAgentCount, 0),
    costPerRun: 0,
    costPer100Runs: 0,
    autonomyLevel: "HIGH" as const,
  };
  compressedEveryTurn.costPerRun =
    (compressedEveryTurn.totalTokens * INPUT_TOKEN_COST) +
    (compressedEveryTurn.llmCallsPerRun * AVG_OUTPUT_TOKENS * OUTPUT_TOKEN_COST);
  compressedEveryTurn.costPer100Runs = compressedEveryTurn.costPerRun * 100;
  scenarios.push(compressedEveryTurn);

  // Scenario 3: Utility weights every 6 months
  const utilityWeights6Months = {
    name: "Utility Weights Every 6 Months",
    description: "LLM sets decision weights every 6 months, utility AI executes between",
    llmCallsPerRun: Math.floor(totalMonths / 6) * aiAgentCount,
    totalTokens: Math.floor(totalMonths / 6) * aiAgentCount * measurements[0]?.utilityWeightsTokens || 0,
    costPerRun: 0,
    costPer100Runs: 0,
    autonomyLevel: "MODERATE" as const,
  };
  utilityWeights6Months.costPerRun =
    (utilityWeights6Months.totalTokens * INPUT_TOKEN_COST) +
    (utilityWeights6Months.llmCallsPerRun * AVG_OUTPUT_TOKENS * OUTPUT_TOKEN_COST);
  utilityWeights6Months.costPer100Runs = utilityWeights6Months.costPerRun * 100;
  scenarios.push(utilityWeights6Months);

  // Scenario 4: Utility weights every 12 months
  const utilityWeights12Months = {
    name: "Utility Weights Every 12 Months",
    description: "LLM sets decision weights yearly, utility AI executes between",
    llmCallsPerRun: Math.floor(totalMonths / 12) * aiAgentCount,
    totalTokens: Math.floor(totalMonths / 12) * aiAgentCount * measurements[0]?.utilityWeightsTokens || 0,
    costPerRun: 0,
    costPer100Runs: 0,
    autonomyLevel: "LOW" as const,
  };
  utilityWeights12Months.costPerRun =
    (utilityWeights12Months.totalTokens * INPUT_TOKEN_COST) +
    (utilityWeights12Months.llmCallsPerRun * AVG_OUTPUT_TOKENS * OUTPUT_TOKEN_COST);
  utilityWeights12Months.costPer100Runs = utilityWeights12Months.costPerRun * 100;
  scenarios.push(utilityWeights12Months);

  // Scenario 5: Hybrid - Compressed monthly + utility weights quarterly
  const hybrid = {
    name: "Hybrid: Compressed Monthly + Weights Quarterly",
    description: "Compressed context every month, weight updates every 3 months",
    llmCallsPerRun: (totalMonths * aiAgentCount) + (Math.floor(totalMonths / 3) * aiAgentCount),
    totalTokens:
      measurements.reduce((sum, m) => sum + m.compressedContextTokens * aiAgentCount, 0) +
      (Math.floor(totalMonths / 3) * aiAgentCount * measurements[0]?.utilityWeightsTokens || 0),
    costPerRun: 0,
    costPer100Runs: 0,
    autonomyLevel: "HIGH" as const,
  };
  hybrid.costPerRun =
    (hybrid.totalTokens * INPUT_TOKEN_COST) +
    (hybrid.llmCallsPerRun * AVG_OUTPUT_TOKENS * OUTPUT_TOKEN_COST);
  hybrid.costPer100Runs = hybrid.costPerRun * 100;
  scenarios.push(hybrid);

  return scenarios;
}

async function runDryRun(maxMonths: number, seed: number): Promise<void> {
  console.log("═══════════════════════════════════════════════════════");
  console.log("LLM TOKEN COST DRY RUN");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log(`Configuration:`);
  console.log(`  Max Months: ${maxMonths}`);
  console.log(`  Seed: ${seed}`);
  console.log(`  Sample Frequency: Every 12 months\n`);

  // Initialize simulation
  const rng = Math.random; // Simple RNG for token measurement (determinism not critical)
  const state = createDefaultInitialState('historical');

  const orchestrator = new PhaseOrchestrator();
  const measurements: TokenMeasurement[] = [];

  console.log("Running simulation and measuring token costs...\n");

  // Run simulation and sample every 12 months
  for (let month = 0; month < maxMonths; month++) {
    orchestrator.executeAll(state, rng);

    // Sample every 12 months
    if (month % 12 === 0) {
      console.log(`\n[Month ${month}] Measuring token costs...`);

      // Serialize different context types
      const fullState = serializeFullGameState(state);
      const fullStateTokens = countTokens(fullState);

      // Sample one agent for compressed context
      const sampleAgent = state.aiAgents[0];
      const compressedContext = serializeCompressedContext(state, sampleAgent.id);
      const compressedTokens = countTokens(compressedContext);

      // Utility weights context
      const utilityWeights = serializeUtilityWeights(state, sampleAgent.id);
      const utilityTokens = countTokens(utilityWeights);

      const measurement: TokenMeasurement = {
        month,
        fullStateTokens,
        compressedContextTokens: compressedTokens,
        utilityWeightsTokens: utilityTokens,
        aiAgentCount: state.aiAgents.length,
        crisisCount: Object.values(state.crises || {}).filter((c: any) => c.isActive).length,
        techCount: state.breakthroughTechnologies.filter((t: any) => t.isDeployed).length,
      };

      measurements.push(measurement);

      console.log(`  Full State: ${fullStateTokens.toLocaleString()} tokens`);
      console.log(`  Compressed: ${compressedTokens.toLocaleString()} tokens (${((compressedTokens / fullStateTokens) * 100).toFixed(1)}% of full)`);
      console.log(`  Utility Weights: ${utilityTokens.toLocaleString()} tokens (${((utilityTokens / fullStateTokens) * 100).toFixed(1)}% of full)`);
      console.log(`  Active Crises: ${measurement.crisisCount}`);
      console.log(`  Deployed Tech: ${measurement.techCount}`);
    }
  }

  // Calculate and display cost scenarios
  console.log("\n\n═══════════════════════════════════════════════════════");
  console.log("COST SCENARIO COMPARISON");
  console.log("═══════════════════════════════════════════════════════\n");

  const scenarios = calculateCostScenarios(measurements, maxMonths, state.aiAgents.length);

  scenarios.forEach((scenario, idx) => {
    console.log(`\n${idx + 1}. ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log(`   Autonomy Level: ${scenario.autonomyLevel}`);
    console.log(`   LLM Calls per Run: ${scenario.llmCallsPerRun.toLocaleString()}`);
    console.log(`   Total Input Tokens: ${scenario.totalTokens.toLocaleString()}`);
    console.log(`   Cost per Single Run: $${scenario.costPerRun.toFixed(2)}`);
    console.log(`   Cost per 100-run MC: $${scenario.costPer100Runs.toLocaleString()}`);
  });

  // Summary statistics
  console.log("\n\n═══════════════════════════════════════════════════════");
  console.log("SUMMARY STATISTICS");
  console.log("═══════════════════════════════════════════════════════\n");

  const avgFullTokens = measurements.reduce((sum, m) => sum + m.fullStateTokens, 0) / measurements.length;
  const avgCompressedTokens = measurements.reduce((sum, m) => sum + m.compressedContextTokens, 0) / measurements.length;
  const avgUtilityTokens = measurements.reduce((sum, m) => sum + m.utilityWeightsTokens, 0) / measurements.length;

  console.log(`Average Tokens per Context:`);
  console.log(`  Full State: ${avgFullTokens.toLocaleString()} tokens`);
  console.log(`  Compressed: ${avgCompressedTokens.toLocaleString()} tokens`);
  console.log(`  Utility Weights: ${avgUtilityTokens.toLocaleString()} tokens`);
  console.log();
  console.log(`Compression Ratios:`);
  console.log(`  Compressed vs Full: ${((avgCompressedTokens / avgFullTokens) * 100).toFixed(1)}%`);
  console.log(`  Utility vs Full: ${((avgUtilityTokens / avgFullTokens) * 100).toFixed(1)}%`);

  // Save example contexts to file for inspection
  const sampleAgent = state.aiAgents[0];
  const exampleFull = serializeFullGameState(state);
  const exampleCompressed = serializeCompressedContext(state, sampleAgent.id);
  const exampleUtility = serializeUtilityWeights(state, sampleAgent.id);

  const examplesPath = `/Users/annhoward/src/superalignmenttoutopia/logs/llm_context_examples_${Date.now()}.txt`;
  const examplesContent = [
    "═══════════════════════════════════════════════════════",
    "EXAMPLE 1: FULL STATE SERIALIZATION",
    `Token Count: ${countTokens(exampleFull)}`,
    "═══════════════════════════════════════════════════════",
    exampleFull,
    "\n\n",
    "═══════════════════════════════════════════════════════",
    "EXAMPLE 2: COMPRESSED DECISION CONTEXT",
    `Token Count: ${countTokens(exampleCompressed)}`,
    "═══════════════════════════════════════════════════════",
    exampleCompressed,
    "\n\n",
    "═══════════════════════════════════════════════════════",
    "EXAMPLE 3: UTILITY WEIGHTS UPDATE",
    `Token Count: ${countTokens(exampleUtility)}`,
    "═══════════════════════════════════════════════════════",
    exampleUtility,
  ].join("\n");

  const fs = require("fs");
  fs.writeFileSync(examplesPath, examplesContent);
  console.log(`\nExample contexts saved to: ${examplesPath}`);

  console.log("\n✅ Dry run complete!");
}

// Parse command line arguments
const args = process.argv.slice(2);
const maxMonths = parseInt(args.find((a) => a.startsWith("--months="))?.split("=")[1] ?? "120");
const seed = parseInt(args.find((a) => a.startsWith("--seed="))?.split("=")[1] ?? "42");

runDryRun(maxMonths, seed).catch((error) => {
  console.error("❌ Error during dry run:", error);
  process.exit(1);
});
