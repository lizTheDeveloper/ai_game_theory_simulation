# M-7: Coverage Report Dashboard

**Priority:** MEDIUM
**Agent:** far-future-ux-designer (Tessa)
**Created:** 2025-12-08
**Context:** OpenSpec frontend spec, next priority after CRITICAL-1 completion

## Objective

Create a dashboard that visualizes test coverage by module/phase, making it easier to identify untested code and track testing progress over time.

## Requirements

### Data Integration
- Parse coverage reports from `npm test` (vitest coverage)
- Display coverage by:
  - Module (`src/simulation/`, `src/game/`, `src/components/`)
  - Phase (individual phase files in `src/simulation/phases/`)
  - Overall project coverage
- Show coverage metrics:
  - Line coverage %
  - Branch coverage %
  - Function coverage %
  - Statement coverage %

### Visualization Components
- **Coverage Overview Card**
  - Total project coverage %
  - Coverage trend (up/down from last run)
  - Coverage goal (target: 80%)
  - Visual progress bar

- **Module Breakdown**
  - Grid/list of modules with coverage %
  - Color coding: RED (<50%), AMBER (50-80%), GREEN (>80%)
  - Clickable to drill down into files

- **Phase Coverage Matrix**
  - Heatmap showing coverage by phase
  - Identify untested phases immediately
  - Link to source files

- **Coverage Trends**
  - Sparkline showing coverage over time (last 10 runs)
  - Highlight regression (coverage drops)

### Far-Future Aesthetic
- High-contrast black/white/glowing design (Elysium-inspired)
- Glowing accents for highlights (cyan/magenta)
- Clean geometric layouts
- Minimal clutter

### Integration
- Add route: `/coverage` or `/test-coverage`
- Add to navigation menu
- Auto-refresh option (watch mode)
- Manual refresh button

## Technical Approach

### Option 1: Parse vitest coverage output
```bash
npm test -- --coverage --reporter=json
```
- Parse JSON output from `.vitest/coverage/coverage-final.json`
- Extract per-file coverage data
- Aggregate by module/phase

### Option 2: Direct vitest integration
- Import coverage data from vitest API
- Use `@vitest/coverage-v8` or `@vitest/coverage-istanbul`
- Display real-time coverage during test runs

### Recommended: Option 1 (simpler)
- Parse static JSON output
- No need for vitest API integration
- Can run post-test without blocking

## Deliverables

1. **Dashboard Component** (`src/components/dashboards/CoverageDashboard.tsx`)
   - Coverage overview card
   - Module breakdown grid
   - Phase coverage heatmap
   - Coverage trends sparkline

2. **Page Route** (`src/app/coverage/page.tsx`)
   - Wrapper for CoverageDashboard
   - Data loading from coverage reports
   - Auto-refresh toggle

3. **Data Parser** (`src/lib/coverage/parseCoverageReport.ts`)
   - Parse vitest coverage JSON
   - Aggregate by module/phase
   - Calculate trends (compare with previous runs)

4. **Navigation Update**
   - Add "Coverage" link to main nav
   - Icon: 🎯 or shield icon

## Success Criteria

- Dashboard displays accurate coverage data from vitest
- Color coding makes untested modules obvious at a glance
- Drill-down shows file-level coverage
- Far-future aesthetic maintained (high-contrast, glowing accents)
- Performance: <16ms render time (60fps)

## Testing

1. Run `npm test -- --coverage`
2. Navigate to `/coverage`
3. Verify coverage percentages match vitest output
4. Click module → verify drill-down works
5. Test auto-refresh (if implemented)

## Notes

- Coverage data location: `.vitest/coverage/coverage-final.json`
- Phases are in `src/simulation/phases/` (subdirectories by domain)
- Existing test structure: `__tests__/` directories co-located with code
- Target coverage: 80% (current: ~30-40% estimated)

## References

- Frontend spec: `openspec/specs/frontend/spec.md` (M-7)
- Existing dashboards: `src/components/dashboards/` (patterns to follow)
- Design system: `/designs/` (Elysium aesthetic)
- Test structure: `__tests__/` directories

## Related Work

- M-8 (Monte Carlo Dashboard) will follow similar patterns
- Can reuse data visualization components (sparklines, heatmaps)
- Establish precedent for test/analysis dashboards
