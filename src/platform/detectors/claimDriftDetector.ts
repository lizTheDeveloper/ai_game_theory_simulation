/**
 * LSS-Based Claim Drift Detection
 *
 * Monitors claimed values against cited sources using Local Surprise Signal (LSS).
 * Detects when parameters drift from their research-backed values.
 *
 * Task 1.5.2 - LSS Integration for Claim Drift (Platform Engineer - Marcus)
 *
 * LSS Formula: surprise = |current - cited| / cited
 * Thresholds:
 * - NONE: < 0.05 (5% deviation)
 * - WARNING: 0.05 - 0.15 (5-15% deviation)
 * - ALERT: 0.15 - 0.30 (15-30% deviation)
 * - CRITICAL: > 0.30 (>30% deviation)
 */

import type { Claim, Citation, ClaimDriftResult } from '@/types/claims';
import { assertFinite } from '@/simulation/utils/assertions';

// ============================================================================
// LSS Thresholds
// ============================================================================

/**
 * LSS drift thresholds (configurable)
 */
export interface DriftThresholds {
  warning: number; // Default: 0.05
  alert: number; // Default: 0.15
  critical: number; // Default: 0.30
}

/**
 * Default LSS thresholds (5%, 15%, 30%)
 */
export const DEFAULT_DRIFT_THRESHOLDS: DriftThresholds = {
  warning: 0.05,
  alert: 0.15,
  critical: 0.30,
};

// ============================================================================
// Claim Drift Detection
// ============================================================================

/**
 * Check claim for drift against cited sources
 *
 * Compares claimed values to values in citations using LSS.
 *
 * @param claim - Claim to check
 * @param citedValue - Value from citation (if known)
 * @param thresholds - Custom thresholds (optional)
 * @returns Drift result or null if not applicable
 */
export function checkClaimDrift(
  claim: Claim,
  citedValue?: number,
  thresholds: DriftThresholds = DEFAULT_DRIFT_THRESHOLDS
): ClaimDriftResult | null {
  // Only check quantitative claims
  if (claim.type !== 'quantitative') {
    return null;
  }

  // Must have extracted values
  if (!claim.extracted_values || claim.extracted_values.length === 0) {
    return null;
  }

  // Get claimed value (first extracted value)
  const claimedValue = claim.extracted_values[0].value;

  // Validate claimed value
  assertFinite(claimedValue, {
    location: 'checkClaimDrift',
    valueName: 'claimedValue',
  });

  // Must have citations
  if (claim.citations.length === 0) {
    return null;
  }

  // Use provided cited value or extract from citation
  let citedVal = citedValue;

  // If no cited value provided, try to extract from citation metadata
  // (This would require citation verification, which is out of scope for now)
  if (citedVal === undefined) {
    // For now, return null if we don't have a cited value to compare against
    // In production, this would trigger citation verification
    return null;
  }

  // Validate cited value
  assertFinite(citedVal, {
    location: 'checkClaimDrift',
    valueName: 'citedValue',
  });

  // Calculate LSS (Local Surprise Signal)
  const drift = calculateLSS(claimedValue, citedVal);

  // Determine drift level
  const level = classifyDriftLevel(drift, thresholds);

  // Generate human-readable message
  const message = generateDriftMessage(claimedValue, citedVal, drift, level);

  // Determine recommended action
  const action = determineAction(level);

  return {
    claim_id: claim.id,
    claimed_value: claimedValue,
    cited_value: citedVal,
    drift,
    level,
    message,
    citation: claim.citations[0], // Primary citation
    detected_at: new Date().toISOString(),
    action,
  };
}

/**
 * Batch check claims for drift
 *
 * @param claims - Claims to check
 * @param citedValues - Map of claim ID → cited value
 * @param thresholds - Custom thresholds (optional)
 * @returns Array of drift results
 */
export function checkClaimsDrift(
  claims: Claim[],
  citedValues: Map<string, number>,
  thresholds?: DriftThresholds
): ClaimDriftResult[] {
  const results: ClaimDriftResult[] = [];

  for (const claim of claims) {
    const citedValue = citedValues.get(claim.id);
    const result = checkClaimDrift(claim, citedValue, thresholds);

    if (result) {
      results.push(result);
    }
  }

  return results;
}

// ============================================================================
// LSS Calculation
// ============================================================================

/**
 * Calculate Local Surprise Signal (LSS)
 *
 * LSS measures relative deviation from expected value.
 *
 * Formula: |current - cited| / cited
 *
 * @param current - Current/claimed value
 * @param cited - Cited/expected value
 * @returns LSS score (0 = no surprise, >1 = major surprise)
 */
export function calculateLSS(current: number, cited: number): number {
  // Prevent division by zero
  if (cited === 0) {
    // If cited is 0, use absolute difference
    return Math.abs(current);
  }

  // Standard LSS formula
  const lss = Math.abs(current - cited) / Math.abs(cited);

  // Validate result
  assertFinite(lss, {
    location: 'calculateLSS',
    valueName: 'lss',
    additionalInfo: { current, cited },
  });

  return lss;
}

/**
 * Classify drift level based on LSS score
 *
 * @param lss - LSS score
 * @param thresholds - Drift thresholds
 * @returns Drift level
 */
export function classifyDriftLevel(
  lss: number,
  thresholds: DriftThresholds = DEFAULT_DRIFT_THRESHOLDS
): 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL' {
  if (lss < thresholds.warning) {
    return 'NONE';
  } else if (lss < thresholds.alert) {
    return 'WARNING';
  } else if (lss < thresholds.critical) {
    return 'ALERT';
  } else {
    return 'CRITICAL';
  }
}

// ============================================================================
// Message Generation
// ============================================================================

/**
 * Generate human-readable drift message
 */
function generateDriftMessage(
  claimed: number,
  cited: number,
  drift: number,
  level: 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL'
): string {
  const percentDrift = (drift * 100).toFixed(1);
  const direction = claimed > cited ? 'higher' : 'lower';

  switch (level) {
    case 'NONE':
      return `✅ Claim value (${claimed}) matches citation (${cited}) within tolerance (${percentDrift}% drift)`;

    case 'WARNING':
      return `⚠️ Claim value (${claimed}) is ${percentDrift}% ${direction} than cited value (${cited})`;

    case 'ALERT':
      return `🚨 Claim value (${claimed}) deviates significantly from citation (${cited}) - ${percentDrift}% ${direction}`;

    case 'CRITICAL':
      return `❌ CRITICAL DRIFT: Claim value (${claimed}) is ${percentDrift}% ${direction} than cited value (${cited}) - verify source`;

    default:
      return `Drift: ${percentDrift}%`;
  }
}

/**
 * Determine recommended action based on drift level
 */
function determineAction(
  level: 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL'
): 'none' | 'review' | 'update' | 'alert' {
  switch (level) {
    case 'NONE':
      return 'none';
    case 'WARNING':
      return 'review';
    case 'ALERT':
      return 'update';
    case 'CRITICAL':
      return 'alert';
  }
}

// ============================================================================
// Drift Monitoring
// ============================================================================

/**
 * Drift monitor state
 */
export interface DriftMonitor {
  /** Monitored claims */
  claims: Map<string, Claim>;

  /** Cited values (from verification) */
  citedValues: Map<string, number>;

  /** Historical drift results */
  history: ClaimDriftResult[];

  /** Thresholds */
  thresholds: DriftThresholds;

  /** Last check timestamp */
  lastCheck: string; // ISO 8601
}

/**
 * Create drift monitor
 */
export function createDriftMonitor(
  thresholds: DriftThresholds = DEFAULT_DRIFT_THRESHOLDS
): DriftMonitor {
  return {
    claims: new Map(),
    citedValues: new Map(),
    history: [],
    thresholds,
    lastCheck: new Date().toISOString(),
  };
}

/**
 * Add claim to drift monitor
 */
export function addClaimToMonitor(
  monitor: DriftMonitor,
  claim: Claim,
  citedValue?: number
): void {
  monitor.claims.set(claim.id, claim);

  if (citedValue !== undefined) {
    monitor.citedValues.set(claim.id, citedValue);
  }
}

/**
 * Run drift check on all monitored claims
 */
export function runDriftCheck(monitor: DriftMonitor): ClaimDriftResult[] {
  const results = checkClaimsDrift(
    Array.from(monitor.claims.values()),
    monitor.citedValues,
    monitor.thresholds
  );

  // Add to history
  monitor.history.push(...results);

  // Update last check timestamp
  monitor.lastCheck = new Date().toISOString();

  return results;
}

/**
 * Get drift alerts (WARNING, ALERT, CRITICAL)
 */
export function getDriftAlerts(monitor: DriftMonitor): ClaimDriftResult[] {
  return monitor.history.filter((result) => result.level !== 'NONE');
}

/**
 * Get critical drifts only
 */
export function getCriticalDrifts(monitor: DriftMonitor): ClaimDriftResult[] {
  return monitor.history.filter((result) => result.level === 'CRITICAL');
}

/**
 * Clear drift history older than specified days
 */
export function clearOldDriftHistory(monitor: DriftMonitor, daysOld: number): void {
  const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  monitor.history = monitor.history.filter((result) => {
    const timestamp = new Date(result.detected_at).getTime();
    return timestamp >= cutoff;
  });
}

// ============================================================================
// Drift Statistics
// ============================================================================

/**
 * Calculate drift statistics
 */
export function calculateDriftStatistics(results: ClaimDriftResult[]): {
  total: number;
  byLevel: Record<'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL', number>;
  avgDrift: number;
  maxDrift: number;
  minDrift: number;
} {
  if (results.length === 0) {
    return {
      total: 0,
      byLevel: { NONE: 0, WARNING: 0, ALERT: 0, CRITICAL: 0 },
      avgDrift: 0,
      maxDrift: 0,
      minDrift: 0,
    };
  }

  const byLevel = {
    NONE: results.filter((r) => r.level === 'NONE').length,
    WARNING: results.filter((r) => r.level === 'WARNING').length,
    ALERT: results.filter((r) => r.level === 'ALERT').length,
    CRITICAL: results.filter((r) => r.level === 'CRITICAL').length,
  };

  const drifts = results.map((r) => r.drift);
  const avgDrift = drifts.reduce((sum, d) => sum + d, 0) / drifts.length;
  const maxDrift = Math.max(...drifts);
  const minDrift = Math.min(...drifts);

  return {
    total: results.length,
    byLevel,
    avgDrift,
    maxDrift,
    minDrift,
  };
}
