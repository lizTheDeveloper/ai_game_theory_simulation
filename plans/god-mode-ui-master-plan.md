# God Mode UI - Master Implementation Roadmap

**Created:** October 27, 2025
**Status:** Planning Phase
**Priority:** HIGH - Core UX Enhancement
**Estimated Total:** TBD (requires phase audit)

## Vision

Create a comprehensive "God Mode" UI that exposes ALL automated simulation decisions as manual controls, allowing the user to:
- Override government policy decisions
- Control individual AI agent actions
- Set society priorities and responses
- Adjust organizational strategies
- Intervene in any phase's automated logic
- See what each actor is prioritizing
- Make real-time decisions during simulation

## Scope

**What's Automated Currently:**
- ~37 phases of simulation logic
- Government agent decisions (policy weights, investment priorities)
- AI agent collective actions (20 heterogeneous agents)
- Society agent responses (labor, protest, adaptation)
- Organization strategies (research, deployment, advocacy)
- Crisis detection and response thresholds
- Technology deployment decisions
- Resource allocation across systems

**What God Mode Needs:**
- Manual override for every automated decision
- Visibility into current priorities/weights
- Real-time intervention during simulation steps
- Saved presets for common scenarios
- Decision history/audit trail

## Architecture Questions (Need UX Design)

1. **UI Pattern:** Modal overlay? Sidebar? Dedicated dashboard?
2. **Phase Organization:** Flat list? Grouped by actor? Grouped by system?
3. **Decision Granularity:** Per-phase controls? Per-actor controls? Both?
4. **Simulation Control:** Pause to decide? Queue decisions? Real-time intervention?
5. **Visibility:** Always visible? Toggle on/off? Expert mode?

## Implementation Approach

### Phase 1: Audit & Discovery (CURRENT)
**Goal:** Identify all decision points across 37 phases

**Tasks:**
1. Review each phase in `src/simulation/engine/phases/`
2. Document:
   - What decisions are made
   - Who makes them (government, AI, society, org)
   - Current automation logic
   - Parameters that could be exposed
   - UI control type (slider, button, dropdown, etc.)
3. Create comprehensive inventory
4. Design UI architecture based on findings

**Deliverable:**
- `god-mode-decision-inventory.md` - Full audit of all decision points
- `god-mode-ui-architecture.md` - UI/UX design specifications
- `god-mode-implementation-phases.md` - Phased implementation plan

### Phase 2: Core Infrastructure (TBD)
- Decision override system
- Simulation pause/step controls
- Manual decision API

### Phase 3: Government Controls (TBD)
- Policy weight sliders
- Investment priority controls
- Action selection UI

### Phase 4: AI Agent Controls (TBD)
- Individual agent action selection
- Collective strategy override
- Alignment/resentment manual adjustment

### Phase 5: Society & Organization Controls (TBD)
- Society response controls
- Organization strategy selection
- Population behavior overrides

### Phase 6: System & Crisis Controls (TBD)
- Environmental intervention
- Social cohesion adjustments
- Crisis trigger overrides

### Phase 7: Integration & Polish (TBD)
- Preset scenarios
- Decision history
- Tutorials/help system

## Next Steps

1. **Launch far-future-ux-designer agent** to audit phases and design UI
2. Create decision inventory
3. Design UI architecture
4. Break into implementation phases
5. Prioritize based on highest-value controls

## Success Criteria

- [ ] User can override ANY automated decision
- [ ] Clear visibility into what each actor prioritizes
- [ ] Intuitive organization (not overwhelming)
- [ ] Doesn't break existing simulation logic
- [ ] Can toggle between automated and manual modes
- [ ] Works with existing dashboard architecture

## Open Questions

- Should god mode be a separate route/page or integrated into dashboards?
- How to handle 20 AI agents? Individual controls or collective controls?
- Real-time intervention or pause-decide-resume?
- Should god mode be mutually exclusive with Monte Carlo runs?
- How to persist manual decisions across sessions?

---

**Status:** Ready for agent audit
**Next Agent:** far-future-ux-designer (audit phases + design UI)
