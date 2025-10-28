/**
 * Apply Function Documentation
 *
 * Applies improved documentation to simulation functions.
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocPatch {
  file: string;
  line: number;
  name: string;
  doc: string;
}

// Read patches
const patchPath = path.join(__dirname, '../docs/function-doc-patches.json');
const patches: DocPatch[] = JSON.parse(fs.readFileSync(patchPath, 'utf-8'));

// Improved documentation (manually curated for key functions)
const improvements: Record<string, string> = {
  'initializeCapabilityProfile': 'Creates AI capability profile with randomized 17-dimensional values. Dimensions: physical, digital, cognitive, social, economic, selfImprovement, research (biotech, materials, climate, CS).',
  'initializeDefensiveAI': 'Initializes defensive AI system state. Tracks threat detection, autonomy override, cyber defense, and sleeper agent detection capabilities.',
  'checkDefensiveAITriggers': 'Evaluates deployment triggers for defensive AI. Checks for capability thresholds, misaligned AIs, government crisis conditions.',
  'attemptDefensiveAIDeployment': 'Attempts to deploy defensive AI system. Requires government approval, adequate funding, and detection infrastructure.',
  'updateDefensiveAI': 'Updates defensive AI capabilities monthly. Tracks detection improvements, false positives, arms race dynamics with offensive AIs.',
  'applyDefensiveAIToMAD': 'Applies defensive AI effects to Mutually Assured Destruction dynamics. Improves nuclear stability through launch detection and veto authority.',
  'initializeDiplomaticAI': 'Initializes AI-mediated diplomacy system. Tracks AI negotiator capability, international cooperation, and conflict de-escalation.',
  'enterEndGame': 'Transitions simulation to end-game state (utopia/dystopia/extinction). Locks outcome and begins post-transition dynamics.',
  'updateGeoengineering': 'Updates geoengineering deployment and impacts. Tracks iron fertilization, ocean alkalinity, SAI risks, termination shock.',
  'initializeGovernanceQuality': 'Initializes governance quality tracking. Models institutional effectiveness, corruption, regulatory capture.',
  'initializeMeaningRenaissance': 'Initializes meaning crisis recovery system. Tracks post-work culture, community frameworks, spiritual movements.',
  'updateResourceEconomy': 'Updates resource economy state. Processes extraction, depletion, recycling, substitution, and industry opposition.',
  'initializeResourceEconomy': 'Creates initial resource economy. Includes fossil fuels, metals, energy, CO2, ocean health, geoengineering state.',
  'applyTechnologyToResources': 'Applies breakthrough technology effects to resource systems. Unlocks clean energy, recycling, efficiency improvements.',
  'applyIndustryOppositionToTech': 'Models fossil fuel and mining industry resistance to clean tech. Lobbying, sabotage, regulatory capture slow deployment.',
  'initializeSocialInfluence': 'Initializes sleeper agent social manipulation tracking. Models AI-human trust relationships, voice adoption, influence attempts on decision-makers.',
  'calculateVoiceAdoption': 'Calculates probability AI agent adopts voice mode for relationship building. Based on capability, alignment, deployment type.',
  'decayDetectionRisk': 'Decays social influence detection risk over time. Simulates decreasing vigilance if no incidents detected.',
  'getAllTech': 'Returns complete technology tree (71 techs across 5 tiers). Used by deployment and research systems.',
  'initializeTechnologicalRisk': 'Initializes technological risk accumulation. Tracks misalignment risk, safety debt, concentration risk, complacency.',
  'updateTechnologicalRisk': 'Updates technological risks based on AI development pace. Safety debt accumulates when capability growth exceeds safety research.',
  'getTechnologicalSafety': 'Calculates overall technological safety level from risk components. Inverse of misalignment, safety debt, concentration risks.',
  'hasTechnologicalCrisis': 'Checks if technological crisis thresholds exceeded. Triggers at high misalignment, severe safety debt, or extreme concentration.',
  'sampleResearchBackedThresholds': 'Samples TIER 1 planetary boundary thresholds from research distributions. Climate, ocean, nitrogen, phosphorus, biodiversity.',
  'sampleHistoricalThresholds': 'Samples TIER 2 historical event thresholds. Wet-bulb, nuclear winter, regime transitions, crisis cascades.',
  'sampleTier2InterventionParameters': 'Samples TIER 2 intervention effectiveness parameters. Technology deployment impacts, policy effectiveness, recovery rates.',
  'initializeUpwardSpirals': 'Initializes six upward spiral states. Abundance, cognitive, democratic, scientific, meaning, ecological positive feedback loops.',
  'resetValidationContext': 'Resets state validation context. Clears validation warnings and error tracking.',
  'analyzeDeterminism': 'Analyzes simulation determinism from logs. Checks for RNG consistency, state divergence, non-deterministic operations.',
  'initializeConflictResolution': 'Initializes AI-mediated conflict resolution system. Tracks negotiation success, peace agreements, ceasefire stability.'
};

console.log(`Applying ${patches.length} function documentation patches...\n`);

// Group by file
const byFile = new Map<string, DocPatch[]>();
for (const patch of patches) {
  if (!byFile.has(patch.file)) {
    byFile.set(patch.file, []);
  }
  byFile.get(patch.file)!.push(patch);
}

let filesModified = 0;
let patchesApplied = 0;

for (const [filePath, filePatches] of byFile) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Sort by line descending
  const sorted = filePatches.sort((a, b) => b.line - a.line);

  let modified = false;

  for (const patch of sorted) {
    const lineIndex = patch.line - 1;
    const targetLine = lines[lineIndex];

    // Check if already documented
    if (lineIndex > 0) {
      const prevLine = lines[lineIndex - 1].trim();
      if (prevLine.startsWith('/**') || prevLine.startsWith('*') || prevLine.startsWith('//')) {
        console.log(`  ⏭️  Skipping ${patch.name} (already has comment)`);
        continue;
      }
    }

    // Use improved doc if available
    const doc = improvements[patch.name] || patch.doc;

    // Get indentation
    const indent = targetLine.match(/^(\s*)/)?.[1] || '';

    // Insert JSDoc
    const docLines = [
      `${indent}/**`,
      `${indent} * ${doc}`,
      `${indent} */`
    ];

    lines.splice(lineIndex, 0, ...docLines);
    modified = true;
    patchesApplied++;

    const relPath = filePath.replace(process.cwd() + '/', '');
    console.log(`  ✅ ${patch.name} in ${relPath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    filesModified++;
  }
}

console.log(`\n✅ Function documentation applied:`);
console.log(`   ${patchesApplied} functions documented`);
console.log(`   ${filesModified} files modified\n`);
console.log(`Run 'npm run docs' to regenerate API documentation.\n`);
