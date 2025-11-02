# Proactive Data Center Divestment Implementation

**Date:** Oct 30, 2025
**Implementer:** Roy (simulation-maintainer)
**Feature:** Organizations sell data centers BEFORE bankruptcy to avoid insolvency

---

## Summary

Implemented strategic asset divestment for financially distressed organizations. Organizations now sell non-core data centers when facing financial trouble to:
1. Raise capital (cash infusion)
2. Reduce operational costs
3. Extend runway and potentially avoid bankruptcy

This is realistic business behavior - companies like IBM, GE, and others divest non-core assets during turnarounds.

---

## Implementation Details

### Location
- **File:** `src/simulation/organizationManagement.ts`
- **New function:** `handleFinancialDistress()`
- **Integration:** Called in `processOrganizationTurn()` BEFORE bankruptcy check (line 1302)

### Trigger Conditions

Organizations divest when they have **2 or more** of these indicators:

1. **Cash crunch:** Capital < 6 months expenses (runway < 6 months)
2. **Negative cash flow:** Monthly revenue < monthly expenses
3. **Profitability crisis:** Operating margin < 10%

### Sale Mechanics

**What to sell:**
- Sell smallest/non-strategic data centers first (sorted by capacity)
- Sell 1-2 DCs max per month (not a fire sale)
- Won't divest if only 1 DC (that's core infrastructure)
- Won't divest if < 2 DCs total (need redundancy)

**Pricing:**
- Strategic divestment: 60% of fair market value
- Better than bankruptcy: 50% (desperate sale)
- Fair market value: $5M per PetaFLOP

**Buyers (in priority order):**
1. **Government:** Acquires strategic infrastructure (capacity > 1000 PF or restricted)
2. **Solvent private orgs:** Acquires remaining DCs (if capital available + interest in expansion)
3. **Keep if no buyer:** Don't fire-sale at a loss

### Effects

**Immediate:**
- Capital injection (proceeds from sale)
- Reduced monthly operational costs
- Extended runway (months of capital remaining)

**Long-term:**
- May prevent bankruptcy entirely (if runway extended enough)
- Reduces compute capacity (fewer DCs)
- Shifts ownership to government/competitors

---

## Test Results

**Test script:** `scripts/testFinancialDistress.ts`

```bash
npx tsx scripts/testFinancialDistress.ts
```

**Results:**
- ✅ Organizations with 2+ distress indicators divest assets
- ✅ Sales happen to government or solvent private orgs
- ✅ Capital raised and costs reduced correctly
- ✅ Runway extended (e.g., 3.1 → 20.5 months in one test)
- ✅ Better price than bankruptcy (60% vs 50%)

**Example output:**
```
💰 STRATEGIC DIVESTMENT: OpenAI
   Financial distress: 3/3 indicators (capital: $54.0M, runway: 3.1 months)
   🏢 Sold to Google DeepMind: OpenAI DC Extra 1 (100 PF, $300.0M)
   📊 Capital raised: $300.0M, costs reduced by $0.5M/month
   📈 Runway extended: 3.1 → 20.5 months
   🏢 Private sector acquired 1 facilities
```

---

## Integration with Existing Systems

**Phase order in `processOrganizationTurn()`:**
1. Update existing projects
2. Collect revenue
3. Pay expenses
4. Make strategic decisions (build DCs, train models)
5. **→ NEW: Handle financial distress (sell assets)** ← BEFORE bankruptcy
6. Check bankruptcy (if capital < threshold)

**Relationship to bankruptcy:**
- Proactive divestment happens BEFORE bankruptcy
- If divestment raises enough capital, bankruptcy may be avoided
- If divestment fails (no buyers), bankruptcy still happens
- Bankruptcy sales are at 50% (desperate), divestment at 60% (strategic)

---

## Research Basis

**Real-world examples:**
- IBM sold server business (2014) - $2.3B divestment
- GE sold industrial divisions (2020) - strategic asset sales
- Standard turnaround strategy: "Divest non-core assets to focus on core business"

**Parameters:**
- 60% sale price: Realistic for strategic divestment (not desperate, not full price)
- 6 months runway threshold: Standard "danger zone" for startups/companies
- 10% margin threshold: Healthy companies typically have 15-30% margins

---

## Logging & Observability

**Emoji conventions:**
- 💰 STRATEGIC DIVESTMENT header
- 🏛️ Government acquisition
- 🏢 Private sector acquisition
- 📊 Capital/costs summary
- 📈 Runway extension
- ⚠️ No buyer found (kept asset)

**Log format:**
```
💰 STRATEGIC DIVESTMENT: [Org Name]
   Financial distress: [N]/3 indicators (capital: $[X]M, runway: [Y] months)
   🏢 Sold to [Buyer]: [DC Name] ([Capacity] PF, $[Price]M)
   📊 Capital raised: $[Total]M, costs reduced by $[Savings]M/month
   📈 Runway extended: [Old] → [New] months
```

---

## Known Limitations

1. **Only private orgs divest** - Government/academic orgs have different dynamics (not implemented)
2. **Buyer affordability** - If no solvent orgs exist (global collapse), divestment fails
3. **No AI model sales** - Currently only sells data centers (could extend to AI models)
4. **No partial DC sales** - All-or-nothing (can't sell 50% of a DC)

---

## Future Enhancements

**Potential extensions:**
1. **AI model divestment:** Sell AI models during distress (not just DCs)
2. **Partnership offers:** Merge with other orgs instead of selling assets
3. **Debt financing:** Take loans instead of selling (if banks exist)
4. **Government bailouts:** Government loans/grants to prevent strategic org failures

---

## Code Quality

**Defensive coding:**
- ✅ No silent fallbacks (explicit checks for capital, expenses, DCs)
- ✅ Type-safe (TypeScript strict mode)
- ✅ Deterministic (no Math.random(), uses state-based decisions)
- ✅ Validated with test script

**Emoji consistency:**
- ✅ Follows `docs/EMOJI_QUICK_REFERENCE.md`
- 💰 (money) for financial events
- 🏛️ (government) for gov acquisitions
- 🏢 (office building) for private acquisitions

---

## Commit Message

```
feat: Add proactive data center divestment for financially distressed orgs

Organizations now sell non-core assets BEFORE bankruptcy to:
- Raise capital (cash infusion)
- Reduce operational costs
- Extend runway and potentially avoid bankruptcy

Triggers:
- Capital < 6 months expenses (cash crunch)
- Negative cash flow (revenue < expenses)
- Operating margin < 10% (profitability crisis)

Sale mechanics:
- Sell smallest/non-strategic DCs first
- 1-2 DCs max per month (not fire-sale)
- Better price than bankruptcy (60% vs 50%)
- Buyers: government (strategic) or solvent private orgs

Research: IBM sold server business (2014), GE sold divisions (2020)
Standard turnaround strategy: divest non-core assets

Test: scripts/testFinancialDistress.ts
```

---

## Files Modified

1. `src/simulation/organizationManagement.ts`
   - Added `handleFinancialDistress()` function (lines 809-967)
   - Integrated into `processOrganizationTurn()` (line 1302)

2. `scripts/testFinancialDistress.ts` (new)
   - Test script validating divestment behavior
   - 4 scenarios: cash crunch, negative cash flow, severe distress, healthy org

---

## Validation Checklist

- [x] Function compiles (TypeScript strict mode)
- [x] Test script validates behavior
- [x] Emoji conventions followed
- [x] No silent fallbacks
- [x] Deterministic (no Math.random())
- [x] Realistic business behavior (research-backed)
- [x] Integrated before bankruptcy check
- [x] Logging clear and informative

---

**Status:** ✅ IMPLEMENTED & TESTED

*Have you tried turning it off and on again?* (Spoiler: Organizations tried selling assets instead.)
