# Radial/Radar Chart Visual Guide

**Visual representation of the radar chart implementation**

## High-Level Paradigm Balance Radar

```
┌─────────────────────────────────────────────────────────────┐
│  PARADIGM BALANCE OVERVIEW                                  │
│                                                             │
│                 Western Liberal (75)                        │
│                        /|\                                  │
│                       / | \                                 │
│                      /  |  \                                │
│                     /   |   \                               │
│                    /    |    \                              │
│      Indigenous   /     ●     \  Development               │
│         (70) ●───────────────────● (80)                     │
│                  \      |      /                            │
│                   \     |     /                             │
│                    \    |    /                              │
│                     \   |   /                               │
│                      \  |  /                                │
│                       \ | /                                 │
│                        \|/                                  │
│                   Ecological (72)                           │
│                                                             │
│  ┌──────────┬──────────────┬────────────┐                  │
│  │  Average │  Divergence  │  Contested │                  │
│  │   74.3   │     4.8      │     No     │                  │
│  └──────────┴──────────────┴────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Component View Mode Toggle

```
┌─────────────────────────────────────────┐
│  Component View:  [LIST] [RADAR] [BOTH] │
│                      ▲                   │
│                   Selected               │
└─────────────────────────────────────────┘
```

## Individual Paradigm Panel - List View

```
┌──────────────────────────────────────────────────────────┐
│  WESTERN LIBERAL                              75.2        │
│  ────────────────────────────────────────────────────     │
│  Democracy, civil liberties, rule of law...              │
│                                                          │
│  ▼ Component Breakdown                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Electoral Democracy    ████████████░░░░░    78    │  │
│  │  Civil Liberties        ██████████████░░░    85    │  │
│  │  Rule of Law            ███████████░░░░░░    70    │  │
│  │  Economic Freedom       ████████░░░░░░░░░    55    │  │
│  │  Privacy                ██████████████████   95    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Individual Paradigm Panel - Radar View

```
┌──────────────────────────────────────────────────────────┐
│  WESTERN LIBERAL                              75.2        │
│  ────────────────────────────────────────────────────     │
│  Democracy, civil liberties, rule of law...              │
│                                                          │
│              Democracy (78)                              │
│                    /|\                                   │
│                   / | \                                  │
│       Privacy    /  ●  \   Civil Liberties              │
│         (95) ●──────────────● (85)                       │
│               \     |     /                              │
│                \    |    /                               │
│      Economic  \   |   /  Rule of Law                    │
│      Freedom    \  |  /     (70)                         │
│        (55) ●────\─●─/                                   │
│                   \|/                                    │
│                                                          │
│         [Glowing cyan lines on black background]         │
└──────────────────────────────────────────────────────────┘
```

## Individual Paradigm Panel - Both View

```
┌──────────────────────────────────────────────────────────┐
│  ECOLOGICAL                                   18.5  ⚠️   │
│  ────────────────────────────────────────────────────     │
│  Climate: 15%, Biodiversity: 20%, ...                   │
│                                                          │
│              Climate (15)  ⚠️                            │
│                    /|\                                   │
│                   / | \                                  │
│       Ocean      /  ●  \   Biodiversity                 │
│       (20) ●────────────────● (20)                       │
│             \       |       /                            │
│              \      |      /                             │
│      Land Use \     |     / Nitrogen                     │
│        (25) ●──\────●────/─● (22)                        │
│                 \   |   /                                │
│                  \  |  /                                 │
│         Phosphorus ●─● Freshwater                        │
│             (18)   |   (16)                              │
│                                                          │
│  ▼ Planetary Boundaries                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Climate Stability      ███░░░░░░░░░░░░░░    15    │  │
│  │  Biodiversity           ████░░░░░░░░░░░░░    20    │  │
│  │  Nitrogen Cycle         ████░░░░░░░░░░░░░    22    │  │
│  │  Phosphorus             ███░░░░░░░░░░░░░░    18    │  │
│  │  Freshwater             ███░░░░░░░░░░░░░░    16    │  │
│  │  Land Use               █████░░░░░░░░░░░░    25    │  │
│  │  Ocean Health           ████░░░░░░░░░░░░░    20    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Color Legend

```
Paradigm Colors (from CSS variables):
──────────────────────────────────────────
Western Liberal:  #00A0FF  (Blue)       ───
Development:      #00FF88  (Green)      ───
Ecological:       #00CC66  (Dark Green) ───
Indigenous:       #FF8800  (Orange)     ───

Value Severity Colors:
──────────────────────────────────────────
High (≥70):       #00FF88  (Green)      ███
Medium (40-69):   #FFB000  (Amber)      ███
Low (<40):        #FF0040  (Red)        ███
Critical (<20):   #FF0040  (Red + Glow) ███ ◄ Pulsing
```

## Visual Design Principles

### Radar Chart Anatomy
```
                    Label (outside)
                         ↓
                    Axis Name
                        /|\
                       / | \
        Grid Circles /  ●  \ ← Data Point (glowing dot)
                    /   |   \
                   /    |    \
      Label →  ●──────────────● ← Label
              /       |       \
             /        |        \
            /         ●         \
           /          ↓          \
          ●      Data Point       ●
                 (glowing)

    ┌──────────────────────────────┐
    │ Background: Pure Black (#000)│
    │ Grid: White 10% opacity      │
    │ Data Line: Paradigm color    │
    │ Fill: Paradigm color 15-20%  │
    │ Glow: drop-shadow filter     │
    └──────────────────────────────┘
```

### Information Density

**High-Level Radar (4 axes):**
- Quick assessment: Is future balanced or contested?
- Pattern recognition: Symmetry = balance, asymmetry = conflict
- At-a-glance comparison: All paradigms in single view

**Component Radar (5-7 axes):**
- Detailed breakdown: Which specific dimensions are strong/weak?
- Strength distribution: Evenly distributed or concentrated?
- Weakest link identification: Immediate visual focus on gaps

**List View (bars):**
- Exact values: Precise numerical readouts
- Sequential comparison: Easy to compare adjacent items
- Color-coded severity: Quick visual triage

### Responsive Behavior

```
Desktop (>1200px):
┌────────────────────────────────────────┐
│  [Overview Radar: 340px]               │
│  ┌────────────┬────────────┐           │
│  │ Western    │ Development│  [Radars] │
│  │ [Radar]    │ [Radar]    │  [220px]  │
│  ├────────────┼────────────┤           │
│  │ Ecological │ Indigenous │           │
│  │ [Radar]    │ [Radar]    │           │
│  └────────────┴────────────┘           │
└────────────────────────────────────────┘

Tablet (768-1200px):
┌────────────────────────────────────────┐
│  [Overview Radar: 300px]               │
│  ┌─────────────────────────┐           │
│  │ Western    [Radar 200px]│           │
│  ├─────────────────────────┤           │
│  │ Development [Radar]     │           │
│  ├─────────────────────────┤           │
│  │ Ecological  [Radar]     │           │
│  ├─────────────────────────┤           │
│  │ Indigenous  [Radar]     │           │
│  └─────────────────────────┘           │
└────────────────────────────────────────┘

Mobile (<768px):
┌────────────────────────────┐
│ [Overview: 280px]          │
│ ┌────────────────────────┐ │
│ │ Western   [List View]  │ │
│ │ (Radar too small)      │ │
│ ├────────────────────────┤ │
│ │ Development [List]     │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

## Usage Scenarios

### 1. Monitoring Paradigm Balance
**User Goal:** "Is the future balanced or contested?"

**Workflow:**
1. View high-level radar
2. Check shape symmetry
3. Read balance metrics (avg, divergence, contested)

**Visual Cues:**
- Symmetrical shape → Balanced
- Asymmetrical shape → Contested
- High divergence value → Conflict

### 2. Identifying Component Weaknesses
**User Goal:** "Which specific areas need attention?"

**Workflow:**
1. Switch to `radar` view mode
2. Look at individual paradigm radars
3. Identify collapsed axes (close to center)

**Visual Cues:**
- Axes near center → Critical weakness
- Uneven shape → Concentrated strengths/weaknesses
- Red glowing points → Crisis threshold

### 3. Comparing Paradigm Profiles
**User Goal:** "How do paradigms differ in structure?"

**Workflow:**
1. View all 4 component radars simultaneously
2. Compare shapes (pentagon vs heptagon, symmetry)
3. Note which paradigms have similar patterns

**Visual Cues:**
- Western/Development: Similar pentagons if aligned
- Ecological: Distinct heptagon (7 boundaries)
- Indigenous: Unique orange pentagon

### 4. Historical Trend Analysis (Future Enhancement)
**User Goal:** "Are paradigms converging or diverging over time?"

**Workflow:**
1. Enable `showPrevious={true}` on radars
2. Compare current (bright) vs previous (faded) shapes
3. Track expansion/contraction of axes

**Visual Cues:**
- Expanding shape → Improving
- Contracting shape → Deteriorating
- Shape rotation → Shifting strengths

---

**Design Philosophy:** Every pixel earns its place. Radars maximize information density while maintaining scannable clarity through spatial encoding, color, and glow effects.
