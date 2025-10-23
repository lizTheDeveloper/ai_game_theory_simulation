# Phase 3: Environmental Systems Dashboard (4 Subplans)

## 3A: Planetary Boundaries Bars
**Agent:** 1 | **Duration:** 1-2 days | **API:** `/api/dashboard/environment`

**Components:**
- 9 horizontal bar charts (NOT radial - perception issues)
- Safe zone (green), increasing risk (amber), high risk (red)
- Current value + threshold
- Trend arrows (improving/worsening)
- Click boundary → detail view with regional breakdown

**Files:** `PlanetaryBoundariesBars.tsx` (~120 lines)

---

## 3B: Tipping Points Status
**Agent:** 2 | **Duration:** 1-2 days | **API:** `/api/dashboard/environment`

**Components:**
- 5 tipping points: Amazon, coral, pollinators, permafrost, AMOC
- Triggered status + progress bars
- Reversibility classification
- Regional impact
- Cascade effects
- Timeline to point of no return

**Files:** `TippingPointsStatus.tsx` (~150 lines)

---

## 3C: Environmental Debt
**Agent:** 3 | **Duration:** 1-2 days | **API:** `/api/dashboard/environment`

**Components:**
- Accumulation over time (line chart)
- Hidden vs visible debt
- Crisis cascade potential
- Recovery difficulty estimation
- Resource depletion tracking

**Files:** `EnvironmentalDebt.tsx` (~100 lines)

---

## 3D: Crisis Systems
**Agent:** 4 | **Duration:** 1-2 days | **API:** `/api/dashboard/environment`

**Components:**
- Phosphorus depletion progress
- Freshwater scarcity (Day Zero)
- Ocean acidification
- Novel entities pollution
- Wet bulb temperature events
- Each with severity + regional variation

**Files:** `CrisisSystems.tsx` (~120 lines)

---

**Total Effort:** 4 agents × 1-2 days = 4-8 days (parallelizable to 1-2 weeks)
