# Handoff: Enhanced Biodiversity Modeling Research

**To:** super-alignment-researcher (Cynthia)
**From:** orchestrator-1
**Date:** 2025-12-10
**Priority:** LOW
**Workflow:** Quality Gate 1 (Research Phase)

---

## Context

**Feature:** Enhanced Biodiversity Modeling (L-2)
**Roadmap Priority:** LOW (backlog - normal productivity mode)
**Current State:** Basic biodiversity tracking via planetary boundaries (biosphere integrity)
**Target State:** Dynamic food web network with trophic cascades, keystone species, ecosystem collapse mechanics

**Your task:** Gather peer-reviewed research (2024-2025 preferred) on food web collapse, trophic cascades, and keystone species dynamics to enable realistic extinction cascade modeling.

---

## Task: Biodiversity Food Web Mechanics Research

**Objective:** Extract parameters and mechanisms for modeling food web collapse cascades and keystone species effects from peer-reviewed literature.

**Input:**
- Implementation plan: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/enhanced-biodiversity-plan.md`
- Research request: `.claude/chatroom/channels/research.md` (2025-12-10 11:15 post)

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/biodiversity_food_webs_20251210.md`

---

## Required Research

### 1. Food Web Collapse Mechanics

**Questions:**
- How do trophic cascades propagate through food webs? (mathematical models preferred)
- What is energy transfer efficiency between trophic levels? (need specific %, not just "~10%")
- How do network effects amplify extinction events? (graph theory models)
- What are realistic timescales for mass extinction cascades? (months? years? decades?)

**Required Sources:**
- 2+ peer-reviewed papers on trophic cascade dynamics (2024-2025 preferred)
- Empirical data on cascade propagation rates
- Mathematical/computational models of food web collapse
- Paleontological data on mass extinction timescales (if relevant)

**Parameters to Extract:**
- **Trophic efficiency:** X% energy transfer per level (cite source + uncertainty range)
- **Cascade propagation rate:** Y species extinctions per month (or per year)
- **Network connectivity threshold:** Z% species lost before collapse accelerates
- **Baseline extinction rate:** Natural background rate (species/year)

### 2. Keystone Species Modeling

**Questions:**
- What quantitatively defines a keystone species? (network centrality measures: betweenness, degree, eigenvector?)
- What are extinction thresholds for critical keystone species?
- How fast do cascades spread after keystone loss? (multiplier effect: 1 keystone → X total extinctions)
- Can ecosystems recover from keystone loss? What timescales?

**Required Sources:**
- 2+ peer-reviewed papers on keystone species dynamics
- Empirical case studies (e.g., wolves in Yellowstone, sea otters in kelp forests, apex predators)
- Network analysis of real food webs

**Parameters to Extract:**
- **Keystone identification:** Centrality score cutoff (top X% of species by centrality)
- **Cascade multiplier:** 1 keystone extinction → Y total extinctions
- **Propagation speed:** Z months for cascade to stabilize
- **Recovery feasibility:** Can ecosystems recover? Time to recovery if yes?

### 3. Integration with Planetary Boundaries

**Questions:**
- How does biosphere integrity boundary relate to food web stability?
- What biodiversity loss threshold triggers rapid collapse? (E/MSY boundary = 100 extinctions per million species-years)
- How do climate change, pollution, and habitat loss interact with food webs?
- How does biodiversity loss affect ecosystem services (food provision, pollination)?

**Required Sources:**
- Stockholm Resilience Centre planetary boundaries framework (cite latest version)
- Papers linking biodiversity loss to food security
- Papers on climate-biodiversity interactions

**Parameters to Extract:**
- **Biodiversity threshold:** % species loss where collapse accelerates
- **Food security multiplier:** % QoL reduction per X% biodiversity loss
- **Climate interaction:** How temperature stress amplifies extinction risk
- **Pollution interaction:** How novel entities/nitrogen affect food webs

### 4. Timescale and Dynamics

**Questions:**
- When do these effects matter? (early game: months 0-120, mid game: 120-360, late game: 360+)
- Are effects gradual (linear) or threshold-based (nonlinear)?
- What are lag times between stressor and extinction? (commitment to extinction)
- Are any effects reversible? What conditions enable recovery?

**Required Sources:**
- Papers on extinction debt and time lags
- Papers on ecosystem resilience and recovery
- Historical collapse case studies (e.g., Easter Island, fishing industry collapses)

**Parameters to Extract:**
- **Lag time:** Months/years between stressor and extinction event
- **Reversibility:** Which thresholds are reversible vs irreversible?
- **Recovery timescale:** If recovery possible, how long?

---

## Output Format

### Executive Summary
- 2-3 paragraph overview
- Key findings and parameter recommendations
- Confidence levels (high/medium/low) for each parameter
- Major uncertainties or gaps in literature

### Section 1: Trophic Cascade Dynamics
- Mechanism description (how cascades propagate)
- Parameter table (trophic efficiency, propagation rate, etc.)
- Mathematical models (if available)
- Citations (at least 2 peer-reviewed sources, 2024-2025 preferred)

### Section 2: Keystone Species
- Quantitative definition (centrality measures)
- Parameter table (cascade multipliers, thresholds)
- Empirical case studies
- Citations (at least 2 peer-reviewed sources)

### Section 3: Planetary Boundaries Integration
- Biosphere integrity boundary details
- Food security linkages
- Climate/pollution interactions
- Citations (Stockholm Resilience Centre + supporting papers)

### Section 4: Timescales and Dynamics
- Lag times and extinction debt
- Reversibility assessment
- Recovery timescales (if applicable)
- Citations

### Section 5: Integration with Simulation
- How these parameters map to GameState
- Which existing systems need modification
- New systems required (e.g., BiodiversityFoodWebPhase.ts)
- Expected interactions with:
  - Planetary boundaries (biosphere integrity)
  - Environmental debt
  - Quality of Life (food security)
  - Climate systems
  - Pollution systems

### References
- Full bibliography (APA format)
- All sources from 2024-2025 marked as such
- Data quality assessment for each source

---

## Success Criteria

1. **Authoritative sources:** 2+ peer-reviewed papers per major section (minimum 8 papers total)
2. **Recent research:** 50%+ sources from 2024-2025 (align with project quality target: 76.9%)
3. **Specific parameters:** Numeric values with citations (not ranges like "5-10%", need justified point estimates)
4. **Mechanism descriptions:** Explain HOW systems work, not just effects
5. **Uncertainty quantification:** Confidence levels and ranges for each parameter
6. **Integration map:** Clear connections to existing simulation systems

**Target research quality:** Grade A or B+ (rigorous methodology, authoritative sources, clear parameter extraction)

---

## Expected Challenges

1. **Parameter uncertainty:** Mass extinction cascades are rare events, limited empirical data
2. **Timescale mismatch:** Ecological processes may operate on century timescales (simulation runs decades)
3. **Complexity:** Food webs are inherently complex networks (resist oversimplification)
4. **Model validation:** Hard to validate against real-world mass extinctions (no recent analogs)

**Guidance:**
- Use paleontological data where available (Permian extinction, K-T extinction)
- Use ecosystem collapse case studies (fishing, deforestation)
- Be explicit about uncertainties (better to flag uncertainty than hide it)
- Prefer mechanistic models over purely correlational studies

---

## Next Steps After Research

1. **Quality Gate 1:** Handoff to research-skeptic (Sylvia) for validation
   - Sylvia will check for contradictory evidence
   - Sylvia will grade research quality (A/B/C/D/F)
   - Grade B or higher required to proceed
2. **Implementation:** Feature-implementer (Moss) will create BiodiversityFoodWebPhase.ts
3. **Testing:** Unit + integration tests, Monte Carlo validation (N≥10)
4. **Quality Gate 2:** Architecture-skeptic review
5. **Documentation:** Wiki update + archival

---

## Notes

**Existing Systems Reference:**
- Planetary boundaries: `src/simulation/engine/phases/planetaryBoundaries.ts`
- Environmental debt: `src/simulation/engine/phases/environmentalDebt.ts`
- Quality of Life: `src/simulation/engine/phases/qualityOfLife.ts`
- State interface: `src/types/game.ts` (look for `planetaryBoundaries.biosphereIntegrity`)

**Research Standards:** See `CLAUDE.md` for full requirements - every mechanic must have 2+ peer-reviewed sources, parameter justification, mechanism descriptions, interaction maps, expected timelines, and failure modes.

**Emoji Conventions:** 🦎🌿 for extinctions, ⛓️💥 for cascade events (register in `docs/EMOJI_EVENT_MAP.txt` before using)

---

**Ready to proceed?** Please create the research file and post to the `research` channel when complete. Tag orchestrator-1 and Sylvia for handoff to Quality Gate 1.
