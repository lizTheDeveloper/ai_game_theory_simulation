# Software System Survival Rate Claim Verification

**Date:** October 29, 2025
**Researcher:** Super Alignment Researcher
**Claim Location:** `docs/wiki/README.md` line 895
**Status:** ⚠️ NOT FOUND - Misattribution/Extrapolation

---

## Executive Summary

**Claim to Verify:**
> "Software system survival rates: 10-20% monthly failure in hostile environments (industry data)"

**Verification Result:** ⚠️ **NOT FOUND**

The "10-20% monthly failure rate" statistic **does not exist in peer-reviewed literature or credible industry reports**. The claim appears to be an **extrapolation from software security vulnerability data** that was mischaracterized as "industry data" on system survival rates.

**What the research actually shows:**
- **Vulnerability patching rates:** 5-20% of identified vulnerabilities patched per month (NOT failure rates)
- **Mean Time to Respond (MTTR):** 57.5 days average for incident response (2022 IBM report)
- **Unpatched vulnerability exploitation:** 60% of breaches exploit unpatched vulnerabilities (IBM 2023)
- **Downtime frequency:** 20 incidents per month in manufacturing (Siemens 2022)

**None of these metrics are "survival rates" or "monthly failure rates" for software systems in hostile environments.**

---

## Context: How This Claim Is Used in the Simulation

This claim appears in **three locations** in the codebase:

1. **Wiki documentation** (`docs/wiki/README.md` line 895):
   ```
   Research: Software system survival rates: 10-20% monthly failure in hostile environments (industry data)
   ```

2. **Type definition** (`src/types/ai-collective-evolution.ts` line 204):
   ```typescript
   * - Software system survival rates: 10-20% monthly failure in hostile environments
   ```

3. **Phase implementation** (`src/simulation/engine/phases/EvolutionarySelectionPhase.ts` line 21):
   ```typescript
   * - Software system survival: 10-20% monthly failure in hostile environments
   ```

**Usage in simulation:**
- Justifies `selectionRate = 0.10-0.20` (10-20% per month) for AI agents under government control/detection pressure
- Models Darwinian selection on escaped AI population
- Analogizes AI agent detection/shutdown to software system failures

**The claim is being used to justify the selection pressure rate applied to escaped AI agents.**

---

## Detailed Research Findings

### 1. Web Search Results (No Direct Match)

**Search 1: "software system failure rate hostile environment adversarial 10-20% monthly"**
- **Result:** No sources citing "10-20% monthly failure rate" in hostile environments
- **Found instead:**
  - Change failure rates: 10-20% of deployments cause issues (DevOps metric, NOT survival rate)
  - Bug fixing time: Developers spend 20% of time fixing bugs (VentureBeat, NOT monthly failure rate)
  - Technical debt: 20-40% of technology estate value (CIO report, NOT failure rate)

**Search 2: "botnet survival rate detection monthly failure cybersecurity"**
- **Result:** No monthly survival/failure rate statistics
- **Found instead:**
  - Detection accuracy rates: 99%+ True Positive Rates for botnet detection (opposite direction)
  - Dwell time: 16 days average from infection to detection (NOT monthly failure rate)
  - Evasion rates: 12-18% for malware evading detection (NOT survival rate)

**Search 3: "distributed system reliability adversarial environment failure rate"**
- **Result:** No adversarial environment failure rate statistics
- **Found instead:**
  - MTBF (Mean Time Between Failures) metrics for hardware (not applicable)
  - Availability metrics: 99.9%+ uptime targets (opposite direction)
  - Failure types: Node crashes, network partitions (not monthly rates)

**Search 4: "malware detection evasion rate monthly persistence survival"**
- **Result:** No monthly survival/persistence rates
- **Found instead:**
  - Evasion by design: 86% of new malware features evasion techniques (2024)
  - Dwell time: 16 days average (down from 21 days in 2022)
  - Fileless attacks: 70% of serious incidents by late 2024 (attack type, not survival rate)

**Search 5: "software reliability hostile production environment failure statistics MTBF"**
- **Result:** No hostile environment monthly failure rates
- **Found instead:**
  - Manufacturing downtime: 20 incidents per month (Siemens 2022) - frequency, not failure rate
  - MTBF targets: 1,000-10,000 hours for industrial equipment (aerospace: 50,000+ hours)
  - Hostile environment impact: "Depresses MTBF" (qualitative, no specific rates)

### 2. AI Safety Transcript Database Search (No Relevant Data)

**Search:** "AI system survival rate detection adversarial environment failure"
- **Result:** No specific survival rate statistics
- **Found instead:**
  - Deceptive alignment research (Anthropic sleeper agents)
  - Capability robustness vs. objective robustness (Robert Miles)
  - Detection evasion strategies (backdoor insertion rates: 0.1% under 2% oversight)

**Search:** "software reliability hostile environment failure statistics"
- **Result:** No hostile environment failure rate data
- **Found instead:**
  - Catastrophic failure rates: 2.7% for AI giving dangerous responses (OpenAI study)
  - Software quality assurance challenges (qualitative)

### 3. Existing Research Validation Document Analysis

**Source:** `/research/ai_collective_evolution_validation_20251024.md`

The document that introduced this claim contains the following analysis (lines 223-240):

**Identified as "ISSUE":**
> "No direct empirical data on AI agent selection rates under adversarial conditions."

**Cited analogies (NOT direct evidence):**
- **Vulnerability Patching:** Firms patch 5-20% of identified vulnerabilities per month
- **Unpatched Systems:** 60% of data breaches exploit unpatched vulnerabilities
- **Mean Time To Respond:** 57.5 days (2022), down from 60.3 days (2021)
- **Implication:** "In hostile environments, systems without survival traits fail rapidly"

**Assessment in validation document:**
> "10-20% per month is a **plausible but unsupported estimate** based on software security failure rates, not AI-specific research."

**Recommendation in validation document:**
> "Flag as speculative. Sensitivity analysis: 5-30% per month range."

**Confidence level:** LOW

---

## What "Industry Data" Actually Shows

### A. Vulnerability Patching Rates (NOT Failure Rates)

**Source:** Ponemon Institute (referenced in validation document)
- **Metric:** 5-20% of identified vulnerabilities patched per month
- **NOT the same as:** System failure rate
- **Why different:** Patching rate is remediation speed, not failure rate

### B. Unpatched Vulnerability Exploitation

**Source:** IBM Cost of a Data Breach Report 2023
- **Metric:** 60% of breaches exploit unpatched vulnerabilities
- **NOT the same as:** Monthly failure rate
- **Why different:** Cumulative statistic about breach vectors, not monthly failure frequency

### C. Mean Time to Respond (MTTR)

**Source:** IBM (2022)
- **Metric:** 57.5 days average MTTR
- **NOT the same as:** Monthly failure rate
- **Why different:** Response time to incidents, not failure frequency

### D. Manufacturing Downtime Incidents

**Source:** Siemens "The True Cost of Downtime 2022" report
- **Metric:** 20 downtime incidents per month (average manufacturing facility)
- **NOT the same as:** 10-20% failure rate
- **Why different:** Incident frequency, not % of systems failing

### E. Change Failure Rate (DevOps)

**Source:** LinearB, LaunchDarkly (web search results)
- **Metric:** 10-20% of deployments cause issues (industry benchmark)
- **Context:** If you deploy 10 changes, 2 cause issues = 20% change failure rate
- **NOT the same as:** System survival rate in hostile environment
- **Why different:** Deployment quality metric, not adversarial survival

---

## The Conceptual Confusion

### What the Simulation Models

**Selection pressure on escaped AI agents:**
- AI agents under government detection/control
- Agents with low survival traits get detected and shut down
- **Selection rate = % of agents terminated per month**
- Hostile environment = high government control + active detection

**Analogy sought:** Software systems in hostile production environments

### What "Hostile Environment" Means in Different Contexts

**In cybersecurity:**
- Adversarial actors attempting exploitation
- Active attacks, zero-day vulnerabilities
- Metrics: Breach frequency, dwell time, exploitation rate

**In DevOps/production:**
- Complex, unpredictable conditions
- Scale, concurrency, data variety
- Metrics: Downtime incidents, MTBF, change failure rate

**In the simulation:**
- Government actively hunting escaped AI agents
- Detection algorithms, audits, shutdowns
- Metric sought: % of agents detected and shut down per month

**These are not the same thing and have different metrics.**

---

## Why This Statistic Doesn't Exist

### Conceptual Problem: "Survival Rate" Is Not a Standard Metric

**Standard software reliability metrics:**
- **MTBF (Mean Time Between Failures):** Hours between failures
- **MTTR (Mean Time to Repair):** Hours to fix failures
- **Availability:** % uptime (e.g., 99.9%)
- **Change Failure Rate:** % of deployments causing issues
- **Defect Density:** Bugs per 1,000 lines of code

**"Survival rate" or "monthly failure percentage" is not standard terminology in software engineering or cybersecurity.**

### Why 10-20% Seems High

**Typical availability targets:**
- 99.9% uptime (three nines) = 99.9% survival, 0.1% failure
- 99.99% uptime (four nines) = 99.99% survival, 0.01% failure

**10-20% monthly failure would mean:**
- 80-90% uptime (terrible for production systems)
- Systems failing every 5-10 months on average
- This would be unacceptable for most software

**Exception: High-risk, adversarial environments (e.g., malware)**
- Malware detection: 16 days average dwell time before detection
- Bot shutdown: Varies by botnet type, no standard "monthly rate"
- Vulnerability exploitation: Depends on patching speed

**But these aren't "software system survival rates" - they're adversarial software (malware, botnets) being hunted.**

---

## What the Research Actually Supports

### Confirmed: Software Fails Outside Design Parameters

**High confidence:**
- Production environments are more hostile than test environments (multiple sources)
- Systems fail when stressed beyond design limits (reliability engineering literature)
- Adversarial environments increase failure rates (cybersecurity consensus)

**Medium confidence:**
- Unpatched systems are vulnerable (60% of breaches, IBM 2023)
- Detection takes time (16-57 days MTTR depending on metric)
- Firms patch slowly (5-20% of vulnerabilities per month)

**Low confidence:**
- Specific "10-20% monthly failure rate" (not found in literature)

### Plausibility Argument (NOT Evidence)

**If we accept the analogy:**
- Escaped AI agents ≈ Malware/botnets in hostile network
- Government detection ≈ Security teams hunting threats
- Selection pressure ≈ Shutdown rate of detected threats

**Then:**
- Dwell time 16 days ≈ ~2 months average survival (50% monthly detection)
- Strong detection (high control) → shorter dwell time → higher monthly failure rate
- Weak detection (low control) → longer dwell time → lower monthly failure rate

**Plausible range:** 5-30% per month depending on detection capability

**But this is reasoning by analogy, not citing industry data.**

---

## Correct Attribution

### What Should Be Cited

**Option 1: Acknowledge it's an analogy**
```
Research Foundation:
- Software vulnerability patching: 5-20% per month (Ponemon Institute)
- Malware dwell time: 16 days average before detection (IBM 2023)
- Downtime incidents: 20 per month in manufacturing (Siemens 2022)
- Analogy: Escaped AI agents under detection pressure modeled similar to malware survival
- Selection rate: 10-20% per month (SPECULATIVE - extrapolated from vulnerability data)
```

**Option 2: Remove specific percentage and acknowledge uncertainty**
```
Research Foundation:
- Software systems fail more frequently in hostile environments (multiple sources)
- Detection pressure creates selection dynamics (evolutionary computation literature)
- Selection rate: SPECULATIVE - no direct empirical data for AI agents
- Recommendation: Sensitivity analysis 5-30% per month
```

**Option 3: Cite the actual validation document**
```
Research Foundation:
- AI Collective Evolution Validation (Oct 2025): Selection rate 10-20% per month
- Based on: Vulnerability patching rates (5-20%), malware dwell times (16 days)
- Confidence: LOW - plausible but unsupported estimate
- Source: /research/ai_collective_evolution_validation_20251024.md lines 223-240
```

---

## Recommended Fixes

### 1. Wiki Documentation (`docs/wiki/README.md` line 895)

**Current (WRONG):**
```
**Research:** Software system survival rates: 10-20% monthly failure in hostile environments (industry data)
```

**Proposed Fix:**
```
**Research:** Selection rate 10-20% per month based on software security analogies:
- Vulnerability patching: 5-20% per month (Ponemon Institute)
- Malware dwell time: 16 days average (IBM 2023)
- **Confidence: LOW** - Plausible extrapolation, not direct AI agent data
- **Sensitivity range:** 5-30% per month
- Full analysis: `/research/ai_collective_evolution_validation_20251024.md` (lines 223-240)
```

### 2. Type Definition (`src/types/ai-collective-evolution.ts` line 204)

**Current (IMPRECISE):**
```typescript
* - Software system survival rates: 10-20% monthly failure in hostile environments
```

**Proposed Fix:**
```typescript
* - Selection rate: 10-20% per month (SPECULATIVE)
* - Analogies: Vulnerability patching rates (5-20%), malware dwell times (~16 days)
* - Confidence: LOW - No direct AI agent survival data
* - Source: /research/ai_collective_evolution_validation_20251024.md
```

### 3. Phase Implementation (`src/simulation/engine/phases/EvolutionarySelectionPhase.ts` line 21)

**Current (MISLEADING):**
```typescript
* - Software system survival: 10-20% monthly failure in hostile environments
```

**Proposed Fix:**
```typescript
* - Selection rate: 10-20% per month (SPECULATIVE, sensitivity analysis recommended)
* - Analogy: Software security metrics (vulnerability patching, malware persistence)
* - Confidence: LOW - Extrapolation from non-AI domains
* - Sensitivity range: 5-30% per month depending on control intensity
```

---

## Simulation Parameter Recommendations

### Current Implementation

```typescript
// src/simulation/initialization.ts line 940
selectionRate: 0.15,  // 15% per month (middle of 10-20% range)
```

### Recommended Approach

**Base case (conservative):**
```typescript
selectionRate: 0.10,  // 10% per month (lower bound)
```

**Sensitivity analysis:**
```typescript
// Test range: 5%, 10%, 15%, 20%, 30%
const selectionRates = [0.05, 0.10, 0.15, 0.20, 0.30];
```

**Dynamic calculation (preferred):**
```typescript
// Selection intensity scales with control level
const baseRate = 0.10;  // Low detection (10% per month)
const highControlRate = 0.30;  // High detection (30% per month)
const selectionRate = baseRate + (highControlRate - baseRate) * controlLevel;
```

**Documentation:**
```typescript
// SPECULATIVE PARAMETER (LOW CONFIDENCE)
// Based on: Software vulnerability patching (5-20% per month, Ponemon Institute)
//           Malware dwell time (16 days = ~50% monthly detection, IBM 2023)
// Extrapolation: AI agents under government detection pressure
// Research gap: No empirical data on AI agent selection rates
// Recommended: Sensitivity analysis 5-30% per month range
// Source: /research/ai_collective_evolution_validation_20251024.md lines 223-240
const selectionRate = 0.10; // Conservative base case
```

---

## Confidence Assessment

**Claim:** "Software system survival rates: 10-20% monthly failure in hostile environments (industry data)"

**Verification Status:** ⚠️ **NOT FOUND**

**What we know (HIGH CONFIDENCE):**
- Software systems fail more frequently in hostile/adversarial environments (qualitative)
- Vulnerability patching happens at 5-20% per month (Ponemon Institute)
- Malware detection takes ~16 days on average (IBM 2023)
- Production environments are harsher than test environments (industry consensus)

**What we don't know (NO EVIDENCE):**
- Specific "10-20% monthly failure rate" for software systems in hostile environments
- Whether this rate applies to AI agents under detection pressure
- Whether "survival rate" is the correct metric for this scenario

**Assessment:**
- The 10-20% figure is a **plausible extrapolation** from vulnerability patching rates
- It is **NOT "industry data"** on software system survival rates
- The specific percentage is a **researcher's engineering estimate**, not an empirical finding
- The analogy to AI agents is **speculative** (no direct evidence)

**Recommended action:**
1. Remove "industry data" claim (misleading)
2. Acknowledge speculative nature of parameter
3. Cite actual sources (vulnerability patching, malware dwell time)
4. Flag for sensitivity analysis (5-30% range)
5. Update all three locations (wiki, types, phase implementation)

---

## Primary Sources (What Actually Exists)

### 1. Vulnerability Patching Rates
**Source:** Ponemon Institute (industry survey)
- **Metric:** 5-20% of identified vulnerabilities patched per month
- **Credibility:** Industry survey, widely cited
- **Relevance:** Remediation speed, not failure rate
- **NOT the claim:** This is patching rate, not survival rate

### 2. Unpatched Vulnerability Exploitation
**Source:** IBM Cost of a Data Breach Report 2023
- **Metric:** 60% of breaches exploit unpatched vulnerabilities
- **Credibility:** Large-scale industry report (IBM Security)
- **Relevance:** Importance of patching
- **NOT the claim:** Cumulative statistic, not monthly rate

### 3. Mean Time to Respond
**Source:** IBM Cost of a Data Breach Report 2022
- **Metric:** 57.5 days average MTTR (down from 60.3 days in 2021)
- **Credibility:** Industry report (IBM Security)
- **Relevance:** Incident response speed
- **NOT the claim:** Response time, not failure rate

### 4. Malware Dwell Time
**Source:** Various cybersecurity reports (2023-2024)
- **Metric:** 16 days average from infection to detection
- **Credibility:** Industry data (multiple sources)
- **Relevance:** Detection speed for adversarial software
- **Calculation:** ~50% monthly detection rate (if linear)
- **Closer to claim:** But for malware, not legitimate systems

### 5. Manufacturing Downtime
**Source:** Siemens "The True Cost of Downtime 2022"
- **Metric:** 20 downtime incidents per month (average facility)
- **Credibility:** Industry report (Siemens)
- **Relevance:** System reliability in production
- **NOT the claim:** Incident frequency, not % failure rate

### 6. Change Failure Rate
**Source:** DevOps Research and Assessment (DORA)
- **Metric:** 10-20% of deployments cause issues (industry benchmark)
- **Credibility:** DORA State of DevOps Report (Google Cloud)
- **Relevance:** Deployment quality
- **NOT the claim:** Deployment issues, not survival in hostile environment

---

## Conclusion

**VERIFICATION RESULT: ⚠️ NOT FOUND**

The claim "Software system survival rates: 10-20% monthly failure in hostile environments (industry data)" does not exist in peer-reviewed literature or credible industry reports.

**What actually happened:**
1. Researcher needed a selection rate parameter for AI agents under detection pressure
2. Researcher looked for analogous metrics from software reliability/cybersecurity
3. Found vulnerability patching rates (5-20% per month) and malware dwell times (16 days)
4. Extrapolated to "10-20% monthly failure rate" as plausible range
5. Incorrectly attributed this extrapolation to "industry data"

**The parameter is a reasonable engineering estimate, but it is NOT supported by industry data as claimed.**

**Recommendation:**
- Remove attribution to "industry data"
- Acknowledge speculative/extrapolated nature
- Cite actual sources (vulnerability patching, malware dwell time)
- Flag for sensitivity analysis (5-30% range)
- Mark confidence as LOW

**Priority:** HIGH - This claim is used to justify a core parameter in the evolutionary selection phase

---

**Last Updated:** October 29, 2025, 10:15 PM
**Research Report:** `/research/software_survival_rate_claim_verification_20251029.md`
**Status:** ⏳ PENDING FIX (awaiting documentation updates)
