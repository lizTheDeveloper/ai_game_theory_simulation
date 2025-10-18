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

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
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

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const improvement = 1.0;
    const oldLevel = state.government.evaluationInvestment.benchmarkSuite;
    state.government.evaluationInvestment.benchmarkSuite = Math.min(10, oldLevel + improvement);
    const newLevel = state.government.evaluationInvestment.benchmarkSuite;

    return {
      success: true,
      effects: { benchmarkQuality: newLevel },
      events: [{
        type: 'policy',
        month: state.currentMonth,
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
    const govOrg = state.organizations.find(o => o.type === 'government');
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

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const govOrg = state.organizations.find((o: any) => o.type === 'government');

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
        type: 'policy',
        month: state.currentMonth,
        title: 'National AI Infrastructure Funded',
        description: `Government started building national data center. Reduces dependence on private sector but costs taxpayer money.`,
        effects: { legitimacy: -0.05 }
      }],
      message: 'Government started building national data center'
    };
  }
};

/**
 * All research actions
 */
export const researchActions: CategorizedGovernmentAction[] = [
  investBenchmarkSuite,
  fundNationalCompute
];
