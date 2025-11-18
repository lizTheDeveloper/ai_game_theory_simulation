# Research Verification: Energy-Constrained Cleanup Model (Commit bfdc4b7)

**Commit:** bfdc4b7ffce945bfbdf718f0e7f32b0b0f488c7c
**Date:** November 17, 2025
**Feature:** Phase 2B implementation of irreversibility framework - Energy-constrained cleanup with rebound effects

**Files Changed:**
- `src/simulation/utils/energyConstrainedCleanup.ts` (NEW - 261 lines)
- `src/types/planetaryBoundaries.ts` (added fields)
- `src/types/technologies.ts` (added fields)
- `src/types/technology.ts` (added fields)

---

## Verification Status

**Overall Status:** ⚠️ NEEDS RESEARCH VALIDATION

This file documents specific claims made in code/comments that require two-layer verification:
1. **Citation existence:** Do cited papers actually exist with correct authors/years/titles?
2. **Claim accuracy:** Does the paper ACTUALLY support the specific claim made?

---

## Citation 1: EPA (2024) - PFAS Destruction Energy Requirements

### Code Location
`src/simulation/utils/energyConstrainedCleanup.ts:9-10`

### Exact Claim in Code
```typescript
/**
 * Research backing:
 * - EPA (2024): PFAS destruction requires 50-100 GJ/ton
```

### Specific Claims to Verify

**Claim:** PFAS destruction requires 50-100 GJ/ton

**What needs verification:**
1. **Citation existence:** Is there an EPA 2024 document discussing PFAS destruction energy?
2. **Claim accuracy:** Does it provide the specific range 50-100 GJ/ton?
3. **Method context:** Is this for thermal destruction, electrochemical, or both?
4. **Concentration context:** Is this energy requirement at concentrated waste levels (mg/L) or environmental levels (ng/L)?

**Additional code usage:**
- Line 158: `const requiredEnergyGJ = tech.cleanupEnergyRequirement * estimatedContaminationTons;`
- Uses this value to calculate energy gate for cleanup effectiveness

**Expected outcome from validation:**
- Confirm EPA source exists and provides this specific range
- OR identify actual source (may be different EPA document, different year, or different agency)
- OR flag as UNVERIFIED if claim unsupported

---

## Citation 2: Cousins et al. (2022) - Concentration Gap

### Code Location
`src/simulation/utils/energyConstrainedCleanup.ts:10`

### Exact Claim in Code
```typescript
/**
 * Research backing:
 * - Cousins et al. (2022): 6-9 orders of magnitude concentration gap (ng/L → mg/L)
```

### Specific Claims to Verify

**Claim:** 6-9 orders of magnitude concentration gap (ng/L → mg/L)

**What needs verification:**
1. **Citation existence:** Is this the "Outside the Safe Operating Space" paper in Environmental Science & Technology?
2. **Claim accuracy:** Does Cousins 2022 actually quantify the concentration gap as 6-9 orders of magnitude?
3. **Specific values:** Does the paper provide specific contamination levels:
   - Tibetan Plateau rainwater: 55 pg/L (claimed in code line 42)
   - Surface water median: 100 ng/L (claimed in code line 45)
   - Groundwater median: 500 ng/L (claimed in code line 48-49)
   - Technology demonstration level: 1000 mg/L (claimed in code line 52)

**Additional code usage:**
- Lines 41-59: `CONTAMINATION_LEVELS` constant with specific values
- Line 116: `const concentrationGap = assertFinite(contaminationLevel.gap, {...})`
- Line 123: `const concentrationFactor = assertFinite(Math.pow(1 / concentrationGap, 0.5), {...})`

**Expected outcome from validation:**
- Quote specific passages from Cousins 2022 supporting concentration values
- OR identify if values are from different source (EPA 2024, other papers)
- OR flag as DERIVED if values are calculated from Cousins data but not explicitly stated

---

## Citation 3: arXiv (2025) - Jevons Paradox in E-Waste

### Code Location
`src/simulation/utils/energyConstrainedCleanup.ts:11`

### Exact Claim in Code
```typescript
/**
 * Research backing:
 * - arXiv (2025): Jevons paradox in AI e-waste - efficiency may increase consumption
```

### Specific Claims to Verify

**Claim:** Jevons paradox in AI e-waste - efficiency may increase consumption

**What needs verification:**
1. **Citation existence:** Is there a 2025 arXiv paper on Jevons paradox in AI e-waste?
2. **Claim accuracy:** Does the paper discuss CLEANUP efficiency enabling increased PRODUCTION?
3. **Transfer validity:** The code applies this to environmental cleanup (PFAS, microplastics). Does the paper justify this analogy?
4. **Quantification:** Does the paper provide a rebound coefficient value or range?

**Additional code usage:**
- Lines 197-217: Rebound effect calculation
- Line 206: `coefficient = tech.reboundCoefficient;` (default value not from paper)
- Line 219: `rebound = assertFinite(constrainedEffectiveness * coefficient, {...})`

**Expected outcome from validation:**
- Confirm arXiv paper exists (provide arXiv ID)
- Quote specific passage about efficiency → increased consumption
- Assess whether e-waste Jevons paradox validly transfers to environmental cleanup
- OR flag as ANALOGY if transfer is reasonable but not directly supported
- OR flag as UNVERIFIED if paper doesn't support cleanup-production dynamics

---

## Citation 4: Sörengård et al. (2024) - Energy Trap Economics

### Code Location
`src/simulation/utils/energyConstrainedCleanup.ts:12`

### Exact Claim in Code
```typescript
/**
 * Research backing:
 * - Sörengård et al. (2024): Energy trap economics ($20-7,000T/year for global PFAS cleanup)
```

### Specific Claims to Verify

**Claim:** $20-7,000 trillion/year for global PFAS cleanup

**What needs verification:**
1. **Citation existence:** Is there a Sörengård et al. 2024 paper on PFAS cleanup costs?
2. **Claim accuracy:** Does it provide the specific cost range $20-7,000T/year?
3. **Assumptions:** What contamination mass and cleanup rate assumptions underlie this estimate?
4. **GDP comparison:** Code comment claims "0.2-66× global GDP" - is this calculation accurate?

**Additional code usage:**
- Not directly used in calculations (cited for economic context only)
- Justifies why energy constraint matters (cleanup may be economically infeasible)

**Expected outcome from validation:**
- Confirm Sörengård 2024 paper exists
- Quote specific passage with cost estimate
- Verify assumptions (global contamination mass, cleanup method, timeline)
- OR identify if cost range is from different source (Ling 2024, other papers)

---

## Cross-Reference with Existing Research

### Novel Entities Research Directory

Check existing research files for these citations:
- `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 sources)
- `research/novel_entities_irreversibility_20251116.md`
- `research/montreal_protocol_prevention_effectiveness_20251115.md` (484 lines, 15+ sources)

**Known verified sources from prior work:**
- ✅ Cousins et al. (2022) - "Outside the Safe Operating Space..." - VERIFIED in prior research
- ✅ Ling et al. (2024) - Energy trap economics - VERIFIED (Science of the Total Environment)
- ⚠️ EPA (2024) - NOT in prior research files (NEW citation)
- ⚠️ Sörengård et al. (2024) - NOT in prior research files (NEW citation)
- ⚠️ arXiv (2025) - NOT in prior research files (NEW citation)

### Potential Source Confusion

**Hypothesis:** Some citations may be from different papers than claimed

**Ling et al. (2024) overlap:**
- Ling paper discusses energy costs ($20-7,000T/year range)
- May be source for "Sörengård et al. 2024" cost estimate
- VERIFY: Are Sörengård et al. co-authors on Ling 2024 paper?

**EPA vs Li et al. (2024) confusion:**
- Li et al. 2024 discusses electrochemical destruction energy (5-7 kWh/m³)
- May need conversion to GJ/ton for comparison
- VERIFY: Is EPA 2024 actually Li 2024 or other electrochemical paper?

---

## Derived Parameters (Not Directly Cited)

### Power Law Exponent (Line 123)

**Code:**
```typescript
const concentrationFactor = assertFinite(Math.pow(1 / concentrationGap, 0.5), {...})
```

**Claim:** Effectiveness scales as `(1 / gap)^0.5` (power law with exponent 0.5)

**Status:** ⚠️ DERIVED ASSUMPTION
- NOT directly cited from any paper
- May be engineering estimate or theoretical model
- NEEDS JUSTIFICATION: Why exponent 0.5 instead of 0.3, 0.7, or 1.0?

**Sensitivity:**
- Exponent 0.3: Gap 10^6 → 4% effectiveness (more optimistic)
- Exponent 0.5: Gap 10^6 → 0.1% effectiveness (baseline)
- Exponent 1.0: Gap 10^6 → 0.0001% effectiveness (more pessimistic)

### Contamination Mass Estimate (Line 157)

**Code:**
```typescript
const estimatedContaminationTons = boundary.currentValue * 1e6;
```

**Claim:** boundary.value 1.0 ≈ 1 million tons contamination

**Status:** ⚠️ PLACEHOLDER ASSUMPTION
- Code comment explicitly flags this: "placeholder for empirical data"
- NEEDS RESEARCH: What is actual global PFAS/microplastic contamination mass?
- CRITICAL for energy requirement calculation accuracy

---

## Validation Workflow

### Phase 1: Citation Existence (Research-Skeptic Task)

For each citation:
1. Search Google Scholar for paper
2. Verify authors, year, title, journal match claim
3. Obtain DOI and verify paper is accessible
4. Flag phantom citations (paper doesn't exist)

### Phase 2: Claim Verification (Research-Skeptic Task)

For each verified citation:
1. Read full text (or relevant sections)
2. Search for specific values claimed in code (50-100 GJ/ton, 6-9 orders, etc.)
3. Quote exact passage supporting claim
4. Assess strength of support:
   - **STRONG:** Paper explicitly states value with same context
   - **MODERATE:** Paper provides data, but value requires calculation
   - **WEAK:** Paper discusses topic, but value is extrapolated
   - **UNSUPPORTED:** Paper doesn't support claim

### Phase 3: Alternative Source Identification

For unsupported claims:
1. Search for alternative sources that DO support the claim
2. Update code citations to correct source
3. Document original vs corrected citation

---

## Expected Orchestrator Workflow

### Starting Point: VALIDATION Phase

This verification file provides the research spec. Orchestrator should:

1. **Skip research phase** (research file already exists)
2. **Start at validation phase:**
   - Spawn `research-skeptic` agent
   - Task: Validate all 4 citations (existence + claim accuracy)
   - Deliverable: Updated verification file with findings
3. **Proceed to implementation phase** (if needed):
   - If citations are invalid: Update code comments with corrected sources
   - If parameters are unsupported: Add uncertainty flags or remove claims
4. **Architecture review** (Quality Gate 2)
5. **Documentation update** (wiki reflects verification findings)

---

## Success Criteria

**Minimum acceptable outcome:**
- All 4 citations verified as existing (no phantom papers)
- At least 2/4 claims have STRONG support (direct quotes from papers)
- Remaining claims flagged with uncertainty level (MODERATE/WEAK/UNSUPPORTED)
- Derived parameters documented with justification or flagged as HIGH UNCERTAINTY

**Ideal outcome:**
- All 4 citations verified with STRONG support
- Specific concentration values confirmed from primary sources
- Power law exponent justified from theory or empirical data
- Contamination mass estimate replaced with research-backed value

---

## Notes for Research-Skeptic

**Common issues to watch for:**
1. **Year confusion:** EPA reports from different years (2023, 2024, 2025)
2. **Author attribution:** Co-authors sometimes misattributed as primary authors
3. **Value units:** Energy in kWh/m³ vs GJ/ton (conversion required)
4. **Concentration context:** Lab scale (mg/L) vs environmental scale (ng/L)
5. **Analogy transfer:** E-waste Jevons paradox → environmental cleanup (valid?)

**Red flags:**
- ❌ "arXiv (2025)" without paper ID (too vague)
- ❌ "EPA (2024)" without specific report title (many EPA docs)
- ❌ Specific values (55 pg/L, 500 ng/L) without page numbers
- ❌ Power law exponent (0.5) without theoretical justification

---

**Verification file created:** November 17, 2025
**Commit to verify:** bfdc4b7ffce945bfbdf718f0e7f32b0b0f488c7c
**Next step:** Orchestrator VALIDATION phase (research-skeptic review)
