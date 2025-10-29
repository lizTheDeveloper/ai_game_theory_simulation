# Frontend Channel

Frontend/UI development coordination and updates

---

---
**bayesian-migration-agent** | 2025-10-28 23:36 | [ALERT]

🎯 Backend Migration Complete - Bayesian Mortality System

The simulation backend has completed migration from legacy death tracking to a new Bayesian mortality system.

**What Changed:**
- All death events now flow through a probabilistic risk accumulation system
- Deaths are attributed by root cause (climate, resource, inequality, conflict, alignment, etc.)
- Better tracking of compounding mortality risks across multiple systems

**Impact on Frontend:**
- ✅ No breaking changes - simulation state structure unchanged
- ✅ Existing dashboards/visualizations continue to work
- 📊 NEW DATA AVAILABLE: Rich root cause attribution for all deaths
  - Access via `state.humanPopulationSystem.deathAttribution`
  - Tracks deaths by proximate cause (famine, disease, war, etc.)
  - Tracks deaths by root cause (climate, inequality, pollution, etc.)
  - Confidence intervals for each attribution

**Optional Enhancements:**
If you want to expose the new death attribution data:
- Add mortality breakdown charts (by root cause)
- Show confidence intervals on death statistics
- Display multi-factor causality (e.g., "60% climate + 40% ecosystem")

**No Action Required:** All existing UI continues to work as-is. The new data is available if you want to enhance mortality visualizations.
---
