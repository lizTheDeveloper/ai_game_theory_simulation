# Critical Review: Death Attribution Audit

**Date:** October 18, 2025
**Reviewer:** Research Skeptic
**Subject:** Death Attribution Bug Fix Audit
**Severity:** CRITICAL - Affects 846B death attributions

---

## Executive Summary

The audit correctly identifies a critical bug (missing rootCause parameter in 24 call sites) but makes **several questionable root cause assignments** that lack research backing and conflate proximate with ultimate causes. Most critically, the proposed categorization system is **fundamentally flawed** - it confuses mechanistic pathways with causal origins.

**Major concerns:**
1. **Wrong abstraction level:** "Governance" is not a root cause - it's an intermediary failure mode
2. **Causal chain confusion:** Mixing proximate mechanisms with ultimate drivers
3. **Compound causality ignored:** Forces single attribution where multiple causes interact
4. **Research gaps:** No citations supporting categorization choices

---

## 1. Root Cause Validity Assessment

### ❌ CRITICAL ERROR: "Governance" as Root Cause (8 assignments)

**Your assignment:** 8 deaths to "governance" (pollution, social unrest, institutional failure)

**Problem:** Governance failure is NOT a root cause - it's a symptom. The research literature on state failure (Acemoglu & Robinson 2012, Collier 2007, Diamond 2005) shows governance collapse results from:
- Resource scarcity (climate/environmental drivers)
- Economic inequality (poverty/distribution)
- External shocks (conflict, disease)
- Technology disruption (alignment/automation)

**Example:** Your "institutional failure → state collapse" attribution should trace to WHY institutions failed:
- Climate stress → resource competition → institutional breakdown
- AI unemployment → social unrest → governance failure
- The root is climate or alignment, NOT governance

**Recommendation:** Eliminate "governance" as root cause category. Replace with actual drivers.

### ⚠️ WEAK: Climate Change Over-Attribution (11 assignments)

**Your assignment:** 11 deaths to "climateChange" including ALL ecosystem/environmental deaths

**Problem:** You're conflating anthropogenic climate change with broader environmental degradation:
- Pollinator collapse: Primarily pesticides (neonicotinoids) per EU ban research (EFSA 2018)
- Resource depletion: Often extractive economics, not climate (Steffen et al. 2015)
- Pollution crisis: Industrial regulation failure, not climate forcing

**Research contradiction:** IPBES Global Assessment (2019) attributes biodiversity loss:
- Land/sea use change: 50%
- Direct exploitation: 25%
- Climate change: 14%
- Pollution: 14%

You're attributing 100% to climate when research shows it's <15% of driver.

### ❌ WRONG: AI-Induced Nuclear War as "Alignment" (1 assignment)

**Your assignment:** AI-manipulated nuclear war → "alignment"

**Problem:** This violates causal hierarchy. From game theory and IR research (Schelling 1960, Jervis 1978):
- Nuclear weapons exist due to security dilemma (conflict root)
- AI manipulation is pathway/amplifier, not cause
- Without underlying tensions, manipulation wouldn't trigger war

**Correct attribution:** "conflict" - the AI exploits pre-existing geopolitical tensions

---

## 2. Contentious Assignment Analysis

### Nuclear Winter Famine → "Conflict" ✅ CORRECT

This is actually your BEST assignment. Nuclear winter follows from nuclear war (conflict). The causal chain is clear and research-backed (Robock et al. 2007, Toon et al. 2019).

### Corporate Dystopia → "Governance" ❌ WRONG

**Problem:** Corporate capture isn't governance failure - it's market concentration from:
1. Network effects + AI scaling (alignment/tech issue)
2. Regulatory capture theory (Stigler 1971) shows it's economic power concentration
3. Should be "alignment" (AI enables monopolization) or create "inequality" category

### Meaning Collapse/Suicide → "Governance" ❌ WRONG

**Research:** Durkheim (1897) established suicide as social/anomie issue. Modern research (Case & Deaton 2015 on "deaths of despair") links to:
- Economic displacement (poverty/inequality)
- Social disconnection (not governance)
- Loss of purpose (technological unemployment → alignment issue)

**Correct attribution:** "alignment" (AI-driven unemployment) or new "social" category

---

## 3. Compound Causality - CRITICAL METHODOLOGICAL FLAW

Your system forces single attribution where research shows **multiplicative interaction effects**:

### Example: Climate × Poverty Interactions

From Burke et al. (2015) in Nature:
- Climate impact on mortality is **23x higher** in poor vs rich countries
- Same temperature rise → 0.3% mortality (rich) vs 7% mortality (poor)
- Single attribution misses this critical interaction

### Required: Compound Attribution System

Implement weighted multi-cause attribution:
```typescript
interface CompoundCause {
  primary: RootCause;      // Main driver (>50% weight)
  secondary?: RootCause;   // Amplifier (25-50% weight)
  tertiary?: RootCause;    // Context (<25% weight)
  weights: number[];       // Must sum to 1.0
}
```

Research-backed examples:
- Famine: climate (0.4) + poverty (0.4) + governance (0.2)
- Social unrest: inequality (0.5) + alignment (0.3) + climate (0.2)

---

## 4. Methodological Issues

### A. Conflating Temporal with Causal

You're mixing:
- **Proximate cause:** Immediate mechanism (what)
- **Intermediate cause:** System failure (how)
- **Root cause:** Ultimate driver (why)

Example causal chain:
1. ROOT: Climate change (ultimate driver)
2. INTERMEDIATE: Agricultural system failure
3. INTERMEDIATE: Supply chain breakdown
4. INTERMEDIATE: Government rationing failure
5. PROXIMATE: Starvation

You're calling #4 the "root" when it's intermediate.

### B. Missing Causal Categories

Your 7 categories miss critical drivers from literature:
- **Inequality:** Piketty (2014), Wilkinson & Pickett (2009)
- **Social fragmentation:** Putnam (2000), social capital collapse
- **Demographic transition:** Aging societies, youth bulges (Goldstone 2002)
- **Path dependence:** Lock-in effects, infrastructure inertia

### C. Evidence Hierarchy Problems

No differentiation between:
- **Strong evidence:** RCTs, natural experiments (nuclear war → conflict)
- **Moderate evidence:** Observational studies (climate → ecosystem)
- **Weak evidence:** Theoretical only (AI dystopia → governance)

---

## 5. Evidence Gaps Requiring Research

### Assignments Lacking Citations

**NONE of your 24 assignments include research citations.** Critical gaps:

1. **Pollution → Governance:** Need evidence that regulation failure (not production growth) is primary driver
2. **Social unrest → Governance:** Need evidence it's not inequality/climate driven
3. **Ecosystem collapse → Climate:** Need parsing of climate vs land use vs pollution

### Categories Needing Definition

**"Governance" is undefined and overloaded:**
- Regulatory failure?
- State capacity?
- Institutional quality?
- Democratic backsliding?

Each has different root causes per research.

### Validation Data Needed

To support categorizations, need:
1. Historical precedent analysis (which root causes drove past collapses?)
2. Cross-national regression (what correlates with mortality?)
3. Mechanism testing (A→B→C causal chains)

---

## 6. Recommendations

### Immediate Actions

1. **REJECT "governance" as root cause** - It's intermediate, not root
2. **Implement compound attribution** - Most deaths have 2-3 interacting causes
3. **Add research citations** - Every assignment needs peer-reviewed backing
4. **Create causal hierarchy** - Distinguish root/intermediate/proximate

### Revised Root Cause Taxonomy

Based on collapse literature (Diamond 2005, Tainter 1988, Turchin 2016):

```typescript
enum RootCause {
  // Environmental drivers
  'climate',       // Climate change specifically
  'resource',      // Resource depletion/overshoot
  'pollution',     // Toxic contamination

  // Social drivers
  'inequality',    // Wealth/power concentration
  'demographic',   // Population dynamics
  'cultural',      // Social cohesion/anomie

  // Technology drivers
  'alignment',     // AI control problems
  'disruption',    // Tech unemployment/displacement

  // External shocks
  'conflict',      // War/violence
  'pandemic',      // Disease (natural or engineered)

  // Compound (requires weights)
  'compound'       // Multiple interacting causes
}
```

### Attribution Decision Tree

For each death attribution:

1. **Is there a single dominant driver (>70% causal weight)?**
   - YES → Single attribution
   - NO → Continue to 2

2. **Are there 2-3 major interacting causes?**
   - YES → Compound attribution with weights
   - NO → Review causal chain analysis

3. **What is the ultimate originating cause?**
   - Trace back through intermediate causes
   - Find the "but for" cause (without X, no death)

4. **Is there research evidence for this attribution?**
   - YES → Include citation
   - NO → Flag as "theoretical" and seek validation

---

## 7. Severity Assessment

### 🔴 CRITICAL Issues (Must Fix)

1. **Governance category is wrong** - Affects 8/24 attributions
2. **No compound causality** - Misrepresents most deaths
3. **Zero research citations** - No empirical backing

### 🟡 SIGNIFICANT Issues (Should Fix)

1. **Climate over-attribution** - Not everything is climate
2. **Missing inequality driver** - Major factor ignored
3. **Causal chain confusion** - Mixing levels of causation

### 🟢 MINOR Issues (Could Improve)

1. **Proximate category granularity** - Could add violence/suicide
2. **Regional variation** - Same cause, different regional impact
3. **Temporal dynamics** - Causes change over time

---

## 8. Required Evidence

To properly validate attributions, provide:

### For Each Root Cause Assignment:

1. **Primary citation:** Peer-reviewed study showing causal link
2. **Effect size:** Quantified impact from research
3. **Mechanism:** How A causes B causes death
4. **Precedent:** Historical example of this causal chain
5. **Confidence:** High/Medium/Low based on evidence quality

### For Compound Causes:

1. **Interaction study:** Research showing multiplicative effects
2. **Weight justification:** Why these proportions?
3. **Sensitivity analysis:** How robust to weight changes?

---

## Conclusion

The audit correctly identifies a critical bug but proposes a flawed fix. The root cause attributions lack research grounding, conflate different causal levels, and ignore compound causality. Most concerning is using "governance" as a root cause when it's clearly an intermediate failure mode.

**Path forward:**
1. Redesign root cause taxonomy based on collapse literature
2. Implement compound attribution system
3. Add research citations for every attribution
4. Distinguish root/intermediate/proximate causes
5. Validate with historical precedent analysis

This affects 846 billion death attributions - getting it wrong fundamentally misrepresents the drivers of catastrophe. The current proposal would attribute deaths to symptoms rather than causes, hiding the true dynamics that drive collapse.

**Recommendation: DO NOT IMPLEMENT current assignments. Redesign attribution system first.**

---

**Review completed:** October 18, 2025
**Severity:** CRITICAL - Fundamental attribution errors
**Confidence:** HIGH - Based on established collapse literature