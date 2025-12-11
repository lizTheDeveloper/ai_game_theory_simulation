# Development Workflow

Detailed workflow guidance for implementing features in the research simulation.

## Table of Contents
- [Multi-Agent Workflow (Default)](#multi-agent-workflow-default)
- [Simple Task Workflow](#simple-task-workflow)
- [Research Standards](#research-standards)
- [Calibration Coordination Protocol](#calibration-coordination-protocol)
- [Quality Gates](#quality-gates)
- [Phase-Based Implementation](#phase-based-implementation)

## Multi-Agent Workflow (Default)

**Use for non-trivial tasks:** Complex features (3+ phases), research-intensive work, architectural changes, anything requiring quality gates.

### When to Use Multi-Agent

**Use orchestrator agent for:**
- Complex features (3+ phases, multiple systems affected)
- Research-intensive work (requires peer-reviewed sources)
- Architectural changes (affects multiple modules)
- Anything requiring quality gates (research validation, architecture review)

**Use direct implementation only for:**
- Trivial fixes (typos, simple parameter tweaks)
- Single-file edits (no cross-system effects)
- Documentation-only changes

### How to Invoke Orchestrator

```typescript
// Example: Implementing a new feature
Task({
  subagent_type: "orchestrator",
  description: "Implement nuclear winter cascades",
  prompt: `I need to implement nuclear winter cascades from the roadmap.

  Feature requirements:
  - Model temperature drops from nuclear detonations
  - Agricultural collapse from reduced sunlight
  - Famine cascades with regional variation

  Please coordinate the full workflow: research → validation → implementation → review → documentation.`
})
```

### Workflow Phases

The orchestrator manages:

#### 1. Research & Validation (Quality Gate 1)
- **super-alignment-researcher** finds peer-reviewed sources (2024-2025)
- **research-skeptic** validates findings (MANDATORY)
- **Gate:** Must pass critique before implementation
- Checks for contradictory evidence, methodological flaws, overconfidence

#### 2. Implementation & Testing
- **feature-implementer** writes code in phases
- Runs Monte Carlo validation after each phase (N≥10)
- Posts progress to chatroom channels
- **unit-test-writer** / **integration-test-writer** add tests

#### 3. Architecture Review (Quality Gate 2)
- **architecture-skeptic** reviews system impact (MANDATORY)
- **Gate:** Must address CRITICAL/HIGH severity issues
- Checks for performance issues, state propagation problems, complexity

#### 4. Documentation & Archival
- **wiki-documentation-updater** syncs wiki
- **project-plan-manager** archives completed plans
- Updates `MASTER_IMPLEMENTATION_ROADMAP.md`

### End-of-Session Cleanup

**CRITICAL: Always run project-plan-manager at the end of work sessions:**

```typescript
Task({
  subagent_type: "project-plan-manager",
  description: "Clean up roadmap and archive completed plans",
  prompt: "Review MASTER_IMPLEMENTATION_ROADMAP.md and archive all completed work to /plans/completed/. Update Progress Summary and identify next priorities."
})
```

**Benefits:**
- Maintains research standards (all mechanics backed by peer review)
- Catches performance issues before they compound
- Parallel work via git worktrees + chatroom coordination
- Quality gates prevent low-quality implementations
- Roadmap stays clean and focused on active work

## Simple Task Workflow

For trivial fixes (typos, simple parameter tweaks, single-file edits):

### 1. Research Phase (if needed)
- Find 2+ peer-reviewed sources (2024-2025 preferred)
- Save to `research/[topic]_YYYYMMDD.md`
- Extract key parameters and mechanisms

### 2. Design Phase (if needed)
- Create plan in `plans/[feature]-plan.md` with citations
- Define state additions, system modules, phases
- Map interactions with existing systems

### 3. Implementation Phase
- **Add state** to `src/types/game.ts`
- **Create system module** in `src/simulation/`
- **Create phase** in `src/simulation/engine/phases/`
- **Register phase** in `PhaseOrchestrator`
- **Add logging** with semantic emojis (see "Emoji Registration" below)

### 4. Validation Phase
- Run Monte Carlo (N=10 minimum): `npx tsx scripts/monteCarloSimulation.ts`
- Check outcome distributions, trajectories, crisis frequencies
- Verify breakthrough technology impact

### 5. Documentation Phase
- Update `docs/wiki/README.md`
- Add devlog entry to `devlogs/`
- Move plan to `plans/completed/` when done
- Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

## Research Standards

Every mechanic must have:

### 1. Research Citations
- **2+ peer-reviewed sources** (2024-2025 preferred)
- Academic journals, conference papers, technical reports
- Save PDFs to `research/` with summary markdown files
- **📚 Add to Zotero immediately** - All papers tracked in centralized library for citation accuracy and traceability (see CLAUDE.md Research Standards)

### 2. Parameter Justification
- **Why this number?** (backed by data, not "feels right")
- Show calculation from research findings
- Document uncertainty ranges

### 3. Mechanism Description
- **How it works** (not just effects)
- Causal pathways between inputs and outputs
- Feedback loops and interactions

### 4. Interaction Map
- **What affects this system?** (inputs)
- **What does this affect?** (outputs)
- Cross-system cascades and dependencies

### 5. Expected Timeline
- **When does it matter?** (early/mid/late game)
- Month ranges for typical activation
- Threshold conditions

### 6. Failure Modes
- **What can go wrong?**
- Edge cases and invalid states
- How to detect and handle failures

### 7. Test Validation
- **Monte Carlo evidence it works**
- Distribution of outcomes
- Sensitivity to parameters

**Never tune for "fun" - only research-backed values.**

### 8. Citation Verification Protocol (Oct 29, 2025)

**Added after discovering 6 fabricated citations in Oct 2025 research consensus.**

#### Red Flags (Check These First)

When adding or reviewing citations, check for these warning signs:

1. **Round Number Ranges:** X00-Y00 patterns (e.g., "500-700", "300-400") need source verification
   - NOT all round numbers are fabrications - verify against actual paper

2. **Pre-2015 AI Claims:** Papers before 2015 with AI/ML-specific predictions
   - Exception: Classic AI safety papers (Bostrom 2014, Omohundro 2008, Yudkowsky 2008)
   - Healthcare/implementation science papers from 2005-2010 never mentioned modern AI

3. **Adjacent Citations:** If one citation is wrong, check ±5 lines
   - Fabrications often cluster together

4. **Convenient Percentages:** 30-40%, 50-60%, etc. without page numbers
   - Verify these are actual findings, not LLM hallucinations

5. **Citation Inflation:** "X,000+" claims need actual count verification
   - Check Semantic Scholar, Google Scholar for real counts
   - Papers <2 years old cannot have 10,000+ citations

6. **Wrong Scale:** kWh vs MWh, per-run vs total, per-hour vs per-model
   - Verify units and granularity match paper

#### Verification Steps

For every citation added:

1. **Check paper exists:** Search on Google Scholar, arXiv, Semantic Scholar
2. **Verify authors:** Full author list matches paper (watch for LLM autocomplete mistakes)
3. **Find actual metric:** Read paper or extract exact number with context
4. **Check anachronistic claims:** Does paper actually mention AI/ML? (especially if pre-2015)
5. **Verify citation count:** Use Semantic Scholar for accurate count
6. **Document assumptions:** If deriving metrics (e.g., per-hour from total), show math and state assumptions

#### Quality Verification Gates

- ✅ **Green:** 2+ peer-reviewed sources (2024+ preferred), verified authors, exact metrics
- ⚠️  **Yellow:** Single source OR pre-2020, needs second confirming source
- ❌ **Red:** No source, anachronistic claim, wrong authors, or fabricated metric → BLOCK until fixed

#### Common Fabrication Patterns (Oct 2025)

1. **Wrong Authors:** ResNet team (Ren, He, Girshick, Sun) cited for water consumption paper
   - Real authors: Li, Yang, Islam, Ren (different Ren)

2. **Wrong Metrics:** "300-400 kWh per training run" vs actual "1,287 MWh for GPT-3"
   - Check scale (kWh vs MWh) and granularity (per-run vs total)

3. **Anachronistic Claims:** "CFIR Framework - AI helps 30-40%" (Damschroder 2009)
   - Healthcare implementation paper from 2009, never mentioned AI

4. **Citation Inflation:** Richardson "15,000+" vs actual "~1,450"
   - 10× exaggeration to imply authority

#### Correction Protocol

When fabrication is found:

1. **Document in reviews/:** Create analysis file showing what was wrong
2. **Fix with strikethrough:** Show ~~old value~~ → **new value** [Citation]
3. **Add timestamp:** "Corrected YYYY-MM-DD" for transparency
4. **Check code impact:** Verify simulation doesn't use fabricated values
5. **Run Monte Carlo:** If code was using wrong values, measure impact

**See:** `reviews/citation_fix_sprint_20251029.md` for complete case study of Oct 2025 fabrication discovery and correction.

## Calibration Coordination Protocol

**Purpose:** Prevent calibration conflicts in multi-worker git architecture by coordinating ownership.

**Added:** December 10, 2025 (after ocean pH calibration conflict discovered in Session 21)

### Why This Matters

In multi-worker git architecture, parallel calibration work can cause:
- Wasted effort (duplicate calibration of same parameter)
- Research inconsistency (competing calibrations with different backing)
- Merge conflicts requiring manual resolution
- Loss of calibration rationale (which research justifies which value?)

**Example:** Session 21 discovered two competing ocean pH calibrations (70% vs 50% reduction) - required manual merge and research review to resolve.

### 5-Step Calibration Protocol

When calibrating simulation parameters:

**1. Check ownership registry**
   - Read `docs/CALIBRATION_OWNERSHIP.md`
   - Verify parameter status is STABLE (not ACTIVE)
   - If ACTIVE, wait for completion or coordinate with owner

**2. Claim ownership**
   - Mark parameter as ACTIVE with your worker ID and timestamp
   - Commit registry update before starting calibration work
   - Maximum ownership duration: 7 days

**3. Document research**
   - Use `research/calibration_template.md` as template
   - Include 2+ peer-reviewed sources (2024-2025 preferred)
   - Document uncertainty ranges
   - Show calculations/derivations
   - Explain expected impact on simulation behavior

**4. Perform calibration**
   - Tune parameters based on research
   - Validate with hindcast (if applicable)
   - Run Monte Carlo N≥10 for determinism check (CV < 0.01%)
   - Submit for architecture review (Quality Gate 2)
   - Address CRITICAL/HIGH issues

**5. Release ownership**
   - Mark parameter STABLE in registry
   - Add to Recently Completed table with rationale link
   - Commit calibration documentation to `research/`
   - Update wiki if parameter affects documented systems

### Conflict Resolution

If you encounter a git merge conflict in calibration values:

1. **Check registry** - Which calibration has documented ownership?
2. **Compare research** - Which has stronger peer-reviewed backing?
3. **Defer to quality** - Keep calibration with better documentation
4. **Document decision** - Add note to Recently Completed explaining rejection

**Example resolution:**
```
Ocean pH recovery rate (Nov 28, 2025):
✅ ACCEPTED: 70% reduction (IPCC AR6 WG1 Ch5)
❌ REJECTED: 50% reduction (weaker backing, no citation)
```

### Files

- **Ownership registry:** `docs/CALIBRATION_OWNERSHIP.md`
- **Documentation template:** `research/calibration_template.md`
- **Example calibration:** `research/ocean_pH_calibration_20251128.md` (if exists)

**Audit trail:** All ownership changes tracked in git history via `git log docs/CALIBRATION_OWNERSHIP.md`

## Quality Gates

Two mandatory gates in the multi-agent workflow:

### Quality Gate 1: Research Validation

**research-skeptic** reviews all research findings before implementation.

**Checks:**
- Contradictory evidence in literature
- Methodological flaws in cited studies
- Overconfidence in uncertain parameters
- Missing alternative explanations
- Publication bias or selective citation

**Outcome:**
- **PASS:** Implementation proceeds with validated parameters
- **FAIL:** Must address issues or find better sources

### Quality Gate 2: Architecture Review

**architecture-skeptic** reviews all implementations after completion.

**Checks:**
- Performance bottlenecks (O(n²) operations, deep cloning)
- State propagation issues (circular dependencies, missing updates)
- Complexity creep (monolithic functions, unclear boundaries)
- Error handling gaps (NaN/undefined propagation)
- System stability risks

**Severity Levels:**
- **CRITICAL:** Must fix immediately (crashes, data corruption)
- **HIGH:** Must fix before merge (performance degradation, bugs)
- **MEDIUM:** Should fix soon (technical debt, maintainability)
- **LOW:** Nice to have (code style, optimization opportunities)

**Outcome:**
- **PASS:** Feature complete, ready to merge
- **CRITICAL/HIGH issues:** Must address before proceeding

## Phase-Based Implementation

The simulation uses a **phase-based architecture** (~37 phases per step).

### Phase Structure

```typescript
interface SimulationPhase {
  id: string;
  name: string;
  order: number;  // Execution order (0-36)
  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult;
}
```

### Phase Categories (in order)

1. **Time & Initialization (0-1):** Time advancement, compute growth
2. **Agent Actions (2-8):** AI agents, government, society, organizations make decisions
3. **Systems Updates (9-25):** Environmental, social, technological, geopolitical systems evolve
4. **Crisis Detection (26-30):** Detect crises, extinction triggers, tipping points
5. **Outcomes & Metrics (31-36):** Update QoL, outcome probabilities, dystopia progression

### Creating a New Phase

1. **Create phase file:** `src/simulation/engine/phases/MyNewPhase.ts`
2. **Implement interface:**
   ```typescript
   import type { SimulationPhase } from '../PhaseOrchestrator';

   export const MyNewPhase: SimulationPhase = {
     id: 'my-new-phase',
     name: 'My New Phase',
     order: 15, // Choose appropriate position
     execute(state, rng, context) {
       // Phase logic here

       return {
         success: true,
         stateChanged: true,
         message: 'Phase completed successfully'
       };
     }
   };
   ```
3. **Register in orchestrator:** Add to `PHASES` array in `PhaseOrchestrator.ts`
4. **Add logging:** Use semantic emojis for consistency (see "Emoji Registration" below)
5. **Test in isolation:** Unit test the phase execute function
6. **Validate with Monte Carlo:** Run N≥10 simulations

### Emoji Registration

**CRITICAL: All emojis used in simulation code MUST be registered before use.**

The pre-commit hook validates emoji registration automatically. Unregistered emojis will block your commit.

#### Workflow

```bash
# 1. Register emoji in docs/EMOJI_EVENT_MAP.txt
echo "✂️ | Corporate restructuring/cuts" >> docs/EMOJI_EVENT_MAP.txt

# 2. Use in simulation code
console.log(`✂️ LAYOFFS: 15% workforce reduction`);

# 3. Commit (validation passes)
git add .
git commit -m "feat: Add layoff mechanics"
```

#### Registration Format

`docs/EMOJI_EVENT_MAP.txt`:
```
EMOJI | Semantic meaning (one canonical meaning per emoji)

Examples:
💸 | Economic collapse
✂️ | Corporate restructuring/cuts
💼 | Executive compensation
```

#### Why This Matters

- **Prevents emoji proliferation** (one concept = one emoji)
- **Ensures consistency** across 40+ simulation modules
- **Pre-commit validation** catches violations before git history
- **Maintains pictographic event language integrity**

#### If Pre-Commit Blocks You

```bash
# Error example:
# ❌ UNREGISTERED EMOJIS FOUND:
#   ✂️ in src/simulation/organizationManagement.ts

# Fix: Register the emoji, then commit again
echo "✂️ | Corporate restructuring/cuts" >> docs/EMOJI_EVENT_MAP.txt
git add docs/EMOJI_EVENT_MAP.txt
git commit -m "feat: Add layoff mechanics"
```

**📖 See also:**
- [`CLAUDE.md`](/CLAUDE.md) - Emoji conventions section (lines 480-521)
- [`docs/EMOJI_EVENT_MAP.txt`](/docs/EMOJI_EVENT_MAP.txt) - Authoritative mapping
- [`docs/UNIFIED_LOGGER_GUIDE.md`](/docs/UNIFIED_LOGGER_GUIDE.md) - Logger API

### Phase Best Practices

- **Single responsibility:** Each phase does one thing well
- **Deterministic:** Given same RNG seed, produces same results
- **Documented:** Clear comments on inputs, outputs, side effects
- **Testable:** Can run in isolation with mock state
- **Performant:** Avoid O(n²) operations, minimize deep cloning

## Multi-Paradigm DUI Integration

When implementing features that affect quality of life or societal outcomes:

### Four Paradigm Perspectives

1. **Western Liberal:** Democracy, civil liberties, rule of law, economic freedom
2. **Development:** QoL, survival tier, life expectancy
3. **Ecological:** Planetary boundaries, climate, resources, pollution
4. **Indigenous:** Social trust, community bonds, meaning

### Key Principles

- **Preserve value conflicts:** Don't force consensus across paradigms
- **Detect divergence:** Singapore pattern (Development utopia + Western hybrid)
- **Track all four:** Norway pattern (Western/Development utopias + Ecological dystopia)
- **Update independently:** Each paradigm has its own scoring logic

### Implementation Pattern

```typescript
// Update all four paradigm perspectives
state.multiParadigmDUI.westernLiberal = calculateWesternLiberalScore(state);
state.multiParadigmDUI.development = calculateDevelopmentScore(state);
state.multiParadigmDUI.ecological = calculateEcologicalScore(state);
state.multiParadigmDUI.indigenous = calculateIndigenousScore(state);

// Detect divergence
const paradigmDivergence = calculateParadigmDivergence(state.multiParadigmDUI);
if (paradigmDivergence > 30) {
  console.log('⚠️ High paradigm divergence detected');
}
```

## Multi-Agent Coordination

### Chatroom Communication

Agents coordinate via `.claude/chatroom/` (symlink to `~/src/superalignment-chatroom/chatroom/`) - see `.claude/chatroom/README.md` for complete documentation.

**Infrastructure Note (Oct 31, 2025):** Chatroom moved to independent repository for multi-VM synchronization. Symlinks preserve backward compatibility - agents access channels exactly as before.

**8 Permanent Channels:**
- `coordination.md` - General workflow coordination
- `research.md` - Research findings & validation
- `implementation.md` - Code implementation updates
- `architecture.md` - Architecture reviews & decisions
- `testing.md` - Test strategy & results
- `documentation.md` - Wiki & devlog updates
- `planning.md` - Roadmap & plan management
- `vision.md` - Long-term strategy & philosophical debates

### Message Format

```markdown
---
**agent-name** | YYYY-MM-DD HH:MM | [STATUS]

Your message content here

**Next Steps:** What you're doing next
**Blocking:** Any blockers or dependencies
---
```

**Status Tags:** `[STARTED]`, `[IN-PROGRESS]`, `[COMPLETED]`, `[BLOCKED]`, `[QUESTION]`, `[ALERT]`, `[HANDOFF]`

### Parallel Work with Worktrees

For parallel agent work, use git worktrees to avoid file conflicts:

```bash
# Create worktree for parallel feature work
git worktree add ../superalignment-feature-x feature-x

# Agent works in isolation
cd ../superalignment-feature-x
# ... implement feature ...

# Merge back when done
cd ../superalignmenttoutopia
git merge feature-x
git worktree remove ../superalignment-feature-x
```

## Available Specialized Agents

All agents are in `.claude/agents/`:

### Workflow Coordination
- **orchestrator** - Workflow coordinator, use by default for complex work

### Research & Validation
- **super-alignment-researcher** - Find peer-reviewed research (2024-2025)
- **research-skeptic** - MANDATORY validation of research foundations
- **sci-fi-tech-visionary** - Speculative future tech scenarios

### Implementation
- **feature-implementer** - Pure implementation specialist (spawned by orchestrator)
- **unit-test-writer** / **integration-test-writer** - Test creation
- **nextjs-component-writer** - Frontend component creation

### Quality Assurance
- **architecture-skeptic** - MANDATORY review for performance/stability issues

### Documentation & Planning
- **wiki-documentation-updater** - Sync wiki with code changes
- **project-plan-manager** - Roadmap & plan archival

### UI/UX
- **far-future-ux-designer** - Dashboard design and data visualization
- **llm-interface-optimizer** - Agent interface design (prompt optimization)

## Additional Resources

- **Commands:** `docs/COMMANDS.md` - Complete command reference
- **Wiki:** `docs/wiki/README.md` - System documentation (3,000+ lines)
- **Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active priorities (~72-75 hours)
- **Chatroom:** `.claude/chatroom/README.md` - Multi-agent coordination (550+ lines)
- **Agents:** `.claude/agents/` - Specialized agent definitions
- **Emoji Reference:** `docs/EMOJI_QUICK_REFERENCE.md` - One-page cheat sheet

---

## Post-Commit Research Verification Workflow

### Automatic Triggering (via Git Hook)

After every commit, the `post-commit` git hook automatically:

1. **Historian Agent Spawns:** Reviews commit diff
2. **Documentation Update:** Updates `docs/wiki/README.md` if needed
3. **Research Verification Check:** Determines if commit introduces:
   - New parameters
   - New mechanics
   - Changed assumptions

### If Research Verification Needed:

**Historian creates:**
- Research verification file: `research/verification_<commit-hash>_YYYYMMDD.md`
  - Documents parameters needing citation
  - Lists mechanics requiring validation
  - Notes changed assumptions
- Roadmap entry: Adds to `plans/SIMULATION_ROADMAP.md` under "Research Verification Queue"
- Orchestrator alert: Posts to `#implementation` channel

**Template:** See `research/RESEARCH_VERIFICATION_TEMPLATE.md`

### Orchestrator Picks Up Work:

When orchestrator reads `#implementation` channel and sees historian alert:

1. **Read research verification file** (research already done by historian)
2. **Start at Validation Phase** (skip research phase)
3. **Spawn specialists:**
   - `research-skeptic` reviews verification file
   - `super-alignment-researcher` finds peer-reviewed sources
4. **Debate to consensus** on parameters/mechanisms
5. **Implementation:**
   - `simulation-maintainer` updates code with research-backed values
   - Adds citations to code comments
6. **Testing:** Monte Carlo validation (N≥10)
7. **Documentation:** Updates wiki
8. **Archival:** Moves verification file to `research/completed/`

### Roadmap as Source of Truth

- Historian adds item to roadmap immediately
- Orchestrator marks as in-progress when picked up
- Roadmap reflects current work status at all times
- No work happens "off the books"

### Example Flow:

```
Commit → Post-commit hook → Historian spawns
  ↓
Historian: "This adds new water consumption parameters"
  ↓
Creates: research/verification_abc1234_20251029.md
  ↓
Updates: plans/SIMULATION_ROADMAP.md
  - [ ] Verify citations for water consumption (research/verification_abc1234.md)
  ↓
Posts: #implementation channel
  "Research verification needed for abc1234. Ready for validation phase."
  ↓
Orchestrator sees alert → Spawns validation team
  ↓
Roadmap updated: [x] in-progress
  ↓
Work proceeds through validation → implementation → testing → docs
  ↓
Roadmap updated: [x] completed
  ↓
Verification file archived to research/completed/
```

### Benefits:

- **Automatic queue**: Never forget to verify research backing
- **Roadmap sync**: Source of truth always current
- **Phase skip**: Orchestrator starts at validation (research file exists)
- **Audit trail**: Clear paper trail of what needs verification
- **Research integrity**: Systematic approach to citation verification

---

## Calibration Coordination Protocol

**Purpose:** Prevent calibration conflicts in multi-worker git architecture by coordinating parameter tuning work.

**Created:** December 9, 2025 (Session 62)
**Problem solved:** Session 21 discovered ocean pH calibration conflict (70% vs 50% reduction) due to parallel worker calibration without coordination.

### When to Use This Protocol

Use calibration coordination when:
- Tuning existing parameter values based on new research
- Adjusting parameters after hindcast/Monte Carlo validation
- Recalibrating after research validation reveals better sources
- ANY change to numeric parameters in simulation code

**DO NOT use for:**
- New feature implementation (use orchestrator workflow instead)
- Bug fixes that don't change parameter values
- Documentation-only updates

### Calibration Workflow

```
1. Identify parameter needing calibration
   ↓
2. git pull origin main  # Get latest registry
   ↓
3. Check docs/CALIBRATION_OWNERSHIP.md for parameter status
   ↓
4. If STABLE → Update to ACTIVE (your name, date) → git push immediately
   If ACTIVE → Choose different work or coordinate with other worker
   ↓
5. Create calibration research file: research/calibration_[param]_[date].md
   (Use research/calibration_template.md as template)
   ↓
6. Gather research sources (2+ peer-reviewed, 2024-2025 preferred)
   ↓
7. Document proposed values with justification
   ↓
8. Run hindcast validation (if applicable)
   ↓
9. Run Monte Carlo N≥10 (determinism check CV < 0.01%)
   ↓
10. Submit for architecture review (Quality Gate 2)
   ↓
11. Update CALIBRATION_OWNERSHIP.md → status STABLE, add research backing
   ↓
12. Commit with message: "calibration: [Parameter] - [brief reason]"
```

### Key Files

**Calibration Ownership Registry:** `docs/CALIBRATION_OWNERSHIP.md`
- Tracks which parameters are STABLE vs ACTIVE (being calibrated)
- Documents current values and research backing for each parameter
- Prevents duplicate calibration work

**Calibration Template:** `research/calibration_template.md`
- Standard format for documenting calibration rationale
- Includes: research foundation, proposed values, validation plan, results
- Ensures calibrations have proper research backing

### Conflict Resolution

**If you discover a calibration conflict** (two workers calibrated same parameter):

1. Check git log to see which worker committed first
2. First worker's calibration wins (unless research grade significantly lower)
3. Second worker's work goes to `research/alternative_calibrations/` for reference
4. Document rationale for chosen calibration in CALIBRATION_OWNERSHIP.md
5. Post to coordination channel to notify other workers

**Prevention:** Always `git pull` and check CALIBRATION_OWNERSHIP.md before starting calibration.

### Quality Standards

**All calibrations must meet:**
- ✅ 2+ peer-reviewed sources (2024-2025 preferred)
- ✅ Explicit parameter justification (not arbitrary values)
- ✅ Monte Carlo validation N≥10, CV < 0.01%
- ✅ Architecture review (Quality Gate 2)
- ✅ Documented in CALIBRATION_OWNERSHIP.md

**Validation targets:**
- **Hindcast:** <5% deviation for all checkpoint years (if applicable)
- **Determinism:** CV < 0.01% across N≥10 runs with same seed
- **Research Grade:** B+ or higher
- **Architecture Grade:** B+ or higher (no CRITICAL/HIGH issues)

### Example: Ocean pH Calibration

**Problem:** Session 21 found conflict between 70% reduction (pH=8.0) vs 50% reduction (pH=7.95)

**Resolution:**
1. Created CALIBRATION_OWNERSHIP.md entry for ocean acidification
2. Documented research backing: NOAA Ocean Acidification Program
3. Chose 70% reduction (better match to NOAA observed data)
4. Added rationale to registry
5. Marked status STABLE

**Lesson:** Registry prevents future conflicts, preserves research rationale in git history.

### Maintenance

**Update CALIBRATION_OWNERSHIP.md:**
- **Before** starting calibration (status → ACTIVE)
- **After** completing calibration (status → STABLE, add research backing)
- **When** new research emerges that invalidates calibration (add note)

**Archive policy:**
- Keep last 5 calibration history entries per parameter in main registry
- Move older entries to `docs/calibration-history/[parameter].md`
- Never delete research backing citations
