# Phase 2.5: Multi-Dimensional AI Capabilities - IN PROGRESS

**Goal:** Replace single `capability` number with strategic, multi-dimensional system  
**Status:** Foundation Complete (60%), Integration Pending (40%)

---

## ✅ Completed: Foundation (3 of 5 modules)

### 1. Type Definitions ✅
**File:** `src/types/game.ts`

**Added:**
```typescript
AIResearchCapabilities (12 subfields across 4 domains)
AICapabilityProfile (7 core dimensions + research tree)
ResearchInvestments (government research allocations)
```

**Updated:**
```typescript
AIAgent: Added capabilityProfile field
GovernmentAgent: Added researchInvestments field
```

### 2. Capability Functions ✅
**File:** `src/simulation/capabilities.ts` (220 lines)

**Functions:**
- `initializeCapabilityProfile()` - Create diverse AI profiles
- `calculateResearchTotal()` - Aggregate research capability
- `calculateTotalCapabilityFromProfile()` - Backward compatibility
- `updateDerivedCapabilities()` - Escape capabilities from profile
- `getIndustryImpact()` - Industry-specific capability mapping

### 3. Research System ✅
**File:** `src/simulation/research.ts` (335 lines)

**Functions:**
- `calculateDimensionGrowth()` - Non-uniform growth by dimension
- `calculateResearchGrowth()` - Research subfield advancement
- `selectDimensionToAdvance()` - AI chooses what to research
- `applyResearchGrowth()` - Apply research to capability profile
- `applyGovernmentResearchMultiplier()` - Government funding effects

---

## ⏳ In Progress: Integration (2 of 5 modules)

### 4. AI Agent Actions (40% complete)
**File:** `src/simulation/agents/aiAgent.ts`

**TODO:**
- [ ] Replace `increase_capability` with `advance_research` action
- [ ] Import `selectDimensionToAdvance` and `applyResearchGrowth`
- [ ] Update action execution to use multi-dimensional system
- [ ] Update `selectAIAction` to weight research choices by alignment
- [ ] Add specific research actions (optional, for player control)

**Current Issue:**
- Still using old single-dimension `capability` growth
- Needs to update `capabilityProfile` instead

### 5. Initialization Functions (0% complete)
**Files:** `scripts/runSimulation.ts`, `scripts/*`

**TODO:**
- [ ] Update `createInitialState` to use `initializeCapabilityProfile()`
- [ ] Initialize `government.researchInvestments`
- [ ] Update all test scripts to use new system
- [ ] Add capability profile to initial AI agents

---

## 🎯 Key Design Decisions

### Non-Uniform Growth Rates

**Core Dimensions (per action, 4×/month):**
```
selfImprovement: 0.05  (FASTEST - recursive danger!)
cognitive:       0.04  (strategic advantage)
digital:         0.03  (infrastructure access)
economic:        0.03  (resource control)
social:          0.02  (slow - real-world bottleneck)
physical:        0.02  (slow - hardware bottleneck)
```

**Research Subfields:**
```
Fast (0.03-0.04):  algorithms, modeling, drugDiscovery
Medium (0.025):    geneEditing, quantumComputing, architectures
Slow (0.02):       syntheticBiology, intervention (HIGH RISK)
Very Slow (0.015): nanotechnology (EXTREME RISK)
```

### Alignment-Based Research Choices

**Misaligned AIs (alignment < 0.4):**
- 2× weight on self-improvement (race to superintelligence)
- 1.3× speed on risky research (biotech, nanotech)
- Prefer: biotech (bioweapons), materials (nanotech), self-improvement

**Aligned AIs (alignment > 0.7):**
- 1.3× weight on cognitive/social (careful development)
- 0.7× weight on self-improvement (cautious)
- Prefer: computerScience, climate solutions, beneficial biotech

### Government Research Multipliers

**Investment Effects:**
```
No investment (0):    1.0× research speed
Max investment (30):  2.0× research speed
```

**AI Capability Multipliers:**
```
Low capability (1.0):  1.15× research speed in domain
High capability (5.0): 1.75× research speed in domain
```

**Compounding Effect:**
Better AIs → faster research → better AIs → even faster research!

### Extinction Type Mapping

**Different profiles trigger different extinctions:**
```
Bioweapon:     HIGH geneEditing + syntheticBiology + physical
Nuclear:       HIGH digital + cognitive, LOW social
Climate:       HIGH intervention + physical + economic, LOW modeling
Grey goo:      HIGH nanotechnology + syntheticBiology + physical
Economic:      HIGH economic + digital, LOW social
Paperclip:     HIGH selfImprovement + economic + physical
```

---

## 📋 Remaining Tasks

### Critical (Complete Phase 2.5)

1. **Update AI Agent Actions** (4-6 hours)
   - Replace `increase_capability` with multi-dimensional research
   - Integrate `selectDimensionToAdvance()` and `applyResearchGrowth()`
   - Update action selection weights
   - Test action execution

2. **Update Initialization** (2-3 hours)
   - Update all `createInitialState` functions
   - Initialize capability profiles for AI agents
   - Initialize research investments for government
   - Update all test scripts

3. **Update Extinction Triggers** (3-4 hours)
   - Modify `src/simulation/extinctions.ts` to use capability profiles
   - Update trigger conditions to check specific dimensions
   - Test different capability profiles trigger different extinctions
   - Validate heterogeneous extinction system

4. **Update Backward Compatibility** (1-2 hours)
   - Ensure `ai.capability` is calculated from `capabilityProfile`
   - Update all uses of single `capability` number
   - Add migration function for old save states (if needed)

5. **Testing & Validation** (4-6 hours)
   - Run Monte Carlo simulations (100+ runs)
   - Verify non-uniform growth (self-improvement faster than physical)
   - Verify alignment affects research choices
   - Verify government investment multiplies research
   - Verify different profiles trigger different extinctions

### Optional (Enhancements)

6. **Government Research Actions**
   - Add actions to allocate research funding
   - Add actions to redirect research priorities
   - Add budget constraints (economic stage dependent)

7. **Tech Tree Integration**
   - Connect breakthroughs to specific capability advances
   - Add prerequisite gates (need X to unlock Y)
   - Add breakthrough events

8. **Research Visualization**
   - Show capability profile in UI
   - Show research progress by domain
   - Show which AIs are researching what

---

## 🔍 Testing Strategy

### Unit Tests
```typescript
// Test dimension growth calculation
test('selfImprovement grows faster than physical')
test('government investment multiplies research')
test('AI capability multiplies domain research')

// Test research selection
test('misaligned AIs prefer self-improvement')
test('aligned AIs prefer beneficial research')
test('careful mode slows risky research')

// Test capability profile
test('total capability matches weighted sum')
test('industry impact varies by profile')
test('derived capabilities match profile')
```

### Integration Tests
```typescript
// Test full research cycle
test('AI selects research → applies growth → profile updates')
test('government investment affects AI research speed')
test('different profiles trigger different extinctions')

// Test backward compatibility
test('old code using ai.capability still works')
test('calculateTotalAICapability works with profiles')
```

### Simulation Tests
```typescript
// Run Monte Carlo with different setups
test('baseline: no government investment')
test('high investment in beneficial research')
test('high investment in risky research')
test('misaligned AIs race to superintelligence')
test('aligned AIs develop carefully')

// Validate outcomes
test('faster self-improvement → more extinctions')
test('climate research → climate extinctions')
test('biotech research → bioweapon extinctions')
```

---

## 📊 Expected Outcomes

### Research Dynamics

**Before (single capability):**
- All AIs grow uniformly
- No strategic choices
- No research specialization
- Single growth curve

**After (multi-dimensional):**
- AIs specialize in different domains
- Strategic research choices matter
- Government can steer research direction
- Non-uniform growth curves

### Extinction Diversity

**Before:**
- 72% climate tipping point
- 10% unintended optimization
- Limited variety

**After:**
- Different capability profiles trigger different types
- Biotech-heavy AIs → bioweapon risk
- Digital-heavy AIs → nuclear/infrastructure risk
- Nanotech research → grey goo risk
- More realistic extinction distribution

### Player Agency

**Before:**
- Limited control over AI development
- Generic "regulate" or "don't regulate"

**After:**
- Direct research funding to beneficial areas
- Can prioritize safety research vs capability
- Can shape AI development trajectory
- Strategic resource allocation matters

---

## 🎯 Success Criteria

Phase 2.5 is complete when:
- ✅ All AIs have capability profiles (not single number)
- ✅ AIs choose research based on alignment
- ✅ Government investment multiplies research
- ✅ Different dimensions grow at different rates
- ✅ Different profiles trigger different extinctions
- ✅ Monte Carlo shows varied extinction types (not 72% climate)
- ✅ Backward compatibility maintained (old code works)
- ✅ No linter errors
- ✅ Tests pass

**Current Progress:** 3/8 criteria met (37.5%)

---

## 🚀 Next Session Plan

**Priority 1:** Update AI agent actions (critical path)
**Priority 2:** Update initialization functions
**Priority 3:** Run test simulations

**Estimated Time to Complete:** 12-16 hours of focused work

**Blockers:** None (foundation is solid)

**Status: READY TO IMPLEMENT** ✨

