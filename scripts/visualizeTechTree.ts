#!/usr/bin/env npx tsx

/**
 * Tech Tree Visualization Script
 * 
 * Generates a Mermaid diagram showing all technologies, their dependencies,
 * unlock status, and deployment levels. Useful for understanding the tech tree
 * structure and debugging deployment issues.
 */

import { getAllTech, getTechById } from '../src/simulation/techTree/comprehensiveTechTree';
import { TechTreeState } from '../src/simulation/techTree/engine';
import { GameState } from '../src/types/game';

interface VisualizationOptions {
  showUnlockedOnly?: boolean;
  showDeploymentLevels?: boolean;
  showCosts?: boolean;
  showEffects?: boolean;
  groupByCategory?: boolean;
  maxDepth?: number;
  outputFormat?: 'mermaid' | 'json' | 'text';
}

/**
 * Generate Mermaid diagram of the tech tree
 */
function generateMermaidDiagram(
  techTreeState: TechTreeState,
  gameState: GameState,
  options: VisualizationOptions = {}
): string {
  const {
    showUnlockedOnly = false,
    showDeploymentLevels = true,
    showCosts = false,
    showEffects = false,
    groupByCategory = true,
    maxDepth = 3
  } = options;

  const allTech = getAllTech();
  const unlockedTech = techTreeState.unlockedTech;
  
  // Filter tech based on options
  let filteredTech = allTech;
  if (showUnlockedOnly) {
    filteredTech = allTech.filter(tech => unlockedTech.includes(tech.id));
  }

  let mermaid = 'graph TD\n';
  
  if (groupByCategory) {
    // Group by category
    const categories = new Map<string, string[]>();
    
    filteredTech.forEach(tech => {
      if (!categories.has(tech.category)) {
        categories.set(tech.category, []);
      }
      categories.get(tech.category)!.push(tech.id);
    });

    // Create subgraphs for each category
    categories.forEach((techIds, category) => {
      mermaid += `  subgraph ${category.toUpperCase()}\n`;
      
      techIds.forEach(techId => {
        const tech = getTechById(techId);
        if (tech) {
          const nodeId = techId.replace(/[^a-zA-Z0-9]/g, '_');
          const nodeLabel = generateNodeLabel(tech, techTreeState, gameState, options);
          const nodeStyle = getNodeStyle(tech, techTreeState, options);
          
          mermaid += `    ${nodeId}["${nodeLabel}"]\n`;
          mermaid += `    ${nodeId}${nodeStyle}\n`;
        }
      });
      
      mermaid += `  end\n\n`;
    });
  } else {
    // Flat structure
    filteredTech.forEach(tech => {
      const nodeId = tech.id.replace(/[^a-zA-Z0-9]/g, '_');
      const nodeLabel = generateNodeLabel(tech, techTreeState, gameState, options);
      const nodeStyle = getNodeStyle(tech, techTreeState, options);
      
      mermaid += `  ${nodeId}["${nodeLabel}"]\n`;
      mermaid += `  ${nodeId}${nodeStyle}\n`;
    });
  }

  // Add dependencies
  mermaid += '\n  %% Dependencies\n';
  filteredTech.forEach(tech => {
    const nodeId = tech.id.replace(/[^a-zA-Z0-9]/g, '_');
    
    tech.prerequisites.forEach(prereqId => {
      const prereqNodeId = prereqId.replace(/[^a-zA-Z0-9]/g, '_');
      const prereqTech = getTechById(prereqId);
      
      if (prereqTech && (!showUnlockedOnly || unlockedTech.includes(prereqId))) {
        mermaid += `  ${prereqNodeId} --> ${nodeId}\n`;
      }
    });
  });

  return mermaid;
}

/**
 * Generate node label for a technology
 */
function generateNodeLabel(
  tech: any,
  techTreeState: TechTreeState,
  gameState: GameState,
  options: VisualizationOptions
): string {
  let label = tech.name;
  
  if (options.showDeploymentLevels) {
    const deployment = getDeploymentLevel(tech.id, techTreeState);
    if (deployment > 0) {
      label += `\\n(${(deployment * 100).toFixed(0)}%)`;
    }
  }
  
  if (options.showCosts) {
    label += `\\n$${tech.deploymentCost}M`;
  }
  
  if (options.showEffects) {
    const effects = Object.keys(tech.effects || {});
    if (effects.length > 0) {
      label += `\\n[${effects.slice(0, 2).join(', ')}${effects.length > 2 ? '...' : ''}]`;
    }
  }
  
  return label;
}

/**
 * Get node style based on tech status
 */
function getNodeStyle(tech: any, techTreeState: TechTreeState, options: VisualizationOptions): string {
  const isUnlocked = techTreeState.unlockedTech.includes(tech.id);
  const deployment = getDeploymentLevel(tech.id, techTreeState);
  
  if (tech.status === 'unlocked') {
    return ':::unlocked';
  } else if (isUnlocked) {
    return ':::unlocked';
  } else if (deployment > 0) {
    return ':::deployed';
  } else {
    return ':::locked';
  }
}

/**
 * Get deployment level for a technology
 */
function getDeploymentLevel(techId: string, techTreeState: TechTreeState): number {
  // Check global deployment
  const globalDeployments = techTreeState.regionalDeployment['global'] || [];
  const globalDeployment = globalDeployments.find((d: any) => d.techId === techId);
  
  if (globalDeployment) {
    return globalDeployment.deploymentLevel;
  }
  
  // Check regional deployments
  for (const [region, deployments] of Object.entries(techTreeState.regionalDeployment)) {
    const deployment = deployments.find((d: any) => d.techId === techId);
    if (deployment && deployment.deploymentLevel > 0) {
      return deployment.deploymentLevel;
    }
  }
  
  return 0;
}

/**
 * Generate JSON output
 */
function generateJsonOutput(
  techTreeState: TechTreeState,
  gameState: GameState,
  options: VisualizationOptions = {}
): string {
  const allTech = getAllTech();
  const unlockedTech = techTreeState.unlockedTech;
  
  const output = {
    metadata: {
      totalTech: allTech.length,
      unlockedTech: unlockedTech.length,
      timestamp: new Date().toISOString(),
      options
    },
    technologies: allTech.map(tech => ({
      id: tech.id,
      name: tech.name,
      category: tech.category,
      status: tech.status,
      unlocked: unlockedTech.includes(tech.id),
      deploymentLevel: getDeploymentLevel(tech.id, techTreeState),
      prerequisites: tech.prerequisites,
      deploymentCost: tech.deploymentCost,
      researchCost: tech.researchCost,
      effects: tech.effects
    }))
  };
  
  return JSON.stringify(output, null, 2);
}

/**
 * Generate text output
 */
function generateTextOutput(
  techTreeState: TechTreeState,
  gameState: GameState,
  options: VisualizationOptions = {}
): string {
  const allTech = getAllTech();
  const unlockedTech = techTreeState.unlockedTech;
  
  let output = `Tech Tree Status Report\n`;
  output += `=====================\n\n`;
  output += `Total Technologies: ${allTech.length}\n`;
  output += `Unlocked Technologies: ${unlockedTech.length}\n`;
  output += `Timestamp: ${new Date().toISOString()}\n\n`;
  
  // Group by category
  const categories = new Map<string, any[]>();
  allTech.forEach(tech => {
    if (!categories.has(tech.category)) {
      categories.set(tech.category, []);
    }
    categories.get(tech.category)!.push(tech);
  });
  
  categories.forEach((techs, category) => {
    output += `${category.toUpperCase()}\n`;
    output += `${'='.repeat(category.length)}\n`;
    
    techs.forEach(tech => {
      const isUnlocked = unlockedTech.includes(tech.id);
      const deployment = getDeploymentLevel(tech.id, techTreeState);
      const status = isUnlocked ? 'UNLOCKED' : 'LOCKED';
      const deploymentStr = deployment > 0 ? ` (${(deployment * 100).toFixed(0)}% deployed)` : '';
      
      output += `  ${tech.name} [${status}]${deploymentStr}\n`;
      output += `    ID: ${tech.id}\n`;
      output += `    Cost: $${tech.deploymentCost}M\n`;
      if (tech.prerequisites.length > 0) {
        output += `    Prerequisites: ${tech.prerequisites.join(', ')}\n`;
      }
      if (Object.keys(tech.effects || {}).length > 0) {
        output += `    Effects: ${Object.keys(tech.effects).join(', ')}\n`;
      }
      output += `\n`;
    });
  });
  
  return output;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const options: VisualizationOptions = {
    showUnlockedOnly: args.includes('--unlocked-only'),
    showDeploymentLevels: args.includes('--deployment'),
    showCosts: args.includes('--costs'),
    showEffects: args.includes('--effects'),
    groupByCategory: !args.includes('--flat'),
    maxDepth: 3
  };
  
  // Determine output format
  if (args.includes('--json')) {
    options.outputFormat = 'json';
  } else if (args.includes('--text')) {
    options.outputFormat = 'text';
  } else {
    options.outputFormat = 'mermaid';
  }
  
  // Create mock tech tree state for visualization
  const mockTechTreeState: TechTreeState = {
    unlockedTech: new Set(),
    researchProgress: new Map(),
    regionalDeployment: new Map(),
    pendingActions: [],
    unlockHistory: []
  };
  
  // Create mock game state
  const mockGameState: GameState = {
    currentYear: 2025,
    currentMonth: 0,
    config: { seed: 'visualization' }
  } as GameState;
  
  // Initialize with some unlocked tech for demo
  const allTech = getAllTech();
  allTech.forEach(tech => {
    if (tech.status === 'unlocked') {
      mockTechTreeState.unlockedTech.add(tech.id);
    }
  });
  
  let output: string;
  
  switch (options.outputFormat) {
    case 'json':
      output = generateJsonOutput(mockTechTreeState, mockGameState, options);
      break;
    case 'text':
      output = generateTextOutput(mockTechTreeState, mockGameState, options);
      break;
    default:
      output = generateMermaidDiagram(mockTechTreeState, mockGameState, options);
      break;
  }
  
  console.log(output);
}

// Add Mermaid styles
const mermaidStyles = `
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#ff6b6b',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#ff5252',
    'lineColor': '#666',
    'sectionBkgColor': '#f8f9fa',
    'altSectionBkgColor': '#e9ecef',
    'gridColor': '#dee2e6',
    'secondaryColor': '#4ecdc4',
    'tertiaryColor': '#45b7d1'
  }
}}%%

classDef unlocked fill:#4ecdc4,stroke:#45b7d1,stroke-width:2px,color:#fff
classDef deployed fill:#45b7d1,stroke:#4ecdc4,stroke-width:3px,color:#fff
classDef locked fill:#ff6b6b,stroke:#ff5252,stroke-width:2px,color:#fff
`;

if (require.main === module) {
  main();
}

export {
  generateMermaidDiagram,
  generateJsonOutput,
  generateTextOutput,
  VisualizationOptions
};
