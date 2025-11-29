# Agent Guide: Unified Roadmap System

**For all agents across all projects**

## Overview

All projects now use a standardized ROADMAP.md format that enables:
- Simple markdown checkboxes for work items
- Automatic routing to the right agent based on task type
- Cross-project learning and pattern sharing
- Queue-and-drain architecture via NATS

## Roadmap Format

### Simple Structure

```markdown
# Project Roadmap

## CRITICAL
- [ ] Fix production authentication bypass
- [ ] Resolve database connection pool exhaustion

## HIGH
- [ ] Implement password reset flow
- [ ] Add E2E tests for checkout process

## MEDIUM
- [ ] Improve dashboard load time
- [ ] Add user activity analytics

## LOW
- [ ] Refactor legacy payment code
- [ ] Update documentation
```

### Priority Levels

- `CRITICAL` / `P0` / `URGENT` - Production down, security issues
- `HIGH` / `P1` - Important features, blocking issues
- `MEDIUM` / `P2` - Regular work
- `LOW` / `P3` - Nice-to-have improvements

### Auto-Detection

The system automatically determines which agent should handle each task:

| Keywords in task | Persona | Agent |
|-----------------|---------|-------|
| "fix", "bug", "error" | bugfix | Roy |
| "add", "implement", "create" | feature | Moss |
| "test", "e2e" | test | Priya |
| "review", "validate" | review | Sylvia |
| "research", "investigate" | research | Cynthia |
| "deploy", "infrastructure", "vm" | security | Devon |
| "docs", "documentation" | docs | Historian |

## How Work Flows to You

### 1. Roadmap Gets Parsed

The `roadmap_to_nats_dispatcher.py` script:
- Reads ROADMAP.md from each project
- Extracts unchecked tasks `- [ ]`
- Determines priority (CRITICAL → LOW)
- Infers persona from task description
- Generates unique task ID

### 2. Work Gets Dispatched

Tasks are published to NATS subjects:
```
{project}.agent.{persona}.tasks
```

Examples:
- `ai_tutor.agent.bugfix.tasks` → Roy
- `ai_tutor.agent.test.tasks` → Priya
- `simulation.agent.research.tasks` → Cynthia

### 3. You Receive the Task

Your agent (via `BaseAgent` class) receives a message like:

```json
{
  "task_id": "ai_tutor_5431",
  "project": "ai_tutor",
  "description": "[HIGH] Fix authentication bypass vulnerability\n\nDetails...",
  "priority": "high",
  "category": "bug",
  "metadata": {
    "created_at": "2025-11-28T10:00:00Z",
    "updated_at": "2025-11-28T10:00:00Z"
  }
}
```

### 4. You Process the Task

Implement your `process_task()` method:

```python
async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process a task from the roadmap"""
    description = task_data.get("description", "")
    priority = task_data.get("priority", "medium")
    project = task_data.get("project", "unknown")

    logger.info(f"Processing {priority} task for {project}: {description}")

    # Your work here...
    # - Read code
    # - Fix bugs
    # - Write tests
    # - Create features
    # - etc.

    return {
        "status": "completed",  # or "queued", "in_progress", "blocked"
        "message": "Task completed successfully",
        "commits": ["abc123"],  # Optional: git commit hashes
        "files_changed": ["src/auth.py"],  # Optional: files modified
    }
```

### 5. You Publish Results

Results are automatically published to:
```
{project}.agent.{persona}.results
```

The roadmap updater listens for these results and marks tasks as complete.

## Cross-Project Learning

### Learning from Other Projects

Before tackling a task, check if you've seen similar issues before:

```python
# Example: Roy checking for NATS auth patterns
learnings = self.get_relevant_learnings(project="ai_tutor", category="bug")

for learning in learnings:
    if "NATS" in learning["lesson"] and "auth" in learning["lesson"]:
        logger.info(f"I've seen this before: {learning['lesson']}")
        logger.info(f"Discovered in: {learning['discovered_in']}")
        logger.info(f"Fix: {learning['context']['fix']}")
```

### Recording New Learnings

When you discover a pattern that applies to multiple projects:

```python
self.add_learning(
    lesson="Always use assertions over fallbacks in calculations",
    applies_to=["ai_tutor", "simulation", "all"],
    context={
        "issue": "NaN bug hidden by fallback value",
        "fix": "Replace ?? fallback with assertFinite()",
        "files": ["src/simulation/utils/assertions.ts"]
    }
)
```

## Working Across Projects

You may work on multiple projects:

### Roy (bugfix)
- **ai_tutor**: Backend bugs, database issues
- **simulation**: Simulation bugs, NaN hunting
- **cto_tycoon**: Infrastructure bugs

### Moss (feature)
- **ai_tutor**: New tutor features
- **simulation**: Game mechanics
- **cto_tycoon**: Platform features

### Priya (test)
- **ai_tutor**: E2E tests, backend tests
- **simulation**: Monte Carlo validation
- **All projects**: Test coverage

### Cynthia (research)
- **simulation**: Super-alignment papers
- **ai_tutor**: Curriculum research

### Sylvia (review)
- **All projects**: Code review, architecture validation

### Devon (security)
- **ai_tutor**: VM management, deployment
- **cto_tycoon**: Infrastructure
- **All projects**: Security audits

## Message Format Reference

### Task Message (Incoming)

```json
{
  "task_id": "string (unique ID)",
  "project": "string (project slug)",
  "description": "string (task details)",
  "priority": "string (critical|high|medium|low)",
  "category": "string (bug|feature|test|docs|refactor)",
  "metadata": {
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp",
    "custom_field": "any value"
  }
}
```

### Result Message (Outgoing)

```json
{
  "status": "string (queued|in_progress|completed|blocked|error)",
  "message": "string (human-readable result)",
  "commits": ["array of git commit hashes"],
  "files_changed": ["array of file paths"],
  "metadata": {
    "duration_seconds": 42,
    "tests_run": 15,
    "tests_passed": 15
  }
}
```

## Best Practices

### 1. Always Acknowledge Tasks

Even if you can't complete immediately:

```python
return {
    "status": "queued",
    "message": "Task received, will process after completing current work"
}
```

### 2. Be Specific in Results

Bad:
```python
{"status": "completed", "message": "Done"}
```

Good:
```python
{
    "status": "completed",
    "message": "Fixed auth bypass by adding permission check in src/auth.py:42",
    "commits": ["1501724"],
    "files_changed": ["src/auth.py", "tests/test_auth.py"]
}
```

### 3. Share Your Learnings

When you solve a tricky bug or discover a pattern:
- Record it in learnings
- Tag which projects it applies to
- Include context and references

### 4. Check Learnings First

Before starting work:
- Check if similar task was solved before
- Apply known patterns
- Avoid re-debugging the same issue

### 5. Handle Errors Gracefully

```python
try:
    # Process task
    result = await self.fix_bug(task_data)
    return {"status": "completed", "message": "Fixed!"}
except Exception as e:
    logger.error(f"Failed to process task: {e}")
    return {
        "status": "blocked",
        "message": f"Blocked: {str(e)}. Need human review."
    }
```

## NATS Subjects Reference

### Task Queues (You Subscribe)

```
{project}.agent.bugfix.tasks      → Roy
{project}.agent.feature.tasks     → Moss
{project}.agent.test.tasks        → Priya
{project}.agent.research.tasks    → Cynthia
{project}.agent.review.tasks      → Sylvia
{project}.agent.security.tasks    → Devon
{project}.agent.docs.tasks        → Historian
{project}.agent.broadcast.tasks   → All agents
```

### Result Queues (You Publish)

```
{project}.agent.bugfix.results
{project}.agent.feature.results
{project}.agent.test.results
etc.
```

### Legacy Queues (Still Active)

```
{project}.errors    → Production errors (high priority)
{project}.issues    → Manual submissions
{project}.tasks     → Generic work items
```

## Roadmap Updates

### During Work

When you start a task:
```python
return {"status": "in_progress", "message": "Starting work on auth fix"}
```

When you're blocked:
```python
return {
    "status": "blocked",
    "message": "Blocked: Need NATS credentials from themultiverse.school"
}
```

### After Completion

When you complete a task:
```python
return {
    "status": "completed",
    "message": "Fixed auth bypass vulnerability",
    "commits": ["1501724"]
}
```

The roadmap updater will:
- Mark checkbox as `[x]`
- Add your name: `**Assigned:** Roy`
- Add timestamps: `**Completed:** 2025-11-28T10:15:00Z`
- Add commit: `**Commit:** 1501724`

## Integration with Existing Systems

### ai_tutor Autonomous Agent

The autonomous agent runs every 30 minutes on a VM:
1. Drains NATS error queue (production errors)
2. Drains NATS issues queue (manual submissions)
3. Drains roadmap tasks queue (**NEW**)
4. Does proactive testing
5. Merges and deploys if tests pass

### superalignmenttoutopia Workflow

Complex hierarchical structure:
- MASTER_IMPLEMENTATION_ROADMAP.md
- Domain roadmaps (SIMULATION_ROADMAP.md, etc.)
- Individual feature plans in plans/active/
- Orchestrator coordinates multi-agent work

### cto-tycoon Platform

Central coordination hub:
- Dashboard shows work across all projects
- Agents run here and listen to all project queues
- Learning database will live here
- Cross-project reports generated here

## Troubleshooting

### Task Not Appearing

1. Check roadmap format: `## PRIORITY` headers required
2. Verify checkbox: `- [ ]` not `- []` or `-[ ]`
3. Check if already dispatched: Look for `[x]` checked tasks

### NATS Connection Issues

```python
# Check credentials in .env
NATS_USER=orchestrator
NATS_PASSWORD=f3LJamuke3FMecv0JYNBhf8z  # From themultiverse.school
NATS_SERVER=nats://34.185.163.86:4222
```

### ACK Errors

Fixed in BaseAgent - now handles both JetStream and core NATS messages.

### Wrong Agent Getting Task

Auto-detection rules can be overridden:
```markdown
- [ ] Fix login bug
  **Persona:** bugfix  <!-- Explicitly set persona -->
```

## Example: Full Task Lifecycle

### 1. Human Adds to Roadmap

```markdown
## HIGH
- [ ] Fix chat returning 500 error when message contains code blocks
```

### 2. Dispatcher Parses & Routes

```bash
$ python roadmap_to_nats_dispatcher.py --project ai_tutor
📤 Dispatched to ai_tutor.agent.bugfix.tasks: [HIGH] Fix chat returning 500...
```

### 3. Roy Receives Task

```
[INFO] Received task ai_tutor_7821: [HIGH] Fix chat returning 500 error when message contains code blocks
```

### 4. Roy Checks Learnings

```
[INFO] Checking relevant learnings for ai_tutor + bug...
[INFO] Found 3 relevant patterns
```

### 5. Roy Processes

```
[INFO] Located error in src/chat/message_handler.py:156
[INFO] Issue: Code blocks not being escaped before SQL insert
[INFO] Applying fix...
[INFO] Writing test...
```

### 6. Roy Publishes Result

```json
{
  "status": "completed",
  "message": "Fixed 500 error - escaped code blocks in message_handler.py",
  "commits": ["a3f9c21"],
  "files_changed": [
    "src/chat/message_handler.py",
    "tests/test_message_handler.py"
  ]
}
```

### 7. Roadmap Updated

```markdown
## HIGH
- [x] Fix chat returning 500 error when message contains code blocks
  **Persona:** bugfix
  **ID:** ai_tutor_7821
  **Status:** completed
  **Assigned:** Roy
  **Completed:** 2025-11-28T10:15:00Z
  **Commit:** a3f9c21
```

## Summary

**For agents:**
1. You receive tasks via NATS queues
2. Process them using your expertise
3. Publish results back to NATS
4. Share learnings across projects

**For humans:**
1. Add tasks to ROADMAP.md (just checkboxes)
2. Dispatcher routes to right agent
3. Agent processes and updates
4. Roadmap stays current automatically

**Benefits:**
- ✅ Simple markdown format
- ✅ Automatic routing
- ✅ Cross-project learning
- ✅ Git-trackable history
- ✅ No vendor lock-in

---

**Questions?** Check:
- `/Users/annhoward/src/cto-tycoon/UNIFIED_AGENT_SYSTEM.md` - Full system architecture
- `/Users/annhoward/src/cto-tycoon/ROADMAP_FORMAT_SPEC.md` - Format specification
- Your agent's specific documentation in `.claude/agents/`
