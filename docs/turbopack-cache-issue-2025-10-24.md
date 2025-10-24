# Turbopack Cache Issue - October 24, 2025

## Issue Summary

After migrating AIAgentsDashboard to `useSimulationWorker()` hook and fixing duplicate variable names in the Sankey diagram, the dev server continued to show compilation errors **even though the source file was correctly fixed**.

## Root Cause

**Turbopack stale cache** - The Next.js/Turbopack cache (`.next` directory) contained compiled versions of the old code with duplicate variable names (`training`, `testing`, `closed`, `open`, `retired`, `escaped`, `createFlow`).

## Symptoms

1. **Source file correct** - `src/components/dashboards/AIAgentsDashboard.tsx` contained the fixed variable names (`stageTraining`, `stageTesting`, etc.)
2. **Grep found correct code** - Searches confirmed only `createSankeyFlow` existed, not `createFlow`
3. **Server logs showed old code** - Turbopack stderr displayed errors referencing the old variable names
4. **Line numbers didn't match** - Error messages showed line numbers that didn't correspond to actual source file content
5. **500 errors** - Navigation to `/ai-agents` returned 500 Internal Server Error

## Timeline

1. **Previous session** - Fixed variable names from `training` → `stageTraining`, etc.
2. **Commit 5f69156** - Committed the fixes
3. **This session** - Attempted to verify fixes, but server still showed errors
4. **Read file** - Confirmed source had correct variable names (lines 589-629)
5. **Confusion** - Error messages referenced lines 524-531 which had different content
6. **Realization** - Turbopack was using cached compiled output, not fresh source

## Resolution

```bash
# Clear Next.js/Turbopack cache
rm -rf .next

# Kill existing dev server
lsof -ti:3333 | xargs kill -9

# Start fresh dev server
npm run dev
```

## Result

After clearing the cache:
- ✅ `/ai-agents` compiled successfully in 1709ms
- ✅ No duplicate variable name errors
- ✅ GET /ai-agents returned 200 (not 500)
- ✅ Dashboard shows "Not Initialized" panel (correct behavior)

## Verification

**Source file (lines 589-629):**
```typescript
const stageTraining = stages[0]
const stageTesting = stages[1]
const stageClosed = stages[2]
const stageOpen = stages[3]
const stageRetired = stages[4]
const stageEscaped = stages[5]

const createSankeyFlow = (from: typeof stageTraining, to: typeof stageTraining, color: string, width = 6) => {
  // ...
}

const flows = [
  createSankeyFlow(stageTraining, stageTesting, 'aligned', 8),
  createSankeyFlow(stageTesting, stageClosed, 'aligned', 6),
  createSankeyFlow(stageTesting, stageOpen, 'uncertain', 6),
  createSankeyFlow(stageClosed, stageRetired, 'aligned', 5),
  createSankeyFlow(stageClosed, stageEscaped, 'misaligned', 4),
  createSankeyFlow(stageOpen, stageRetired, 'uncertain', 5),
  createSankeyFlow(stageOpen, stageEscaped, 'misaligned', 6),
]
```

**Grep verification:**
```bash
grep "createFlow" src/components/dashboards/AIAgentsDashboard.tsx
# Only matches: createSankeyFlow (not createFlow)
```

**Server logs (after cache clear):**
```
✓ Compiled /ai-agents in 1709ms
GET /ai-agents 200 in 1968ms
```

## Lessons Learned

1. **Cache invalidation** - Next.js/Turbopack doesn't always detect all file changes, especially after refactoring
2. **Trust source, not errors** - If source file is correct but errors persist, suspect cache
3. **Nuclear option** - `rm -rf .next` is a reliable way to force fresh compilation
4. **Line number mismatch** - When error line numbers don't match source, it's a cache issue
5. **Fast Refresh limitations** - React Fast Refresh can't handle certain types of variable renaming inside JSX callbacks

## When to Clear Cache

Clear `.next` cache when:
- Errors persist after fixing source code
- Error line numbers don't match source file
- Grep/search shows correct code but server shows old code
- 500 errors with no apparent cause
- Refactoring complex JSX with inline functions/IIFEs

## Prevention

For complex refactoring in the future:
1. Consider clearing `.next` cache before testing
2. Use `npm run build` to force full recompilation
3. Restart dev server after major refactoring
4. Verify with `npx tsc --noEmit` (bypasses cache)
