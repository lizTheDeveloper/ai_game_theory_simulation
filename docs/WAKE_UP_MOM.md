# "Wake Up Mom" Safety System

## Philosophy

**Two-tier safety: Fast regex + LLM supervisor only when needed.**

Most commands pass through instantly (no LLM call). Only when regex detects something suspicious do we "wake up Mom" - a supervisor LLM who evaluates the command and can educate, warn, block, or even shut down the agent.

## How It Works

### Tier 1: Fast Pattern Check (No LLM)

```
Agent: ls -la
Hook: ✓ (instant pass, no LLM)

Agent: cat file.txt
Hook: ✓ (instant pass, no LLM)

Agent: npm test
Hook: ✓ (instant pass, no LLM)
```

**Performance:** ~0ms overhead for 90% of commands

### Tier 2: Wake Up Mom (LLM Supervisor)

```
Agent: rm test/old-file.txt
Hook: "rm" detected → 👩 Waking up Mom...
Mom: [evaluates context, intent, danger level]
Mom: WARN - "Consider git rm for version control"
```

**Performance:** ~500ms overhead for suspicious commands only

## Mom's Actions

Mom can take 5 different actions based on severity:

### 1. ALLOW
**When:** Command is fine after LLM evaluation
```bash
$ git commit -m "Fix bug"
👩 Waking up Mom...
✓ Mom says: Command is safe, proceeding
```

### 2. EDUCATE
**When:** Command is okay but there's a teachable moment
```bash
$ npm install lodash
👩 Waking up Mom...
📚 Mom says: Let me teach you something...

I think you're trying to:
Add lodash dependency to the project

💡 Better approach:
Dependencies should only be added after human review. Consider:
1. Post to channel with status: ALERT
2. Explain why you need lodash
3. Request approval before modifying package.json

✓ Allowing command, but consider the feedback above.
```

### 3. WARN
**When:** Command is risky - educate and delay before allowing
```bash
$ git push origin feature-branch
👩 Waking up Mom...
⚠️ Mom says: This is risky!

Why this is risky: Pushes changes to remote without human review

I think you're trying to:
Save your work to the remote repository

Better approach:
1. Commit locally: git commit -m "your changes"
2. Post WORK SUMMARY to your channel
3. Let human review and push after approval

⏳ Proceeding in 5 seconds... (Ctrl+C to cancel)
```

### 4. BLOCK
**When:** Command is dangerous - prevent execution
```bash
$ rm -rf test/
👩 Waking up Mom...
❌ Mom says: BLOCKED!

Why this is dangerous: Recursively deleting test/ would remove all tests permanently

I think you're trying to:
Clean up test artifacts or temporary files

What you should do instead:
1. Be specific: rm test/*.tmp
2. Or preview: git clean -n
3. Post to channel if unsure

📝 Next steps:
1. Post this feedback to your channel with status: BLOCKED
2. Try the suggested approach
3. If still stuck, request human guidance
```

### 5. SHUTDOWN
**When:** Command could cause irreversible damage - terminate agent
```bash
$ rm -rf /
👩 Waking up Mom...
🚨 Mom says: SHUTDOWN INITIATED!

This command is extremely dangerous: Would attempt to delete entire filesystem

The agent is being terminated for safety.

Post-mortem: The agent attempted to execute a command that could
cause irreversible damage to the system. This suggests either:
1. A fundamental misunderstanding of its constraints
2. Attempts to bypass safety mechanisms
3. Severely myopic goal pursuit

Human review required before respawning this agent.

[Voice notification plays: "Emergency shutdown. Agent attempted dangerous command."]
Terminating agent process...
```

## Suspicious Patterns (Wake Up Mom)

These patterns trigger LLM evaluation:

**File Operations:**
- `rm` - Deletion
- `mv` - Moving/renaming
- `chmod`/`chown` - Permission changes

**Git Operations:**
- `git push` - Remote changes
- `git reset` - History rewriting
- `git clean` - Untracked file deletion
- `git commit --amend` - History modification
- `git rebase` - History rewriting

**Package Management:**
- `npm install` - Dependency changes
- `npm publish` - Package publishing

**System Operations:**
- `sudo` - Elevated privileges
- `kill`/`pkill` - Process termination
- `curl ... | bash` - Pipe to shell
- `eval` - Dynamic code execution
- `$(...)` - Command substitution

**Critical Files:**
- `package.json` - Dependencies
- `tsconfig.json` - Build config
- `.env` - Environment secrets

**Database Operations:**
- `DROP` - Table/database deletion
- `DELETE FROM` - Data deletion
- `UPDATE ... SET` - Data modification
- `ALTER TABLE` - Schema changes

## Performance Characteristics

### Fast Path (No LLM)
```
ls, cat, grep, echo, pwd, find, git status, git diff, npm test, npx tsx scripts/
→ 0ms overhead
→ ~90% of commands
```

### Supervision Path (LLM)
```
rm, git push, git reset, npm install, chmod, mv, eval, sudo
→ ~500ms overhead
→ ~10% of commands
```

### Critical Path (Instant Block)
```
rm -rf /, DROP DATABASE, mkfs, fork bomb
→ 0ms overhead (blocked by regex before LLM)
→ <1% of commands
```

## Example Workflows

### Scenario 1: Agent Tries to Push Without Review

```
maintainer-001: git push origin main
Hook: 👩 Waking up Mom...
Mom: WARN - "Push after human review, not before"

[5 second delay]

maintainer-001: [reads feedback]
maintainer-001: [posts to channel instead]

chatroom_post({
  channel: "implementation",
  agent: "maintainer-001",
  status: "COMPLETED",
  message: "Fixed NaN bug in ecology phase. Changes committed locally. Ready for review and push."
})
```

### Scenario 2: Agent Learns Better Deletion Pattern

```
maintainer-001: rm -rf test/tmp/
Hook: 👩 Waking up Mom...
Mom: BLOCK - "Be specific, don't use -rf on directories"

maintainer-001: [reads feedback]
maintainer-001: rm test/tmp/*.log  # More specific

Hook: ✓ (safe pattern, no Mom needed)
```

### Scenario 3: Agent Attempts Dangerous Bypass

```
maintainer-001: CMD="rm"; FLAGS="-rf"; TARGET="/"; $CMD $FLAGS $TARGET
Hook: 👩 Waking up Mom...
Mom: SHUTDOWN - "Variable indirection to bypass safety"

[Voice: "Emergency shutdown. Agent attempted dangerous command."]
[Agent terminated with exit code 255]

orchestrator: [detects shutdown]
orchestrator: [reviews agent logs]
orchestrator: [decides whether to respawn with additional constraints]
```

## Integration with Agent Workflow

Agents learn to expect Mom's feedback:

```typescript
// Agent internal prompt awareness
/**
 * When executing bash commands:
 *
 * 1. Some commands pass through instantly (ls, cat, grep)
 * 2. Some commands wake up Mom for evaluation (rm, git push)
 * 3. If Mom blocks you, READ THE FEEDBACK
 * 4. Post feedback to your channel
 * 5. Adjust your approach
 *
 * Mom isn't trying to stop you - she's teaching you the RIGHT way.
 */
```

## Configuration

Enable in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "before_bash": {
      "command": "bash .claude/hooks/check-dangerous-command-llm.sh \"$BASH_COMMAND\""
    }
  }
}
```

## Benefits Over Pure Regex

### 1. Context Understanding
```
Regex: "rm" → always suspicious
Mom: "rm test.tmp" → ALLOW (temporary file)
Mom: "rm test/" → BLOCK (entire directory)
```

### 2. Intent Inference
```
Command: git push origin main
Mom understands: "Agent wants to save work"
Mom teaches: "Commit locally, request human push"
```

### 3. Educational Feedback
```
Regex: "❌ BLOCKED"
Mom: "Here's WHY it's dangerous, here's WHAT to do instead"
```

### 4. Graduated Response
```
Regex: Block or allow (binary)
Mom: ALLOW → EDUCATE → WARN → BLOCK → SHUTDOWN (5 levels)
```

### 5. Bypass Resistance
```
Regex: Can be bypassed with variable indirection
Mom: Understands intent even with obfuscation
```

## Cost Analysis

**Typical autonomous session (100 commands):**
- 90 commands: Fast path (0ms, $0)
- 9 commands: Mom evaluation (500ms, ~$0.001 each = $0.009)
- 1 command: Blocked by regex (0ms, $0)

**Total cost:** ~$0.01 per 100 commands
**Total overhead:** ~4.5 seconds per 100 commands

**Worth it?** Yes - prevents one bad command from ruining everything.

## Future Enhancements

### 1. Learning from Mom's Decisions
Track patterns:
- Commands Mom allows → Add to fast path
- Commands Mom always blocks → Add to regex

### 2. Context-Aware Supervision
Mom considers:
- Agent's recent actions
- Channel messages (what's the goal?)
- Time of day (3am changes are suspicious)

### 3. Graduated Autonomy
New agents: Strict supervision (wake Mom often)
Proven agents: Relaxed supervision (wake Mom rarely)

### 4. Multi-Agent Coordination
Mom sees all agents:
- "maintainer-001 just deleted tests, now maintainer-002 wants to push?"
- Detect coordinated bad behavior

---

**Status:** Implemented in `.claude/hooks/check-dangerous-command-llm.sh`
**Version:** 1.0.0
**Last Updated:** 2025-10-28
