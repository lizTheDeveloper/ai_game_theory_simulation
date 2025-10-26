# Phase 3.2 Defensive Programming Audit - Crisis Systems

**Date:** October 25, 2025, 11:40 PM
**Scope:** Crisis system files (phosphorus, freshwater, ocean, novel entities, resources)
**Approach:** Manual audit and fix

## Files Audited

1. `src/simulation/phosphorusDepletion.ts` - Phosphorus boundary system
2. `src/simulation/freshwaterDepletion.ts` - Freshwater depletion system
3. `src/simulation/oceanAcidification.ts` - Ocean acidification system
4. `src/simulation/novelEntities.ts` - Novel entities/pollution system
5. `src/simulation/resourceDepletion.ts` - Resource depletion system

## Defensive Patterns Found: 17 Total

### Summary

**Total patterns:** 17
**To fix:** 12 (removing defensive fallbacks for required properties)
**To keep:** 5 (legitimate defaults for optional tech/research capabilities)

### Patterns to Fix:

1. **environmentalAccumulation properties** - 5 fixes
   - climateStability (2×): freshwaterDepletion.ts:70, oceanAcidification.ts:48
   - pollutionLevel (1×): oceanAcidification.ts:49
   - biodiversityIndex (2×): novelEntities.ts:134, resourceDepletion.ts:219

2. **qualityOfLifeSystems.health** - 4 fixes
   - novelEntities.ts: lines 114, 185, 206, 214

3. **qualityOfLifeSystems.healthcareQuality** - 1 fix
   - freshwaterDepletion.ts:190

4. **society.trust** - 2 fixes
   - phosphorusDepletion.ts:114, freshwaterDepletion.ts:191

### Patterns to Keep (Legitimate Defaults):

1. **Tech deployment levels** - 3 patterns (phosphorusDepletion.ts:306-308)
2. **AI research capabilities** - 2 patterns (oceanAcidification.ts:268, novelEntities.ts:277)

## Next Steps

1. Fix all 12 defensive patterns with explicit undefined checks
2. TypeScript compilation check
3. Monte Carlo validation (N=10, 120 months)
4. Update roadmap
