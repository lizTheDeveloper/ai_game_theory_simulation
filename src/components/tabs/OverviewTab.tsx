'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, Shield, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line 
} from 'recharts';

interface MetricCardProps {
  label: string;
  value: number;
  max: number;
  color: 'green' | 'blue' | 'red' | 'amber' | 'purple';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, max, color, icon }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600', 
    red: 'text-red-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={colorClasses[color]}>{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold">
        {value > 1 ? value.toFixed(1) : (percentage.toFixed(0) + '%')}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default function OverviewTab() {
  const { globalMetrics, history, calculateEffectiveControl } = useGameStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare chart data
  const outcomeHistoryData = history.outcomeProbs.map(point => ({
    month: point.month,
    utopia: point.utopia * 100,
    dystopia: point.dystopia * 100,
    extinction: point.extinction * 100
  }));

  const controlCapabilityData = history.controlCapability.map(point => ({
    month: point.month,
    effectiveControl: point.effectiveControl * 100,
    totalAICapability: point.totalAICapability * 100
  }));

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Outcome Trajectories Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Outcome Trajectories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={outcomeHistoryData} isAnimationActive={false}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="utopia" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Utopia"
                  isAnimationActive={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="dystopia" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="Dystopia"
                  isAnimationActive={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="extinction" 
                  stackId="1" 
                  stroke="#1f2937" 
                  fill="#1f2937" 
                  fillOpacity={0.6}
                  name="Extinction"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Control vs Capability Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Control vs AI Capability</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Control</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Capabilities</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={controlCapabilityData} isAnimationActive={false}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="effectiveControl" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Effective Control"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAICapability" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Total AI Capability"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Global Metrics Grid */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Critical Global Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <MetricCard 
              label="Quality of Life"
              value={globalMetrics.qualityOfLife}
              max={2} // Can exceed 1 in utopian scenarios
              color="green"
              icon={<Heart className="h-4 w-4" />}
            />
            <MetricCard 
              label="Social Stability"
              value={globalMetrics.socialStability}
              max={2}
              color="blue"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard 
              label="Information Integrity"
              value={globalMetrics.informationIntegrity}
              max={1}
              color="purple"
              icon={<Shield className="h-4 w-4" />}
            />
            <MetricCard 
              label="Economic Stage"
              value={globalMetrics.economicTransitionStage}
              max={4}
              color="amber"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Global Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Manufacturing & Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Manufacturing Capability</span>
                  <span>{globalMetrics.manufacturingCapability.toFixed(1)}x</span>
                </div>
                <Progress value={(globalMetrics.manufacturingCapability / 3) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Tech Breakthrough Rate</span>
                  <span>{globalMetrics.technologicalBreakthroughRate.toFixed(1)}x</span>
                </div>
                <Progress value={(globalMetrics.technologicalBreakthroughRate / 2) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Economic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Wealth Distribution</span>
                  <span>{(globalMetrics.wealthDistribution * 100).toFixed(0)}%</span>
                </div>
                <Progress value={globalMetrics.wealthDistribution * 100} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Economic Stage: {globalMetrics.economicTransitionStage === 0 ? 'Traditional' :
                                globalMetrics.economicTransitionStage === 1 ? 'Displacement' :
                                globalMetrics.economicTransitionStage === 2 ? 'Crisis' :
                                globalMetrics.economicTransitionStage === 3 ? 'Transition' :
                                'Post-Scarcity'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Situation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Effective Control:</span>
                <span>{mounted ? (calculateEffectiveControl() * 100).toFixed(0) : '--'}%</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Score:</span>
                <span className={globalMetrics.qualityOfLife > 0.7 ? 'text-green-600' : 
                                globalMetrics.qualityOfLife < 0.3 ? 'text-red-600' : 'text-amber-600'}>
                  {globalMetrics.qualityOfLife.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                {globalMetrics.qualityOfLife > 0.7 && globalMetrics.informationIntegrity > 0.7 && 
                 globalMetrics.socialStability > 0.7 ? '🌟 On track for positive outcome' :
                 globalMetrics.qualityOfLife < 0.3 || globalMetrics.socialStability < 0.3 ? 
                 '⚠️ Critical situation developing' :
                 '🔄 Outcome uncertain, trajectory changing'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
