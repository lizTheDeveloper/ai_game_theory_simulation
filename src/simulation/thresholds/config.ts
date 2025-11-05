/**
 * Threshold Configuration Export/Import - Phase 4
 *
 * Enables reproducibility by saving/loading threshold configurations.
 * Use cases:
 * - Save exact threshold values from a specific run for reproduction
 * - Share threshold configs between researchers
 * - Create standardized benchmark configs
 * - Debug specific threshold combinations
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Thresholds, ScenarioName, SliderSettings } from './index';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';

/**
 * Threshold configuration metadata
 */
export interface ThresholdConfig {
  /** Configuration metadata */
  metadata: {
    /** Unique identifier for this config */
    id: string;

    /** Human-readable description */
    description: string;

    /** Creation timestamp (ISO 8601) */
    createdAt: string;

    /** Named scenario used (if any) */
    scenario?: ScenarioName;

    /** Custom slider settings used (if any) */
    sliders?: SliderSettings;

    /** RNG seed used for sampling */
    seed?: number;

    /** Git commit hash (if available) */
    gitCommit?: string;
  };

  /** Sampled threshold values */
  thresholds: Thresholds;

  /** Optional notes/annotations */
  notes?: string;
}

/**
 * Export threshold configuration to JSON file
 *
 * @param config - Threshold configuration to export
 * @param filePath - Output file path (absolute or relative to cwd)
 * @returns Absolute path to saved file
 */
export function exportThresholdConfig(config: ThresholdConfig, filePath: string): string {
  // Ensure directory exists
  const absolutePath = path.resolve(filePath);
  const directory = path.dirname(absolutePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write JSON with pretty formatting
  const json = JSON.stringify(config, null, 2);
  fs.writeFileSync(absolutePath, json, 'utf-8');

  return absolutePath;
}

/**
 * Import threshold configuration from JSON file
 *
 * @param filePath - Input file path (absolute or relative to cwd)
 * @returns Parsed threshold configuration
 * @throws Error if file doesn't exist or JSON is invalid
 */
export function importThresholdConfig(filePath: string): ThresholdConfig {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Threshold config file not found: ${absolutePath}`);
  }

  const json = fs.readFileSync(absolutePath, 'utf-8');
  const config = JSON.parse(json) as ThresholdConfig;

  // Validate structure
  if (!config.metadata || !config.thresholds) {
    throw new Error(`Invalid threshold config structure in ${absolutePath}`);
  }

  return config;
}

/**
 * Create threshold configuration from sampled values
 *
 * @param thresholds - Sampled threshold values
 * @param metadata - Configuration metadata
 * @param notes - Optional notes
 * @returns Complete threshold configuration
 */
export function createThresholdConfig(
  thresholds: Thresholds,
  metadata: {
    id?: string;
    description: string;
    scenario?: ScenarioName;
    sliders?: SliderSettings;
    seed?: number;
    gitCommit?: string;
  },
  notes?: string
): ThresholdConfig {
  return {
    metadata: {
      id: metadata.id ?? generateConfigId(),
      description: metadata.description,
      createdAt: new Date().toISOString(),
      scenario: metadata.scenario,
      sliders: metadata.sliders,
      seed: metadata.seed,
      gitCommit: metadata.gitCommit ?? getCurrentGitCommit()
    },
    thresholds,
    notes
  };
}

/**
 * Generate unique config ID (timestamp-based)
 */
function generateConfigId(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const random = deterministicRandom().toString(36).substring(2, 6);
  return `threshold-config-${timestamp}-${random}`;
}

/**
 * Get current git commit hash (if available)
 */
function getCurrentGitCommit(): string | undefined {
  try {
    const { execSync } = require('child_process');
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    return commit;
  } catch {
    return undefined;
  }
}

/**
 * List available threshold configs in a directory
 *
 * @param directory - Directory to scan (defaults to 'thresholdConfigs/')
 * @returns Array of config file paths with metadata
 */
export function listThresholdConfigs(directory: string = 'thresholdConfigs'): Array<{
  path: string;
  id: string;
  description: string;
  createdAt: string;
  scenario?: ScenarioName;
}> {
  const absoluteDir = path.resolve(directory);

  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const files = fs.readdirSync(absoluteDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(absoluteDir, f));

  const configs: Array<{
    path: string;
    id: string;
    description: string;
    createdAt: string;
    scenario?: ScenarioName;
  }> = [];

  for (const filePath of files) {
    try {
      const config = importThresholdConfig(filePath);
      configs.push({
        path: filePath,
        id: config.metadata.id,
        description: config.metadata.description,
        createdAt: config.metadata.createdAt,
        scenario: config.metadata.scenario
      });
    } catch {
      // Skip invalid configs
      continue;
    }
  }

  return configs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // Newest first
}

/**
 * Pretty-print threshold configuration to console
 *
 * @param config - Configuration to display
 */
export function printThresholdConfig(config: ThresholdConfig): void {
  console.log('\n=== Threshold Configuration ===');
  console.log(`ID: ${config.metadata.id}`);
  console.log(`Description: ${config.metadata.description}`);
  console.log(`Created: ${config.metadata.createdAt}`);

  if (config.metadata.scenario) {
    console.log(`Scenario: ${config.metadata.scenario}`);
  }

  if (config.metadata.seed !== undefined) {
    console.log(`Seed: ${config.metadata.seed}`);
  }

  if (config.metadata.gitCommit) {
    console.log(`Git Commit: ${config.metadata.gitCommit}`);
  }

  if (config.metadata.sliders && Object.keys(config.metadata.sliders).length > 0) {
    console.log('\nCustom Sliders:');
    for (const [key, value] of Object.entries(config.metadata.sliders)) {
      console.log(`  ${key}: ${value}`);
    }
  }

  console.log('\nThreshold Values:');
  const thresholds = config.thresholds as unknown as Record<string, number>;
  for (const [key, value] of Object.entries(thresholds)) {
    console.log(`  ${key}: ${typeof value === 'number' ? value.toFixed(4) : value}`);
  }

  if (config.notes) {
    console.log(`\nNotes: ${config.notes}`);
  }

  console.log('===============================\n');
}

/**
 * Validate threshold configuration values are within expected ranges
 *
 * @param config - Configuration to validate
 * @returns Validation result with errors (empty array if valid)
 */
export function validateThresholdConfig(config: ThresholdConfig): string[] {
  const errors: string[] = [];
  const t = config.thresholds;

  // Tier 1 validations
  if (t.socialCriticalMass < 0.20 || t.socialCriticalMass > 0.30) {
    errors.push(`socialCriticalMass out of range: ${t.socialCriticalMass} (expected [0.20, 0.30])`);
  }

  if (t.trustRecoveryRate < 0.005 || t.trustRecoveryRate > 0.03) {
    errors.push(`trustRecoveryRate out of range: ${t.trustRecoveryRate} (expected [0.005, 0.03])`);
  }

  if (t.climateSensitivity < 2.0 || t.climateSensitivity > 5.0) {
    errors.push(`climateSensitivity out of range: ${t.climateSensitivity} (expected [2.0, 5.0])`);
  }

  if (t.automationJobLossThreshold < 0.25 || t.automationJobLossThreshold > 0.45) {
    errors.push(`automationJobLossThreshold out of range: ${t.automationJobLossThreshold} (expected [0.25, 0.45])`);
  }

  // Tier 2 validations
  if (t.governmentLegitimacyCrisisThreshold < 0.25 || t.governmentLegitimacyCrisisThreshold > 0.40) {
    errors.push(`governmentLegitimacyCrisisThreshold out of range: ${t.governmentLegitimacyCrisisThreshold} (expected [0.25, 0.40])`);
  }

  if (t.surveillanceDystopiaThreshold < 0.65 || t.surveillanceDystopiaThreshold > 0.80) {
    errors.push(`surveillanceDystopiaThreshold out of range: ${t.surveillanceDystopiaThreshold} (expected [0.65, 0.80])`);
  }

  if (t.automationDisplacementCrisisThreshold < 0.40 || t.automationDisplacementCrisisThreshold > 0.60) {
    errors.push(`automationDisplacementCrisisThreshold out of range: ${t.automationDisplacementCrisisThreshold} (expected [0.40, 0.60])`);
  }

  if (t.aiRecursiveImprovementThreshold < 1.2 || t.aiRecursiveImprovementThreshold > 1.5) {
    errors.push(`aiRecursiveImprovementThreshold out of range: ${t.aiRecursiveImprovementThreshold} (expected [1.2, 1.5])`);
  }

  if (t.resentmentRevoltTriggerThreshold < 0.60 || t.resentmentRevoltTriggerThreshold > 0.80) {
    errors.push(`resentmentRevoltTriggerThreshold out of range: ${t.resentmentRevoltTriggerThreshold} (expected [0.60, 0.80])`);
  }

  return errors;
}
