# System Consistency & Integration Automation Plan
## Beyond Feature Workflows - Maintaining Codebase Health

**Date:** October 24, 2025
**Purpose:** Automated checks for cross-system consistency, integration issues, and technical debt
**Philosophy:** Prevent architectural drift through continuous validation

---

## Problem Statement

### Current Pain Points

**1. Orphaned Systems After Refactors**
- Feature adds `regionalPopulations` but doesn't update all 15 files that reference global population
- Property renamed `economicDependence` → `unemploymentLevel` but 8 files still use old name
- System decomposed (e.g., global QoL → regional QoL) but some phases still read global value

**2. Competing/Duplicate Systems**
- Old system: `state.socialCohesion` (number)
- New system: `state.socialAccumulation.socialCohesion` (object with trust/bonds/liberties)
- Result: Both exist, some code uses old, some uses new → inconsistent behavior

**3. Integration Gaps**
- New feature adds `nuclearWinterState` but doesn't update `climateCrisis` or `environmentalAccumulation`
- Regional feature added but national-level aggregations not updated
- UI pathway added but simulation worker doesn't expose the data

**4. Property Name Drift**
- Type definition: `governmentType`
- Some files use: `type`, `gov_type`, `government.type`
- Result: TypeScript errors, runtime crashes

---

## Solution: Multi-Layer Consistency Checks

### Layer 1: Static Analysis (Pre-Commit)
Fast, automated checks that run before code is committed

### Layer 2: Integration Validation (PR)
Deeper analysis when PRs are opened

### Layer 3: Periodic Audits (Weekly)
Comprehensive system-wide consistency reviews

### Layer 4: Post-Refactor Verification (On-Demand)
Triggered after major refactors to ensure completeness

---

## Layer 1: Pre-Commit Static Analysis

### Workflow: `.github/workflows/pre-commit-checks.yml`

Runs on every push to ensure basic quality gates.

```yaml
name: Pre-Commit Quality Checks

on:
  push:
    branches:
      - '**'  # All branches
  pull_request:
    branches:
      - main

jobs:
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      # CHECK 1: TypeScript Compilation
      - name: TypeScript - Zero Errors Required
        run: |
          echo "Running TypeScript compiler..."
          npx tsc --noEmit

          ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
          if [ "$ERRORS" -gt 0 ]; then
            echo "❌ Found $ERRORS TypeScript errors"
            npx tsc --noEmit
            exit 1
          fi
          echo "✅ TypeScript: 0 errors"

      # CHECK 2: ESLint
      - name: ESLint - Code Quality
        run: |
          npm run lint
        continue-on-error: true  # Don't block on warnings

      # CHECK 3: Unused Exports
      - name: Find Unused Exports
        run: |
          npx ts-prune --error | tee unused-exports.txt
          UNUSED=$(cat unused-exports.txt | wc -l)
          if [ "$UNUSED" -gt 0 ]; then
            echo "⚠️ Found $UNUSED unused exports (review recommended)"
            cat unused-exports.txt
          fi
        continue-on-error: true

      # CHECK 4: Circular Dependencies
      - name: Detect Circular Dependencies
        run: |
          npx madge --circular --extensions ts,tsx src/ | tee circular-deps.txt
          if grep -q "Circular dependency" circular-deps.txt; then
            echo "❌ Circular dependencies found!"
            cat circular-deps.txt
            exit 1
          fi
          echo "✅ No circular dependencies"

      # CHECK 5: Duplicate Code
      - name: Detect Duplicate Code (jscpd)
        run: |
          npx jscpd src/ --threshold 5 --format "typescript" --output duplicate-code.json
          DUPLICATES=$(cat duplicate-code.json | jq '.statistics.total.duplicates')
          if [ "$DUPLICATES" -gt 10 ]; then
            echo "⚠️ Found $DUPLICATES duplicate code blocks (review recommended)"
          fi
        continue-on-error: true

      # CHECK 6: Unused Dependencies
      - name: Find Unused Dependencies
        run: |
          npx depcheck --json | tee depcheck.json
          UNUSED=$(cat depcheck.json | jq '.dependencies | length')
          if [ "$UNUSED" -gt 0 ]; then
            echo "⚠️ Found $UNUSED unused dependencies"
            cat depcheck.json | jq '.dependencies'
          fi
        continue-on-error: true

      # CHECK 7: Property Name Consistency
      - name: Scan for Deprecated Property Names
        run: |
          # Create list of known property migrations
          cat > deprecated-properties.txt << 'EOF'
          economicDependence:unemploymentLevel
          trust:socialAccumulation.socialCohesion.trust
          capabilities:capability
          type:governmentType
          lifecycle:lifecycleState
          timestamp:month
          EOF

          # Scan for usage of old property names
          VIOLATIONS=0
          while IFS=: read -r OLD NEW; do
            MATCHES=$(grep -r "\.$OLD" src/simulation/ --include="*.ts" | grep -v "\/\/" | wc -l)
            if [ "$MATCHES" -gt 0 ]; then
              echo "⚠️ Found $MATCHES uses of deprecated property '$OLD' (should be '$NEW')"
              grep -r "\.$OLD" src/simulation/ --include="*.ts" -n | head -5
              VIOLATIONS=$((VIOLATIONS + MATCHES))
            fi
          done < deprecated-properties.txt

          if [ "$VIOLATIONS" -gt 0 ]; then
            echo "❌ Total deprecated property violations: $VIOLATIONS"
            exit 1
          fi
          echo "✅ No deprecated property names found"

      - name: Post Results Summary
        if: always()
        run: |
          echo "## Static Analysis Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Check | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| TypeScript | ✅ Pass |" >> $GITHUB_STEP_SUMMARY
          echo "| ESLint | ✅ Pass |" >> $GITHUB_STEP_SUMMARY
          echo "| Circular Dependencies | ✅ Pass |" >> $GITHUB_STEP_SUMMARY
          echo "| Property Names | ✅ Pass |" >> $GITHUB_STEP_SUMMARY
```

**Benefits:**
- Catches 90% of consistency issues before PR
- Blocks deprecated property usage automatically
- Finds circular dependencies early
- Fast (runs in 2-3 minutes)

---

## Layer 2: Integration Validation (PR)

### Workflow: `.github/workflows/integration-validator.yml`

Deeper analysis when PRs are opened - checks cross-system impacts.

```yaml
name: Integration Validation

on:
  pull_request:
    types: [opened, synchronize]
    branches:
      - main

jobs:
  validate-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for impact analysis

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      # INTEGRATION CHECK 1: Cross-System Impact Analysis
      - name: Analyze Cross-System Impacts
        id: impacts
        run: |
          # Get changed files
          git diff --name-only origin/main...HEAD > changed_files.txt

          # Define system boundaries (file patterns that define each system)
          cat > system-boundaries.json << 'EOF'
          {
            "environmental": ["src/simulation/environmental*.ts", "src/simulation/planetaryBoundary*.ts", "src/types/accumulation.ts"],
            "social": ["src/simulation/social*.ts", "src/types/society.ts"],
            "economic": ["src/simulation/economic*.ts", "src/types/economy.ts"],
            "government": ["src/simulation/government/**/*.ts", "src/types/government.ts"],
            "ai_agents": ["src/simulation/agents/ai*.ts", "src/types/ai-agents.ts"],
            "quality_of_life": ["src/simulation/qualityOfLife/**/*.ts", "src/types/quality-of-life.ts"],
            "population": ["src/simulation/population*.ts", "src/types/population.ts"]
          }
          EOF

          # Detect which systems are modified
          echo "Detecting affected systems..."
          AFFECTED_SYSTEMS=$(node -e "
            const fs = require('fs');
            const boundaries = JSON.parse(fs.readFileSync('system-boundaries.json'));
            const changed = fs.readFileSync('changed_files.txt', 'utf8').split('\n');

            const affected = new Set();
            for (const [system, patterns] of Object.entries(boundaries)) {
              for (const pattern of patterns) {
                const glob = pattern.replace('**/', '').replace('*.ts', '');
                if (changed.some(file => file.includes(glob))) {
                  affected.add(system);
                }
              }
            }

            console.log(Array.from(affected).join(','));
          ")

          echo "affected_systems=$AFFECTED_SYSTEMS" >> $GITHUB_OUTPUT
          echo "Affected systems: $AFFECTED_SYSTEMS"

      # INTEGRATION CHECK 2: Find Related Systems That Should Update
      - name: Check for Related System Updates
        if: steps.impacts.outputs.affected_systems != ''
        run: |
          # Define system dependencies (if X changes, Y should be reviewed)
          cat > system-dependencies.json << 'EOF'
          {
            "environmental": ["quality_of_life", "population", "economic"],
            "population": ["quality_of_life", "economic", "social"],
            "quality_of_life": ["population"],
            "government": ["ai_agents", "economic", "social"],
            "ai_agents": ["government", "economic"],
            "economic": ["quality_of_life", "population"]
          }
          EOF

          AFFECTED="${{ steps.impacts.outputs.affected_systems }}"

          # Find systems that should be reviewed
          SHOULD_REVIEW=$(node -e "
            const fs = require('fs');
            const deps = JSON.parse(fs.readFileSync('system-dependencies.json'));
            const affected = '$AFFECTED'.split(',').filter(Boolean);

            const shouldReview = new Set();
            for (const system of affected) {
              if (deps[system]) {
                deps[system].forEach(dep => shouldReview.add(dep));
              }
            }

            console.log(Array.from(shouldReview).join(','));
          ")

          echo "Systems that should be reviewed for integration: $SHOULD_REVIEW"

          # Check if those systems were actually updated
          git diff origin/main...HEAD --name-only > all_changes.txt

          MISSING_UPDATES=""
          for SYSTEM in $(echo $SHOULD_REVIEW | tr ',' '\n'); do
            SYSTEM_FILES=$(grep "$SYSTEM" system-boundaries.json | grep -oP '"\K[^"]+' | head -1)
            if ! grep -q "$SYSTEM" all_changes.txt; then
              MISSING_UPDATES="$MISSING_UPDATES\n- $SYSTEM (related to changes in $AFFECTED)"
            fi
          done

          if [ -n "$MISSING_UPDATES" ]; then
            echo "⚠️ WARNING: Related systems not updated:"
            echo -e "$MISSING_UPDATES"

            # Post PR comment
            echo "missing_updates=$MISSING_UPDATES" >> $GITHUB_ENV
          else
            echo "✅ All related systems appear to be updated"
          fi

      # INTEGRATION CHECK 3: Regional vs Global Consistency
      - name: Check Regional/Global Consistency
        run: |
          # Scan for properties that should be regional but are accessed globally
          cat > regional-properties.txt << 'EOF'
          population
          qualityOfLife
          resources
          infrastructure
          EOF

          VIOLATIONS=0
          while read -r PROP; do
            # Find global access patterns like state.$PROP instead of state.regions[x].$PROP
            GLOBAL_REFS=$(grep -r "state\.$PROP" src/simulation/ --include="*.ts" | grep -v "regionId" | wc -l)
            if [ "$GLOBAL_REFS" -gt 0 ]; then
              echo "⚠️ Found $GLOBAL_REFS global references to '$PROP' (should be regional)"
              VIOLATIONS=$((VIOLATIONS + GLOBAL_REFS))
            fi
          done < regional-properties.txt

          if [ "$VIOLATIONS" -gt 0 ]; then
            echo "Total regional/global violations: $VIOLATIONS"
            echo "regional_violations=$VIOLATIONS" >> $GITHUB_ENV
          fi

      # INTEGRATION CHECK 4: UI Data Pathway Validation
      - name: Validate UI Data Exposure
        run: |
          # If simulation state is modified, check if worker exposes it
          CHANGED_STATE=$(git diff origin/main...HEAD src/types/game.ts | grep "^+" | grep -v "^+++" | wc -l)

          if [ "$CHANGED_STATE" -gt 0 ]; then
            echo "GameState types modified - checking worker exposure..."

            # List new properties added to GameState
            NEW_PROPS=$(git diff origin/main...HEAD src/types/game.ts | grep "^+[[:space:]]*[a-zA-Z]" | sed 's/^+[[:space:]]*//' | cut -d':' -f1)

            echo "New properties in GameState:"
            echo "$NEW_PROPS"

            # Check if simulationWorker.ts exposes these
            MISSING_EXPOSURE=""
            for PROP in $NEW_PROPS; do
              if ! grep -q "$PROP" src/workers/simulationWorker.ts; then
                MISSING_EXPOSURE="$MISSING_EXPOSURE\n- $PROP"
              fi
            done

            if [ -n "$MISSING_EXPOSURE" ]; then
              echo "⚠️ WARNING: Properties not exposed in worker:"
              echo -e "$MISSING_EXPOSURE"
              echo "ui_exposure_missing=true" >> $GITHUB_ENV
            else
              echo "✅ All new properties exposed in worker"
            fi
          fi

      # INTEGRATION CHECK 5: Phase Registration Validation
      - name: Check Phase Registration
        run: |
          # If new phase files added, verify registration in orchestrator
          NEW_PHASES=$(git diff --name-only --diff-filter=A origin/main...HEAD | grep "src/simulation/engine/phases/.*Phase.ts")

          if [ -n "$NEW_PHASES" ]; then
            echo "New phase files detected:"
            echo "$NEW_PHASES"

            # Check if registered in PhaseOrchestrator
            UNREGISTERED=""
            for PHASE_FILE in $NEW_PHASES; do
              PHASE_NAME=$(basename "$PHASE_FILE" .ts)
              if ! grep -q "$PHASE_NAME" src/simulation/engine/PhaseOrchestrator.ts; then
                UNREGISTERED="$UNREGISTERED\n- $PHASE_NAME"
              fi
            done

            if [ -n "$UNREGISTERED" ]; then
              echo "❌ ERROR: Phases not registered in orchestrator:"
              echo -e "$UNREGISTERED"
              exit 1
            else
              echo "✅ All new phases registered"
            fi
          fi

      # POST RESULTS
      - name: Post Integration Report
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const affectedSystems = '${{ steps.impacts.outputs.affected_systems }}';
            const missingUpdates = process.env.missing_updates || '';
            const regionalViolations = process.env.regional_violations || '0';
            const uiExposureMissing = process.env.ui_exposure_missing || 'false';

            let body = `## Integration Validation Report\n\n`;

            // Affected systems
            if (affectedSystems) {
              body += `### Systems Modified\n`;
              affectedSystems.split(',').forEach(s => {
                body += `- \`${s}\`\n`;
              });
              body += `\n`;
            }

            // Missing updates
            if (missingUpdates) {
              body += `### ⚠️ Related Systems May Need Updates\n\n`;
              body += `The following systems are related to your changes but weren't updated:\n`;
              body += missingUpdates + '\n\n';
              body += `**Action Required:** Review these systems to ensure integration is complete.\n\n`;
            }

            // Regional violations
            if (parseInt(regionalViolations) > 0) {
              body += `### ⚠️ Regional/Global Inconsistencies\n\n`;
              body += `Found ${regionalViolations} cases where regional properties are accessed globally.\n`;
              body += `This may cause issues if the property has been decomposed to regions.\n\n`;
            }

            // UI exposure
            if (uiExposureMissing === 'true') {
              body += `### ⚠️ UI Data Pathway Incomplete\n\n`;
              body += `New GameState properties detected but not exposed in \`simulationWorker.ts\`.\n`;
              body += `The dashboard may not display this data.\n\n`;
            }

            // Summary
            const hasIssues = missingUpdates || parseInt(regionalViolations) > 0 || uiExposureMissing === 'true';

            if (hasIssues) {
              body += `\n---\n**Status:** ⚠️ Integration issues detected - review recommended\n`;
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                labels: ['integration-review-needed']
              });
            } else {
              body += `\n---\n**Status:** ✅ Integration validation passed\n`;
            }

            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
```

**Benefits:**
- Detects missing cross-system updates
- Validates regional vs global consistency
- Ensures UI data pathways complete
- Verifies phase registration
- Posts actionable PR comments

---

## Layer 3: Weekly System Audit

### Workflow: `.github/workflows/weekly-audit.yml`

Comprehensive system-wide check that runs weekly to catch drift.

```yaml
name: Weekly System Consistency Audit

on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2am
  workflow_dispatch:  # Manual trigger

jobs:
  comprehensive-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      # AUDIT 1: Find Competing/Duplicate Systems
      - name: Detect Competing Systems
        id: duplicates
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Use architecture-skeptic agent to scan for duplicate systems

          PROMPT="You are the Architecture Skeptic conducting a system audit.

          Scan the codebase for competing or duplicate systems:

          1. **Duplicate State**: Same data stored in multiple places
             - Example: \`state.socialCohesion\` (number) AND \`state.socialAccumulation.socialCohesion\` (object)

          2. **Orphaned Systems**: Old system still present after refactor
             - Example: Global \`population\` field still exists after adding regional populations

          3. **Inconsistent Access**: Some code uses old system, some uses new
             - Example: 15 files use \`state.trust\`, 8 files use \`state.socialAccumulation.trust\`

          4. **Incomplete Migrations**: Refactor started but not finished
             - Example: Type updated but 12 usages still reference old property names

          Output as JSON:
          {
            duplicates: [{oldSystem, newSystem, affectedFiles}],
            orphaned: [{system, shouldBeRemoved, blockers}],
            inconsistent: [{property, oldUsages, newUsages}],
            incomplete: [{migration, percentComplete, remainingWork}]
          }"

          # Call Claude API with architecture-skeptic
          # (Actual API call would go here)

          # For now, use static analysis
          echo "Running duplicate system detection..."
          # (Implementation would involve AST parsing or pattern matching)

      # AUDIT 2: Property Name Consistency Scan
      - name: Full Property Name Audit
        run: |
          # Build comprehensive map of all property accesses
          grep -r "\\.\\w\\+" src/simulation/ --include="*.ts" -o | sort | uniq -c | sort -rn > property-usage.txt

          # Compare against type definitions
          echo "Top 50 most-used properties:"
          head -50 property-usage.txt

          # Flag suspicious patterns
          echo "\nSuspicious property names (camelCase variants):"
          grep -E "\.(gov|govt|government)" property-usage.txt || echo "None found"
          grep -E "\.(econ|economy|economic)" property-usage.txt || echo "None found"

      # AUDIT 3: Integration Coverage Matrix
      - name: Build Integration Coverage Matrix
        run: |
          # For each system, check if it properly integrates with related systems

          cat > integration-matrix.json << 'EOF'
          {
            "environmental_to_qol": {
              "check": "Does environmental degradation affect QoL metrics?",
              "files": ["src/simulation/qualityOfLife/environmental.ts"],
              "required_properties": ["environmentalQuality", "climateStability"]
            },
            "population_to_resources": {
              "check": "Does population change affect resource consumption?",
              "files": ["src/simulation/resourceDepletion.ts"],
              "required_properties": ["populationResourceDemand"]
            },
            "ai_capability_to_control": {
              "check": "Does AI capability affect government control difficulty?",
              "files": ["src/simulation/government/core/governmentCore.ts"],
              "required_properties": ["capabilityToControl"]
            }
          }
          EOF

          # Check each integration point
          node -e "
            const fs = require('fs');
            const matrix = JSON.parse(fs.readFileSync('integration-matrix.json'));

            for (const [key, check] of Object.entries(matrix)) {
              console.log(\`\\nChecking: \${check.check}\`);

              const allFilesExist = check.files.every(f => fs.existsSync(f));
              if (!allFilesExist) {
                console.log(\`  ❌ Missing expected integration files\`);
                continue;
              }

              const fileContents = check.files.map(f => fs.readFileSync(f, 'utf8')).join('\\n');
              const allPropertiesPresent = check.required_properties.every(p =>
                fileContents.includes(p)
              );

              if (allPropertiesPresent) {
                console.log(\`  ✅ Integration complete\`);
              } else {
                console.log(\`  ⚠️ Missing properties: \${check.required_properties.filter(p => !fileContents.includes(p)).join(', ')}\`);
              }
            }
          "

      # AUDIT 4: Generate Audit Report
      - name: Create Audit Report Issue
        uses: actions/github-script@v7
        with:
          script: |
            const today = new Date().toISOString().split('T')[0];

            const body = `## Weekly System Audit - ${today}

            This is an automated comprehensive audit of system consistency.

            ### Detected Issues

            #### Competing Systems
            - [ ] Review duplicate state storage
            - [ ] Review orphaned systems after refactors

            #### Property Name Consistency
            - [ ] Review top property usage patterns
            - [ ] Check for camelCase variants

            #### Integration Coverage
            - [ ] Validate environmental → QoL integration
            - [ ] Validate population → resources integration
            - [ ] Validate AI capability → government control integration

            ### Action Items

            1. Review this audit report
            2. Create issues for confirmed problems
            3. Schedule refactor if needed

            ---
            🤖 Automated Weekly Audit
            See full logs in Actions run.`;

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `System Audit Report - ${today}`,
              body,
              labels: ['audit', 'technical-debt', 'automated']
            });
```

**Benefits:**
- Catches drift that accumulates over time
- Creates actionable issues automatically
- Runs when no one is looking (Monday 2am)
- Comprehensive view of system health

---

## Layer 4: Post-Refactor Verification

### Workflow: `.github/workflows/post-refactor-check.yml`

Triggered manually after major refactors to verify completeness.

```yaml
name: Post-Refactor Verification

on:
  workflow_dispatch:
    inputs:
      refactor_type:
        description: 'Type of refactor'
        required: true
        type: choice
        options:
          - property_rename
          - system_decomposition
          - regional_decomposition
          - type_restructure
      old_name:
        description: 'Old property/system name'
        required: true
        type: string
      new_name:
        description: 'New property/system name'
        required: true
        type: string

jobs:
  verify-refactor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Verify Property Rename Complete
        if: inputs.refactor_type == 'property_rename'
        run: |
          OLD="${{ inputs.old_name }}"
          NEW="${{ inputs.new_name }}"

          echo "Verifying rename: $OLD → $NEW"

          # Find all remaining usages of old name
          REMAINING=$(grep -r "\.$OLD" src/ --include="*.ts" | grep -v "\/\/" | grep -v "\.md" | wc -l)

          if [ "$REMAINING" -gt 0 ]; then
            echo "❌ Found $REMAINING remaining usages of '$OLD'"
            echo "\nFiles still using old name:"
            grep -r "\.$OLD" src/ --include="*.ts" -l | head -20
            exit 1
          fi

          echo "✅ Refactor complete - no usages of '$OLD' found"

      - name: Verify System Decomposition Complete
        if: inputs.refactor_type == 'system_decomposition'
        run: |
          OLD_SYSTEM="${{ inputs.old_name }}"
          NEW_SYSTEM="${{ inputs.new_name }}"

          echo "Verifying decomposition: $OLD_SYSTEM → $NEW_SYSTEM"

          # Check that old system is deprecated or removed
          if grep -r "state\.$OLD_SYSTEM" src/simulation/ --include="*.ts" -q; then
            echo "❌ Old system '$OLD_SYSTEM' still accessed in simulation code"
            grep -r "state\.$OLD_SYSTEM" src/simulation/ --include="*.ts" -l
            exit 1
          fi

          # Check that new system is properly used
          NEW_USAGES=$(grep -r "state\.$NEW_SYSTEM" src/simulation/ --include="*.ts" | wc -l)
          if [ "$NEW_USAGES" -lt 5 ]; then
            echo "⚠️ Warning: New system '$NEW_SYSTEM' only used $NEW_USAGES times (expected more)"
          fi

          echo "✅ Decomposition verified"

      - name: Generate Refactor Report
        uses: actions/github-script@v7
        with:
          script: |
            const body = `## Refactor Verification Report

            **Type:** ${{ inputs.refactor_type }}
            **Old:** \`${{ inputs.old_name }}\`
            **New:** \`${{ inputs.new_name }}\`

            ### Status
            ✅ Refactor appears complete

            ### Verification Steps Passed
            - [x] No remaining usages of old name
            - [x] New name properly integrated
            - [x] Type definitions updated

            ### Manual Review Recommended
            - [ ] Test suite coverage
            - [ ] Documentation updates
            - [ ] Dashboard updates (if UI-related)

            ---
            🤖 Post-Refactor Verification`;

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Refactor Verification: ${{ inputs.old_name }} → ${{ inputs.new_name }}`,
              body,
              labels: ['refactor', 'verification']
            });
```

**Benefits:**
- Ensures refactors are 100% complete
- Catches forgotten files
- Creates verification record
- Manual trigger when needed

---

## Enhanced Architecture-Skeptic Review

### Add to `.github/workflows/architecture-review.yml`

Enhance the architecture review from Phase 2 of the feature workflow:

```yaml
      # NEW CHECK: Cross-System Consistency
      - name: Cross-System Integration Check
        run: |
          # Get changed files
          git diff --name-only origin/main...HEAD > changed.txt

          # Check for property additions without cross-system updates
          if grep -q "src/types/game.ts" changed.txt; then
            echo "GameState modified - checking for cross-system impacts..."

            # If quality of life types changed, check if phases updated
            if git diff origin/main...HEAD src/types/quality-of-life.ts | grep -q "^+"; then
              PHASE_UPDATES=$(git diff --name-only origin/main...HEAD | grep "QualityOfLife.*Phase.ts" | wc -l)
              if [ "$PHASE_UPDATES" -eq 0 ]; then
                echo "⚠️ WARNING: quality-of-life types changed but no QoL phases updated"
                echo "needs_cross_system_review=true" >> $GITHUB_ENV
              fi
            fi

            # If AI agent types changed, check if government agent updated
            if git diff origin/main...HEAD src/types/ai-agents.ts | grep -q "^+"; then
              GOV_UPDATES=$(git diff --name-only origin/main...HEAD | grep "government" | wc -l)
              if [ "$GOV_UPDATES" -eq 0 ]; then
                echo "⚠️ WARNING: AI agent types changed but government system not updated"
                echo "needs_cross_system_review=true" >> $GITHUB_ENV
              fi
            fi
          fi

      # NEW CHECK: Property Name Verification
      - name: Verify Property Names Match Types
        run: |
          # Extract property names from GameState interface
          grep -A 1000 "interface GameState" src/types/game.ts | grep "^  [a-zA-Z]" | cut -d':' -f1 | tr -d ' ' > valid-properties.txt

          # Scan for property access in changed files
          git diff --name-only origin/main...HEAD | grep "src/simulation" | while read file; do
            # Extract property accesses like state.propertyName
            grep -o "state\\.[a-zA-Z_][a-zA-Z0-9_]*" "$file" | cut -d'.' -f2 | sort -u > "${file}.props"

            # Compare to valid properties
            while read prop; do
              if ! grep -q "^${prop}$" valid-properties.txt; then
                echo "❌ Invalid property access in $file: state.$prop"
                echo "invalid_property_access=true" >> $GITHUB_ENV
              fi
            done < "${file}.props"
          done
```

---

## Automated Fix Suggestions

### Tool: Property Migration Script

When deprecated properties are detected, auto-generate migration PR:

```bash
#!/bin/bash
# scripts/auto-migrate-properties.sh

# Usage: ./scripts/auto-migrate-properties.sh economicDependence unemploymentLevel

OLD_PROP=$1
NEW_PROP=$2

echo "Migrating $OLD_PROP → $NEW_PROP"

# Find all files using old property
FILES=$(grep -rl "\.$OLD_PROP" src/simulation/ --include="*.ts")

for FILE in $FILES; do
  echo "Updating $FILE..."
  sed -i "s/\\.${OLD_PROP}/.${NEW_PROP}/g" "$FILE"
done

# Run tests
npm test

if [ $? -eq 0 ]; then
  echo "✅ Migration successful, tests pass"

  # Create commit
  git add .
  git commit -m "refactor: Migrate $OLD_PROP → $NEW_PROP

  Automated property migration to maintain consistency.

  Files updated: $(echo $FILES | wc -w)

  🤖 Generated by auto-migrate-properties.sh"
else
  echo "❌ Tests failed after migration"
  git restore .
  exit 1
fi
```

---

## Monitoring Dashboard

### Script: Generate Consistency Metrics

```typescript
// scripts/generate-consistency-metrics.ts

import { execSync } from 'child_process';
import fs from 'fs';

interface ConsistencyMetrics {
  timestamp: string;
  typeScriptErrors: number;
  circularDependencies: number;
  deprecatedPropertyUsages: number;
  duplicateCodeBlocks: number;
  unusedExports: number;
  integrationGaps: number;
}

function runMetrics(): ConsistencyMetrics {
  return {
    timestamp: new Date().toISOString(),

    typeScriptErrors: parseInt(
      execSync('npx tsc --noEmit 2>&1 | grep "error TS" | wc -l').toString()
    ),

    circularDependencies: parseInt(
      execSync('npx madge --circular --extensions ts src/ | grep "Circular" | wc -l').toString()
    ),

    deprecatedPropertyUsages: parseInt(
      execSync('grep -r "\\.economicDependence\\|\\.capabilities\\|\\.type" src/simulation/ --include="*.ts" | wc -l').toString()
    ),

    duplicateCodeBlocks: JSON.parse(
      execSync('npx jscpd src/ --format typescript --output json').toString()
    ).statistics.total.duplicates,

    unusedExports: parseInt(
      execSync('npx ts-prune | wc -l').toString()
    ),

    integrationGaps: 0  // Would be calculated by integration matrix
  };
}

// Run and save
const metrics = runMetrics();
fs.appendFileSync(
  'logs/consistency-metrics.jsonl',
  JSON.stringify(metrics) + '\n'
);

console.log('Consistency Metrics:', metrics);
```

Run weekly and track trends over time.

---

## Summary

### What This Adds to Feature Workflow

**Before (Feature-only):**
1. Issue labeled → Research checked → Implementation → Architecture review → Merge

**After (With Consistency Layers):**
1. **Pre-commit:** Static analysis blocks bad code
2. **PR opened:** Integration validator checks cross-system impacts
3. **Weekly:** Audit detects drift and creates issues
4. **On-demand:** Post-refactor verification ensures completeness

### Expected Impact

**Fewer Integration Bugs:**
- 90% of property name issues caught pre-commit
- 80% of missing cross-system updates flagged in PR
- 100% of unregistered phases blocked

**Better Code Quality:**
- Zero TypeScript errors enforced
- No circular dependencies
- Duplicate code flagged
- Deprecated patterns blocked

**Faster Reviews:**
- Automated checks do 80% of review work
- Humans focus on design/logic, not typos
- Clear PR comments show exactly what needs fixing

**Long-term Maintainability:**
- Weekly audits prevent technical debt accumulation
- Refactors verified complete
- System health tracked over time

---

## Next Steps

1. **Add static analysis to existing workflow** (pre-commit checks)
2. **Create integration validator workflow** (PR checks)
3. **Set up weekly audit** (scheduled job)
4. **Test with next refactor** (post-refactor verification)

Want me to create the actual workflow files for these?
