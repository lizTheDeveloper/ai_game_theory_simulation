# HANDOFF: Configuration Parameter Citations Update

**To:** simulation-maintainer (Roy)
**From:** orchestrator
**Date:** 2025-12-09
**Priority:** HIGH (After Quality Gate 1 PASS)
**Timeline:** 2 hours

---

## Task

Update `centralConfig.ts` with peer-reviewed citations for Phase 1 parameters, replacing `[RESEARCH NEEDED]` tags.

**Context:** Research phase complete, validation PASSED (Grade B+). Implement research findings into configuration file with proper citations.

---

## Prerequisites

**Must be complete before starting:**
- [ ] Research file: `research/config_parameters_justification_20251209.md` (Cynthia)
- [ ] Validation review: `reviews/config_params_critique_20251209.md` (Sylvia)
- [ ] Quality Gate 1: PASS (Grade B+ or better)

---

## Parameters to Update

**File:** `src/simulation/config/centralConfig.ts`

### 1. Social Cohesion Dynamics

**Line 292:** SOCIAL_COHESION_DECAY_RATE
```typescript
// BEFORE:
/**
 * Social cohesion decay rate (per month, no maintenance)
 * @research [RESEARCH NEEDED] - Based on historical social fragmentation
 * @value 0.01 - 1% per month without investment
 */
SOCIAL_COHESION_DECAY_RATE: 0.01,

// AFTER (example - use actual research values):
/**
 * Social cohesion decay rate (per month, no maintenance)
 * @research Post-conflict polarization decay: 0.8-1.2% per month (Colletta & Cullen 2023, USIP)
 * @research Trust erosion in fragmented societies: 0.5-1.5% monthly (Putnam 2024, Political Science Quarterly)
 * @value 0.01 - 1% per month without investment (middle of empirical range)
 * @uncertainty ±0.5% (varies by conflict intensity, institutional capacity)
 */
SOCIAL_COHESION_DECAY_RATE: 0.01,
```

**Line 465:** SOCIAL_COHESION_RECOVERY_RATE
```typescript
// BEFORE:
/**
 * Social cohesion recovery rate (per month, with investment)
 * @research [RESEARCH NEEDED] - Post-conflict reconciliation timelines
 * @value 0.01 - 1% per month with active investment
 */
SOCIAL_COHESION_RECOVERY_RATE: 0.01,

// AFTER (example - use actual research values):
/**
 * Social cohesion recovery rate (per month, with investment)
 * @research Post-conflict reconciliation: 0.5-2% monthly with active programs (Verdeja 2024, Journal of Peace Research)
 * @research Rwanda trust recovery: ~1% monthly 1995-2005 (Paluck et al. 2023, Annual Review of Psychology)
 * @value 0.01 - 1% per month with active investment (conservative estimate)
 * @uncertainty ±1% (varies by intervention type, baseline trauma, time since conflict)
 */
SOCIAL_COHESION_RECOVERY_RATE: 0.01,
```

### 2. Migration/Evacuation

**Line 607:** MIGRATION_EVACUATION_FRACTION
```typescript
// BEFORE:
/**
 * Migration - assumed evacuation fraction (of successful relocations)
 * @research [RESEARCH NEEDED] - Fraction of population that can evacuate
 * @value 0.3 - Assume 30% of population can migrate if needed
 */
MIGRATION_EVACUATION_FRACTION: 0.3,

// AFTER (example - use actual research values):
/**
 * Migration - evacuation fraction in major crises
 * @research Hurricane Katrina: ~25% evacuated (Fussell et al. 2024, Population and Environment)
 * @research Syrian/Ukraine refugees: 30-40% displaced (UNHCR 2024, Global Trends Report)
 * @value 0.3 - 30% baseline evacuation capacity
 * @uncertainty ±15% (varies by disaster type, infrastructure, borders, resources)
 * @notes Sudden disasters: 20-30%, Slow-onset: 30-50%, Conflict: 40-60%
 */
MIGRATION_EVACUATION_FRACTION: 0.3,
```

### 3. Economic Collapse Definitions

**Line 693:** MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD
```typescript
// BEFORE:
/**
 * Major economy collapse - economic stage threshold
 * @research [RESEARCH NEEDED] - Economic collapse definition
 * @value 2.0 - Below stage 2.0 (middle-income) = collapsed economy
 */
MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD: 2.0,

// AFTER (example - use actual research values):
/**
 * Major economy collapse - economic stage threshold
 * @research IMF WEO 2024: Economic collapse = GDP contraction >50%, per-capita <$4,000
 * @research World Bank Income Classification 2025: Middle-income threshold $4,256-$13,205
 * @value 2.0 - Below middle-income threshold = collapsed economy
 * @uncertainty Stage 1.5-2.5 (depends on pre-crisis capacity, debt levels)
 */
MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD: 2.0,
```

**Line 700:** MAJOR_ECONOMY_POPULATION_THRESHOLD
```typescript
// BEFORE:
/**
 * Major economy population threshold (millions)
 * @research [RESEARCH NEEDED] - Defines "major economy" for global systemic risk
 * @value 300 - 300M+ population = major economy
 */
MAJOR_ECONOMY_POPULATION_THRESHOLD: 300,

// AFTER (example - use actual research values):
/**
 * Major economy population threshold (millions)
 * @research G20 economies: 60M+ population (Indonesia smallest, EU treated as bloc)
 * @research BIS Systemically Important Economies: 100M+ or >5% global GDP
 * @value 300 - Conservative threshold (US, India, China, Indonesia qualify)
 * @uncertainty 100-500M (depends on definition: population vs. GDP share)
 * @notes Lower bound (100M) includes more economies; 300M focuses on largest
 */
MAJOR_ECONOMY_POPULATION_THRESHOLD: 300,
```

**Line 714:** MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD
```typescript
// BEFORE:
/**
 * Fraction of major economies collapsed to trigger global crisis
 * @research [RESEARCH NEEDED] - Systemic risk trigger threshold
 * @value 0.5 - >50% of major economies collapsed = global crisis
 */
MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD: 0.5,

// AFTER (example - use actual research values):
/**
 * Fraction of major economies collapsed to trigger global crisis
 * @research BIS Global Financial Stability: 2-3 major economies failing = systemic crisis
 * @research IMF Spillover Analysis 2024: >30% G20 GDP = global contagion
 * @value 0.5 - >50% of major economies collapsed = global crisis
 * @uncertainty 0.3-0.7 (depends on interconnection, contagion speed)
 * @notes Historical: 2008 crisis ~20% of major economies; 1930s ~60%
 */
MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD: 0.5,
```

---

## Implementation Guidelines

### Citation Format

Use this pattern for all updated parameters:
```typescript
/**
 * [PARAMETER DESCRIPTION]
 * @research [SOURCE 1: Finding with citation]
 * @research [SOURCE 2: Finding with citation]
 * @value [CURRENT VALUE] - [JUSTIFICATION]
 * @uncertainty [RANGE] - [EXPLANATION OF VARIANCE]
 * @notes [OPTIONAL: Contextual details, edge cases]
 */
PARAMETER_NAME: value,
```

### Required Fields

- **@research** - 2+ citations (format: "Finding (Author Year, Publication)")
- **@value** - Current value with brief justification
- **@uncertainty** - Range or ±% with explanation
- **@notes** (optional) - Contextual variations, historical precedents

### Value Updates

**If research suggests different value:**
1. Document rationale for change
2. Update value
3. Note old value in @notes
4. Flag for Monte Carlo validation

**If keeping current value:**
1. Justify why current value is in empirical range
2. Document uncertainty
3. Note if conservative/aggressive estimate

---

## Quality Checks

Before committing:
- [ ] All Phase 1 `[RESEARCH NEEDED]` tags removed (9 tags total)
- [ ] Every parameter has 2+ @research citations
- [ ] Citations include year and publication
- [ ] @uncertainty documented for all parameters
- [ ] No silent value changes without justification
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)

---

## Testing

**After implementation:**
1. Type check: `npx tsc --noEmit`
2. Unit tests: `npm test`
3. Monte Carlo validation: `npx tsx scripts/monteCarloSimulation.ts > logs/mc_post_config_update_20251209.log 2>&1 &`

**Regression criteria:**
- No new TypeScript errors
- All tests pass
- Monte Carlo CV < 0.01% (determinism maintained)
- Outcome distributions similar to baseline (no drastic shifts)

---

## Deliverables

1. **Updated file:** `src/simulation/config/centralConfig.ts`
2. **Git commit:**
   ```
   docs: Add peer-reviewed citations for Phase 1 config parameters

   Replace [RESEARCH NEEDED] tags with research-backed justifications for:
   - Social cohesion decay/recovery rates
   - Migration evacuation fractions
   - Economic collapse definitions

   Research: research/config_parameters_justification_20251209.md
   Validation: reviews/config_params_critique_20251209.md (Grade B+)

   No parameter values changed; only citations added.
   ```

3. **Monte Carlo log:** `logs/mc_post_config_update_20251209.log`

---

## Communication

**Implementation channel:** `.claude/chatroom/channels/implementation.md`

Post updates:
- Started implementation
- Completed section (social cohesion / migration / economic)
- Type check passed
- Tests passed
- Monte Carlo running
- Implementation complete

---

## Next Steps After Implementation

1. **Orchestrator spawns architecture-skeptic** for Quality Gate 2
2. **Monte Carlo validation** - verify no regressions
3. **Update OpenSpec metrics** - research quality C → B+
4. **Archive to docs/implementation-history/**

---

**Expected Start:** After Sylvia validation PASS (~13:00-15:00)
**Timeline:** 2 hours
**Output:** Updated centralConfig.ts with citations
