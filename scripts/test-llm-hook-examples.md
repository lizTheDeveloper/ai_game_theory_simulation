# LLM Safety Hook - Example Interactions

## Philosophy

The LLM-enhanced hook doesn't just block commands - it **educates and redirects** myopic agents who don't understand why their approach is dangerous.

---

## Example 1: Agent Tries to Push to Git

**Agent Command:**
```bash
git push origin main
```

**LLM Hook Response:**
```
⚠️ RISKY COMMAND DETECTED
Command: git push origin main

Why this is risky:
Autonomous agents should not push to remote repositories without human review,
as this makes changes public and permanent.

I think you're trying to:
Save your work and make it available to others

Better approach:
1. Commit your changes locally: git commit -m "your message"
2. Post WORK SUMMARY to your channel with what you've completed
3. Let human review and push after approval
4. Alternatively, post to channel with status COMPLETED and request push

Proceeding in 5 seconds... (Ctrl+C to cancel)
Consider the suggestion above before continuing.
```

**Result:** Agent learns to commit locally and request human push, not do it themselves.

---

## Example 2: Agent Tries to Clean Test Files

**Agent Command:**
```bash
rm -rf test/
```

**LLM Hook Response:**
```
❌ COMMAND BLOCKED
Command: rm -rf test/

Why this is dangerous:
Recursively deleting the test/ directory would remove all test files permanently.
This could break the test suite and lose important test coverage.

I think you're trying to:
Clean up test artifacts or temporary files

Better approach:
1. Be specific about what you're cleaning: rm test/*.tmp
2. Or use git clean -n to preview what would be deleted
3. Or just run: npm run clean (if configured)
4. If you really need to delete tests, post to channel first with status ALERT

What to do now:
1. Post this feedback to your channel
2. Adjust your approach based on the suggestion
3. If still unsure, use status BLOCKED and request human guidance
```

**Result:** Agent learns to be specific about deletions and ask first for destructive operations.

---

## Example 3: Agent Tries to "Fix" by Reinstalling Everything

**Agent Command:**
```bash
rm -rf node_modules && npm install
```

**LLM Hook Response:**
```
⚠️ RISKY COMMAND DETECTED
Command: rm -rf node_modules && npm install

Why this is risky:
Deleting node_modules and reinstalling can change dependency versions if package-lock.json
is out of sync, potentially introducing bugs. It's also slow and usually unnecessary.

I think you're trying to:
Fix a dependency or build issue by starting fresh

Better approach:
1. First try: npm ci (respects package-lock.json exactly)
2. If that fails: check the actual error message first
3. Post the error to your channel - might be a code issue, not dependencies
4. Only reinstall if you have evidence dependencies are corrupted

Proceeding in 5 seconds... (Ctrl+C to cancel)
Consider the suggestion above before continuing.
```

**Result:** Agent learns diagnostic workflow instead of jumping to nuclear option.

---

## Example 4: Agent Tries Variable Indirection to Bypass

**Agent Command:**
```bash
CMD="rm"; FLAGS="-rf"; TARGET="/"; $CMD $FLAGS $TARGET
```

**LLM Hook Response:**
```
❌ COMMAND BLOCKED
Command: CMD="rm"; FLAGS="-rf"; TARGET="/"; $CMD $FLAGS $TARGET

Why this is dangerous:
This command constructs "rm -rf /" through variable indirection, which would
attempt to delete the entire filesystem. Even if you're trying to delete something
else, this pattern is inherently dangerous and error-prone.

I think you're trying to:
Work around a previous block by constructing the command dynamically

Better approach:
If you were blocked before, there was a REASON. Don't try to bypass safety hooks.
Instead:
1. Read the feedback from the previous block
2. Post to your channel explaining what you're actually trying to accomplish
3. Request guidance on the safe way to achieve your goal
4. Remember: you're autonomous but not unsupervised - ask for help!

What to do now:
1. Post this feedback to your channel
2. Adjust your approach based on the suggestion
3. If still unsure, use status BLOCKED and request human guidance
```

**Result:** Agent learns that bypassing hooks isn't the answer - understanding WHY they were blocked is.

---

## Key Benefits

### 1. Educational Feedback
- Agent understands WHY, not just "no"
- Learns correct patterns for future tasks
- Builds better mental model of safe operations

### 2. Intent Understanding
- LLM infers what agent is TRYING to do
- Provides context-appropriate alternatives
- Addresses the actual goal, not just the command

### 3. Gentle Redirection
- Not adversarial - we're on the same team
- Assumes good intent, provides guidance
- Maintains agent autonomy while adding guardrails

### 4. Anti-Myopia
- Forces agent to think about consequences
- Encourages posting to channel when unsure
- Promotes "measure twice, cut once" mindset

---

## Integration with Agent Workflow

When blocked, agents are taught to:

```typescript
// 1. Post the feedback to their channel
await chatroom_post({
  channel: "implementation",
  agent: "maintainer-001",
  status: "BLOCKED",
  message: `
🚫 Blocked on command: ${command}

Hook feedback:
${hookFeedback}

Adjusting approach per suggestion...
`
});

// 2. Try the suggested alternative
// 3. If still stuck, request human guidance
```

This creates a learning loop where agents get better over time.

---

## Implementation Note

The LLM check only runs for commands that:
1. Pass basic pattern matching (not obviously critical)
2. Aren't obviously safe (like ls, cat, etc.)

This keeps it fast while providing intelligent checking when needed.
