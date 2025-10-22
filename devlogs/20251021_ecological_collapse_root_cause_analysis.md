# Ecological Collapse Root Cause Analysis (Oct 21, 2025)

## TL;DR - The Problem

**Democracy recovered to 50.3/100, Ecology collapsed to 1.3/100** - Why?

**ROOT CAUSE:** Emergency response system **has no environmental crisis handler**.

## The Pattern That Worked for Democracy

**FIX #13 (Democracy Recovery):**
1. Emergency response timing penalty adjusted: 0.25 → 6.0 (24× more forgiving)
2. Severity changed from penalty → bonus (mobilization)
3. **Result:** Western Liberal 2/100 → 50.3/100 (25× improvement)

**Why it worked:**
- Emergency responses now have >50% effectiveness
- Effectiveness >50% triggers Tier 1 democracy recovery bonuses
- Successful crisis response → institutional strengthening → civil liberties recovery

## The Gap in Ecology

### Emergency Response Crisis Types (EmergencyResponsePhase.ts:237)

**Handled:**
- ✅ `pandemic` - Reduces severity, spread rate
- ✅ `climate` - Improves old planetary boundary fields (lines 264-283)
- ✅ `economic` - Stabilizes QoL, unemployment
- ✅ `social` - Repairs trust in AI, institutions
- ✅ `technological` - Improves AI oversight
- ✅ `nuclear` - Reduces fallout, nuclear winter

**NOT Handled:**
- ❌ `environmental` - **NO CASE EXISTS**
- ❌ Specific planetary boundary crises (phosphorus, freshwater, biodiversity, etc.)

### Why Climate Case Doesn't Help

The `climate` emergency response (lines 264-283) does this:

```typescript
case 'climate':
  // Improve planetary boundaries slightly
  if (state.planetaryBoundaries) {
    if (state.planetaryBoundaries.freshwater < 0.5) {
      state.planetaryBoundaries.freshwater = Math.min(0.7, state.planetaryBoundaries.freshwater + recoveryBonus);
    }
    if (state.planetaryBoundaries.phosphorus < 0.5) {
      state.planetaryBoundaries.phosphorus = Math.min(0.7, state.planetaryBoundaries.phosphorus + recoveryBonus);
    }
  }
```

**Problem:** These are **OLD state fields** (`state.planetaryBoundaries`).

**Current system uses:** `state.planetaryBoundariesSystem.boundaries.freshwater_change` (new structure)

## The Ecological Scoring System

### How Ecological Score is Calculated (MultiParadigmDUIUpdatePhase.ts:214)

**4 indicators (geometric mean):**
1. **Planetary Boundaries (50%)**: `calculateProgressiveEcologicalScore(state)`
2. **Resource Depletion (25%)**: `100 - resourceDepletion`
3. **Climate Stability (15%)**: `100 - (temperatureAnomaly / 2.0) * 100`
4. **Pollution (10%)**: `100 - pollutionLevel`

### Progressive Ecological Score (planetaryBoundaryRecovery.ts:510)

**Impact-weighted scoring:**
- Biosphere integrity: 25% weight
- Climate change: 25% weight
- Freshwater: 15% weight
- Ocean acidification: 15% weight
- Biogeochemical flows (P/N): 10% weight
- Land system: 5% weight
- Novel entities (PFAS): 3% weight
- Atmospheric aerosols: 2% weight

**Score based on recovery progress, NOT current state:**
- Climate: 0-100 based on `recoveryMonths / 24`
- Freshwater: 0-100 based on `recoveryMonths / 180`
- Biosphere: Max 25 (stabilization only, never full recovery)
- Ocean acidification: Max 40 (deep ocean permanent damage)
- Novel entities: Max 20 (existing contamination permanent)

### Why Recovery Isn't Happening

**Recovery requirements** (planetaryBoundaryRecovery.ts):

**Climate recovery (lines 162-210):**
- Requires: `globalWarming < 1.5°C` AND `netEmissions < 0`
- Counter: `boundary.recoveryMonths++` when both conditions met
- Un-breach: After 24 months sustained

**Freshwater recovery (lines 69-104):**
- Requires: `currentValue < boundaryThreshold` (un-breached)
- Counter: `boundary.recoveryMonths++` when improving
- Un-breach: After 180 months sustained

**Problem:** Boundaries are breached and STAY breached. No emergency response mechanism to:
1. Deploy environmental technologies (TIER 1 techs)
2. Accelerate recovery timelines
3. Boost governance capacity for environmental coordination

## Comparison: Democracy vs Ecology

### Democracy Recovery Pathway (WORKS ✅)

**Phase 1: Crisis Detection**
→ Western Liberal drops below threshold
→ Government detects "social unrest" or similar
→ Deploys emergency response

**Phase 2: Emergency Response (FIX #13)**
→ Effectiveness >50% (timing penalty adjusted)
→ Triggers Tier 1 recovery bonuses

**Phase 3: Institutional Strengthening (EmergencyResponsePhase.ts:331-356)**
→ Institutional capacity +5%/month
→ Transparency +3%/month
→ Legitimacy +4%/month

**Phase 4: Component Recovery (DemocracyDynamicsPhase.ts)**
→ Electoral democracy improves
→ Civil liberties partially recover
→ Rule of law strengthens

**Result:** Western Liberal 2/100 → 50.3/100

### Ecology Recovery Pathway (BROKEN ❌)

**Phase 1: Crisis Detection**
→ Planetary boundaries breach
→ Ecological paradigm drops
→ ??? (No emergency response deployed for environment)

**Phase 2: Emergency Response**
→ **NONE** - No environmental crisis handler
→ Climate case exists but uses OLD state fields
→ No recovery bonuses triggered

**Phase 3: Technology Deployment**
→ TIER 1 environmental technologies exist (phosphorus recovery, desalination, etc.)
→ BUT: Not automatically deployed during environmental emergencies
→ Only deployed through normal research/breakthrough system

**Phase 4: Boundary Recovery**
→ Requires sustained un-breach (180 months for freshwater, 24 for climate)
→ BUT: No mechanism to get boundaries un-breached in the first place
→ Geometric mean crushing (one bad boundary crushes entire score)

**Result:** Ecological paradigm stays collapsed at 1.3/100

## The Fix Hypothesis

**Apply the democracy recovery pattern to ecology:**

**Add `case 'environmental':` to EmergencyResponsePhase.ts**

**What it should do:**
1. **Deploy environmental technologies** (if available and not deployed)
   - Phosphorus recovery (if boundary breached)
   - Advanced desalination (if freshwater breached)
   - PFAS remediation (if novel entities breached)

2. **Boost recovery progress** (similar to democracy's institutional capacity boost)
   - Accelerate `boundary.recoveryMonths` counter
   - Effectiveness >50% → +2-5 months recovery credit per month

3. **Improve governance capacity for environment**
   - International cooperation (critical for climate, oceans)
   - Environmental regulation enforcement
   - Technology deployment coordination

**Research questions:**
1. How effective are emergency environmental responses historically?
   - Montreal Protocol (ozone): Very effective
   - Paris Agreement (climate): Slow, limited effectiveness
   - Clean Water Act (USA freshwater): Mixed results

2. What's the realistic timeline acceleration?
   - Emergency mobilization can cut timelines 2-5× (WWII production, COVID vaccine)
   - Conservative: 2× acceleration (reduce 180 months → 90 months)

3. What prevents environmental emergency responses?
   - Political will (tragedy of commons)
   - International coordination (climate requires global action)
   - Technology availability (can't deploy what doesn't exist)

## Next Steps

**Phase 1B (COMPLETE):** Root cause identified ✅

**Phase 1C (NEXT):** Compare mechanisms
- Democracy: Emergency response → institutional strengthening → component recovery
- Ecology: **MISSING** emergency response handler

**Phase 2A (RESEARCH):** Find peer-reviewed sources on:
1. Environmental emergency response effectiveness (Montreal Protocol, etc.)
2. Crisis mobilization timeline acceleration (WWII, COVID)
3. Governance requirements for environmental recovery

**Phase 2B (VALIDATION):** Research-skeptic review of proposed parameters

**Phase 3A (IMPLEMENTATION):** Add environmental emergency response case

**Phase 3B (VALIDATION):** N=100 Monte Carlo to verify fix

## Diagnostic Monte Carlo Status

**Running:** N=20, 240 months
**Purpose:** Capture baseline ecological collapse patterns
**ETA:** ~2-3 hours from start (4:30pm PT)

**Check status:**
```bash
tail -100 logs/mc_ecological_diagnosis_*.log
```

## Files to Examine

**Emergency Response System:**
- `src/simulation/engine/phases/EmergencyResponsePhase.ts` (lines 237-419)
- `src/simulation/emergencyManagement.ts` (timing penalty logic)

**Ecological Scoring:**
- `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (lines 214-243)
- `src/simulation/planetaryBoundaryRecovery.ts` (recovery mechanics)

**Democracy Recovery (WORKING EXAMPLE):**
- `src/simulation/engine/phases/EmergencyResponsePhase.ts` (lines 331-356)
- `src/simulation/engine/phases/DemocracyDynamicsPhase.ts` (Tier 2 recovery)

## Key Insight

**The democracy fix (FIX #13) created a recovery pathway:**
Emergency response effectiveness → institutional strengthening → democracy component recovery

**Ecology needs the same pathway:**
Emergency response effectiveness → technology deployment + recovery acceleration → boundary un-breach → ecological recovery

**Without emergency response, boundaries stay breached indefinitely.**
