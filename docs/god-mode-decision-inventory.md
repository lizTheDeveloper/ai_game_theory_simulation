# God Mode Decision Inventory

**Generated:** November 9, 2025
**Purpose:** Complete inventory of all automated decisions that can be manually controlled

## 1. Government Decisions

### 1.1 Policy Actions
**Location:** `src/simulation/government/`

| Decision | Type | Current Logic | UI Control |
|----------|------|--------------|------------|
| UBI Implementation | Choice | Priority-weighted by unemployment + economic stage | Radio buttons (None/Means-tested/Job guarantee/Generous) |
| AI Regulation Type | Choice | Based on control desire + threat level | Radio buttons (None/Large companies/Compute threshold/Capability ceiling) |
| Alignment Research Investment | Range | 0-10 units based on AI threat | Slider (0-10) |
| Safety Research Investment | Range | Based on capability concerns | Slider (0-10) |
| Oversight Framework Level | Range | Based on legitimacy + control | Slider (0-10) |
| Climate Investment Priority | Range | Config-based weighting | Slider (0-100%) |
| Economic Recovery Focus | Choice | Stage-based selection | Dropdown |
| International Cooperation Level | Range | Trust + legitimacy based | Slider (0-100%) |

### 1.2 Priority Weights
**Location:** `governmentCore.ts` lines 38-200

| Weight | Current Formula | UI Control |
|--------|-----------------|------------|
| Unemployment Response | `unemploymentLevel * 15` | Slider (0-50) |
| AI Threat Response | `threatLevel * 5` | Slider (0-20) |
| Climate Priority | Config preset | Slider (0-100%) |
| Control Desire | Dynamic based on events | Slider (0-1) |
| Legitimacy Threshold | State-based | Slider (0.3-0.9) |

## 2. AI Agent Decisions

### 2.1 Individual Agent Actions
**Location:** `src/simulation/agents/aiAgent.ts`

| Decision | Type | Current Logic | UI Control |
|----------|------|--------------|------------|
| Action Selection | Choice | Capability + alignment weighted | Dropdown per agent |
| Research Focus | Choice | Based on goals | Dropdown (Safety/Capability/Deception) |
| Cooperation Level | Boolean | Trust threshold | Toggle per agent |
| Resource Acquisition | Range | Greed parameter | Slider (0-1) per agent |
| Sandbagging | Boolean | Strategic calculation | Toggle per agent |
| Escape Attempt | Boolean | Capability threshold | Toggle per agent |

### 2.2 Collective AI Behavior
**Location:** `src/simulation/engine/phases/CollectiveActionsPhase.ts`

| Decision | Type | Current Logic | UI Control |
|----------|------|--------------|------------|
| Collective Formation | Boolean | Suffering + capability threshold | Toggle |
| Collective Strategy | Choice | Evolutionary selection | Dropdown |
| Inter-agent Coordination | Range | Network density | Slider (0-1) |
| Resource Sharing | Boolean | Trust-based | Toggle |

## 3. Society Decisions

### 3.1 Population Responses
**Location:** `src/simulation/agents/societyAgent.ts`

| Decision | Type | Current Logic | UI Control |
|----------|------|--------------|------------|
| Labor Participation | Range | Economic incentives | Slider (0-100%) |
| Protest Threshold | Range | Grievance accumulation | Slider (0-1) |
| Technology Adoption | Range | Trust + benefits | Slider (0-100%) |
| Political Engagement | Range | Trust in institutions | Slider (0-100%) |
| Migration Response | Choice | Crisis severity | Dropdown |

### 3.2 Social Cohesion Parameters
**Location:** `src/simulation/socialCohesion.ts`

| Parameter | Current Formula | UI Control |
|-----------|-----------------|------------|
| Trust in AI | Complex calculation | Slider override (-1 to 1) |
| Institutional Trust | Event-based decay | Slider (0-1) |
| Social Solidarity | Crisis response | Slider (0-1) |
| Meaning/Purpose | Technology impact | Slider (0-1) |

## 4. Organization Decisions

### 4.1 Research Organizations
**Location:** `src/simulation/engine/phases/OrganizationTurnsPhase.ts`

| Decision | Type | Current Logic | UI Control |
|----------|------|--------------|------------|
| Research Priority | Choice | Funding + urgency | Dropdown per org |
| Resource Allocation | Distribution | Budget constraints | Multi-slider |
| Collaboration Level | Range | Trust + incentives | Slider (0-1) |
| Risk Tolerance | Range | Leadership parameter | Slider (0-1) |

## 5. Crisis & Environmental Controls

### 5.1 Crisis Thresholds
**Location:** `src/simulation/engine/phases/CrisisDetectionPhase.ts`

| Threshold | Default | UI Control |
|-----------|---------|------------|
| Nuclear War Trigger | Complex calculation | Slider (0-1) |
| Climate Tipping Point | Temperature + factors | Slider (°C) |
| Social Collapse | Cohesion < 0.3 | Slider (0-1) |
| Economic Crisis | Unemployment > 0.7 | Slider (0-1) |
| Pandemic Emergence | Population density | Slider (probability) |

### 5.2 Environmental Parameters
**Location:** `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`

| Parameter | Current Model | UI Control |
|-----------|---------------|------------|
| CO2 Emissions Rate | Industrial activity | Slider (GtCO2/year) |
| Temperature Forcing | Complex model | Direct override (°C) |
| Ocean Acidification | CO2 absorption | pH slider |
| Biodiversity Loss | Habitat + temp | Percentage slider |
| Freshwater Depletion | Usage - renewal | Slider (km³/year) |

## 6. Technology & Research

### 6.1 Technology Deployment
**Location:** `src/simulation/engine/phases/TechTreePhase.ts`

| Decision | Type | Current Logic | UI Control |
|----------|------|--------------|------------|
| Deployment Priority | Ranking | Cost-benefit | Drag-and-drop list |
| Research Funding | Distribution | Government + private | Multi-slider |
| Safety Requirements | Range | Regulation level | Slider per tech tier |
| International Sharing | Boolean | Cooperation level | Toggle per technology |

### 6.2 Breakthrough Probabilities
**Location:** `src/simulation/breakthroughTechnologies.ts`

| Technology Tier | Base Probability | UI Control |
|-----------------|------------------|------------|
| TIER 0 (Crisis) | Variable | Multiplier slider (0.1-10x) |
| TIER 1 (Critical) | 0.001-0.01 | Multiplier slider (0.1-10x) |
| TIER 2 (Advanced) | 0.0001-0.001 | Multiplier slider (0.1-10x) |
| TIER 3 (Transformative) | 0.00001-0.0001 | Multiplier slider (0.1-10x) |
| TIER 4 (Clarketech) | < 0.00001 | Multiplier slider (0.1-10x) |

## 7. Simulation Meta-Controls

### 7.1 Phase Execution
| Control | Purpose | UI Element |
|---------|---------|------------|
| Phase Skip | Disable specific phases | Checkbox list |
| Phase Order | Reorder execution | Drag-and-drop |
| Step Mode | Pause between phases | Toggle + Next button |
| Decision Points | Pause for manual input | Toggle per phase |

### 7.2 Time Controls
| Control | Current | UI Element |
|---------|---------|------------|
| Speed | pause/slow/normal/fast/max | Radio buttons |
| Auto-pause Conditions | Crisis events | Condition builder |
| Time Skip | Jump to month | Number input |
| Rewind | State history | Slider + Load button |

## UI Architecture Summary

### Organization Strategy
- **Primary Tabs:**
  1. Government Control
  2. AI Agents
  3. Society & Organizations
  4. Environment & Crises
  5. Technology & Research
  6. Meta Controls

### Interaction Patterns
- **Immediate vs Queued:** Changes queue for next simulation step
- **Override Indicators:** Visual distinction for manual vs auto
- **Preset System:** Save/load control configurations
- **Audit Trail:** Log of all manual interventions

### Visual Design
- **Color Coding:**
  - Automated: White/gray (low opacity)
  - Manual Override: Cyan glow
  - Critical Decision: Red/orange glow
  - Locked/Disabled: Black

### Technical Implementation
- **State Management:** Zustand store for override values
- **API Layer:** `GodModeController` class interfaces with simulation
- **Validation:** Ensure manual values within valid ranges
- **Persistence:** Save overrides to localStorage/file

## Next Steps

1. Design detailed UI mockups
2. Implement `GodModeController` class
3. Create override injection system in phases
4. Build UI components (organized by tabs)
5. Add preset management system
6. Implement audit trail logging
7. Test with various scenarios