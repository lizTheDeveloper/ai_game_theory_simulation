/**
 * Phase 4: Spiral Activation Matrix Generator
 *
 * Creates matrix showing which scenarios activate which spirals.
 *
 * Usage:
 *   npx tsx scripts/generateSpiralMatrix.ts [log-file]
 *
 * Output:
 *   - Markdown table to console
 *   - CSV to /logs/spiral_matrix_YYYYMMDD.csv
 */

import * as fs from 'fs';
import * as path from 'path';

interface SpiralData {
  scenarioName: string;
  abundanceRate: number;
  cognitiveRate: number;
  democraticRate: number;
  scientificRate: number;
  meaningRate: number;
  ecologicalRate: number;
  cascadeRate: number;
  tippingPointRate: number; // Calculated from cascade
  totalSpirals: number;
}

/**
 * Parse Phase 2 log and extract spiral activation rates
 */
function parseLogForSpiralRates(logPath: string): SpiralData[] {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const spiralDataByScenario: SpiralData[] = [];

  let currentScenario: string | null = null;
  let spiralRates: Partial<Record<string, number>> = {};
  let cascadeRate = 0;
  let totalSpirals = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect scenario name
    const scenarioMatch = line.match(/📌 (.+)/);
    if (scenarioMatch) {
      // Save previous scenario if exists
      if (currentScenario && Object.keys(spiralRates).length > 0) {
        spiralDataByScenario.push({
          scenarioName: currentScenario,
          abundanceRate: spiralRates.abundance || 0,
          cognitiveRate: spiralRates.cognitive || 0,
          democraticRate: spiralRates.democratic || 0,
          scientificRate: spiralRates.scientific || 0,
          meaningRate: spiralRates.meaning || 0,
          ecologicalRate: spiralRates.ecological || 0,
          cascadeRate,
          tippingPointRate: cascadeRate, // Cascade = tipping points activated
          totalSpirals,
        });
      }

      currentScenario = scenarioMatch[1].trim();
      spiralRates = {};
      cascadeRate = 0;
      totalSpirals = 0;
      continue;
    }

    // Extract spiral activation rates (format: "Spiral:   XX% (avg timing: ...)")
    const spiralMatch = line.match(/(Abundance|Cognitive|Democratic|Scientific|Meaning|Ecological):\s+(\d+)%/);
    if (spiralMatch) {
      const spiralName = spiralMatch[1].toLowerCase();
      const rate = parseInt(spiralMatch[2], 10) / 100;
      spiralRates[spiralName] = rate;
      continue;
    }

    // Extract cascade rate
    const cascadeMatch = line.match(/Cascade rate:\s+(\d+)%/);
    if (cascadeMatch) {
      cascadeRate = parseInt(cascadeMatch[1], 10) / 100;
      continue;
    }

    // Extract total spirals
    const totalMatch = line.match(/Total spirals:\s+([\d.]+)\/6/);
    if (totalMatch) {
      totalSpirals = parseFloat(totalMatch[1]);
      continue;
    }
  }

  // Save last scenario
  if (currentScenario && Object.keys(spiralRates).length > 0) {
    spiralDataByScenario.push({
      scenarioName: currentScenario,
      abundanceRate: spiralRates.abundance || 0,
      cognitiveRate: spiralRates.cognitive || 0,
      democraticRate: spiralRates.democratic || 0,
      scientificRate: spiralRates.scientific || 0,
      meaningRate: spiralRates.meaning || 0,
      ecologicalRate: spiralRates.ecological || 0,
      cascadeRate,
      tippingPointRate: cascadeRate,
      totalSpirals,
    });
  }

  return spiralDataByScenario;
}

/**
 * Generate markdown table
 */
function generateMarkdownTable(data: SpiralData[]): string {
  const headers = [
    'Scenario',
    'Abundance',
    'Cognitive',
    'Democratic',
    'Scientific',
    'Meaning',
    'Ecological',
    'Cooperative',
    'Tipping',
    'Total',
  ];

  const separator = headers.map(h => '---'.padEnd(h.length, '-')).join(' | ');

  const rows = data.map(d => [
    d.scenarioName.padEnd(25),
    `${(d.abundanceRate * 100).toFixed(0)}%`.padStart(9),
    `${(d.cognitiveRate * 100).toFixed(0)}%`.padStart(9),
    `${(d.democraticRate * 100).toFixed(0)}%`.padStart(10),
    `${(d.scientificRate * 100).toFixed(0)}%`.padStart(10),
    `${(d.meaningRate * 100).toFixed(0)}%`.padStart(7),
    `${(d.ecologicalRate * 100).toFixed(0)}%`.padStart(10),
    `${(d.cascadeRate * 100).toFixed(0)}%`.padStart(11), // Cooperative (cascade triggered)
    `${(d.tippingPointRate * 100).toFixed(0)}%`.padStart(7), // Tipping points
    d.totalSpirals.toFixed(2).padStart(5),
  ].join(' | '));

  return [
    '',
    '## Spiral Activation Matrix',
    '',
    '**Values = % of runs that activated each spiral**',
    '',
    headers.join(' | '),
    separator,
    ...rows,
    '',
  ].join('\n');
}

/**
 * Generate CSV
 */
function generateCSV(data: SpiralData[]): string {
  const headers = [
    'Scenario',
    'Abundance%',
    'Cognitive%',
    'Democratic%',
    'Scientific%',
    'Meaning%',
    'Ecological%',
    'Cooperative%',
    'TippingPoint%',
    'TotalSpirals',
  ];

  const rows = data.map(d => [
    d.scenarioName,
    (d.abundanceRate * 100).toFixed(0),
    (d.cognitiveRate * 100).toFixed(0),
    (d.democraticRate * 100).toFixed(0),
    (d.scientificRate * 100).toFixed(0),
    (d.meaningRate * 100).toFixed(0),
    (d.ecologicalRate * 100).toFixed(0),
    (d.cascadeRate * 100).toFixed(0),
    (d.tippingPointRate * 100).toFixed(0),
    d.totalSpirals.toFixed(2),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Identify key patterns
 */
function analyzePatterns(data: SpiralData[]): string[] {
  const insights: string[] = [];

  // Find scenario with most spirals
  const maxSpirals = Math.max(...data.map(d => d.totalSpirals));
  const bestScenarios = data.filter(d => d.totalSpirals === maxSpirals);
  insights.push(`🏆 Most spirals: ${bestScenarios.map(s => s.scenarioName).join(', ')} (${maxSpirals.toFixed(2)}/6)`);

  // Find scenario with highest cascade rate
  const maxCascade = Math.max(...data.map(d => d.cascadeRate));
  const bestCascade = data.filter(d => d.cascadeRate === maxCascade);
  insights.push(`💡 Highest cascade rate: ${bestCascade.map(s => s.scenarioName).join(', ')} (${(maxCascade * 100).toFixed(0)}%)`);

  // Identify which spirals are easiest to activate (highest average)
  const avgAbundance = data.reduce((sum, d) => sum + d.abundanceRate, 0) / data.length;
  const avgCognitive = data.reduce((sum, d) => sum + d.cognitiveRate, 0) / data.length;
  const avgDemocratic = data.reduce((sum, d) => sum + d.democraticRate, 0) / data.length;
  const avgScientific = data.reduce((sum, d) => sum + d.scientificRate, 0) / data.length;
  const avgMeaning = data.reduce((sum, d) => sum + d.meaningRate, 0) / data.length;
  const avgEcological = data.reduce((sum, d) => sum + d.ecologicalRate, 0) / data.length;

  const spiralAvgs = [
    { name: 'Abundance', rate: avgAbundance },
    { name: 'Cognitive', rate: avgCognitive },
    { name: 'Democratic', rate: avgDemocratic },
    { name: 'Scientific', rate: avgScientific },
    { name: 'Meaning', rate: avgMeaning },
    { name: 'Ecological', rate: avgEcological },
  ].sort((a, b) => b.rate - a.rate);

  insights.push(`\n📊 Easiest spirals to activate (cross-scenario avg):`);
  spiralAvgs.forEach(s => {
    insights.push(`   ${s.name}: ${(s.rate * 100).toFixed(0)}%`);
  });

  // Identify scenarios that activate NO spirals
  const noSpirals = data.filter(d => d.totalSpirals === 0);
  if (noSpirals.length > 0) {
    insights.push(`\n⚠️  Scenarios with ZERO spirals: ${noSpirals.map(s => s.scenarioName).join(', ')}`);
  }

  return insights;
}

// Main execution
const logFile = process.argv[2];

if (!logFile) {
  console.error('❌ Usage: npx tsx scripts/generateSpiralMatrix.ts <log-file>');
  console.error('\nExample:');
  console.error('   npx tsx scripts/generateSpiralMatrix.ts logs/phase2_validation_post_fix_20251118_090346.log');
  process.exit(1);
}

if (!fs.existsSync(logFile)) {
  console.error(`❌ File not found: ${logFile}`);
  process.exit(1);
}

console.log('🔬 Generating Spiral Activation Matrix...');
console.log(`   Log file: ${logFile}\n`);

const data = parseLogForSpiralRates(logFile);

if (data.length === 0) {
  console.error('❌ No scenario data found in log file');
  console.error('   Expected format: Phase 2 scenario analysis logs from runPhase2Scenarios.ts');
  process.exit(1);
}

console.log(`📊 Found ${data.length} scenarios\n`);

// Generate outputs
const markdown = generateMarkdownTable(data);
const csv = generateCSV(data);

// Output markdown to console
console.log(markdown);

// Analyze patterns
const insights = analyzePatterns(data);
console.log('\n## Key Insights\n');
insights.forEach(insight => console.log(insight));

// Save CSV
const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const csvPath = path.join('/home/user/ai_game_theory_simulation/logs', `spiral_matrix_${timestamp}.csv`);
fs.writeFileSync(csvPath, csv);

console.log(`\n✅ CSV saved to: ${csvPath}\n`);
