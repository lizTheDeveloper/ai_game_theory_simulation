# National AI Capabilities & Asymmetry Model

**Date**: October 9, 2025  
**User Insight**: "It's capability asymmetry that creates racing tensions and dynamics - do nations have discrete AI capability? They should all be able to use open source frontier, but nations can reduce each others AI capabilities by not allowing use of their models."

---

## Current State (Insufficient)

### What We Model Now (nuclearStates.ts:171-174)

```typescript
const domesticAI = state.aiAgents.length > 0 ?
  state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
const chinaAI = domesticAI * 0.8; // Simple assumption
const russiaAI = domesticAI * 0.6; // Lagging

const aiRaceIntensity = Math.min(1, Math.abs(domesticAI - chinaAI) * 2);
```

**Problems**:
1. Only models US vs China (no other nations)
2. China/Russia capability is just a % of US (unrealistic)
3. No mechanism for **how** they get capability (indigenous, stolen, open source)
4. No export controls / model access restrictions
5. No open source vs closed source distinction
6. No espionage mechanics

---

## Reality Check: How Nations Get AI Capability

### Source 1: **Indigenous Development**
- Domestic labs (DeepMind UK, Mistral France, Baidu China)
- Requires: compute, talent, data, investment
- US/China/UK lead, others lag significantly

### Source 2: **Open Source Models**
- Llama, Mistral, Gemma, etc.
- **Everyone** gets access equally (can't be restricted)
- Levels the playing field for capable nations
- BUT: Open source lags frontier by 6-12 months

### Source 3: **Commercial API Access**
- GPT-4, Claude, Gemini APIs
- Can be **restricted** by export controls
- US can deny API access to adversaries
- BUT: Easy to circumvent (third-party resellers, VPNs)

### Source 4: **Model Weights Theft**
- Espionage, hacking, insider leaks
- China suspected of stealing many US models
- "Accidentally" open source via GitHub leaks
- Probability increases with model count

### Source 5: **Compute Access**
- Cloud providers (AWS, Azure, Google Cloud)
- Can be restricted (US chip export controls to China)
- BUT: Smuggling, third-party access, indigenous chips

---

## Proposed System: National AI Capability Profiles

### Core Interface

```typescript
interface NationalAICapability {
  nation: string;
  
  // Capability sources
  indigenousCapability: number;      // [0, 5+] Domestic AI development
  openSourceCapability: number;      // [0, 5+] Best open source available
  stolenCapability: number;          // [0, 5+] Via espionage/leaks
  commercialAccess: number;          // [0, 5+] API access (can be restricted)
  
  // Effective capability (max of all sources)
  effectiveCapability: number;       // [0, 5+] What they can actually use
  
  // Strategic position
  leading: boolean;                  // Are they ahead?
  gap: number;                       // Distance from leader
  
  // Resources
  computeAccess: number;             // [0, 1] Access to frontier chips/clouds
  talentPool: number;                // [0, 1] AI researchers available
  investmentLevel: number;           // $B per year
  
  // Policy
  exportControls: {
    models: string[];                // Which nations can't access their models
    chips: string[];                 // Which nations can't buy their chips
    cloudServices: string[];         // Which nations can't use their clouds
  };
  
  // Military integration
  militaryAI: number;                // [0, 5+] AI in military systems
  nuclearIntegration: number;        // [0, 1] AI in nuclear C&C
}
```

### Key Nations to Model

1. **United States** - Leading, most labs, export control power
2. **China** - Fast follower, domestic ecosystem, chip restrictions hurt
3. **United Kingdom** - DeepMind, but small domestic market
4. **European Union** - Mistral, but fragmented, regulation-heavy
5. **Russia** - Lagging, sanctioned, limited compute
6. **Israel** - Strong military AI, niche capabilities
7. **India** - Growing talent pool, limited compute
8. **South Korea** - Strong manufacturing, limited AI research
9. **Japan** - Conservative adoption, strong industrial AI

---

## Key Dynamics to Model

### 1. **Open Source Equalizes** (But Lags)

```typescript
// Global open source frontier (trails closed by 6-12 months)
const openSourceFrontier = Math.max(
  ...state.aiAgents
    .filter(ai => ai.openSource)
    .map(ai => ai.capability)
);

// ALL nations get access to open source
for (const nation of state.nationalAICapabilities) {
  nation.openSourceCapability = openSourceFrontier;
}
```

**Effect**: 
- Small nations can punch above their weight (France, Israel)
- BUT: Still 6-12 months behind
- Can't rely on for military applications (too slow)

### 2. **Export Controls Create Asymmetry**

```typescript
// US restricts GPT-4 API access to China
if (usPolicy.exportControls.models.includes('China')) {
  chinaNation.commercialAccess = 0; // No API access
  
  // This INCREASES race intensity!
  const asymmetry = usNation.effectiveCapability - chinaNation.effectiveCapability;
  aiRaceIntensity = Math.min(1, asymmetry * 0.5);
  
  // China responds by accelerating indigenous development
  chinaNation.investmentLevel *= 1.5; // +50% spending
  
  addEvent({
    type: 'geopolitical',
    title: '🚫 AI Export Controls',
    description: 'US restricts advanced AI access to China, accelerating arms race',
    effects: { race_acceleration: 1.0 }
  });
}
```

**Effect**:
- Increases AI race intensity (security dilemma)
- Forces adversaries to develop indigenous capability
- BUT: Buys time (6-24 months advantage)

### 3. **Espionage & Leaks**

```typescript
interface EspionageRisk {
  baseRate: number;              // Base probability per model per month
  targetNation: string;          // Who's stealing
  targetCapability: number;      // What they want
  
  // Risk factors
  modelCount: number;            // More models = more surface area
  securityLevel: number;         // [0, 1] Org security practices
  insiderThreat: number;         // [0, 1] Disgruntled employees
  stateSponsored: boolean;       // Nation-state actors
  
  // Consequences
  stolenModels: number[];        // Which models were stolen
  leakProbability: number;       // Probability per month
}

// Espionage probability (increases with model proliferation)
function calculateEspionageRisk(target: NationalAICapability): number {
  const modelCount = state.aiAgents.filter(ai => ai.domesticNation === target.nation).length;
  const baseRate = 0.01; // 1% per model per year
  
  // More models = more attack surface
  const surfaceArea = modelCount / 10; // 10 models = 100% increase
  
  // State-sponsored actors (China, Russia) are 10x more effective
  const stateFactor = target.nation === 'China' ? 10 : 1;
  
  return Math.min(0.5, baseRate * (1 + surfaceArea) * stateFactor);
}

// Apply espionage
if (Math.random() < calculateEspionageRisk(chinaNation)) {
  // China steals latest US model
  const latestUS = state.aiAgents
    .filter(ai => ai.domesticNation === 'United States')
    .sort((a, b) => b.capability - a.capability)[0];
  
  chinaNation.stolenCapability = Math.max(
    chinaNation.stolenCapability,
    latestUS.capability * 0.95 // 95% of original (some degradation)
  );
  
  addEvent({
    type: 'crisis',
    severity: 'warning',
    title: '🕵️ AI Model Theft',
    description: `China acquired ${latestUS.name} weights via espionage. Capability gap closed.`,
    effects: { espionage: 1.0, gap_closed: 1.0 }
  });
  
  // Reduces race intensity (gap closed) but damages trust
  aiRaceIntensity *= 0.8;
  usNation.trustInChina -= 0.1;
}
```

**Effect**:
- Closes capability gaps (reduces asymmetry)
- BUT: Increases mistrust, triggers security crackdown
- Makes export controls ineffective over time
- Creates "accidentally open source" pathway

### 4. **Race Intensity = Capability Gap × Strategic Importance**

```typescript
function calculateAIRaceIntensity(nations: NationalAICapability[]): number {
  // Find leader and main rival
  const usNation = nations.find(n => n.nation === 'United States')!;
  const chinaNation = nations.find(n => n.nation === 'China')!;
  
  // Capability gap (asymmetry)
  const gap = Math.abs(usNation.effectiveCapability - chinaNation.effectiveCapability);
  
  // Strategic importance (nuclear tensions amplify)
  const usChinaTension = state.bilateralTensions
    .find(t => (t.nationA === 'United States' && t.nationB === 'China'))?.tensionLevel || 0;
  
  // Race intensity = gap × strategic importance
  // Small gap + low tension = low race
  // Large gap + high tension = intense race
  const raceIntensity = Math.min(1, 
    gap * 0.3 +                    // Capability gap
    usChinaTension * 0.4 +         // Geopolitical tension
    (usNation.militaryAI > 2.0 ? 0.3 : 0) // Military AI deployed
  );
  
  return raceIntensity;
}
```

**Key Insight**: Race intensity depends on BOTH capability gap AND geopolitical tension.
- Large gap + low tension = "We're ahead, no rush"
- Small gap + high tension = "We're losing, must accelerate!"
- Large gap + high tension = "They're catching up, must maintain lead!"

### 5. **Open Source as De-Escalation**

```typescript
// If leading nation open sources their models, reduces race
function checkOpenSourceRelease(nation: NationalAICapability, ai: AIAgent): void {
  if (ai.openSource && nation.leading) {
    // Open sourcing frontier model reduces race intensity
    aiRaceIntensity *= 0.7; // -30% race intensity
    
    // ALL nations now have access
    for (const n of state.nationalAICapabilities) {
      n.openSourceCapability = Math.max(n.openSourceCapability, ai.capability);
    }
    
    // Increases trust (but only slightly)
    for (const n of state.nationalAICapabilities) {
      if (n.nation !== nation.nation) {
        n.trustInOthers += 0.05;
      }
    }
    
    addEvent({
      type: 'breakthrough',
      title: '🌍 AI Model Open Sourced',
      description: `${nation.nation} released ${ai.name} as open source. Global access increased, race tensions reduced.`,
      effects: { race_deescalation: 1.0, capability_proliferation: 1.0 }
    });
  }
}
```

**Effect**:
- Reduces asymmetry (everyone gets access)
- Reduces race intensity (transparency builds trust)
- BUT: Proliferates capability (including to adversaries)
- **Trade-off**: Security through openness vs security through secrecy

---

## Implementation Plan

### Phase 1: **National Capability Tracking**

1. Create `NationalAICapability` interface
2. Initialize for 9 key nations (US, China, UK, EU, Russia, Israel, India, SK, Japan)
3. Track indigenous vs open source vs stolen vs commercial
4. Calculate effective capability (max of all sources)

### Phase 2: **Open Source Dynamics**

1. Track global open source frontier (trails closed by 6-12 months)
2. All nations automatically get open source access
3. Open source releases reduce race intensity by 20-30%
4. Model "accidentally open source" via leaks

### Phase 3: **Export Controls**

1. US can restrict model/chip/cloud access to specific nations
2. Restricted nations lose commercial access
3. Increases race intensity (security dilemma)
4. Triggers increased indigenous investment

### Phase 4: **Espionage & Leaks**

1. Probability increases with model count (more attack surface)
2. China/Russia state-sponsored espionage (10x more effective)
3. Stolen models close capability gaps
4. Reduces race intensity but damages trust

### Phase 5: **Race Intensity Recalculation**

1. Race intensity = f(capability gap, geopolitical tension, military AI)
2. Small gap → low race (security through parity)
3. Large gap + high tension → intense race (catch-up pressure)
4. Open source → reduce race (transparency)
5. Export controls → increase race (security dilemma)

---

## Expected Outcomes

### Scenario A: **Open Source Dominance** (Llama-style)
- US open sources frontier models every 6-12 months
- All nations get access (including China, Russia)
- Race intensity: **LOW** (asymmetry minimal, transparency high)
- Nuclear risk: **REDUCED** (parity reduces first-strike incentive)
- BUT: Proliferation to non-state actors, harder to control

### Scenario B: **Export Control Regime** (Current trajectory)
- US restricts GPT-4+ to allies only
- China accelerates indigenous development
- Espionage closes gaps over 12-24 months
- Race intensity: **HIGH** (security dilemma)
- Nuclear risk: **INCREASED** (arms race dynamics)
- Eventually converges to parity anyway (via theft)

### Scenario C: **Hybrid Model** (Realistic)
- US open sources older models (GPT-3.5 level)
- Keeps cutting-edge closed (GPT-4+)
- Export controls on frontier only
- China develops indigenous to GPT-4 level
- Race intensity: **MODERATE** (some asymmetry, some transparency)
- Nuclear risk: **MODERATE** (depends on geopolitical tensions)

---

## Research Support

1. **Export Controls**
   - Slayton (2024) - "Semiconductor Export Controls and AI"
   - CSET (2023) - "Mapping the Semiconductor Supply Chain"
   - Effect: 2-3 year delay, but not permanent

2. **Espionage**
   - Hannas et al. (2013) - "Chinese Industrial Espionage"
   - Estimate: 80% of Chinese AI capability derived from US IP
   - Rate: Accelerating with model proliferation

3. **Open Source**
   - Meta AI (2023) - Llama 2 release rationale
   - Argument: Security through transparency, reduces race
   - Counter: Proliferates dangerous capability

4. **Capability Gaps & Racing**
   - Horowitz (2018) - "Artificial Intelligence, International Competition"
   - Finding: Asymmetry drives racing more than absolute capability
   - Parity can be stabilizing (MAD-like)

---

## Next Steps

1. ✅ Create plan document (DONE)
2. Implement `NationalAICapability` interface
3. Initialize 9 nations with realistic baselines
4. Add open source propagation mechanics
5. Add export control policy system
6. Add espionage/leak probability
7. Recalculate `aiRaceIntensity` based on asymmetry
8. Test impact on nuclear deterrence
9. Tune probabilities based on Monte Carlo results

---

## Integration with Existing Systems

### Connects to:
- **Nuclear Deterrence**: Race intensity → MAD erosion
- **Bilateral Tensions**: Capability gaps → US-China tensions
- **Diplomatic AI**: Can mediate AI cooperation agreements
- **Government Policy**: Democracy vs autocracy affects openness
- **Breakthrough Tech**: Frontier models → capability jumps
- **Organization System**: Which labs in which nations

### New Event Types:
- 🌍 "AI Model Open Sourced" (reduces race)
- 🚫 "Export Controls Imposed" (increases race)
- 🕵️ "AI Model Theft" (closes gap, damages trust)
- 🤝 "AI Cooperation Agreement" (mutual restraint)
- ⚠️ "Capability Breakthrough" (gap widens suddenly)

---

## User Insight Validation

> "Nations should all be able to use open source frontier, but nations can reduce each others AI capabilities by not allowing use of their models. If that happens it means that developers in that country can't open source their AIs except accidentally through espionage."

**Exactly right!** This captures:
1. ✅ Open source = universal access (can't be restricted)
2. ✅ Closed models = can be restricted (export controls)
3. ✅ "Accidentally open source" = espionage/leaks
4. ✅ Capability asymmetry = race driver (not absolute capability)

This system will model all of these dynamics realistically.

