# Code Validation System Implementation

**Date**: October 27, 2025
**Purpose**: Comprehensive code quality validation to prevent defensive programming anti-patterns

## Motivation

**Problem**: Silent fallbacks hide bugs instead of exposing them.

**Examples**:
- Oct 24, 2025: Ecology NaN bug hidden for months by `?? 50` fallback
- Oct 27, 2025: 115 `(as any)` casts found - each a potential NaN bomb

**Philosophy**: This is a research simulation, not a production app. Invalid values indicate bugs that must be fixed at source, not masked.

## Implementation

### 1. Validation Scripts Created

**`scripts/validatePropertyAccessSimple.ts`**
- Pattern-based validation for known incorrect property paths
- Example: `state.resources.energy` → `state.resourceEconomy.energy`

**`scripts/detectSemanticDuplicates.ts`**
- Finds semantically similar properties suggesting duplicate implementations
- Uses Levenshtein distance + normalization
- Found 684 potential duplicate groups (many intentional, some worth reviewing)

**`scripts/extractCausalRelationships.ts`**
- Semantic analysis of causal dependencies using AST parsing
- Extracts "X affects Y" relationships from code
- Found 1,188 causal edges (vs 45 from regex-based approach)
- Output: JSON graph + markdown docs

**`scripts/compareCausalMaps.ts`**
- Validates manual causal map against semantic extraction
- Finds validated edges, novel discoveries, and missing relationships

**`scripts/validateCodebase.ts`**
- Comprehensive validation runner
- Executes all checks in sequence
- Generates summary report

### 2. Git Pre-Commit Hook

**Location**: `.git/hooks/pre-commit`

**Features**:
- **Interactive acknowledgment** (humans): Must type "yes" after reviewing defensive patterns
- **Environment variable** (LLMs): `NO_DEFENSIVE_CODING=I_SOLEMNLY_SWEAR`
- **Automated verification**: Scans staged changes for violations even after acknowledgment
- **Blocking errors**: Prevents commits with defensive patterns, Math.random(), type bypasses

**Checks performed**:
1. ✅ Property access patterns (incorrect paths)
2. ✅ TypeScript type checking
3. ✅ Defensive fallbacks (`?? 0`, `|| ''`, `isNaN(x) ? ...`)
4. ✅ Type system bypasses (`as any`, `@ts-ignore`, `@ts-expect-error`)
5. ✅ Non-deterministic code (`Math.random()` in simulation)

**Defensive patterns detected**:
- Silent fallbacks: `value ?? 50`, `foo || 0`, `bar || ''`
- Optional chaining on required props: `state.government?.legitimacy`
- NaN hiding: `isNaN(x) ? fallback : x`
- Type bypasses: `(x as any)`, `// @ts-ignore`

### 3. Package.json Scripts

```json
"validate": "npx tsx scripts/validateCodebase.ts",
"validate:patterns": "npx tsx scripts/validatePropertyAccessSimple.ts",
"validate:duplicates": "npx tsx scripts/detectSemanticDuplicates.ts",
"validate:causal": "npx tsx scripts/extractCausalRelationships.ts"
```

### 4. Documentation

**`docs/CODE_VALIDATION.md`**
- Complete validation system documentation
- Philosophy, process, assertion utilities
- Common violations and fixes
- Configuration instructions

**`CLAUDE.md` updates**
- Added "Code Validation & Committing" section
- LLM-specific commit instructions
- Pre-commit hook reference

## Usage

### For Humans

```bash
git add .
git commit -m "message"
# → Interactive prompt: "I solemnly swear I did NOT add defensive coding"
# → Type "yes" to proceed
```

### For LLMs

```bash
git add .
NO_DEFENSIVE_CODING=I_SOLEMNLY_SWEAR git commit -m "message"
```

### Validation On-Demand

```bash
# Run all checks
npm run validate

# Individual checks
npm run validate:patterns
npm run validate:duplicates
npm run validate:causal
```

## Results

**Causal Extraction**:
- 1,188 causal edges extracted
- 475 high-confidence (≥0.85)
- 713 medium-confidence (0.7-0.85)
- Top influencers: currentMonth (75), government (39), globalMetrics (25)

**Semantic Duplicates**:
- 684 duplicate groups found
- Most are intentional (e.g., `active` property across systems)
- Some worth reviewing (e.g., `economic*` variants)

**Validation Hook**:
- Installed and executable
- Works for both humans (interactive) and LLMs (env var)
- Blocks commits with defensive patterns
- Provides clear error messages with fix suggestions

## Goodhart's Law Prevention

**User requirement**: "Force developers to acknowledge they're not being defensive coders"

**Implementation**:
1. **Explicit acknowledgment**: Must affirm no defensive patterns added
2. **Automated verification**: Scans staged changes even after "yes"
3. **Both modes**: Interactive (humans) + environment variable (LLMs)
4. **Fail on violation**: If patterns found after acknowledgment, commit blocked

This prevents gaming the system - you can say "yes" but if patterns are detected, commit fails.

## Files Created

1. `scripts/validatePropertyAccessSimple.ts`
2. `scripts/detectSemanticDuplicates.ts`
3. `scripts/extractCausalRelationships.ts`
4. `scripts/compareCausalMaps.ts`
5. `scripts/validateCodebase.ts`
6. `.git/hooks/pre-commit` (executable)
7. `docs/CODE_VALIDATION.md`
8. `docs/causal-relationships-semantic.md`
9. `docs/causal-edges-semantic.txt`
10. `docs/causal-graph-semantic.json`
11. `docs/causal-graph-semantic-summary.txt`
12. `docs/semantic-duplicates.md`
13. `docs/property-access-issues.md`

## Files Modified

1. `package.json` - Added validation scripts
2. `CLAUDE.md` - Added validation & commit instructions

## Next Steps

1. ✅ **Monitor effectiveness**: Track how often hook catches violations
2. ✅ **Refine patterns**: Add more defensive patterns as discovered
3. ✅ **Review semantic duplicates**: Check high-priority groups for true architectural issues
4. ✅ **Causal map integration**: Use semantic extraction to validate/enhance manual map

## Key Insight

**Silent fallbacks are bugs masquerading as features.**

The validation system enforces the principle: **Fail loudly, not silently.**

This maintains research integrity by ensuring bugs are caught early, not discovered months later when NaN propagates through the entire system.
