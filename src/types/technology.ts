// Technology Types

export interface TechnologyNode {
  id: string;
  name: string;
  description: string;
  branch: 'foundation' | 'applied' | 'alignment' | 'policy';
  subBranch: string;
  difficulty: 'low' | 'medium' | 'high' | 'very_high';
  prerequisites: string[];
  effects: string[];
  progress: number; // [0,1] Research progress
  completed: boolean;
  investment: number; // Current research investment
}
