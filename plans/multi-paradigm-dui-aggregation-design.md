# Multi-Paradigm DUI Aggregation Design

**Created:** 2025-10-19
**Status:** DESIGN - Response to Research-Skeptic Quality Gate 1
**Purpose:** Address 5 major issues while preserving paradigm conflict visibility

## Design Principle

**Paradigm conflicts are diagnostic, not errors.** The goal is to aggregate indicators up to paradigm-level scores (0-100) to make conflicts, contradictions, and missing data VISIBLE for analysis.

## Response to Research-Skeptic Concerns

### Issue 1: Paradigm Independence Illusion (wealth→freedom 0.89)

**Skeptic's Point:** Paradigms aren't independent - they correlate with wealth.

**Our Response:** **This is the point.** We're not claiming paradigms are statistically independent - we're showing VALUE conflicts despite correlations.

**Implementation:**
```typescript
interface ParadigmCorrelations {
  western_development: number;  // Track correlation (expected ~0.7-0.9)
  western_ecological: number;    // Track correlation (expected negative ~-0.4)
  development_ecological: number; // Track correlation (expected negative ~-0.6)
  // etc for all 6 pairwise combinations
}

// Log correlations in Monte Carlo outputs to validate research claims
// HIGH correlation = paradigms aligned (Nordic countries)
// NEGATIVE correlation = paradigm conflict (Singapore, Norway)
// DIVERGING over time = paradigm shift (China 1980→2025)
```

**Diagnostic Value:** When correlations break down, it reveals important dynamics:
- Norway: Western+Development high (0.95+) BUT Ecological low (0.20) = conflict visible
- Singapore: Development high (0.94) BUT Western low (0.48) = conflict visible

### Issue 2: Indigenous Measurement Void (1 country vs 202)

**Skeptic's Point:** Only Bhutan has GNH data - can't measure Indigenous paradigm globally.

**Our Response:** **Use proxy indicators with explicit uncertainty.**

**Implementation:**
```typescript
interface IndigenousParadigmScore {
  score: number;           // 0-100 aggregate
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'SPECULATIVE';
  dataAvailability: number; // % of indicators with actual data
  proxyIndicators: string[]; // Which proxies used (social trust, WVS, cultural diversity)

  // Bhutan-specific (HIGH confidence when available)
  gnh?: {
    score: number;        // Direct GNH survey data
    domains: number[];    // 9 GNH domains
  };

  // Global proxies (LOW-MEDIUM confidence)
  socialTrust?: number;      // World Values Survey
  culturalDiversity?: number; // UNESCO linguistic diversity
  communityBelonging?: number; // WVS community importance
}
```

**Diagnostic Value:**
- Bhutan score has HIGH confidence (direct GNH data)
- Most countries have LOW confidence (proxy indicators only)
- Missing data is VISIBLE in output, not hidden in false precision

**Flag for future research:** When confidence='SPECULATIVE', mark for human review.

### Issue 3: Ecological Impossibility Problem (0 countries meet criteria)

**Skeptic's Point:** Zero countries in ecological utopia - are we measuring achievable state or philosophical ideal? ±50% uncertainty on "2.5 Earths".

**Our Response:** **Both.** Track current state AND required state, show the gap.

**Implementation:**
```typescript
interface EcologicalParadigmScore {
  currentScore: number;        // 0-100 based on current planetary boundaries
  requiredForUtopia: number;   // What score needed (typically 80-100)
  gapToUtopia: number;        // requiredForUtopia - currentScore

  // Uncertainty tracking (skeptic's requirement)
  uncertaintyBand: {
    low: number;   // Pessimistic estimate
    mid: number;   // Best estimate (what we use)
    high: number;  // Optimistic estimate
  };

  // Planetary boundaries detail (9 boundaries)
  boundaries: {
    id: string;                    // 'climate', 'biodiversity', 'nitrogen', etc
    status: 'SAFE' | 'UNCERTAIN' | 'BREACHED';
    currentValue: number;
    safeThreshold: number;
    uncertaintyRange: [number, number]; // ±50% for some boundaries
  }[];

  // Technology scenarios
  withCurrentTech: number;      // Score achievable with deployed tech
  withBreakthroughTech: number; // Score achievable with TIER 3-4 tech (fusion, vertical farming)
}
```

**Diagnostic Value:**
- Current global ecological score: ~22/100 (6/9 boundaries breached)
- Required for utopia: 80/100
- Gap: 58 points = MASSIVE transformation needed
- With breakthrough tech: 65/100 achievable = still short, but closer

**This makes the "impossible" problem VISIBLE rather than hiding it.**

### Issue 4: Aggregation Rules Missing (How to classify Singapore?)

**Skeptic's Point:** Is Singapore utopia or dystopia when paradigms conflict?

**Our Response:** **Don't classify as single outcome. Report all 4 paradigm scores + divergence metric.**

**Implementation:**
```typescript
interface MultiParadigmOutcome {
  // NO SINGLE CLASSIFICATION - show all 4 scores
  paradigmScores: {
    western: number;      // 0-100
    development: number;  // 0-100
    ecological: number;   // 0-100
    indigenous: number;   // 0-100
  };

  // Divergence metrics (how much paradigms disagree)
  divergence: {
    overall: number;      // Standard deviation across 4 scores (0=consensus, 50=extreme conflict)
    maxRange: number;     // Max - min score (Singapore: 94 - 22 = 72 point range)
    pairwise: {
      western_development: number;    // Absolute difference
      western_ecological: number;
      // ... all 6 pairs
    };
  };

  // Outcome classification (OPTIONAL, for Monte Carlo aggregation)
  classification: {
    // Count how many paradigms say "utopia" (≥80) vs "dystopia" (≤30)
    utopiasCount: number;    // 0-4 paradigms in utopia
    dystopiasCount: number;  // 0-4 paradigms in dystopia
    contested: boolean;      // True if some say utopia, some say dystopia

    // Human-readable summary
    label: string; // "Development Utopia, Liberal Dystopia" (Singapore)
                   // "Ecological Dystopia, Liberal/Development Utopia" (Norway)
                   // "Multi-Paradigm Dystopia" (Yemen)
                   // "Contested Multi-Paradigm State" (China)
  };
}
```

**Example Output for Singapore:**
```
Paradigm Scores: [Western: 48, Development: 94, Ecological: 35, Indigenous: 42]
Divergence: 25.1 (HIGH CONFLICT)
Classification: "Development Utopia, Multi-Paradigm Dystopia (3/4)"
Contested: TRUE (1 utopia, 3 dystopia/neutral)
```

**Diagnostic Value:** The conflict IS the information. Don't force single answer.

### Issue 5: Overconfident Claims ("2.5 Earths" ±50% error)

**Skeptic's Point:** Raworth's "2.5 Earths" could be 1.25-3.75 Earths with uncertainty. Stop stating as fact.

**Our Response:** **Track uncertainty explicitly in all parameters.**

**Implementation:**
```typescript
interface ParadigmScore {
  value: number;              // Point estimate (0-100)
  confidence: ConfidenceLevel; // 'HIGH' | 'MEDIUM' | 'LOW' | 'SPECULATIVE'
  uncertaintyBand?: {
    low: number;   // Pessimistic bound
    high: number;  // Optimistic bound
    source: string; // Why this range? (e.g., "Raworth ±50% on footprint component")
  };
}

// Example: Ecological paradigm for Norway
{
  value: 22,
  confidence: 'MEDIUM',
  uncertaintyBand: {
    low: 15,    // If ecological footprint measurements pessimistic
    high: 35,   // If technological efficiency gains optimistic
    source: "Raworth (2024): Carbon footprint ±50%, biodiversity ±30%"
  }
}
```

**Monte Carlo Validation:**
```typescript
// Run simulations with uncertainty bands
for (let run = 0; run < 100; run++) {
  const ecologicalScore = sample(
    paradigm.value,
    paradigm.uncertaintyBand.low,
    paradigm.uncertaintyBand.high
  );
  // Does outcome change if we use pessimistic vs optimistic bounds?
}
```

**Diagnostic Value:**
- When outcomes are ROBUST to uncertainty (±50% doesn't change dystopia/utopia), high confidence
- When outcomes FLIP with uncertainty (utopia→dystopia), flag for human review

## Aggregation Formula (Within Paradigm)

**Each paradigm aggregates 5-15 indicators using geometric mean (non-compensatory):**

```typescript
function aggregateParadigm(indicators: ParadigmIndicator[]): ParadigmScore {
  // Geometric mean prevents "elite utopia masks mass suffering"
  const product = indicators.reduce((acc, ind) => acc * (ind.value / 100), 1);
  const geometricMean = Math.pow(product, 1 / indicators.length) * 100;

  // Confidence = minimum indicator confidence
  const confidence = indicators.every(i => i.confidence === 'HIGH') ? 'HIGH' :
                     indicators.some(i => i.confidence === 'SPECULATIVE') ? 'SPECULATIVE' :
                     indicators.some(i => i.confidence === 'LOW') ? 'LOW' : 'MEDIUM';

  // Data availability
  const dataAvailability = indicators.filter(i => i.hasData).length / indicators.length;

  return {
    value: geometricMean,
    confidence,
    dataAvailability,
    indicators: indicators.map(i => ({ id: i.id, value: i.value, weight: 1/indicators.length }))
  };
}
```

**Why geometric mean?**
- Prevents compensation: Low score on ONE critical dimension (e.g., freedom=10) can't be offset by high scores on others
- Matches HDI methodology (UNDP standard)
- Detects "Elysium scenarios" where elite prosperity masks mass suffering

## State Structure (TypeScript)

```typescript
interface MultiParadigmDUI {
  // Core paradigm scores (0-100 each)
  western: ParadigmScore;
  development: ParadigmScore;
  ecological: ParadigmScore;
  indigenous: ParadigmScore;

  // Divergence tracking
  divergence: {
    overall: number;           // Std dev across 4 scores
    maxRange: number;          // Max - min
    pairwise: Map<string, number>; // 6 pairwise differences
    trend: 'CONVERGING' | 'DIVERGING' | 'STABLE'; // Over last 12 months
  };

  // Correlation tracking (validates research claims)
  correlations: {
    western_development: number;
    western_ecological: number;
    western_indigenous: number;
    development_ecological: number;
    development_indigenous: number;
    ecological_indigenous: number;
  };

  // Outcome classification (optional, for aggregation)
  outcome: {
    utopiasCount: number;      // How many paradigms ≥80
    dystopiasCount: number;    // How many paradigms ≤30
    contested: boolean;        // Some utopia, some dystopia
    label: string;             // Human-readable
  };

  // Country-specific paradigm alignment (which paradigm does country optimize for?)
  dominantParadigm?: 'western' | 'development' | 'ecological' | 'indigenous' | 'contested';

  // Historical tracking (for paradigm shifts)
  history: {
    month: number;
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
  }[];
}

interface ParadigmScore {
  value: number;               // 0-100 aggregate
  confidence: ConfidenceLevel;
  dataAvailability: number;    // 0-1 (% indicators with data)

  uncertaintyBand?: {
    low: number;
    high: number;
    source: string;
  };

  // Component indicators (5-15 per paradigm)
  indicators: {
    id: string;
    value: number;
    weight: number;
    confidence: ConfidenceLevel;
    hasData: boolean;
  }[];

  // Breakdown by dimension
  dimensions?: {
    [key: string]: number;  // e.g., 'political_freedom': 85, 'economic_freedom': 72
  };
}

type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'SPECULATIVE';
```

## Diagnostic Outputs (Monte Carlo)

**Instead of single "utopia rate", report:**

```typescript
interface MonteCarloParadigmAnalysis {
  // Traditional outcomes (for comparison)
  traditionalUtopiaRate: number;    // Single-DUI approach
  traditionalDystopiaRate: number;

  // Multi-paradigm outcomes (NEW)
  paradigmOutcomes: {
    // How often does EACH paradigm achieve utopia?
    westernUtopiaRate: number;      // e.g., 12% of runs
    developmentUtopiaRate: number;  // e.g., 35% of runs
    ecologicalUtopiaRate: number;   // e.g., 3% of runs (very hard!)
    indigenousUtopiaRate: number;   // e.g., 8% of runs

    // How often do paradigms AGREE?
    allFourUtopiaRate: number;      // e.g., 0.5% (extremely rare - the "true" utopia)
    allFourDystopiaRate: number;    // e.g., 45% (multi-paradigm collapse)

    // Conflict patterns
    contestedRate: number;          // e.g., 42% (some paradigms utopia, some dystopia)

    // Specific conflict patterns
    singaporePattern: number;       // Development utopia + Western dystopia (how often?)
    norwayPattern: number;          // Western/Dev utopia + Ecological dystopia
    bhutanPattern: number;          // Indigenous/Eco utopia + Development dystopia
  };

  // Divergence trends
  averageDivergence: number;        // Mean std dev across all runs
  divergenceTrend: 'CONVERGING' | 'DIVERGING' | 'STABLE';

  // Correlation validation (does research hold?)
  observedCorrelations: {
    western_development: number;    // Should be ~0.7-0.9 per research
    western_ecological: number;     // Should be negative per research
    // etc
  };
}
```

**Example Output:**
```
=== MULTI-PARADIGM DUI ANALYSIS (N=100, 240mo) ===

Traditional Single-DUI:
  Utopia: 5%
  Dystopia: 82%

Multi-Paradigm Reality:
  Western Utopia: 12% of runs
  Development Utopia: 35% of runs
  Ecological Utopia: 3% of runs (HARD - requires breakthrough tech)
  Indigenous Utopia: 8% of runs

  All-Four Utopia: 0.5% (EXTREMELY RARE - true universal flourishing)
  All-Four Dystopia: 45% (multi-paradigm collapse)
  Contested Outcomes: 42% (paradigm conflicts)

Conflict Patterns:
  Singapore Pattern (Dev utopia, Western dystopia): 18% of runs
  Norway Pattern (West/Dev utopia, Eco dystopia): 8% of runs
  Bhutan Pattern (Eco/Indigenous utopia, Dev dystopia): 2% of runs

Divergence: 28.3 average (HIGH CONFLICT across paradigms)
Trend: DIVERGING (paradigms pulling apart over time)

Correlation Validation:
  Western ↔ Development: 0.73 ✓ (research predicted 0.7-0.9)
  Western ↔ Ecological: -0.42 ✓ (research predicted negative)
  Development ↔ Ecological: -0.58 ✓ (research predicted negative)
```

## Addressing Skeptic's Concerns (Summary)

| Concern | Our Solution | Diagnostic Value |
|---------|-------------|------------------|
| **1. Paradigm Independence Illusion** | Track correlations, show when they break | Reveals when value conflicts override statistical correlations |
| **2. Indigenous Measurement Void** | Explicit confidence levels, proxy indicators | Makes data limitations visible, not hidden |
| **3. Ecological Impossibility** | Track gap between current & required, uncertainty bands | Shows SCALE of transformation needed |
| **4. Aggregation Rules Missing** | No single classification - report all 4 scores + divergence | Paradigm conflicts ARE the information |
| **5. Overconfident Claims** | Uncertainty bands on all parameters, Monte Carlo sensitivity | Robust outcomes flagged, uncertain outcomes reviewed |

## Next Steps (Phase 2: Metric Mapping)

With this aggregation design established:

1. **Map specific indicators to each paradigm** (5-15 per paradigm)
   - Western: V-Dem electoral democracy, Freedom House civil liberties, Privacy International surveillance, economic freedom
   - Development: HDI, MPI, IPC food security, HAQ healthcare access, Gini inequality
   - Ecological: 9 planetary boundaries, ecological footprint, biodiversity loss, climate stability
   - Indigenous: Bhutan GNH (when available), World Values Survey social trust, UNESCO cultural diversity, community belonging

2. **Define confidence levels per indicator**
   - HIGH: Official data, 180+ countries, annual updates (HDI, V-Dem)
   - MEDIUM: Official data, limited countries or irregular updates (GNH, some boundaries)
   - LOW: Proxy indicators, substantial uncertainty (Indigenous paradigm)
   - SPECULATIVE: Estimated, no direct measurement

3. **Create decision tree for missing data**
   - If indicator unavailable, use proxy with confidence downgrade
   - If no proxy available, flag paradigm score as LOW confidence
   - Track data availability % in output

4. **Implement geometric mean aggregation**
   - Within each paradigm (prevents compensation)
   - NO aggregation ACROSS paradigms (preserve conflicts)

5. **Validate with historical cases**
   - Does Singapore show up as Development utopia + Western dystopia?
   - Does Norway show up as Western/Development utopia + Ecological dystopia?
   - Does China show paradigm shift (Development → Development+Ecological)?

## Success Criteria

**Phase 2 complete when:**
- [ ] 5-15 indicators mapped per paradigm with research citations
- [ ] Confidence levels assigned to all indicators
- [ ] Geometric mean aggregation implemented
- [ ] Monte Carlo outputs show paradigm conflicts (Singapore pattern, Norway pattern)
- [ ] Historical validation cases match research predictions
- [ ] Research-skeptic validates indicator selection and confidence assignments

**Expected Timeline:** 10-15 hours (Phase 2)

---

**Status:** DESIGN COMPLETE - Ready for Phase 2 (Metric Mapping)
**Addresses:** All 5 major issues from research-skeptic Quality Gate 1
**Preserves:** Paradigm conflict visibility (the core insight)
