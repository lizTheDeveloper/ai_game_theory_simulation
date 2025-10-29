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

function readNewMessages(channel: string, agentId: string): ChatroomMessage[] {
  try {
    const result = execSync(
      `npx tsx -e "import { mcp__chatroom__chatroom_read_new } from '@/mcp'; mcp__chatroom__chatroom_read_new({ channel: '${channel}', agent: '${agentId}' }).then(r => console.log(JSON.stringify(r)));"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );

    const parsed = JSON.parse(result);
    return parsed.messages || [];
  } catch (error) {
    console.error(`Error reading channel ${channel}:`, error);
    return [];
  }
}

function checkWhoActive(channel: string): string[] {
  try {
    const result = execSync(
      `npx tsx -e "import { mcp__chatroom__chatroom_who_active } from '@/mcp'; mcp__chatroom__chatroom_who_active({ channel: '${channel}' }).then(r => console.log(JSON.stringify(r)));"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );

    const parsed = JSON.parse(result);
    return parsed.agents || [];
  } catch (error) {
    console.error(`Error checking active agents in ${channel}:`, error);
    return [];
  }
}

// ============================================================================
// Agent Spawning
// ============================================================================

function spawnOrchestrator(channel: string, reason: string): void {
  console.log(`\n🎯 Spawning orchestrator for channel: ${channel}`);
  console.log(`📝 Reason: ${reason}`);

  voiceNotify(`Orchestrator spawning for ${channel}`);

  try {
    // Spawn orchestrator using Task tool via Claude Code CLI
    // The orchestrator will:
    // 1. Recall their memory context
    // 2. Read channel messages
    // 3. Determine what needs to be done
    // 4. Spawn specialists as needed
    // 5. Coordinate work

    const taskDescription = `Monitor and coordinate work in ${channel} channel`;
    const taskPrompt = `
You are the orchestrator agent. A new request has been detected in the ${channel} channel.

Your agent ID is: ${ORCHESTRATOR_AGENT_ID}

Steps:
1. First, recall your memory context:
   await mcp__agent_memory__recall_context({ agent_id: "${ORCHESTRATOR_AGENT_ID}" })

2. Enter the channel and read new messages:
   await mcp__chatroom__chatroom_enter({ channel: "${channel}", agent: "${ORCHESTRATOR_AGENT_ID}" })
   await mcp__chatroom__chatroom_read_new({ channel: "${channel}", agent: "${ORCHESTRATOR_AGENT_ID}" })

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
   - Leave the channel: await mcp__chatroom__chatroom_leave({ channel: "${channel}", agent: "${ORCHESTRATOR_AGENT_ID}", reason: "Work coordinated" })

Remember: You coordinate, you don't implement. Delegate to specialists!
    `.trim();

    console.log(`\n📋 Task Description: ${taskDescription}`);
    console.log(`\n🚀 Spawning orchestrator agent...`);

    // Note: In production, this would use the Claude Code Task API
    // For now, we'll log the task details
    console.log('\n--- ORCHESTRATOR SPAWN TASK ---');
    console.log(`Channel: ${channel}`);
    console.log(`Reason: ${reason}`);
    console.log(`Prompt: ${taskPrompt}`);
    console.log('--- END TASK ---\n');

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

        // If orchestrator is already active, skip
        if (activeAgents.includes(ORCHESTRATOR_AGENT_ID)) {
          console.log(`  ⏭️  Orchestrator already active in ${channel}, skipping`);
          continue;
        }

        // Read new messages
        const newMessages = readNewMessages(channel, MONITOR_BOT_ID);
        console.log(`  📨 New messages: ${newMessages.length}`);

        if (newMessages.length > 0) {
          console.log(`  📝 Recent messages:`);
          newMessages.slice(0, 3).forEach(m => {
            console.log(`     [${m.agent}] ${m.status}: ${m.message.substring(0, 60)}...`);
          });
        }

        // Analyze if attention needed
        const analysis = needsAttention(newMessages);

        if (analysis.needs) {
          console.log(`  🚨 ATTENTION NEEDED: ${analysis.reason}`);
          spawnOrchestrator(channel, analysis.reason);
        } else if (newMessages.length > 0) {
          console.log(`  ℹ️  Messages present but no immediate action needed`);
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
