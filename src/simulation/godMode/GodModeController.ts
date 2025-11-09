/**
 * God Mode Controller
 *
 * Manages manual overrides for all automated simulation decisions.
 * Provides a clean API for the UI to control simulation behavior.
 *
 * Architecture:
 * - Singleton pattern for global access
 * - Override registry for each decision type
 * - Validation layer for input constraints
 * - Audit trail for all manual interventions
 */

import { GameState, RNGFunction } from '@/types/game';
import { GameAction } from '@/simulation/agents/types';

export interface GodModeOverride {
  path: string;           // Dot notation path in GameState (e.g., "government.controlDesire")
  value: any;            // Override value
  type: 'replace' | 'multiply' | 'add'; // How to apply override
  phase?: string;        // Optional: only apply in specific phase
  expires?: number;      // Optional: expires after N simulation steps
}

export interface GodModeDecision {
  id: string;
  category: 'government' | 'ai' | 'society' | 'organization' | 'crisis' | 'environment' | 'technology' | 'meta';
  name: string;
  description: string;
  currentValue?: any;
  override?: any;
  locked: boolean;       // Some decisions may be locked based on state
}

export interface GodModeAuditEntry {
  timestamp: number;
  month: number;
  decision: string;
  oldValue: any;
  newValue: any;
  category: string;
}

export class GodModeController {
  private static instance: GodModeController;

  private enabled: boolean = false;
  private overrides: Map<string, GodModeOverride> = new Map();
  private auditLog: GodModeAuditEntry[] = [];
  private pauseOnDecision: Set<string> = new Set();
  private stepMode: boolean = false;
  private currentPhase: string = '';

  // Decision queues for different actors
  private governmentActionQueue: GameAction[] = [];
  private aiActionQueues: Map<string, GameAction[]> = new Map();
  private societyResponseQueue: any[] = [];

  private constructor() {}

  static getInstance(): GodModeController {
    if (!GodModeController.instance) {
      GodModeController.instance = new GodModeController();
    }
    return GodModeController.instance;
  }

  // Core API

  enable(): void {
    this.enabled = true;
    console.log('🎮 GOD MODE ACTIVATED');
  }

  disable(): void {
    this.enabled = false;
    this.clearAllOverrides();
    console.log('🎮 God Mode deactivated');
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Override Management

  setOverride(path: string, value: any, type: 'replace' | 'multiply' | 'add' = 'replace'): void {
    if (!this.enabled) return;

    const override: GodModeOverride = { path, value, type };
    this.overrides.set(path, override);

    this.logAudit({
      timestamp: Date.now(),
      month: -1, // Will be set during application
      decision: path,
      oldValue: null, // Will be captured during application
      newValue: value,
      category: this.categorizeDecision(path)
    });
  }

  clearOverride(path: string): void {
    this.overrides.delete(path);
  }

  clearAllOverrides(): void {
    this.overrides.clear();
    this.governmentActionQueue = [];
    this.aiActionQueues.clear();
    this.societyResponseQueue = [];
  }

  // Apply overrides to state

  applyOverrides(state: GameState): void {
    if (!this.enabled) return;

    for (const [path, override] of this.overrides) {
      if (override.expires && override.expires <= state.currentMonth) {
        this.overrides.delete(path);
        continue;
      }

      if (override.phase && override.phase !== this.currentPhase) {
        continue;
      }

      this.applyOverrideToState(state, override);
    }
  }

  private applyOverrideToState(state: GameState, override: GodModeOverride): void {
    const pathParts = override.path.split('.');
    let target: any = state;

    // Navigate to parent object
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!target[pathParts[i]]) {
        console.warn(`🎮 God Mode: Invalid path ${override.path}`);
        return;
      }
      target = target[pathParts[i]];
    }

    const property = pathParts[pathParts.length - 1];
    const oldValue = target[property];

    switch (override.type) {
      case 'replace':
        target[property] = override.value;
        break;
      case 'multiply':
        target[property] = (oldValue || 0) * override.value;
        break;
      case 'add':
        target[property] = (oldValue || 0) + override.value;
        break;
    }

    // Log the application
    console.log(`🎮 Applied override: ${override.path} = ${target[property]} (was ${oldValue})`);
  }

  // Government Control

  setGovernmentPriority(priorityType: string, weight: number): void {
    this.setOverride(`government.priorities.${priorityType}`, weight);
  }

  queueGovernmentAction(action: GameAction): void {
    if (!this.enabled) return;
    this.governmentActionQueue.push(action);
  }

  getGovernmentActionOverride(): GameAction | null {
    if (!this.enabled || this.governmentActionQueue.length === 0) {
      return null;
    }
    return this.governmentActionQueue.shift() || null;
  }

  // AI Agent Control

  setAIAgentBehavior(agentId: string, behavior: any): void {
    this.setOverride(`aiAgents[${agentId}].behavior`, behavior);
  }

  queueAIAction(agentId: string, action: GameAction): void {
    if (!this.enabled) return;
    if (!this.aiActionQueues.has(agentId)) {
      this.aiActionQueues.set(agentId, []);
    }
    this.aiActionQueues.get(agentId)!.push(action);
  }

  getAIActionOverride(agentId: string): GameAction | null {
    if (!this.enabled) return null;
    const queue = this.aiActionQueues.get(agentId);
    if (!queue || queue.length === 0) return null;
    return queue.shift() || null;
  }

  // Society Control

  setSocietyResponse(responseType: string, value: number): void {
    this.setOverride(`society.${responseType}`, value);
  }

  // Crisis Control

  triggerCrisis(crisisType: string, severity: number): void {
    if (!this.enabled) return;

    // Special handling for crisis triggers
    this.setOverride(`crises.${crisisType}.triggered`, true);
    this.setOverride(`crises.${crisisType}.severity`, severity);
  }

  preventCrisis(crisisType: string): void {
    this.setOverride(`crises.${crisisType}.prevented`, true);
  }

  // Environmental Control

  setEnvironmentalParameter(param: string, value: number): void {
    this.setOverride(`environment.${param}`, value);
  }

  overridePlanetaryBoundary(boundary: string, value: number): void {
    this.setOverride(`planetaryBoundaries.${boundary}`, value);
  }

  // Technology Control

  forceTechnologyBreakthrough(techId: string): void {
    if (!this.enabled) return;
    this.setOverride(`technologies.${techId}.breakthrough`, true);
  }

  setTechnologyDeploymentPriority(priorities: string[]): void {
    this.setOverride('technology.deploymentPriorities', priorities);
  }

  // Meta Controls

  enableStepMode(): void {
    this.stepMode = true;
    console.log('🎮 Step mode enabled - will pause between phases');
  }

  disableStepMode(): void {
    this.stepMode = false;
  }

  shouldPausePhase(phaseId: string): boolean {
    this.currentPhase = phaseId;
    return this.enabled && (this.stepMode || this.pauseOnDecision.has(phaseId));
  }

  setPauseOnDecision(phaseId: string, shouldPause: boolean): void {
    if (shouldPause) {
      this.pauseOnDecision.add(phaseId);
    } else {
      this.pauseOnDecision.delete(phaseId);
    }
  }

  // Audit & State

  private logAudit(entry: GodModeAuditEntry): void {
    this.auditLog.push(entry);
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  getAuditLog(): GodModeAuditEntry[] {
    return [...this.auditLog];
  }

  clearAuditLog(): void {
    this.auditLog = [];
  }

  // Helpers

  private categorizeDecision(path: string): string {
    if (path.startsWith('government')) return 'government';
    if (path.startsWith('aiAgents')) return 'ai';
    if (path.startsWith('society')) return 'society';
    if (path.startsWith('organizations')) return 'organization';
    if (path.startsWith('crises')) return 'crisis';
    if (path.includes('environment') || path.includes('planetary')) return 'environment';
    if (path.includes('tech')) return 'technology';
    return 'meta';
  }

  // Export/Import Configuration

  exportConfiguration(): string {
    const config = {
      enabled: this.enabled,
      overrides: Array.from(this.overrides.entries()),
      pauseOnDecision: Array.from(this.pauseOnDecision),
      stepMode: this.stepMode
    };
    return JSON.stringify(config, null, 2);
  }

  importConfiguration(configJson: string): void {
    try {
      const config = JSON.parse(configJson);
      this.enabled = config.enabled;
      this.overrides = new Map(config.overrides);
      this.pauseOnDecision = new Set(config.pauseOnDecision);
      this.stepMode = config.stepMode;
      console.log('🎮 God Mode configuration imported');
    } catch (error) {
      console.error('🎮 Failed to import God Mode configuration:', error);
    }
  }

  // Get current state for UI

  getCurrentDecisions(state: GameState): GodModeDecision[] {
    const decisions: GodModeDecision[] = [];

    // Government decisions
    decisions.push({
      id: 'gov.controlDesire',
      category: 'government',
      name: 'Control Desire',
      description: 'Government desire to control AI (0-1)',
      currentValue: state.government?.controlDesire,
      override: this.overrides.get('government.controlDesire')?.value,
      locked: false
    });

    decisions.push({
      id: 'gov.alignmentInvestment',
      category: 'government',
      name: 'Alignment Research Investment',
      description: 'Investment in AI alignment research (0-10)',
      currentValue: state.government?.alignmentResearchInvestment,
      override: this.overrides.get('government.alignmentResearchInvestment')?.value,
      locked: false
    });

    // Add more decisions based on the inventory...

    return decisions;
  }
}

// Export singleton instance
export const godMode = GodModeController.getInstance();