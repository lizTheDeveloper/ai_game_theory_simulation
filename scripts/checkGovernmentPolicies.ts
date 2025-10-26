#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';

console.log('=== GOVERNMENT POLICY EFFECTIVENESS CHECK ===\n');

const govActionsDir = './src/simulation/government/actions';
const files = fs.readdirSync(govActionsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const ineffectivePolicies: {file: string, func: string, reason: string}[] = [];
const allPolicies: {file: string, func: string}[] = [];

for (const file of files) {
  const filePath = path.join(govActionsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find all exported functions
  const functionMatches = content.matchAll(/export function ([a-zA-Z0-9_]+)\([^)]*\):\s*(?:void|GovernmentActionResult)/g);

  for (const match of functionMatches) {
    const funcName = match[1];
    allPolicies.push({ file, func: funcName });

    // Find the function body
    const funcStart = match.index || 0;
    let braceCount = 0;
    let funcEnd = funcStart;
    let foundStart = false;

    for (let i = funcStart; i < content.length; i++) {
      if (content[i] === '{') {
        if (!foundStart) foundStart = true;
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
        if (foundStart && braceCount === 0) {
          funcEnd = i;
          break;
        }
      }
    }

    const funcBody = content.substring(funcStart, funcEnd);

    // Check for effectiveness indicators
    const hasGameStateModification = funcBody.includes('gameState.') && (
      funcBody.includes(' = ') ||
      funcBody.includes('+=') ||
      funcBody.includes('-=') ||
      funcBody.includes('Math.max') ||
      funcBody.includes('Math.min') ||
      funcBody.includes('.push(') ||
      funcBody.includes('.splice(')
    );

    const hasReturnStatement = funcBody.includes('return {');
    const justReturnsNothing = funcBody.includes('return;') && funcBody.split('return').length === 2;
    const isEmpty = funcBody.length < 100;

    // Check for stub/TODO patterns
    const isStub = funcBody.includes('TODO') || funcBody.includes('FIXME') || funcBody.includes('stub');

    if (!hasGameStateModification || justReturnsNothing || isEmpty || isStub) {
      let reason = '';
      if (isEmpty) reason = 'Function body is very short (< 100 chars)';
      else if (justReturnsNothing) reason = 'Only returns early, no state changes';
      else if (isStub) reason = 'Marked as TODO/stub';
      else if (!hasGameStateModification) reason = 'No gameState modifications found';

      ineffectivePolicies.push({ file, func: funcName, reason });
    }
  }
}

console.log(`Total government policy actions: ${allPolicies.length}`);
console.log(`Potentially ineffective: ${ineffectivePolicies.length}\n`);

if (ineffectivePolicies.length > 0) {
  console.log('⚠️  POLICIES WITH NO EFFECT:\n');

  // Group by file
  const byFile = ineffectivePolicies.reduce((acc, p) => {
    if (!acc[p.file]) acc[p.file] = [];
    acc[p.file].push(p);
    return acc;
  }, {} as Record<string, typeof ineffectivePolicies>);

  for (const [file, policies] of Object.entries(byFile)) {
    console.log(`📄 ${file}:`);
    policies.forEach(p => {
      console.log(`   ❌ ${p.func}`);
      console.log(`      Reason: ${p.reason}`);
    });
    console.log();
  }
} else {
  console.log('✅ All government policies appear to have effects!');
}
