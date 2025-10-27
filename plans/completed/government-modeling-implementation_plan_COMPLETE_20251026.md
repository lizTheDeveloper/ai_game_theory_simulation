# Government Modeling System - Implementation Plan

**Date:** October 19, 2025
**Status:** READY TO IMPLEMENT
**Estimated Effort:** 60-80 hours (phased)
**Research Foundation:** `/research/government-modeling-approaches_20251019.md` (18,500 words, 36 sources)
**Research Critique:** `/reviews/government-modeling-critique_20251019.md` (fatal flaws identified)

---

## Strategic Decision: Dual-Purpose Architecture

**BUILD TWO THINGS:**

1. **Standalone NPM Package:** `@political-science/government-agents` (open-source later)
   - Pure TypeScript, zero dependencies on this simulation
   - Generic government modeling framework
   - Can be used by ANY political science researcher
   - MIT License for maximum adoption

2. **Simulation Integration:** Connect standalone package to existing simulation
   - Adapter layer in `src/simulation/government/`
   - Hooks into existing AI alignment, crisis, policy systems
   - Project-specific features (AI comprehension lag, alignment response)

**Why This Approach:**
- Forces clean architecture (separation of concerns)
- Package can be battle-tested in THIS simulation before public release
- Other researchers benefit from our work
- Gives you visibility in computational political science community
- Easier to maintain (standalone package has clear boundaries)

---

## Phase 0: Package Architecture (3-5 hours) - DESIGN FIRST

**Deliverable:** Standalone package structure that works independently

### Package Structure: `@political-science/government-agents`

```
packages/government-agents/
├── src/
│   ├── core/
│   │   ├── Government.ts           # Base government class
│   │   ├── PoliticalParty.ts       # Party with policy positions
│   │   ├── GovernmentType.ts       # Democracy, Autocracy, Theocracy, etc.
│   │   └── StateCapacity.ts        # WGI-based effectiveness/corruption
│   ├── coalition/
│   │   ├── CoalitionFormation.ts   # Game theory-based coalition building
│   │   ├── MinimalWinningCoalition.ts
│   │   └── PolicyDistance.ts       # Spatial model calculations
│   ├── policy/
│   │   ├── PolicyVector.ts         # 6D policy space
│   │   ├── PolicyResponse.ts       # How governments respond to stimuli
│   │   └── ImplementationNoise.ts  # Corruption/capacity effects
│   ├── elections/
│   │   ├── ElectionCycle.ts        # Timing, frequency by regime type
│   │   ├── VotingSystem.ts         # FPTP, PR, mixed, etc.
│   │   └── OpinionDynamics.ts      # How events shift public opinion
│   ├── data/
│   │   ├── countries.json          # G20 + key countries (30 total)
│   │   ├── parties.json            # Major parties with policy positions
│   │   └── parameters.json         # Research-backed parameters
│   └── index.ts                    # Public API
├── tests/
│   ├── Government.test.ts
│   ├── CoalitionFormation.test.ts
│   └── historical-validation/      # Validate against real coalitions 2020-2024
├── examples/
│   ├── simple-coalition.ts         # Basic example
│   ├── election-cycle.ts           # Election simulation
│   └── policy-response.ts          # Policy implementation
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE (MIT)
```

### Public API Design

```typescript
// Simple API for researchers
import { Government, PolicyVector, GovernmentType } from '@political-science/government-agents';

// Create a government from real data
const germany = Government.fromCountryCode('DEU', {
  year: 2024,
  dataset: 'vdem' // Auto-fetch V-Dem data
});

// Or create custom government
const customGov = new Government({
  name: 'Fictional Democracy',
  type: GovernmentType.PARLIAMENTARY_DEMOCRACY,
  parties: [...],
  stateCapacity: { effectiveness: 1.2, corruption: 1.5 },
  electionCycle: 48 // months
});

// Respond to policy stimulus
const response = await germany.respondToPolicy({
  domain: 'technology',
  urgency: 0.8,
  internationalPressure: 0.6,
  publicOpinion: 0.5
});

// Form coalition after election
const electionResults = { SPD: 0.25, CDU: 0.24, Greens: 0.15, ... };
const coalition = government.formCoalition(electionResults);
```

**Design Principles:**
1. **Data-driven:** All parameters from V-Dem, WGI, IPU PARLINE (cited in docs)
2. **Testable:** Can validate against historical coalitions 2020-2024
3. **Extensible:** Easy to add new countries, parties, policy dimensions
4. **Type-safe:** Full TypeScript with strict mode
5. **Zero dependencies:** No external packages (pure TS + standard lib)

---

## Phase 1: Core Government Structure (15-20 hours)

### Milestone 1.1: Government Types & State Capacity (5-6h)

**Files to create:**
- `packages/government-agents/src/core/GovernmentType.ts`
- `packages/government-agents/src/core/StateCapacity.ts`
- `packages/government-agents/src/core/Government.ts`

**7 Government Types (from research):**
```typescript
enum GovernmentType {
  PARLIAMENTARY_DEMOCRACY,      // Germany, UK, Japan
  PRESIDENTIAL_DEMOCRACY,       // USA, Brazil, Mexico
  SEMI_PRESIDENTIAL_DEMOCRACY,  // France, Poland
  AUTHORITARIAN_TECHNOCRACY,    // China, Singapore
  HYBRID_REGIME,                // Russia, Turkey, India
  THEOCRATIC_REPUBLIC,          // Iran
  ABSOLUTE_MONARCHY,            // Saudi Arabia
}
```

**State Capacity (WGI-based):**
```typescript
interface StateCapacity {
  governmentEffectiveness: number;  // -2.5 to +2.5 (WGI)
  controlOfCorruption: number;      // -2.5 to +2.5 (WGI)
  regulatoryQuality: number;        // -2.5 to +2.5 (WGI)

  // Derived metrics
  policySuccessRate: number;        // Base × (1 + 0.3 × GE)
  implementationNoise: number;      // (2.5 - CoC) / 10
  comprehensionLag: number;         // Months to understand new tech
}
```

**Validation:** Singapore (GE=2.36) → 71% success boost, Venezuela (GE=-1.68) → 50% penalty

### Milestone 1.2: Political Parties & Policy Vectors (5-6h)

**Files to create:**
- `packages/government-agents/src/core/PoliticalParty.ts`
- `packages/government-agents/src/policy/PolicyVector.ts`

**6-Dimensional Policy Space (from research):**
```typescript
interface PolicyVector {
  economic: number;      // -1 (regulation) → +1 (free market)
  environmental: number; // -1 (growth priority) → +1 (climate action)
  technology: number;    // -1 (precautionary) → +1 (accelerationist)
  social: number;        // -1 (traditional) → +1 (progressive)
  civilLiberties: number;// -1 (security) → +1 (privacy)
  international: number; // -1 (sovereignty) → +1 (multilateral)
}
```

**Real Party Examples (from Manifesto Project Database):**
```typescript
// Germany 2024
const SPD = new PoliticalParty({
  name: 'SPD',
  country: 'DEU',
  policies: { economic: -0.3, environmental: 0.6, technology: 0.4, ... },
  seatShare: 0.25,
  coalitionPreferences: ['Greens', 'FDP']
});
```

### Milestone 1.3: Data Loading System (4-5h)

**Files to create:**
- `packages/government-agents/src/data/loader.ts`
- `packages/government-agents/src/data/countries.json`
- `packages/government-agents/src/data/parties.json`

**30 Countries (G20 + strategic actors):**
- G20: USA, China, India, Brazil, Russia, Japan, Germany, UK, France, Italy, Canada, South Korea, Australia, Mexico, Indonesia, Saudi Arabia, Turkey, Argentina, South Africa
- Strategic: Singapore, Taiwan, Iran, Israel, UAE, Norway, Switzerland, Poland, Netherlands, Sweden, Egypt

**Data Sources:**
- V-Dem v14 (531 indicators, 2024 data)
- WGI 2024 (government effectiveness, corruption)
- IPU PARLINE (parliament structures, parties)

**Validation:** Unit tests checking data integrity, coverage, consistency

---

## Phase 2: Coalition Formation (10-15 hours)

### Milestone 2.1: Minimal Winning Coalition Algorithm (6-8h)

**Files to create:**
- `packages/government-agents/src/coalition/CoalitionFormation.ts`
- `packages/government-agents/src/coalition/MinimalWinningCoalition.ts`
- `packages/government-agents/src/coalition/PolicyDistance.ts`

**Algorithm (from Laver 2020, Oxford Handbook):**
```typescript
function formCoalition(
  parties: PoliticalParty[],
  threshold: number = 0.5
): Coalition {
  // 1. Calculate all possible coalitions that exceed threshold
  const viableCoalitions = getAllSubsets(parties)
    .filter(c => totalSeats(c) > threshold);

  // 2. Find minimal winning coalitions (no redundant parties)
  const minimalWinning = viableCoalitions
    .filter(c => isMinimal(c, threshold));

  // 3. Calculate policy distance for each coalition
  const scored = minimalWinning.map(c => ({
    coalition: c,
    policyDistance: calculatePolicyDistance(c),
    stability: calculateStability(c)
  }));

  // 4. Select coalition with minimum policy distance
  return scored.sort((a, b) => a.policyDistance - b.policyDistance)[0];
}
```

**Policy Distance (Euclidean in 6D space):**
```typescript
function policyDistance(p1: PolicyVector, p2: PolicyVector): number {
  return Math.sqrt(
    (p1.economic - p2.economic) ** 2 +
    (p1.environmental - p2.environmental) ** 2 +
    (p1.technology - p2.technology) ** 2 +
    (p1.social - p2.social) ** 2 +
    (p1.civilLiberties - p2.civilLiberties) ** 2 +
    (p1.international - p2.international) ** 2
  );
}
```

### Milestone 2.2: Coalition Stability & Breakup (4-5h)

**Files to create:**
- `packages/government-agents/src/coalition/CoalitionStability.ts`

**Stability Factors (from research):**
```typescript
interface CoalitionStability {
  policyDistanceScore: number;    // 0-1 (lower = more stable)
  seatMarginScore: number;        // Excess seats beyond majority
  externalPressureScore: number;  // Economic crisis, scandals
  timeInPowerScore: number;       // Honeymoon period vs fatigue

  breakupProbability: number;     // Monthly chance of collapse
}
```

**Validation:** Test against 100+ real coalitions 2020-2024 (how long did they last?)

---

## Phase 3: Policy Response System (10-12 hours)

### Milestone 3.1: Policy Implementation (6-8h)

**Files to create:**
- `packages/government-agents/src/policy/PolicyResponse.ts`
- `packages/government-agents/src/policy/ImplementationNoise.ts`

**Response Speed Calculation:**
```typescript
function calculatePolicyResponseTime(
  government: Government,
  stimulus: PolicyStimulus
): number {
  const baseTime = government.type.basePolicyTime; // 24-60 months

  // Crisis acceleration (COVID precedent)
  let crisisMultiplier = 1.0;
  if (stimulus.urgency > 0.9) crisisMultiplier = 0.1;  // 10x faster
  else if (stimulus.urgency > 0.7) crisisMultiplier = 0.25; // 4x faster
  else if (stimulus.urgency > 0.5) crisisMultiplier = 0.5;  // 2x faster

  // State capacity modifier
  const capacityMultiplier = 1.0 - (government.capacity.effectiveness * 0.2);

  // Coalition cohesion
  const coalitionDragMultiplier = government.coalition
    ? 1.0 + (government.coalition.policyDistance * 0.5)
    : 1.0;

  return baseTime * crisisMultiplier * capacityMultiplier * coalitionDragMultiplier;
}
```

**Implementation Noise (Corruption Effect):**
```typescript
function applyImplementationNoise(
  intendedPolicy: PolicyVector,
  government: Government
): PolicyVector {
  const noise = government.capacity.implementationNoise; // 0.0-0.41

  return {
    economic: intendedPolicy.economic + (rng() - 0.5) * noise,
    environmental: intendedPolicy.environmental + (rng() - 0.5) * noise,
    // ... etc for all dimensions
  };
}
```

### Milestone 3.2: AI Comprehension Lag (4h)

**Files to create:**
- `packages/government-agents/src/policy/AIComprehensionLag.ts`

**Comprehension Lag by Regime Type (from research):**
```typescript
const AI_COMPREHENSION_LAG = {
  // Months to understand AI capabilities at different levels
  HIGH_CAPACITY_DEMOCRACY: { base: 1.5, variance: 1.0 },  // 1.5-2.5 years
  AUTHORITARIAN_TECHNOCRACY: { base: 1.0, variance: 1.0 }, // 1-2 years (China)
  HYBRID_REGIME: { base: 3.0, variance: 2.0 },            // 3-5 years
  LOW_CAPACITY: { base: 5.0, variance: 3.0 },             // 5-8 years
};
```

---

## Phase 4: Election Cycles (8-10 hours)

### Milestone 4.1: Election Timing & Triggers (4-5h)

**Files to create:**
- `packages/government-agents/src/elections/ElectionCycle.ts`
- `packages/government-agents/src/elections/VotingSystem.ts`

**Election Schedules by Type:**
```typescript
const ELECTION_SCHEDULES = {
  PARLIAMENTARY_DEMOCRACY: {
    regularCycle: 48,  // months (Germany: 4 years)
    earlyElectionProbability: 0.15, // 15% chance if coalition collapses
    noConfidenceThreshold: 0.4, // Coalition support < 40%
  },
  PRESIDENTIAL_DEMOCRACY: {
    regularCycle: 48,  // months (USA: 4 years)
    earlyElectionProbability: 0.0, // Fixed terms
  },
  AUTHORITARIAN_TECHNOCRACY: {
    regularCycle: null, // No elections (China)
    leadershipTransition: 120, // 10 years avg
  },
  // ... etc
};
```

### Milestone 4.2: Opinion Dynamics (4-5h)

**Files to create:**
- `packages/government-agents/src/elections/OpinionDynamics.ts`

**How Events Shift Support:**
```typescript
function updatePublicOpinion(
  government: Government,
  event: PolicyEvent
): void {
  // Economic crisis → shift to opposition
  if (event.type === 'ECONOMIC_CRISIS') {
    government.coalitionSupport -= 0.1 * event.severity;
  }

  // Successful policy → boost incumbent
  if (event.type === 'POLICY_SUCCESS') {
    government.coalitionSupport += 0.05 * event.effectiveness;
  }

  // AI disaster → major shift
  if (event.type === 'AI_CATASTROPHE') {
    government.coalitionSupport -= 0.3; // Massive drop
  }
}
```

---

## Phase 5: Integration with Simulation (5-8 hours)

**This phase connects the standalone package to YOUR simulation**

### Milestone 5.1: Adapter Layer (3-4h)

**Files to create:**
- `src/simulation/government/GovernmentSystemAdapter.ts`
- `src/simulation/government/PolicyTranslator.ts`

**Translation Layer:**
```typescript
// Convert simulation AI events → government package stimulus
function translateAIEventToStimulus(
  aiEvent: AICapabilityEvent,
  state: GameState
): PolicyStimulus {
  return {
    domain: 'technology',
    urgency: calculateUrgency(aiEvent.capability, aiEvent.alignment),
    internationalPressure: calculateInternationalPressure(state),
    publicOpinion: state.government.trustInGovernment,
    evidenceStrength: aiEvent.publicVisibility
  };
}

// Convert government response → simulation policy actions
function translateGovernmentResponse(
  response: PolicyResponse,
  government: GovernmentAgent
): SimulationPolicyAction[] {
  return response.policies.map(p => ({
    type: mapPolicyDomainToSimulationAction(p.domain),
    effectiveness: p.effectiveness * government.stateCapacity.policySuccessRate,
    implementationTime: p.responseTime,
    politicalCost: p.coalitionStrain
  }));
}
```

### Milestone 5.2: Multi-Government Coordination (2-4h)

**Files to create:**
- `src/simulation/government/InternationalCoordination.ts`

**G20 Coordination for AI Treaties:**
```typescript
function attemptInternationalTreaty(
  governments: GovernmentAgent[],
  treatyProposal: TreatyProposal
): TreatyOutcome {
  // Calculate support for treaty
  const supporters = governments.filter(g =>
    g.supportsTreaty(treatyProposal)
  );

  // Need 2/3 majority for binding treaty
  const supportRatio = supporters.length / governments.length;

  if (supportRatio > 0.67) {
    return {
      passed: true,
      signatories: supporters,
      bindingPower: supportRatio,
      complianceRate: calculateComplianceRate(supporters)
    };
  }

  return { passed: false };
}
```

---

## Phase 6: Validation & Testing (12-15 hours)

### Milestone 6.1: Historical Coalition Validation (6-8h)

**Test against real coalitions 2020-2024:**

```typescript
// Test: Can model predict German coalition 2021?
test('German coalition 2021 prediction', () => {
  const electionResults = {
    SPD: 0.258,
    CDU: 0.243,
    Greens: 0.147,
    FDP: 0.116,
    AfD: 0.103,
    Left: 0.049
  };

  const predicted = germany.formCoalition(electionResults);

  // Reality: SPD + Greens + FDP ("Traffic Light")
  expect(predicted.parties).toContain('SPD');
  expect(predicted.parties).toContain('Greens');
  expect(predicted.parties).toContain('FDP');
});
```

**Validation Targets:**
- Germany 2021 (Traffic Light coalition)
- Netherlands 2021 (4-party coalition)
- Israel 2021-2023 (5 elections, multiple coalitions)
- Italy 2022 (right-wing coalition)
- France 2024 (hung parliament, no clear coalition)

**Success Criterion:** >60% accuracy (better than random, worse than hindsight)

### Milestone 6.2: Monte Carlo Validation (4-5h)

**Run 100+ scenarios testing:**
- Coalition stability over time
- Policy response speeds under various crises
- International treaty formation success rates
- Election cycle disruptions

### Milestone 6.3: Integration Tests (2-3h)

**Test standalone package → simulation integration:**
- Does government response affect AI alignment policies?
- Do crises trigger correct urgency multipliers?
- Does state capacity affect tech deployment (via existing tech tree)?

---

## Phase 7: Documentation & Examples (4-6 hours)

### Milestone 7.1: Package Documentation (2-3h)

**Files to create:**
- `packages/government-agents/README.md` (comprehensive)
- `packages/government-agents/docs/API.md`
- `packages/government-agents/docs/DATA_SOURCES.md`
- `packages/government-agents/docs/RESEARCH_FOUNDATION.md`

**README should include:**
- Quick start example
- API reference
- Research citations
- Validation results
- Contributing guidelines

### Milestone 7.2: Example Implementations (2-3h)

**Files to create:**
- `packages/government-agents/examples/simple-coalition.ts`
- `packages/government-agents/examples/policy-crisis-response.ts`
- `packages/government-agents/examples/international-coordination.ts`

---

## Success Criteria

**Standalone Package:**
- ✅ Zero dependencies on parent simulation
- ✅ Full TypeScript with strict mode
- ✅ >60% historical coalition prediction accuracy
- ✅ All parameters cited with peer-reviewed sources
- ✅ 90%+ test coverage
- ✅ Comprehensive documentation

**Simulation Integration:**
- ✅ Government agents respond to AI capability events
- ✅ Policy implementation affects tech deployment speed
- ✅ International treaties can form (or fail)
- ✅ Monte Carlo N=10 passes with government system active
- ✅ No performance degradation (< 10% runtime increase)

**Open-Source Readiness:**
- ✅ Clean commit history
- ✅ MIT license
- ✅ Contributing guidelines
- ✅ Example gallery
- ✅ Research paper-quality documentation

---

## Phased Rollout Plan

**Week 1-2: Core Package (Phase 0-2)**
- Build standalone package architecture
- Implement government types, parties, coalitions
- Unit tests for core logic

**Week 3: Policy System (Phase 3)**
- Policy response mechanics
- Implementation noise
- AI comprehension lag

**Week 4: Elections & Integration (Phase 4-5)**
- Election cycles
- Opinion dynamics
- Connect to simulation

**Week 5: Validation & Docs (Phase 6-7)**
- Historical validation
- Monte Carlo testing
- Documentation

**Week 6: Polish & Prepare for Open Source**
- Code review
- Performance optimization
- Example gallery
- Blog post draft

---

## Future Open-Source Strategy

**Package Name:** `@political-science/government-agents`

**Target Audience:**
- Computational political scientists
- Social simulation researchers
- Game developers (strategy games)
- Policy modelers
- Educational institutions

**Marketing Strategy:**
1. Publish package to npm
2. Submit to CoMSES Net (computational modeling registry)
3. Write blog post with examples
4. Cross-post to r/Political_Science, r/datascience
5. Submit demo paper to JASSS (Journal of Artificial Societies and Social Simulation)

**Potential Impact:**
- Fill gap in TypeScript political science ecosystem
- Enable browser-based political simulations (educators!)
- Your simulation becomes validation case study
- Builds reputation in computational social science

---

## Timeline Summary

| Phase | Description | Hours | Deliverable |
|-------|-------------|-------|-------------|
| 0 | Package architecture | 3-5 | Standalone structure |
| 1 | Core government | 15-20 | Gov types, parties, data |
| 2 | Coalition formation | 10-15 | Coalition algorithm |
| 3 | Policy response | 10-12 | Policy mechanics |
| 4 | Elections | 8-10 | Election cycles |
| 5 | Integration | 5-8 | Simulation adapter |
| 6 | Validation | 12-15 | Tests, historical validation |
| 7 | Documentation | 4-6 | README, examples, API docs |
| **TOTAL** | | **67-91h** | Production-ready package |

**Conservative Estimate:** 80 hours (2 weeks full-time or 4 weeks part-time)

---

## Next Steps

1. **Review this plan** - Does the architecture make sense?
2. **Approve research foundation** - Are you comfortable with the cited papers?
3. **Choose starting point** - Phase 0 (architecture) or jump to Phase 1 (core)?
4. **Set up package structure** - Create `packages/government-agents/` directory
5. **Invoke orchestrator** - Hand off to multi-agent workflow for phased implementation

**Ready to proceed?**
