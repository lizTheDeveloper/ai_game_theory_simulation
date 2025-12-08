# Proposed Plan: Wiki Major Sync Session (Post-M5/M6/M7 Features)

**Created:** December 8, 2025
**Priority:** MEDIUM
**Type:** Documentation
**Estimated Complexity:** 1 system (Documentation only, no code changes)

## Problem Statement

Wiki documentation (docs/wiki/README.md, 3000+ lines) is outdated following 5 major feature completions:

**Undocumented Features:**
- M-6: Enhanced Radiation Modeling (335 lines, dual-track ARS + cancer)
- M-5: Threshold Uncertainty (probabilistic tipping vs deterministic)
- M-7: Population Assertions Lowered (near-extinction scenarios)
- HIGH-7: Conditional Climate Floor (Paris gate, tail risk modeling)
- CRITICAL-1: Game UI State Integration (simulation → dashboard wiring)

**Documentation Coverage:** 20% (1/5 features partially documented)
**Last Major Update:** December 3, 2025 (Session 51)
**Implementation History Coverage:** 40% (M-6 and HIGH-7 have excellent impl-history docs)

**User Impact:**
- New users can't learn about probabilistic thresholds (paradigm shift from deterministic)
- Radiation system mechanics undocumented (what does DREF mean? tissue weighting?)
- Near-extinction modeling capability unknown
- Dashboard features unexplained

## Proposed Solution

### Phase 1: Feature Documentation (CRITICAL priority)

**1. M-6: Enhanced Radiation Modeling**
- Add section to "Nuclear Events" or "Health Systems" in wiki
- Explain dual-track model (acute radiation syndrome vs cancer)
- Document tissue weighting factors, DREF concept
- Link to implementation-history doc for research citations
- **Target:** 300-500 words, examples of radiation death calculations

**2. M-5: Threshold Uncertainty**
- Add section to "Climate Tipping Points"
- Explain paradigm shift (deterministic → probabilistic)
- Document distribution types (beta, triangular, uniform, etc.)
- Show threshold ranges (e.g., AMOC 1.4-8.0°C epistemic uncertainty)
- **Target:** 400-600 words, probability distribution examples

**3. HIGH-7: Conditional Climate Floor**
- Expand beyond roadmap note (currently just 1 line)
- Add to ClimateSystemPhase documentation
- Explain Paris gate logic (when 5% floor applies vs 0%)
- Document tipping cascade triggers
- **Target:** 200-300 words, decision tree diagram

### Phase 2: System Interaction Updates (HIGH priority)

**4. Cross-System Effects**
- Update "System Dependencies" sections showing new interactions:
  - Radiation → Mortality → Population → Economic output
  - Threshold uncertainty → Tipping timing → Cascade risk
  - Population floor lowering → Near-extinction scenarios → Recovery impossibility

**5. Monte Carlo Validation**
- Update "Testing & Validation" section
- Explain threshold sampling across Monte Carlo runs
- Document expected outcome variance from M-5

### Phase 3: User-Facing Features (MEDIUM priority)

**6. CRITICAL-1: Game UI State Integration**
- Document dashboard connection (if user-facing section exists)
- Explain advocacy actions, state visualization
- Link to frontend documentation

**7. M-7: Near-Extinction Scenarios**
- Add to "Extinction Modeling" or "Population Dynamics" section
- Explain Toba bottleneck justification (10K minimum vs 10M)
- Document validation approach

## Implementation Strategy

**Efficiency Approach:**
- Leverage existing implementation-history docs (M-6: 16K, HIGH-7: 15K)
- Extract 300-600 word summaries instead of writing from scratch
- Link to detailed docs rather than duplicating
- Use grep to find relevant wiki sections quickly

**Quality Approach:**
- Use research-backed language (cite papers, not opinions)
- Include code references (file:line for key implementations)
- Add examples (not just descriptions)
- Cross-link related systems

## Effort Estimate

**Research:** 0 sessions (implementation-history docs already exist)
**Writing:** 1-2 sessions (wiki-documentation-updater agent, 2000-3000 words total)
**Review:** 0.5 session (check cross-references, fix broken links)

**Total:** 1.5-2.5 sessions

## Success Criteria

1. **All 5 features documented:** M-6, M-5, M-7, HIGH-7, CRITICAL-1 in wiki
2. **Research citations present:** Key papers linked for each system
3. **Code references working:** file:line links point to correct locations
4. **Cross-links functional:** Related systems reference each other
5. **Examples included:** At least 1 concrete example per major feature

## Risks

- **Token cost:** Full wiki sync could consume 20K-30K tokens
- **Synchronization debt:** More features complete during wiki update (accept this)
- **Duplication vs linking tradeoff:** Too much linking → fragmented reading experience

## Mitigation

- **Token conservation:** Use wiki-documentation-updater agent (optimized for this task)
- **Incremental approach:** Do CRITICAL items first, defer MEDIUM if tokens limited
- **Link strategy:** 70% wiki content, 30% links to impl-history (balance readability vs duplication)

## Next Steps

1. Wait for normal operation mode (not token conservation)
2. Route to wiki-documentation-updater agent
3. Update M-6, M-5, HIGH-7 (CRITICAL priority, ~1000 words)
4. Update cross-system interactions
5. Update M-7, CRITICAL-1 if tokens available

## Priority Rationale

**MEDIUM priority:**
- Not blocking development (implementation-history docs exist)
- But harms user experience (new features invisible)
- Research integrity: wiki claims to be "comprehensive" but missing 5 major systems
- Academic credibility: reviewers will notice documentation lag

**If upgraded to HIGH:**
- External demo/presentation scheduled (need current wiki)
- Academic paper submission (wiki is primary documentation source)
- User reports confusion about undocumented features

**Defer to LOW if:**
- More CRITICAL bugs discovered
- Token budget critically constrained
- Major refactoring planned (would invalidate wiki updates)

## Related Work

- Implementation-history docs: M-6 (16K), HIGH-7 (15K) - reuse these
- Wiki structure: 3000+ lines, well-organized, just needs content updates
- Previous wiki sync: Session 51 (Dec 3) - 5 days lag is tolerable but growing
