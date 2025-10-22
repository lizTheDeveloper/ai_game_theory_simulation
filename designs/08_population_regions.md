# Population & Regions View
## Regional Quality of Life & Inequality Tracking

### Purpose
Monitor population dynamics, regional quality of life variations, and inequality patterns across 30+ countries/regions. This screen reveals "Elysium" scenarios (elite prosperity amid mass suffering), regional crisis impacts, migration flows, and demographic transitions. Users can identify inequality hotspots, predict population collapses, and understand how global crises affect different regions asymmetrically.

### Data Sources
- Population by region (30 countries)
- Quality of Life (17 dimensions × 5 tiers)
- Mortality rates and causes
- Migration flows
- Regional inequality (Gini coefficients)
- Survival tier distribution
- Life expectancy variations

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ POPULATION & REGIONAL DYNAMICS                         MONTH 47 | 2029.11  │
│ ════════════════════════════════════════════════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ GLOBAL OVERVIEW                                                     │  │
│  │                                                                     │  │
│  │  Population: 7.82B (-2.1%)     Life Expectancy: 71.3yr (-4.2yr)    │  │
│  │  QoL Average: 68.4/100         Inequality (Gini): 0.73 (HIGH)      │  │
│  │                                                                     │  │
│  │  Population Distribution:       QoL by Tier:                        │  │
│  │  Elite (1%)    ██░░░ 78M       Transcendent  ░░░░░░░░░ 0.1%       │  │
│  │  Middle (20%)  ████░ 1.6B      Flourishing   ██░░░░░░░ 12%        │  │
│  │  Working (50%) ██████ 3.9B      Material      ████░░░░░ 35%        │  │
│  │  Precariat(29%)████░░ 2.3B      Survival      ████████░ 43%        │  │
│  │                                 Crisis        ██░░░░░░░ 10%        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ REGIONAL HEATMAP                    [Toggle: QoL | Population | Crisis]│  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  Region         Population  QoL   Mortality  Inequality  Status    │  │
│  │  ─────────────────────────────────────────────────────────────────  │  │
│  │  USA            334M       ███████░░░ 72    +1.2%     0.82 ⚠      │  │
│  │  China          1411M      ████████░░ 81    -0.3%     0.47 ◐      │  │
│  │  India          1428M      ███░░░░░░░ 31    +8.7%     0.68 🔴     │  │
│  │  EU             447M       █████████░ 89    +0.4%     0.31 ✓      │  │
│  │  Brazil         215M       ████░░░░░░ 42    +3.1%     0.89 ⚠      │  │
│  │  Nigeria        223M       ██░░░░░░░░ 23    +12.3%    0.71 🔴     │  │
│  │  Japan          124M       ██████████ 94    -0.8%     0.29 ✓      │  │
│  │  Russia         146M       ████░░░░░░ 38    +2.4%     0.77 ⚠      │  │
│  │                                                                     │  │
│  │  [View: ■ Heatmap  ▤ Bars  ◉ Bubbles  🗺 Geographic]              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ INEQUALITY PATTERNS          │  │ MIGRATION FLOWS                 │  │
│  │                               │  │                                 │  │
│  │  "Elysium" Detection: HIGH    │  │  Climate Refugees:   42M/yr    │  │
│  │                               │  │  Economic Migration: 18M/yr    │  │
│  │  Elite QoL:    ██████████ 94  │  │  Conflict Displaced: 31M/yr    │  │
│  │  Middle QoL:   ██████░░░░ 61  │  │                                 │  │
│  │  Precariat QoL:██░░░░░░░░ 22  │  │  Major Flows:                  │  │
│  │                               │  │  S.Asia → Europe    ═══════►   │  │
│  │  Gap: 72 points (CRITICAL)    │  │  Africa → Europe    ═════►     │  │
│  │                               │  │  C.America → N.Am   ═══►       │  │
│  │  Trend: ↑ Widening 2.1%/mo    │  │  Middle East → EU   ══►        │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### Global Overview
- Total population with trend
- Average QoL and life expectancy
- Population distribution by economic class
- QoL tier breakdown
- Global inequality metric

### Regional Heatmap
- Sortable table/heatmap view
- Color coding by metric selected
- Status indicators for crisis levels
- Multiple view modes (heatmap, bars, geographic)

### Inequality Patterns
- Elite vs precariat QoL comparison
- "Elysium" scenario detection
- Trend analysis
- Critical gap warnings

### Migration Flows
- Annual migration by cause
- Major migration corridors
- Flow visualization with arrows
- Pressure points identified

---

This screen reveals critical population dynamics and inequality patterns that determine social stability and the risk of "Elysium" scenarios.