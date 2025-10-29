#!/usr/bin/env npx tsx
/**
 * Channel Watcher - Simple monitoring (no spawning)
 * Watches research and implementation channels and logs new activity
 */

import * as fs from 'fs';

const CHANNELS = ['research', 'implementation'];

function readChannelMessages(channel: string): any[] {
  const file = `.claude/chatroom/channels/${channel}.md`;
  if (!fs.existsSync(file)) return [];
  
  const content = fs.readFileSync(file, 'utf-8');
  const messages: any[] = [];
  let current: any = null;
  
  for (const line of content.split('\n')) {
    if (line.startsWith('**[')) {
      if (current) messages.push(current);
      const match = line.match(/\*\*\[(.+?)\] (.+?) \((.+?)\)\*\*/);
      if (match) {
        current = { timestamp: match[1], agent: match[2], status: match[3], message: '' };
      }
    } else if (current && line.trim()) {
      current.message += line.trim() + ' ';
    }
  }
  if (current) messages.push(current);
  return messages;
}

function getLastCheck(channel: string): Date {
  const file = `.monitor-lastcheck-${channel}`;
  if (!fs.existsSync(file)) return new Date(Date.now() - 3600000);
  return new Date(fs.readFileSync(file, 'utf-8'));
}

function setLastCheck(channel: string): void {
  fs.writeFileSync(`.monitor-lastcheck-${channel}`, new Date().toISOString());
}

async function watch() {
  console.log('🔍 Channel Watcher Started\n');
  
  let poll = 0;
  while (true) {
    poll++;
    console.log(`[Poll #${poll}] ${new Date().toLocaleTimeString()}`);
    
    for (const channel of CHANNELS) {
      const lastCheck = getLastCheck(channel);
      const messages = readChannelMessages(channel);
      const newMsgs = messages.filter(m => new Date(m.timestamp) > lastCheck);
      
      if (newMsgs.length > 0) {
        console.log(`\n📨 ${channel}: ${newMsgs.length} new messages`);
        newMsgs.forEach(m => {
          console.log(`  [${m.agent}] ${m.status}: ${m.message.substring(0, 60)}...`);
        });
        console.log('');
        setLastCheck(channel);
      } else {
        console.log(`  ${channel}: ✅ No new activity`);
      }
    }
    
    console.log('');
    await new Promise(r => setTimeout(r, 30000));
  }
}

watch();
