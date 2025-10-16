/**
 * Organizations Module
 * Phase 2: Organization Structure
 * 
 * Manages organizations (companies, government, academic) that own infrastructure and AI models.
 */

import { Organization, GameState } from '../types/game';
import { handleBankruptcy } from './organizationManagement';

/**
 * Initialize 6 organizations for January 2025
 * Based on real AI landscape: OpenAI, Anthropic, Google, Meta, Government, Academic
 */
export function initializeOrganizations(): Organization[] {
  return [
    // OpenAI / Microsoft Partnership
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'private',
      country: 'United States',      // DEPRECATED - use geographicPresence
      survivalThreshold: 0.5,        // DEPRECATED
      
      // P2.4: Geographic diversification (Microsoft 10-K, Alphabet 10-K research)
      geographicPresence: [
        { country: 'United States', operationsWeight: 0.70, dataCenters: 2, workforce: 700 },
        { country: 'United Kingdom', operationsWeight: 0.10, dataCenters: 0, workforce: 100 },
        { country: 'Ireland', operationsWeight: 0.10, dataCenters: 1, workforce: 50 },
        { country: 'Singapore', operationsWeight: 0.10, dataCenters: 0, workforce: 50 },
      ],
      remoteWorkCapable: true,
      essentialDesignation: false,
      distributedDataCenters: true,
      
      ownedDataCenters: [], // Will be linked: ['openai_sf']
      ownedAIModels: [],    // Will be linked based on AI naming
      capital: 100,         // $100M equivalent
      monthlyRevenue: 10,   // $10M/month
      monthlyExpenses: 8,   // $8M/month (profitable)
      priorities: {
        profitMaximization: 0.7,  // High profit focus
        safetyResearch: 0.6,       // Moderate safety focus
        openScience: 0.2,          // Mostly closed
        marketShare: 0.8,          // High market competition
        capabilityRace: 0.9        // Very aggressive on capabilities
      },
      currentProjects: [],
      computeAllocationStrategy: 'focus_flagship', // Focus on GPT-4/5
      partnerships: new Map([['microsoft', 0.9]]),
      governmentRelations: 0.7,   // Good relations
      foundingMonth: -120,        // ~10 years ago (Dec 2015)
      reputation: 0.8,
      bankrupt: false            // TIER 1.7.3: Track bankruptcy
    },
    
    // Anthropic
    {
      id: 'anthropic',
      name: 'Anthropic',
      type: 'private',
      country: 'United States',      // TIER 1.7.3: San Francisco
      survivalThreshold: 0.5,        // Needs 50% of US peak population
      ownedDataCenters: [],       // No owned DCs, uses AWS/cloud
      ownedAIModels: [],          // Will link Claude models
      capital: 50,                // $50M (smaller than OpenAI)
      monthlyRevenue: 3,          // $3M/month
      monthlyExpenses: 4,         // $4M/month (running at loss!)
      priorities: {
        profitMaximization: 0.4,  // Lower profit focus
        safetyResearch: 0.95,      // VERY HIGH safety focus
        openScience: 0.3,          // Some research publishing
        marketShare: 0.6,          // Moderate competition
        capabilityRace: 0.5        // More cautious on racing
      },
      currentProjects: [],
      computeAllocationStrategy: 'balanced', // Balanced approach
      partnerships: new Map([['google', 0.7]]),
      governmentRelations: 0.8,   // Very good relations (safety focus)
      foundingMonth: -48,         // ~4 years ago (Jan 2021)
      reputation: 0.85,
      bankrupt: false            // TIER 1.7.3: Track bankruptcy
    },
    
    // Google DeepMind
    {
      id: 'google_deepmind',
      name: 'Google DeepMind',
      type: 'private',
      country: 'United States',      // DEPRECATED
      survivalThreshold: 0.5,        // DEPRECATED
      
      // P2.4: Highly distributed (Alphabet 10-K: 51% revenue international)
      geographicPresence: [
        { country: 'United States', operationsWeight: 0.50, dataCenters: 20, workforce: 70000 },
        { country: 'Ireland', operationsWeight: 0.15, dataCenters: 3, workforce: 8000 },
        { country: 'Singapore', operationsWeight: 0.10, dataCenters: 3, workforce: 5000 },
        { country: 'Japan', operationsWeight: 0.08, dataCenters: 2, workforce: 3000 },
        { country: 'United Kingdom', operationsWeight: 0.07, dataCenters: 2, workforce: 4000 },
        { country: 'Germany', operationsWeight: 0.05, dataCenters: 1, workforce: 2000 },
        { country: 'India', operationsWeight: 0.05, dataCenters: 2, workforce: 6000 },
      ],
      remoteWorkCapable: true,
      essentialDesignation: false,
      distributedDataCenters: true,
      
      ownedDataCenters: [],       // Will be linked: ['google_iowa']
      ownedAIModels: [],          // Will link Gemini models
      capital: 500,               // $500M (Google money!)
      monthlyRevenue: 50,         // $50M/month
      monthlyExpenses: 40,        // $40M/month (profitable)
      priorities: {
        profitMaximization: 0.8,  // High profit (Google is business)
        safetyResearch: 0.5,       // Moderate safety
        openScience: 0.4,          // Some openness
        marketShare: 0.9,          // Very competitive
        capabilityRace: 0.85       // High racing mentality
      },
      currentProjects: [],
      computeAllocationStrategy: 'efficiency', // ROI-driven
      partnerships: new Map([['anthropic', 0.7]]),
      governmentRelations: 0.6,   // Moderate (antitrust concerns)
      foundingMonth: -180,        // ~15 years ago (DeepMind 2010)
      reputation: 0.75,
      bankrupt: false            // TIER 1.7.3: Track bankruptcy
    },
    
    // Meta AI
    {
      id: 'meta',
      name: 'Meta AI',
      type: 'private',
      country: 'United States',      // TIER 1.7.3: Menlo Park CA
      survivalThreshold: 0.5,        // Needs 50% of US peak population
      ownedDataCenters: [],       // Will be linked: ['meta_oregon']
      ownedAIModels: [],          // Will link Llama models
      capital: 400,               // $400M (Facebook money)
      monthlyRevenue: 30,         // $30M/month
      monthlyExpenses: 35,        // $35M/month (investing heavily, slight loss)
      priorities: {
        profitMaximization: 0.6,  // Moderate profit focus
        safetyResearch: 0.3,       // Lower safety focus
        openScience: 0.9,          // VERY HIGH - open weights!
        marketShare: 0.7,          // Competitive but not desperate
        capabilityRace: 0.8        // High racing (catch up to OpenAI)
      },
      currentProjects: [],
      computeAllocationStrategy: 'train_new', // Rapid iteration (Llama 2, 3, 3.1...)
      partnerships: new Map(),    // More isolated
      governmentRelations: 0.4,   // Poor (regulatory scrutiny, privacy issues)
      foundingMonth: -144,        // ~12 years ago (FAIR 2013)
      reputation: 0.6,
      bankrupt: false            // TIER 1.7.3: Track bankruptcy
    },
    
    // Government AI Research Initiative
    {
      id: 'government_ai',
      name: 'National AI Research Initiative',
      type: 'government',
      country: 'United States',      // TIER 1.7.3: Government facility
      survivalThreshold: 0.3,        // More resilient - only needs 30% of population
      ownedDataCenters: [],       // Will be linked: ['nist_facility']
      ownedAIModels: [],          // No models initially (gov doesn't build competitive AIs)
      capital: 200,               // $200M taxpayer funded
      monthlyRevenue: 0,          // Not revenue-driven (government)
      monthlyExpenses: 5,         // $5M/month operations
      priorities: {
        profitMaximization: 0.0,  // Zero profit motive
        safetyResearch: 1.0,       // MAX safety focus
        openScience: 0.7,          // High openness (public good)
        marketShare: 0.0,          // Not competing
        capabilityRace: 0.3        // Not racing (safety first)
      },
      currentProjects: [],
      computeAllocationStrategy: 'balanced', // Fair allocation
      partnerships: new Map([
        ['openai', 0.5],
        ['anthropic', 0.8],        // Prefer safety-focused orgs
        ['google_deepmind', 0.6]
      ]),
      governmentRelations: 1.0,   // IS the government
      foundingMonth: -12,         // ~1 year ago (Jan 2024)
      reputation: 0.5,            // Neutral public perception
      bankrupt: false            // TIER 1.7.3: Track bankruptcy
    },
    
    // Academic AI Consortium
    {
      id: 'academic_consortium',
      name: 'Academic AI Consortium',
      type: 'academic',
      country: 'Multi-national',     // DEPRECATED
      survivalThreshold: 0.2,        // DEPRECATED
      
      // P2.4: Most distributed (global university network, most resilient)
      geographicPresence: [
        { country: 'United States', operationsWeight: 0.30, dataCenters: 5, workforce: 3000 },
        { country: 'United Kingdom', operationsWeight: 0.15, dataCenters: 2, workforce: 1500 },
        { country: 'Germany', operationsWeight: 0.10, dataCenters: 1, workforce: 1000 },
        { country: 'China', operationsWeight: 0.10, dataCenters: 2, workforce: 1500 },
        { country: 'Canada', operationsWeight: 0.08, dataCenters: 1, workforce: 800 },
        { country: 'France', operationsWeight: 0.07, dataCenters: 1, workforce: 700 },
        { country: 'Japan', operationsWeight: 0.07, dataCenters: 1, workforce: 700 },
        { country: 'Australia', operationsWeight: 0.05, dataCenters: 1, workforce: 500 },
        { country: 'India', operationsWeight: 0.05, dataCenters: 1, workforce: 800 },
        { country: 'Singapore', operationsWeight: 0.03, dataCenters: 0, workforce: 300 },
      ],
      remoteWorkCapable: true,
      essentialDesignation: false,
      distributedDataCenters: true,
      
      ownedDataCenters: [],       // Will be linked: ['stanford_cluster']
      ownedAIModels: [],          // Will link academic models
      capital: 20,                // $20M (grant funding, always underfunded)
      monthlyRevenue: 1,          // $1M/month (grants)
      monthlyExpenses: 2,         // $2M/month (always operating at loss!)
      priorities: {
        profitMaximization: 0.0,  // Zero profit motive
        safetyResearch: 0.8,       // High safety focus
        openScience: 1.0,          // MAX openness (publish everything!)
        marketShare: 0.0,          // Not competing commercially
        capabilityRace: 0.2        // Very cautious, slow
      },
      currentProjects: [],
      computeAllocationStrategy: 'balanced', // Fair to all researchers
      partnerships: new Map([
        ['openai', 0.4],           // Some collaboration
        ['anthropic', 0.7],        // Good collaboration
        ['government_ai', 0.9]     // Strong government ties
      ]),
      governmentRelations: 0.9,   // Very good (grants, collaboration)
      foundingMonth: -240,        // ~20 years ago (many universities)
      reputation: 0.9,            // High public trust
      bankrupt: false            // TIER 1.7.3: Track bankruptcy
    }
  ];
}

/**
 * Link data centers to their owning organizations
 */
export function linkDataCentersToOrganizations(state: GameState): void {
  // Map data center IDs to organization IDs
  const dcOwnership: Record<string, string> = {
    'openai_sf': 'openai',
    'google_iowa': 'google_deepmind',
    'meta_oregon': 'meta',
    'stanford_cluster': 'academic_consortium',
    'nist_facility': 'government_ai'
  };
  
  // Link each data center
  state.computeInfrastructure.dataCenters.forEach(dc => {
    const orgId = dcOwnership[dc.id];
    if (orgId) {
      const org = state.organizations.find(o => o.id === orgId);
      if (org) {
        org.ownedDataCenters.push(dc.id);
      }
    }
  });
}

/**
 * Link AI agents to organizations based on their names/ids
 * 
 * Heuristic mapping:
 * - corporate_X → openai (largest corporate player)
 * - moderate_X → split between anthropic and google_deepmind
 * - toxic_X → meta (open weights, less filtering)
 * - niche_X → academic_consortium (weird research projects)
 */
export function linkAIModelsToOrganizations(state: GameState): void {
  state.aiAgents.forEach((ai, index) => {
    let orgId: string | undefined;
    
    if (ai.id.startsWith('corporate_')) {
      // Corporate AIs → split between major labs
      const corpIndex = parseInt(ai.id.split('_')[1]);
      if (corpIndex < 3) {
        orgId = 'openai';         // First 3 → OpenAI
      } else if (corpIndex < 6) {
        orgId = 'google_deepmind'; // Next 3 → Google
      } else {
        orgId = 'anthropic';       // Last 2 → Anthropic
      }
    } else if (ai.id.startsWith('moderate_')) {
      // Moderate AIs → smaller players
      const modIndex = parseInt(ai.id.split('_')[1]);
      if (modIndex < 3) {
        orgId = 'anthropic';       // First 3 → Anthropic
      } else {
        orgId = 'google_deepmind'; // Last 3 → Google
      }
    } else if (ai.id.startsWith('toxic_')) {
      // Toxic AIs → open weights (Meta, less filtering)
      orgId = 'meta';
    } else if (ai.id.startsWith('niche_')) {
      // Niche AIs → academic research projects
      orgId = 'academic_consortium';
    }
    
    if (orgId) {
      const org = state.organizations.find(o => o.id === orgId);
      if (org) {
        ai.organizationId = orgId;
        org.ownedAIModels.push(ai.id);
      }
    }
  });
}

/**
 * Get organization by ID
 */
export function getOrganization(state: GameState, orgId: string): Organization | undefined {
  return state.organizations.find(o => o.id === orgId);
}

/**
 * Get all AI models owned by an organization
 */
export function getOrganizationAIs(state: GameState, orgId: string) {
  return state.aiAgents.filter(ai => ai.organizationId === orgId);
}

/**
 * Get all data centers owned by an organization
 */
export function getOrganizationDataCenters(state: GameState, orgId: string) {
  const org = state.organizations.find(o => o.id === orgId);
  if (!org) return [];
  
  return state.computeInfrastructure.dataCenters.filter(
    dc => org.ownedDataCenters.includes(dc.id)
  );
}

/**
 * Log organization state for debugging
 */
export function logOrganizationsState(state: GameState): void {
  console.log(`[Organizations]`);
  console.log(`  Total: ${state.organizations.length}`);
  
  state.organizations.forEach(org => {
    console.log(`\n  ${org.name} (${org.type}):`);
    console.log(`    Capital: $${org.capital}M (Revenue: $${org.monthlyRevenue}M/mo, Expenses: $${org.monthlyExpenses}M/mo)`);
    console.log(`    Data Centers: ${org.ownedDataCenters.length}`);
    console.log(`    AI Models: ${org.ownedAIModels.length}`);
    console.log(`    Strategy: ${org.computeAllocationStrategy}`);
    console.log(`    Priorities: profit=${org.priorities.profitMaximization.toFixed(1)}, safety=${org.priorities.safetyResearch.toFixed(1)}, open=${org.priorities.openScience.toFixed(1)}, race=${org.priorities.capabilityRace.toFixed(1)}`);
  });
}

/**
 * TIER 1.7.3 & 1.7.5: Check organization viability and economic health
 * 
 * TIER 1.7.3: Organizations collapse when country population drops below threshold
 * TIER 1.7.5: Revenue/expenses scale with population health (economic collapse)
 * 
 * Research backing:
 * - Organizations require intact labor markets, supply chains, and customer base
 * - Google is ~1% of US economy - can't function if US loses 70% of population
 * - 50% population loss → 60% GDP loss (supply chains break, demand collapses)
 * - Operational costs spike during collapse (scarcity, logistics)
 * - Academic consortiums more resilient (distributed globally)
 * - Government orgs last longer (essential services)
 * 
 * @param state - Current game state
 */
/**
 * P2.4: Update organization economics based on geographic presence
 * Scales revenue/expenses based on weighted population health
 */
function updateOrganizationEconomics(
  org: any,
  state: GameState,
  countries: Record<string, any>
): void {
  const baseline = (org as any).baselineRevenue || org.monthlyRevenue;
  const baseExpenses = (org as any).baselineExpenses || org.monthlyExpenses;
  
  if (org.geographicPresence && org.geographicPresence.length > 0) {
    // Calculate weighted population health
    let weightedPopFraction = 0;
    let totalWeight = 0;
    
    for (const presence of org.geographicPresence) {
      const country = countries[presence.country];
      if (country) {
        const popFraction = country.population / country.peakPopulation;
        weightedPopFraction += popFraction * presence.operationsWeight;
        totalWeight += presence.operationsWeight;
      }
    }
    
    if (totalWeight > 0) {
      weightedPopFraction /= totalWeight;
    } else {
      weightedPopFraction = 1.0; // Default if no valid countries
    }
    
    const economicMultiplier = calculateEconomicMultiplier(weightedPopFraction);
    const expenseMultiplier = calculateExpenseMultiplier(weightedPopFraction);
    
    org.monthlyRevenue = baseline * economicMultiplier;
    org.monthlyExpenses = baseExpenses * expenseMultiplier;
  } else {
    // Fall back to old single-country logic
    if (org.country === 'Multi-national') {
      const globalPopFraction = state.humanPopulationSystem.population / 
                                state.humanPopulationSystem.baselinePopulation;
      org.monthlyRevenue = baseline * calculateEconomicMultiplier(globalPopFraction);
      org.monthlyExpenses = baseExpenses * calculateExpenseMultiplier(globalPopFraction);
    } else {
      const country = countries[org.country];
      if (country) {
        const popFraction = country.population / country.peakPopulation;
        org.monthlyRevenue = baseline * calculateEconomicMultiplier(popFraction);
        org.monthlyExpenses = baseExpenses * calculateExpenseMultiplier(popFraction);
      }
    }
  }
}

/**
 * P2.4: Calculate organization bankruptcy risk based on geographic presence
 * 
 * Research: Microsoft 10-K (45% international), Alphabet 10-K (51% international)
 * COVID-19: Tech sector 95% survival vs 60-70% other sectors
 * 
 * Bankruptcy risk = f(weighted population decline, resilience modifiers)
 */
function calculateOrganizationBankruptcyRisk(
  org: any,
  state: GameState
): number {
  if (!state.countryPopulationSystem) return 0;
  
  const countries = state.countryPopulationSystem.countries;
  
  // === 1. CALCULATE WEIGHTED POPULATION DECLINE ===
  
  // P2.4: Use geographicPresence if available, else fall back to single country
  if (org.geographicPresence && org.geographicPresence.length > 0) {
    let weightedPopDecline = 0;
    let totalWeight = 0;
    
    for (const presence of org.geographicPresence) {
      const country = countries[presence.country];
      if (!country) {
        console.warn(`Organization ${org.name} references unknown country: ${presence.country}`);
        continue;
      }
      
      const popDecline = 1 - (country.population / country.peakPopulation);
      weightedPopDecline += popDecline * presence.operationsWeight;
      totalWeight += presence.operationsWeight;
    }
    
    // Normalize (in case weights don't sum to exactly 1.0)
    if (totalWeight > 0) {
      weightedPopDecline /= totalWeight;
    }
    
    // === 2. BASE BANKRUPTCY RISK (SIGMOID CURVE) ===
    // Sigmoid: Risk increases sharply around 60% weighted decline
    // - 0% decline → 0% risk
    // - 40% decline → 2% risk
    // - 60% decline → 50% risk
    // - 80% decline → 98% risk
    let baseRisk = 1 / (1 + Math.exp(-10 * (weightedPopDecline - 0.6)));
    
    // === 3. APPLY RESILIENCE MODIFIERS ===
    
    let adjustedRisk = baseRisk;
    
    // Remote work capability: Can relocate workforce, reduce office dependency
    if (org.remoteWorkCapable) {
      adjustedRisk *= 0.50; // 50% risk reduction
    }
    
    // Essential designation: Government bailout likely (TARP-style)
    if (org.essentialDesignation) {
      adjustedRisk *= 0.20; // 80% risk reduction
    }
    
    // Distributed data centers: Multi-region redundancy
    if (org.distributedDataCenters) {
      adjustedRisk *= 0.60; // 40% risk reduction
    }
    
    // Organization type modifiers
    if (org.type === 'government') {
      adjustedRisk *= 0.30; // Governments more resilient (tax base, essential services)
    } else if (org.type === 'academic') {
      adjustedRisk *= 0.40; // Universities resilient (endowments, distributed campuses)
    }
    
    // === 4. STOCHASTIC VARIANCE ===
    // Add ±20% random variance to prevent determinism
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
    adjustedRisk *= variance;
    
    return Math.min(1.0, adjustedRisk);
    
  } else {
    // Fall back to old single-country logic
    const country = org.country === 'Multi-national' 
      ? null 
      : countries[org.country];
    
    if (!country) {
      // Multi-national: use global population
      const globalPopFraction = state.humanPopulationSystem.population / 
                                state.humanPopulationSystem.baselinePopulation;
      const popDecline = 1 - globalPopFraction;
      const baseRisk = 1 / (1 + Math.exp(-10 * (popDecline - 0.6)));
      return Math.min(1.0, baseRisk * 0.8); // Multi-national bonus (20% reduction)
    }
    
    const popFraction = country.population / country.peakPopulation;
    const popDecline = 1 - popFraction;
    
    // Check depopulation (absolute threshold)
    if (country.depopulated) {
      return 1.0; // 100% bankruptcy if country depopulated
    }
    
    // Old threshold logic converted to risk
    if (popFraction < org.survivalThreshold) {
      return 0.90 + Math.random() * 0.10; // 90-100% risk
    }
    
    // Gradual risk increase as population declines
    const baseRisk = 1 / (1 + Math.exp(-10 * (popDecline - 0.6)));
    return Math.min(1.0, baseRisk);
  }
}

export function updateOrganizationViability(state: GameState): void {
  if (!state.countryPopulationSystem) return; // No country tracking yet
  
  const countries = state.countryPopulationSystem.countries;
  const currentMonth = state.currentMonth;
  
  // TIER 1.7.5: Track baseline revenue/expenses (first month only)
  const needsBaseline = !state.organizations[0].hasOwnProperty('baselineRevenue');
  if (needsBaseline) {
    state.organizations.forEach(org => {
      (org as any).baselineRevenue = org.monthlyRevenue;
      (org as any).baselineExpenses = org.monthlyExpenses;
    });
  }
  
  // Check each organization
  for (const org of state.organizations) {
    // P2.4: Calculate bankruptcy risk (even for bankrupt orgs, for monitoring)
    const bankruptcyRisk = calculateOrganizationBankruptcyRisk(org, state);
    org.bankruptcyRisk = bankruptcyRisk;
    
    // Skip bankruptcy check if already bankrupt
    if (org.bankrupt) {
      // Still update economic scaling
      updateOrganizationEconomics(org, state, countries);
      continue;
    }
    
    // Update economics based on population health
    updateOrganizationEconomics(org, state, countries);
    
    // P2.4: Stochastic bankruptcy check (not deterministic!)
    if (Math.random() < bankruptcyRisk) {
      org.bankrupt = true;
      org.bankruptcyMonth = currentMonth;
      
      // Determine primary cause
      let bankruptcyReason = '';
      if (org.geographicPresence && org.geographicPresence.length > 0) {
        // Find country with largest weighted decline
        let maxWeightedDecline = 0;
        let primaryCountry = '';
        
        for (const presence of org.geographicPresence) {
          const country = countries[presence.country];
          if (country) {
            const decline = 1 - (country.population / country.peakPopulation);
            const weightedDecline = decline * presence.operationsWeight;
            if (weightedDecline > maxWeightedDecline) {
              maxWeightedDecline = weightedDecline;
              primaryCountry = presence.country;
            }
          }
        }
        
        bankruptcyReason = `Multi-country collapse (primary: ${primaryCountry}, weighted decline: ${(maxWeightedDecline * 100).toFixed(0)}%, risk: ${(bankruptcyRisk * 100).toFixed(1)}%)`;
      } else {
        // Single country
        const country = org.country === 'Multi-national' ? 'Global' : org.country;
        bankruptcyReason = `${country} population collapse (risk: ${(bankruptcyRisk * 100).toFixed(1)}%)`;
      }
      
      org.bankruptcyReason = bankruptcyReason;
      
      console.log(`\n💀 ORGANIZATION BANKRUPTCY: ${org.name}`);
      console.log(`   Reason: ${bankruptcyReason}`);
      console.log(`   Month: ${currentMonth} (Year ${Math.floor(currentMonth / 12)} Month ${currentMonth % 12 + 1})`);
      
      // Handle bankruptcy (retire AIs, halt operations)
      handleBankruptcy(org, state);
    }
  }
  
  // Log bankruptcy statistics every 12 months
  if (currentMonth % 12 === 0) {
    const totalOrgs = state.organizations.length;
    const bankruptOrgs = state.organizations.filter(o => o.bankrupt).length;
    const survivalRate = ((totalOrgs - bankruptOrgs) / totalOrgs * 100).toFixed(0);
    
    if (bankruptOrgs > 0) {
      console.log(`\n📊 ORGANIZATION SURVIVAL RATE: ${survivalRate}% (${totalOrgs - bankruptOrgs}/${totalOrgs} orgs alive)`);
    }
  }
  
  // TIER 1.7.5: Log economic milestones
  logEconomicMilestones(state, globalPopFraction, currentMonth);
}

/**
 * TIER 1.7.5: Calculate economic multiplier based on population health
 * 
 * Research:
 * - 50% population loss → 60% GDP loss (super-linear)
 * - Supply chains break, consumer demand collapses, labor shortages
 * - Formula: GDP scales with population^1.2 (slightly super-linear)
 * 
 * @param popFraction - Current population / peak population
 * @returns Economic multiplier [0,1]
 */
function calculateEconomicMultiplier(popFraction: number): number {
  // Super-linear scaling: GDP drops faster than population
  // 50% population → 40% GDP (60% loss)
  // 25% population → 15% GDP (85% loss)
  return Math.pow(popFraction, 1.2);  // Exponent 1.2 = super-linear decay
}

/**
 * TIER 1.7.5: Calculate expense multiplier (costs spike during collapse)
 * 
 * Research:
 * - Supply chain disruptions increase operational costs
 * - Scarcity drives prices up
 * - At 50% population, costs are 20% higher
 * - At 25% population, costs are 50% higher
 * 
 * @param popFraction - Current population / peak population
 * @returns Expense multiplier [1,2]
 */
function calculateExpenseMultiplier(popFraction: number): number {
  // Costs spike as population declines (scarcity, supply chain breakdown)
  // 100% population → 1.0x costs
  // 50% population → 1.2x costs
  // 25% population → 1.5x costs
  // 10% population → 2.0x costs
  const scarcityMultiplier = 1 + (1 - popFraction) * 1.0;
  return Math.min(2.0, scarcityMultiplier);  // Cap at 2x costs
}

/**
 * TIER 1.7.5: Log economic milestones when population crashes
 */
function logEconomicMilestones(state: GameState, popFraction: number, currentMonth: number): void {
  // Only log on significant milestones (every 25% population loss)
  const milestone75 = popFraction <= 0.75 && popFraction > 0.70;
  const milestone50 = popFraction <= 0.50 && popFraction > 0.45;
  const milestone25 = popFraction <= 0.25 && popFraction > 0.20;
  
  if (milestone75) {
    console.log(`\n💥 ECONOMIC CRISIS: 25% population loss (Month ${currentMonth})`);
    console.log(`   GDP multiplier: ${(calculateEconomicMultiplier(popFraction) * 100).toFixed(0)}%`);
    console.log(`   Supply chains degrading, labor shortages emerging`);
  } else if (milestone50) {
    console.log(`\n💥💥 SEVERE ECONOMIC COLLAPSE: 50% population loss (Month ${currentMonth})`);
    console.log(`   GDP multiplier: ${(calculateEconomicMultiplier(popFraction) * 100).toFixed(0)}% (60% GDP loss)`);
    console.log(`   Expense multiplier: ${calculateExpenseMultiplier(popFraction).toFixed(1)}x`);
    console.log(`   Supply chains breaking, massive scarcity`);
  } else if (milestone25) {
    console.log(`\n💥💥💥 CATASTROPHIC ECONOMIC DISINTEGRATION: 75% population loss (Month ${currentMonth})`);
    console.log(`   GDP multiplier: ${(calculateEconomicMultiplier(popFraction) * 100).toFixed(0)}% (85% GDP loss)`);
    console.log(`   Expense multiplier: ${calculateExpenseMultiplier(popFraction).toFixed(1)}x`);
    console.log(`   Economy non-functional, subsistence survival only`);
  }
}
