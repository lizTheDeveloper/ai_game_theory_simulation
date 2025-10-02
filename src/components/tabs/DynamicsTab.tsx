'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

type MetricKey = 
  | 'unemployment' 
  | 'socialAdaptation' 
  | 'trustInAI' 
  | 'totalAICapability'
  | 'avgAIAlignment'
  | 'effectiveControl'
  | 'wealthDistribution'
  | 'socialStability'
  | 'economicStage'
  | 'qualityOfLife'
  | 'governmentLegitimacy'
  | 'coordinationCapacity'
  | 'economicDependence';

interface MetricDefinition {
  key: MetricKey;
  label: string;
  color: string;
  getValue: (state: any) => number;
  max: number;
  unit: string;
  category: 'economy' | 'society' | 'ai' | 'government';
}

const METRICS: MetricDefinition[] = [
  // Economy
  {
    key: 'unemployment',
    label: 'Unemployment Level',
    color: '#ef4444',
    getValue: (state) => state.society.unemploymentLevel,
    max: 1,
    unit: '%',
    category: 'economy'
  },
  {
    key: 'economicStage',
    label: 'Economic Stage',
    color: '#8b5cf6',
    getValue: (state) => state.globalMetrics.economicTransitionStage,
    max: 4,
    unit: '',
    category: 'economy'
  },
  {
    key: 'wealthDistribution',
    label: 'Wealth Distribution',
    color: '#10b981',
    getValue: (state) => state.globalMetrics.wealthDistribution,
    max: 1,
    unit: '%',
    category: 'economy'
  },
  {
    key: 'qualityOfLife',
    label: 'Quality of Life',
    color: '#3b82f6',
    getValue: (state) => state.globalMetrics.qualityOfLife,
    max: 3,
    unit: '',
    category: 'economy'
  },
  
  // Society
  {
    key: 'socialAdaptation',
    label: 'Social Adaptation',
    color: '#06b6d4',
    getValue: (state) => state.society.socialAdaptation,
    max: 1,
    unit: '%',
    category: 'society'
  },
  {
    key: 'trustInAI',
    label: 'Trust in AI',
    color: '#10b981',
    getValue: (state) => state.society.trustInAI,
    max: 1,
    unit: '%',
    category: 'society'
  },
  {
    key: 'socialStability',
    label: 'Social Stability',
    color: '#14b8a6',
    getValue: (state) => state.globalMetrics.socialStability,
    max: 1,
    unit: '%',
    category: 'society'
  },
  {
    key: 'coordinationCapacity',
    label: 'Coordination Capacity',
    color: '#8b5cf6',
    getValue: (state) => state.society.coordinationCapacity,
    max: 1,
    unit: '%',
    category: 'society'
  },
  {
    key: 'economicDependence',
    label: 'AI Economic Dependence',
    color: '#f59e0b',
    getValue: (state) => state.society.economicDependence,
    max: 1,
    unit: '%',
    category: 'society'
  },
  
  // AI
  {
    key: 'totalAICapability',
    label: 'Total AI Capability',
    color: '#a855f7',
    getValue: (state) => state.aiAgents.reduce((sum: number, ai: any) => sum + ai.capability, 0),
    max: 5,
    unit: '',
    category: 'ai'
  },
  {
    key: 'avgAIAlignment',
    label: 'Avg AI Alignment',
    color: '#22c55e',
    getValue: (state) => state.aiAgents.reduce((sum: number, ai: any) => sum + ai.alignment, 0) / state.aiAgents.length,
    max: 1,
    unit: '%',
    category: 'ai'
  },
  
  // Government
  {
    key: 'effectiveControl',
    label: 'Effective Control',
    color: '#3b82f6',
    getValue: (state) => {
      const totalAICapability = state.aiAgents.reduce((sum: number, ai: any) => sum + ai.capability, 0);
      const growthFactor = 1.5;
      return (state.government.controlDesire * state.government.capabilityToControl) / 
             (1 + Math.pow(totalAICapability, growthFactor));
    },
    max: 1,
    unit: '%',
    category: 'government'
  },
  {
    key: 'governmentLegitimacy',
    label: 'Government Legitimacy',
    color: '#06b6d4',
    getValue: (state) => state.government.legitimacy,
    max: 1,
    unit: '%',
    category: 'government'
  }
];

export default function DynamicsTab() {
  const state = useGameStore();
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['unemployment', 'socialAdaptation', 'trustInAI']);
  
  // Build history data from stored metrics history
  const chartData = state.history.metrics.map(dataPoint => {
    const point: any = { month: dataPoint.month };
    
    selectedMetrics.forEach(metricKey => {
      const metric = METRICS.find(m => m.key === metricKey);
      if (metric && dataPoint[metricKey] !== undefined) {
        point[metricKey] = dataPoint[metricKey] * (metric.unit === '%' ? 100 : 1);
      }
    });
    
    return point;
  });

  // Get current values with trends
  const getCurrentValue = (metric: MetricDefinition) => {
    const value = metric.getValue(state);
    const displayValue = metric.unit === '%' ? (value * 100).toFixed(1) + '%' : value.toFixed(2);
    return { value, displayValue };
  };

  const toggleMetric = (metricKey: MetricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        if (prev.length > 1) {
          return prev.filter(k => k !== metricKey);
        }
        return prev; // Keep at least one metric selected
      } else {
        if (prev.length >= 5) {
          return [...prev.slice(1), metricKey]; // Limit to 5 metrics
        }
        return [...prev, metricKey];
      }
    });
  };

  const categories = {
    economy: METRICS.filter(m => m.category === 'economy'),
    society: METRICS.filter(m => m.category === 'society'),
    ai: METRICS.filter(m => m.category === 'ai'),
    government: METRICS.filter(m => m.category === 'government')
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Dynamics Over Time
            <Badge variant="outline" className="ml-auto">
              {selectedMetrics.length} metric{selectedMetrics.length > 1 ? 's' : ''} selected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const metric = METRICS.find(m => m.key === name);
                  const unit = metric?.unit === '%' ? '%' : '';
                  return [value.toFixed(2) + unit, metric?.label || name];
                }}
                labelFormatter={(month) => `Month ${month}`}
                isAnimationActive={false}
              />
              <Legend 
                formatter={(value) => {
                  const metric = METRICS.find(m => m.key === value);
                  return metric?.label || value;
                }}
              />
              {selectedMetrics.map(metricKey => {
                const metric = METRICS.find(m => m.key === metricKey);
                if (!metric) return null;
                return (
                  <Line 
                    key={metricKey}
                    type="monotone" 
                    dataKey={metricKey}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    name={metric.label}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Click metric cards below to add/remove from graph (max 5 metrics)
          </div>
        </CardContent>
      </Card>

      {/* Clickable Metric Cards by Category */}
      <div className="space-y-4">
        {/* Economy Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Economy Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {categories.economy.map(metric => {
                const { value, displayValue } = getCurrentValue(metric);
                const isSelected = selectedMetrics.includes(metric.key);
                
                return (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <div className="text-xs font-medium mb-1">{metric.label}</div>
                    <div className="text-lg font-bold" style={{ color: metric.color }}>
                      {displayValue}
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        On Graph
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Society Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Society Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {categories.society.map(metric => {
                const { value, displayValue } = getCurrentValue(metric);
                const isSelected = selectedMetrics.includes(metric.key);
                
                return (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <div className="text-xs font-medium mb-1">{metric.label}</div>
                    <div className="text-lg font-bold" style={{ color: metric.color }}>
                      {displayValue}
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        On Graph
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">AI Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {categories.ai.map(metric => {
                const { value, displayValue } = getCurrentValue(metric);
                const isSelected = selectedMetrics.includes(metric.key);
                
                return (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <div className="text-xs font-medium mb-1">{metric.label}</div>
                    <div className="text-lg font-bold" style={{ color: metric.color }}>
                      {displayValue}
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        On Graph
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Government Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Government Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {categories.government.map(metric => {
                const { value, displayValue } = getCurrentValue(metric);
                const isSelected = selectedMetrics.includes(metric.key);
                
                return (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <div className="text-xs font-medium mb-1">{metric.label}</div>
                    <div className="text-lg font-bold" style={{ color: metric.color }}>
                      {displayValue}
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        On Graph
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

