/**
 * Detect Semantic Duplicates
 *
 * Finds properties that are semantically similar, suggesting duplicate
 * implementations or inconsistent naming:
 * - trust vs trustLevel
 * - aiCapability vs capability
 * - temperature vs temperatureAnomaly
 *
 * These indicate potential architectural issues where the same concept
 * is tracked in multiple places.
 */

import * as fs from 'fs';
import * as path from 'path';

interface PropertyInfo {
  interfaceName: string;
  propertyName: string;
  file: string;
  fullPath: string;
}

interface DuplicateGroup {
  baseName: string;
  variants: PropertyInfo[];
  similarity: 'exact' | 'suffix' | 'prefix' | 'contains';
}

const allProperties: PropertyInfo[] = [];

function extractPropertiesFromFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath, '.ts');

  let currentInterface: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: export interface Foo {
    const interfaceMatch = line.match(/(?:export\s+)?interface\s+(\w+)/);
    if (interfaceMatch) {
      currentInterface = interfaceMatch[1];
    }

    // Match: propertyName: type; or propertyName?: type;
    const propertyMatch = line.match(/^\s+(\w+)\??:\s/);
    if (propertyMatch && currentInterface) {
      const propertyName = propertyMatch[1];
      allProperties.push({
        interfaceName: currentInterface,
        propertyName,
        file: fileName,
        fullPath: `${currentInterface}.${propertyName}`
      });
    }

    // Reset on closing brace (simple heuristic)
    if (line.match(/^}/)) {
      currentInterface = null;
    }
  }
}

function normalizePropertyName(name: string): string {
  // Remove common suffixes/prefixes
  return name
    .toLowerCase()
    .replace(/level$/i, '')
    .replace(/value$/i, '')
    .replace(/count$/i, '')
    .replace(/rate$/i, '')
    .replace(/^is/, '')
    .replace(/^has/, '')
    .replace(/^get/, '');
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function findSemanticDuplicates(): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < allProperties.length; i++) {
    const prop1 = allProperties[i];
    const normalized1 = normalizePropertyName(prop1.propertyName);

    if (seen.has(prop1.fullPath)) continue;

    const similar: PropertyInfo[] = [prop1];

    for (let j = i + 1; j < allProperties.length; j++) {
      const prop2 = allProperties[j];
      const normalized2 = normalizePropertyName(prop2.propertyName);

      // Skip if same property in same interface
      if (prop1.fullPath === prop2.fullPath) continue;

      // Check for exact match after normalization
      if (normalized1 === normalized2 && normalized1.length > 3) {
        similar.push(prop2);
        seen.add(prop2.fullPath);
        continue;
      }

      // Check for suffix/prefix variants
      if (prop1.propertyName.length >= 5 && prop2.propertyName.length >= 5) {
        const name1 = prop1.propertyName.toLowerCase();
        const name2 = prop2.propertyName.toLowerCase();

        // Same base with different suffix (trust vs trustLevel)
        if (name1.startsWith(name2) || name2.startsWith(name1)) {
          similar.push(prop2);
          seen.add(prop2.fullPath);
          continue;
        }

        // Levenshtein distance (typos or very similar)
        const distance = levenshteinDistance(name1, name2);
        if (distance <= 2 && Math.min(name1.length, name2.length) > 5) {
          similar.push(prop2);
          seen.add(prop2.fullPath);
        }
      }
    }

    if (similar.length > 1) {
      duplicates.push({
        baseName: normalized1,
        variants: similar,
        similarity: similar.every(p =>
          normalizePropertyName(p.propertyName) === normalized1
        ) ? 'exact' : 'suffix'
      });
      seen.add(prop1.fullPath);
    }
  }

  return duplicates.sort((a, b) => b.variants.length - a.variants.length);
}

console.log('🔍 Detecting semantic duplicates in type definitions...\n');

// Scan all type files
const typesDir = path.join(__dirname, '../src/types');
const typeFiles = fs.readdirSync(typesDir).filter(f => f.endsWith('.ts'));

console.log(`Scanning ${typeFiles.length} type files...\n`);

for (const file of typeFiles) {
  extractPropertiesFromFile(path.join(typesDir, file));
}

console.log(`Found ${allProperties.length} properties across ${new Set(allProperties.map(p => p.interfaceName)).size} interfaces\n`);

const duplicates = findSemanticDuplicates();

console.log(`Found ${duplicates.length} potential duplicate groups\n`);

// Generate report
let report = '# Semantic Duplicate Properties\n\n';
report += `**Purpose**: Find properties that represent the same concept with different names\n\n`;
report += `## Summary\n\n`;
report += `- **Type files scanned**: ${typeFiles.length}\n`;
report += `- **Properties found**: ${allProperties.length}\n`;
report += `- **Duplicate groups**: ${duplicates.length}\n\n`;

if (duplicates.length === 0) {
  report += '✅ No obvious semantic duplicates found!\n';
} else {
  report += '## Duplicate Groups\n\n';
  report += 'These properties appear to track the same concept with different names:\n\n';

  for (const group of duplicates) {
    report += `### ${group.baseName} (${group.variants.length} variants)\n\n`;

    for (const variant of group.variants) {
      report += `- **${variant.fullPath}** (${variant.file})\n`;
    }

    report += '\n**Recommendation**: ';
    if (group.variants.length === 2) {
      report += 'Verify if these represent the same concept. If yes, consolidate to one.\n';
    } else {
      report += 'Multiple variants found - likely intentional, but verify naming is clear.\n';
    }
    report += '\n';
  }

  report += '## High-Priority Duplicates\n\n';
  report += 'Groups with 3+ variants (most likely to be unintentional):\n\n';

  const highPriority = duplicates.filter(g => g.variants.length >= 3);
  if (highPriority.length > 0) {
    for (const group of highPriority) {
      report += `- **${group.baseName}**: ${group.variants.map(v => v.propertyName).join(', ')}\n`;
    }
  } else {
    report += '_(None found)_\n';
  }
}

report += '\n## Notes\n\n';
report += '- **False positives**: Some duplicates may be intentional (e.g., different scales)\n';
report += '- **True duplicates**: Look for same concept in different subsystems\n';
report += '- **Action**: Review each group to determine if consolidation is needed\n';

const reportPath = path.join(__dirname, '../docs/semantic-duplicates.md');
fs.writeFileSync(reportPath, report);

console.log('✅ Done! Report: docs/semantic-duplicates.md\n');

if (duplicates.length > 0) {
  console.log('Top duplicate groups:');
  for (const group of duplicates.slice(0, 10)) {
    console.log(`  ${group.baseName}: ${group.variants.length} variants`);
  }
  console.log();
}
