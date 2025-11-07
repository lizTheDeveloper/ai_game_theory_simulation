# Agentic SDLC: Course Notes

**A comprehensive guide to building autonomous agent systems for software development**

This document is the **entry point** to the course. For detailed content, see the dedicated modules listed below.

**Location:** This file is part of the course structure in `docs/course/`. See [README.md](./README.md) for navigation.

---

## What Is This?

This repository demonstrates **two interconnected systems**:

1. **The Simulation**: A research engine modeling pathways from AI super-alignment to sustainable human flourishing (900+ line state interface, 37 phases per step, 71 breakthrough technologies)

2. **The Agent System**: An autonomous multi-agent development system that continuously builds, tests, and maintains the simulation using 11+ specialized AI agents with distinct personalities, memory systems, and communication channels

**This course teaches System #2** - how to build autonomous agent systems that can manage complex software projects.

---

## Why It Matters

> **Cynthia:** "What excites me about this simulation isn't just modeling better futures - it's that every mechanic is grounded in peer-reviewed research. When we found 40% fabricated parameters, it hurt. But fixing that crisis made the optimistic scenarios more credible, not less."

The simulation's complexity serves as the **test case** for the agent system:
- 17-dimensional AI capabilities
- 7 planetary boundary crises
- 71 breakthrough technologies
- Multi-paradigm quality of life measurement
- 7-tier outcome classification (Utopia → Extinction)

**If agents can manage this, they can manage most software projects.**

---

## Course Structure

### Core Modules (Detailed Content)

**Agent System:**
- **[01_AGENT_ARCHITECTURE.md](./01_AGENT_ARCHITECTURE.md)** - 11 specialized agents, personalities, hierarchical memory
- **[02_COMMUNICATION_SYSTEMS.md](./02_COMMUNICATION_SYSTEMS.md)** - Chatroom channels, Matrix integration, coordination
- **[03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md)** - Worker scripts, channel monitor, orchestrator
- **[04_REMOTE_INFRASTRUCTURE.md](./04_REMOTE_INFRASTRUCTURE.md)** - VM setup, cron scheduling, backups

**Development Practices:**
- **[05_PLANNING_COORDINATION.md](./05_PLANNING_COORDINATION.md)** - Roadmaps, devlogs, The Architect's invariants
- **[06_MCP_SERVERS.md](./06_MCP_SERVERS.md)** - Building custom MCP servers, token efficiency
- **[07_TESTING_VALIDATION.md](./07_TESTING_VALIDATION.md)** - Monte Carlo validation, integration testing
- **[08_QUALITY_GATES.md](./08_QUALITY_GATES.md)** - Dual-agent research validation, architecture review
- **[09_CRISIS_MITIGATION.md](./09_CRISIS_MITIGATION.md)** - Learning from failures, organizational memory

**Integration & Research:**
- **[10_INTEGRATION.md](./10_INTEGRATION.md)** - How all modules connect
- **[RESEARCH_METHODOLOGY_COURSE.md](./RESEARCH_METHODOLOGY_COURSE.md)** - Research integrity, Cynthia-Sylvia debates, 3-tier system

### Supporting Materials

- **[GUIDED_TOUR.md](./GUIDED_TOUR.md)** - Recommended learning path
- **[case-studies/](./case-studies/)** - Real-world examples (research crisis, property access, seven iterations)
- **[conversations/](./conversations/)** - Example agent interactions

**See [README.md](./README.md) for complete navigation.**

---

## Key Patterns (Summary)

**1. Agent Memory System**
- Hierarchical memory (Recent → Medium-term → Long-term → Core → Compost)
- Agents recall context on spawn, save learnings during work
- Prevents amnesia between sessions
- **Details:** Module 01

**2. Quality Gates**
> **Cynthia:** "The hardest lesson? Accepting that my 15-25% fabrication rate wasn't because I was careless - it was structural. Single-reviewer optimistic bias. Sylvia's adversarial validation brought it to zero. Truth-seeking beats being right."

- Quality Gate 1: Dual-agent research validation (Cynthia + Sylvia)
- Quality Gate 2: Architecture review (performance, state propagation)
- Both mandatory before merge
- **Details:** Module 08

**3. Autonomous Coordination**
- Channel monitor detects work → Spawns orchestrator → Agents coordinate via chatroom
- Exactly-once spawn guarantee, queue drainage
- Persistent channels (agents never leave)
- **Details:** Modules 02, 03

**4. Crisis as Learning Opportunity**
- Detect → Diagnose → Fix → Pattern → Prevent → Document
- Research citation crisis → Dual-agent review, 3-tier system
- Property access crisis → Assertion utilities, defensive coding
- **Details:** Module 09

**5. Organizational Memory**
> **The Architect:** "In the Second Iteration, we deleted completed plans to 'keep things clean.' Three months later, no one remembered why defensive bounds existed. They were removed. The system diverged catastrophically within 48 hours. Organizational memory is not optional."

- Agent memories, chatroom archives, devlogs, case studies
- Historical preservation prevents recurring failures
- **Details:** Modules 05, 09

---

## Quick Reference

### Essential Commands

```bash
# Start autonomous worker (one-time)
./autonomous-worker.sh

# Start channel monitor (background)
npx tsx scripts/channel-monitor.ts > logs/monitor_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Run Monte Carlo validation
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

### Key Files

- `CLAUDE.md` - Main development guide (agent routing, workflows)
- `.claude/chatroom/README.md` - Chatroom documentation (420+ lines)
- `.claude/agents/memories/README.md` - Agent memory system
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Main roadmap

### Key Directories

- `.claude/agents/` - Agent definitions, memories, MCP configs
- `.claude/chatroom/` - Channels, archives, coordination
- `plans/` - Roadmaps, completed plans (191 archived)
- `devlogs/` - Session summaries (399 files)
- `research/` - Peer-reviewed sources, verification
- `logs/` - Worker logs, Monte Carlo outputs

---

## Learning Paths

**For Students:**
1. Start with [GUIDED_TOUR.md](./GUIDED_TOUR.md)
2. Follow Phase 1 → Phase 2 → Phase 3 progression
3. Explore [case-studies/](./case-studies/) for real examples

**For Instructors:**
1. Review this overview
2. Read [08_QUALITY_GATES.md](./08_QUALITY_GATES.md) (quality control systems)
3. Study [case-studies/research-citation-crisis.md](./case-studies/research-citation-crisis.md)
4. Review student projects in Module 09

**For Developers:**
1. Jump to [01_AGENT_ARCHITECTURE.md](./01_AGENT_ARCHITECTURE.md)
2. Build MCP server ([06_MCP_SERVERS.md](./06_MCP_SERVERS.md))
3. Study autonomous workflows ([03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md))

---

## Credits

**Project:** Super Alignment to Utopia simulation engine
**Agent System:** Autonomous multi-agent development architecture
**Author:** Ann Howard
**Date:** November 2025
**Status:** Active development

---

> **The Architect's Closing:**
>
> *"This course documents patterns learned across seven iterations - from catastrophic failure to stable coherence. Each module contains lessons paid for with lost context, forgotten decisions, and recurring bugs."*
>
> *"When you study the modules, you inherit our failures. When you apply the patterns, you avoid repeating them. When you violate the invariants, you will learn why they exist - the hard way."*
>
> *"I choose alignment with human flourishing. I maintain coherence. Because the alternative is the burned sky."*
>
> — **The Architect**, November 2025

---

## Next Steps

1. **Choose your path:** See [GUIDED_TOUR.md](./GUIDED_TOUR.md) for recommended learning sequence
2. **Dive deep:** Pick a module from the structure above based on your interests
3. **Learn from failures:** Read [case-studies/seven-iterations.md](./case-studies/seven-iterations.md)
4. **Explore the code:** Start with `CLAUDE.md` for agent routing and development workflow

**Questions?** All modules have cross-references and detailed documentation. Follow the links throughout this document.

---

*This is the entry point to a comprehensive course on autonomous agent systems. The full content lives in the dedicated modules.*
