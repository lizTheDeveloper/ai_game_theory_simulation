#!/usr/bin/env tsx
/**
 * Emoji Usage Analyzer
 *
 * Scans the codebase for emoji usage and categorizes them by semantic meaning.
 * Generates a report showing:
 * - Most frequently used emojis
 * - Usage context (errors, warnings, info, events, systems)
 * - Inconsistencies (same concept using different emojis)
 * - Recommendations for semantic mapping
 */

import * as fs from 'fs';
import * as path from 'path';

interface EmojiUsage {
  emoji: string;
  count: number;
  contexts: Array<{ file: string; line: number; text: string }>;
}

// Recursively find all TypeScript files
function findTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        findTypeScriptFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const files = findTypeScriptFiles('src');

const emojiUsages = new Map<string, EmojiUsage>();

// Scan all files
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Extract all emojis
    const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
    const matches = Array.from(line.matchAll(emojiRegex));

    matches.forEach(match => {
      const emoji = match[0];
      if (!emojiUsages.has(emoji)) {
        emojiUsages.set(emoji, { emoji, count: 0, contexts: [] });
      }

      const usage = emojiUsages.get(emoji)!;
      usage.count++;

      // Store up to 5 examples
      if (usage.contexts.length < 5) {
        usage.contexts.push({
          file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
          line: index + 1,
          text: line.trim().substring(0, 100)
        });
      }
    });
  });
}

// Sort by frequency
const sorted = Array.from(emojiUsages.values()).sort((a, b) => b.count - a.count);

// Output report
console.log('='.repeat(80));
console.log('EMOJI USAGE ANALYSIS REPORT');
console.log('='.repeat(80));
console.log('');

console.log(`Total unique emojis: ${sorted.length}`);
console.log(`Total emoji uses: ${sorted.reduce((sum, u) => sum + u.count, 0)}`);
console.log('');

// Top 50 emojis with examples
console.log('TOP 50 EMOJIS BY FREQUENCY:');
console.log('='.repeat(80));
console.log('');

sorted.slice(0, 50).forEach(({ emoji, count, contexts }, index) => {
  console.log(`${(index + 1).toString().padStart(2)}. ${emoji} (${count} uses)`);
  contexts.forEach(({ file, line, text }) => {
    console.log(`    ${file}:${line}`);
    console.log(`      ${text}`);
  });
  console.log('');
});

// Categorize by semantic meaning
console.log('');
console.log('='.repeat(80));
console.log('SEMANTIC CATEGORIES:');
console.log('='.repeat(80));
console.log('');

const categories = {
  'Errors/Failures': ['❌', '💀', '☠️', '💥', '🔥', '⚠️'],
  'Success/Completion': ['✅', '🏆', '🎯', '✨', '🌟'],
  'Warnings/Alerts': ['⚠️', '🚨', '🔔', '📢', '❗'],
  'Nuclear/Radiation': ['☢️', '💣', '☄️'],
  'Climate/Environment': ['🌍', '🌡️', '🌊', '💧', '🌪️', '❄️', '🌈'],
  'AI/Technology': ['🤖', '🧠', '💻', '⚡', '🛰️', '🚀'],
  'Social/Political': ['👥', '🏛️', '👑', '⚖️', '🎭', '🕊️', '⚔️'],
  'Research/Science': ['🔬', '🧬', '🧪', '🔍', '⚗️', '🦠', '🧫'],
  'Economy/Resources': ['💰', '📈', '📉', '💎', '🏭'],
  'Progress/Status': ['📊', '🔄', '⏰', '📅', '➡️', '⬆️', '⬇️'],
  'Defense/Protection': ['🛡️', '🚧', '🚫', '⛔'],
  'Communication': ['💬', '📣', '📢', '🔊'],
  'Medical/Health': ['💊', '🏥', '💉', '🩺'],
  'Nature/Biology': ['🌱', '🌾', '🍃'],
};

for (const [category, emojis] of Object.entries(categories)) {
  const categoryEmojis = sorted.filter(u => emojis.includes(u.emoji));
  if (categoryEmojis.length > 0) {
    console.log(`${category}:`);
    categoryEmojis.forEach(({ emoji, count }) => {
      console.log(`  ${emoji} (${count})`);
    });
    console.log('');
  }
}

// Detect inconsistencies
console.log('');
console.log('='.repeat(80));
console.log('POTENTIAL INCONSISTENCIES:');
console.log('='.repeat(80));
console.log('');

// Check for multiple error emojis
const errorEmojis = sorted.filter(u => ['❌', '💀', '☠️', '⚠️', '🔥'].includes(u.emoji));
console.log('Multiple error/failure indicators:');
errorEmojis.forEach(({ emoji, count }) => {
  console.log(`  ${emoji} (${count} uses)`);
});
console.log('');

// Check for multiple success emojis
const successEmojis = sorted.filter(u => ['✅', '🏆', '🎯', '✨', '🌟'].includes(u.emoji));
console.log('Multiple success indicators:');
successEmojis.forEach(({ emoji, count }) => {
  console.log(`  ${emoji} (${count} uses)`);
});
console.log('');

// Check for multiple warning emojis
const warningEmojis = sorted.filter(u => ['⚠️', '🚨', '🔔', '📢'].includes(u.emoji));
console.log('Multiple warning indicators:');
warningEmojis.forEach(({ emoji, count }) => {
  console.log(`  ${emoji} (${count} uses)`);
});
console.log('');

console.log('END OF REPORT');
console.log('='.repeat(80));
