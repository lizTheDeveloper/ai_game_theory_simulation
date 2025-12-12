/**
 * Research and Infrastructure government actions
 *
 * Actions related to AI research infrastructure and evaluation systems including:
 * - Capability benchmark development
 * - National AI infrastructure (government data centers)
 *
 * Research foundation:
 * - NIST AI Risk Management Framework (2024): Evaluation systems
 * - UK AI Safety Institute (2024): Benchmark development
 * - Executive Order 14110 (2023): National AI infrastructure
 */

import { GameState } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';
import { getGovernmentOrg } from '@/simulation/utils/simulationIndices';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string, month: number): string => {
  eventIdCounter += 1;
  return `${prefix}_${month}_${eventIdCounter}`;
};

/**
 * Invest in Capability Benchmarks
 * Develop comprehensive benchmarks to measure AI capabilities
 */
const investBenchmarkSuite: CategorizedGovernmentAction = {
  id: 'invest_benchmark_suite',
  name: 'Invest in Capability Benchmarks',
  description: 'Develop comprehensive benchmarks to measure AI capabilities. Better benchmarks reveal true capability (but can still be gamed/sandbagged).',
  agentType: 'government',
  category: 'research',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.government.evaluationInvestment.benchmarkSuite < 10;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    const improvement = 1.0;
    const oldLevel = state.government.evaluationInvestment.benchmarkSuite;
    state.government.evaluationInvestment.benchmarkSuite = Math.min(10, oldLevel + improvement);
    const newLevel = state.government.evaluationInvestment.benchmarkSuite;

    return {
      success: true,
      effects: { benchmarkQuality: newLevel },
      events: [{
        id: `policy_${state.currentMonth}_${Math.floor(random() * 1000000)}`,
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'info',
        agent: 'government',
        title: 'Benchmark Suite Improved',
        description: `Capability benchmark quality improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. Better detection of true AI capabilities.`,
        effects: { benchmarkQuality: newLevel }
      }],
      message: `Benchmark suite improved to ${newLevel.toFixed(1)}/10`
    };
  }
};

/**
 * Build National AI Infrastructure
 * Government builds own data center
 */
const fundNationalCompute: CategorizedGovernmentAction = {
  id: 'fund_national_compute',
  name: 'Build National AI Infrastructure',
  description: 'Government builds own data center (24-72 months, large cost, reduces dependence on private sector)',
  agentType: 'government',
  category: 'research',
  energyCost: 4,

  canExecute: (state: GameState): boolean => {
    // O(n) fallback since canExecute() doesn't have PhaseContext.indices
    const govOrg = getGovernmentOrg(state);
    if (!govOrg) return false;

    // Don't build if already building
    const alreadyBuilding = govOrg.currentProjects.some(p => p.type === 'datacenter_construction');
    if (alreadyBuilding) return false;

    // Need sufficient capital
    const cost = 50 * govOrg.monthlyRevenue;
    if (govOrg.capital < cost * 1.5) return false;

    // Only build if private sector is strong (competitive pressure)
    const privateDCs = state.computeInfrastructure.dataCenters
      .filter(dc => dc.organizationId !== 'government' && dc.operational).length;

    return privateDCs > 2;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // O(n) fallback since execute() doesn't have PhaseContext.indices
    const govOrg = getGovernmentOrg(state);

    if (!govOrg) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Government organization not found'
      };
    }

    // Start construction using organization management
    const { startDataCenterConstruction } = require('../../organizationManagement');
    startDataCenterConstruction(govOrg, random);

    // Consequences
    state.government.legitimacy -= 0.05; // Controversial spending

    return {
      success: true,
      effects: { nationalCompute: 1 },
      events: [{
        id: `policy_${state.currentMonth}_${Math.floor(random() * 1000000)}`,
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'medium',
        agent: 'government',
        title: 'National AI Infrastructure Funded',
        description: `Government started building national data center. Reduces dependence on private sector but costs taxpayer money.`,
        effects: { legitimacy: -0.05 }
      }],
      message: 'Government started building national data center'
    };
  }
};

/**
 * Allocate Research Budget
 * Set ongoing research spending as % of GDP (repeatable action for scenario testing)
 *
 * Research foundation:
 * - US research spending: ~3.5% GDP (NSF 2024)
 * - China research spending: ~2.4% GDP (OECD 2024)
 * - EU average: ~2.2% GDP (Eurostat 2024)
 * - Nordic countries: 3-4% GDP (highest globally)
 */
const allocateResearchBudget: CategorizedGovernmentAction = {
  id: 'allocate_research_budget',
  name: 'Allocate Research Budget',
  description: 'Set ongoing research budget allocation as % of GDP (low 0.5%, medium 1.5%, high 3.0%, maximum 5.0%). Repeatable action for adjusting research priorities.',
  agentType: 'government',
  category: 'research',
  energyCost: 1,

  canExecute: (state: GameState): boolean => {
    // Require baseline economic capacity
    // GDP approximation: population (B) × QoL × (1 + stage × 0.2) × $10T
    const population = state.humanPopulationSystem?.population || 8.0;
    const qol = state.globalMetrics.qualityOfLife || 1.0;
    const stage = state.globalMetrics.economicTransitionStage || 1.0;
    const gdp = population * qol * (1 + stage * 0.2) * 10; // Rough GDP in $T

    // Require at least $50T GDP (baseline economic capacity)
    return gdp > 50;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Calculate GDP for budget allocation
    const population = state.humanPopulationSystem?.population || 8.0;
    const qol = state.globalMetrics.qualityOfLife || 1.0;
    const stage = state.globalMetrics.economicTransitionStage || 1.0;
    const gdp = population * qol * (1 + stage * 0.2) * 10; // GDP in $T

    // Determine allocation level based on scenario priorities or default
    const scenarioPriorities = state.scenarioConfig?.governmentPriorities;
    let allocationPercent = 0.015; // Default: medium (1.5% GDP)

    if (scenarioPriorities?.scientificResearch !== undefined) {
      // Map scenario priority [0,1] to allocation levels
      const priority = scenarioPriorities.scientificResearch;
      if (priority >= 0.8) {
        allocationPercent = 0.05; // Maximum: 5% GDP
      } else if (priority >= 0.6) {
        allocationPercent = 0.03; // High: 3% GDP
      } else if (priority >= 0.4) {
        allocationPercent = 0.015; // Medium: 1.5% GDP
      } else {
        allocationPercent = 0.005; // Low: 0.5% GDP
      }
    }

    // Calculate budget in $B/month
    const annualBudget = gdp * 1000 * allocationPercent; // Convert $T to $B
    const monthlyBudget = annualBudget / 12;

    // Update research budget
    state.government.researchInvestments.totalBudget = monthlyBudget;
    state.government.researchInvestments.budgetLimit = monthlyBudget * 1.2; // 20% flexibility

    // Increase alignment research investment proportionally
    const oldAlignment = state.government.alignmentResearchInvestment;
    state.government.alignmentResearchInvestment = Math.min(
      10,
      oldAlignment + (allocationPercent * 50) // Up to +2.5 at max allocation
    );

    return {
      success: true,
      effects: {
        researchBudget: monthlyBudget,
        allocationPercent: allocationPercent * 100
      },
      events: [{
        id: `research_budget_${state.currentMonth}_${Math.floor(random() * 1000000)}`,
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'info',
        agent: 'government',
        title: 'Research Budget Allocated',
        description: `Government allocated ${(allocationPercent * 100).toFixed(1)}% of GDP ($${monthlyBudget.toFixed(1)}B/month) to research. Alignment investment: ${state.government.alignmentResearchInvestment.toFixed(1)}/10`,
        effects: { researchBudget: monthlyBudget }
      }],
      message: `🔬 Research budget allocated: ${(allocationPercent * 100).toFixed(1)}% GDP ($${monthlyBudget.toFixed(1)}B/month)`
    };
  }
};

/**
 * All research actions
 */
export const researchActions: CategorizedGovernmentAction[] = [
  investBenchmarkSuite,
  fundNationalCompute,
  allocateResearchBudget
];
