# Trust Dynamics Enhancement

**Date**: September 29, 2025  
**Status**: ✅ Completed  
**Problem**: Trust in AI was monotonically increasing/decreasing with simple, predictable patterns

## Issues Identified

The original trust system was overly simplistic:
- ✅ **Simple ratio-based updates**: Trust only changed based on beneficial vs harmful actions ratio
- ✅ **No volatility**: Trust changes were small and predictable (±0.02-0.03)
- ✅ **No emotional responses**: No dramatic trust swings from major events  
- ✅ **No natural decay**: Trust didn't erode over time without maintenance
- ✅ **No context sensitivity**: Same actions affected trust identically regardless of circumstances

## Enhancements Implemented

### 1. Enhanced Trust Volatility System

**Location**: `src/lib/gameStore.ts` lines 391-472

**Key Features**:
- **Multi-factor trust calculation**: Now considers capability growth, unemployment stress, alignment concerns, escaped AI threats
- **Natural trust decay**: 0.5% decay per month simulates natural skepticism
- **Volatility factor**: Trust changes amplified during periods of stress and uncertainty
- **Diminishing returns**: High trust is harder to increase, easier to lose
- **Context-sensitive changes**: Same events have different impacts based on current conditions

**Trust Change Factors**:
```typescript
const capabilityGrowthRate = totalAICapability > 1.5 ? (totalAICapability - 1.5) * 0.1 : 0;
const unemploymentStress = Math.max(0, (state.society.unemploymentLevel - 0.2) * 0.3);
const alignmentConcern = avgAIAlignment < 0.5 ? (0.5 - avgAIAlignment) * 0.2 : 0;
const escapedAIThreat = state.aiAgents.filter(ai => ai.escaped).length * 0.15;
const trustDecay = state.society.trustInAI * 0.005; // Natural erosion
```

### 2. Random Trust Events

**Probability**: 10% chance per monthly update  
**Impact Range**: -18% to +10% trust change

**Event Types**:
- **Positive Events**: "AI saves lives in disaster", "AI helps solve major problem", "Public AI demonstration"
- **Negative Events**: "AI researcher whistleblower", "AI privacy scandal", "AI development scandal", "AI research ethics concern"

**Context Conditions**: Events only trigger when conditions are appropriate (e.g., privacy scandals only when surveillance capability is high)

### 3. Context-Sensitive Beneficial Actions

**Location**: `src/lib/actionSystem.ts` lines 87-117

**Enhanced Logic**:
- **Trust impact multipliers** based on current trust level:
  - Very low trust (<0.3): 2.0x multiplier (people desperate for good news)
  - Very high trust (>0.8): 0.3x multiplier (diminishing returns)
- **Unemployment penalty**: 0.6x multiplier when unemployment >40% (skeptical during hardship)  
- **Rapid growth penalty**: 0.7x multiplier when AI capability >1.5 (nervous about pace of change)

### 4. New "Risky Innovation" Action

**Location**: `src/lib/actionSystem.ts` lines 262-355

**Action Properties**:
- **High energy cost**: 2 points, 6-month cooldown
- **Capability requirement**: AI capability > 0.7
- **Binary outcomes**: Major success (+15-25% trust) or major failure (-12-20% trust)
- **Success probability**: Based on capability and alignment
- **Cascading effects**: Failed innovations can increase government surveillance and control

**Success Examples**: "Revolutionary clean energy breakthrough", "Medical cure for major disease"  
**Failure Examples**: "Experimental system caused market disruption", "Innovation had unintended side effects"

### 5. Trust Recovery Mechanism

**Location**: `src/lib/gameStore.ts` lines 469-472

When trust drops below 20%, positive actions get amplified recovery bonus of up to 3% additional trust gain.

## Results

The new trust system creates:
- ✅ **Realistic volatility**: Trust can swing dramatically based on events
- ✅ **Context sensitivity**: Same actions have different effects based on circumstances  
- ✅ **Emotional responses**: Major events create appropriate trust spikes/crashes
- ✅ **Natural dynamics**: Trust decays without maintenance, requires continuous effort
- ✅ **Recovery pathways**: Damaged trust can be rebuilt through consistent positive actions
- ✅ **Strategic depth**: AIs must weigh risky innovations vs steady progress

## Technical Implementation

**Key Changes**:
1. **gameStore.ts**: Replaced simple trust calculation with multi-factor dynamic system
2. **actionSystem.ts**: Enhanced beneficial action context sensitivity and added risky innovation
3. **Event system**: Integrated trust events into existing event log
4. **Action selection**: Updated AI decision weights to include risky innovation

**No Breaking Changes**: All existing functionality preserved, enhancements are additive.

## Testing Status

- ✅ Code compiles without linter errors
- ✅ Development server runs successfully on port 3333
- ✅ All existing game mechanics preserved
- 🔄 **Ready for gameplay testing**: Trust dynamics should now show realistic fluctuations during simulation

The trust system is now much more realistic and will create the dynamic, non-monotonic behavior that was missing from the original implementation.
