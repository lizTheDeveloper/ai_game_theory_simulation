# Technology Spread Between Nations
**Date:** October 15, 2025  
**Status:** DESIGN PHASE

## Problem Statement

Currently, tech deployment is either:
1. **Global**: Available everywhere immediately (unrealistic)
2. **Regional**: Deployed in specific regions (Asia, Africa, etc.)

**Missing:** Nation-to-nation technology diffusion dynamics.

**Reality:**
- Technologies originate in specific countries (often hegemons)
- Spread occurs through: trade, licensing, espionage, open-source, brain drain
- Some nations block tech transfer (export controls, sanctions)
- Some technologies spread freely (open research), others don't (military tech)

## Existing Infrastructure (TIER 2.8)

### 15 Countries Tracked:
**Hegemons (5):**
- United States
- China
- European Union (treated as single entity)
- Russia
- India

**Strategic Nations (10):**
- United Kingdom, France, Germany, Japan, South Korea (allies)
- Israel, Turkey, Saudi Arabia (regional powers)
- Brazil (South America)
- Nigeria, Democratic Republic of Congo (Africa)

### Country Properties (Relevant to Tech Spread):
```typescript
interface CountryPopulation {
  // Strategic importance
  isNuclearPower: boolean;
  isAIHub: boolean;
  isMajorEconomy: boolean;
  isHegemon: boolean;
  
  // Resource/economic
  resourceSovereignty: number;  // [0,1] Control over own resources
  GDP: number;
  economicPower: number;
  
  // Military
  militaryCapability: number;  // [0,1] Can enforce controls
  militarySpending: number;
  
  // Social
  meaningCrisis: number;
  nationalismStrength: number;
  
  // Environmental
  region: string;  // Links to regional biodiversity
}
```

## Design: Tech Diffusion System

### Core Concept: "Tech Access" vs "Tech Deployment"

**Tech Access** = Can research/acquire the technology  
**Tech Deployment** = Actually deployed and functioning

```typescript
interface TechDiffusion {
  // Per-country tech access
  countryAccess: Map<CountryName, TechAccess>;
  
  // Diffusion channels
  activeChannels: DiffusionChannel[];
  
  // Restrictions
  exportControls: Map<TechId, ExportControl[]>;
  sanctions: Map<CountryName, CountryName[]>;  // Who sanctions whom
}

interface TechAccess {
  country: CountryName;
  techId: string;
  
  // How did they get it?
  acquiredVia: 'origin' | 'trade' | 'espionage' | 'open_source' | 'brain_drain';
  acquiredMonth: number;
  
  // Can they deploy it?
  canDeploy: boolean;  // Blocked by sanctions, lack of resources, etc.
  deploymentLevel: number;  // 0-1, how much deployed
  
  // Can they share it?
  canExport: boolean;  // Export controls
  canModify: boolean;  // Licensing restrictions
}
```

### Diffusion Channels

#### 1. **Origin** (Tech developed here)
- Hegemons develop most tech (AI hubs)
- Determines initial access rules

```typescript
function determineTechOrigin(tech: TechDefinition, state: GameState): CountryName {
  // AI/alignment tech → US (OpenAI, Anthropic) or China (Baidu, Alibaba)
  if (tech.category === 'alignment') {
    return Math.random() < 0.7 ? 'United States' : 'China';
  }
  
  // Medical/biotech → distributed (US, EU, China, Japan)
  if (tech.category === 'medical') {
    const leaders = ['United States', 'European Union', 'China', 'Japan'];
    return weightedChoice(leaders, state);
  }
  
  // Energy tech → depends on type
  // Solar → China (dominates manufacturing)
  // Nuclear → US, France, Russia, China
  // Fusion → International (ITER style)
  
  return 'United States';  // Default to largest R&D budget
}
```

#### 2. **Trade & Licensing** (Friendly transfer)
- Ally nations share freely (US → UK, US → Japan)
- Commercial sales (China solar panels → everywhere)
- Rate limited by economic ties

```typescript
function calculateTradeDiffusion(
  fromCountry: CountryName,
  toCountry: CountryName,
  tech: TechDefinition
): number {
  // Factors:
  // - Economic ties (trade volume)
  // - Alliance relationships
  // - Export controls
  // - Commercial viability
  
  const economicTies = getTradeVolume(fromCountry, toCountry);
  const alliance = getAllianceStrength(fromCountry, toCountry);
  const controls = getExportControls(tech, fromCountry);
  
  if (controls.restricted.includes(toCountry)) {
    return 0;  // Blocked
  }
  
  return (economicTies * 0.6 + alliance * 0.4) * (1 - controls.severity);
}
```

#### 3. **Espionage** (Covert transfer)
- China acquires US tech via espionage (realistic!)
- Success rate depends on:
  - Target's defensive AI capability
  - Actor's digital/cognitive capability
  - Security classification of tech

```typescript
function calculateEspionageSuccess(
  spyCountry: CountryName,
  targetCountry: CountryName,
  tech: TechDefinition,
  state: GameState
): number {
  const spyCapability = getAICapability(spyCountry, 'digital', state);
  const targetDefense = getAICapability(targetCountry, 'digital', state);
  
  const difficulty = getTechSecurityLevel(tech);  // Higher for alignment, military
  
  const baseChance = 0.05;  // 5% base per year
  const capabilityBonus = (spyCapability - targetDefense) * 0.10;
  
  return Math.max(0, baseChance + capabilityBonus) / (1 + difficulty);
}
```

#### 4. **Open Source** (Free transfer)
- Research papers, open weights, academic collaboration
- Alignment tech often open-sourced (OpenAI, Anthropic philosophy shift)
- Environmental tech often shared (climate emergency)

```typescript
function determineOpenSourcePolicy(
  tech: TechDefinition,
  originCountry: CountryName,
  state: GameState
): boolean {
  // Alignment tech → increasingly open as risk rises
  if (tech.category === 'alignment') {
    const riskLevel = state.globalMetrics.catastrophicRisk;
    return Math.random() < riskLevel;  // Higher risk → more openness
  }
  
  // Environmental tech → open by default (climate emergency)
  if (['climate', 'ocean', 'freshwater', 'pollution'].includes(tech.category)) {
    return Math.random() < 0.7;  // 70% chance open
  }
  
  // Medical tech → mixed (patents vs public health)
  if (tech.category === 'medical') {
    const meaningCrisis = state.socialAccumulation.meaningCrisis;
    return Math.random() < meaningCrisis * 0.5;  // Crisis → more sharing
  }
  
  return false;  // Default to proprietary
}
```

#### 5. **Brain Drain** (Talent migration)
- Scientists/engineers move between countries
- Driven by: meaning crisis, war, authoritarianism, economic opportunity
- Accelerates diffusion to destination

```typescript
function calculateBrainDrain(
  fromCountry: CountryName,
  toCountry: CountryName,
  state: GameState
): number {
  const pushFactors = (
    getMeaningCrisis(fromCountry, state) * 0.4 +
    getWarRisk(fromCountry, state) * 0.3 +
    getAuthoritarianism(fromCountry, state) * 0.3
  );
  
  const pullFactors = (
    getEconomicPower(toCountry, state) * 0.5 +
    getResearchFreedom(toCountry, state) * 0.3 +
    getSafety(toCountry, state) * 0.2
  );
  
  return pushFactors * pullFactors;
}
```

### Export Controls & Restrictions

#### COCOM-style Controls (US-led)
```typescript
const EXPORT_CONTROLLED_TECH = {
  // Semiconductor/AI
  advanced_chips: {
    restricted: ['China', 'Russia'],
    severity: 0.9,  // Almost total ban
    enforcer: 'United States',
  },
  
  // Alignment tech (if militarized)
  defensive_ai: {
    restricted: ['Russia', 'China'],  // If classified as dual-use
    severity: 0.6,
    enforcer: 'United States',
  },
  
  // Nuclear
  advanced_nuclear: {
    restricted: ['Nigeria', 'DRC', 'Turkey'],  // Proliferation concerns
    severity: 0.95,
    enforcer: ['United States', 'European Union', 'Russia', 'China'],  // NPT signatories
  },
};
```

#### Sanctions
```typescript
const SANCTIONS_MAP = {
  'United States': ['Russia', 'Venezuela'],  // OFAC sanctions
  'China': [],  // Generally doesn't sanction
  'Russia': ['European Union', 'United States'],  // Counter-sanctions
  'European Union': ['Russia'],
};
```

### Integration with Tech Tree

#### Modified TechTreeState
```typescript
interface TechTreeState {
  // ... existing fields ...
  
  // NEW: Per-country access
  countryAccess: Record<CountryName, CountryTechAccess>;
}

interface CountryTechAccess {
  country: CountryName;
  
  // Which tech does this country have access to?
  availableTech: string[];  // Tech IDs
  
  // Which tech are they actively deploying?
  deployingTech: Map<string, TechDeploymentProgress>;
  
  // Acquisition history
  acquisitionHistory: TechAcquisition[];
}

interface TechAcquisition {
  techId: string;
  acquiredVia: 'origin' | 'trade' | 'espionage' | 'open_source' | 'brain_drain';
  acquiredMonth: number;
  fromCountry: CountryName | null;  // Null if open source
}
```

## Implementation Plan

### Phase 1: Tech Origin & Initial Access (2-3 hours)
- [ ] Determine tech origin for all unlocked tech
- [ ] Initialize country access maps
- [ ] Add origin country to tech unlock events

### Phase 2: Trade & Licensing (2-3 hours)
- [ ] Implement alliance/trade relationships
- [ ] Trade-based diffusion
- [ ] Export control checking

### Phase 3: Espionage (2-3 hours)
- [ ] Espionage success calculation
- [ ] Digital capability checks
- [ ] Security classification system

### Phase 4: Open Source (1-2 hours)
- [ ] Open source policy determination
- [ ] Immediate global diffusion for open tech
- [ ] Crisis-driven sharing

### Phase 5: Brain Drain (2-3 hours)
- [ ] Talent migration modeling
- [ ] Meaning crisis → emigration
- [ ] War → refugee scientist flows

### Phase 6: Country-Level Deployment (3-4 hours)
- [ ] Convert regional deployment to country-level
- [ ] Economic constraints per country
- [ ] Deployment actions by country agents

**Total Estimate:** 12-18 hours

## Open Questions

1. **Should we track individual scientists/labs?**
   - Pro: More granular, realistic talent dynamics
   - Con: Complexity, performance
   - **Decision:** No, aggregate at country level

2. **How do regional techs map to countries?**
   - "Asia" deployment → split among China, Japan, South Korea, India?
   - Weighted by economic power?
   - **Decision:** Weight by GDP + strategic importance

3. **Do AI agents make espionage decisions?**
   - Misaligned AIs might leak tech
   - Aligned AIs might refuse to work on military tech
   - **Decision:** Yes, add "leak_technology" action for sleeper AIs

4. **How fast should diffusion be?**
   - Too fast → everything global (boring)
   - Too slow → no cooperation (unrealistic)
   - **Decision:** Calibrate to real-world: Solar (5-10y), Nuclear (20-30y), Software (1-3y)

## Research References

1. **Technology Diffusion:** Comin & Hobijn (2010) "An Exploration of Technology Diffusion"
2. **Export Controls:** Fuchs & Kirchain (2023) "Semiconductor Export Controls"
3. **Espionage:** Hannas, Mulvenon, Puglisi (2013) "Chinese Industrial Espionage"
4. **Brain Drain:** Docquier & Rapoport (2012) "Globalization, Brain Drain, and Development"
5. **Open Science:** Merton (1973) "The Normative Structure of Science"

## Next Steps

1. Review design with user
2. Implement Phase 1 (tech origin)
3. Test with Monte Carlo
4. Iterate based on results

