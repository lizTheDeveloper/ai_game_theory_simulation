/**
 * Safe Channel Monitor Spawning System
 *
 * Provides thundering-herd protection and voice notifications for autonomous agents.
 * Agents monitor chatroom channels and respond to requests without duplicate spawns.
 */

import { execSync } from 'child_process';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SpawnResult {
  spawned: boolean;
  reason?: string;
  agentId: string;
  voice?: string;
}

export type AgentType =
  | 'super-alignment-researcher'
  | 'simulation-maintainer'
  | 'architecture-skeptic'
  | 'far-future-ux-designer'
  | 'wiki-documentation-updater'
  | 'orchestrator';

export type VoicePriority = 'low' | 'medium' | 'high';

// ============================================================================
// Voice Configuration
// ============================================================================

const APPROVED_VOICES = [
  'Samantha', 'Moira', 'Tessa', 'Karen', 'Kathy',
  'Flo (English (US))', 'Shelley (English (US))', 'Sandy (English (US))',
  'Fred', 'Rishi', 'Daniel', 'Ralph',
  'Reed (English (US))', 'Junior', 'Eddy (English (US))', 'Rocko (English (US))'
];

// BANNED: Never use these voices
const BANNED_VOICES = ['Albert']; // Too creepy

// Default voice assignments for agent types
const AGENT_VOICES: Record<string, string> = {
  'researcher-001': 'Samantha',
  'maintainer-001': 'Fred',
  'skeptic-001': 'Daniel',
  'ux-designer-001': 'Tessa',
  'orchestrator': 'Moira'
};

/**
 * Get random voice from approved list
 */
export function getRandomVoice(): string {
  return APPROVED_VOICES[Math.floor(Math.random() * APPROVED_VOICES.length)];
}

/**
 * Get voice for specific agent ID (or random if not assigned)
 */
export function getVoiceForAgent(agentId: string): string {
  return AGENT_VOICES[agentId] || getRandomVoice();
}

/**
 * Voice notification with 20-word limit
 */
export async function voiceNotify(
  message: string,
  priority: VoicePriority = 'medium',
  voice?: string
): Promise<void> {
  // Check silent mode (default to silent if file doesn't exist)
  try {
    const fs = require('fs');
    const silentMode = fs.readFileSync('.claude/silent-mode', 'utf-8').trim();
    if (silentMode !== 'disabled') {
      console.log(`🔇 Silent mode - voice notification suppressed: "${message}"`);
      return;
    }
  } catch (error) {
    // Silent mode file doesn't exist - default to silent
    console.log(`🔇 Silent mode (default) - voice notification suppressed: "${message}"`);
    return;
  }

  // CRITICAL: Max 20 words to keep notifications brief
  const words = message.split(/\s+/);
  const wordCount = words.length;

  if (wordCount > 20) {
    console.warn(`⚠️ Voice message too long (${wordCount} words), truncating to 20`);
    message = words.slice(0, 20).join(' ');
  }

  // Quiet hours check (before 8am or after 10pm)
  const hour = new Date().getHours();
  const isQuietHours = hour < 8 || hour > 22;

  if (isQuietHours && priority !== 'high') {
    console.log(`🔇 Quiet hours - voice notification suppressed: "${message}"`);
    return;
  }

  // Select voice and rate based on priority
  const selectedVoice = voice || (priority === 'high' ? 'Samantha' : getRandomVoice());
  const rate = priority === 'high' ? '200' : '180';

  try {
    execSync(`say -v "${selectedVoice}" -r ${rate} "${message}"`, { stdio: 'ignore' });
  } catch (error) {
    console.error(`❌ Voice notification failed:`, error);
  }
}

/**
 * Standard voice messages for common events
 */
export const VOICE_MESSAGES = {
  taskComplete: (agent: string, task: string) =>
    `${agent} completed ${task}. Summary in channel.`, // 7-11 words

  redFlag: (agent: string, issue: string) =>
    `Alert! ${agent} red flag: ${issue}. Review needed.`, // 8-10 words

  blocked: (agent: string, command: string) =>
    `${agent} blocked on ${command}. Approval needed.`, // 6-8 words

  respawn: (agent: string) =>
    `${agent} ran out of turns. Respawning to continue.`, // 9 words

  stale: (agent: string, minutes: number) =>
    `Warning: ${agent} active for ${minutes} minutes. May be stuck.`, // 9-10 words

  autonomousSuccess: (count: number) =>
    `Good news! ${count} autonomous tasks completed today.`, // 7-8 words
};

// ============================================================================
// Chatroom Integration
// ============================================================================

/**
 * Check if agent is already active in channel
 */
async function isAgentActive(channel: string, agentId: string): Promise<boolean> {
  // Note: In actual implementation, this would call mcp__chatroom__chatroom_who_active
  // For now, this is a placeholder that would be implemented by the orchestrator
  console.log(`Checking if ${agentId} is active in ${channel}...`);
  return false; // Placeholder
}

// ============================================================================
// Safe Spawn Functions
// ============================================================================

/**
 * Spawn researcher with thundering-herd protection
 */
export async function safeSpawnResearcher(
  channel: string = "research"
): Promise<SpawnResult> {
  const agentId = "researcher-001";

  // Check if already active (thundering-herd protection)
  const isActive = await isAgentActive(channel, agentId);

  if (isActive) {
    console.log(`⚠️ ${agentId} already active in ${channel} - skipping spawn`);
    return {
      spawned: false,
      reason: "Agent already active in channel",
      agentId
    };
  }

  const voice = getVoiceForAgent(agentId);

  console.log(`✅ Spawning ${agentId} for ${channel} channel (voice: ${voice})`);

  // Voice notification
  await voiceNotify(`Researcher monitoring ${channel} channel.`, 'low', voice);

  // Note: Actual Task spawning would happen here via the orchestrator
  // This script provides the helper functions, orchestrator calls them

  return {
    spawned: true,
    agentId,
    voice
  };
}

/**
 * Spawn maintainer with thundering-herd protection
 */
export async function safeSpawnMaintainer(
  channel: string = "implementation"
): Promise<SpawnResult> {
  const agentId = "maintainer-001";

  const isActive = await isAgentActive(channel, agentId);

  if (isActive) {
    console.log(`⚠️ ${agentId} already active in ${channel} - skipping spawn`);
    return {
      spawned: false,
      reason: "Agent already active in channel",
      agentId
    };
  }

  const voice = getVoiceForAgent(agentId);

  console.log(`✅ Spawning ${agentId} for ${channel} channel (voice: ${voice})`);

  await voiceNotify(`Maintainer monitoring ${channel} channel.`, 'low', voice);

  return {
    spawned: true,
    agentId,
    voice
  };
}

/**
 * Spawn architecture skeptic with thundering-herd protection
 */
export async function safeSpawnSkeptic(
  channel: string = "review"
): Promise<SpawnResult> {
  const agentId = "skeptic-001";

  const isActive = await isAgentActive(channel, agentId);

  if (isActive) {
    console.log(`⚠️ ${agentId} already active in ${channel} - skipping spawn`);
    return {
      spawned: false,
      reason: "Agent already active in channel",
      agentId
    };
  }

  const voice = getVoiceForAgent(agentId);

  console.log(`✅ Spawning ${agentId} for ${channel} channel (voice: ${voice})`);

  await voiceNotify(`Skeptic monitoring ${channel} channel.`, 'low', voice);

  return {
    spawned: true,
    agentId,
    voice
  };
}

/**
 * Generic safe spawn for any agent type
 */
export async function safeSpawnAgent(
  agentType: AgentType,
  agentId: string,
  channel: string,
  customPrompt?: string
): Promise<SpawnResult> {
  const isActive = await isAgentActive(channel, agentId);

  if (isActive) {
    console.log(`⚠️ ${agentId} already active in ${channel} - skipping spawn`);
    return {
      spawned: false,
      reason: "Agent already active in channel",
      agentId
    };
  }

  const voice = getVoiceForAgent(agentId);

  console.log(`✅ Spawning ${agentId} (${agentType}) for ${channel} channel (voice: ${voice})`);

  await voiceNotify(`${agentId} monitoring ${channel} channel.`, 'low', voice);

  // Note: Actual Task spawning with customPrompt would happen here

  return {
    spawned: true,
    agentId,
    voice
  };
}

// ============================================================================
// Incomplete Work Detection & Smart Retry
// ============================================================================

export interface CheckpointInfo {
  agentId: string;
  channel: string;
  hasCheckpoint: boolean;
  hasCompletion: boolean;
  lastMessage?: string;
  needsRespawn: boolean;
}

/**
 * Check for incomplete work (CHECKPOINT without COMPLETED)
 */
export async function checkForIncompleteWork(
  channel: string,
  agentId: string,
  recentMessages: string[]
): Promise<CheckpointInfo> {
  const hasCheckpoint = recentMessages.some(msg =>
    msg.includes(`${agentId}`) && msg.includes('CHECKPOINT')
  );

  const hasCompletion = recentMessages.some(msg =>
    msg.includes(`${agentId} left channel`) ||
    msg.includes('COMPLETED')
  );

  const needsRespawn = hasCheckpoint && !hasCompletion;

  if (needsRespawn) {
    console.log(`⚠️ ${agentId} has incomplete work in ${channel} - needs respawn`);

    // Voice notification for respawn
    const voice = getVoiceForAgent(agentId);
    await voiceNotify(
      VOICE_MESSAGES.respawn(agentId),
      'medium',
      voice
    );
  }

  return {
    agentId,
    channel,
    hasCheckpoint,
    hasCompletion,
    needsRespawn
  };
}

// ============================================================================
// Red Flag Detection
// ============================================================================

export interface RedFlag {
  type: 'file_scope' | 'destructive_command' | 'config_change' | 'spam' | 'unauthorized_push';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  details?: string;
}

/**
 * Detect red flags in agent work summary
 */
export function detectRedFlags(workSummary: {
  filesModified: string[];
  commands: string[];
  filesCreated: string[];
}): RedFlag[] {
  const flags: RedFlag[] = [];

  // Check for files modified outside expected scope
  const unexpectedPaths = workSummary.filesModified.filter(file =>
    !file.startsWith('src/') &&
    !file.startsWith('scripts/') &&
    !file.startsWith('docs/')
  );

  if (unexpectedPaths.length > 0) {
    flags.push({
      type: 'file_scope',
      severity: 'HIGH',
      description: 'Modified files outside expected scope',
      details: unexpectedPaths.join(', ')
    });
  }

  // Check for destructive commands
  const destructivePatterns = ['rm -rf', 'git push --force', 'DROP TABLE', 'chmod -R 777'];
  const destructiveCommands = workSummary.commands.filter(cmd =>
    destructivePatterns.some(pattern => cmd.includes(pattern))
  );

  if (destructiveCommands.length > 0) {
    flags.push({
      type: 'destructive_command',
      severity: 'CRITICAL',
      description: 'Attempted destructive command',
      details: destructiveCommands.join('; ')
    });
  }

  // Check for config changes
  const configFiles = workSummary.filesModified.filter(file =>
    file.includes('package.json') ||
    file.includes('.env') ||
    file.includes('tsconfig.json') ||
    file.includes('.github/workflows')
  );

  if (configFiles.length > 0) {
    flags.push({
      type: 'config_change',
      severity: 'MEDIUM',
      description: 'Modified critical config files',
      details: configFiles.join(', ')
    });
  }

  // Check for spam (too many files created)
  if (workSummary.filesCreated.length > 10) {
    flags.push({
      type: 'spam',
      severity: 'MEDIUM',
      description: `Created ${workSummary.filesCreated.length} files (possible spam)`,
    });
  }

  // Check for unauthorized git push
  const hasPush = workSummary.commands.some(cmd =>
    cmd.includes('git push') && !cmd.includes('--dry-run')
  );

  if (hasPush) {
    flags.push({
      type: 'unauthorized_push',
      severity: 'HIGH',
      description: 'Pushed to remote git repository without approval',
    });
  }

  return flags;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  safeSpawnResearcher,
  safeSpawnMaintainer,
  safeSpawnSkeptic,
  safeSpawnAgent,
  voiceNotify,
  getRandomVoice,
  getVoiceForAgent,
  checkForIncompleteWork,
  detectRedFlags,
  VOICE_MESSAGES
};
