# Organizations Now Affect Research & Crises

**Date:** October 9, 2025  
**Status:** ✅ IMPLEMENTED

## Problem

Organizations (companies) were passive entities - they didn't:
1. Contribute to breakthrough technology research
2. Amplify technological risks based on their priorities

This made them feel like decoration rather than active participants in the simulation.

## Solution

### 1. Private Research Contributions (`breakthroughTechnologies.ts`)

Companies now contribute research funding based on their priorities:

```typescript
const researchBudget = org.monthlyRevenue * 0.1 * safetyFocus * (1 - profitFocus * 0.5);
```

**Key mechanics:**
- **Safety-focused companies** (Anthropic: `safetyResearch: 0.95`) contribute MORE
- **Profit-focused companies** (OpenAI: `profitMaximization: 0.7`) contribute LESS
- Budget allocated across environmental, social, medical categories
- Crisis-responsive: more funding to crisis-relevant tech

**Example contributions:**
- **Anthropic** (revenue $3M, safety 0.95, profit 0.4):
  - Research: $3M × 0.1 × 0.95 × (1 - 0.2) = **$0.228M/month**
- **OpenAI** (revenue $10M, safety 0.6, profit 0.7):
  - Research: $10M × 0.1 × 0.6 × (1 - 0.35) = **$0.39M/month**
- **Meta** (revenue $30M, safety 0.7, profit 0.6):
  - Research: $30M × 0.1 × 0.7 × (1 - 0.3) = **$1.47M/month**

Total private research: ~$2-3M/month (vs government $10-30B/month base)

### 2. Organizations Amplify Risks (`technologicalRisk.ts`)

#### Misalignment Risk Amplification

Reckless racing companies increase risk:

```typescript
const racingOrgs = state.organizations.filter(o => 
  o.type === 'private' && 
  (o.priorities.capabilityRace > 0.8 || o.priorities.safetyResearch < 0.4)
);
if (racingOrgs.length > 2) misalignmentRate += 0.005 * racingOrgs.length;
```

**Triggers:**
- `capabilityRace > 0.8` (OpenAI: 0.9, Google: 0.85)
- `safetyResearch < 0.4` (none by default, but possible)

**Effect:**
- 3+ racing orgs → +0.015/month misalignment
- Compounds over time → faster path to control loss

#### Safety Debt Amplification

Profit-maximizing companies worsen safety debt:

```typescript
const unsafeOrgs = state.organizations.filter(o =>
  o.type === 'private' &&
  o.priorities.profitMaximization > 0.8 &&
  o.priorities.safetyResearch < 0.5
);
if (unsafeOrgs.length > 0) {
  safetyGap += 0.003 * unsafeOrgs.length;
}
```

**Triggers:**
- `profitMaximization > 0.8` (possible with market pressure)
- `safetyResearch < 0.5` (Google: 0.5, borderline)

**Effect:**
- Each unsafe org → +0.003/month safety gap
- Faster accumulation of unaddressed safety issues

## Expected Outcomes

### Positive Path (Safety-Focused)
1. Anthropic + safety-focused orgs contribute to breakthrough research
2. More diverse funding → faster tech unlocks
3. Reduces government burden
4. Higher chance of Utopia

### Negative Path (Profit-Racing)
1. OpenAI, Google, Meta race on capabilities
2. Misalignment risk accelerates
3. Safety debt accumulates faster
4. Higher chance of Control Loss / Corporate Dystopia

### Mixed Path (Realistic)
- Some companies help (Anthropic, Academic)
- Some companies harm (depending on market pressure)
- Balance depends on regulation, competition, crisis state

## Balance Considerations

**Private research is small** (~$2-3M vs $10-30B government) because:
- Most corporate research is proprietary/product-focused
- Breakthrough tech is public goods (market failure)
- Government has ~1000x larger budget capacity

**Risk amplification is modest** (+0.003-0.015/month) because:
- Baseline risks already exist
- This amplifies existing dynamics
- Not intended to dominate outcomes

## Next Steps

- [ ] Test with Monte Carlo (currently running)
- [ ] Check if private research contributions are too small/large
- [ ] Verify risk amplification creates meaningful divergence
- [ ] Consider adding org-specific breakthrough tech (e.g. DeepMind → biology)
- [ ] Add government actions to incentivize safe org behavior

---

**Lines changed:** ~70  
**Files modified:** 2 (`breakthroughTechnologies.ts`, `technologicalRisk.ts`)  
**Complexity added:** Medium (new calculations, crisis-responsive logic)

