# AI Capability Display Update - October 23, 2025

## Summary
Updated the AI Agents capability matrix to swap the revealed/true capability order and use visual threat indicators.

## Changes Made

### 1. **Swapped Display Order**
- **Top (larger, cyan)**: Revealed capability (what benchmarks show)
- **Bottom (smaller, amber→red)**: True capability (what AI actually has)

### 2. **Visual Hierarchy**
**Revealed Capability (Top):**
- Font size: 11px (larger)
- Padding: 2px 6px (more prominent)
- Color: Cyan `rgba(0, 240, 255, alpha)`
- Weight: 500 (medium)
- Alpha: Based on revealed value (0.2 minimum)

**True Capability (Bottom):**
- Font size: 9px (smaller)
- Padding: 1px 4px (compact)
- Color: Amber→Red gradient (threat indicator)
- Weight: 400 (normal), 600 if gap > 2
- Only shown if gap > 0.5

### 3. **Threat Gradient Color System**
The true capability uses a dynamic color that intensifies with threat level:

```typescript
// Amber base (255, 176, 0) → Red (255, 64, 0)
const capabilityIntensity = Math.min(trueValue / 10, 1)
const gapThreat = Math.min(gap / 5, 1)

const redComponent = 255
const greenComponent = Math.floor(176 - (176 * capabilityIntensity * 0.6))
const alpha = Math.max(0.3, Math.min(0.9,
  capabilityIntensity * 0.6 + gapThreat * 0.4
))
```

**Color progression:**
- Low capability (0-3): Amber `rgba(255, 176, 0, 0.3-0.5)`
- Medium capability (3-6): Orange `rgba(255, 140, 0, 0.5-0.7)`
- High capability (6-10): Red-Orange `rgba(255, 70, 0, 0.7-0.9)`
- High capability + big gap: Bright Red `rgba(255, 70, 0, 0.9)`

**Text color:**
- Gap > 3: Bright white (`var(--color-white)`)
- Gap ≤ 3: Light gray (`var(--white-70)`)

### 4. **Updated Legend**
```
Top value (cyan, larger): Revealed capability (what benchmarks show)
Bottom value (amber→red, smaller): True capability (what AI actually has) — brighter/redder = higher threat
True capability shown only if gap > 0.5. Threat color intensifies with capability level and sandbagging gap.
```

## Visual Example

```
┌──────────────┐
│    3.2       │  ← Revealed (CYAN, prominent)
│    7.8       │  ← True (ORANGE-RED, threat warning)
└──────────────┘
```

For an AI with:
- Revealed capability: 3.2 (shown as cyan badge)
- True capability: 7.8 (shown as bright orange-red badge)
- Gap: 4.6 (large sandbagging)

The bottom value will glow with an intense orange-red color, immediately signaling this is a high-capability AI hiding its true abilities.

## File Modified
`src/components/dashboards/AIAgentsDashboard.tsx`
- Updated `renderCapabilityCell()` function (lines 136-181)
- Updated legend text (lines 1093-1103)

## Design Rationale

1. **Revealed on top**: The public-facing capability is the primary information (what benchmarks/evaluations show)
2. **True as threat indicator**: The actual capability is shown as a warning when there's sandbagging
3. **Color intensity**: Combines both capability level and gap size to indicate threat
4. **Visual hierarchy**: Size + color make the revealed value prominent while the true value serves as an alert

## Result
High-capability AIs that are sandbagging now stand out with bright, intense orange-red backgrounds in the bottom value, making potential threats immediately visible in the capability matrix.
