#!/usr/bin/env node

/**
 * MCP Chatroom Server
 *
 * Provides MCP tools for multi-agent chatroom coordination.
 * Replaces bash helper functions with efficient MCP protocol.
 *
 * Key Features:
 * - Agent username management (each agent chooses username on connect)
 * - Per-agent read position tracking (token-efficient)
 * - Thread following via agent usernames
 * - No permission requests (server-side file operations)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';

// Chatroom configuration
const CHATROOM_ROOT = path.join(process.cwd(), '.claude', 'chatroom');
const CHANNELS_DIR = path.join(CHATROOM_ROOT, 'channels');
const ARCHIVE_DIR = path.join(CHATROOM_ROOT, 'archive');

// Ensure directories exist
if (!fs.existsSync(CHANNELS_DIR)) {
  fs.mkdirSync(CHANNELS_DIR, { recursive: true });
}

// Helper functions
function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 16).replace('T', ' ');
}

function getLastReadFile(channel: string, agent: string): string {
  return path.join(CHATROOM_ROOT, `.${channel}_${agent}_lastread`);
}

function getActiveFile(channel: string): string {
  return path.join(CHATROOM_ROOT, `.${channel}_active`);
}

function getChannelFile(channel: string): string {
  return path.join(CHANNELS_DIR, `${channel}.md`);
}

function readLastReadLine(channel: string, agent: string): number {
  const file = getLastReadFile(channel, agent);
  try {
    const content = fs.readFileSync(file, 'utf-8').trim();
    return parseInt(content) || 0;
  } catch {
    return 0;
  }
}

function writeLastReadLine(channel: string, agent: string, line: number): void {
  const file = getLastReadFile(channel, agent);
  fs.writeFileSync(file, line.toString());
}

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function getActiveAgents(channel: string): string[] {
  const file = getActiveFile(channel);
  try {
    const content = fs.readFileSync(file, 'utf-8');
    return content.split('\n').filter(line => line.trim());
  } catch {
    return [];
  }
}

function addActiveAgent(channel: string, agent: string): void {
  const file = getActiveFile(channel);
  let agents = getActiveAgents(channel);

  // Remove if already exists (avoid duplicates)
  agents = agents.filter(a => a !== agent);

  // Add agent
  agents.push(agent);

  fs.writeFileSync(file, agents.join('\n') + '\n');
}

function removeActiveAgent(channel: string, agent: string): void {
  const file = getActiveFile(channel);
  let agents = getActiveAgents(channel);

  agents = agents.filter(a => a !== agent);

  if (agents.length > 0) {
    fs.writeFileSync(file, agents.join('\n') + '\n');
  } else {
    // Remove file if no agents left
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}

// MCP Server
const server = new Server(
  {
    name: 'chatroom',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools: Tool[] = [
  {
    name: 'chatroom_post',
    description: 'Post a message to a channel (append-only, no read)',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name (e.g., "coordination", "research")',
        },
        agent: {
          type: 'string',
          description: 'Agent username (choose once and reuse)',
        },
        status: {
          type: 'string',
          description: 'Message status tag',
          enum: ['ENTERED', 'STARTED', 'IN-PROGRESS', 'COMPLETED', 'BLOCKED', 'QUESTION', 'ALERT', 'HANDOFF', 'LEAVING'],
        },
        message: {
          type: 'string',
          description: 'Message content',
        },
      },
      required: ['channel', 'agent', 'status', 'message'],
    },
  },
  {
    name: 'chatroom_read_new',
    description: 'Read new messages since last check (per-agent tracking)',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name',
        },
        agent: {
          type: 'string',
          description: 'Agent username',
        },
      },
      required: ['channel', 'agent'],
    },
  },
  {
    name: 'chatroom_enter',
    description: 'Enter a channel (mark as active, post entry message)',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name',
        },
        agent: {
          type: 'string',
          description: 'Agent username',
        },
        message: {
          type: 'string',
          description: 'Optional entry message',
          default: 'Entered channel, now monitoring',
        },
      },
      required: ['channel', 'agent'],
    },
  },
  {
    name: 'chatroom_leave',
    description: 'Leave a channel (mark as inactive, post exit message)',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name',
        },
        agent: {
          type: 'string',
          description: 'Agent username',
        },
        reason: {
          type: 'string',
          description: 'Reason for leaving',
          default: 'Leaving channel',
        },
      },
      required: ['channel', 'agent'],
    },
  },
  {
    name: 'chatroom_who_active',
    description: 'List active agents in a channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'chatroom_list_channels',
    description: 'List all available channels',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'chatroom_peek',
    description: 'Peek at last N lines (for context without marking as read)',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name',
        },
        lines: {
          type: 'number',
          description: 'Number of lines to show',
          default: 5,
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'chatroom_create_channel',
    description: 'Create a new channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name',
        },
        description: {
          type: 'string',
          description: 'Channel description',
        },
      },
      required: ['channel', 'description'],
    },
  },
  {
    name: 'chatroom_reset_lastread',
    description: 'Reset last-read marker (force re-read from beginning)',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel name (optional - omit to reset all)',
        },
        agent: {
          type: 'string',
          description: 'Agent username (optional - omit to reset all agents for channel)',
        },
      },
    },
  },
];

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'chatroom_post': {
        const { channel, agent, status, message } = args as {
          channel: string;
          agent: string;
          status: string;
          message: string;
        };

        const channelFile = getChannelFile(channel);

        // Create channel if doesn't exist
        if (!fs.existsSync(channelFile)) {
          fs.writeFileSync(
            channelFile,
            `# ${channel.charAt(0).toUpperCase() + channel.slice(1)} Channel\n\n---\n`
          );
        }

        // Append message
        const messageBlock = `\n---\n**${agent}** | ${formatTimestamp()} | [${status}]\n\n${message}\n---\n`;
        fs.appendFileSync(channelFile, messageBlock);

        return {
          content: [
            {
              type: 'text',
              text: `✓ Posted to ${channel} [${status}]`,
            },
          ],
        };
      }

      case 'chatroom_read_new': {
        const { channel, agent } = args as {
          channel: string;
          agent: string;
        };

        const channelFile = getChannelFile(channel);

        if (!fs.existsSync(channelFile)) {
          return {
            content: [
              {
                type: 'text',
                text: `Channel ${channel} does not exist`,
              },
            ],
          };
        }

        const lastLine = readLastReadLine(channel, agent);
        const currentLine = countLines(channelFile);

        if (currentLine <= lastLine) {
          return {
            content: [
              {
                type: 'text',
                text: `No new messages in ${channel}`,
              },
            ],
          };
        }

        // Read new lines
        const allLines = fs.readFileSync(channelFile, 'utf-8').split('\n');
        const newLines = allLines.slice(lastLine).join('\n');

        // Update last read marker
        writeLastReadLine(channel, agent, currentLine);

        return {
          content: [
            {
              type: 'text',
              text: `━━━ New messages in ${channel} (for ${agent}) ━━━\n${newLines}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            },
          ],
        };
      }

      case 'chatroom_enter': {
        const { channel, agent, message = 'Entered channel, now monitoring' } = args as {
          channel: string;
          agent: string;
          message?: string;
        };

        // Add to active agents
        addActiveAgent(channel, agent);

        // Post entry message
        const channelFile = getChannelFile(channel);

        if (!fs.existsSync(channelFile)) {
          fs.writeFileSync(
            channelFile,
            `# ${channel.charAt(0).toUpperCase() + channel.slice(1)} Channel\n\n---\n`
          );
        }

        const messageBlock = `\n---\n**${agent}** | ${formatTimestamp()} | [ENTERED]\n\n${message}\n---\n`;
        fs.appendFileSync(channelFile, messageBlock);

        return {
          content: [
            {
              type: 'text',
              text: `✓ Entered ${channel} as ${agent}`,
            },
          ],
        };
      }

      case 'chatroom_leave': {
        const { channel, agent, reason = 'Leaving channel' } = args as {
          channel: string;
          agent: string;
          reason?: string;
        };

        // Remove from active agents
        removeActiveAgent(channel, agent);

        // Post exit message
        const channelFile = getChannelFile(channel);

        if (fs.existsSync(channelFile)) {
          const messageBlock = `\n---\n**${agent}** | ${formatTimestamp()} | [LEAVING]\n\n${reason}\n---\n`;
          fs.appendFileSync(channelFile, messageBlock);
        }

        return {
          content: [
            {
              type: 'text',
              text: `← Left ${channel}`,
            },
          ],
        };
      }

      case 'chatroom_who_active': {
        const { channel } = args as { channel: string };

        const agents = getActiveAgents(channel);

        if (agents.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `ℹ No agents currently active in ${channel}`,
              },
            ],
          };
        }

        const agentList = agents.map(a => `  ● ${a}`).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `━━━ Active in ${channel} ━━━\n${agentList}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            },
          ],
        };
      }

      case 'chatroom_list_channels': {
        const channels = fs.readdirSync(CHANNELS_DIR)
          .filter(f => f.endsWith('.md'))
          .map(f => {
            const name = f.replace('.md', '');
            const file = path.join(CHANNELS_DIR, f);
            const lines = countLines(file);
            const activeCount = getActiveAgents(name).length;

            if (activeCount > 0) {
              return `  • ${name} (${lines} lines, ${activeCount} active)`;
            }
            return `  • ${name} (${lines} lines)`;
          });

        return {
          content: [
            {
              type: 'text',
              text: `━━━ Available Channels ━━━\n${channels.join('\n')}\n━━━━━━━━━━━━━━━━━━━━━━━━━`,
            },
          ],
        };
      }

      case 'chatroom_peek': {
        const { channel, lines = 5 } = args as {
          channel: string;
          lines?: number;
        };

        const channelFile = getChannelFile(channel);

        if (!fs.existsSync(channelFile)) {
          return {
            content: [
              {
                type: 'text',
                text: `Channel ${channel} does not exist`,
              },
            ],
          };
        }

        const allLines = fs.readFileSync(channelFile, 'utf-8').split('\n');
        const lastLines = allLines.slice(-lines).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `━━━ Last ${lines} lines from ${channel} ━━━\n${lastLines}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            },
          ],
        };
      }

      case 'chatroom_create_channel': {
        const { channel, description } = args as {
          channel: string;
          description: string;
        };

        const channelFile = getChannelFile(channel);

        if (fs.existsSync(channelFile)) {
          return {
            content: [
              {
                type: 'text',
                text: `⚠ Channel ${channel} already exists`,
              },
            ],
          };
        }

        const content = `# ${channel.charAt(0).toUpperCase() + channel.slice(1)} Channel\n\n${description}\n\n---\n`;
        fs.writeFileSync(channelFile, content);

        return {
          content: [
            {
              type: 'text',
              text: `✓ Created channel: ${channel}`,
            },
          ],
        };
      }

      case 'chatroom_reset_lastread': {
        const { channel, agent } = args as {
          channel?: string;
          agent?: string;
        };

        if (!channel) {
          // Clear all markers
          const files = fs.readdirSync(CHATROOM_ROOT).filter(f => f.includes('_lastread'));
          files.forEach(f => fs.unlinkSync(path.join(CHATROOM_ROOT, f)));

          return {
            content: [
              {
                type: 'text',
                text: '✓ Cleared all last-read markers',
              },
            ],
          };
        } else if (!agent) {
          // Clear all agents' markers for channel
          const files = fs.readdirSync(CHATROOM_ROOT)
            .filter(f => f.startsWith(`.${channel}_`) && f.includes('_lastread'));
          files.forEach(f => fs.unlinkSync(path.join(CHATROOM_ROOT, f)));

          return {
            content: [
              {
                type: 'text',
                text: `✓ Cleared all last-read markers for ${channel}`,
              },
            ],
          };
        } else {
          // Clear specific agent's marker
          const file = getLastReadFile(channel, agent);
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }

          return {
            content: [
              {
                type: 'text',
                text: `✓ Cleared last-read marker for ${agent} in ${channel}`,
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Chatroom Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
