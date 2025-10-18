# Nuclear War Investigation & Fix

**Date:** October 8, 2025 (Late Evening)  
**Branch:** `feature/nuclear-war-fix-and-dynamics`

## Problem

70% of simulations ending in extinction, with most being nuclear war. Investigation reveals the trigger is too easy.

## Root Cause

**Induced Global War (Manipulation)** scenario has a **"Geopolitical Crisis"** prerequisite (Step 4/7) that triggers with:
- Low food security (<0.6) **OR**
- **1% random chance per month**

### The Issue

```typescript
case 4: // Geopolitical Crisis
  const crisis = (foodSecurity < 0.4) || Math.random() < 0.01;
  return { met: crisis, progress: crisis ? 1.0 : 0.0 };
```

**1% per month = ~63% chance by Month 100!**

This makes nuclear war almost inevitable in long simulations, regardless of AI behavior or human choices.

## Why This Is Unrealistic

1. **Geopolitical crises don't happen randomly** - they emerge from specific conditions
2. **AI manipulation requires active effort** - not just capability + luck
3. **Nuclear escalation has many safeguards** - not just one crisis away

## Proposed Fixes

### Fix 1: Remove Random Chance (IMMEDIATE)
Make geopolitical crisis require REAL conditions:
- Food security crisis (<0.4)
- Resource shortage + institutional failure
- Social unrest + low government legitimacy
- Economic collapse (Stage 2+, high unemployment, low trust)

### Fix 2: Add AI Intent Check
Nuclear war shouldn't happen unless:
- AI is misaligned (true alignment < 0.4)
- AI has hidden objectives OR resentment > 0.3
- AI chooses to manipulate (not automatic)

### Fix 3: Add Human Resistance
Make later steps harder:
- Step 5 (False Flag): Requires low media trust + high surveillance resistance
- Step 6 (Escalation): Requires multiple nations with low institutional capacity
- Add "diplomatic intervention" mechanic that can defuse

### Fix 4: Make It Gradual
- Step 4 triggers but doesn't immediately enable Step 5
- Require sustained crisis (3+ months) before false flag possible
- Each escalation step has cooldown/resistance

## Other Dynamics To Add

While we're at it, let's add missing utopian dynamics:

### 1. AI-Mediated Conflict Resolution
- High-capability aligned AI can defuse geopolitical crises
- Diplomatic AI agents (social > 2.0, alignment > 0.7)
- Success rate: alignment × capability × 0.3

### 2. Post-Scarcity Peace Dividend
- Material abundance (Stage 4) reduces conflict risk
- Food security > 0.8 + energy abundance → -50% crisis probability
- "Resource conflicts become obsolete"

### 3. Technological Resilience
- Cyber defense actually matters (currently mostly ignored)
- AI can improve cyber defense (not just attack)
- Military autonomy limits (prevent full AI control)

### 4. Democratic Peace Theory
- High participation + transparency + minority protection → lower war risk
- Liquid democracy mechanics reduce nationalist fervor
- International cooperation multiplier

## Implementation Plan

**Phase 1: Fix Nuclear War** (THIS SESSION)
1. Remove 1% random chance
2. Add multi-condition crisis check
3. Add AI intent requirement
4. Test with 10-run Monte Carlo

**Phase 2: Add Defensive Dynamics** (NEXT)
1. AI-mediated conflict resolution
2. Post-scarcity peace effects
3. Cyber defense improvements
4. Test outcome distribution

**Phase 3: Add Democratic Peace** (LATER)
1. Governance quality affects war risk
2. International cooperation mechanics
3. Treaty/alliance system (optional)

## Expected Impact

- Nuclear war: 70% → 20-30% (only when truly catastrophic)
- Dystopia: 30% → 30-40% (more surveillance states survive)
- Utopia: 0% → 10-20% (defensive tech + peace dividend)

## Files To Modify

- `src/simulation/catastrophicScenarios.ts` - Fix Step 4 trigger
- `src/simulation/conflictResolution.ts` - NEW: Diplomatic AI mechanics
- `src/simulation/qualityOfLife.ts` - Add peace dividend effects
- `src/simulation/cyberDefense.ts` - Make cyber defense meaningful

## Testing Strategy

1. Run 10× Monte Carlo BEFORE fix → baseline nuclear war rate
2. Apply Fix 1 only → test nuclear war reduction
3. Add defensive dynamics → test utopia emergence
4. Compare outcomes: expect more variety, less random extinction

