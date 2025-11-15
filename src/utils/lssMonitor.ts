/**
 * LSS (Local Surprise Signal) Monitoring Utility
 *
 * Implements Nested Learning's Local Surprise Signal for detecting:
 * - Parameter drift from cited values
 * - Claim deviation from source text
 * - Memory staleness (last save time)
 * - Verification failures
 *
 * LSS quantifies mismatch between current state and expected structure.
 * High LSS triggers learning/consolidation or alerts.
 *
 * Reference: Behrouz et al., "Nested Learning", NeurIPS 2025
 */

import { assertFinite } from '@/simulation/utils/assertions';

/**
 * LSS thresholds (from project plan)
 * - >0.2: Warning threshold
 * - >0.5: Alert threshold (creates GitHub issue)
 */
export const LSS_THRESHOLDS = {
  WARNING: 0.2,
  ALERT: 0.5,
  CRITICAL: 1.0,
} as const;

/**
 * Parameter provenance types (Level 0-2)
 */
export type ProvenanceType = 'PLACEHOLDER' | 'INFORMED' | 'VERIFIED';

/**
 * Context for LSS calculation (for error messages)
 */
export interface LSSContext {
  location: string;
  valueName: string;
  timestamp?: number;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Parameter with provenance metadata
 */
export interface ParameterWithProvenance {
  value: number;
  type: ProvenanceType;
  doi?: string;
  citedValue?: number;
  confidence?: number;
  lastValidated?: number;
}

/**
 * Claim with verification metadata
 */
export interface ClaimWithVerification {
  text: string;
  verified: boolean;
  confidence: number;
  sourceText?: string;
}

/**
 * Agent memory metadata
 */
export interface AgentMemory {
  agentId: string;
  lastSave: number;
  expectedInterval: number; // milliseconds
}

/**
 * Verification result
 */
export interface VerificationResult {
  verified: boolean;
  confidence: number;
  match?: 'exact' | 'paraphrase' | 'none';
}

/**
 * LSS calculation result
 */
export interface LSSResult {
  lss: number;
  level: 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL';
  message: string;
  context: LSSContext;
}

/**
 * Check parameter drift from cited value
 *
 * LSS = |current - cited| / cited
 *
 * @param param - Parameter with provenance metadata
 * @param context - Context for error messages
 * @returns LSS result with drift calculation
 */
export function checkParameterDrift(
  param: ParameterWithProvenance,
  context: LSSContext
): LSSResult {
  // PLACEHOLDER parameters have no citation yet - LSS = 0
  if (param.type === 'PLACEHOLDER') {
    return {
      lss: 0,
      level: 'NONE',
      message: 'PLACEHOLDER parameter - no citation to drift from',
      context,
    };
  }

  // INFORMED parameters may not have exact citation - LSS based on confidence
  if (param.type === 'INFORMED') {
    const confidence = param.confidence ?? 0.5;
    const lss = 1 - confidence; // Lower confidence = higher surprise
    return {
      lss,
      level: determineLSSLevel(lss),
      message: `INFORMED parameter with confidence ${confidence.toFixed(2)}`,
      context,
    };
  }

  // VERIFIED parameters must have citation
  if (param.type === 'VERIFIED') {
    if (param.citedValue === undefined) {
      throw new Error(
        `❌ CRITICAL: VERIFIED parameter missing citedValue at ${context.location}`
      );
    }

    // Validate values are finite
    assertFinite(param.value, {
      location: context.location,
      valueName: `${context.valueName}.value`,
    });
    assertFinite(param.citedValue, {
      location: context.location,
      valueName: `${context.valueName}.citedValue`,
    });

    // Calculate drift: |current - cited| / cited
    const drift = Math.abs(param.value - param.citedValue) / Math.abs(param.citedValue);
    const lss = assertFinite(drift, {
      location: 'checkParameterDrift',
      valueName: 'drift',
      additionalInfo: { current: param.value, cited: param.citedValue },
    });

    return {
      lss,
      level: determineLSSLevel(lss),
      message: `Parameter drift: current=${param.value}, cited=${param.citedValue}, drift=${(lss * 100).toFixed(1)}%`,
      context,
    };
  }

  throw new Error(`❌ Unknown provenance type: ${param.type}`);
}

/**
 * Check claim deviation from source text
 *
 * LSS = 1 - semantic_similarity(claim, source)
 *
 * For now, uses simple text matching. Future: sentence embeddings + cosine similarity.
 *
 * @param claim - Claim with verification metadata
 * @param context - Context for error messages
 * @returns LSS result with deviation calculation
 */
export function checkClaimDeviation(
  claim: ClaimWithVerification,
  context: LSSContext
): LSSResult {
  // Not verified = maximum surprise
  if (!claim.verified) {
    return {
      lss: 1.0,
      level: 'CRITICAL',
      message: 'FABRICATION: Claim not found in source',
      context,
    };
  }

  // Verified with confidence score
  // LSS = 1 - confidence (low confidence = high surprise)
  const lss = 1 - claim.confidence;

  let message: string;
  if (claim.confidence >= 0.9) {
    message = 'Exact match (high confidence)';
  } else if (claim.confidence >= 0.7) {
    message = 'Paraphrase match (medium confidence)';
  } else {
    message = 'Weak match (low confidence)';
  }

  return {
    lss,
    level: determineLSSLevel(lss),
    message: `${message} - confidence=${claim.confidence.toFixed(2)}`,
    context,
  };
}

/**
 * Check memory staleness based on last save time
 *
 * LSS = elapsed / expected_interval
 *
 * @param memory - Agent memory metadata
 * @param context - Context for error messages
 * @returns LSS result with staleness calculation
 */
export function checkMemoryStaleness(
  memory: AgentMemory,
  context: LSSContext
): LSSResult {
  const now = Date.now();
  const elapsed = now - memory.lastSave;
  const lss = elapsed / memory.expectedInterval;

  // Convert to human-readable format
  const elapsedMinutes = Math.floor(elapsed / (60 * 1000));
  const expectedMinutes = Math.floor(memory.expectedInterval / (60 * 1000));

  return {
    lss,
    level: determineLSSLevel(lss),
    message: `Memory staleness: ${elapsedMinutes}min elapsed, ${expectedMinutes}min expected (agent: ${memory.agentId})`,
    context,
  };
}

/**
 * Check verification surprise based on result confidence
 *
 * LSS based on verification result:
 * - Exact match (confidence > 0.9): LSS = 0
 * - Paraphrase (confidence 0.7-0.9): LSS = 0.2
 * - Weak match (confidence < 0.7): LSS = 0.5
 * - Not found: LSS = 1.0
 *
 * @param result - Verification result
 * @param context - Context for error messages
 * @returns LSS result with verification surprise
 */
export function checkVerificationSurprise(
  result: VerificationResult,
  context: LSSContext
): LSSResult {
  if (!result.verified) {
    return {
      lss: 1.0,
      level: 'CRITICAL',
      message: 'Verification failed - claim not found in sources',
      context,
    };
  }

  // Map confidence to LSS
  let lss: number;
  let message: string;

  if (result.confidence >= 0.9) {
    lss = 0;
    message = 'Exact match verified';
  } else if (result.confidence >= 0.7) {
    lss = 0.2;
    message = 'Paraphrase match verified';
  } else {
    lss = 0.5;
    message = 'Weak match - needs review';
  }

  return {
    lss,
    level: determineLSSLevel(lss),
    message: `${message} (confidence=${result.confidence.toFixed(2)})`,
    context,
  };
}

/**
 * Determine LSS level based on threshold
 *
 * @param lss - LSS value (0-1+)
 * @returns Level classification
 */
function determineLSSLevel(lss: number): 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL' {
  if (lss >= LSS_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (lss >= LSS_THRESHOLDS.ALERT) return 'ALERT';
  if (lss >= LSS_THRESHOLDS.WARNING) return 'WARNING';
  return 'NONE';
}

/**
 * Log LSS result with appropriate formatting
 *
 * @param result - LSS result to log
 */
export function logLSS(result: LSSResult): void {
  const emoji = {
    NONE: '✅',
    WARNING: '⚠️',
    ALERT: '🚨',
    CRITICAL: '❌',
  }[result.level];

  const lssPercent = (result.lss * 100).toFixed(1);
  console.log(
    `${emoji} LSS=${lssPercent}% [${result.level}] ${result.message} (${result.context.location})`
  );
}

/**
 * Monitor LSS and trigger actions based on thresholds
 *
 * Actions:
 * - WARNING (>0.2): Log warning
 * - ALERT (>0.5): Log alert + create GitHub issue (future)
 * - CRITICAL (≥1.0): Log critical + block deployment
 *
 * @param result - LSS result
 * @returns True if action triggered, false otherwise
 */
export function monitorLSS(result: LSSResult): boolean {
  logLSS(result);

  if (result.level === 'CRITICAL') {
    console.error(
      `\n🚨 CRITICAL LSS DETECTED 🚨\n` +
        `Location: ${result.context.location}\n` +
        `Value: ${result.context.valueName}\n` +
        `LSS: ${result.lss.toFixed(3)}\n` +
        `Message: ${result.message}\n` +
        `\nAction required: Fix issue before deployment\n`
    );
    return true;
  }

  if (result.level === 'ALERT') {
    console.warn(
      `\n🚨 HIGH LSS ALERT 🚨\n` +
        `Location: ${result.context.location}\n` +
        `LSS: ${result.lss.toFixed(3)}\n` +
        `Message: ${result.message}\n` +
        `\nAction: Creating GitHub issue (future implementation)\n`
    );
    return true;
  }

  if (result.level === 'WARNING') {
    console.warn(
      `⚠️ LSS Warning: ${result.message} (${result.context.location})`
    );
    return true;
  }

  return false;
}
