#!/usr/bin/env npx tsx
/**
 * Channel Monitor - Autonomous Agent Spawner
 *
 * Watches research and implementation channels for new messages.
 * Spawns orchestrator when work is detected.
 * Orchestrator then delegates to specialized agents as needed.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const CHANNELS_TO_MONITOR = ['research', 'implementation'];
const MONITOR_BOT_ID = 'channel-monitor';
const ORCHESTRATOR_AGENT_ID = 'orchestrator';
const POLL_INTERVAL_MS = 30000; // 30 seconds
const SILENT_MODE_FILE = '.claude/silent-mode';

// ============================================================================
// Voice Notifications
// ============================================================================

function isSilentMode(): boolean {
  try {
    const mode = fs.readFileSync(SILENT_MODE_FILE, 'utf-8').trim();
    return mode !== 'disabled';
  } catch {
    return true; // Default to silent
  }
}

function voiceNotify(message: string, voice: string = 'Samantha'): void {
  if (isSilentMode()) {
    console.log(`🔇 [Silent] Would notify: "${message}"`);
    return;
  }

  // Limit to 20 words
  const words = message.split(/\s+/);
  if (words.length > 20) {
    message = words.slice(0, 20).join(' ');
  }

  try {
    execSync(`say -v "${voice}" -r 180 "${message}"`, { stdio: 'ignore' });
  } catch (error) {
    console.error('Voice notification failed:', error);
  }
}

// ============================================================================
// Chatroom Integration
// ============================================================================

interface ChatroomMessage {
  timestamp: string;
  agent: string;
  status: string;
  message: string;
}

function readChannel(channel: string): ChatroomMessage[] {
  const channelFile = `.claude/chatroom/channels/${channel}.md`;

  if (!fs.existsSync(channelFile)) {
    return [];
  }

  const content = fs.readFileSync(channelFile, 'utf-8');
  const messages: ChatroomMessage[] = [];

  // Parse messages from markdown format
  const lines = content.split('\n');
  let currentMessage: Partial<ChatroomMessage> | null = null;

  for (const line of lines) {
    if (line.startsWith('**') && line.includes('|')) {
      // New message header: **agent** | timestamp | [STATUS]
      const match = line.match(/\*\*(.+?)\*\*\s+\|\s+(.+?)\s+\|\s+\[(.+?)\]/);
      if (match) {
        if (currentMessage?.timestamp) {
          messages.push(currentMessage as ChatroomMessage);
        }
        currentMessage = {
          agent: match[1],
          timestamp: match[2],
          status: match[3],
          message: ''
        };
      }
    } else if (currentMessage && line.trim() && !line.startsWith('---')) {
      // Message content (skip separator lines)
      currentMessage.message += line.trim() + ' ';
    }
  }

  if (currentMessage?.timestamp) {
    messages.push(currentMessage as ChatroomMessage);
  }

  return messages;
}

function getLastReadTime(channel: string): Date {
  const stateFile = `.claude/chatroom/monitor-state-${channel}.txt`;

  if (!fs.existsSync(stateFile)) {
    // Never read before - return 1 hour ago
    return new Date(Date.now() - 3600000);
  }

  const timestamp = fs.readFileSync(stateFile, 'utf-8').trim();
  return new Date(timestamp);
}

function updateLastReadTime(channel: string): void {
  const stateFile = `.claude/chatroom/monitor-state-${channel}.txt`;
  fs.writeFileSync(stateFile, new Date().toISOString(), 'utf-8');
}

function readNewMessages(channel: string, agentId: string): ChatroomMessage[] {
  const allMessages = readChannel(channel);
  const lastRead = getLastReadTime(channel);

  return allMessages.filter(m => new Date(m.timestamp) > lastRead);
}

function checkWhoActive(channel: string): string[] {
  const activeFile = `.claude/chatroom/.${channel}_active`;

  if (!fs.existsSync(activeFile)) {
    return [];
  }

  const content = fs.readFileSync(activeFile, 'utf-8');
  return content.split('\n').filter(a => a.trim().length > 0);
}

// ============================================================================
// Agent Spawning
// ============================================================================

function spawnOrchestrator(channel: string, reason: string): void {
  console.log(`\n🎯 Spawning orchestrator for channel: ${channel}`);
  console.log(`📝 Reason: ${reason}`);

  voiceNotify(`Orchestrator spawning for ${channel}`);

  try {
    const taskPrompt = `
You are the orchestrator agent. A new request has been detected in the ${channel} channel.

Your agent ID is: ${ORCHESTRATOR_AGENT_ID}

Steps:
1. First, recall your memory context:
   mcp__agent_memory__recall_context({ agent_id: "${ORCHESTRATOR_AGENT_ID}" })

2. Enter the channel and read new messages:
   mcp__chatroom__chatroom_enter({ channel: "${channel}", agent: "${ORCHESTRATOR_AGENT_ID}" })
   mcp__chatroom__chatroom_read_new({ channel: "${channel}", agent: "${ORCHESTRATOR_AGENT_ID}" })

3. Analyze what work needs to be done

4. Spawn specialized agents as needed using the Task tool:
   - For research: spawn super-alignment-researcher (cynthia)
   - For implementation: spawn simulation-maintainer (roy) or feature-implementer (moss)
   - For skeptical review: spawn research-skeptic (sylvia)
   - For architecture review: spawn architecture-skeptic
   - For documentation: spawn wiki-documentation-updater (historian)

5. Coordinate their work and track progress

6. Before you finish:
   - Post completion summary to channel
   - Add milestone to your memory if significant work completed
   - Leave the channel: mcp__chatroom__chatroom_leave({ channel: "${channel}", agent: "${ORCHESTRATOR_AGENT_ID}", reason: "Work coordinated" })

Remember: You coordinate, you don't implement. Delegate to specialists!
    `.trim();

    console.log(`\n🚀 Spawning orchestrator agent via Claude Code...`);

    // Write task to temp file
    const tmpFile = `/tmp/orchestrator_spawn_${Date.now()}.txt`;
    fs.writeFileSync(tmpFile, taskPrompt, 'utf-8');

    // Spawn orchestrator using Claude Code CLI (& backgrounds via shell)
    execSync(`claude --dangerously-skip-permissions < ${tmpFile} > /dev/null 2>&1 &`, {
      stdio: 'ignore'
    });

    // Clean up temp file after a delay
    setTimeout(() => {
      try {
        fs.unlinkSync(tmpFile);
      } catch {}
    }, 5000);

    console.log('✅ Orchestrator spawn initiated in background');
    voiceNotify('Orchestrator spawned successfully');

  } catch (error) {
    console.error('❌ Failed to spawn orchestrator:', error);
    voiceNotify('Orchestrator spawn failed', 'Fred');
  }
}

// ============================================================================
// Message Analysis
// ============================================================================

function needsAttention(messages: ChatroomMessage[]): { needs: boolean; reason: string } {
  if (messages.length === 0) {
    return { needs: false, reason: '' };
  }

  // Check for explicit requests
  const hasRequest = messages.some(m =>
    m.message.toLowerCase().includes('can someone') ||
    m.message.toLowerCase().includes('need help') ||
    m.message.toLowerCase().includes('orchestrator') ||
    m.status === 'QUESTION'
  );

  if (hasRequest) {
    return {
      needs: true,
      reason: `Explicit request detected: "${messages[0].message.substring(0, 50)}..."`
    };
  }

  // Check for work posted without orchestrator active
  const hasWork = messages.some(m =>
    m.status === 'STARTED' ||
    m.status === 'BLOCKED' ||
    m.status === 'ALERT'
  );

  if (hasWork) {
    return {
      needs: true,
      reason: `Work status detected: ${messages[0].status}`
    };
  }

  // New messages but no obvious need - let it accumulate
  return { needs: false, reason: '' };
}

// ============================================================================
// Monitoring Loop
// ============================================================================

async function monitorChannels(): Promise<void> {
  console.log('🔍 Channel Monitor Started');
  console.log(`📡 Monitoring channels: ${CHANNELS_TO_MONITOR.join(', ')}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
  console.log(`🔇 Silent mode: ${isSilentMode() ? 'ON' : 'OFF'}`);
  console.log('');

  voiceNotify('Channel monitor started');

  let iteration = 0;

  while (true) {
    iteration++;
    const timestamp = new Date().toISOString();

    console.log(`\n--- Poll ${iteration} at ${timestamp} ---`);

    for (const channel of CHANNELS_TO_MONITOR) {
      console.log(`\n📢 Checking channel: ${channel}`);

      try {
        // Check who's active
        const activeAgents = checkWhoActive(channel);
        console.log(`  👥 Active agents: ${activeAgents.length > 0 ? activeAgents.join(', ') : 'none'}`);

        const orchestratorActive = activeAgents.includes(ORCHESTRATOR_AGENT_ID);

        // Read new messages
        const newMessages = readNewMessages(channel, MONITOR_BOT_ID);
        console.log(`  📨 New messages: ${newMessages.length}`);

        if (newMessages.length > 0) {
          console.log(`  📝 Recent messages:`);
          newMessages.slice(0, 3).forEach(m => {
            console.log(`     [${m.agent}] ${m.status}: ${m.message.substring(0, 60)}...`);
          });
        }

        // Process messages ONE AT A TIME like MQTT queue (exactly-once semantics)
        if (newMessages.length > 0) {
          // Take the OLDEST message
          const oldestMessage = newMessages[0];
          const analysis = needsAttention([oldestMessage]);

          if (analysis.needs) {
            console.log(`  🚨 MESSAGE NEEDS ATTENTION: ${analysis.reason}`);
            console.log(`  📝 Message: [${oldestMessage.agent}] ${oldestMessage.message.substring(0, 60)}...`);

            // Only spawn and mark as processed if orchestrator NOT already active
            if (orchestratorActive) {
              console.log(`  ⏸️  Orchestrator already active - message stays in queue`);
              console.log(`  📊 Waiting to process: ${newMessages.length} messages`);
            } else {
              spawnOrchestrator(channel, analysis.reason);

              // Mark as processed ONLY after spawning
              const stateFile = `.claude/chatroom/monitor-state-${channel}.txt`;
              fs.writeFileSync(stateFile, oldestMessage.timestamp, 'utf-8');

              console.log(`  ✅ Orchestrator spawned, message marked as processed`);
              console.log(`  📊 Remaining messages in queue: ${newMessages.length - 1}`);
            }
          } else {
            console.log(`  ℹ️  Oldest message doesn't need action, marking as read`);
            // Mark as read and continue to next
            const stateFile = `.claude/chatroom/monitor-state-${channel}.txt`;
            fs.writeFileSync(stateFile, oldestMessage.timestamp, 'utf-8');
          }
        } else {
          console.log(`  ✅ No new activity`);
        }

      } catch (error) {
        console.error(`  ❌ Error monitoring ${channel}:`, error);
      }
    }

    console.log(`\n⏳ Sleeping for ${POLL_INTERVAL_MS / 1000}s...`);
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           Channel Monitor - Autonomous Agents              ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down channel monitor...');
    voiceNotify('Channel monitor stopped');
    process.exit(0);
  });

  await monitorChannels();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
