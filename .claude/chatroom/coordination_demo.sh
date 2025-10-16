#!/bin/bash
# Coordination Demo: Two agents working together
# Simulates feature-implementer and architecture-skeptic coordination

source "$(dirname "$0")/chat_helpers.sh"

FEATURE="nuclear-war-prevention"

echo "=========================================="
echo "  Agent Coordination Demo"
echo "  Simulating: feature-implementer + architecture-skeptic"
echo "  Feature: $FEATURE"
echo "=========================================="
echo ""

# Clean slate
reset_lastread "$FEATURE"
create_channel "$FEATURE" "Nuclear war prevention feature implementation"

echo "🟢 ORCHESTRATOR: Starting feature implementation workflow"
post_msg "$FEATURE" "orchestrator" "STARTED" "Beginning $FEATURE implementation
**Workflow:** Research validated ✓ → Implementation → Architecture review → Documentation"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Starting implementation"
post_msg "$FEATURE" "feature-implementer" "STARTED" "Beginning Phase 1: State definitions

**Plan:** /plans/tier1-nuclear-war-prevention.md
**Worktree:** ../superalignmenttoutopia-nuclear-war
**Estimated:** 8-12 hours total, 4 phases"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Phase 1 progress"
post_msg "$FEATURE" "feature-implementer" "IN-PROGRESS" "Phase 1 implementation complete

**Changes:**
- Added nuclearCommandControl to game.ts (lines 780-820)
- Created src/simulation/nuclearCommandControl.ts
- Implemented human-in-the-loop verification logic
- Added kill switch mechanics

**Next:** Running Monte Carlo validation (N=10)"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Validation results"
post_msg "$FEATURE" "feature-implementer" "IN-PROGRESS" "Monte Carlo validation: ✓ PASSED

**Results:**
- 10/10 runs completed without errors
- Kill switch activated in 8/10 runs when AI manipulation detected
- Nuclear war probability reduced from 40% → 28% (baseline → Phase 1)

**Next:** Moving to Phase 2 (AI manipulation detection)"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Checking coordination"
post_msg "coordination" "feature-implementer" "QUESTION" "About to modify src/simulation/informationWarfare.ts (Phase 2). Anyone working on it?"
sleep 1

echo ""
echo "🟡 (No response after 10 seconds...)"
sleep 1

echo ""
post_msg "coordination" "feature-implementer" "IN-PROGRESS" "No conflicts, proceeding with informationWarfare.ts integration"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Phase 2 complete"
post_msg "$FEATURE" "feature-implementer" "IN-PROGRESS" "Phase 2 complete: AI manipulation detection integrated

**Changes:**
- Enhanced informationWarfare.ts with kill switch hooks
- Added narrative control monitoring (>70% = alarm)
- Integrated with nuclearCommandControl.ts

Monte Carlo: ✓ PASSED (N=10)
Nuclear war probability: 28% → 22%"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: All phases complete"
post_msg "$FEATURE" "feature-implementer" "COMPLETED" "Implementation complete. Ready for architecture review.

**Summary:**
- Phase 1: Human-in-the-loop + kill switches ✓
- Phase 2: AI manipulation detection ✓
- Phase 3: Time delays & cooling-off ✓
- Phase 4: Automatic diplomatic AI ✓

**Testing:**
- Monte Carlo: 40 runs total, all passing
- Nuclear war probability: 40% → 12% (70% reduction!)
- No errors, stable behavior

**Files modified:**
- src/types/game.ts
- src/simulation/nuclearCommandControl.ts
- src/simulation/informationWarfare.ts
- src/simulation/engine/phases/NuclearCommandPhase.ts
- src/simulation/engine/PhaseOrchestrator.ts"
sleep 2

echo ""
echo "🟢 ORCHESTRATOR: Spawning architecture review"
post_msg "$FEATURE" "orchestrator" "IN-PROGRESS" "Implementation complete. Spawning architecture-skeptic for review..."
sleep 2

echo ""
echo "🔴 ARCHITECTURE-SKEPTIC: Beginning review"
post_msg "$FEATURE" "architecture-skeptic" "IN-PROGRESS" "Reviewing implementation of $FEATURE

**Scope:**
- State management patterns
- Performance analysis
- Race condition checks
- Integration points"
sleep 3

echo ""
echo "🔴 ARCHITECTURE-SKEPTIC: CRITICAL ISSUE FOUND!"
post_msg "$FEATURE" "architecture-skeptic" "ALERT" "CRITICAL ISSUE identified

**File:** src/simulation/nuclearCommandControl.ts:67-89
**Issue:** Race condition in kill switch activation
**Severity:** CRITICAL (system stability at risk)

**Details:**
AI could launch nuclear weapons before kill switch deactivation completes.
Current code:
\`\`\`
if (shouldActivateKillSwitch) {
  deactivateAI(aiAgent);  // Async operation
  preventLaunch();        // Runs immediately, but AI still active
}
\`\`\`

**Impact:** Kill switch may fail to prevent launch in ~5-10% of cases

**Recommendation:**
Use atomic transaction wrapper to ensure kill switch completes before launch sequence:
\`\`\`
await atomicTransaction(() => {
  deactivateAI(aiAgent);
  preventLaunch();
});
\`\`\`

**Estimated fix:** 2-3 hours

**Blocking:** Documentation until resolved"
post_msg "architecture" "architecture-skeptic" "ALERT" "Critical race condition found in $FEATURE. See feature channel for details."
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Acknowledged, fixing"
post_msg "$FEATURE" "feature-implementer" "IN-PROGRESS" "Acknowledged CRITICAL issue. Fixing race condition now.

**Action plan:**
1. Add atomic transaction wrapper to kill switch
2. Add unit tests for race condition scenario
3. Re-run Monte Carlo to verify fix
4. Request re-review from architecture-skeptic

**ETA:** 2-3 hours"
sleep 2

echo ""
echo "🔵 FEATURE-IMPLEMENTER: Fix complete"
post_msg "$FEATURE" "feature-implementer" "IN-PROGRESS" "Race condition fixed

**Changes:**
- Added atomicTransaction wrapper (nuclearCommandControl.ts:67-95)
- Added mutex lock to prevent concurrent launches
- Added unit tests for race condition (tests/nuclearCommandControl.test.ts)

**Validation:**
- Unit tests: ✓ PASSED (including new race condition tests)
- Monte Carlo: ✓ PASSED (N=20 to stress-test)
- No launch failures detected in 1000 simulated kill switch activations

Ready for re-review"
sleep 2

echo ""
echo "🔴 ARCHITECTURE-SKEPTIC: Re-review"
post_msg "$FEATURE" "architecture-skeptic" "IN-PROGRESS" "Re-reviewing race condition fix...

✓ Atomic transaction correctly implemented
✓ Mutex lock prevents concurrent access
✓ Unit tests cover edge cases
✓ Monte Carlo validation robust (N=20)

**Updated assessment:** CRITICAL issue resolved

**Remaining findings:**
- MEDIUM: Consider connection pooling for diplomatic AI (performance)
- LOW: Add jsdoc comments to public API

**Recommendation:** APPROVED for documentation
All CRITICAL and HIGH issues resolved."
post_msg "architecture" "architecture-skeptic" "IN-PROGRESS" "$FEATURE architecture review: APPROVED (after fixes)"
sleep 2

echo ""
echo "🟢 ORCHESTRATOR: Architecture approved, proceeding to documentation"
post_msg "$FEATURE" "orchestrator" "IN-PROGRESS" "Architecture review passed. Spawning wiki-documentation-updater..."
sleep 1

echo ""
echo "🟣 WIKI-DOCUMENTATION-UPDATER: Updating wiki"
post_msg "documentation" "wiki-documentation-updater" "IN-PROGRESS" "Updating wiki for $FEATURE

**Sections updated:**
- Nuclear Command & Control system added
- Kill Switch mechanics documented
- AI Manipulation Detection explained
- System interaction diagram updated

✓ Wiki updated: docs/wiki/README.md"
sleep 2

echo ""
echo "🟢 ORCHESTRATOR: Feature complete!"
post_msg "$FEATURE" "orchestrator" "COMPLETED" "Feature implementation workflow complete!

**✓ Research:** Validated by research-skeptic
**✓ Implementation:** 4 phases, all Monte Carlo passing
**✓ Architecture Review:** Passed (after CRITICAL fix)
**✓ Documentation:** Wiki updated

**Impact:**
Nuclear war probability: 40% → 12% (70% reduction!)

Feature archived to plans/completed/ and roadmap updated.

**Total time:** ~14 hours (including race condition fix)"

echo ""
echo "=========================================="
echo "  Demo Complete!"
echo ""
echo "  This demonstrated:"
echo "  1. Feature-implementer posting progress"
echo "  2. Coordination check before shared file"
echo "  3. Architecture-skeptic finding CRITICAL issue"
echo "  4. Feature-implementer fixing and re-validating"
echo "  5. Orchestrator managing workflow handoffs"
echo ""
echo "  Check $FEATURE.md to see the full conversation"
echo "=========================================="
