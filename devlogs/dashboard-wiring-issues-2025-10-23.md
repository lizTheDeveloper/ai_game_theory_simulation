# Dashboard Wiring Issues Report
**Date:** 2025-10-23
**Status:** Frontend wiring in progress
**Method:** Manual screen-by-screen review using Playwright browser automation

## Summary
Found **25+ wiring issues** across 9 dashboards. Most common issues:
1. **Status label logic errors** (showing "Safe" when values exceed thresholds)
2. **Missing or zero values** (Extinction Risk, Climate Stability, Democracy, etc.)
3. **Scale inconsistencies** (QoL shown as 19.72 vs 0.71 on different dashboards)
4. **Floating point display issues** (1.5499999999999996 instead of 1.55)
5. **Agent count mismatch** (53 total vs 20 in capability matrix)

---

## 1. Overview Dashboard ✅ Reviewed

### Issues Found (3)
1. **Extinction Risk** - No value shown (blank/missing)
2. **Climate Stability** - Shows 0% (likely incorrect, should have a real value)
3. **Quality of Life** - Shows 19.72 (seems low, but might be on different scale than Regions dashboard which shows 0.71)

### Screenshot
`logs/dashboard-01-overview-issues.png`

---

## 2. AI Agents Dashboard ✅ Reviewed

### Issues Found (1 major)
1. **Total Agents shows 53** but the Capability Matrix correctly shows 20 agents
   - All summary statistics (lifecycle, alignment, evaluation strategies) add up to 53 instead of 20
   - Suggests the dashboard is counting agents incorrectly or including duplicates/wrong data

### Data That Looks Correct
- Average Capability: 3.06
- Average Alignment: 0.70
- Active Sleepers: 0
- Capability Matrix: Shows all 20 agents correctly (Corporate-0 through Niche-2)

### Screenshot
`logs/dashboard-02-ai-agents-issues.png`

---

## 3. Paradigms Dashboard ✅ Reviewed

### Issues Found (4)
1. **Western Liberal - Democracy**: 0.0 (should have a value)
2. **Western Liberal - Civil Liberties**: 0.0 (should have a value)
3. **Western Liberal - Rule of Law**: 0.0 (should have a value)
4. **Indigenous - Social Trust**: 0.00 (should have a value)

### Data That Looks Correct
- Multi-Paradigm DUI overall scores seem reasonable
- Development paradigm QoL: 19.72 (matches Overview)
- Ecological Climate Stability: 0% (same issue as Overview)

### Screenshot
`logs/dashboard-03-paradigms-issues.png`

---

## 4. Crisis Dashboard ✅ Reviewed

### Issues Found (6)
1. **Climate Change Status**: Shows "Safe" but Current (1.21°C) > Threshold (1.00°C) - should be "Breached"
2. **Freshwater Change Status**: Shows "Safe" but Current Level (129%) > Safe Limit (100%) - should be "Breached"
3. **Novel Entities (Chemical) Status**: Shows "Safe" but Pollution Level (151%) > Safe Limit (100%) - should be "Breached"
4. **Ocean Acidification pH Level**: Shown as "98%" instead of actual pH value (should be ~8.1 or similar)
5. **Oversight Level**: Shows "1.5499999999999996/10" - floating point precision issue, should be rounded to 1.55
6. **Antimicrobial Resistance Deaths**: Shows "1,313,282.511" - unnecessary decimal precision for death counts

### Data That Looks Correct
- Active Crises: 7
- Total Monitored: 13
- Cascade Multiplier: 11.4x
- Most crisis metrics appear reasonable

### Screenshot
`logs/dashboard-04-crises-issues.png`

---

## 5. Environment Dashboard ✅ Reviewed

### Issues Found (4)
1. **Climate Change Status**: Shows "Safe Zone" but Current (1.21) > Threshold (1.00) - should be "BREACHED"
2. **Freshwater Change Status**: Shows "Safe Zone" but Current (1.29) > Threshold (1.00) - should be "BREACHED"
3. **Novel Entities Status**: Shows "Safe Zone" but Current (1.51) > Threshold (1.00) - should be "BREACHED"
4. **Biodiversity Loss in Environmental Debt**: Shows "15080%" - extremely high, might be display issue (should it be 150.80% to match extinction rate?)

### Data That Looks Correct
- Breached Boundaries: 4 (summary is correct even if individual labels are wrong)
- Biosphere Integrity: BREACHED (correctly labeled)
- Ocean Acidification: BREACHED (correctly labeled)

### Screenshot
`logs/dashboard-05-environment-issues.png`

---

## 6. Tech Tree Dashboard ✅ Reviewed

### Issues Found (1 minor)
1. **Unlocked Technologies: 0** - Seems odd that if 11 technologies are deployed, there are no unlocked (ready to deploy) technologies

### Data That Looks Correct
- Total Technologies: 73
- Deployed: 11
- Researching: 62
- Tree structure with prerequisites looks well wired
- Deployment percentages showing correctly

### Screenshot
`logs/dashboard-06-tech-tree-issues.png`

---

## 7. Detection Dashboard ✅ Reviewed

### Issues Found (0)
**This dashboard appears fully wired and correct!**

All metrics consistent with AI Agents dashboard:
- Detection Rate: 0%
- Total Sleepers: 0
- Sandbagging: 6
- Gaming: 0
- Honest: 47
- Ensemble effectiveness calculations look reasonable

### Screenshot
`logs/dashboard-07-detection-good.png`

---

## 8. Regions Dashboard ✅ Reviewed

### Issues Found (2 major)
1. **Average QoL: 0.71** - But Overview dashboard shows "Quality of Life: 19.72"
   - These should be the same metric but are on completely different scales!
   - **This is a critical wiring issue** - need to determine which is correct
2. **Average Survival Tier: 0.0** - Doesn't make sense when individual regions range from 3.2 to 4.5

### Data That Looks Correct
- Global Population: 8.00B
- Regional QoL values (0.52 to 0.82) look reasonable
- Regional survival tiers (3.2 to 4.5) look reasonable
- Population distribution percentages add up to 100%

### Screenshot
`logs/dashboard-08-regions-issues.png`

---

## 9. Timeline Dashboard ✅ Reviewed

### Issues Found (2)
1. **Current Month inconsistency**: Dashboard shows "Current Month: 13" but status bar shows "Month: 6" - these should match
2. **Event log month labels**: All events show "Month" label but without the actual month number (should show "Month 1", "Month 3", etc.)

### Data That Looks Correct
- Total Events: 8
- Critical Events: 4
- Warning Events: 3
- Event content and descriptions look reasonable

### Screenshot
`logs/dashboard-09-timeline-issues.png`

---

## Issue Categories

### 🔴 Critical Issues (Require Immediate Fix)
1. **QoL Scale Inconsistency**: Overview shows 19.72, Regions shows 0.71 for same metric
2. **AI Agents Count**: 53 total shown vs 20 actual agents in matrix
3. **Planetary Boundary Status Logic**: Multiple boundaries showing "Safe" when values exceed thresholds

### 🟠 High Priority (Incorrect Logic)
1. Climate Change, Freshwater Change, Novel Entities status labels (3 instances across 2 dashboards)
2. Missing values: Extinction Risk, Climate Stability (0%), Democracy (0.0), etc.
3. Average Survival Tier showing 0.0 when regions are 3.2-4.5

### 🟡 Medium Priority (Display/Formatting)
1. Floating point precision: "1.5499999999999996" instead of "1.55"
2. Decimal deaths: "1,313,282.511" instead of "1,313,283"
3. pH shown as percentage (98%) instead of actual pH value
4. Biodiversity Loss showing "15080%" instead of "150.80%"

### 🟢 Low Priority (Minor Issues)
1. Timeline month labels not showing numbers
2. Timeline month count mismatch (13 vs 6)
3. Unlocked technologies showing 0
4. Western Liberal and Indigenous paradigm metrics showing 0.0

---

## Recommendations

### Immediate Actions
1. **Fix QoL scale issue** - Determine correct scale and standardize across all dashboards
2. **Fix AI agent count logic** - Find why it's counting 53 instead of 20
3. **Fix planetary boundary status logic** - Implement correct threshold comparison

### Code Review Needed
- `src/components/dashboards/OverviewDashboard.tsx` - QoL display
- `src/components/dashboards/RegionsDashboard.tsx` - QoL display, Survival Tier calculation
- `src/components/dashboards/AIAgentsDashboard.tsx` - Agent count logic
- `src/components/dashboards/CrisisDashboard.tsx` - Status label logic, precision formatting
- `src/components/dashboards/EnvironmentalDashboard.tsx` - Status label logic
- `src/components/dashboards/ParadigmDashboard.tsx` - Western Liberal & Indigenous metrics
- `src/components/dashboards/TimelineDashboard.tsx` - Month display logic

### Testing Priority
1. Verify game state provides correct values (check `src/lib/gameState.ts`)
2. Verify dashboard components read from correct state fields
3. Add formatting utilities for numbers (rounding, precision control)
4. Add status calculation utilities (threshold comparison logic)
5. Standardize scales across all dashboards (QoL, survival tier, etc.)

---

## Notes
- All screenshots saved to `/logs/dashboard-*-*.png`
- Review performed with simulation RUNNING (Month 5-6, Seed 42000, HIST scenario)
- Most issues appear to be in the frontend wiring layer, not the simulation engine
- Detection dashboard is the only one fully wired correctly
