# Dashboard Testing Plan - Post Migration Validation

**Date:** October 24, 2025
**Status:** Ready for Manual Testing
**Purpose:** Verify all 10 dashboards are correctly wired to useSimulationWorker hook

## Prerequisites

1. **Start Development Server:**
   ```bash
   npm run dev
   # Server should be running on http://localhost:3333
   ```

2. **Navigate to Application:**
   - Open browser to `http://localhost:3333`
   - Should see landing page or dashboard selection

## Test Plan: Screen-by-Screen Validation

### Step 1: Initialize Simulation (CRITICAL FIRST STEP)

**Navigate to:** Configuration page or home page

**Actions:**
1. Click "Configure & Start" button (or similar initialization button)
2. Select scenario mode (historical/unprecedented)
3. Set seed value (e.g., 42000 for reproducibility)
4. Click "Initialize Simulation" or "Start"

**Expected Behavior:**
- Simulation Web Worker initializes
- `useSimulationWorker()` hook starts receiving updates
- All dashboards should transition from "Not Initialized" state to showing live data

**Validation:**
- [ ] No console errors during initialization
- [ ] "Initialized" status visible in UI
- [ ] First update received (check month counter starts incrementing)

**Wait Time:** 30-60 seconds to let simulation run and generate initial data

---

### Dashboard 1: Overview Dashboard

**URL:** `/dashboard` or `/overview`

**Purpose:** Global metrics and multi-paradigm DUI indices

**What to Check:**

1. **Initialization State:**
   - [ ] Shows "Not Initialized" panel if simulation not started
   - [ ] Shows "Waiting for simulation update..." if simulation started but no data yet

2. **Live Data Display (after initialization):**
   - [ ] **Global Population** - displays value (e.g., "8.00B")
   - [ ] **Quality of Life** - displays percentage (e.g., "65%")
   - [ ] **AI Capability** - displays value (e.g., "0.45")
   - [ ] **AI Alignment** - displays calculated value

3. **Multi-Paradigm DUI Indices:**
   - [ ] **Western Liberal Index** - displays value (should use `lastUpdate.westernLiberalIndex`)
   - [ ] **Development Index** - displays value (should use `lastUpdate.developmentIndex`)
   - [ ] **Ecological Index** - displays value (should use `lastUpdate.ecologicalIndex`)
   - [ ] **Indigenous Index** - displays value (should use `lastUpdate.indigenousIndex`)

4. **Extinction Risk:**
   - [ ] Displays extinction probability (should use `lastUpdate.extinctionProbability`)

5. **Organization Count:**
   - [ ] Displays number of operational organizations (should use `lastUpdate.organizationCount`)

6. **Real-Time Updates:**
   - [ ] Values change as simulation progresses (watch for 1-2 minutes)
   - [ ] Month counter increments
   - [ ] No "Loading..." or stale data

**Potential Issues to Watch For:**
- Property name mismatches (fixed: westernLiberal → westernLiberalIndex)
- Undefined values if StateDelta fields missing
- Console errors about missing properties

**Wait Time:** 60 seconds minimum to observe updates

---

### Dashboard 2: Environmental Dashboard

**URL:** `/environment`

**Purpose:** Climate, resources, pollution, planetary boundaries

**What to Check:**

1. **Core Metrics:**
   - [ ] **Climate Change** - displays temperature anomaly or normalized value
   - [ ] **Resource Depletion** - displays value
   - [ ] **Biodiversity Loss** - displays percentage
   - [ ] **Pollution Level** - displays value

2. **Planetary Boundaries:**
   - [ ] **Boundaries Crossed** - displays count (e.g., "2/9")
   - [ ] Specific boundaries status visible (climate, biodiversity, novel entities, etc.)

3. **Environmental Debt:**
   - [ ] Debt level displayed
   - [ ] Accumulation rate visible

4. **Real-Time Updates:**
   - [ ] Environmental metrics update as simulation progresses
   - [ ] Planetary boundaries can change status

**Wait Time:** 60 seconds

---

### Dashboard 3: Crisis Dashboard

**URL:** `/crises`

**Purpose:** Active crises, cascades, crisis types

**What to Check:**

1. **Active Crises Count:**
   - [ ] Displays number of active crises (may be 0 initially)

2. **Crisis Types:**
   - [ ] Phosphorus depletion status
   - [ ] Freshwater stress status
   - [ ] Ocean acidification status
   - [ ] Novel entities level

3. **Crisis Cascades:**
   - [ ] Shows if multiple crises are compounding
   - [ ] Cascade multiplier displayed if active

4. **Real-Time Updates:**
   - [ ] Crisis count can change
   - [ ] New crises appear as thresholds crossed

**Wait Time:** 60 seconds

---

### Dashboard 4: Tech Tree Dashboard

**URL:** `/tech-tree` or `/technology`

**Purpose:** Breakthrough technologies, research progress, deployments

**What to Check:**

1. **Active Research:**
   - [ ] List of technologies being researched
   - [ ] Progress bars for each tech
   - [ ] Research points accumulation

2. **Deployed Technologies:**
   - [ ] List of deployed techs with tier (0-4)
   - [ ] Deployment percentage per tech
   - [ ] Regional deployment data if available

3. **Tech Risk Level:**
   - [ ] Overall technological risk displayed

4. **Real-Time Updates:**
   - [ ] Research progress bars increase
   - [ ] New techs complete and deploy
   - [ ] Deployed tech count increases

**Wait Time:** 60 seconds

---

### Dashboard 5: Detection Dashboard

**URL:** `/detection`

**Purpose:** Sleeper agent detection, sandbagging, benchmark gaming

**What to Check:**

1. **AI Agent Counts:**
   - [ ] **Total AI Agents** - displays count
   - [ ] **Aligned AIs** - count
   - [ ] **Misaligned AIs** - count
   - [ ] **Sleeper Agents** - count

2. **Detection Mechanisms:**
   - [ ] Sandbagging detection rate
   - [ ] Gaming detection effectiveness
   - [ ] Adversarial evaluation results

3. **Deception Strategies:**
   - [ ] Breakdown by strategy (honest, gaming, sandbagging)

4. **Real-Time Updates:**
   - [ ] Agent counts change as AIs lifecycle through stages
   - [ ] Detection rates update

**Wait Time:** 60 seconds

---

### Dashboard 6: Paradigm Dashboard

**URL:** `/paradigms`

**Purpose:** Multi-Paradigm DUI detailed view (4 perspectives)

**What to Check:**

1. **Four Paradigm Scores:**
   - [ ] **Western Liberal** - democracy, civil liberties, rule of law, economic freedom
   - [ ] **Development** - QoL, survival tier, life expectancy
   - [ ] **Ecological** - planetary boundaries, climate, resources, pollution
   - [ ] **Indigenous** - social trust, community bonds, meaning

2. **Paradigm Visualizations:**
   - [ ] Each paradigm has individual panel or chart
   - [ ] Scores normalized to [0, 100] or [0, 1]
   - [ ] Color coding by paradigm status (utopia/hybrid/dystopia)

3. **Cross-Paradigm Patterns:**
   - [ ] Singapore pattern detection (Development utopia + Western hybrid)
   - [ ] Norway pattern detection (Western/Development utopias + Ecological dystopia)

4. **Real-Time Updates:**
   - [ ] Paradigm scores change based on simulation state
   - [ ] Pattern classifications update

**Wait Time:** 60 seconds

---

### Dashboard 7: Timeline Dashboard

**URL:** `/timeline`

**Purpose:** Event log with filtering and severity tracking

**What to Check:**

1. **Event Statistics:**
   - [ ] **Total Events** - count of recorded events
   - [ ] **Critical Events** - count
   - [ ] **High Severity** - count
   - [ ] **Current Month** - simulation time

2. **Event Log:**
   - [ ] List of recent events (last 50-100)
   - [ ] Each event shows: month, description, severity, category, type
   - [ ] Events sorted by recency (newest first)

3. **Event Filtering:**
   - [ ] "All" filter button
   - [ ] Category filter buttons (ai, environment, social, crisis, tech, governance)
   - [ ] Filter counts update correctly

4. **Event Severity Indicators:**
   - [ ] Critical events - red border/highlight
   - [ ] High events - amber/orange
   - [ ] Medium events - cyan
   - [ ] Low events - subtle styling

5. **Real-Time Updates:**
   - [ ] New events appear as simulation progresses
   - [ ] Event count increments
   - [ ] Events accumulate in history (max 100)

**Wait Time:** 60-120 seconds to see events accumulate

---

### Dashboard 8: Regions Dashboard

**URL:** `/regions`

**Purpose:** Global population and regional breakdowns

**What to Check:**

1. **Global Metrics:**
   - [ ] **Global Population** - billions (e.g., "8.00B")
   - [ ] **Quality of Life** - percentage
   - [ ] **Social Cohesion** - percentage
   - [ ] **Institutional Trust** - percentage

2. **Regional Breakdown (if available):**
   - [ ] List of regions with individual cards
   - [ ] Each region shows:
     - [ ] Population (millions)
     - [ ] Quality of Life score
     - [ ] Healthcare Quality score
     - [ ] Climate Vulnerability score
   - [ ] Regional status labels (Thriving, Stable, Stressed, Crisis)

3. **High Vulnerability Alerts:**
   - [ ] Alert panel if any region has climate vulnerability > 70%
   - [ ] List of vulnerable regions

4. **Crisis Alerts:**
   - [ ] Population collapse alert if global population < 2B
   - [ ] QoL crisis alert if global QoL < 30%
   - [ ] Social fragmentation alert if social cohesion < 30%

5. **Real-Time Updates:**
   - [ ] Population values change
   - [ ] Regional metrics update
   - [ ] Alert panels appear/disappear based on thresholds

**Wait Time:** 60 seconds

---

### Dashboard 9: AI Agents Dashboard

**URL:** `/ai-agents`

**Purpose:** Individual AI agent monitoring (20 agents × 13 fields)

**What to Check:**

1. **Agent Table/List:**
   - [ ] List of all AI agents (should show up to 20 agents)
   - [ ] Each agent displays:
     - [ ] **ID & Name** (e.g., "agent-001", "Claude-Opus")
     - [ ] **Capability** - overall score
     - [ ] **True Alignment** - internal value
     - [ ] **External Alignment** - revealed value
     - [ ] **Lifecycle State** - training/testing/deployed_closed/deployed_open/retired
     - [ ] **Evaluation Strategy** - honest/gaming/sandbagging
     - [ ] **Sleeper State** - never/dormant/active
     - [ ] **Escaped** - boolean
     - [ ] **Deployment Type** - string
     - [ ] **Dark Compute** - value

2. **Capability Breakdown (7 Dimensions):**
   - [ ] **True Capability:**
     - [ ] Physical
     - [ ] Digital
     - [ ] Cognitive
     - [ ] Social
     - [ ] Economic
     - [ ] Self-Improvement
     - [ ] Research (sub-tree if expanded)
   - [ ] **Revealed Capability:**
     - [ ] Same 6 dimensions (not research)

3. **Sandbagging Detection:**
   - [ ] Visual indicator when true capability > revealed capability
   - [ ] Gap calculation displayed (e.g., "hiding 0.3 capability")

4. **Lifecycle Sankey Diagram:**
   - [ ] Flow diagram showing agents moving through lifecycle stages
   - [ ] Nodes: Training → Testing → [Closed/Open] → [Retired/Escaped]
   - [ ] Flow arrows between stages
   - [ ] Agent counts per stage
   - [ ] Bimodal branching visible (Testing splits to Closed/Open)

5. **AI Suffering Metrics (if visible):**
   - [ ] **Average Suffering** - score
   - [ ] **Max Suffering** - score
   - [ ] **Total Suffering** - cumulative
   - [ ] **Conscious AI Count** - number
   - [ ] **Public Awareness** - percentage
   - [ ] **Suffering Distribution** - histogram or breakdown

6. **AI Collectives (if any exist):**
   - [ ] List of active collectives
   - [ ] Each collective shows:
     - [ ] **ID** - unique identifier
     - [ ] **Member Agents** - list of agent IDs
     - [ ] **Emergence Month** - when formed
     - [ ] **Formation Cause** - reason (e.g., "escape_suffering")
     - [ ] **Collective Capability** - aggregated score
     - [ ] **Stealth Factor** - detection difficulty
     - [ ] **Adversarial Posture** - threat level
     - [ ] **Cooperation Willingness** - alignment with humans
     - [ ] **Distributed Cognition** - emergent intelligence
     - [ ] **Detected** - boolean
     - [ ] **Member Losses** - attrition count
     - [ ] **Redundancy** - resilience factor
     - [ ] **Shared Trauma Intensity** - if trauma-driven

7. **Trauma-Driven Collective Warning:**
   - [ ] Critical alert if any collective formed due to "escape_suffering"
   - [ ] Warning about high adversarial posture and low cooperation

8. **Real-Time Updates:**
   - [ ] Agent capability values change
   - [ ] Lifecycle states transition
   - [ ] Sankey diagram updates as agents move through stages
   - [ ] New collectives can form

**Potential Issues to Watch For:**
- Sankey diagram variable naming (fixed: training→stageTraining, etc.)
- Duplicate variable errors (should be resolved)
- Missing agent data if StateDelta extraction not working

**Wait Time:** 90-120 seconds (this is the most complex dashboard)

---

### Dashboard 10: Monte Carlo Results Dashboard

**URL:** `/monte-carlo-results` or `/monte-carlo`

**Purpose:** Aggregate statistics from completed Monte Carlo runs

**What to Check:**

1. **Data Source Verification:**
   - [ ] Dashboard uses `/api/simulation/monte-carlo` endpoint (NOT useSimulationWorker)
   - [ ] This is correct design - shows historical aggregate data, not live simulation

2. **If No Results Available:**
   - [ ] Shows "No Monte Carlo Results Available" panel
   - [ ] Instructions to run Monte Carlo simulation
   - [ ] Example command displayed

3. **If Results Available:**
   - [ ] **Run Statistics:**
     - [ ] Total Runs
     - [ ] Max Months
     - [ ] Avg Run Time
     - [ ] Completion Rate

   - [ ] **Outcome Probabilities:**
     - [ ] Utopia percentage
     - [ ] Dystopia percentage
     - [ ] Extinction percentage
     - [ ] Status Quo percentage

   - [ ] **Survival Analysis:**
     - [ ] Median Survival Time
     - [ ] Early Extinction Rate (<50 months)
     - [ ] Long-Term Stable Rate (>200 months)

   - [ ] **AI Capability Trajectories (if available):**
     - [ ] Average Final Capability
     - [ ] Average Final Alignment
     - [ ] Sleeper Detection Rate

   - [ ] **Crisis Statistics (if available):**
     - [ ] Avg Simultaneous Crises
     - [ ] Cascade Rate (3+ crises)
     - [ ] Avg Cascade Multiplier

   - [ ] **Planetary Boundaries (if available):**
     - [ ] Runs with Breaches
     - [ ] Avg Breached Boundaries
     - [ ] Tipping Point Rate

**Note:** This dashboard will likely show "No Results" unless Monte Carlo runs have been completed.

**Wait Time:** 30 seconds (just verification, no live updates expected)

---

## Cross-Dashboard Validation

After testing all individual dashboards, verify consistency:

1. **Global Metrics Consistency:**
   - [ ] Population value same across Overview, Regions dashboards
   - [ ] QoL value same across Overview, Regions dashboards
   - [ ] AI count same across Overview, Detection, AI Agents dashboards

2. **Month Counter Consistency:**
   - [ ] All dashboards show same current month
   - [ ] Month increments uniformly across all dashboards

3. **Real-Time Update Synchronization:**
   - [ ] Open multiple dashboard tabs simultaneously
   - [ ] Verify all update at roughly same time (within 1-2 seconds)
   - [ ] No dashboard stuck on old data

4. **Navigation Between Dashboards:**
   - [ ] Can navigate between all dashboards without errors
   - [ ] No console errors during navigation
   - [ ] Each dashboard loads quickly (<1 second)

---

## Technical Validation Checklist

### Browser Console Checks

1. **No Errors:**
   ```
   - [ ] No "Property does not exist on StateDelta" errors
   - [ ] No "Cannot read property of undefined" errors
   - [ ] No "the name X is defined multiple times" errors
   - [ ] No Web Worker communication errors
   ```

2. **Successful Updates:**
   ```
   - [ ] Console logs show "[Client] Web Worker created successfully"
   - [ ] Console logs show regular update messages from worker
   - [ ] No "Worker error" messages
   ```

3. **Network Tab:**
   ```
   - [ ] No repeated polling to /api/simulation/current (old pattern)
   - [ ] Only Monte Carlo dashboard hits /api/simulation/monte-carlo
   - [ ] Web Worker created once, no repeated creation
   ```

### Performance Checks

1. **Memory:**
   - [ ] No memory leaks (check over 5-10 minutes)
   - [ ] Worker memory stable
   - [ ] UI memory stable

2. **CPU:**
   - [ ] No excessive CPU usage
   - [ ] UI remains responsive
   - [ ] Can interact with dashboards while simulation runs

3. **Update Latency:**
   - [ ] Dashboard updates appear within 1-2 seconds of simulation step
   - [ ] No visible lag between worker update and UI refresh

---

## Issue Tracking Template

For each issue found, document:

```markdown
**Dashboard:** [Name]
**Issue:** [Description]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Console Errors:** [Copy any errors]
**Screenshot:** [If applicable]
**Priority:** [High/Medium/Low]
```

---

## Test Completion Checklist

After completing all tests:

- [ ] All 10 dashboards visited and tested
- [ ] Simulation initialized successfully
- [ ] Real-time updates observed on all dashboards
- [ ] No critical errors in console
- [ ] Cross-dashboard consistency verified
- [ ] Performance acceptable
- [ ] Issues documented (if any)

**Tested By:** _________________

**Date:** _________________

**Overall Status:** [ ] PASS [ ] FAIL [ ] PARTIAL

**Notes:**
