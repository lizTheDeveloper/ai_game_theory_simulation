# GitHub Actions Automation Plan
## Automated Agent Workflows for Research Simulation Project

**Date:** October 24, 2025
**Purpose:** Automate the multi-agent orchestration workflow using GitHub Actions
**Philosophy:** Maintain research standards while enabling autonomous feature development

---

## Fresh Agent Session Pattern (ALL workflows use Claude Code SDK)

**Core Principle:** Every GitHub Actions workflow launches a **fresh Claude Code SDK session** with minimal context (no prior conversation history).

### Why Claude Code SDK for Everything?

**Not using raw Claude API because:**
- Agent needs **tooling** (Read, Edit, Bash, Grep, Glob)
- Agent needs to **investigate** (read files to answer questions)
- Agent needs to **validate** (run tests, check types)
- Agent needs to **iterate** (explore → understand → decide)

**Even for "simple" tasks like checklists:**
- Checklist agent needs to **Grep for TODOs**
- Checklist agent needs to **Read test files** to verify coverage
- Checklist agent needs to **Bash run tsc** to check TypeScript errors
- Checklist agent needs to **Read wiki** to check documentation

### Fresh Session Context Pattern

**ALL workflows use this context structure:**

```
You are the [agent-name] agent. You have Claude Code SDK tools available.

**YOUR CONTEXT (fresh session, NO prior conversation):**

**ORIGINAL GOAL:**
[What the feature-implementer was supposed to do]

**WHAT WAS ACTUALLY CHANGED:**
[Git diff showing all accumulated changes]

**YOUR TASK:**
[Specific task for this agent]

**RULES:**
- Use Read/Edit/Bash/Grep tools to investigate
- Save output to [filename.md]
- After saving, TERMINATE (no commentary)
```

### Context Budget Strategy

**What to include:**
- ✅ **Original feature goal** (what was requested initially)
- ✅ **Accumulated git diff** (all changes made so far)
- ✅ **Specific task** (what this agent should do)
- ✅ **File statistics** (counts of changed files by type)

**What to exclude:**
- ❌ **Conversation history** from feature-implementer
- ❌ **Iteration details** (don't need to know how implementer worked)
- ❌ **Related discussions** (planning, design debates)

**Benefits:**
- **Token reduction:** ~10-20K vs ~100-200K with full conversation
- **Cost reduction:** ~80% savings per workflow run
- **Clarity:** Agent knows exactly what context it has
- **Consistency:** Same pattern across all agents

### Example: Senior Dev Checklist Workflow

**How it works:**
1. PR is created by feature-implementer
2. GitHub Actions extracts **original feature goal** from PR body
3. GitHub Actions gets **git diff** of all changes
4. **Fresh Claude Code SDK session** launched with both contexts
5. Agent uses tools (Grep, Read, Bash) to answer 15 questions
6. Agent saves answers to `checklist_answers.md`
7. GitHub Actions reads file and posts to PR

**Prompt structure:**
```bash
cat > senior_dev_checklist_prompt.txt << 'EOF'
You are reviewing a PR. You have Claude Code SDK tools available.

**YOUR CONTEXT (fresh session, NO prior conversation):**

**ORIGINAL FEATURE GOAL:**
Implement nuclear winter cascades with agricultural collapse...

**WHAT WAS ACTUALLY CHANGED:**
Git diff (first 500 lines):
+++ src/simulation/nuclearWinter.ts
+export function calculateNuclearWinter(state: GameState): void {
...

**YOUR TASK:**
Answer 15 senior dev questions. USE TOOLS to investigate:
- Grep for TODOs, console.logs, magic numbers
- Read test files to check coverage
- Bash run `npx tsc --noEmit` to check types

**20 QUESTIONS (save answers to checklist_answers.md):**

**Testing & Validation:**
1. Tests?
2. Edge cases?
3. End-to-end?

**Code Quality:**
4. TODOs?
5. Mocks?
6. Test quality?
7. Magic numbers?
8. Console.logs?

**Documentation:**
9. Documentation?
10. Type definitions?
11. Wiki?
12. Research citations?

**System Integration:**
13. TypeScript errors?
14. Related systems?
15. Phase registration?

**Phase Architecture (CRITICAL):**
16. Phase interactions? (reads state from other phases?)
17. Phase order? (execution order matters?)
18. Duplicate logic? (overlaps with existing phase?)
19. Phase necessity? (could live in existing phase?)
20. State propagation? (what does it write, who depends on it?)

**RULES:**
- Each answer: 1 line, max 15 words
- Use tools (don't guess)
- Save to checklist_answers.md
- TERMINATE after saving
EOF
```

**Claude Code SDK invocation:**
```yaml
- name: Run Senior Dev Checklist (Claude Code SDK)
  uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt_file: senior_dev_checklist_prompt.txt
    claude_args: --max-turns 20
```

**Key benefits:**
- Agent has **full tooling** to investigate properly
- Agent gets **original goal + accumulated changes** (minimal context)
- Agent has **NO conversation history** from feature-implementer
- Token usage: ~15-20K vs ~100-200K with full conversation (85% reduction)

---

## Overview

This plan maps the existing `.claude/agents/` orchestration system to GitHub Actions workflows, enabling automated feature implementation with human approval gates.

**Key Insight:** Your current orchestrator already defines a complete workflow (research → validation → implementation → review → documentation). We can mirror this in GitHub Actions with the same quality gates.

---

## Workflow Mapping

### Current Agent Workflow
```
orchestrator → super-alignment-researcher → research-skeptic (GATE 1) →
feature-implementer → architecture-skeptic (GATE 2) →
wiki-documentation-updater → project-plan-manager
```

### GitHub Actions Equivalent
```
Issue Created → Research Action → Review Check (GATE 1) →
Implementation PR → Architecture Review (GATE 2) →
Documentation Update → Roadmap Cleanup
```

---

## Phase 1: Issue-Driven Feature Approval (IMMEDIATE)

### Workflow: `.github/workflows/feature-approved.yml`

**Trigger:** Issue labeled with `feature-approved` by repository owner

**What it does:**
1. Extracts feature description from issue
2. Checks if research exists (search `/research/` for related docs)
3. If no research → Creates comment requesting research
4. If research exists → Automatically creates PR branch
5. Posts status to issue with next steps

**Example:**
```yaml
name: Feature Approved Workflow
on:
  issues:
    types: [labeled]

jobs:
  check-approval:
    if: github.event.label.name == 'feature-approved'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check if Owner Approved
        run: |
          if [ "${{ github.event.sender.login }}" != "${{ github.repository_owner }}" ]; then
            echo "Only repository owner can approve features"
            exit 1
          fi

      - name: Extract Feature Details
        id: feature
        run: |
          # Parse issue body for feature name, complexity, systems affected
          FEATURE_NAME=$(echo "${{ github.event.issue.title }}" | sed 's/Feature: //g')
          echo "name=$FEATURE_NAME" >> $GITHUB_OUTPUT

      - name: Check Research Exists
        id: research
        run: |
          # Search for related research files
          FEATURE_SLUG=$(echo "${{ steps.feature.outputs.name }}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
          RESEARCH_FILES=$(find research/ -name "*${FEATURE_SLUG}*.md" | wc -l)
          echo "exists=$RESEARCH_FILES" >> $GITHUB_OUTPUT

      - name: Create PR Branch
        if: steps.research.outputs.exists > 0
        run: |
          BRANCH="feature/${{ steps.feature.outputs.name }}"
          git checkout -b "$BRANCH"
          git push origin "$BRANCH"

      - name: Post Status Comment
        uses: actions/github-script@v7
        with:
          script: |
            const researchExists = ${{ steps.research.outputs.exists }};
            const body = researchExists > 0
              ? `✅ Research found! Created branch \`feature/${{ steps.feature.outputs.name }}\`\n\nNext: Triggering implementation workflow...`
              : `⚠️ No research found for this feature.\n\nPlease run research phase first:\n1. Use super-alignment-researcher agent\n2. Validate with research-skeptic\n3. Re-label this issue when ready`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
```

**Benefits:**
- Owner-only approval required (built-in safety)
- Automated research check (quality gate)
- Creates feature branch automatically
- Clear next steps communicated

---

## Phase 2: Automated Architecture Review (HIGH VALUE)

### Workflow: `.github/workflows/architecture-review.yml`

**Trigger:** PR opened from `feature/*` branch

**What it does:**
1. Runs architecture-skeptic agent via Claude API
2. Posts findings as PR review comments
3. Sets PR status (CRITICAL → request changes, else approve for human review)
4. Labels PR with severity level

**Architecture-Skeptic Integration:**
```yaml
name: Architecture Review
on:
  pull_request:
    types: [opened, synchronize]
    branches:
      - main

jobs:
  architecture-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for proper diff

      - name: Get Changed Files
        id: changes
        run: |
          # Get list of changed files
          git diff --name-only origin/main...HEAD > changed_files.txt
          cat changed_files.txt

      - name: Run Architecture Skeptic
        id: review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Call architecture-skeptic agent via Claude API
          # Pass changed files + PR description as context

          CHANGED_FILES=$(cat changed_files.txt)
          PR_DESCRIPTION="${{ github.event.pull_request.body }}"

          # Build prompt for architecture-skeptic
          PROMPT="You are the Architecture Skeptic agent reviewing this PR.

          **Changed Files:**
          $CHANGED_FILES

          **PR Description:**
          $PR_DESCRIPTION

          Review for:
          1. State propagation issues
          2. Performance bottlenecks
          3. Memory leaks or resource exhaustion
          4. Race conditions
          5. Architectural anti-patterns

          Categorize findings: CRITICAL, HIGH, MEDIUM, LOW
          Output as JSON: {severity: string, issues: [{file, line, description, impact, recommendation}]}"

          # Call Claude API with architecture-skeptic prompt
          # (Implementation details depend on Claude Code API access)

      - name: Post Review Comments
        if: steps.review.outputs.issues != '[]'
        uses: actions/github-script@v7
        with:
          script: |
            const issues = JSON.parse('${{ steps.review.outputs.issues }}');

            for (const issue of issues) {
              await github.rest.pulls.createReviewComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: context.issue.number,
                body: `**${issue.severity}**: ${issue.description}\n\n**Impact:** ${issue.impact}\n**Recommendation:** ${issue.recommendation}`,
                path: issue.file,
                line: issue.line,
                side: 'RIGHT'
              });
            }

      - name: Set PR Status
        uses: actions/github-script@v7
        with:
          script: |
            const severity = '${{ steps.review.outputs.severity }}';
            const state = severity === 'CRITICAL' ? 'REQUEST_CHANGES' : 'COMMENT';

            await github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              event: state,
              body: severity === 'CRITICAL'
                ? '🚨 Critical architectural issues found. Address before merge.'
                : '✅ No critical issues. Human review recommended for HIGH/MEDIUM findings.'
            });

      - name: Label PR
        uses: actions/github-script@v7
        with:
          script: |
            const labels = {
              CRITICAL: ['architecture-critical', 'do-not-merge'],
              HIGH: ['architecture-high', 'needs-review'],
              MEDIUM: ['architecture-medium'],
              LOW: ['architecture-clean']
            };

            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              labels: labels['${{ steps.review.outputs.severity }}']
            });
```

**Benefits:**
- Automated architecture review on every PR
- CRITICAL issues block merge automatically
- Review comments pinpoint exact files/lines
- Labels make PR triage instant
- Human review still required (safety net)

---

## Phase 3: Research-Skeptic Validation (QUALITY GATE)

### Workflow: `.github/workflows/research-validation.yml`

**Trigger:** New file added to `/research/` directory

**What it does:**
1. Detects new research markdown files
2. Runs research-skeptic agent to validate
3. Creates review comment with critique
4. Blocks feature approval if critique fails

**Research-Skeptic Integration:**
```yaml
name: Research Validation
on:
  pull_request:
    paths:
      - 'research/**.md'

jobs:
  validate-research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get New Research Files
        id: research
        run: |
          git diff --name-only --diff-filter=A origin/main...HEAD | grep "^research/" > new_research.txt || true

          if [ ! -s new_research.txt ]; then
            echo "No new research files"
            exit 0
          fi

          cat new_research.txt

      - name: Run Research Skeptic
        if: steps.research.outputs.files != ''
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # For each research file, run research-skeptic validation

          while IFS= read -r file; do
            CONTENT=$(cat "$file")

            PROMPT="You are the Research Skeptic agent. Validate this research:

            **File:** $file

            **Content:**
            $CONTENT

            Check for:
            1. Contradictory evidence in literature
            2. Methodological flaws
            3. Cherry-picked citations
            4. Overconfident claims
            5. Missing uncertainty quantification

            Output: {pass: boolean, confidence: number, issues: [string], recommendations: [string]}"

            # Call Claude API with research-skeptic prompt
            # Store results
          done < new_research.txt

      - name: Post Critique
        uses: actions/github-script@v7
        with:
          script: |
            const results = JSON.parse('${{ steps.research.outputs.results }}');

            const body = results.map(r => `
            ## ${r.file}

            **Status:** ${r.pass ? '✅ PASS' : '❌ FAIL'}
            **Confidence:** ${r.confidence}%

            ### Issues Found
            ${r.issues.map(i => `- ${i}`).join('\n')}

            ### Recommendations
            ${r.recommendations.map(r => `- ${r}`).join('\n')}
            `).join('\n\n---\n\n');

            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `# Research Validation Results\n\n${body}`
            });

      - name: Block if Failed
        if: steps.research.outputs.pass == 'false'
        run: |
          echo "Research validation failed. Address issues before feature approval."
          exit 1
```

**Benefits:**
- Enforces research quality gate
- Automated critique on every research submission
- Prevents flawed research from proceeding to implementation
- Clear feedback on what needs improvement

---

## Phase 4: Automated Implementation (ADVANCED)

### Workflow: `.github/workflows/feature-implementation.yml`

**Trigger:** Issue labeled `feature-approved` AND research validated

**What it does:**
1. Checks out feature branch
2. Runs feature-implementer agent via Claude API
3. Commits generated code
4. Runs tests
5. Creates draft PR if tests pass

**Feature-Implementer Integration:**
```yaml
name: Feature Implementation
on:
  workflow_run:
    workflows: ["Feature Approved Workflow"]
    types:
      - completed

jobs:
  implement:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_branch }}

      - name: Load Feature Plan
        id: plan
        run: |
          # Find plan in /plans/ matching feature name
          FEATURE_NAME="${{ github.event.workflow_run.head_branch }}"
          PLAN_FILE=$(find plans/ -name "*${FEATURE_NAME}*.md" | head -1)

          if [ -z "$PLAN_FILE" ]; then
            echo "No plan found for $FEATURE_NAME"
            exit 1
          fi

          PLAN_CONTENT=$(cat "$PLAN_FILE")
          echo "content=$PLAN_CONTENT" >> $GITHUB_OUTPUT

      - name: Run Feature Implementer
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Call feature-implementer agent

          PROMPT="You are the Feature Implementer agent.

          **Plan:**
          ${{ steps.plan.outputs.content }}

          Implement this feature following the plan:
          1. Add state to src/types/game.ts
          2. Create system module in src/simulation/
          3. Create phase in src/simulation/engine/phases/
          4. Register phase in orchestrator
          5. Add logging

          Output: JSON with {files: [{path, content, action: 'create'|'modify'}], tests: [{path, content}]}"

          # Call Claude API
          # Generate code files

      - name: Apply Generated Code
        run: |
          # Apply file changes from agent output
          FILES='${{ steps.implement.outputs.files }}'

          echo "$FILES" | jq -c '.[]' | while read file; do
            PATH=$(echo "$file" | jq -r '.path')
            CONTENT=$(echo "$file" | jq -r '.content')
            ACTION=$(echo "$file" | jq -r '.action')

            if [ "$ACTION" == "create" ]; then
              mkdir -p $(dirname "$PATH")
              echo "$CONTENT" > "$PATH"
            elif [ "$ACTION" == "modify" ]; then
              echo "$CONTENT" > "$PATH"
            fi
          done

      - name: Run Tests
        run: |
          npm test

      - name: Commit and Push
        if: success()
        run: |
          git config user.name "feature-implementer-bot"
          git config user.email "bot@superalignment.dev"

          git add .
          git commit -m "feat: Implement ${{ github.event.workflow_run.head_branch }}

          🤖 Generated with Claude Code Feature Implementer

          Plan: ${{ steps.plan.outputs.plan_file }}"

          git push origin ${{ github.event.workflow_run.head_branch }}

      - name: Create Draft PR
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.pulls.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Feature: ${{ github.event.workflow_run.head_branch }}`,
              head: `${{ github.event.workflow_run.head_branch }}`,
              base: 'main',
              draft: true,
              body: `## Automated Implementation

              This PR was generated by the feature-implementer agent.

              **Plan:** ${{ steps.plan.outputs.plan_file }}

              ### Next Steps
              1. ✅ Architecture review will run automatically
              2. ⏳ Human review required before merge
              3. ⏳ Mark as ready for review when satisfied

              🤖 Generated with Claude Code`
            });
```

**Benefits:**
- Fully automated implementation from approved plan
- Tests must pass before PR creation
- Draft PR prevents accidental merge
- Clear audit trail (plan → code → tests)

---

## Phase 5: Documentation & Roadmap Updates

### Workflow: `.github/workflows/post-merge-cleanup.yml`

**Trigger:** PR merged to main from `feature/*` branch

**What it does:**
1. Runs wiki-documentation-updater
2. Runs project-plan-manager to archive plan
3. Updates MASTER_IMPLEMENTATION_ROADMAP.md
4. Closes related issue

```yaml
name: Post-Merge Cleanup
on:
  pull_request:
    types: [closed]
    branches:
      - main

jobs:
  cleanup:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update Wiki
        run: |
          # Run wiki-documentation-updater logic
          # Compare git commits, update docs/wiki/README.md

      - name: Archive Plan
        run: |
          # Find related plan file
          FEATURE_NAME="${{ github.event.pull_request.head.ref }}"
          PLAN_FILE=$(find plans/ -name "*${FEATURE_NAME}*.md" | head -1)

          if [ -n "$PLAN_FILE" ]; then
            # Move to plans/completed/
            COMPLETED_NAME="plans/completed/$(basename $PLAN_FILE .md)_COMPLETE_$(date +%Y%m%d).md"
            mv "$PLAN_FILE" "$COMPLETED_NAME"

            # Update roadmap
            sed -i "/## Active Development/a \\n**✅ $(basename $PLAN_FILE .md) - COMPLETE**\\n- Archive: $COMPLETED_NAME" plans/MASTER_IMPLEMENTATION_ROADMAP.md
          fi

      - name: Commit Updates
        run: |
          git config user.name "roadmap-manager-bot"
          git config user.email "bot@superalignment.dev"

          git add .
          git commit -m "docs: Archive completed plan and update roadmap

          Feature: ${{ github.event.pull_request.title }}
          PR: #${{ github.event.pull_request.number }}"

          git push origin main

      - name: Close Related Issue
        uses: actions/github-script@v7
        with:
          script: |
            // Find issue that triggered this feature
            const issues = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: 'feature-approved'
            });

            const relatedIssue = issues.data.find(i =>
              i.title.toLowerCase().includes('${{ github.event.pull_request.head.ref }}'.toLowerCase())
            );

            if (relatedIssue) {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: relatedIssue.number,
                body: '✅ Feature implemented and merged in PR #${{ github.event.pull_request.number }}'
              });

              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: relatedIssue.number,
                state: 'closed'
              });
            }
```

---

## Example: Complete Feature Flow

### Scenario: Implement "Nuclear Winter Cascades" from roadmap

**Step 1: You create GitHub Issue**
```markdown
Title: Feature: Nuclear Winter Cascades
Body:
## Description
Implement nuclear winter cascades from the roadmap.

## Requirements
- Model temperature drops from nuclear detonations
- Agricultural collapse from reduced sunlight
- Famine cascades with regional variation

## Plan
See /plans/nuclear-winter-plan.md

## Complexity
HIGH (5+ interacting systems)
```

**Step 2: You label issue `feature-approved`**
- Workflow checks you're the owner ✅
- Workflow finds existing research ✅
- Workflow creates branch `feature/nuclear-winter-cascades`
- Comments: "✅ Research found! Triggering implementation..."

**Step 3: Automated Implementation**
- feature-implementer agent reads plan
- Generates code files
- Commits to branch
- Tests run automatically
- Creates draft PR if tests pass

**Step 4: Architecture Review**
- architecture-skeptic agent analyzes PR
- Posts review comments on specific lines
- Labels PR `architecture-medium` (no critical issues)
- Status: "✅ No critical issues. Human review recommended."

**Step 5: Human Review**
- You review the generated code
- Make any adjustments needed
- Mark PR as ready for review
- Merge when satisfied

**Step 6: Post-Merge Automation**
- wiki-documentation-updater runs
- Plan archived to `/plans/completed/`
- Roadmap updated
- Issue auto-closed
- Comment: "✅ Feature implemented and merged in PR #42"

---

## Safety & Control

### Human Approval Gates

**Gate 1: Feature Approval (Required)**
- Only repository owner can label `feature-approved`
- Prevents unauthorized feature work

**Gate 2: Research Validation (Automated)**
- research-skeptic must pass before implementation
- Failing research blocks feature approval

**Gate 3: Architecture Review (Automated + Human)**
- CRITICAL issues block merge automatically
- HIGH/MEDIUM issues flagged for human review
- Final merge still requires human approval

**Gate 4: PR Merge (Required)**
- Draft PRs prevent accidental merge
- Human must mark as ready + approve
- All tests must pass

### Rollback Procedures

If automated agent makes mistakes:
1. PR is draft by default (no auto-merge)
2. You can request changes before merge
3. If bad code merges: `git revert` the merge commit
4. Update agent prompts to prevent recurrence

---

## Implementation Phases

### Phase 1 (Week 1): Foundation
- [x] GitHub Actions setup
- [ ] Feature approval workflow (owner-only gate)
- [ ] Branch creation automation
- [ ] Issue → PR linking

**Deliverable:** Manual research + approval, automated branch creation

### Phase 2 (Week 2): Quality Gates
- [ ] Research-skeptic workflow (validates research)
- [ ] Architecture-skeptic workflow (reviews PRs)
- [ ] Automated PR labeling
- [ ] Block merge on CRITICAL issues

**Deliverable:** Automated quality gates with human override

### Phase 3 (Week 3): Implementation
- [ ] Feature-implementer workflow (generates code)
- [ ] Automated testing
- [ ] Draft PR creation
- [ ] Code generation validation

**Deliverable:** End-to-end automated implementation

### Phase 4 (Week 4): Documentation
- [ ] Wiki updater workflow
- [ ] Plan archival workflow
- [ ] Roadmap automation
- [ ] Issue closure

**Deliverable:** Full lifecycle automation

---

## Cost Analysis

### Claude API Usage

**Estimated costs per feature:**
- Research-skeptic validation: ~10K tokens (~$0.03)
- Architecture-skeptic review: ~50K tokens (~$0.15)
- Feature-implementer generation: ~100K tokens (~$0.30)
- Wiki documentation: ~20K tokens (~$0.06)

**Total per feature:** ~$0.54

**Monthly (10 features):** ~$5.40

**Benefit:** Saves 4-6 hours of manual agent coordination per feature

### GitHub Actions Minutes

**Free tier:** 2,000 minutes/month
**Estimated usage:** ~50 minutes per feature
**Monthly (10 features):** ~500 minutes

Well within free tier limits.

---

## Success Metrics

### Automation Effectiveness
- **Feature throughput:** Features completed per week
- **Quality gate pass rate:** % of features passing architecture review
- **Research validation rate:** % of research passing skeptic review
- **Manual intervention rate:** % of PRs requiring human code changes

### Research Standards
- **Citation coverage:** % of features with peer-reviewed sources
- **Parameter justification:** % of parameters with research backing
- **Critique pass rate:** Research passing skeptic review first time

### Time Savings
- **Manual coordination hours saved:** Track time from roadmap → merge
- **Review latency:** Time from PR open → architecture review complete
- **Documentation lag:** Time from merge → wiki updated

---

## Next Steps

### Immediate (Today)
1. Set up GitHub Actions secret for `ANTHROPIC_API_KEY`
2. Create `.github/workflows/feature-approved.yml` (Phase 1)
3. Test with simple feature from roadmap
4. Document learnings

### Short-term (This Week)
1. Implement research-skeptic workflow
2. Implement architecture-skeptic workflow
3. Test quality gates with real features
4. Refine agent prompts based on results

### Medium-term (This Month)
1. Implement feature-implementer workflow
2. Enable automated code generation
3. Add comprehensive testing
4. Full lifecycle automation

### Long-term (3 Months)
1. Fine-tune agent prompts for better code quality
2. Add Monte Carlo validation to workflows
3. Expand to dashboard component generation
4. Continuous improvement based on metrics

---

## Appendix: Agent → Workflow Mapping

| Agent | Current Use | GitHub Action | Trigger | Output |
|-------|-------------|---------------|---------|--------|
| **orchestrator** | Coordinates workflow | Not needed | N/A | Workflow orchestration handled by GitHub Actions |
| **super-alignment-researcher** | Find peer-reviewed sources | Manual (for now) | Owner-initiated | `/research/[topic]_YYYYMMDD.md` |
| **research-skeptic** | Validate research | `research-validation.yml` | New file in `/research/` | PR review comment with critique |
| **feature-implementer** | Generate code | `feature-implementation.yml` | Issue labeled `feature-approved` | Code commits, draft PR |
| **architecture-skeptic** | Review PRs | `architecture-review.yml` | PR opened | PR review comments, labels |
| **unit-test-writer** | Generate tests | Integrated in `feature-implementation.yml` | After code generation | Test files |
| **integration-test-writer** | Generate integration tests | Integrated in `feature-implementation.yml` | After code generation | Integration test files |
| **wiki-documentation-updater** | Update wiki | `post-merge-cleanup.yml` | PR merged | Updated `docs/wiki/README.md` |
| **project-plan-manager** | Archive plans | `post-merge-cleanup.yml` | PR merged | Plan moved to `/plans/completed/` |

---

**Status:** Plan complete, ready for phased implementation
**Next:** Create Phase 1 workflows and test with simple feature
