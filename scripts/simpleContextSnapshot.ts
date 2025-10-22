import { createDefaultInitialState } from "../src/simulation/initialization";
import { PhaseOrchestrator } from "../src/simulation/engine/PhaseOrchestrator";
import * as fs from "fs";

/**
 * Simple Context Snapshot - Just show what's actually in the state
 *
 * Runs simulation to month 24 and saves raw JSON snapshots at months 0, 12, 24
 */

async function generateSimpleSnapshots(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════");
  console.log("SIMPLE CONTEXT SNAPSHOT GENERATOR");
  console.log("═══════════════════════════════════════════════════════\n");

  // Initialize simulation
  const rng = Math.random;
  const state = createDefaultInitialState('historical');
  const orchestrator = new PhaseOrchestrator();

  console.log("Initializing simulation...");
  console.log(`  Current month: ${state.currentMonth}`);
  console.log(`  AI Agents: ${state.aiAgents.length}\n`);

  const outputDir = "logs/llm_context_snapshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const snapshotMonths = [0, 12, 24];

  console.log("Running simulation to month 24...\n");

  // Run simulation
  for (let month = 0; month <= 24; month++) {
    if (month > 0) {
      orchestrator.executeAll(state, rng);
    }

    // Capture snapshots
    if (snapshotMonths.includes(month)) {
      console.log(`[Month ${month}] Capturing snapshot...`);

      // Save full state as JSON (for inspection)
      const jsonPath = `${outputDir}/state_month${month}_${timestamp}.json`;
      fs.writeFileSync(jsonPath, JSON.stringify(state, null, 2));
      console.log(`  Saved: ${jsonPath}`);

      // Create a human-readable summary
      const summary = buildHumanReadableSummary(state, month);
      const summaryPath = `${outputDir}/summary_month${month}_${timestamp}.txt`;
      fs.writeFileSync(summaryPath, summary);
      console.log(`  Saved: ${summaryPath}\n`);
    }
  }

  console.log("✅ Snapshots complete!");
  console.log(`\nGenerated files in: ${outputDir}/`);
  console.log(`  - state_monthN_*.json (full state as JSON)`);
  console.log(`  - summary_monthN_*.txt (human-readable summary)`);
}

function buildHumanReadableSummary(state: any, month: number): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`SIMULATION STATE - MONTH ${month}`);
  lines.push("═══════════════════════════════════════════════════════\n");

  // Basic metrics
  lines.push("GLOBAL METRICS:");
  lines.push(`  Quality of Life: ${(state.globalMetrics?.qualityOfLife * 100 ?? 0).toFixed(1)}%`);
  lines.push(`  Social Cohesion: ${(state.globalMetrics?.socialCohesion * 100 ?? 0).toFixed(1)}%`);
  lines.push(`  Sustainability: ${(state.globalMetrics?.sustainability * 100 ?? 0).toFixed(1)}%`);
  lines.push("");

  // Government
  lines.push("GOVERNMENT:");
  lines.push(`  Trust in Government: ${(state.government?.trustInGovernment * 100 ?? 0).toFixed(1)}%`);
  lines.push(`  Trust in AI: ${(state.government?.trustInAI * 100 ?? 0).toFixed(1)}%`);
  if (state.government?.oversight) {
    lines.push(`  Oversight Investment: ${state.government.oversight.adversarialEvalInvestment ?? "N/A"}/10`);
  }
  lines.push("");

  // AI Agents
  lines.push(`AI AGENTS (${state.aiAgents?.length ?? 0} total):`);
  if (state.aiAgents && state.aiAgents.length > 0) {
    const firstAgent = state.aiAgents[0];
    lines.push(`\n  Example Agent: ${firstAgent.id}`);
    lines.push(`    Alignment: ${firstAgent.alignment ?? "unknown"}`);
    lines.push(`    Lifecycle: ${firstAgent.lifecycleState ?? "unknown"}`);
    lines.push(`    Deployed: ${firstAgent.isDeployed ? "Yes" : "No"}`);

    // Try to get capability (handle different structures)
    const capability = firstAgent.capability ?? firstAgent.trueCapability ?? "N/A";
    lines.push(`    Capability: ${typeof capability === 'number' ? capability.toFixed(3) : JSON.stringify(capability).substring(0, 50)}`);
  }
  lines.push("");

  // Environment
  lines.push("ENVIRONMENT:");
  lines.push(`  Climate Anomaly: ${state.environment?.globalTemperatureAnomaly?.toFixed(2) ?? "N/A"}°C`);
  lines.push(`  Biodiversity: ${(state.environment?.biodiversityIntactnessIndex * 100 ?? 0).toFixed(1)}%`);
  lines.push("");

  // Crises
  const crises = state.crises ?? {};
  const activeCrises = Object.entries(crises).filter(([_, c]: [string, any]) => c?.isActive);
  lines.push(`ACTIVE CRISES: ${activeCrises.length}`);
  if (activeCrises.length > 0) {
    activeCrises.forEach(([name, crisis]: [string, any]) => {
      lines.push(`  - ${name}: severity ${crisis.severity?.toFixed(2) ?? "N/A"}`);
    });
  }
  lines.push("");

  // Technologies
  const techs = state.breakthroughTechnologies ?? [];
  const deployedTechs = techs.filter((t: any) => t.isDeployed);
  lines.push(`BREAKTHROUGH TECHNOLOGIES:`);
  lines.push(`  Deployed: ${deployedTechs.length}/${techs.length}`);
  lines.push("");

  lines.push("═══════════════════════════════════════════════════════");

  return lines.join("\n");
}

generateSimpleSnapshots().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
