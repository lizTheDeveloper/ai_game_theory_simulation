# Research Verification: P0 - Government Baseline Parameters

**Date:** October 31, 2025
**Source:** Manual initialization parameter audit (Sylvia)
**Status:** ⚠️ NEEDS VERIFICATION
**Priority:** P0 CRITICAL (multiple unsourced parameters drive policy response throughout simulation)

---

## Summary

Multiple government baseline parameters in `src/simulation/initialization.ts` lack research backing, despite V-Dem v14 (2024) and WGI 2024 data being available. These parameters drive government behavior throughout the simulation but are currently arbitrary values.

**This requires TWO-LAYER VERIFICATION for each parameter:**

1. **Citation Existence:** Do V-Dem/WGI/Freedom House datasets provide mappable metrics?
2. **Claim Verification:** Are proposed mappings conceptually valid and empirically accurate?

---

## Current Implementation

### File: `src/simulation/initialization.ts:547-627`

All parameters below have **NO SOURCE** in current code:

```typescript
// Government baseline values - ALL UNSOURCED
controlDesire: 0.3,              // NO SOURCE
capabilityToControl: 0.5,        // NO SOURCE
surveillanceCapability: 0.3,     // NO SOURCE
actionFrequency: 0.08,           // NO SOURCE (comment says 0.5 baseline, but code uses 0.08?)
legitimacy: 0.6,                 // NO SOURCE

// Cyber defense (all 3.0) - NO SOURCE
cyberDefense: {
  securityHardening: 3.0,        // NO SOURCE
  monitoring: 3.0,               // NO SOURCE
  sandboxing: 3.0,               // NO SOURCE
  incidentResponse: 3.0          // NO SOURCE
}

// Evaluation investment - NO SOURCE
evaluationInvestment: {
  benchmarkSuite: 2.0,           // NO SOURCE
  alignmentTests: 1.0,           // NO SOURCE
  redTeaming: 0.5,               // NO SOURCE
  interpretability: 0.5          // NO SOURCE
}

// Governance quality - PARTIALLY SOURCED
// BUG #3 FIX comment mentions stochastic initialization, but NO CITATIONS for baseline values:
decisionQuality: 0.5 * (0.85 + rng() * 0.3),        // Base 0.5, NO SOURCE
transparency: 0.6 * (0.85 + rng() * 0.3),           // Base 0.6, NO SOURCE
participationRate: 0.4 * (0.8 + rng() * 0.4),       // Base 0.4, NO SOURCE
institutionalCapacity: 0.6 * (0.8 + rng() * 0.4)    // Base 0.6, NO SOURCE (CRITICAL for ecology)
```

---

## Proposed Mappings from V-Dem/WGI/Freedom House

### Group 1: Democratic Quality Metrics (V-Dem Mappings)

#### controlDesire → V-Dem "State authority over society" (v2xps_party)
**V-Dem Indicator:** Party institutionalization / State control
**Proposed Mapping:**
```typescript
controlDesire: 0.45,  // V-Dem v14 (2024): Global average state authority over society
// Democracies: 0.2-0.4, Autocracies: 0.6-0.9, Weighted global: ~0.45
```

**Verification Needed:**
- [ ] Is "controlDesire" conceptually aligned with V-Dem's state authority measures?
- [ ] What is the weighted global average for 2024?
- [ ] Should we use median democracy (0.3) instead of global average?

---

#### surveillanceCapability → Freedom House "Surveillance of Private Discussions" (D3)
**Freedom House Indicator:** Privacy rights, surveillance score
**Proposed Mapping:**
```typescript
surveillanceCapability: 0.4,  // Freedom House (2024): Global average surveillance capability
// Inverted from privacy score: 1 - (privacy/4) = surveillance capability
```

**Verification Needed:**
- [ ] Is surveillanceCapability [0-1] or different scale?
- [ ] How to map Freedom House D3 score to simulation scale?
- [ ] Should we use technical capability (available tech) or actual deployment?

**Alternative:** Use number of surveillance cameras per capita, internet monitoring capabilities

---

#### legitimacy → V-Dem "Government legitimacy" (v2exl_legitperf)
**V-Dem Indicator:** Government performance legitimacy
**Proposed Mapping:**
```typescript
legitimacy: 0.55,  // V-Dem v14 (2024): Global average government legitimacy
// Range: 0 (no legitimacy) to 1 (full legitimacy)
```

**Verification Needed:**
- [ ] Does V-Dem have a direct legitimacy indicator?
- [ ] Should we combine multiple indicators (performance + procedural legitimacy)?
- [ ] What is global weighted average for 2024?

---

### Group 2: State Capacity Metrics (WGI Mappings)

#### capabilityToControl → WGI "Government Effectiveness"
**WGI Indicator:** Government effectiveness (bureaucratic quality, service delivery)
**Proposed Mapping:**
```typescript
capabilityToControl: 0.5,  // WGI (2024): Global mean government effectiveness
// WGI scale: -2.5 to +2.5, normalize to [0-1]: (WGI + 2.5) / 5
```

**Verification Needed:**
- [ ] Is "capabilityToControl" = state capacity, or something more specific?
- [ ] WGI global mean is ~0 (by design), so normalized would be 0.5 - is this correct?
- [ ] Should we use government effectiveness, or regulatory quality, or both?

---

#### decisionQuality → WGI "Government Effectiveness" + V-Dem "Deliberative component"
**Combined Indicator:** State capacity × democratic deliberation quality
**Proposed Mapping:**
```typescript
decisionQuality: 0.48,  // WGI Gov Effectiveness (2024) × V-Dem Deliberative Index
// Current: 0.5 base (arbitrary), Proposed: 0.48 (data-backed)
```

**Verification Needed:**
- [ ] Should decisionQuality combine effectiveness + deliberation?
- [ ] Or should it purely be technocratic quality (effectiveness only)?
- [ ] What is the correct multiplicative vs additive combination?

---

#### institutionalCapacity → WGI "Government Effectiveness"
**WGI Indicator:** Same as capabilityToControl, but focused on institutional resources
**Proposed Mapping:**
```typescript
institutionalCapacity: 0.52,  // WGI (2024): Government Effectiveness, slight positive
// Current: 0.6 base (arbitrary), Proposed: 0.52 (data-backed)
// NOTE: CRITICAL for ecology system
```

**Verification Needed:**
- [ ] Is institutionalCapacity different from capabilityToControl?
- [ ] Should it be WGI "Regulatory Quality" instead?
- [ ] Why is baseline 0.6 when WGI global mean is ~0 (normalized 0.5)?

---

### Group 3: Democratic Process Metrics (V-Dem Mappings)

#### transparency → V-Dem "Transparency" (v2x_pubcorr, v2xlg_legcon)
**V-Dem Indicators:** Public sector corruption (inverted), legislative constraints
**Proposed Mapping:**
```typescript
transparency: 0.45,  // V-Dem v14 (2024): 1 - public sector corruption index
// Current: 0.6 base (arbitrary), Proposed: 0.45 (data-backed, more realistic)
```

**Verification Needed:**
- [ ] Should transparency = (1 - corruption), or use V-Dem's transparency index directly?
- [ ] What is global weighted average for 2024?
- [ ] Does "transparency" mean gov openness, or anti-corruption, or both?

---

#### participationRate → V-Dem "Electoral participation" (v2x_partip)
**V-Dem Indicator:** Political participation index (voting, civil society)
**Proposed Mapping:**
```typescript
participationRate: 0.55,  // V-Dem v14 (2024): Global average political participation
// Current: 0.4 base (arbitrary), Proposed: 0.55 (data-backed)
```

**Verification Needed:**
- [ ] Is participationRate about elections only, or broader civic engagement?
- [ ] Should we use voter turnout (%), or V-Dem's broader participation index?
- [ ] What is global weighted average for 2024?

---

### Group 4: Technical Capabilities (NO DIRECT DATA SOURCES)

#### Cyber Defense Metrics (securityHardening, monitoring, sandboxing, incidentResponse)
**Problem:** No global government cybersecurity capability index exists

**Possible Proxies:**
1. **ITU Global Cybersecurity Index (GCI)** - Country cybersecurity commitment scores
2. **National Cyber Power Index (Harvard)** - Military/offensive cyber capabilities
3. **Expert judgment** - No empirical data available

**Current Values:** All 3.0 (scale unclear - out of what?)

**Proposed Approach:**
```typescript
cyberDefense: {
  // PLACEHOLDER: No global government cybersecurity capability data exists
  // Scale: 0-10 (arbitrary, where 3.0 = moderate baseline capability)
  securityHardening: 3.0,   // PLACEHOLDER: ITU GCI average ~50/100 → 5.0/10?
  monitoring: 3.0,          // PLACEHOLDER: No data
  sandboxing: 3.0,          // PLACEHOLDER: No data
  incidentResponse: 3.0     // PLACEHOLDER: No data
}
```

**Verification Needed:**
- [ ] What scale is 0-10? 0-5? Arbitrary?
- [ ] Can ITU GCI be mapped to these specific dimensions?
- [ ] Should we label as PLACEHOLDER until better data exists?

---

#### Evaluation Investment Metrics (benchmarkSuite, alignmentTests, redTeaming, interpretability)
**Problem:** No data on government AI evaluation spending exists (too nascent)

**Current Values:** 2.0, 1.0, 0.5, 0.5 (scale unclear)

**Proposed Approach:**
```typescript
evaluationInvestment: {
  // PLACEHOLDER: No 2024 data on government AI evaluation capabilities
  // Treat as DESIGN CHOICE for simulation starting conditions
  benchmarkSuite: 2.0,      // PLACEHOLDER: Moderate baseline
  alignmentTests: 1.0,      // PLACEHOLDER: Emerging
  redTeaming: 0.5,          // PLACEHOLDER: Rare
  interpretability: 0.5     // PLACEHOLDER: Rare
}
```

**Verification Needed:**
- [ ] Label these explicitly as DESIGN CHOICE (no data exists)?
- [ ] Or try to infer from AI lab spending + government R&D budgets?
- [ ] What scale? Is 2.0 "moderate" or "high"?

---

#### actionFrequency
**Problem:** What does this even mean? Frequency of policy actions?

**Current Value:** 0.08 (but comment says "0.5 baseline"?)

**Verification Needed:**
- [ ] What is actionFrequency? Policies per month? Probability of action?
- [ ] Why does comment say 0.5 but code uses 0.08?
- [ ] Is there any empirical data on government policy action frequency?

**Possible Sources:**
- Legislative activity databases (bills passed per month)
- Executive orders / policy implementation timelines
- Or is this a game balance parameter (no empirical mapping)?

---

## Impact Analysis

### Quantitative Impact

**If we replace arbitrary values with V-Dem/WGI data:**
- Some values increase (participationRate: 0.4 → 0.55)
- Some decrease (transparency: 0.6 → 0.45, institutionalCapacity: 0.6 → 0.52)
- Overall: More realistic variance, less optimistic baseline

**Simulation consequences:**
- Government policy responses calibrated to real state capacity
- Democratic vs authoritarian differences grounded in data
- Less "magic government solves everything" behavior
- More realistic institutional constraints

### Qualitative Impact

**Before fix:** Government baselines are arbitrary "moderate" values (0.3-0.6 range)
**After fix:** Government baselines reflect actual 2024 state capacity/democracy levels

This is the difference between:
- **Old:** Generic "moderate democracy" placeholder
- **New:** Empirically grounded state capacity and democratic quality

---

## Research Verification Priority

**PRIORITY 1 (Straightforward V-Dem/WGI Mapping):**
1. legitimacy → V-Dem government legitimacy
2. transparency → V-Dem corruption index (inverted)
3. participationRate → V-Dem political participation
4. institutionalCapacity → WGI government effectiveness
5. decisionQuality → WGI + V-Dem combined

**PRIORITY 2 (Conceptual Mapping Needed):**
6. controlDesire → V-Dem state authority (need conceptual validation)
7. capabilityToControl → WGI effectiveness (vs institutionalCapacity - same thing?)
8. surveillanceCapability → Freedom House privacy (inverted) or tech capability?

**PRIORITY 3 (No Data - Explicit Placeholder Labels):**
9. cyberDefense metrics → No data, label as PLACEHOLDER or use ITU GCI proxy
10. evaluationInvestment metrics → No data, label as DESIGN CHOICE
11. actionFrequency → Unclear definition, investigate code usage first

---

## Expected Deliverables

### From super-alignment-researcher (Cynthia):
1. **V-Dem v14 (2024) data:**
   - Government legitimacy global average
   - Transparency / corruption index global average
   - Political participation global average
   - State authority over society global average
2. **WGI 2024 data:**
   - Government effectiveness global mean (normalized to [0-1])
   - Regulatory quality global mean
3. **Freedom House 2024 data:**
   - Surveillance/privacy scores global average
4. **ITU GCI 2024 (if available):**
   - Global cybersecurity index scores

### From research-skeptic (me):
1. **Conceptual validation:** Do proposed mappings make sense?
2. **Scale validation:** Are normalizations correct ([0-1] vs other scales)?
3. **Identify orphans:** Which parameters have NO empirical data (label as placeholders)?
4. **Final recommendations:** Specific values with full justification

---

## Success Criteria

**VERIFIED:** V-Dem/WGI data mapped to parameters with clear conceptual justification.

**PARTIAL:** Some parameters mappable, others need to be labeled PLACEHOLDER/DESIGN CHOICE.

**UNVERIFIED:** Conceptual mapping unclear, or data doesn't support proposed values.

**REJECTED:** Current arbitrary values are actually intentional design choices (document why).

---

## Open Questions

1. **capabilityToControl vs institutionalCapacity:** Are these the same thing? Should both use WGI effectiveness?
2. **actionFrequency:** What does this mean? Is 0.08 vs 0.5 comment a bug?
3. **Cyber defense:** Should we use ITU GCI proxy, or explicitly label as PLACEHOLDER?
4. **Evaluation investment:** Design choice or empirical? No 2024 data exists.
5. **Scale definitions:** Need to audit all scales (some [0-1], some [0-10]?, unclear)

---

## Timeline

**Created:** October 31, 2025 (Sylvia - research skeptic, from manual audit)
**Priority:** P0 CRITICAL (government baselines drive policy response throughout simulation)
**Complexity:** HIGH (11 parameters, multiple data sources, conceptual mapping challenges)
**Next Step:** Orchestrator assigns to super-alignment-researcher (Cynthia) for V-Dem/WGI data extraction

---

## Notes

- **Audit Context:** Found during systematic initialization parameter audit (40-50% of parameters lack sources)
- **Gold Standard Example:** `src/simulation/government/initialization.ts` properly cites V-Dem/WGI in package
- **Inconsistency:** Government system package uses V-Dem/WGI, but initialization.ts doesn't - why?
- **Monte Carlo Impact:** Should test sensitivity to these baselines (do small changes affect outcomes?)

**Sylvia's Assessment:** This is the most complex P0 fix:
- 11 parameters to verify (not 1-3 like other P0 issues)
- Mix of empirical data (V-Dem/WGI) and placeholders (cyber, evaluation)
- Conceptual mapping challenges (controlDesire → which V-Dem metric?)
- Scale normalization required ([0-1] vs [-2.5, +2.5] vs [0-10])

**Recommend:** Break this into sub-tasks:
1. Phase 1: V-Dem/WGI parameters (legitimacy, transparency, participation, capacity) - straightforward
2. Phase 2: Conceptual mappings (controlDesire, surveillance, capability) - needs validation
3. Phase 3: Orphans (cyber, evaluation) - label as PLACEHOLDER or find proxies
