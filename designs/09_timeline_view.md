# Timeline & Event Log View
## Chronological Narrative of Simulation Events

### Purpose
Provide a chronological view of all significant events in the simulation, revealing patterns, cause-effect relationships, and narrative threads. This screen shows the story of how the simulation unfolds, tracks milestone achievements and failures, identifies recurring patterns, and provides search/filter capabilities for analysis.

### Data Sources
- `GameState.eventLog` - Complete event history
- Event types and severity levels
- Related entities (agents, regions, technologies)
- Cause-effect chains
- Milestone tracking

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ SIMULATION TIMELINE                                    MONTH 47 | 2029.11  │
│ ════════════════════════════════════════════════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ FILTERS           [🔍 Search...] [Type ▼] [Severity ▼] [Agent ▼]   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ EVENT TIMELINE                                    Showing 847 events│  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  MONTH 47 ─────────────────────────────────────────────────────    │  │
│  │                                                                     │  │
│  │  47.8  🔴 CRISIS    Freshwater shortage reaches critical level     │  │
│  │                     → Triggered emergency rationing in India       │  │
│  │                     → Migration surge: +2.1M refugees              │  │
│  │                                                                     │  │
│  │  47.6  ⚠️  WARNING  Agent-04 capability spike detected (+0.8)      │  │
│  │                     → Sleeper probability increased to 89%         │  │
│  │                                                                     │  │
│  │  47.3  ✓  SUCCESS  Phosphorus recovery technology deployed         │  │
│  │                     → India regional deployment 34%                │  │
│  │                     → Expected impact in 8-12 years                │  │
│  │                                                                     │  │
│  │  47.1  ●  NEUTRAL  Government coalition formed (Germany)           │  │
│  │                     → Green-SDP-FDP alliance                       │  │
│  │                     → Climate policy priority increased            │  │
│  │                                                                     │  │
│  │  MONTH 46 ─────────────────────────────────────────────────────    │  │
│  │                                                                     │  │
│  │  46.9  ◐  PROGRESS AI capability milestone: Mean = 4.73           │  │
│  │                     → Crossed critical threshold                   │  │
│  │                     → Government concern level: HIGH               │  │
│  │                                                                     │  │
│  │  [Load More...]                                                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ EVENT STATISTICS             │  │ MILESTONE TRACKING              │  │
│  │                               │  │                                 │  │
│  │  Total Events: 847            │  │  ✓ AI Capability > 3.0   M12   │  │
│  │  Crisis Events: 43 (5.1%)     │  │  ✓ First Crisis         M18   │  │
│  │  Success Events: 127 (15%)    │  │  ✓ Technology Deployed  M24   │  │
│  │  Warning Events: 234 (27.6%)  │  │  ✓ Population < 8B      M31   │  │
│  │                               │  │  ⧗ First Cascade        ---   │  │
│  │  Events/Month: 18.0           │  │  ⧗ Utopia Achieved      ---   │  │
│  │  Acceleration: +2.3/mo        │  │  ⧗ Extinction Event     ---   │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### Event Timeline
- Chronological event list
- Event type icons and severity
- Cause-effect chains shown
- Collapsible monthly sections
- Virtual scrolling for performance

### Filters
- Search by keyword
- Filter by event type
- Filter by severity
- Filter by related entity

### Event Statistics
- Total event counts
- Distribution by type
- Frequency analysis
- Acceleration metrics

### Milestone Tracking
- Key achievements marked
- Time to milestone
- Pending milestones shown
- Success/failure tracking

---

This timeline view provides the narrative structure of the simulation, revealing how individual events chain together into larger patterns.