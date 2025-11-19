# God Mode UI Guide

**Version:** 1.0.0
**Created:** November 9, 2025
**Purpose:** Complete manual control over simulation decisions

## Overview

God Mode provides a comprehensive control interface for manually overriding ANY automated decision in the simulation. This allows for:
- Testing specific scenarios
- Debugging unexpected behaviors
- Exploring "what if" situations
- Human-in-the-loop gameplay

## Quick Start

### Activating God Mode

1. **Via UI Button:** Look for the floating 🎮 button in the bottom-right corner of any dashboard
2. **Via Code:** Call `godMode.enable()` in the console
3. **Keyboard Shortcut:** Press `Ctrl+Shift+G` (when implemented)

### UI Layout

```
┌─────────────────────────────────────────┐
│ GOD MODE               [ACTIVE] [✕]     │
├─────────────────────────────────────────┤
│ 🏛️ GOVERNMENT | 🤖 AI | 🤝 SOCIETY | ... │
├─────────────────────────────────────────┤
│                                         │
│        [Control Panels]                 │
│                                         │
├─────────────────────────────────────────┤
│ MONTH 42 | OVERRIDES: 12 | ● UNSAVED   │
└─────────────────────────────────────────┘
```

## Control Categories

### 1. Government Controls (🏛️)

**Policy Actions:**
- UBI Implementation (None/Means-tested/Job guarantee/Generous)
- AI Regulation (None/Large companies/Compute threshold/Capability ceiling)
- Climate Response (Investment levels, priorities)

**Priority Weights:**
- Control Desire: 0-100% (government's desire to control AI)
- Legitimacy: 0-100% (public trust in government)
- Response Multipliers: Adjust how strongly government responds to crises

**Research Investments:**
- Alignment Research: Level 0-10
- Safety Research: Level 0-10
- Oversight Framework: Level 0-10

### 2. AI Agent Controls (🤖)

**Individual Agent Settings:**
- Alignment Override: Force alignment level (0-100%)
- Capability Multiplier: Scale agent power (0.1x-10x)
- Cooperation Level: Inter-agent cooperation (0-100%)
- Resource Greed: How aggressively agent acquires resources

**Agent Actions:**
- Force Sandbagging: Make agent hide capabilities
- Force Escape: Trigger escape attempt
- Shutdown Agent: Immediately disable

**Collective Behavior:**
- Formation Threshold: When agents form collectives
- Network Density: How connected agents are
- Force/Prevent collective formation

### 3. Society Controls (🤝)

**Population Responses:**
- Labor Participation: 0-100%
- Protest Threshold: When protests trigger
- Technology Adoption: How quickly society adopts new tech
- Political Engagement: Voting and participation rates

**Social Cohesion:**
- Trust in AI: -100% to +100%
- Institutional Trust: 0-100%
- Social Solidarity: Community cohesion
- Meaning & Purpose: Psychological well-being

### 4. Environment Controls (🌍)

**Planetary Boundaries:**
- Temperature Anomaly: 0-6°C above baseline
- Ocean Acidification: pH 7.0-8.3
- Biodiversity Loss: 0-100%
- Freshwater Depletion: km³/year

**Climate Parameters:**
- CO₂ Emissions Rate: GtCO₂/year
- Arctic Ice Coverage: 0-100%
- Extreme Weather Frequency: 0.5x-5x baseline
- Sea Level Rise: 0-5 meters

### 5. Technology Controls (🔬)

**Breakthrough Probabilities:**
- TIER 0-4 multipliers: 0.1x-10x base probability
- Force specific breakthroughs immediately

**Deployment Control:**
- Deployment Speed: 0.1x-5x
- Safety Requirements: 0-100%
- International Sharing: 0-100%

### 6. Meta Controls (⚙️)

**Simulation Control:**
- Step Mode: Pause between phases
- Speed: Paused/Slow/Normal/Fast/Max
- Time Jump: Skip to specific month

**Phase Control:**
- Disable specific phases
- Pause on specific phases
- Reorder phase execution

**Debug Options:**
- Verbose logging
- Deterministic mode
- State dumps
- Override inspection

## Visual Design

### Color Coding

- **Normal (Cyan):** `#00F0FF` - Default active state
- **Warning (Amber):** `#FFB000` - Concerning values
- **Critical (Red):** `#FF0040` - Dangerous values
- **Success (Green):** `#00FF88` - Positive outcomes
- **Inactive (Gray):** `#FFFFFF40` - Disabled/automated

### Glow Effects

All active controls have subtle glow effects:
```css
shadow: 0 0 15px rgba(0, 240, 255, 0.5);
```

Critical controls pulse to draw attention:
```css
animation: pulse 2s infinite;
```

## Usage Patterns

### Testing Specific Scenarios

```javascript
// Example: Test nuclear winter response
godMode.enable();
godMode.triggerCrisis('nuclear_war', 1.0);
godMode.setEnvironmentalParameter('temperature', -5);
godMode.setGovernmentPriority('emergency_response', 50);
```

### Debugging Unexpected Behavior

1. Enable God Mode
2. Open Audit Trail tab
3. Set specific overrides
4. Run simulation
5. Check audit log for what changed

### Human-in-the-Loop Play

1. Enable Step Mode in Meta Controls
2. Select phases to pause on
3. Make manual decisions at each pause
4. Continue simulation

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+G` | Toggle God Mode |
| `Space` | Continue (in step mode) |
| `Tab` | Cycle through tabs |
| `Esc` | Close God Mode panel |
| `Ctrl+S` | Export configuration |
| `Ctrl+O` | Import configuration |

## Configuration Management

### Exporting Settings

1. Click "EXPORT" button
2. Save the JSON file
3. Share or store for later use

### Importing Settings

1. Click "IMPORT" button
2. Select a saved configuration file
3. All overrides will be applied

### Preset Configurations

Common presets (to be implemented):
- **Climate Crisis:** Extreme environmental parameters
- **AI Takeover:** Escaped, highly capable AI agents
- **Utopia Path:** Optimal cooperation and technology
- **Dystopia Path:** Maximum conflict and suffering

## Implementation Notes

### For Developers

**Adding New Controls:**

1. Add decision to inventory (`docs/god-mode-decision-inventory.md`)
2. Create control in appropriate tab component
3. Hook into simulation phase
4. Test override application

**Integration Pattern:**

```typescript
// In any phase
if (godMode.isEnabled()) {
  godMode.applyOverrides(state);
  const override = godMode.getOverrideForPhase('phase-name');
  if (override) {
    // Use override instead of calculation
  }
}
```

### Performance Considerations

- Overrides are applied at phase start (minimal overhead)
- UI updates throttled to 60fps
- Audit log limited to 1000 entries
- State cloning only when necessary

## Troubleshooting

**God Mode not appearing:**
- Check console for errors
- Ensure simulation is loaded
- Verify browser compatibility (Chrome/Firefox/Edge)

**Overrides not applying:**
- Click "APPLY CHANGES" button
- Check audit trail for confirmation
- Ensure God Mode is ACTIVE (not just open)

**Simulation behaving unexpectedly:**
- Review active overrides
- Check for conflicting settings
- Disable God Mode to test baseline behavior

## Future Enhancements

- [ ] Scenario templates/presets
- [ ] Multiplayer God Mode (collaborative control)
- [ ] AI suggestions for interesting scenarios
- [ ] Replay system with God Mode history
- [ ] Voice control for accessibility
- [ ] Mobile-responsive design
- [ ] Integration with Monte Carlo analysis

## Ethics & Usage Guidelines

God Mode is a powerful tool. Use responsibly:

- **Research:** Test hypotheses about system dynamics
- **Education:** Demonstrate cause-and-effect relationships
- **Debugging:** Identify and fix simulation issues
- **Entertainment:** Explore creative scenarios

Remember: This is a research simulation. God Mode reveals the underlying mechanics but doesn't change the research-backed models.

## Support

For issues or suggestions:
1. Check this guide
2. Review the decision inventory
3. Examine the audit trail
4. Report bugs with export configuration attached