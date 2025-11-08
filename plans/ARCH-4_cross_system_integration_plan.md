# ARCH-4: Cross-System Integration Implementation Plan

**Date:** 2025-11-08
**Priority:** CRITICAL (Week 2-3 of 4-week critical path)
**Effort:** 5+ days research and implementation
**Orchestrator:** Active

## Executive Summary

The simulation has multiple systems that don't integrate with each other despite clear causal relationships. This plan addresses 5 critical integration gaps identified in the roadmap.

## Status Assessment (Nov 8, 2025)

### Already Implemented ✅

1. **Nuclear winter → solar energy** (Gap #1)
   - **Location:** `src/simulation/powerGeneration.ts` lines 411-449
   - **Mechanism:** Sunlight blocking reduces solar panel efficiency (70% of renewables assumed solar)
   - **Status:** IMPLEMENTED, needs validation/review
   - **Research:** Robock & Toon (2012), Coupe et al. (2019)

2. **AI suffering → alignment drift** (Gap #3)
   - **Location:** `src/simulation/alignmentDynamics.ts` lines 162-438
   - **Mechanism:** Suffering multiplies all drift mechanisms (epicycle perturbation force)
   - **Status:** IMPLEMENTED, needs validation/review
   - **Research:** Citations needed (TBD by researcher)

3. **Refugee crisis → disease spread (AMR)** (Gap #4)
   - **Location:** `src/simulation/antimicrobialResistance.ts` line 269-300
   - **Mechanism:** Refugee crisis amplifies AMR spread
   - **Status:** IMPLEMENTED, needs validation/review
   - **Research:** Citations needed (TBD by researcher)

### Missing Integrations ❌

4. **Climate impacts → planetary boundaries** (Gap #2)
   - **Problem:** Temperature anomaly, ocean acidification, wet bulb events don't update planetary boundaries state
   - **Location:** `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
   - **Status:** NOT IMPLEMENTED
   - **Required:** Bi-directional feedback (climate → boundaries, boundaries → crisis states)

5. **Cooperative ownership → AI organizations** (Gap #5)
   - **Problem:** Cooperative benefits may not apply to organizations with AI models
   - **Location:** `src/simulation/cooperativeOwnership.ts` line 124
   - **Status:** NEEDS INVESTIGATION
   - **Filter:** Only 'private' type can convert, but need to verify AI orgs can be cooperatives

## System Interaction Matrix

| Source System | Target System | Integration Status | Mechanism | Research Status |
|---------------|---------------|-------------------|-----------|-----------------|
| Nuclear Winter | Power Generation | ✅ DONE | Sunlight blocking → solar efficiency | Robock 2012 |
| AI Suffering | Alignment Drift | ✅ DONE | Suffering multiplies drift | TBD |
| Refugee Crisis | AMR Spread | ✅ DONE | Population density → transmission | TBD |
| Climate | Planetary Boundaries | ❌ MISSING | Temperature → boundary transgression | IPCC AR6 |
| Climate | Planetary Boundaries | ❌ MISSING | Ocean acidification → boundary | IPCC Ocean 2019 |
| Climate | Planetary Boundaries | ❌ MISSING | Wet bulb → land use boundary | TBD |
| Planetary Boundaries | Climate Feedbacks | ❌ MISSING | Boundary transgression → tipping points | Steffen 2015 |
| Cooperative Model | AI Organizations | ⚠️ UNCLEAR | Democratic governance for AI labs | Mannan 2024 |

## Implementation Plan

### Phase 1: Research & Validation (Quality Gate 1)

**Agent:** `super-alignment-researcher`

**Tasks:**
1. Research climate → planetary boundaries integration
   - How does temperature anomaly map to climate change boundary?
   - Ocean acidification → ocean acidification boundary (IPCC Ocean 2019)
   - Wet bulb temperature → land-system change boundary
   - Expected parameters: thresholds, scaling factors, lag times

2. Validate existing integrations (gaps #1, #3, #4)
   - Nuclear winter → solar: Verify 70% solar fraction is realistic for 2025+ grids
   - AI suffering → alignment drift: Find peer-reviewed sources for suffering-alignment link
   - Refugee crisis → AMR: Find sources for refugee density → disease transmission

3. Research cooperative AI organizations
   - Can AI labs be worker cooperatives? (OpenAI's structure?)
   - Governance challenges specific to AI organizations
   - Parameter adjustments for AI sector vs traditional cooperatives

**Deliverable:** `research/cross_system_integrations_20251108.md` with 2+ peer-reviewed sources per integration

**Agent:** `research-skeptic`

**Tasks:**
- Critique research findings for each integration
- Identify contradictory evidence or methodological flaws
- Validate parameter ranges and uncertainty estimates

**Quality Gate:** Pass research critique before implementation

### Phase 2: Implementation Planning

**Create detailed implementation spec:**

1. **Climate → Planetary Boundaries Integration**
   - Phase execution order: Climate phases BEFORE PlanetaryBoundariesPhase
   - State updates: Which boundary metrics are modified?
   - Assertions: Valid ranges for all boundary metrics
   - Logging: Emoji conventions for boundary transgressions

2. **Planetary Boundaries → Climate Feedbacks (Reverse Integration)**
   - When boundaries transgressed → activate tipping points?
   - Feedback loops: Boundary transgression → climate acceleration
   - Integration with existing TippingPointPhase.ts

3. **Cooperative AI Organizations**
   - Filter logic: Should AI-focused orgs be eligible for cooperatives?
   - Parameter adjustments: Governance overhead higher for AI labs?
   - Edge cases: Government AI labs, academic AI labs

### Phase 3: Implementation (simulation-maintainer)

**Agent:** `simulation-maintainer`

**Tasks:**
1. Implement climate → planetary boundaries integration
   - Update `PlanetaryBoundariesPhase.ts` to read climate state
   - Add assertions for boundary metrics
   - Use emoji conventions consistently

2. Implement planetary boundaries → climate feedbacks
   - Update relevant phases to check boundary transgression
   - Add tipping point triggers when boundaries exceeded

3. Fix cooperative AI organization filtering (if needed)
   - Adjust eligibility logic in `cooperativeOwnership.ts`
   - Add assertions for AI-specific parameters
   - Update tests

4. Add phase dependencies
   - Declare dependencies for all modified phases
   - Ensure topological sort works correctly
   - Prevent race conditions

**Defensive Coding Requirements:**
- ✅ Use assertion utilities (no silent fallbacks)
- ✅ Fail loudly on invalid states
- ✅ Use RNG correctly (deterministic)
- ✅ Log with emoji conventions
- ✅ Add JSDoc comments with research citations

### Phase 4: Architecture Review (Quality Gate 2)

**Agent:** `architecture-skeptic`

**Tasks:**
- Review for performance bottlenecks (O(n²) checks)
- Identify state propagation issues
- Check for circular dependencies
- Validate phase execution order

**Quality Gate:** Must address CRITICAL/HIGH issues before proceeding

### Phase 5: Validation & Testing

**Monte Carlo Validation (N≥10):**
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_arch4_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Validation Checklist:**
- [ ] Deterministic (same seed → same results)
- [ ] No NaN/Infinity in logs
- [ ] Outcome distributions reasonable (not all dystopia/utopia)
- [ ] Integration effects visible in logs (boundary transgressions, solar reduction events)
- [ ] Performance acceptable (<10ms per phase)

**Unit Tests:**
- Test climate → boundary integration with mock states
- Test boundary transgression → feedback activation
- Test cooperative AI organization edge cases

### Phase 6: Documentation & Archival

**Agent:** `wiki-documentation-updater`

**Tasks:**
- Update `docs/wiki/README.md` with integration descriptions
- Document new phase dependencies
- Add emoji conventions used
- Update system interaction diagrams

**Agent:** `architect`

**Tasks:**
- Archive this plan to `/plans/completed/`
- Update `MASTER_IMPLEMENTATION_ROADMAP.md` progress
- Clean up any stale tracking files

## Expected Outcomes

**Simulation Improvements:**
1. More realistic cascades (climate → boundaries → tipping points → collapse)
2. Nuclear winter reduces solar energy → grid stress → emissions increase
3. Boundary transgressions trigger appropriate crisis responses
4. AI organizations can benefit from cooperative governance (if research supports)

**Architecture Health:**
- Current: 7.5/10 (declining)
- Target: 8.5/10 (improved integration)

**Research Quality:**
- Current: A- (some gaps in citations)
- Target: A (all integrations backed by 2+ peer-reviewed sources)

## Risk Mitigation

**Risk 1: Research skeptic rejects integrations**
- Mitigation: Use conservative parameters, wide uncertainty bounds
- Fallback: Implement with higher uncertainty flags

**Risk 2: Performance degradation**
- Mitigation: Profile before/after, 10ms phase budget
- Fallback: Batch updates, index caching

**Risk 3: Circular dependencies**
- Mitigation: Explicit dependency declarations, topological sort validation
- Fallback: Split phases into read/write stages

**Risk 4: Monte Carlo validation fails**
- Mitigation: Start with N=3 for fast iteration
- Fallback: Bisect changes to identify problematic integration

## Timeline

- **Day 1-2:** Research & validation (super-alignment-researcher + research-skeptic)
- **Day 3:** Implementation planning & design
- **Day 4-5:** Implementation (simulation-maintainer)
- **Day 6:** Architecture review & fixes (architecture-skeptic)
- **Day 7:** Monte Carlo validation (N≥10)
- **Day 8:** Documentation & archival

**Total:** 8 days (within 5+ days estimate, includes buffer for research iterations)

## Success Criteria

- ✅ All 5 integration gaps addressed (3 validated, 2 implemented)
- ✅ 2+ peer-reviewed sources per new integration
- ✅ Monte Carlo N≥10 deterministic validation
- ✅ Architecture review passes (no CRITICAL issues)
- ✅ Wiki documentation updated
- ✅ Plan archived to /plans/completed/

## Notes

- This is a CRITICAL item from the 4-week critical path (Nov 6 assessment)
- Integrations are fundamental to simulation realism - worth the research investment
- Conservative parameters preferred over speculative values
- Fail-loudly philosophy: invalid states should crash, not silently fall back
