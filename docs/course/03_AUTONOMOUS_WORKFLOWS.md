# Autonomous Workflows

**Worker scripts, channel monitoring, orchestrator patterns**

*This module is under development. Content to be added.*

---

## Topics to Cover

- Autonomous worker script (hourly execution)
- Channel monitor (continuous polling, spawn orchestrator)
- Orchestrator workflow (research → validation → implementation → review)
- Exactly-once spawn guarantee
- Queue drainage semantics
- Merge orchestrator (auto-merge PRs)
- Health monitoring and auto-remediation

---

## Related Modules

- [02_COMMUNICATION_SYSTEMS.md](./02_COMMUNICATION_SYSTEMS.md) - Channel system
- [04_REMOTE_INFRASTRUCTURE.md](./04_REMOTE_INFRASTRUCTURE.md) - Running on VM
- [05_PLANNING_COORDINATION.md](./05_PLANNING_COORDINATION.md) - Roadmap management

---

## Key Files

- `autonomous-worker.sh` - Main worker script
- `scripts/channel-monitor.ts` - Channel monitoring system
- `scripts/merge-orchestrator.sh` - Auto-merge PRs
- `scripts/autonomous-worker-watcher.sh` - Health monitoring

---

*Content to be developed*


