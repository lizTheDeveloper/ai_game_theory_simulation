# Post-Commit Research Verification Workflow

**Automatic documentation and research verification system**

## Overview

A git post-commit hook that automatically maintains documentation and creates research verification queues for commits that introduce new mechanics or parameters.

## Components

### 1. Git Hook
**Location:** `.git/hooks/post-commit` (executable)

**Triggers:** After every `git commit`

**Loop Prevention:**
- Checks for "historian" in commit message
- Skips processing historian commits
- Prevents infinite loops

### 2. Historian Agent
**Agent:** `wiki-documentation-updater`

**Responsibilities:**
1. **Documentation Updates:** Auto-updates `docs/wiki/README.md`
2. **Research Verification Files:** Creates verification specs for new mechanics
3. **Roadmap Management:** Adds items to research verification queue
4. **Orchestrator Alerts:** Posts to `#implementation` channel

### 3. Research Verification Template
**Location:** `research/RESEARCH_VERIFICATION_TEMPLATE.md`

**Format:**
- Metadata (commit hash, date, files)
- Parameters requiring verification
- New mechanics requiring validation
- Changed assumptions
- Next steps for orchestrator

### 4. Orchestrator Integration
**Channel:** `#implementation`

**Flow:**
1. Historian posts alert with research verification file
2. Orchestrator picks up from implementation channel
3. Starts at VALIDATION phase (research file already created)
4. Spawns research-skeptic + super-alignment-researcher
5. Proceeds through implementation → testing → documentation
6. Archives verification file when complete

## Workflow Diagram

```
┌─────────────────┐
│  git commit     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Post-commit    │◄── Loop check: contains "historian"?
│  Hook Runs      │    YES → Skip
└────────┬────────┘    NO → Continue
         │
         ▼
┌─────────────────┐
│  Spawn          │
│  Historian      │
│  Agent          │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│  Update         │              │  Create Research│
│  docs/wiki/     │              │  Verification   │
│  README.md      │              │  File (if needed)│
└─────────────────┘              └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Add to Roadmap │
                                 │  (Research      │
                                 │  Verification   │
                                 │  Queue)         │
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Post to        │
                                 │  #implementation│
                                 │  channel        │
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Orchestrator   │
                                 │  Picks Up       │
                                 │  (via watcher)  │
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Start at       │
                                 │  VALIDATION     │
                                 │  Phase          │
                                 └─────────────────┘
         │
         ▼
┌─────────────────┐
│  git commit     │◄── Includes "historian" in message
│  (with "historian")
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Post-commit    │
│  Hook Skips     │◄── Loop prevention!
└─────────────────┘
```

## Decision Logic

### Trivial Changes (typos, formatting, comments)
- Updates docs only
- No research verification file
- Single commit: `"historian commit: Auto-update docs for <hash>"`

### Substantive Changes (new mechanics, parameters, systems)
- Updates docs
- Creates research verification file: `research/verification_<hash>_YYYYMMDD.md`
- Adds to roadmap: `plans/SIMULATION_ROADMAP.md`
- Posts to `#implementation` channel
- Triggers orchestrator workflow
- Single commit: `"historian commit: Auto-update docs for <hash>"`

## Safety Features

### Loop Prevention (Primary)
```bash
if echo "$COMMIT_MSG" | grep -qi "historian"; then
  echo "📚 Skipping: This is a historian commit (avoiding loop)"
  exit 0
fi
```

### Agent Instructions (Secondary)
Agent explicitly told to include "historian" in commit message:
```
git commit -m "historian commit: Auto-update docs for <hash>"
```

### Idempotency
- Only commits if docs/research/plans actually changed
- Hook checks `git diff --quiet` before committing

## Roadmap Integration

### Source of Truth
- Roadmap reflects all active work
- No work happens "off the books"
- Clear priority queue for research verification

### Format
```markdown
## Research Verification Queue

- [ ] Verify citations for water consumption (research/verification_abc1234.md)
- [ ] Verify citations for nuclear winter (research/verification_def5678.md)
```

### Lifecycle
1. Historian adds item → `[ ]` unchecked
2. Orchestrator picks up → marks in-progress in commit message
3. Work completes → marks `[x]` complete
4. Verification file archived to `research/completed/`

## Example: Full Cycle

### Commit Made
```bash
git commit -m "feat: Add lithium mining water consumption model"
```

### Historian Spawns
```
📚 Spawning wiki-documentation-updater (historian)...
```

### Historian Actions
1. **Updates docs:**
   - Adds to `docs/wiki/README.md` under "Environmental Systems"

2. **Creates verification file:**
   ```
   research/verification_a1b2c3d_20251029.md
   ```

3. **Updates roadmap:**
   ```markdown
   ## Research Verification Queue

   - [ ] Verify citations for lithium mining water model (research/verification_a1b2c3d.md)
   ```

4. **Posts to channel:**
   ```
   #implementation: "Research verification needed for commit a1b2c3d.
   See research/verification_a1b2c3d.md. Ready for orchestrator to begin
   at VALIDATION phase (research file already created)."
   ```

5. **Commits:**
   ```bash
   git add docs/ research/ plans/
   git commit -m "historian commit: Auto-update docs for a1b2c3d"
   ```

### Orchestrator Responds
1. Watcher detects `#implementation` post
2. Spawns orchestrator
3. Orchestrator reads `research/verification_a1b2c3d.md`
4. Spawns research-skeptic + super-alignment-researcher
5. Validation → Implementation → Testing → Documentation
6. Archives verification file when complete

## Files Modified/Created

### Modified
- `.git/hooks/post-commit` (created, executable)
- `docs/DEVELOPMENT_WORKFLOW.md` (appended workflow section)

### Created
- `research/RESEARCH_VERIFICATION_TEMPLATE.md` (template for agents)
- `docs/POST_COMMIT_WORKFLOW.md` (this file)

## Testing

### Test with Trivial Commit
```bash
echo "# Test" > test.txt
git add test.txt
git commit -m "test: Trivial change"
# Should see: "ℹ️  No documentation changes needed"
```

### Test with Feature Commit
```bash
# Make changes to simulation code
git add src/simulation/newFeature.ts
git commit -m "feat: Add breakthrough technology model"
# Should see:
# 1. Historian spawns
# 2. Docs updated
# 3. Research verification file created (if substantive)
# 4. Roadmap updated
# 5. #implementation post
# 6. Historian commit
```

### Verify Loop Prevention
```bash
# Historian's commit should NOT trigger hook again
git log -2 --oneline
# Should see "historian commit: ..." with no additional hook runs
```

## Maintenance

### If Hook Needs Updates
1. Edit `.git/hooks/post-commit`
2. Test with non-substantive commit first
3. Verify loop prevention still works

### If Template Needs Updates
1. Edit `research/RESEARCH_VERIFICATION_TEMPLATE.md`
2. Historian will use new template on next commit

### Disable Temporarily
```bash
chmod -x .git/hooks/post-commit
# To re-enable:
chmod +x .git/hooks/post-commit
```

## Benefits

1. **Automatic Documentation:** Never forget to update docs
2. **Research Integrity:** Systematic citation verification queue
3. **Roadmap Sync:** Source of truth always current
4. **Audit Trail:** Clear history of what needs verification
5. **Non-Blocking:** Original commits always succeed
6. **Smart Triggering:** Only creates verification files when needed
7. **Orchestrator Integration:** Seamless handoff to workflow system

## Related Documentation

- **Template:** `research/RESEARCH_VERIFICATION_TEMPLATE.md`
- **Workflow Guide:** `docs/DEVELOPMENT_WORKFLOW.md`
- **Chatroom System:** `.claude/chatroom/README.md`
- **Orchestrator:** `.claude/agents/orchestrator.md`
