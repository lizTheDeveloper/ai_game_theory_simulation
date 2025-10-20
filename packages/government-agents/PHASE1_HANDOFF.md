# Phase 1 Handoff Document

**Package:** `@political-science/government-agents`
**Phase 0 Status:** COMPLETE
**Phase 1 Status:** READY TO BEGIN
**Date:** 2025-10-19

## Phase 0 Summary

Package architecture complete:
- ✅ Standalone package structure
- ✅ TypeScript compilation working
- ✅ Tests passing (3/3)
- ✅ Zero dependencies on parent simulation
- ✅ MIT license
- ✅ Research foundation documented

## Phase 1 Scope

**Duration:** 8-12 hours
**Location:** `packages/government-agents/src/core/`

### Deliverables

1. **Government Types** (`src/core/government.ts`)
   - 30 real governments (G20 + strategic actors)
   - Parliamentary, presidential, semi-presidential, authoritarian
   - State capacity from WGI 2024
   - Coalition requirements

2. **Political Parties** (`src/core/party.ts`)
   - Multi-dimensional policy spaces (8 dimensions)
   - Manifesto Project integration
   - Party families (social democratic, conservative, green, etc.)

3. **Country Data** (`src/data/countries.ts`)
   - V-Dem v14 indicators
   - WGI state capacity metrics
   - ISO 3166-1 alpha-3 codes
   - Current political composition

4. **Core Types** (`src/core/types.ts`)
   - Government interface
   - Party interface
   - Coalition interface
   - Policy dimension types

5. **Tests** (`tests/core/*.test.ts`)
   - Government instantiation
   - State capacity calculations
   - Party policy positions

## File Structure for Phase 1

```
packages/government-agents/
├── src/
│   ├── core/
│   │   ├── index.ts (update exports)
│   │   ├── types.ts (NEW)
│   │   ├── government.ts (NEW)
│   │   ├── party.ts (NEW)
│   │   └── stateCapacity.ts (NEW)
│   ├── data/
│   │   ├── index.ts (update exports)
│   │   ├── countries.ts (NEW)
│   │   ├── parties.ts (NEW)
│   │   └── vdem.ts (NEW)
│   └── index.ts (already exports core/)
├── tests/
│   ├── core/
│   │   ├── government.test.ts (NEW)
│   │   ├── party.test.ts (NEW)
│   │   └── stateCapacity.test.ts (NEW)
```

## Research Sources

All to be implemented in Phase 1:

### V-Dem v14 (2024)
- **URL:** https://www.v-dem.net/
- **Indicators:** 531 indicators across 202 countries
- **Use:** Government structure, regime type, electoral systems

### WGI 2024 (World Bank)
- **URL:** https://www.worldbank.org/en/publication/worldwide-governance-indicators
- **Indicators:** 6 dimensions (government effectiveness, regulatory quality, etc.)
- **Use:** State capacity metrics

### Manifesto Project Database
- **URL:** https://manifesto-project.wzb.eu/
- **Data:** Party policy positions across 8 dimensions
- **Use:** Party ideology, policy preferences

### IPU Parline
- **URL:** https://data.ipu.org/
- **Data:** Parliamentary composition, election results
- **Use:** Current government compositions

## Implementation Guidelines

### TypeScript Standards
- Follow strict mode (already configured)
- All types must be explicit
- No `any` types
- Proper null/undefined handling

### Testing Standards
- Use Node.js built-in test runner
- Write tests in TypeScript, compile to JS
- Aim for >80% coverage of core logic
- Mock external data where appropriate

### Documentation Standards
- JSDoc comments on all public APIs
- Research citations in comments
- Example usage in README

### Code Organization
- One file per major concept (Government, Party, etc.)
- Types in separate file
- Data in `src/data/`
- Keep functions pure where possible

## API Design (Proposed)

```typescript
// Core types
interface Government {
  code: string; // ISO 3166-1 alpha-3
  name: string;
  type: 'parliamentary' | 'presidential' | 'semi-presidential' | 'authoritarian';
  stateCapacity: number; // 0-1 from WGI
  coalitionRequired: boolean;
  currentParties: Party[];
}

interface Party {
  id: string;
  name: string;
  family: PartyFamily;
  policyPosition: PolicyPosition; // 8D vector
  seats: number;
}

// Usage
import { Government } from '@political-science/government-agents';

const germany = Government.fromCountryCode('DEU', { year: 2024 });
console.log(germany.stateCapacity); // 0.85 (from WGI)
console.log(germany.coalitionRequired); // true (parliamentary)
```

## Data Sources Priority

Phase 1 should focus on **30 governments:**

**G20 Members (19):**
- USA, CHN, JPN, DEU, GBR, FRA, IND, ITA, BRA, CAN
- RUS, KOR, AUS, ESP, MEX, IDN, TUR, SAU, ARG

**Strategic Actors (11):**
- ISR, IRN, PAK, NGA, EGY, ZAF, POL, TWN, VNM, THA, SGP

Start with **5 exemplar governments** for initial testing:
1. **DEU** (Germany) - Parliamentary, coalition-based
2. **USA** (United States) - Presidential, two-party
3. **CHN** (China) - Authoritarian, single-party
4. **GBR** (United Kingdom) - Parliamentary, Westminster
5. **FRA** (France) - Semi-presidential

## Validation Criteria

Phase 1 complete when:
- ✅ 30 governments loadable by ISO code
- ✅ State capacity values match WGI 2024
- ✅ Party policy positions from Manifesto Project
- ✅ Government types correctly categorized
- ✅ All tests passing
- ✅ API documented in README
- ✅ Build successful (`npm run build`)

## Known Challenges

### Data Integration
- V-Dem and WGI have different country coverage
- Some countries lack recent party data
- **Mitigation:** Focus on G20 first, use 2023-2024 data

### State Capacity Calculation
- WGI provides 6 dimensions, need single metric
- **Mitigation:** Use government effectiveness score directly

### Party Data Complexity
- Manifesto Project uses complex coding scheme
- **Mitigation:** Simplify to 8-dimension policy space

## Development Commands

```bash
# In packages/government-agents/

# Build
npm run build

# Test
npm test

# Test watch mode
npm run test:watch

# Type check
npx tsc --noEmit
```

## Dependencies

**Current:**
- typescript: ^5.3.0 (dev only)

**No new dependencies planned for Phase 1** - keep package lightweight.

## Next Steps

1. Create core types (`src/core/types.ts`)
2. Implement Government class (`src/core/government.ts`)
3. Implement Party class (`src/core/party.ts`)
4. Load country data (`src/data/countries.ts`)
5. Write tests
6. Update README with API examples
7. Run full build & test suite

## Questions for Phase 1

- Should state capacity be a single score or multi-dimensional?
  - **Recommendation:** Single score (government effectiveness) for Phase 1
- How to handle missing data for some countries?
  - **Recommendation:** Use most recent available data, flag in docs
- Should we cache data or load on-demand?
  - **Recommendation:** Pre-load all 30 governments (lightweight data)

## Success Criteria Checklist

- [ ] Government class implemented
- [ ] Party class implemented
- [ ] 30 governments loadable
- [ ] State capacity from WGI
- [ ] Party positions from Manifesto Project
- [ ] All tests passing
- [ ] README updated with examples
- [ ] Build successful
- [ ] Zero errors, zero warnings

---

**Ready to begin Phase 1**
**Estimated completion:** 8-12 hours
**Next implementer:** Can pick up from this handoff document
