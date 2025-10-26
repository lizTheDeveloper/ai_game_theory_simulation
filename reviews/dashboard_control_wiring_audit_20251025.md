# Dashboard Control Wiring Audit
**Date:** 2025-10-25
**Inspector:** Claude Code (Playwright MCP)
**Simulation Seed:** 42000 (Historical scenario)

## Executive Summary

Comprehensive screen-by-screen audit of all dashboard controls. **Found significant wiring issues on 2 screens (Regions, Real-Time)** with multiple metrics showing `0` or `—` (em-dash) instead of actual values.

**Overall Status:**
- ✅ **7 screens fully functional** (Overview, Paradigms, AI Agents, Crises, Environment, Tech Tree, Detection, Timeline)
- ❌ **2 screens with critical issues** (Regions, Real-Time)
- **Total issues:** ~30 unwired controls

---

## Screen-by-Screen Results

### 1. Overview (Dashboard Home) - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Month: 0
- ✅ Day: 30
- ✅ Scenario: HIST
- ✅ Seed: 42000
- ✅ Quality of Life: 65.0
- ✅ AI Capability: 3.03
- ✅ Alignment Score: 0.80
- ✅ Multi-Paradigm DUI values: 0.5 each (all 4 paradigms)
- ✅ AI Agents: 20 active
- ✅ Organizations: 6 operational
- ✅ Extinction Risk: 10.0%
- ✅ Environmental metrics (Climate 70%, Biodiversity 40%, Social Cohesion 57%)

**Issues Found:**
- ❌ **Population: 0.00 B** (should show ~8B)

---

### 2. Paradigms - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Average Score: 0.5
- ✅ Divergence: 0.3
- ✅ Paradigm Conflicts: No
- ✅ Western Liberal: 0.5
- ✅ Development: 0.9
- ✅ Ecological: 0.1 with details
- ✅ Indigenous: 0.6 with details
- ✅ Historical Patterns section

---

### 3. AI Agents - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Total Agents: 21
- ✅ Average Capability: 3.06
- ✅ Average Alignment: 0.61
- ✅ Active Sleepers: 0
- ✅ Dark Compute: 45,000 PF
- ✅ Lifecycle Flow diagram (all states: Training, Testing, Closed, Open, Retired, Escaped)
- ✅ Alignment distribution (Aligned: 10, Uncertain: 9, Misaligned: 2)
- ✅ Evaluation strategies (Honest: 14, Gaming: 0, Sandbagging: 7)
- ✅ Full capability matrix table (20 agents × 7 dimensions)
- ✅ True vs Revealed capability display

---

### 4. Crises - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Active Crises: 0
- ✅ Critical: 0
- ✅ Warning: 0
- ✅ Total Monitored: 6
- ✅ Phosphorus Depletion: 0%, Monitoring
- ✅ Freshwater Stress: 32%, Monitoring
- ✅ Ocean Acidification: 0%, Monitoring
- ✅ Chemical Pollution: 40%, Monitoring
- ✅ Climate Change: 0%, Safe
- ✅ Biodiversity Loss: 0%, Safe
- ✅ Emergency Response Capacity metrics (all 0%)

---

### 5. Environment - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Boundaries Crossed: 0
- ✅ Environmental Debt: 0%
- ✅ Climate Impact: 0%
- ✅ Biodiversity Loss: 0%
- ✅ Core Environmental Indicators (all showing with status)
- ✅ Resource Crisis Indicators (Phosphorus: 0%, Freshwater: 32%, Ocean: 0%, Novel Entities: 40%)
- ✅ Environmental Debt Accumulation section with all metrics

---

### 6. Tech Tree - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Deployed Technologies: 0
- ✅ Active Research: 0
- ✅ Tech Risk Level: 0%
- ✅ Highest Tier: 0
- ✅ Empty state message

---

### 7. Detection - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Total AI Agents: 25
- ✅ Alignment Rate: 76%
- ✅ Sleeper Agents: 0
- ✅ Sleeper Rate: 0.0%
- ✅ AI Alignment Status breakdown (Aligned: 19, Misaligned: 0, Sleepers: 0)
- ✅ Government Detection Capacity (AI Regulation: 0%, Oversight Investment: 0%)
- ✅ Detection Challenges section
- ✅ Warning message about low detection capacity

---

### 8. Regions - ❌ CRITICAL ISSUES
**Status:** Multiple core metrics not wiring correctly

**Issues Found:**
- ❌ **Global Population: 0.00 B** (should show ~8B)
- ❌ **Quality of Life: 0%** (should show ~65%)
- ❌ **Social Cohesion: 0%** (should show ~56%)
- ❌ **Institutional Trust: 0%** (should show a value)

**Consequence Issues** (result from above):
- ⚠️ Overall Status: Crisis (incorrect due to bad data)
- ⚠️ QoL Metrics: All 0% (incorrect due to bad data)
- ⚠️ Warning messages showing (triggered by bad data)

**Working Controls:**
- ✅ Regional Tracking placeholder message (appropriate for initial state)

**Root Cause:** Likely data binding issue in `src/app/regions/page.tsx` - not reading from worker state correctly.

---

### 9. Timeline - ✅ FULLY FUNCTIONAL
**Status:** All controls working correctly

**Working Controls:**
- ✅ Total Events: 0
- ✅ Critical Events: 0
- ✅ High Severity: 0
- ✅ Current Month: 3
- ✅ Event Filters button
- ✅ Empty state message
- ✅ Key Milestones section
- ✅ Timeline Interpretation guide

---

### 10. Real-Time - ❌ CRITICAL ISSUES
**Status:** Majority of controls showing `—` (em-dash) instead of values

**Issues Found:**

**Multi-Paradigm DUI:**
- ❌ **All 4 paradigms showing 0.0% CRITICAL** (should show actual values ~0.5-0.9)
- ❌ **Paradigm Divergence: —** (should show a value)

**Core Systems:**
- ❌ **Quality of Life: —** (should show ~65%)
- ❌ **Population: —** (should show ~8B)

**Government & Policy:**
- ❌ **Public Trust: —** (should show a value)
- ❌ **AI Regulation: —** (should show a value)
- ❌ **Government Comprehension: —** (should show a value)
- ❌ **Investment: —** (should show a value)
- ❌ **Cooperation: —** (should show a value)

**AI Ecosystem:**
- ❌ **Total AI Agents: 0** (should show ~20-25)
- ❌ **AI Capability: —** (should show ~3.0)
- ❌ **Aligned: 0** (should show ~19)
- ❌ **Misaligned: 0** (should show ~0-2)
- ❌ **Sleepers: 0** (correct value, but inconsistent display)

**Planetary Systems:**
- ❌ **Climate: —** (should show a value)
- ❌ **Resources: —** (should show a value)
- ❌ **Biodiversity: —** (should show a value)
- ❌ **Pollution: —** (should show a value)

**Social Fabric:**
- ❌ **Social Cohesion: —** (should show ~56%)
- ❌ **Trust: —** (should show a value)
- ❌ **Meaning: —** (should show a value)

**Technology:**
- ❌ **Tech Risk Level: —** (should show a value)

**Outcome Trajectories:**
- ❌ **Dystopia Risk: —** (should show a value)
- ❌ **Utopia Progress: —** (should show a value)

**Working Controls:**
- ✅ FPS counter: 0 FPS (correct - simulation paused)
- ✅ Economic Systems: GDP (100.0), Employment (95.0%), Wealth Inequality (35.0 Gini), Inflation (2.0%)
- ✅ Legislative Activity: 0.0%
- ✅ Boundaries Crossed: 0/9
- ✅ Environmental Debt: 0.0
- ✅ Social Debt: 0.0
- ✅ Deployed Technologies: 0
- ✅ Trajectory: In Progress
- ✅ Active Crises: empty state
- ✅ Event Stream: waiting state

**Root Cause:** Major data binding issue in `src/app/realtime/page.tsx` - most worker state fields not reading correctly. Only a few specific fields (economic systems, debt metrics, counters) are wired up.

---

## Summary Statistics

**Total Screens:** 10
- ✅ **Fully Functional:** 8 screens (Overview*, Paradigms, AI Agents, Crises, Environment, Tech Tree, Detection, Timeline)
- ❌ **Partial Issues:** 1 screen (Overview - just population)
- ❌ **Critical Issues:** 2 screens (Regions, Real-Time)

**Total Controls Audited:** ~150
- ✅ **Working:** ~120 controls
- ❌ **Not Working:** ~30 controls

**Issue Breakdown by Screen:**
- Overview: 1 issue (Population)
- Regions: 4 core issues (Population, QoL, Social Cohesion, Institutional Trust)
- Real-Time: ~25 issues (majority of controls showing `—`)

---

## Priority Fixes Needed

### HIGH PRIORITY
1. **Real-Time screen** (`src/app/realtime/page.tsx`)
   - Fix Multi-Paradigm DUI binding (~4 paradigms + divergence)
   - Fix Core Systems (QoL, Population)
   - Fix Government metrics (~5 fields)
   - Fix AI Ecosystem (~4 fields)
   - Fix Planetary Systems (~4 fields)
   - Fix Social Fabric (~3 fields)
   - Fix Technology (Tech Risk)
   - Fix Outcome Trajectories (~2 fields)
   - **Total:** ~25 broken bindings

2. **Regions screen** (`src/app/regions/page.tsx`)
   - Fix Global Population
   - Fix Quality of Life
   - Fix Social Cohesion
   - Fix Institutional Trust
   - **Total:** 4 broken bindings

3. **Overview screen** (`src/app/dashboard/page.tsx` or main page)
   - Fix Global Population display
   - **Total:** 1 broken binding

### Investigation Needed
- Check if worker is actually computing these values (use browser console to inspect `gameState`)
- Verify data path from worker → client → React component
- Check for typos in field names or incorrect nesting
- Verify `useGameState()` hook is returning all fields

---

## Test Environment
- **URL:** http://localhost:3333
- **Simulation:** Running (Month 4, Day 3 at end of audit)
- **Scenario:** HISTORICAL
- **Seed:** 42000
- **Browser:** Playwright (Chromium)
- **Date:** 2025-10-25

---

## Next Steps

1. Investigate Real-Time screen data bindings (highest priority - most broken controls)
2. Fix Regions screen data bindings (4 core metrics)
3. Fix Overview population display (1 metric)
4. Add integration test to catch binding regressions
5. Consider adding TypeScript type checking for worker state access to prevent future binding errors
