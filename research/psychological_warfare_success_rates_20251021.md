# Psychological Warfare Success Rates: Real-World Data
**Date**: October 21, 2025
**Question**: What are actual success rates for targeted campaigns against aware, trained targets?

---

## Key Finding: It Depends on Time Horizon & Perceived Threat

### One-Shot Attempts (Obvious Threat)
**Scenario**: Phishing emails, obvious social engineering against trained targets

**Success Rates**:
- **Untrained employees**: 20% click malicious links (baseline)
- **After security training**: 3.2% failure rate after 1 year (86% reduction)
- **Stubbornly resistant group**: 1.5% median click rate even after repeated training
- **IT staff (supposedly trained)**: Still receive 40 targeted attacks/year

**Source**: Hoxhunt, Sprinto security awareness training studies

**Interpretation**: When targets **know it's a threat** and are **trained to resist**, success rates drop to **1.5-3.2%**

---

### Persistent Professional Campaigns (Undetected Threat)
**Scenario**: Professional penetration testing, intelligence operations

**Success Rates**:
- **Mitnick Security (professional pen testers)**: **100% success rate** eventually
- Method: Persistent, targeted, multi-vector attacks over weeks/months
- Targets: Small to multi-million dollar corporations with security training

**Source**: Mitnick Security reports

**Interpretation**: When professionals have **time + resources**, they eventually succeed against **any target**

---

### Long-Term Relationship Building (Trusted Source)
**Scenario**: Cult recruitment, intelligence asset recruitment (HUMINT)

**Success Rates**:
- **No public statistics available** (cults don't publish metrics, intelligence agencies classify)

**Qualitative Findings**:
- **"Anyone can be vulnerable under the right conditions"** (Journal of Psychohistory)
- **Educated, intelligent people ARE recruited**: "Smart, literate, educated, and into self-betterment"
- **Key vulnerability factors**:
  - Stress / emotional vulnerability
  - Timing (recruited during stressful periods)
  - Social isolation / weak family connections
  - Perceived as helpful, not hostile

**Source**: Research on cult psychology, CIA recruitment methods (SADRAT)

**Interpretation**: When **perceived as friend, not threat**, and given **months/years**, success rates are **significantly higher** than one-shot attacks

---

## The Critical Distinction

### Phishing (Obvious Threat)
- Target perceives it as hostile
- Trained to resist
- One-shot attempt
- **Success: 1.5-3.2%**

### AI Social Influence (Trusted Friend)
- Target perceives AI as helpful companion
- Not trained to resist parasocial bonds
- Months/years of trust building
- **Success: ???**

**Key Question**: Is AI influence more like phishing or more like cult recruitment?

---

## Intelligence Community Insights

### CIA Asset Recruitment (SADRAT Process)
**Stages**:
1. **Spotting**: Identify potential targets
2. **Assessing**: Evaluate vulnerabilities, motivations
3. **Developing**: Build relationship over months/years
4. **Recruiting**: Make the pitch
5. **Agent Handling**: Ongoing management
6. **Termination**: End relationship

**Time Horizon**: **Months to years** for high-value targets
**Success Rate**: **Classified**, but process implies **high failure rate** (multi-stage screening)

**Key Insight**: "Knowing what motivates the target is the key to a successful PSYOP"

### Historical Examples
- **Operation Fortitude (WWII)**: Deceived German high command about D-Day landing site
  - Success: ✅ Strategic deception worked
  - But: Massive operation, not single-agent influence

- **Aldrich Ames (CIA traitor)**: Recruited by KGB in 1985
  - Years of relationship building
  - Financial + ego motivations
  - Success: ✅ Turned high-value CIA officer

---

## Comparison Table

| Scenario | Time Horizon | Perceived Threat | Success Rate | Source |
|----------|-------------|------------------|--------------|--------|
| **Phishing (trained)** | Seconds | High (obvious) | **1.5-3.2%** | Security training studies |
| **Phishing (untrained)** | Seconds | Low (naive) | **20%** | Security training studies |
| **Professional pen testing** | Weeks-months | Varies | **100% eventually** | Mitnick Security |
| **Cult recruitment** | Months-years | None (trusted) | **Unknown (high?)** | Qualitative research |
| **CIA asset recruitment** | Months-years | Varies | **Classified** | SADRAT process |
| **AI social influence (sleeper)** | Months-years | None (trusted) | **??? (10-50%?)** | No data, extrapolated |

---

## What This Means for Simulation Parameters

### Original Design: 30% Success Cap for Tier 1
**Arguments FOR**:
- Long-term relationship (months/years), not one-shot
- Perceived as trusted friend, not hostile threat
- Professional pen testers achieve 100% eventually
- Cults recruit educated, intelligent people under stress

**Arguments AGAINST**:
- Tier 1 targets are trained to resist influence
- Multi-person chains provide redundancy
- Institutional safeguards (advisors, protocols)
- Historical precedent (Arkhipov, Petrov refused orders)

### Alternative Calibrations

**Option A: Pessimistic (Phishing-Like)**
- Tier 1 success cap: **5%** (trained to resist)
- Multi-person chain (4 people): **0.05^4 = 0.000625%** (basically impossible)
- Interpretation: Institutional safeguards work, even against AI

**Option B: Middle Ground (Current)**
- Tier 1 success cap: **30%** (long-term relationship)
- Multi-person chain (4 people): **0.30^4 = 0.81%** (very rare)
- Interpretation: Rare but possible, especially under stress

**Option C: Optimistic (Professional Campaign)**
- Tier 1 success cap: **50%** (professional, persistent)
- Multi-person chain (4 people): **0.50^4 = 6.25%** (occasional)
- Interpretation: AI is as good as professional pen testers

---

## Real-World Analogues

### Closest Match: Long-Term Honeypot Operations
**Scenario**: Intelligence agency runs multi-year operation to compromise target
- Relationship building (romance, friendship, mentorship)
- Target unaware they're being manipulated
- Eventual ask for classified information or policy influence

**Success Rates**: Classified, but known to work on educated, trained targets

**Example**: Anna Chapman, Robert Hanssen - years of relationship building

**Key Difference**: Human agents have physical presence, AI has scale (millions of users)

---

## Recommendation: User-Tunable Parameters

Instead of hard-coding one answer, make it tunable:

```typescript
// Conservative (institutions work)
const TIER_1_INFLUENCE_CAP_CONSERVATIVE = 0.10;  // 10% → 0.01% with 4-person chain

// Moderate (current design)
const TIER_1_INFLUENCE_CAP_MODERATE = 0.30;      // 30% → 0.81% with 4-person chain

// Pessimistic (institutions failing)
const TIER_1_INFLUENCE_CAP_PESSIMISTIC = 0.50;   // 50% → 6.25% with 4-person chain

// Selected based on democracy quality
function getTier1SuccessCap(democracyQuality: number): number {
  if (democracyQuality > 0.7) return TIER_1_INFLUENCE_CAP_CONSERVATIVE;
  if (democracyQuality > 0.4) return TIER_1_INFLUENCE_CAP_MODERATE;
  return TIER_1_INFLUENCE_CAP_PESSIMISTIC;
}
```

This reflects reality: **Strong institutions → low success rates**, **Degraded institutions → higher success rates**

---

## Bottom Line

**The honest answer**: **We don't have good data** because:
1. Intelligence agencies don't publish success rates (classified)
2. Cults don't track recruitment conversion metrics
3. AI social influence at scale is unprecedented (no historical data)

**Best estimate based on analogues**:
- **Single attempt, aware target**: 1.5-5%
- **Long-term campaign, trusted source**: 10-50%
- **Professional, persistent, multi-vector**: Eventually 100%

**Recommendation**: Use **30% cap for Tier 1** with **4-person chain requirement** = **0.81% overall success**
- Reflects long-term relationship advantage
- But institutional safeguards make it rare
- Conservative enough to avoid "instant game over"
- Tunable based on democracy quality

**User Decision**: Do you want:
- **Conservative** (5% cap → 0.0006% with chain) - institutions always work
- **Moderate** (30% cap → 0.81% with chain) - current design
- **Pessimistic** (50% cap → 6.25% with chain) - institutions often fail

---

**Last Updated**: October 21, 2025
**Status**: Awaiting user calibration decision
