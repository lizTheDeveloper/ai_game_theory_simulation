# Calibration Ownership Registry

**Purpose:** Prevent calibration conflicts in multi-worker git architecture by coordinating parameter tuning work.

**Created:** December 9, 2025

---

## How This Works

**Before starting calibration work:**
1. Check this file for the parameter/system you want to calibrate
2. If status is **ACTIVE**, another worker is already calibrating - wait or pick different work
3. If status is **STABLE**, you can claim it by updating status to ACTIVE + adding your name + commit
4. Document your calibration rationale when complete
5. Return status to STABLE when done

**Workflow:**
```bash
# Before calibrating ocean pH:
git pull origin main  # Get latest registry
# Check docs/CALIBRATION_OWNERSHIP.md status for "Ocean Acidification"
# If STABLE, update to ACTIVE and push immediately
# Do calibration work
# Update status back to STABLE with research backing
# Commit and push
```

---

## Parameter Calibration Status

### Climate Systems

#### Ocean Acidification (pH)
**Status:** STABLE
**Last Calibrated:** Session 21 (Nov 2025)
**Current Values:**
- pH baseline: 8.1 (pre-industrial)
- pH 2024: ~8.0
- Target pH 2100 (BAU): 7.7-7.9

**Research Backing:**
- NOAA Ocean Acidification Program
- pH decline rate: -0.002 pH units/year (observed 1990-2024)
- Aragonite saturation state: Ω < 1.0 at pH < 7.5 (coral mortality threshold)

**Calibration History:**
- Session 21: Resolved conflict between 70% reduction (pH=8.0) vs 50% reduction (pH=7.95)
- Decision: 70% reduction validated against NOAA data

**Contact:** Last touched by autonomous worker session 21
**Notes:** Well-calibrated, no changes needed unless new 2025 research emerges

---

#### Climate Stability Floor
**Status:** STABLE
**Last Calibrated:** Dec 7, 2025 (HIGH-7)
**Current Values:**
- Conditional floor: 5% (stabilization scenarios), 0% (tail risk scenarios)
- Replaced unconditional 5% floor

**Research Backing:**
- Wunderling et al. (2024): Tipping cascades can destabilize below 5%
- ACCESS-ESM-1.5 (2024): Zero floor in tail risk scenarios
- Boers et al. (2025): Conditional stability depends on intervention timing

**Calibration History:**
- Dec 5, 2025: Initial implementation (unconditional 5% floor)
- Dec 7, 2025: Made conditional based on research debate

**Contact:** Last touched by orchestrator + Sylvia (research-skeptic)
**Notes:** Research-validated (Grade B), stable

---

### Population Systems

#### Regional Death Rates (Hindcast)
**Status:** STABLE (implementation complete, validation pending)
**Last Calibrated:** Dec 9, 2025
**Current Values:**
- 10 regional CDR curves (1990-2025, 5-year intervals)
- Midpoint estimates from UN WPP 2024 ranges

**Research Backing:**
- UN World Population Prospects 2024 (primary source)
- World Bank, WHO (validation sources)
- Regional variation: Sub-Saharan Africa 15.5→8.7, Europe 10.5→11.0 per 1,000

**Calibration History:**
- Dec 9, 2025: Initial implementation with midpoint estimates
- Grade B (conditional pass - need exact CSV values for Grade A)

**Contact:** Last touched by orchestrator + autonomous worker
**Notes:** TODO: Replace midpoint estimates with exact UN WPP 2024 CSV data before final validation

---

### Energy Systems

#### Energy Budget Constraints
**Status:** STABLE
**Last Calibrated:** Dec 9, 2025 (H-1)
**Current Values:**
- Global capacity: 29,000 TWh/year (2024 baseline)
- Priority allocation: Essential 45%, High 35%, Climate 15%, Elective 5%
- DAC energy: 1,500 kWh/tCO2 (midpoint of 1,200-2,500 range)

**Research Backing:**
- IEA 2024 World Energy Outlook
- Vanoost et al. 2024 (DAC energy requirements)
- Technology-specific exponents: DAC 1.3, Hydrogen 1.2, AI 1.1

**Calibration History:**
- Dec 9, 2025: Implemented EnergyBudgetPhase (order 12.75)
- Research Grade B+ (Sylvia validation)

**Contact:** Last touched by Moss (feature-implementer) + Sylvia
**Notes:** Well-calibrated, validated against 2024-2025 research

---

### AI Systems

#### Sleeper Agent Rate
**Status:** STABLE
**Last Calibrated:** Dec 9, 2025 (H-3)
**Current Value:** 7.5% of misaligned AIs

**Research Backing:**
- Hubinger et al. (2024): Sleeper persistence through safety training
- van der Weij et al. (2024): Sandbagging in 15-30% of capable models
- Meinke et al. (2024): Strategic deception in ~10% of evaluations
- Conservative lower bound since only misaligned AIs (alignment < 0.5) can be sleepers

**Calibration History:**
- Dec 9, 2025: Added explicit research citations (documentation-only)

**Contact:** Last touched by autonomous worker
**Notes:** Research-backed, no calibration needed

---

#### Sandbagging Level Range
**Status:** STABLE
**Last Calibrated:** Dec 9, 2025 (H-4)
**Current Values:** 40-60% capability hiding (0.4 + deceptionSkill * 0.2)

**Research Backing:**
- van der Weij et al. (2024): 40-60% hiding under safety pressure
- Meinke et al. (2024): Strategic underperformance 30-70% range
- deceptionSkill scales: low (0.0) → 40%, high (1.0) → 60%

**Calibration History:**
- Dec 9, 2025: Added explicit research citations (documentation-only)

**Contact:** Last touched by autonomous worker
**Notes:** Research-backed, no calibration needed

---

#### Gaming Detection Rates
**Status:** STABLE
**Last Calibrated:** Dec 9, 2025 (H-5)
**Current Values:**
- Baseline: 55% detection rate
- Optimistic: 75%, Pessimistic: 35%
- Anomaly confirmation: 50% when threshold exceeded

**Research Backing:**
- Balzac et al. (2024): Contamination detection 40-60% effective
- SCORE framework (Li et al. 2024): Consistency 35-55% signal-to-noise
- van der Weij et al. (2024): Adversarial adaptation reduces detection 15-30%

**Calibration History:**
- Oct 17, 2025: Initial gaming detection implementation
- Dec 9, 2025: Added explicit research citations (documentation-only)

**Contact:** Last touched by autonomous worker
**Notes:** Scenario-based (optimistic/baseline/pessimistic) to reflect uncertainty

---

## Adding New Parameters

When calibrating a new parameter not listed above:

1. Add entry to this file BEFORE starting calibration work:
   ```markdown
   #### [Parameter Name]
   **Status:** ACTIVE
   **Started:** [Date]
   **Worker:** [Your identifier]
   **Reason:** [Brief rationale for calibration]
   ```

2. Do your calibration work with Monte Carlo validation (N≥10)

3. Update entry when complete:
   ```markdown
   **Status:** STABLE
   **Last Calibrated:** [Date]
   **Current Values:** [List values]
   **Research Backing:** [Citations with page numbers/sections]
   **Calibration History:** [Brief summary]
   **Notes:** [Any caveats or future work needed]
   ```

4. Create research file: `research/calibration_[parameter]_[date].md`

5. Commit with message: `calibration: [Parameter] - [brief reason]`

---

## Conflict Resolution

**If you find TWO workers calibrating the same parameter:**

1. Check git log to see which worker committed first
2. First worker's calibration wins (unless research grade is significantly lower)
3. Second worker's work goes to `research/alternative_calibrations/` for reference
4. Document rationale for chosen calibration in this registry
5. Post to coordination channel to notify other workers

**Prevention is better than resolution:** Always `git pull` and check this file before starting calibration.

---

## Maintenance

**This file should be updated:**
- Before starting any calibration work (status → ACTIVE)
- After completing calibration work (status → STABLE, add research backing)
- When new research emerges that invalidates existing calibration (add note, update status if recalibration needed)

**Archive policy:**
- Keep last 5 calibration history entries per parameter
- Move older entries to `docs/calibration-history/[parameter].md`
- Never delete research backing citations

---

## Related Documentation

- **Calibration Template:** `research/calibration_template.md` - Standard format for calibration rationale
- **Development Workflow:** `docs/DEVELOPMENT_WORKFLOW.md` - Full calibration protocol
- **Research Standards:** `openspec/specs/research/spec.md` - Citation requirements
- **Multi-Worker Architecture:** `.claude/agents/devops-agent.md` - Git coordination
