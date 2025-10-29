#!/usr/bin/env npx tsx
/**
 * Simple Channel Monitor (NO LLM)
 *
 * Polls research and implementation channels for new messages.
 * Posts notifications to coordination channel when work is detected.
 * YOU then manually spawn the operator agent to coordinate work.
 */

import * as fs from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const CHANNELS = ['research', 'implementation'];
const POLL_INTERVAL_MS = 30000; // 30 seconds
const COORDINATION_CHANNEL = 'coordination';

// ============================================================================
// Chatroom Integration (Direct File Access - No MCP)
// ============================================================================

interface Message {
  timestamp: string;
  agent: string;
  status: string;
  message: string;
}

function readChannel(channel: string): Message[] {
  const channelFile = `.claude/chatroom/channels/${channel}.md`;

  if (!fs.existsSync(channelFile)) {
    return [];
  }

  const content = fs.readFileSync(channelFile, 'utf-8');
  const messages: Message[] = [];

  // Parse messages from markdown format
  const lines = content.split('\n');
  let currentMessage: Partial<Message> | null = null;

  for (const line of lines) {
    if (line.startsWith('**')) {
      // New message header: **[timestamp] agent (STATUS)**
      const match = line.match(/\*\*\[(.+?)\] (.+?) \((.+?)\)\*\*/);
      if (match) {
        if (currentMessage?.timestamp) {
          messages.push(currentMessage as Message);
        }
        currentMessage = {
          timestamp: match[1],
          agent: match[2],
          status: match[3],
          message: ''
        };
      }
    } else if (currentMessage && line.trim()) {
      // Message content
      currentMessage.message += line.trim() + ' ';
    }
  }

  if (currentMessage?.timestamp) {
    messages.push(currentMessage as Message);
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

function getNewMessages(channel: string): Message[] {
  const allMessages = readChannel(channel);
  const lastRead = getLastReadTime(channel);

  return allMessages.filter(m => new Date(m.timestamp) > lastRead);
}

function voiceNotify(message: string, voice: string = 'Samantha'): void {
  // Check silent mode
  try {
    const mode = fs.readFileSync('.claude/silent-mode', 'utf-8').trim();
    if (mode !== 'disabled') {
      return; // Silent mode ON
    }
  } catch {
    return; // Default to silent
  }

  // Limit to 20 words
  const words = message.split(/\s+/);
  if (words.length > 20) {
    message = words.slice(0, 20).join(' ');
  }

  try {
    const { execSync } = require('child_process');
    execSync(`say -v "${voice}" -r 180 "${message}"`, { stdio: 'ignore' });
  } catch (error) {
    // Silent fail
  }
}

// ============================================================================
// Work Detection
// ============================================================================

function detectWork(messages: Message[]): { needsWork: boolean; reason: string } {
  if (messages.length === 0) {
    return { needsWork: false, reason: '' };
  }

  // Explicit requests
  const explicitRequest = messages.find(m =>
    m.message.toLowerCase().includes('can someone') ||
    m.message.toLowerCase().includes('need help') ||
    m.message.toLowerCase().includes('operator') ||
    m.status === 'QUESTION'
  );

  if (explicitRequest) {
    return {
      needsWork: true,
      reason: `Explicit request: "${explicitRequest.message.substring(0, 60)}..."`
    };
  }

  // Work status indicators
  const workStatus = messages.find(m =>
    m.status === 'STARTED' ||
    m.status === 'BLOCKED' ||
    m.status === 'ALERT'
  );

  if (workStatus) {
    return {
      needsWork: true,
      reason: `Work status: ${workStatus.status} from ${workStatus.agent}`
    };
  }

  // Many messages accumulating
  if (messages.length >= 5) {
    return {
      needsWork: true,
      reason: `${messages.length} messages without response`
    };
  }

  return { needsWork: false, reason: '' };
}

// ============================================================================
// Monitoring Loop
// ============================================================================

async function monitor(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════╗
║    Simple Channel Monitor (No LLM Polling)         ║
╚════════════════════════════════════════════════════╝
`);

  console.log(`📡 Monitoring: ${CHANNELS.join(', ')}`);
  console.log(`⏱️  Interval: ${POLL_INTERVAL_MS / 1000}s`);
  console.log(`📢 Notifications: #${COORDINATION_CHANNEL}`);
  console.log('');

  let iteration = 0;

  while (true) {
    iteration++;
    const timestamp = new Date().toISOString();

    console.log(`\n[${ timestamp}] 🔍 Poll #${iteration}`);

    for (const channel of CHANNELS) {
      try {
        const newMessages = getNewMessages(channel);

        if (newMessages.length === 0) {
          console.log(`  ${channel}: ✅ No new messages`);
          continue;
        }

        console.log(`  ${channel}: 📨 ${newMessages.length} new messages`);

        // Show preview of recent messages
        newMessages.slice(0, 2).forEach(m => {
          console.log(`    [${m.agent}] ${m.status}: ${m.message.substring(0, 50)}...`);
        });

        // Detect if work needs attention
        const detection = detectWork(newMessages);

        if (detection.needsWork) {
          console.log(`  ${channel}: 🚨 WORK DETECTED`);
          console.log(`  ${channel}: 📝 ${detection.reason}`);

          // Voice notify (if not in silent mode)
          voiceNotify(`New work in ${channel}`);

          // Write spawn request for router
          const spawnRequest = {
            timestamp: new Date().toISOString(),
            channel,
            reason: detection.reason,
            messages: newMessages.slice(0, 3),
            spawnPrompt: `
You are the router. A new message in #${channel} needs evaluation.

Message that triggered you:
${newMessages[newMessages.length - 1].message}

Your job:
1. Determine if this needs a response (or just a completion notification/chatter)
2. If it needs work, decide which specialist should handle it
3. Spawn that specialist
4. Exit

Available specialists: cynthia (research), sylvia (skeptic), roy (simulation), moss (implementer), tessa (UI), historian (docs)

Don't spawn if it's just someone saying they're done or casual chat.
            `.trim()
          };

          // Write to pending spawns directory
          const spawnFile = `.claude/pending-spawns/${timestamp.replace(/:/g, '-')}-${channel}.json`;
          fs.mkdirSync('.claude/pending-spawns', { recursive: true });
          fs.writeFileSync(spawnFile, JSON.stringify(spawnRequest, null, 2), 'utf-8');

          console.log(`  ${channel}: 📝 Spawn request written to ${spawnFile}`);
          console.log(`  ${channel}: 🎯 Router will evaluate and spawn specialist if needed`);
        } else {
          console.log(`  ${channel}: ℹ️  No immediate action needed`);
        }

        // Update last read time
        updateLastReadTime(channel);

      } catch (error) {
        console.error(`  ${channel}: ❌ Error:`, error);
      }
    }

    console.log(`\n⏳ Sleeping ${POLL_INTERVAL_MS / 1000}s...\n`);
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// ============================================================================
// Main
// ============================================================================

process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor stopped\n');
  process.exit(0);
});

monitor().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
