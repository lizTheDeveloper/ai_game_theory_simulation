# Module 04: Remote Infrastructure

**VM setup, cron orchestration, autonomous operations at scale**

---

## Learning Objectives

After completing this module, you will be able to:
1. Explain why autonomous agents need remote infrastructure (not just local development)
2. Distinguish between the two infrastructures: Autonomous Worker VM vs Dashboard Cloud Run
3. Set up and configure a GCP VM for autonomous agent operations
4. Design cron schedules that avoid race conditions and resource contention
5. Monitor and troubleshoot autonomous systems running on remote infrastructure
6. Estimate and optimize cloud infrastructure costs for educational deployments

**Self-check:** You'll know you understand this when you can explain to a peer why the cron jobs run at :00/:15/:30/:45 specifically, and what would break if you changed the timing.

---

## 00 - The Big Picture: Why Remote Infrastructure?

### The Problem

Autonomous agents are powerful, but running them locally has limitations:

**Local Development Challenges:**
- Your laptop sleeps → agents stop working
- Internet drops → coordination breaks
- You need your machine for other work → can't run long autonomous sessions
- No persistent logs → hard to debug what happened overnight
- Single point of failure → if your machine crashes, everything stops

**What We Need:**
- **24/7 availability** - Agents work even when you're asleep
- **Persistent execution** - Tasks complete even if they take hours
- **Coordinated scheduling** - Multiple agents run in sequence without conflicts
- **Centralized logging** - All activity tracked in one place
- **Automatic recovery** - System self-heals when issues occur

### The Solution: Remote Infrastructure

This project uses **two separate infrastructures** for different purposes:

```
┌─────────────────────────────────────────────────────────┐
│                   Remote Infrastructure                  │
│                                                           │
│  ┌───────────────────────┐  ┌──────────────────────┐   │
│  │ Autonomous Worker VM  │  │ Dashboard Cloud Run  │   │
│  │ (Development work)    │  │ (Student interface)  │   │
│  │                       │  │                      │   │
│  │ • Cron: 4 jobs/hour   │  │ • Next.js dashboard │   │
│  │ • Agents: Worker,     │  │ • Serverless        │   │
│  │   Researcher, Watcher │  │ • Auto-scaling      │   │
│  │ • Logs: GCS backup    │  │ • Public URL        │   │
│  │ • GitHub integration  │  │                      │   │
│  └───────────────────────┘  └──────────────────────┘   │
│           ↓                            ↓                 │
│     Implementation work          Students explore        │
└─────────────────────────────────────────────────────────┘
```

**Key Insight:** These are SEPARATE systems. The autonomous worker VM doesn't serve web pages. The dashboard doesn't run cron jobs. They have different purposes, different architectures, different cost models.

---

## 01 - Architecture Overview

### Infrastructure #1: Autonomous Worker VM

**Purpose:** Run autonomous agents 24/7 to implement roadmap items, research updates, and quality gates.

**Key Components:**
- **GCP Compute Engine VM** (e2-medium, 2 vCPU, 4GB RAM)
- **4 cron jobs** running hourly in coordinated sequence
- **Claude Code CLI** for agent execution
- **Git integration** for automated commits/PRs
- **GCS backup** for log retention

**Agents Running:**
- `autonomous-worker.sh` - Implementation work (45min timeout)
- `researcher-worker.sh` - Research updates (30min timeout)
- `autonomous-worker-watcher.sh` - Health monitoring (15min timeout)
- `merge-orchestrator.sh` - Branch processing (15min timeout)

**Cost:** ~$35-50/month (VM + storage)

### Infrastructure #2: Dashboard Cloud Run

**Purpose:** Serve the Next.js simulation dashboard to students for exploration and learning.

**Key Components:**
- **GCP Cloud Run** (serverless, auto-scaling)
- **Container deployment** (Next.js app)
- **Public URL** for student access
- **Scale-to-zero** when idle (cost optimization)

**Cost:** $10-25/month for typical classroom use (20-30 students, 2-4 hours/week)

### Why Two Separate Infrastructures?

**Different Workloads:**
- Autonomous worker: Long-running, CPU-intensive, predictable schedule
- Dashboard: Short-lived requests, user-driven, unpredictable traffic

**Different Cost Models:**
- VM: Fixed monthly cost, always available
- Cloud Run: Pay-per-request, free when idle

**Different Failure Modes:**
- VM failure → Development work stops (alerting needed)
- Cloud Run failure → Students can't access dashboard (less critical)

**This module focuses on Infrastructure #1** (Autonomous Worker VM) because that's where the interesting coordination challenges live. Dashboard deployment is simpler (see `deploy-gcp.sh`).

---

## 02 - Autonomous Worker VM

### 2.1 - VM Setup

**Initial Deployment:**

```bash
# On your local machine:
# 1. Create GCP VM (manual via console or gcloud CLI)
gcloud compute instances create autonomous-worker \\
  --machine-type=e2-medium \\
  --zone=us-central1-a \\
  --image-family=ubuntu-2204-lts \\
  --image-project=ubuntu-os-cloud \\
  --boot-disk-size=50GB

# 2. SSH into VM
gcloud compute ssh autonomous-worker --zone=us-central1-a

# 3. Clone repository
git clone https://github.com/yourusername/superalignmenttoutopia.git
cd superalignmenttoutopia

# 4. Run installation script
./install-remote.sh
```

**What `install-remote.sh` Does:**

```bash
# System packages
apt-get update && apt-get upgrade    # OS updates
apt-get install nodejs git python3.11 # Languages

# Development tools
npm install -g @anthropic-ai/claude-code  # Claude CLI
python3.11 -m venv .venv               # Python venv
pip install numpy faiss-cpu anthropic  # Python deps

# Project dependencies
npm install                            # Node packages
npm run build                          # TypeScript compile

# MCP configuration
bash setup-mcp-config.sh              # Generate MCP configs
```

**Time to complete:** ~10-15 minutes (mostly downloading packages)

**Why these specific versions?**
- **Node.js LTS:** Stability over cutting-edge features
- **Python 3.11:** Balance of modern features + library compatibility
- **Claude Code latest:** Always update to latest (auto-update in cron)

### 2.2 - Cron Orchestration

**The Heart of the System:** 4 jobs running every hour in coordinated sequence.

```cron
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Autonomous Worker System - Hourly Orchestration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# :00 - Autonomous worker (implementation)
0 * * * * cd ~/ai_game_theory_simulation && ./autonomous-worker.sh

# :15 - Health watcher (monitoring)
15 * * * * cd ~/ai_game_theory_simulation && ./scripts/autonomous-worker-watcher.sh

# :30 - Research worker (research updates)
30 * * * * cd ~/ai_game_theory_simulation && ./researcher-worker.sh

# :45 - Merge orchestrator (branch processing)
45 * * * * cd ~/ai_game_theory_simulation && ./scripts/merge-orchestrator.sh
```

### 2.3 - Timing Rationale (The "Why" Behind the Schedule)

**Why :00 for Autonomous Worker?**
- Top of hour = predictable, easy to reason about
- Aligns with human mental models ("it runs every hour")
- Full 45 minutes before watcher checks (enough time to complete OR timeout)

**Why :15 for Watcher?**
- Runs 15 minutes after worker starts
- Worker either (a) completed successfully, (b) still running normally, or (c) hung/crashed
- 90-minute check window catches previous hour's run too
- Auto-remediation has time to fix issues before next worker run

**Why :30 for Research Worker?**
- Halfway between worker cycles (avoids resource contention)
- Research is less intensive than implementation (30min timeout vs 45min)
- Can run in parallel with merge orchestrator prep work
- Research updates don't block implementation progress

**Why :45 for Merge Orchestrator?**
- Runs 45 minutes after worker started (enough time for worker to push branch)
- 15 minutes before next worker cycle (enough time to merge and clean up)
- Processes both worker and researcher branches in one run
- Quality gates (type check, tests, architecture review) run here

**What Would Break If We Changed This?**

**❌ Bad Idea #1:** Run everything at :00
- Resource contention (all 4 agents fighting for CPU)
- Git lock conflicts (multiple agents pushing simultaneously)
- Can't monitor worker if watcher runs at same time

**❌ Bad Idea #2:** Run watcher at :55 (right before next worker)
- No time to remediate issues before next cycle
- Issues compound across cycles
- Death spiral: worker fails → watcher too late → next worker also fails

**❌ Bad Idea #3:** Run merge orchestrator at :05 (5 minutes after worker)
- Worker likely still running (45min timeout)
- No branch to merge yet
- Wastes a cycle

**✅ Current Schedule:** Designed for non-overlapping execution with buffer time for recovery.

### 2.4 - Worker Lifecycle (What Happens During a Run)

**Autonomous Worker (:00 - :45):**

```
1. Pre-flight checks (3-5 minutes)
   ├── Pull latest from GitHub
   ├── Update Claude Code to latest version
   ├── Check monitor process is running
   ├── Verify API key present
   └── Lock file prevents concurrent runs

2. Task selection (1-2 minutes)
   ├── Post research requests to research channel (STEP 0)
   ├── Scan roadmap for CRITICAL/HIGH items
   ├── Check for code review tasks
   └── Fall back to documentation if no priorities

3. Claude Code execution (5-40 minutes)
   ├── Spawn Claude with task prompt
   ├── 45-minute timeout (2700s)
   ├── If timeout: spawn 5-minute cleanup session
   └── Stream logs to logs/autonomous/worker_TIMESTAMP.log

4. Post-execution (2-5 minutes)
   ├── Commit changes to feature branch
   ├── Push branch to GitHub
   ├── Create pull request (if branch pushed)
   ├── Create GitHub issue if execution failed
   └── Backup logs to GCS

5. Cleanup
   ├── Release lock file
   ├── Exit (cron will run again in 1 hour)
   └── Watcher will check health at :15
```

**Research Worker (:30 - :60):**

Similar lifecycle, but:
- Monitors Matrix `research` channel for questions from Sylvia/Cynthia
- Updates 1-3 research files with 2024-2025 sources
- Runs research age audit (prioritizes CRITICAL/HIGH outdated papers)
- 30-minute timeout (less intensive than implementation)

**Health Watcher (:15 - :30):**

```
1. Check recent activity (last 90 minutes)
   ├── Worker logs exist?
   ├── Researcher logs exist?
   ├── Merge orchestrator logs exist?
   └── All processes completed successfully?

2. If issues detected:
   ├── Spawn Claude Code for diagnosis
   ├── Attempt auto-remediation
   ├── Split large tasks if timeout detected
   ├── Alert if remediation fails
   └── Log remediation attempt

3. Report status
   ├── "All systems operational" (normal)
   ├── "Auto-remediated X issues" (fixed)
   └── "Manual intervention needed" (alert)
```

**Merge Orchestrator (:45 - :00):**

```
1. Discover branches (30 seconds)
   ├── List auto/* branches from worker/researcher
   ├── Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
   ├── Limit to 10 branches per run
   └── Skip frontend branches on VM (no npm run dev)

2. Quality gates for each branch (5-10 min/branch)
   ├── Type check (tsc --noEmit)
   ├── Run tests (npm test)
   ├── Architecture review (spawn architecture-skeptic)
   ├── Block if CRITICAL issues found
   └── Log review to logs/merge_orchestrator/

3. Merge if passing (1-2 min/branch)
   ├── Merge to main via GitHub API
   ├── Delete feature branch
   ├── Update metrics
   └── Continue to next branch

4. Report
   ├── Branches merged: X
   ├── Branches blocked: Y
   └── Next cycle: Z branches pending
```

---

## 03 - Dashboard Deployment (Cloud Run)

**Quick Overview:** This is the simpler infrastructure. Students access the simulation dashboard here.

**Deployment:**

```bash
# On your local machine:
./deploy-gcp.sh
```

**What It Does:**

1. Checks gcloud CLI installed
2. Prompts for GCP project ID
3. Enables Cloud Run API
4. Builds Docker container (automatic from Dockerfile or source)
5. Deploys to Cloud Run (Belgium region - 100% renewable energy)
6. Returns public URL for student access

**Configuration:**
- **Region:** europe-west1 (Belgium - 100% wind/solar renewable energy)
- **Memory:** 2GB (enough for Next.js SSR)
- **CPU:** 1 vCPU (sufficient for typical classroom load)
- **Scaling:** 0-10 instances (scale to zero when idle)
- **Timeout:** 300s (5 minutes for long-running simulation requests)

**Cost Optimization:**
- `min-instances: 0` → Scale to zero when no traffic (free when idle)
- `max-instances: 10` → Cap maximum cost per month
- Pay-per-request pricing → Only charged when students use it

**Why Belgium?**
- 100% renewable energy (wind + solar)
- Low latency for European students
- Aligned with project values (sustainability focus)

**Alternative Regions:**
- `us-west1` (Oregon) - 100% renewable energy
- `europe-north1` (Finland) - 100% carbon-neutral (hydroelectric)

---

## 04 - Monitoring & Health

### How to Know It's Working

**Healthy System Indicators:**

```bash
# 1. Worker runs regularly
ls -lt logs/autonomous/worker_*.log | head -3
# Should show 3 recent runs (~1 hour apart)

# 2. Watcher reports operational
tail -50 logs/worker_watcher/watcher_LATEST.log | grep "operational"
# Should see "All systems operational"

# 3. Merge orchestrator processing branches
tail -50 logs/merge_orchestrator/merge_orchestrator_LATEST.log | grep "Merged"
# Should see successful merges

# 4. Git activity
git log --since="24 hours ago" --oneline | head -10
# Should see automated commits from autonomous agents
```

**Key Metrics:**

| Metric | Healthy Range | Action If Outside Range |
|--------|--------------|------------------------|
| Worker runs/day | 24 | Check cron: `crontab -l` |
| Worker success rate | >80% | Check logs for patterns |
| Watcher remediations/day | 0-2 | Investigate if >2 |
| Merge orchestrator branches/day | 10-20 | Normal, adjust max if needed |
| Pending branches | <30 | Review queue, bulk-merge if needed |

### Monitoring Commands

```bash
# Check cron is running
sudo service cron status

# View crontab
crontab -l

# Check recent worker runs
ls -lt logs/autonomous/ | head -20

# Check for errors
grep -i "error\|failed\|timeout" logs/autonomous/*.log | tail -20

# Check system resources
top  # CPU/memory usage
df -h  # Disk space
```

### Log Structure

```
logs/
├── autonomous/
│   ├── worker_20251107_100000.log      # Implementation run
│   ├── worker_20251107_110000.log
│   └── status_current.txt               # Latest status
├── autonomous/researcher/
│   ├── researcher_20251107_103000.log  # Research run
│   └── researcher_20251107_113000.log
├── worker_watcher/
│   ├── watcher_20251107_101500.log     # Health check
│   └── watcher_20251107_111500.log
├── merge_orchestrator/
│   ├── merge_orchestrator_20251107_104500.log
│   └── architecture_review_20251107_104532.txt
├── cron_worker.log                      # Cron stdout/stderr
├── cron_researcher.log
├── cron_watcher.log
└── cron_merge.log
```

**Log Retention:**
- Local: 7 days uncompressed, 30 days compressed, then deleted
- GCS: All logs backed up to `gs://multiverseschool-logs/archives/` (retained indefinitely)

---

## 05 - Troubleshooting

### Common Issues & Solutions

**Issue 1: Worker Not Running**

```bash
# Symptom: No recent worker logs
ls -lt logs/autonomous/ | head -3
# Last run was >2 hours ago

# Diagnosis:
sudo service cron status  # Is cron running?
crontab -l               # Is crontab configured?
tail -50 logs/cron_worker.log  # Any error messages?

# Solution:
sudo service cron start  # Start cron if stopped
crontab -e               # Re-add cron jobs if missing
# Paste from scripts/CRON_SETUP.md
```

**Issue 2: Worker Timing Out Repeatedly**

```bash
# Symptom: Multiple timeout entries in logs
grep "timeout" logs/autonomous/*.log

# Diagnosis:
# Worker timeout = 45 minutes
# If tasks consistently exceed this, they're too large

# Solution:
# Watcher should auto-split large tasks
# Check watcher logs:
tail -100 logs/worker_watcher/watcher_*.log | grep "splitting"

# If watcher not auto-splitting, trigger manually:
./scripts/autonomous-worker-watcher.sh
```

**Issue 3: Merge Orchestrator Blocking All Branches**

```bash
# Symptom: Many branches, none merging
git branch -r | grep auto/ | wc -l
# Shows >30 pending branches

# Diagnosis:
tail -100 logs/merge_orchestrator/*.log | grep "BLOCKED"
# Check why branches are blocked

# Common causes:
# 1. Type errors → Fix in main branch
# 2. Test failures → Fix tests or implementation
# 3. Architecture review failures → Address CRITICAL issues

# Solution:
# Fix root cause in main branch
# Then branches will pass on next merge attempt
```

**Issue 4: Disk Space Full**

```bash
# Symptom:
df -h
# Shows /dev/sda1 at 95%+

# Diagnosis:
du -sh logs/* | sort -h
# Identifies large log directories

# Solution:
# Run cleanup script:
./scripts/cleanup-and-backup.sh
# Compresses >7 day logs, deletes >30 day logs
# Backs up to GCS before deletion
```

**Issue 5: API Rate Limiting**

```bash
# Symptom: Worker logs show 429 errors
grep "429\|rate limit" logs/autonomous/*.log

# Diagnosis:
# Anthropic API rate limits:
# - Claude 3.5 Sonnet: 50 requests/minute
# - Worker runs hourly, so should never hit this
# - Unless multiple concurrent sessions

# Solution:
# Check for hung processes:
ps aux | grep "claude\|autonomous"
# Kill any old processes:
kill -9 <PID>
```

---

## 06 - Cost & Sustainability

### GCP Billing Breakdown

**Autonomous Worker VM:**
- **Compute:** e2-medium (2 vCPU, 4GB RAM) = ~$30/month
- **Storage:** 50GB boot disk = ~$8/month
- **Egress:** Minimal (mostly git push) = ~$2/month
- **Total:** ~$40/month (fixed cost)

**Dashboard Cloud Run:**
- **Compute:** Pay-per-request, scale-to-zero = $10-25/month
- **Cold starts:** Free tier covers most classroom use
- **Bandwidth:** Included in compute cost
- **Total:** $10-25/month (variable, depends on student traffic)

**GCS Log Backup:**
- **Storage:** ~1GB/week = ~$0.50/month
- **Retrieval:** Rare, negligible cost
- **Total:** <$1/month

**Combined Monthly Cost:** $50-65 for autonomous development + student dashboard

### Cost Optimization Strategies

**1. Scale to Zero When Possible**
```bash
# Dashboard: Already configured
min-instances: 0  # Free when no students using it

# Worker VM: Can't scale to zero (needs to run cron)
# But can stop manually during breaks:
gcloud compute instances stop autonomous-worker --zone=us-central1-a
# Restart when needed:
gcloud compute instances start autonomous-worker --zone=us-central1-a
```

**2. Budget Alerts**
```bash
# Set up alert at 50% and 90% of budget
gcloud billing budgets create \\
  --billing-account YOUR_BILLING_ACCOUNT_ID \\
  --display-name 'Autonomous System Budget' \\
  --budget-amount 100 \\
  --threshold-rule percent=50 \\
  --threshold-rule percent=90
```

**3. Right-Sizing**
```bash
# Monitor actual resource usage:
# If consistently <50% CPU, downgrade to e2-small:
gcloud compute instances set-machine-type autonomous-worker \\
  --machine-type=e2-small \\
  --zone=us-central1-a
# Saves ~$15/month
```

### Sustainability Considerations

**Region Selection Matters:**

| Region | Carbon Impact | Latency (US) | Latency (EU) |
|--------|--------------|--------------|--------------|
| europe-west1 (Belgium) | 100% renewable (wind/solar) | ~150ms | ~20ms |
| us-west1 (Oregon) | 100% renewable (wind/hydro) | ~50ms | ~200ms |
| europe-north1 (Finland) | 100% carbon-neutral (hydro) | ~180ms | ~40ms |
| us-central1 (Iowa) | ~75% renewable (mix) | ~30ms | ~150ms |

**Recommendation:** Choose based on your primary user base geography. If students are global, Belgium is a good compromise (EU-based, 100% renewable, central location).

**Why This Matters:**
- Data centers consume 1% of global electricity
- Running code on renewable energy reduces project carbon footprint
- Models sustainable computing practices for students
- Aligns with simulation's environmental focus

---

## 07 - Exercises

### Exercise 1: Deploy Your Own Autonomous Worker

**Objective:** Set up a GCP VM and configure the 4-job cron schedule.

**Steps:**
1. Create GCP VM (follow Section 2.1)
2. Run `install-remote.sh`
3. Configure cron jobs (use `scripts/CRON_SETUP.md`)
4. Test each worker manually before enabling cron
5. Monitor first 3 hours of autonomous operation

**Success Criteria:**
- [ ] All 4 cron jobs run successfully
- [ ] Worker creates a feature branch and PR
- [ ] Watcher reports "All systems operational"
- [ ] Merge orchestrator processes at least 1 branch

**Time:** 2-3 hours (mostly waiting for installs)

### Exercise 2: Analyze Timing Trade-offs

**Objective:** Understand why the current schedule works and what would break if changed.

**Scenario:** Your team wants to run workers every 30 minutes instead of hourly (double throughput).

**Tasks:**
1. Calculate new schedule timings
2. Identify resource contention points
3. Estimate increased costs
4. Predict failure modes
5. Recommend: Should we do it? Why/why not?

**Deliverable:** 1-page analysis with recommendation

### Exercise 3: Cost Optimization Challenge

**Objective:** Reduce monthly costs by 30% without reducing functionality.

**Current Baseline:** $60/month

**Constraints:**
- Must still run 24/7
- Must process same number of branches
- Can't reduce quality gates

**Allowed Changes:**
- VM size
- Region selection
- Log retention policy
- Dashboard scaling settings

**Deliverable:** Optimized configuration + cost breakdown

### Exercise 4: Design a 5-Job Schedule

**Objective:** Add a 5th cron job (data analysis worker) without breaking existing coordination.

**Requirements:**
- New job analyzes Monte Carlo results from simulation runs
- Needs access to filesystem (simulation output)
- Takes 10-15 minutes to run
- Should run after implementation worker completes

**Tasks:**
1. Choose timing (what minute past the hour?)
2. Explain why this timing works
3. Identify what would break if you chose wrong
4. Update `CRON_SETUP.md` with new job

**Success Criteria:**
- No resource contention with existing jobs
- Enough time to complete before next cycle
- Clear rationale for timing choice

---

## Key Takeaways

### Mental Models to Internalize

**1. Cron Jobs Are a Choreographed Dance**
- Each job has a specific time and duration
- Jobs must not overlap (resource contention)
- Buffer time needed for cleanup and recovery
- The schedule is a SYSTEM, not individual jobs

**2. Two Infrastructures, Two Purposes**
- Autonomous Worker VM = Development work (predictable, intensive)
- Dashboard Cloud Run = Student access (unpredictable, lightweight)
- Don't conflate them - they have different cost/scaling/reliability models

**3. Logs Are Your Time Machine**
- Complete audit trail in GCS
- Can reconstruct any autonomous decision
- Debugging requires looking at logs across multiple jobs
- Log retention policy balances cost vs forensics

**4. Health Monitoring Is Self-Healing**
- Watcher doesn't just alert - it fixes
- Auto-remediation prevents death spirals
- System designed to recover without human intervention
- Manual intervention only for persistent issues

**5. Sustainability Isn't Just Ethical - It's Architectural**
- Region selection affects carbon footprint
- Right-sizing reduces waste
- Scale-to-zero when possible
- Teaching students sustainable computing practices

### You're Ready When...

You can answer these questions without looking:

1. Why does the watcher run at :15 instead of :05 or :55?
2. What happens if two cron jobs try to git push simultaneously?
3. How much would it cost to run this system for a semester (16 weeks)?
4. Where do logs go after 30 days, and why?
5. If the worker times out, what prevents partial work from being lost?

---

## Related Modules

- **[03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md)** - What the workers actually DO
- **[05_PLANNING_COORDINATION.md](./05_PLANNING_COORDINATION.md)** - How roadmap drives worker tasks
- **[07_TESTING_VALIDATION.md](./07_TESTING_VALIDATION.md)** - Quality gates in merge orchestrator
- **[09_CRISIS_MITIGATION.md](./09_CRISIS_MITIGATION.md)** - What to do when it breaks

---

## Additional Resources

### Reference Documentation

- **[AUTONOMOUS_SETUP.md](/docs/AUTONOMOUS_SETUP.md)** - Complete setup guide (200+ lines)
- **[CRON_SETUP.md](/scripts/CRON_SETUP.md)** - Cron configuration reference (234 lines)
- **[deploy-gcp.sh](/deploy-gcp.sh)** - Cloud Run deployment script
- **[install-remote.sh](/install-remote.sh)** - VM setup script

### External Resources

- **GCP Documentation:**
  - [Compute Engine Pricing](https://cloud.google.com/compute/pricing)
  - [Cloud Run Pricing](https://cloud.google.com/run/pricing)
  - [Sustainable Regions](https://cloud.google.com/sustainability/region-carbon)

- **Cron Resources:**
  - [Crontab Guru](https://crontab.guru/) - Cron schedule expression tester
  - [Cron Best Practices](https://www.redhat.com/sysadmin/automate-linux-tasks-cron)

### Going Deeper

Want to understand more about autonomous infrastructure?

- Read logs from a full day of operations (`logs/autonomous/`)
- Trace a feature from roadmap → worker → PR → merge
- Analyze actual costs from GCP billing console
- Experiment with different cron timings in a test environment

---

**Module Status:** ✅ Complete (drafted 2025-11-07 by Paulo, Educational Architect)

**Feedback welcome** in documentation channel or via course issues.
