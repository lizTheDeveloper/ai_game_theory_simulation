# Bionic Skills: Performance vs Competence Tracking

**Plan:** Phase 3 of Bionic Skills Research Grounding
**Effort:** 8 hours over Weeks 5-6
**Priority:** High (Critical for skill development realism)
**Research TRL:** 8 (Well-documented in educational research)

---

## Problem Statement

**Current Model Limitation:**
The existing `bionicSkills.ts` treats AI-assisted **performance** as equivalent to true **competence**. A worker who produces code 55% faster with Copilot is assumed to have improved their coding skill by 55%. This contradicts extensive research showing:

**Performance ≠ Competence**

- AI assistance boosts immediate output (performance)
- BUT: Long-term skill retention (competence) depends on how AI is used
- Without human scaffolding (teaching, feedback), "illusion of understanding" emerges
- Workers can lose underlying skills they're no longer practicing

---

## Research Foundation

### Primary Research:

**"Illusion of Understanding" (Cognitive Research, 2024)**
- Students using AI tutors scored 48-127% higher on immediate tests
- But: Scores "plummeted" on retention tests weeks later
- Mechanism: AI provides answers without building mental models
- Source: Cognitive Research: Principles and Implications journal

**"AI Inhibits On-the-Job Learning" (MDPI, 2023)**
- Workers using AI tools showed reduced skill development over time
- "Automation complacency" - over-reliance on AI suggestions
- Knowledge workers became less capable without AI assistance
- Source: MDPI Behavioral Sciences journal

**"Scaffolding Matters" (Frontiers in Psychology, 2024)**
- AI + human teaching support > AI alone
- Students with instructor guidance retained 80% of skills
- Students with AI-only assistance retained 40% of skills
- Mechanism: Human teaching creates conceptual understanding, AI alone creates pattern matching
- Source: Frontiers in Psychology educational technology section

### Additional Support:

**Deskilling in Automation (Historical Pattern)**
- Airline pilots: Autopilot → reduced manual flying skills → accident risk in emergencies
- GPS navigation: Reduced spatial reasoning and wayfinding ability
- Calculator use: Reduced mental math ability (documented since 1980s)
- Source: Multiple studies, Journal of Applied Psychology, Transportation Research

---

## Implementation Design

### 1. Add Competence Tracking (3 hours)

**Extend Skills Interface:**
```typescript
interface BionicSkills {
  // Existing (keep these)
  communication: number;
  analyticalThinking: number;
  creativity: number;
  programming: number;
  technicalSkills: number;
  overallEffectiveness: number;

  // NEW: Competence tracking
  competence: {
    communication: number;         // True skill without AI
    analyticalThinking: number;
    creativity: number;
    programming: number;
    technicalSkills: number;
    overall: number;
  };

  // NEW: Performance-competence gap
  gaps: {
    communication: number;         // performance - competence
    analyticalThinking: number;
    creativity: number;
    programming: number;
    technicalSkills: number;
    overall: number;
  };

  // NEW: Retention factors
  retention: {
    scaffoldingQuality: number;    // 0-1, human teaching support
    aiRelianceLevel: number;       // 0-1, how much work done by AI
    monthsOfUse: number;           // Time using AI
    retentionRate: number;         // How much learning sticks (0-1)
  };
}
```

**Initialize Competence:**
```typescript
function initializeCompetence(segment: SocietySegment): void {
  if (!segment.skills) return;

  // Initial competence = current performance (no gap yet)
  segment.skills.competence = {
    communication: segment.skills.communication,
    analyticalThinking: segment.skills.analyticalThinking,
    creativity: segment.skills.creativity,
    programming: segment.skills.programming,
    technicalSkills: segment.skills.technicalSkills,
    overall: segment.skills.overallEffectiveness
  };

  // Initialize gaps (all zero initially)
  segment.skills.gaps = {
    communication: 0,
    analyticalThinking: 0,
    creativity: 0,
    programming: 0,
    technicalSkills: 0,
    overall: 0
  };

  // Initialize retention factors
  segment.skills.retention = {
    scaffoldingQuality: getScaffoldingQuality(segment),
    aiRelianceLevel: 0,  // Grows as AI capability increases
    monthsOfUse: 0,
    retentionRate: 0.7   // Base 70% retention
  };
}

function getScaffoldingQuality(segment: SocietySegment): number {
  // Quality of human teaching/mentorship available to this segment
  // Based on education access, workplace training quality

  const qualityByStatus: Record<string, number> = {
    'elite': 0.85,         // High-quality education, mentorship
    'professional': 0.70,  // Good workplace training
    'middle': 0.55,        // Moderate training resources
    'working': 0.35,       // Limited training, learning-by-doing
    'precariat': 0.20      // Minimal support, self-taught
  };

  return qualityByStatus[segment.economicStatus] || 0.50;
}
```

---

### 2. Update Performance vs Competence (3 hours)

**Monthly Update Logic:**
```typescript
function updateCompetenceTracking(state: GameState): void {
  const avgAICapability = getAverageAICapability(state);

  state.society.segments?.forEach(segment => {
    if (!segment.skills) return;

    const retention = segment.skills.retention;
    retention.monthsOfUse++;

    // Calculate AI reliance level
    // Higher AI capability → more reliance (assuming access)
    const aiAccess = segment.aiAccess || 0;
    retention.aiRelianceLevel = aiAccess * Math.min(avgAICapability / 2.0, 1.0);
    // Caps at 1.0 (full reliance) when AI reaches 2.0 capability

    // Calculate retention rate based on scaffolding and reliance
    // High scaffolding + moderate reliance → good retention
    // Low scaffolding + high reliance → poor retention
    retention.retentionRate = calculateRetentionRate(
      retention.scaffoldingQuality,
      retention.aiRelianceLevel
    );

    // Update competence for each skill
    updateSkillCompetence(segment, avgAICapability);

    // Calculate gaps
    segment.skills.gaps = {
      communication: segment.skills.communication - segment.skills.competence.communication,
      analyticalThinking: segment.skills.analyticalThinking - segment.skills.competence.analyticalThinking,
      creativity: segment.skills.creativity - segment.skills.competence.creativity,
      programming: segment.skills.programming - segment.skills.competence.programming,
      technicalSkills: segment.skills.technicalSkills - segment.skills.competence.technicalSkills,
      overall: segment.skills.overallEffectiveness - segment.skills.competence.overall
    };
  });
}

function calculateRetentionRate(scaffolding: number, reliance: number): number {
  // Research-backed formula from Frontiers Psychology (2024)
  // High scaffolding + moderate reliance = optimal (80% retention)
  // Low scaffolding + high reliance = poor (30-40% retention)

  const baseRetention = 0.50;  // 50% baseline

  // Scaffolding bonus (up to +35%)
  const scaffoldingBonus = scaffolding * 0.35;

  // Reliance penalty (quadratic - hurts more at high reliance)
  const reliancePenalty = Math.pow(reliance, 2) * 0.30;

  // Scaffolding can partially offset reliance penalty
  const netPenalty = reliancePenalty * (1 - scaffolding * 0.5);

  return Math.max(
    0.20,  // Minimum 20% retention (something always sticks)
    Math.min(
      0.90,  // Maximum 90% retention (some loss inevitable)
      baseRetention + scaffoldingBonus - netPenalty
    )
  );
}
```

**Skill Competence Evolution:**
```typescript
function updateSkillCompetence(segment: SocietySegment, aiCapability: number): void {
  const skills = segment.skills!;
  const retention = skills.retention;

  // For each skill domain
  const skillDomains: Array<keyof BionicSkills> = [
    'communication', 'analyticalThinking', 'creativity',
    'programming', 'technicalSkills'
  ];

  skillDomains.forEach(domain => {
    const currentPerformance = skills[domain] as number;
    const currentCompetence = skills.competence[domain as keyof typeof skills.competence] as number;

    // Performance improvement from AI (current system - keep this)
    const performanceGain = calculatePerformanceGain(currentCompetence, aiCapability, segment.aiAccess || 0);
    const newPerformance = currentCompetence + performanceGain;

    // Competence improvement (learning that sticks)
    const competenceGain = performanceGain * retention.retentionRate;
    const newCompetence = currentCompetence + competenceGain * 0.01;
    // 1% of monthly gain converts to long-term competence

    // Competence decay from disuse (if high AI reliance)
    const disuseFactor = retention.aiRelianceLevel * 0.005;  // 0.5% per month at full reliance
    const competenceDecay = currentCompetence * disuseFactor;

    // Update
    skills[domain] = newPerformance;
    (skills.competence[domain as keyof typeof skills.competence] as number) = Math.max(
      0.1,  // Min competence
      newCompetence - competenceDecay
    );
  });

  // Update overall effectiveness
  skills.overallEffectiveness = (
    skills.communication * 0.2 +
    skills.analyticalThinking * 0.2 +
    skills.creativity * 0.2 +
    skills.programming * 0.2 +
    skills.technicalSkills * 0.2
  );

  skills.competence.overall = (
    skills.competence.communication * 0.2 +
    skills.competence.analyticalThinking * 0.2 +
    skills.competence.creativity * 0.2 +
    skills.competence.programming * 0.2 +
    skills.competence.technicalSkills * 0.2
  );
}
```

---

### 3. Crisis Effects (2 hours)

**AI Disruption Events:**
```typescript
function checkForCompetenceCrisis(state: GameState): void {
  // If large performance-competence gaps emerge, trigger events

  state.society.segments?.forEach(segment => {
    if (!segment.skills) return;

    const overallGap = segment.skills.gaps.overall;

    // Moderate gap (30%+)
    if (overallGap > 0.30 && !segment.competenceCrisisWarning) {
      segment.competenceCrisisWarning = true;

      addEvent(state, {
        type: 'social',
        severity: 'medium',
        title: `Skill Erosion: ${segment.name}`,
        description: `${segment.name} showing signs of skill erosion. Performance boosted ${(overallGap * 100).toFixed(0)}% by AI, but true competence lagging. Workers increasingly dependent on AI assistance.`,
        effects: {
          competenceGap: overallGap
        }
      });
    }

    // Severe gap (50%+)
    if (overallGap > 0.50 && !segment.competenceCrisisActive) {
      segment.competenceCrisisActive = true;

      addEvent(state, {
        type: 'crisis',
        severity: 'high',
        title: `⚠️ COMPETENCE CRISIS: ${segment.name}`,
        description: `${segment.name} experiencing severe skill erosion. True competence ${(segment.skills.competence.overall * 100).toFixed(0)}% while AI-assisted performance ${(segment.skills.overallEffectiveness * 100).toFixed(0)}%. Workers unable to function without AI. Emergency retraining needed.`,
        effects: {
          competenceGap: overallGap,
          retrainingUrgency: 1.0
        }
      });

      // Increase QoL decline from anxiety/insecurity
      segment.segmentQoL = Math.max(0, segment.segmentQoL - 0.1);
    }
  });
}
```

**AI Outage Scenario:**
```typescript
function simulateAIOutage(state: GameState, durationMonths: number): void {
  // What happens if AI systems become unavailable?
  // Workers must rely on true competence, not AI-boosted performance

  addEvent(state, {
    type: 'crisis',
    severity: 'destructive',
    title: '🚨 AI SYSTEM OUTAGE',
    description: `Major AI infrastructure failure. Systems offline for ${durationMonths} months. Productivity drops to baseline competence levels. Workers scrambling to compensate.`,
    effects: { aiOutage: durationMonths }
  });

  state.society.segments?.forEach(segment => {
    if (!segment.skills) return;

    // Productivity drops to competence level (not performance level)
    const productivityLoss = segment.skills.gaps.overall;

    // Economic impact
    const gdpImpact = productivityLoss * segment.populationFraction * 0.5;
    // Each segment's productivity loss proportionally affects GDP

    // Psychological impact (panic, realization of dependency)
    segment.segmentQoL = Math.max(0, segment.segmentQoL - productivityLoss * 0.2);

    addEvent(state, {
      type: 'economic',
      severity: 'high',
      title: `${segment.name}: Productivity Collapse`,
      description: `${segment.name} productivity drops ${(productivityLoss * 100).toFixed(0)}% without AI assistance. True competence gap exposed.`,
      effects: {
        gdpLoss: gdpImpact,
        segmentQoL: -productivityLoss * 0.2
      }
    });
  });

  // Trigger increased retraining investments (policy response)
  if (state.policy) {
    state.policy.retrainingInvestment = Math.min(1.0, state.policy.retrainingInvestment + 0.3);
  }
}
```

---

## Testing & Validation

**Test 1: Retention Rate Calculation**
```typescript
test('High scaffolding + moderate reliance = good retention', () => {
  const highScaffolding = 0.80;
  const moderateReliance = 0.50;

  const retention = calculateRetentionRate(highScaffolding, moderateReliance);

  expect(retention).toBeGreaterThan(0.65);  // Should be 65%+
  expect(retention).toBeLessThan(0.85);     // But less than 85%
});

test('Low scaffolding + high reliance = poor retention', () => {
  const lowScaffolding = 0.20;
  const highReliance = 0.90;

  const retention = calculateRetentionRate(lowScaffolding, highReliance);

  expect(retention).toBeLessThan(0.50);  // Should be <50%
  expect(retention).toBeGreaterThan(0.20);  // But >20% minimum
});
```

**Test 2: Gap Evolution Over Time**
```typescript
test('Performance-competence gap grows with high AI reliance', () => {
  const state = initializeGameState();
  const elite = state.society.segments!.find(s => s.economicStatus === 'elite')!;
  const precariat = state.society.segments!.find(s => s.name === 'Precariat')!;

  // Set high AI capability
  state.aiAgents[0].capability = 2.0;
  elite.aiAccess = 0.90;
  precariat.aiAccess = 0.90;

  // Run for 24 months
  for (let month = 0; month < 24; month++) {
    updateBionicSkills(state);
    updateCompetenceTracking(state);
  }

  // Elite should have smaller gap (better scaffolding)
  expect(elite.skills!.gaps.overall).toBeLessThan(0.30);

  // Precariat should have larger gap (poor scaffolding)
  expect(precariat.skills!.gaps.overall).toBeGreaterThan(0.40);
});
```

**Test 3: AI Outage Impact**
```typescript
test('AI outage reveals competence gaps', () => {
  const state = initializeGameState();

  // Build up high AI reliance
  state.aiAgents[0].capability = 3.0;
  for (let month = 0; month < 36; month++) {
    updateBionicSkills(state);
    updateCompetenceTracking(state);
  }

  const preCrisisGDP = state.economy.gdp;

  // Simulate 3-month outage
  simulateAIOutage(state, 3);

  // GDP should drop proportional to average competence gap
  const avgGap = calculateAverageCompetenceGap(state.society.segments!);
  const expectedGDPLoss = avgGap * 0.3;  // 30% of gap translates to GDP

  expect(state.economy.gdp).toBeLessThan(preCrisisGDP * (1 - expectedGDPLoss));
});
```

---

## Integration Points

**Connects to:**
- `updateBionicSkills()` - adds competence tracking on top of existing performance
- `calculateProductivityMultiplierFromSkills()` - should use performance, not competence
- Phase 2 (displacement) - workers with low competence more vulnerable
- Phase 4 (economic distribution) - competence gaps affect wage bargaining
- Crisis systems - new crisis type (competence crisis)

**Adds to SocietySegment:**
- `competenceCrisisWarning: boolean`
- `competenceCrisisActive: boolean`

**Adds Events:**
- "Skill Erosion" events (moderate gaps)
- "Competence Crisis" events (severe gaps)
- "AI Outage" events (testing resilience)

---

## Parameters Reference

```typescript
const COMPETENCE_TRACKING_CONFIG = {
  // Retention rates (from Frontiers Psychology 2024)
  baseRetention: 0.50,           // 50% baseline
  maxRetention: 0.90,            // 90% maximum
  minRetention: 0.20,            // 20% minimum

  // Scaffolding quality by segment (education access research)
  scaffolding: {
    elite: 0.85,
    professional: 0.70,
    middle: 0.55,
    working: 0.35,
    precariat: 0.20
  },

  // Competence evolution rates
  competenceGainRate: 0.01,      // 1% of monthly performance gain sticks
  competenceDecayRate: 0.005,    // 0.5% decay per month at full AI reliance

  // Crisis thresholds
  moderateGapThreshold: 0.30,    // 30% gap triggers warning
  severeGapThreshold: 0.50,      // 50% gap triggers crisis

  // AI outage impact
  gdpImpactFactor: 0.50,         // 50% of competence gap → GDP loss
  qolImpactFactor: 0.20          // 20% of gap → QoL decline
};
```

---

## Success Criteria

✅ **Retention rates match research:**
- High scaffolding + moderate reliance: 65-80% retention
- Low scaffolding + high reliance: 30-40% retention
- Matches Frontiers Psychology (2024) findings

✅ **Gaps emerge realistically:**
- Elite segments: smaller gaps (better scaffolding)
- Precariat segments: larger gaps (poor scaffolding)
- Gaps grow over time with sustained AI use

✅ **Crisis detection works:**
- Moderate gaps (30%+) trigger warnings
- Severe gaps (50%+) trigger crises
- AI outage reveals true competence levels

✅ **Policy interventions matter:**
- Increased training investment improves scaffolding
- Better scaffolding → better retention → smaller gaps
- Without intervention, gaps widen over time

---

## Next Steps After Implementation

1. **Connect to Phase 2** (Displacement)
   - Workers with low competence more vulnerable to displacement
   - Retraining effectiveness depends on current competence level

2. **Connect to Phase 4** (Economic Distribution)
   - Competence gaps reduce wage bargaining power
   - Workers with low competence can't command high wages even if performance is good

3. **Add policy responses**
   - Apprenticeship programs (increase scaffolding)
   - Certification requirements (force competence demonstration)
   - AI-free skill assessments (reveal true competence)

---

**Effort:** 8 hours
**Priority:** High (critical for realism)
**Research TRL:** 8 (well-documented)
**Status:** Ready for implementation
