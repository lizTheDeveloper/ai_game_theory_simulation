# Success Path Mapping

**Purpose:** Document the CONDITIONS that lead to positive outcomes (utopia, humane dystopia) rather than just documenting failure modes.

**Methodology:** Run N=10 simulations with random seeds, track state snapshots at critical months, analyze inflection points in successful runs.

---

## Overview

The simulation can achieve positive outcomes, but success is not guaranteed. Understanding the **minimum viable conditions** for success is critical for:

1. **Validating the simulation** - Are positive outcomes plausible given initial conditions?
2. **Understanding bottlenecks** - What factors most strongly gate success?
3. **Scenario design** - What initial conditions increase success probability?
4. **Roadmap prioritization** - Which mechanics need tuning to enable realistic success paths?

---

## Research Basis

**Prior findings:**
- Scenario analysis (Nov 13, 2025): high-trust-start achieved 88.9% utopia rate
- God mode analysis (Nov 2025): technology alone is insufficient (governance/trust required)
- Trust/governance thresholds documented in upwardSpirals.ts

**Key thresholds (from upwardSpirals.ts):**
- Trust in AI > 60% (`TRUST_THRESHOLD_ACCEPTANCE`)
- Governance quality > 70% (both `decisionQuality` and `institutionalCapacity`)
- International cooperation > 60%
- AI capability demonstrations + public trust → spiral activation

---

## Minimum Viable Conditions for Utopia

**(Data from successPathMapping.ts analysis - to be populated after script runs)**

### Early Game (Months 0-24)

**Critical:**
- Trust in AI: minimum XX%, average XX%
- Governance quality: minimum XX%, average XX%
- International cooperation: minimum XX%
- AI capability growth: minimum XX per month

**Optional:**
- Breakthrough tech deployments: XX techs
- Crisis frequency: maximum XX simultaneous crises
- Environmental stability: climate > XX%, biodiversity > XX%

### Mid Game (Months 24-72)

**Critical:**
- First spiral activation: average month XX
- Trust threshold crossed: average month XX
- Governance threshold crossed: average month XX
- Tier 3 transformative tech: first deployed month XX

**Optional:**
- Tier 4 clarketech: first deployed month XX
- QoL average: minimum XX%
- Crisis resolution rate: XX%

### Late Game (Months 72-120)

**Critical:**
- Multiple active spirals: at least XX/6 spirals active
- Sustained trust: minimum XX% (no major collapses)
- Environmental recovery: climate stability > XX%
- Final QoL: minimum XX%

---

## Common Patterns in Successful Runs

**(To be populated after script analysis)**

### Trust Trajectory

- Early trust building: XX pattern
- Recovery from setbacks: XX pattern
- Lock-in threshold: XX%

### Technology Deployment

- Deployment rate: XX techs per year
- Tier progression: XX months between tiers
- Critical techs: XX always present in success paths

### Crisis Management

- Maximum simultaneous crises: XX
- Crisis resolution time: XX months average
- Cascade prevention: XX pattern

---

## Comparison: Success vs Failure Paths

**(To be populated after script analysis)**

### Divergence Points

- Month XX: trust divergence (success: XX%, failure: XX%)
- Month XX: governance divergence
- Month XX: environmental divergence

### Leading Indicators

- **Trust decay rate:** Successful runs show XX%/month max decline
- **Governance improvement:** Successful runs cross 70% by month XX
- **Spiral activation timing:** First spiral by month XX predicts XX% success rate

---

## Diagnostic Script

**Location:** `scripts/successPathMapping.ts`

**Usage:**
```bash
npx tsx scripts/successPathMapping.ts > logs/success_path_mapping_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Output:** Text report saved to `/logs/success_path_mapping_TIMESTAMP.txt`

**Snapshot intervals:** Every 12 months (months 12, 24, 36, 48, 60, 72, 84, 96, 108, 120)

**Metrics tracked:**
- Trust in AI (average across deployed agents)
- Governance quality (average of decision quality + institutional capacity)
- International cooperation level
- AI capability (average across deployed agents)
- Quality of Life (average across 5 tiers)
- Spiral activation state (6 spirals)
- Technology deployment (tier 3/4 counts)
- Environmental metrics (climate stability, biodiversity)
- Active crises count

---

## Integration with Other Systems

**Upward Spirals:** Success paths depend on spiral activation. See `docs/wiki/systems/upward-spirals.md` for spiral mechanics.

**Trust Dynamics:** Trust is the primary gating factor. See `docs/wiki/systems/trust.md` for trust mechanics.

**Breakthrough Technologies:** Technology deployment accelerates success but is insufficient alone. See `docs/wiki/systems/breakthrough-technologies.md`.

**Crisis System:** Crisis frequency and severity can derail success paths. See `docs/wiki/systems/crisis.md`.

---

## Future Work

**TODO (MEDIUM priority):**
- [ ] Run N=100 analysis for statistical significance
- [ ] Add scenario-specific success path analysis (high-trust vs low-trust initial conditions)
- [ ] Map technology deployment sequences (which tech order maximizes success?)
- [ ] Analyze failure recovery patterns (can runs recover from early crises?)
- [ ] Add Monte Carlo validation of success conditions (does forcing trust/governance to minimum levels still achieve success?)

---

## Validation

**Last updated:** November 25, 2025
**Script version:** successPathMapping.ts v1.0
**Validation status:** Infrastructure created, awaiting first full run analysis
