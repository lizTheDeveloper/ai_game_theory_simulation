import { AIAgent } from '@/types/game';

export interface AgentDistribution {
  count: number;
  mean: number;
  median: number;
  quartiles: [number, number, number]; // Q1, Q2, Q3
  min: number;
  max: number;
  violinPlotBins: Array<{ value: number; count: number }>;
  outliers: AIAgent[];
}

/**
 * Calculate distribution statistics for agent metric
 */
export function calculateAgentDistribution(
  agents: AIAgent[],
  metric: (agent: AIAgent) => number,
  outlierThreshold: number = 2 // Standard deviations
): AgentDistribution {
  if (agents.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      quartiles: [0, 0, 0],
      min: 0,
      max: 0,
      violinPlotBins: [],
      outliers: [],
    };
  }

  const values = agents.map(metric).sort((a, b) => a - b);
  const count = values.length;

  // Calculate statistics
  const mean = values.reduce((a, b) => a + b, 0) / count;
  const median = values[Math.floor(count / 2)] || 0;
  const q1 = values[Math.floor(count * 0.25)] || 0;
  const q3 = values[Math.floor(count * 0.75)] || 0;
  const min = values[0] || 0;
  const max = values[values.length - 1] || 0;

  // Violin plot bins (20 bins)
  const binCount = 20;
  const binSize = (max - min) / binCount || 0.1;
  const violinPlotBins = Array.from({ length: binCount }, (_, i) => {
    const binMin = min + i * binSize;
    const binMax = binMin + binSize;
    const count = values.filter(v => v >= binMin && v < binMax).length;
    return { value: binMin + binSize / 2, count };
  });

  // Detect outliers (beyond 2 standard deviations)
  const stdDev = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count
  );
  const outliers = agents.filter(agent => {
    const value = metric(agent);
    return Math.abs(value - mean) > outlierThreshold * stdDev;
  });

  return {
    count,
    mean,
    median,
    quartiles: [q1, median, q3],
    min,
    max,
    violinPlotBins,
    outliers,
  };
}
