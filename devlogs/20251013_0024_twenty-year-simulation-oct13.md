# 20-Year Simulation - Testing Complete System
**Date:** October 13, 2025  
**Duration:** 10 runs × 240 months (20 years)  
**Status:** 🔄 Running

---

## 🎯 **Goals**

Test the complete fixed system over a realistic 20-year timeframe:

1. **Research-Based Mortality System** - Does it scale correctly over decades?
2. **7-Tier Outcome Classification** - Do we see full range of outcomes?
3. **Famine System** - Do famines trigger and resolve realistically?
4. **Organization Dynamics** - Do orgs survive/fail based on regional markets?
5. **Environmental Cascade** - Can interventions reverse tipping points?

---

## 🔬 **What We're Testing**

### **Mortality Realism (TIER 1)**
- Baseline: 0.009%/month at 7/9 boundaries (UNEP)
- Scales with food (<0.4), water (<0.4), climate (<0.6), biodiversity (<0.3)
- Cascade amplifier: 8-9 boundaries → 2.25x
- **Question:** Does 20-year collapse match historical timelines?

### **Outcome Distribution (NEW)**
Expected with current baseline (no interventions):
- **Extinction:** 5-10% (truly catastrophic)
- **Terminal:** 10-15% (heading to extinction)
- **Bottleneck:** 15-20% (genetic bottleneck, 100M-1B people)
- **Dark Age:** 20-30% (civilization collapse, 1B-4B people)
- **Collapse:** 15-20% (major crisis, 4B-6.4B people, recoverable)
- **Crisis Era:** 10-15% (manageable, 6.4B-7.2B people)
- **Status Quo:** 0-5% (rare without interventions)
- **Utopia:** 0% (requires active interventions)

### **Famine System (TIER 1.7)**
- Global food <0.4 triggers 3-9 regional famines
- Vulnerable regions prioritized
- 24-month pathway from trigger to mass death
- **Question:** Do famines resolve with tech deployment?

### **Organization Resilience**
- Revenue penalties: population decline, food crisis, infrastructure collapse
- Regional tracking: US orgs care about US population
- Bankruptcy thresholds lowered during crises
- **Question:** Do some orgs survive collapse?

### **Recovery Potential**
- Can environmental interventions reverse cascades?
- Do breakthrough technologies deploy fast enough?
- Is "Dark Age" → "Collapse" recovery possible?
- **Question:** What interventions enable recovery?

---

## 📊 **Expected Patterns**

### **Early Game (Months 0-60, Years 0-5)**
- Tipping point cascade begins immediately (7/9 boundaries breached)
- Monthly mortality: 0.009% → 0.05% as thresholds degrade
- Population: 8B → 6-7B (12-25% mortality)
- Famines: 3-6 triggered in vulnerable regions
- Organizations: Some bankruptcies, most adapt
- **Outcome Expectation:** Crisis Era → Collapse

### **Mid Game (Months 60-120, Years 5-10)**
- Cascading crises: 4-6 active simultaneously
- Monthly mortality: 0.05% → 0.15% (food <0.3, water <0.3)
- Population: 6-7B → 3-5B (37-62% mortality)
- Famines: 6-9 active, some resolving with tech
- Organizations: Major failures, regional survivors
- Government: Authoritarian takeover in some runs
- **Outcome Expectation:** Collapse → Dark Age

### **Late Game (Months 120-240, Years 10-20)**
- Final state: System either stabilized or terminal
- Monthly mortality: Either reversed (<0.01%) or catastrophic (>0.5%)
- Population: Highly variable (0.5B-7B depending on interventions)
- Famines: Either ended or permanent
- Organizations: Survivors = regional powerhouses
- **Outcome Expectation:** Full 7-tier distribution

---

## 🔍 **Key Metrics to Track**

### **Population Trajectory:**
- **Collapse Threshold:** <4B (50% mortality)
- **Dark Age Threshold:** <1B (87.5% mortality)
- **Bottleneck Threshold:** <100M (98.75% mortality)
- **Recovery Indicator:** Population growth resuming

### **Environmental State:**
- **Cascade Active?** Yes/No
- **Cascade Severity:** 0-1 scale
- **Reversibility:** Can interventions bring risk <0.45?
- **Food Security:** Is it stabilizing or collapsing?

### **Organization Survival:**
- How many orgs bankrupted?
- Which regions have surviving orgs?
- Do tech leaders (OpenAI, DeepMind) survive?
- Is compute growth sustainable?

### **Outcome Distribution:**
- Count each tier
- Compare to expected distribution
- Identify outliers (utopia? full extinction?)

---

## 📈 **Success Criteria**

### **Realism Check:**
1. ✅ **Mortality rates match research** (not 222x too high)
2. ✅ **Outcomes match historical precedents** (not all extinction)
3. ✅ **Famines trigger at correct thresholds** (food <0.4)
4. ✅ **Organizations fail realistically** (not thriving during 80% mortality)
5. ✅ **Recovery is possible** (some runs stabilize)

### **System Validation:**
1. **Variety:** See at least 4 different outcome tiers
2. **Consistency:** Similar initial conditions → similar outcomes
3. **Interventions Matter:** Tech deployment affects outcomes
4. **Regional Differences:** Geographic variation in outcomes
5. **Path Dependence:** Early choices cascade to final state

---

## 🚀 **What Comes Next**

If 20-year baseline works correctly:
1. **TIER 2 Interventions:** Add superalignment interventions
2. **Utopia Testing:** Can we achieve 5-10% utopia with interventions?
3. **Recovery Paths:** Test bouncing back from Dark Age
4. **Policy Testing:** What government actions enable recovery?

---

## 📝 **Monitoring**

**Real-time progress:**
```bash
tail -f logs/monte_carlo/twenty_year_test_*.log | grep -E 'Run|Year|OUTCOME|💥|🧬|🏚️|⚰️|💀'
```

**Check outcome distribution:**
```bash
grep -E "💥 COLLAPSE|🧬 BOTTLENECK|🏚️ DARK AGE|⚰️ TERMINAL|💀 EXTINCTION" \
  logs/monte_carlo/twenty_year_test_*.log | wc -l
```

**Population tracking:**
```bash
grep "Final population:" logs/monte_carlo/twenty_year_test_*.log
```

---

**Status:** 🔄 Simulation running, results pending (~8-12 minutes)

