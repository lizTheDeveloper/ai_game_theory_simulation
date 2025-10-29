# Design Decisions That May Be Based on Hallucinated Research

**Problem:** Claude Code may have generated plausible-sounding research to justify design decisions
**Risk:** Simulation parameters/logic based on fabricated data
**Status:** Audit in progress

---

## 🚨 HIGH RISK AREAS

### AI Infrastructure Resource Consumption
**Files:** `src/simulation/aiInfrastructureResources.ts`
**Status:** ✅ PARTIALLY VALIDATED
**Findings:**
- Code uses 700K liters (correct) NOT fabricated 500-700/GPU-hour
- Has note "FIX #3A (Oct 19, 2025): Corrected water consumption (was off by 100-1000x)"
- Someone already caught and fixed the hallucinated metrics
**Action:** Code is clean, wiki citations still need fixing

### AI Capability Scaling
**Files:** `src/simulation/aiAgent.ts`, capability calculations
**Risk:** MEDIUM
**Questions:**
- Are capability growth rates research-backed?
- Are breakthrough threshold values (60, 80, 95) empirically justified?
- Or were they tuned by Claude Code based on hallucinated papers?
**Action:** Audit capability progression logic for research citations

### Environmental Tipping Points
**Files:** `src/simulation/specificTippingPoints.ts`
**Risk:** HIGH
**Questions:**
- Are threshold values (e.g., Amazon 20-25% deforestation) research-backed?
- Are cascade probabilities empirically justified?
- Check all "100-200", "50-100" ranges - potential Round Number Syndrome
**Action:** Verify every numeric threshold against Richardson et al. (2023) and other planetary boundaries research

### Mortality Bayesian Priors
**Files:** `src/simulation/bayesianMortality.ts`
**Risk:** MEDIUM
**Questions:**
- Are baseline mortality rates research-backed?
- Are crisis multipliers (2x, 5x, 10x) empirically justified?
- Or are they "plausible guesses" from Claude Code?
**Action:** Audit all mortality parameters for citations

### Social Cohesion / Resentment Mechanics
**Files:** `src/simulation/socialCohesion.ts`
**Risk:** HIGH
**Questions:**
- Is resentment accumulation formula research-backed?
- Are recovery rates empirically justified?
- Are threshold effects (riots, coups) based on real data?
**Action:** Find actual political science research on social cohesion collapse

### Quality of Life Dimensions
**Files:** `src/simulation/qualityOfLife/dimensions.ts`
**Risk:** LOW-MEDIUM
**Questions:**
- Are the 17 dimensions themselves research-backed? (probably yes - based on HDI, capabilities approach)
- Are thresholds between tiers empirically justified?
**Action:** Verify against Sen, Nussbaum, HDI literature

---

## 🔍 AUDIT METHODOLOGY

For each design decision:

### Step 1: Find the Decision
- Grep for numeric constants, thresholds, formulas
- Look for comments claiming research backing
- Check git history for justification

### Step 2: Trace to Source
- Look in wiki for citations
- Look in research/ for background docs
- Check Claude Code conversation logs (if available)

### Step 3: Verify or Replace
- If research exists: Verify claim is accurate
- If research hallucinated: Find real research
- If no research exists: Document as "model assumption" NOT research-backed

### Step 4: Update Documentation
- Add proper citations to code comments
- Add to wiki with page numbers
- Flag uncertainties explicitly

---

## 📋 PRIORITY AUDIT QUEUE

1. **Environmental tipping point thresholds** - highest impact, most likely to have round number syndrome
2. **Social cohesion collapse mechanics** - complex system, likely under-researched
3. **AI capability breakthrough thresholds** - may be tuned, not researched
4. **Mortality crisis multipliers** - need empirical validation
5. **Economic transition costs** - check for hallucinated macro models

---

## 🛠️ TOOLS FOR AUDIT

```bash
# Find all numeric constants in simulation code
grep -r "const.*=.*[0-9]" src/simulation/ | grep -v "// Research:"

# Find "round number syndrome" in code
grep -r "[0-9]00\|[0-9]000" src/simulation/ | less

# Find research citations in code
grep -r "Research:\|Source:\|Citation:" src/simulation/

# Find threshold values
grep -r "threshold\|THRESHOLD" src/simulation/
```

---

## 💭 THE META-PROBLEM

**The real issue:** We can't trust ANY numeric value that doesn't have a clear citation trail.

**Solutions:**
1. **Assume guilty until proven innocent** - every parameter needs a citation or "MODEL ASSUMPTION" flag
2. **No naked constants** - every magic number needs a comment with source
3. **Distinguish:**
   - ✅ Research-backed (with citation)
   - ⚠️ Model assumption (explicitly flagged)
   - ❌ Unknown provenance (audit needed)

---

**Next Steps:**
1. Continue citation audit (Sylvia)
2. Code parameter audit (check every threshold/constant)
3. Create parameter provenance tracker
4. Refactor code to make all assumptions explicit

**Last Updated:** October 28, 2025
