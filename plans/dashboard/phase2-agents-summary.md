# Phase 2: AI Agents Dashboard (4 Subplans)

## 2A: Agent Population Overview
**Agent:** 1 | **Duration:** 1-2 days | **API:** `/api/dashboard/agents`

**Components:**
- Agent count by lifecycle (training/testing/deployed/retired)
- Alignment distribution histogram
- Capability frontier tracking
- Sleeper count and detection rate
- Risk distribution

**Files:** `AgentPopulationOverview.tsx` (~120 lines)

---

## 2B: Individual Agent Cards
**Agent:** 2 | **Duration:** 2 days | **API:** `/api/dashboard/agents/:id`

**Components:**
- 20 agent cards (NOT just first!)
- 17-dimensional capability profile (heatmap, NOT radial)
- True vs revealed capabilities
- Alignment + resentment + risk score
- Lifecycle state + organization
- Click → detailed agent view

**Files:** `IndividualAgentCard.tsx`, `AgentDetailView.tsx` (~200 lines)

---

## 2C: Capability Matrix Heatmap
**Agent:** 3 | **Duration:** 2 days | **API:** `/api/dashboard/agents`

**Components:**
- 20 agents (rows) × 17 dimensions (cols) heatmap
- Color gradient for capability levels
- Technology diffusion ratchet effect
- Highlight deceptive agents (sandbagging/gaming)
- WebGL or Canvas rendering for performance

**Files:** `CapabilityMatrixHeatmap.tsx` (~200 lines)

---

## 2D: Sleeper Agent Analysis
**Agent:** 4 | **Duration:** 1-2 days | **API:** `/api/dashboard/agents`

**Components:**
- Active/dormant sleeper status
- Spread metrics (dark compute, open weights)
- Detection evidence chains
- Wake conditions
- Network graph of sleeper connections

**Files:** `SleeperAnalysis.tsx` (~150 lines)

---

**Total Effort:** 4 agents × 1-2 days = 4-8 days (parallelizable to 1-2 weeks)
