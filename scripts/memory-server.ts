#!/usr/bin/env npx tsx

/**
 * Agent Memory Server (HTTP) - DEPRECATED
 *
 * ⚠️ THIS FILE IS DEPRECATED ⚠️
 *
 * Use the MCP-based memory server instead: scripts/agent-memory-server.py
 *
 * The MCP version provides the same functionality but integrates directly with
 * Claude Code's MCP system, allowing agents to call memory tools without
 * manual HTTP requests.
 *
 * See .claude/agents/memories/README.md for usage.
 *
 * ---
 *
 * Original HTTP-based implementation (preserved for reference):
 *
 * Centralized service for agent memory management.
 * All agents connect to this server to read/write their memories.
 *
 * Benefits:
 * - Concurrency control (multiple agents can't corrupt each other's files)
 * - Audit logging (track all memory access)
 * - Centralized maintenance (nightly/weekly/monthly cleanup)
 * - Memory validation (ensure memory files are valid)
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import memoryManager, { AgentMemory } from './memoryManager';

const PORT = 3141; // π for memory
const HOST = 'localhost';
const MEMORY_DIR = '.claude/agents/memories';
const AUDIT_LOG = '.claude/agents/memories/audit.log';

// ============================================================================
// Memory Server
// ============================================================================

interface MemoryRequest {
  agentId: string;
  action: 'load' | 'save' | 'update' | 'report';
  memory?: AgentMemory;
  update?: {
    type: 'task' | 'learning' | 'conversation' | 'insight' | 'milestone';
    content: string;
  };
}

interface MemoryResponse {
  success: boolean;
  memory?: AgentMemory;
  report?: string;
  error?: string;
}

// In-memory cache for concurrent access protection
const memoryCache: Map<string, { memory: AgentMemory; lastAccess: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Audit log entry
 */
function audit(agentId: string, action: string, details?: string) {
  const timestamp = new Date().toISOString();
  const entry = `${timestamp} | ${agentId} | ${action} | ${details || ''}\n`;

  fs.appendFileSync(AUDIT_LOG, entry, 'utf-8');
}

/**
 * Get memory from cache or load from disk
 */
function getMemory(agentId: string): AgentMemory {
  const cached = memoryCache.get(agentId);
  const now = Date.now();

  if (cached && (now - cached.lastAccess) < CACHE_TTL) {
    return cached.memory;
  }

  // Load from disk
  const memory = memoryManager.loadMemory(agentId);

  // Update cache
  memoryCache.set(agentId, { memory, lastAccess: now });

  return memory;
}

/**
 * Save memory to cache and disk
 */
function setMemory(agentId: string, memory: AgentMemory): void {
  // Update cache
  memoryCache.set(agentId, { memory, lastAccess: Date.now() });

  // Save to disk
  memoryManager.saveMemory(agentId, memory);
}

/**
 * Handle memory requests
 */
function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const request: MemoryRequest = JSON.parse(body);
      const { agentId, action } = request;

      audit(agentId, action);

      let response: MemoryResponse;

      switch (action) {
        case 'load':
          const memory = getMemory(agentId);
          response = { success: true, memory };
          break;

        case 'save':
          if (!request.memory) {
            throw new Error('Memory data required for save action');
          }
          setMemory(agentId, request.memory);
          response = { success: true };
          audit(agentId, 'save', 'Full memory saved');
          break;

        case 'update':
          if (!request.update) {
            throw new Error('Update data required for update action');
          }

          let currentMemory = getMemory(agentId);
          const { type, content } = request.update;

          switch (type) {
            case 'task':
              currentMemory = memoryManager.addRecentTask(currentMemory, content);
              break;
            case 'learning':
              currentMemory = memoryManager.addRecentLearning(currentMemory, content);
              break;
            case 'conversation':
              currentMemory = memoryManager.addConversation(currentMemory, content);
              break;
            case 'insight':
              currentMemory = memoryManager.addLongTermInsight(currentMemory, content);
              break;
            case 'milestone':
              currentMemory = memoryManager.addMilestone(currentMemory, content);
              break;
            default:
              throw new Error(`Unknown update type: ${type}`);
          }

          setMemory(agentId, currentMemory);
          response = { success: true, memory: currentMemory };
          audit(agentId, 'update', `${type}: ${content.substring(0, 50)}...`);
          break;

        case 'report':
          const report = memoryManager.generateMemoryReport(agentId);
          response = { success: true, report };
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));

    } catch (error: any) {
      console.error('Request error:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  });
}

/**
 * Scheduled maintenance
 */
function setupMaintenance() {
  // Nightly cleanup at 3am
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 3 && now.getMinutes() === 0) {
      console.log('🌙 Running nightly maintenance...');
      memoryManager.runMaintenance('nightly');
      memoryCache.clear(); // Clear cache after maintenance
    }
  }, 60 * 1000); // Check every minute

  // Weekly cleanup on Sunday at 3am
  setInterval(() => {
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() === 3 && now.getMinutes() === 0) {
      console.log('📅 Running weekly maintenance...');
      memoryManager.runMaintenance('weekly');
      memoryCache.clear();
    }
  }, 60 * 1000);

  // Monthly cleanup on 1st at 3am
  setInterval(() => {
    const now = new Date();
    if (now.getDate() === 1 && now.getHours() === 3 && now.getMinutes() === 0) {
      console.log('🗓️ Running monthly maintenance...');
      memoryManager.runMaintenance('monthly');
      memoryCache.clear();
    }
  }, 60 * 1000);
}

// ============================================================================
// Start Server
// ============================================================================

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`
🧠 Agent Memory Server Started

Host: ${HOST}
Port: ${PORT}
Memory Directory: ${MEMORY_DIR}
Audit Log: ${AUDIT_LOG}

Agents can now connect to:
  http://${HOST}:${PORT}

Actions supported:
  - load: Get agent memory
  - save: Save full memory
  - update: Add task/learning/insight/etc
  - report: Generate memory report

Scheduled maintenance:
  - Nightly: 3:00 AM (recent → medium-term)
  - Weekly: Sunday 3:00 AM (medium-term → long-term/compost)
  - Monthly: 1st at 3:00 AM (compost cleanup)

Press Ctrl+C to stop
`);

  setupMaintenance();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down memory server...');

  // Save all cached memories
  for (const [agentId, cached] of memoryCache.entries()) {
    console.log(`  💾 Saving ${agentId}...`);
    memoryManager.saveMemory(agentId, cached.memory);
  }

  server.close(() => {
    console.log('✅ Memory server stopped');
    process.exit(0);
  });
});
