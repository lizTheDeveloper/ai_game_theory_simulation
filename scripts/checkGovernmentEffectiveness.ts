#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';

console.log('=== CHECKING GOVERNMENT ACTION EFFECTIVENESS ===\n');

const actionsDir = './src/simulation/government/actions';
const actionFiles = fs.readdirSync(actionsDir)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts');

const ineffectiveActions: Array<{file: string, action: string, reason: string}> = [];
let totalActions = 0;

for (const file of actionFiles) {
  const filePath = path.join(actionsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find all action declarations
  const actionMatches = content.matchAll(/const\s+([a-zA-Z_]+):\s*CategorizedGovernmentAction\s*=\s*{([\s\S]*?)^};$/gm);

  for (const match of actionMatches) {
    const actionName = match[1];
    const actionBody = match[2];
    totalActions++;

    // Extract the execute method
    const executeMatch = actionBody.match(/execute:\s*\([^)]*\):\s*ActionResult\s*=>\s*{([\s\S]*?)^  }/m);

    if (!executeMatch) {
      ineffectiveActions.push({
        file,
        action: actionName,
        reason: 'No execute method found'
      });
      continue;
    }

    const executeBody = executeMatch[1];

    // Check for actual state modifications
    const hasStateChange =
      executeBody.includes('state.') ||
      executeBody.includes('gameState.');

    const hasAssignment =
      executeBody.match(/\s+=\s+/) ||
      executeBody.includes('+=') ||
      executeBody.includes('-=') ||
      executeBody.includes('++') ||
      executeBody.includes('--');

    const hasMutation =
      executeBody.includes('.push(') ||
      executeBody.includes('.splice(') ||
      executeBody.includes('.filter(') ||
      executeBody.includes('.map(');

    const isEffective = hasStateChange && (hasAssignment || hasMutation);

    // Check for TODO/stub markers
    const isStub =
      executeBody.includes('TODO') ||
      executeBody.includes('FIXME') ||
      executeBody.includes('stub') ||
      executeBody.includes('not implemented');

    // Check if it only returns a result without changing state
    const onlyReturns =
      executeBody.trim().startsWith('return') &&
      executeBody.split('return').length === 2;

    if (!isEffective || isStub || onlyReturns) {
      let reason = '';
      if (isStub) reason = 'Marked as TODO/stub/not implemented';
      else if (onlyReturns) reason = 'Only returns a result, no state changes';
      else if (!hasStateChange) reason = 'No state modifications found';
      else if (!hasAssignment && !hasMutation) reason = 'State accessed but not modified';

      ineffectiveActions.push({
        file,
        action: actionName,
        reason
      });
    }
  }
}

console.log(`Total government actions found: ${totalActions}`);
console.log(`Ineffective actions: ${ineffectiveActions.length}\n`);

if (ineffectiveActions.length > 0) {
  console.log('⚠️  ACTIONS WITH NO EFFECT:\n');

  // Group by file
  const byFile = ineffectiveActions.reduce((acc, item) => {
    if (!acc[item.file]) acc[item.file] = [];
    acc[item.file].push(item);
    return acc;
  }, {} as Record<string, typeof ineffectiveActions>);

  for (const [file, actions] of Object.entries(byFile)) {
    console.log(`📄 ${file}:`);
    actions.forEach(a => {
      console.log(`   ❌ ${a.action}`);
      console.log(`      Reason: ${a.reason}`);
    });
    console.log();
  }

  console.log(`\nSummary: ${ineffectiveActions.length}/${totalActions} actions need implementation`);
} else {
  console.log('✅ All government actions have state modifications!');
}
