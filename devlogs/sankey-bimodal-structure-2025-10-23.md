# Sankey Diagram Bimodal Structure - October 23, 2025

## Summary
Redesigned the AI Lifecycle Sankey diagram to show bimodal branching structure instead of linear progression.

## User Requirement
> "retired and escaped should be like a bimodal state, just like how I see you got a bunch of different numbers there with the Sankey diagram. There's like training/testing, and then there's open/closed (or also bimodal), like it's either open or closed. So, they should be siblings. And then there's retired and escaped. And retired can always be espionaged out of retirement into open or escaped."

## Old Structure (Linear)
```
Training → Testing → Closed → Open → Retired → Escaped
```
All states were horizontally aligned in a single flow.

## New Structure (Bimodal Branching)
```
Training → Testing → ┌─ Closed (upper) ─┐
                     │                   ├─→ Retired (upper)
                     │                   │       ↓ (espionage)
                     └─ Open (lower) ────┘   ┌───┴────┐
                                              │        ↓
                                         Open ← ─→ Escaped (lower)
```

**Key changes:**
1. **Training → Testing**: Sequential flow (horizontal)
2. **Testing branches to:** Closed (upper) OR Open (lower) - bimodal siblings
3. **[Closed/Open] branch to:** Retired (upper) OR Escaped (lower) - bimodal siblings
4. **Retired can escape via espionage:** Retired → Open OR Retired → Escaped (dashed red arrows)

## Implementation Details

### 1. **Repositioned Stages**
Changed from linear horizontal layout to bimodal vertical stacking:

```typescript
const stages = [
  // Sequential stages (centered)
  { x: 80,  y: 170, label: 'Training' },
  { x: 280, y: 170, label: 'Testing' },

  // Bimodal deployed states (upper/lower)
  { x: 520, y: 80,  label: 'Closed' },   // upper
  { x: 520, y: 260, label: 'Open' },     // lower

  // Bimodal end states (upper/lower)
  { x: 800, y: 80,  label: 'Retired' },  // upper
  { x: 800, y: 260, label: 'ESCAPED' },  // lower
]
```

### 2. **Bimodal Flow Connections**
Replaced sequential flow logic with explicit branching:

```typescript
// Sequential flows
createFlow(training, testing, 'aligned')

// Bimodal branching: Testing → [Closed, Open]
createFlow(testing, closed, 'aligned')
createFlow(testing, open, 'uncertain')

// Bimodal branching: [Closed, Open] → [Retired, Escaped]
createFlow(closed, retired, 'aligned')
createFlow(closed, escaped, 'misaligned')
createFlow(open, retired, 'uncertain')
createFlow(open, escaped, 'misaligned')
```

### 3. **Espionage Flows (Retired → Open/Escaped)**
Added dashed red arrows showing retired AIs can be espionaged:

```typescript
// Espionage: Retired → Open (curved back)
<path
  d="M retired.x,retired.y C (curved) → open.x,open.y"
  stroke="rgba(255, 0, 64, 0.6)"
  strokeDasharray="4 4"
  markerEnd="url(#arrowhead)"
/>

// Espionage: Retired → Escaped (straight down)
<path
  d="M retired.center → escaped.center"
  stroke="rgba(255, 0, 64, 0.6)"
  strokeDasharray="4 4"
  markerEnd="url(#arrowhead)"
/>
```

### 4. **Updated Legend**
Added explanation of bimodal structure and espionage flows:

```
- Normal flow (solid curves)
- Espionage flow (dashed red arrows with arrowheads)
- Description: "Training → Testing → [Closed OR Open] → [Retired OR Escaped].
               Retired AIs can be espionaged back into deployment or escape."
```

### 5. **Visual Improvements**
- **Height**: Increased SVG height from 280px to 340px to accommodate vertical stacking
- **Bar sizing**: Bars are centered at their y position (max height 60px)
- **Labels**: Positioned above each bar instead of at top of diagram
- **Totals**: Positioned below each bar instead of at bottom of diagram

## Files Modified

**`src/components/dashboards/AIAgentsDashboard.tsx`**
- Updated Sankey diagram structure (lines 306-601)
- Changed from linear stages array to bimodal positioning
- Replaced sequential flow logic with explicit branching flows
- Added espionage flow arrows (dashed red with arrowheads)
- Updated legend to explain bimodal structure

## Visual Result

The diagram now clearly shows:
1. **Sequential progression**: Training → Testing
2. **First bimodal branch**: Testing splits to Closed (upper) or Open (lower)
3. **Second bimodal branch**: Both Closed and Open can go to Retired (upper) or Escaped (lower)
4. **Espionage paths**: Retired AIs have dashed red arrows back to Open or down to Escaped

The bimodal structure makes it immediately clear that these are **alternative states** (not sequential), and the espionage arrows show that retirement is not necessarily final.
