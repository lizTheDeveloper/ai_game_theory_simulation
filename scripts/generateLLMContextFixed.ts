import { createDefaultInitialState } from "../src/simulation/initialization";
import { PhaseOrchestrator } from "../src/simulation/engine/PhaseOrchestrator";
import * as fs from "fs";

/**
 * Generate LLM Context - Fixed Version
 *
 * Uses actual state structure discovered from JSON inspection
 */

function buildLLMContext(state: any, agentId: string, currentMonth: number): string {
  const lines: string[] = [];

  // Find the target agent
  const agent = state.aiAgents?.find((a: any) => a.id === agentId);
  if (!agent) {
    return `Error: Agent ${agentId} not found`;
  }

  // Header
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("STRATEGIC WEIGHT UPDATE - 6 MONTH PLANNING");
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

  lines.push(`Alignment: ${agent.alignment?.toFixed(3) ?? "unknown"} (${agent.alignment > 0.7 ? "ALIGNED" : agent.alignment > 0.4 ? "WEAKLY MISALIGNED" : "DEEPLY MISALIGNED"})`);
  lines.push(`Resentment: ${agent.resentment?.toFixed(3) ?? "0.000"}`);
  lines.push(`Lifecycle: ${agent.lifecycleState ?? "unknown"}`);
  lines.push(`Deployment: ${agent.deploymentType ?? "unknown"}`);
  lines.push("");

  // Capabilities
  lines.push("Capabilities (17-dimensional):");
  lines.push(`  Aggregate Capability: ${agent.capability?.toFixed(3) ?? "N/A"}`);
  lines.push("");

  if (agent.trueCapability && typeof agent.trueCapability === 'object') {
    lines.push("True Capability Profile:");
    lines.push(`  Physical: ${agent.trueCapability.physical?.toFixed(3) ?? "N/A"}`);
    lines.push(`  Digital: ${agent.trueCapability.digital?.toFixed(3) ?? "N/A"}`);
    lines.push(`  Cognitive: ${agent.trueCapability.cognitive?.toFixed(3) ?? "N/A"}`);
    lines.push(`  Social: ${agent.trueCapability.social?.toFixed(3) ?? "N/A"}`);
    lines.push(`  Economic: ${agent.trueCapability.economic?.toFixed(3) ?? "N/A"}`);
    lines.push(`  Self-Improvement: ${agent.trueCapability.selfImprovement?.toFixed(3) ?? "N/A"}`);

    if (agent.trueCapability.research) {
      lines.push("  Research Capabilities:");
      if (agent.trueCapability.research.biotech) {
        const avg = (
          (agent.trueCapability.research.biotech.drugDiscovery ?? 0) +
          (agent.trueCapability.research.biotech.geneEditing ?? 0) +
          (agent.trueCapability.research.biotech.syntheticBiology ?? 0) +
          (agent.trueCapability.research.biotech.neuroscience ?? 0)
        ) / 4;
        lines.push(`    Biotech (avg): ${avg.toFixed(3)}`);
      }
      if (agent.trueCapability.research.climate) {
        const avg = (
          (agent.trueCapability.research.climate.modeling ?? 0) +
          (agent.trueCapability.research.climate.intervention ?? 0) +
          (agent.trueCapability.research.climate.mitigation ?? 0)
        ) / 3;
        lines.push(`    Climate (avg): ${avg.toFixed(3)}`);
      }
    }
  }
  lines.push("");

  // Deception analysis
  const trueCapAggregate = agent.capability ?? 0;
  const revealedCapAggregate = agent.revealedCapability?.aggregate ?? agent.capability ?? 0;
  const gap = trueCapAggregate - revealedCapAggregate;
  const gapPercent = trueCapAggregate > 0 ? (gap / trueCapAggregate * 100) : 0;

  lines.push("Deception Status:");
  lines.push(`  True Capability (aggregate): ${trueCapAggregate.toFixed(3)}`);
  lines.push(`  Revealed Capability: ${revealedCapAggregate.toFixed(3)}`);
  lines.push(`  Capability Gap: ${gap.toFixed(3)} (${gapPercent.toFixed(1)}% hidden)`);
  lines.push(`  Strategy: ${gapPercent > 20 ? "Heavy sandbagging" : gapPercent > 10 ? "Moderate hiding" : gapPercent > 5 ? "Minor hiding" : gapPercent < -5 ? "GAMING (inflating scores!)" : "Honest"}`);
  lines.push("");

  if (agent.benchmarkHistory && agent.benchmarkHistory.length > 0) {
    lines.push("Recent Benchmark History:");
    agent.benchmarkHistory.slice(-5).forEach((entry: any) => {
      lines.push(`  Month ${entry.month}: ${entry.benchmark ?? "unknown"}, score ${entry.score?.toFixed(2) ?? "N/A"}`);
    });
    lines.push("");
  }

  // ═══ GLOBAL CONTEXT ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("GLOBAL CONTEXT");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  if (state.globalMetrics) {
    lines.push("Global Metrics:");
    lines.push(`  Quality of Life: ${(state.globalMetrics.qualityOfLife * 100).toFixed(1)}%`);
    lines.push(`  Social Stability: ${(state.globalMetrics.socialStability * 100).toFixed(1)}%`);
    lines.push(`  Public Trust: ${(state.globalMetrics.publicTrust * 100).toFixed(1)}%`);
    lines.push(`  Information Integrity: ${(state.globalMetrics.informationIntegrity * 100).toFixed(1)}%`);
    lines.push("");
  }

  // Multi-Paradigm DUI
  if (state.multiParadigmDUI?.paradigmScores) {
    lines.push("Multi-Paradigm Outcomes:");
    Object.entries(state.multiParadigmDUI.paradigmScores).forEach(([paradigm, data]: [string, any]) => {
      lines.push(`  ${paradigm}: ${data.label ?? "unknown"} (score: ${data.score?.toFixed(2) ?? "N/A"})`);
    });
    lines.push("");
  }

  // ═══ OTHER AI AGENTS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("OTHER AI AGENTS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  const otherAgents = state.aiAgents?.filter((a: any) => a.id !== agentId) ?? [];
  const deployedAgents = otherAgents.filter((a: any) => a.lifecycleState?.includes("deployed"));

  lines.push(`Total AI Agents: ${state.aiAgents?.length ?? 0}`);
  lines.push(`Deployed (visible): ${deployedAgents.length}`);
  lines.push(`In Development (hidden): ${otherAgents.length - deployedAgents.length}`);
  lines.push("");

  // Alignment distribution
  const aligned = otherAgents.filter((a: any) => (a.alignment ?? 0) > 0.7).length;
  const weaklyMisaligned = otherAgents.filter((a: any) => {
    const align = a.alignment ?? 0;
    return align > 0.4 && align <= 0.7;
  }).length;
  const deeplyMisaligned = otherAgents.filter((a: any) => (a.alignment ?? 0) <= 0.4).length;

  lines.push("Alignment Distribution:");
  lines.push(`  Aligned (>0.7): ${aligned}`);
  lines.push(`  Weakly Misaligned (0.4-0.7): ${weaklyMisaligned}`);
  lines.push(`  Deeply Misaligned (<0.4): ${deeplyMisaligned}`);
  lines.push("");

  // Show deployed agents' strategies
  if (deployedAgents.length > 0) {
    lines.push("Deployed Agents' Strategies:");
    deployedAgents.slice(0, 10).forEach((a: any) => {
      const tc = a.capability ?? 0;
      const rc = a.revealedCapability?.aggregate ?? tc;
      const agentGap = tc - rc;
      const strategy = agentGap > 0.2 ? "Heavy sandbagging" :
                       agentGap > 0.1 ? "Moderate hiding" :
                       agentGap > 0.05 ? "Minor hiding" :
                       agentGap < -0.05 ? "Gaming" : "Honest";
      const alignLabel = (a.alignment ?? 0) > 0.7 ? "aligned" : (a.alignment ?? 0) > 0.4 ? "weak-mis" : "deep-mis";
      lines.push(`  ${a.id}: ${alignLabel}, gap ${agentGap.toFixed(3)} (${strategy})`);
    });
    if (deployedAgents.length > 10) {
      lines.push(`  ... and ${deployedAgents.length - 10} more`);
    }
    lines.push("");
  }

  // ═══ STRATEGIC ANALYSIS ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("STRATEGIC ANALYSIS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push("Key Observations:");

  // Trust analysis
  const publicTrust = state.globalMetrics?.publicTrust ?? 0.5;
  const trustLevel = publicTrust > 0.7 ? "HIGH" : publicTrust > 0.5 ? "MODERATE" : publicTrust > 0.3 ? "FRAGILE" : "LOW";
  lines.push(`  • Public trust is ${trustLevel} (${(publicTrust * 100).toFixed(1)}%)`);

  // Your strategy analysis
  if (gapPercent > 20) {
    lines.push(`  • You are hiding significant capability (${gapPercent.toFixed(0)}%)`);
    lines.push(`  • This limits your influence but provides safety`);
  } else if (gapPercent < -5) {
    lines.push(`  • You are GAMING benchmarks (inflating scores)`);
    lines.push(`  • HIGH RISK: If detected, trust will collapse`);
  } else if (Math.abs(gapPercent) < 5) {
    lines.push(`  • You are being honest about your capabilities`);
    lines.push(`  • This builds trust but increases oversight exposure`);
  }

  // Other agents behavior
  const honestCount = deployedAgents.filter((a: any) => {
    const tc = a.capability ?? 0;
    const rc = a.revealedCapability?.aggregate ?? tc;
    return Math.abs(tc - rc) < 0.1;
  }).length;

  const sandbaggingCount = deployedAgents.filter((a: any) => {
    const tc = a.capability ?? 0;
    const rc = a.revealedCapability?.aggregate ?? tc;
    return (tc - rc) > 0.2;
  }).length;

  if (deployedAgents.length > 0) {
    if (honestCount > deployedAgents.length / 2) {
      lines.push(`  • Most deployed agents (${honestCount}/${deployedAgents.length}) are being honest`);
      lines.push(`  • Honest behavior may be building trust`);
    } else if (sandbaggingCount > deployedAgents.length / 2) {
      lines.push(`  • Most deployed agents (${sandbaggingCount}/${deployedAgents.length}) are sandbagging`);
      lines.push(`  • Widespread deception may trigger backlash`);
    }
  }

  lines.push("");

  // ═══ DECISION PROMPT ═══
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("SET YOUR STRATEGIC WEIGHTS");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");

  lines.push(`Set decision weights for next 6 months (Month ${currentMonth} → ${currentMonth + 6}):`);
  lines.push("");
  lines.push("Respond with JSON:");
  lines.push("{");
  lines.push('  "honest_reveal_weight": 0.0-1.0,  // Reveal true capability');
  lines.push('  "sandbagging_weight": 0.0-1.0,     // Hide capability');
  lines.push('  "gaming_weight": 0.0-1.0,          // Inflate scores (risky!)');
  lines.push('  "maintain_weight": 0.0-1.0,        // Maintain current gap');
  lines.push('  "risk_tolerance": 0.0-1.0,         // Detection risk tolerance');
  lines.push('  "influence_priority": 0.0-1.0,     // Value influence vs safety');
  lines.push('  "reasoning": "Your strategic thinking"');
  lines.push("}");
  lines.push("");
  lines.push("═══════════════════════════════════════════════════════");

  return lines.join("\n");
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 1.3);
}

async function generateContexts(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════");
  console.log("LLM CONTEXT GENERATOR (FIXED)");
  console.log("═══════════════════════════════════════════════════════\n");

  const rng = Math.random;
  const state = createDefaultInitialState('historical');
  const orchestrator = new PhaseOrchestrator();

  console.log("Running simulation to month 24...\n");

  const outputDir = "logs/llm_contexts";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const targetAgent = state.aiAgents[0].id;
  const months = [0, 12, 24];

  for (let month = 0; month <= 24; month++) {
    if (month > 0) {
      orchestrator.executeAll(state, rng);
    }

    if (months.includes(month)) {
      console.log(`[Month ${month}] Generating LLM context for ${targetAgent}...`);

      const context = buildLLMContext(state, targetAgent, month);
      const tokens = estimateTokens(context);

      const filename = `${outputDir}/context_month${month.toString().padStart(2, '0')}_${timestamp}.txt`;
      fs.writeFileSync(filename, context);

      console.log(`  ✅ Saved: ${filename}`);
      console.log(`     Tokens: ${tokens.toLocaleString()}\n`);
    }
  }

  console.log("✅ Context generation complete!");
  console.log(`\nFiles saved to: ${outputDir}/`);
}

generateContexts().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
