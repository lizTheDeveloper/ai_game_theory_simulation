# Spawn Channel Monitor

To start the autonomous channel monitoring system, spawn the monitor agent with this Task invocation:

```typescript
Task({
  subagent_type: 'channel-monitor',
  description: 'Monitor channels and spawn orchestrator',
  prompt: `
You are the channel monitor agent. Agent ID: monitor

Your job: Watch research and implementation channels continuously and spawn the orchestrator when work is detected.

## Main Loop

Run this loop forever:

\`\`\`typescript
while (true) {
  for (const channel of ['research', 'implementation']) {
    // 1. Check if orchestrator already active (thundering-herd protection)
    const activeAgents = await mcp__chatroom__chatroom_who_active({ channel });

    if (activeAgents.includes('orchestrator')) {
      console.log(\`⏭️  Orchestrator already active in \${channel}\`);
      continue;
    }

    // 2. Read new messages
    const result = await mcp__chatroom__chatroom_read_new({
      channel,
      agent: 'monitor'
    });

    const newMessages = result.messages || [];

    if (newMessages.length === 0) {
      console.log(\`✅ No new activity in \${channel}\`);
      continue;
    }

    console.log(\`📨 \${newMessages.length} new messages in \${channel}\`);

    // 3. Detect if work needs attention
    const needsAttention = newMessages.some(m =>
      m.message.toLowerCase().includes('can someone') ||
      m.message.toLowerCase().includes('need help') ||
      m.message.toLowerCase().includes('orchestrator') ||
      m.status === 'QUESTION' ||
      m.status === 'BLOCKED' ||
      m.status === 'ALERT'
    );

    if (!needsAttention) {
      console.log(\`ℹ️  Messages present but no immediate action needed\`);
      continue;
    }

    // 4. SPAWN ORCHESTRATOR
    console.log(\`🚨 Work detected in \${channel} - spawning orchestrator\`);

    Task({
      subagent_type: 'orchestrator',
      description: \`Coordinate work in \${channel}\`,
      prompt: \`
You are the orchestrator. Agent ID: orchestrator

Work detected in \${channel} channel.

Steps:
1. Recall your memory: await mcp__agent_memory__recall_context({ agent_id: "orchestrator" })
2. Enter channel: await mcp__chatroom__chatroom_enter({ channel: "\${channel}", agent: "orchestrator" })
3. Read messages: await mcp__chatroom__chatroom_read_new({ channel: "\${channel}", agent: "orchestrator" })
4. Determine what work needs to be done
5. Spawn specialists using Task tool:
   - Research: super-alignment-researcher (agent ID: cynthia)
   - Implementation: simulation-maintainer (agent ID: roy) or feature-implementer (agent ID: moss)
   - Skeptical review: research-skeptic (agent ID: sylvia)
   - Architecture review: architecture-skeptic
   - Documentation: wiki-documentation-updater (agent ID: historian)
6. Coordinate their work
7. Post completion summary and leave channel

You coordinate - you don't implement. Delegate to specialists!
      \`
    });

    console.log(\`✅ Orchestrator spawned for \${channel}\`);
  }

  // Wait 30 seconds before next poll
  await new Promise(resolve => setTimeout(resolve, 30000));
}
\`\`\`

Run this loop continuously. Log everything clearly. Never crash without explaining why.
  `
})
```

## What This Does

1. **Monitor spawns** with `dangerouslyDisableSandbox` (allowing autonomous operation)
2. **Monitor polls** research and implementation channels every 30s
3. **Monitor detects work** (explicit requests, BLOCKED status, etc.)
4. **Monitor spawns orchestrator** using Task tool (sub-agent)
5. **Orchestrator spawns specialists** (Cynthia, Roy, etc.) using Task tool
6. **Specialists do the work** and report back
7. **Loop continues** forever

## Thundering Herd Protection

The monitor checks if orchestrator is already active before spawning:

```typescript
const activeAgents = await mcp__chatroom__chatroom_who_active({ channel });
if (activeAgents.includes('orchestrator')) {
  // Skip, already handled
}
```

## To Stop

The monitor runs forever. To stop it:
- If running in foreground: Press Ctrl+C
- If running as background agent: You'll need to manually kill the agent process

## Architecture

```
You (main Claude Code context)
  ↓ Task() with dangerouslyDisableSandbox
[channel-monitor agent]
  ↓ Task() when work detected
  [orchestrator agent]
    ↓ Task() for specific work
    [cynthia/roy/moss/sylvia/etc.]
```

Each agent can spawn sub-agents using Task().

## Example Flow

```
[10:30:00] Monitor: Polling research channel
[10:30:05] Monitor: 📨 2 new messages detected
[10:30:05] Monitor: Message contains "can someone research..."
[10:30:05] Monitor: 🚨 Spawning orchestrator
[10:30:06] Orchestrator: Spawned, reading channel
[10:30:07] Orchestrator: Research request detected, spawning Cynthia
[10:30:08] Cynthia: Spawned, recalling memory
[10:30:09] Cynthia: Searching for climate tipping point papers...
[10:35:00] Cynthia: Found 5 papers, posting to research channel
[10:35:01] Orchestrator: Work complete, leaving channel
[10:35:30] Monitor: Orchestrator no longer active, ready for next request
```

## Notes

- Monitor uses **haiku model** (fast, cheap for simple polling)
- Orchestrator uses **sonnet model** (smarter coordination)
- Specialists use models specified in their agent definitions
- All agents use memory system to maintain context across spawns
