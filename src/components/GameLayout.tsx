'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  FastForward, 
  Settings, 
  ChevronUp,
  Heart,
  Users,
  Shield,
  TrendingUp,
  Brain,
  Building,
  Zap
} from 'lucide-react';

// Individual tab components
import OverviewTab from './tabs/OverviewTab';
import AgentsTab from './tabs/AgentsTab';
import DynamicsTab from './tabs/DynamicsTab';
import TechnologyTab from './tabs/TechnologyTab';
import EconomyTab from './tabs/EconomyTab';
import ControlsTab from './tabs/ControlsTab';
import AnalysisTab from './tabs/AnalysisTab';
import ActionsSidebar from './ActionsSidebar';

// Metric card component
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
        {percentage.toFixed(0)}%
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default function GameLayout() {
  const { 
    currentMonth,
    currentDay,
    speed, 
    gameStarted,
    globalMetrics,
    outcomeMetrics,
    eventLog,
    history,
    dispatch,
    startGame,
    pauseGame,
    resetGame,
    processMonthlyUpdate,
    processDailyUpdate,
    getCurrentDateString,
    getMonthProgress
  } = useGameStore();

  // Simulation loop - day-based timing
  useEffect(() => {
    if (speed === 'paused' || !gameStarted) return;

    const speedMap = {
      slow: 2000,    // 2 seconds per day (slow)
      normal: 1000,  // 1 second per day (immersive)
      fast: 500,     // 0.5 seconds per day (fast)
      max: 100       // 0.1 seconds per day (max speed)
    };

    const interval = setInterval(() => {
      const currentState = useGameStore.getState();
      const isLastDayOfMonth = currentState.currentDay >= currentState.daysInCurrentMonth;
      
      // Advance the day
      dispatch({ type: 'ADVANCE_DAY' });
      processDailyUpdate();
      
      // If we just completed a month, run monthly processing
      if (isLastDayOfMonth) {
        processMonthlyUpdate();
      }
    }, speedMap[speed]);

    return () => clearInterval(interval);
  }, [speed, gameStarted, dispatch, processDailyUpdate, processMonthlyUpdate]);

  const handleSpeedChange = (newSpeed: typeof speed) => {
    dispatch({ type: 'SET_SPEED', payload: newSpeed });
  };

  const handlePlayPause = () => {
    if (speed === 'paused') {
      if (!gameStarted) {
        startGame();
      } else {
        dispatch({ type: 'SET_SPEED', payload: 'normal' });
      }
    } else {
      pauseGame();
    }
  };

  const getYear = () => Math.floor(currentMonth / 12) + 2025;
  const getMonthName = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[currentMonth % 12];
  };

  const recentEvents = eventLog.slice(-10).reverse();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        {/* Left: Time Controls */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePlayPause}
          >
            {speed === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleSpeedChange('fast')}
            disabled={speed === 'paused'}
          >
            <FastForward className="h-4 w-4" />
          </Button>
          <Select value={speed} onValueChange={handleSpeedChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="slow">0.5x</SelectItem>
              <SelectItem value="normal">1x</SelectItem>
              <SelectItem value="fast">2x</SelectItem>
              <SelectItem value="max">5x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Center: Current Date and Month Progress */}
        <div className="flex flex-col items-center gap-2 min-w-64">
          <div className="text-lg font-semibold">
            {getCurrentDateString()}
          </div>
          <div className="w-full">
            <Progress value={getMonthProgress() * 100} className="h-2" />
            <div className="text-xs text-muted-foreground text-center mt-1">
              Month Progress: {Math.round(getMonthProgress() * 100)}%
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetGame}>Reset</Button>
          <Button variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="dynamics">Dynamics</TabsTrigger>
              <TabsTrigger value="technology">Technology</TabsTrigger>
              <TabsTrigger value="economy">Economy</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="agents" className="h-full">
                <AgentsTab />
              </TabsContent>
              <TabsContent value="dynamics" className="h-full">
                <DynamicsTab />
              </TabsContent>
              <TabsContent value="technology" className="h-full">
                <TechnologyTab />
              </TabsContent>
              <TabsContent value="economy" className="h-full">
                <EconomyTab />
              </TabsContent>
              <TabsContent value="controls" className="h-full">
                <ControlsTab />
              </TabsContent>
              <TabsContent value="analysis" className="h-full">
                <AnalysisTab />
              </TabsContent>
            </div>
          </Tabs>

          {/* Bottom Panel - Event Log */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 border-t">
                <span>Event Log ({recentEvents.length} recent events)</span>
                <ChevronUp className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t">
                <ScrollArea className="h-32 p-4">
                  <div className="space-y-2">
                    {recentEvents.map(event => (
                      <div key={event.id} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground">
                          [Month {event.timestamp}]
                        </span>
                        <Badge variant={event.severity === 'info' ? 'default' : 
                                     event.severity === 'warning' ? 'secondary' : 'destructive'} className="text-xs">
                          {event.type}
                        </Badge>
                        <span>{event.description}</span>
                      </div>
                    ))}
                    {recentEvents.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No events yet. Start the simulation to see activity.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Right Sidebar with Tabs */}
        <div className="w-80 border-l flex flex-col">
          <Tabs defaultValue="indicators" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="indicators" className="flex-1 overflow-hidden m-0">
              <div className="p-4 space-y-4 h-full overflow-y-auto">
                <h3 className="font-semibold">Key Indicators</h3>

                {/* Outcome Probabilities */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Outcome Probabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Utopia</span>
                        <span className="text-sm font-medium">
                          {(outcomeMetrics.utopiaProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={outcomeMetrics.utopiaProbability * 100} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dystopia</span>
                        <span className="text-sm font-medium">
                          {(outcomeMetrics.dystopiaProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={outcomeMetrics.dystopiaProbability * 100} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Extinction</span>
                        <span className="text-sm font-medium">
                          {(outcomeMetrics.extinctionProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={outcomeMetrics.extinctionProbability * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Critical Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <MetricCard 
                        label="Quality of Life"
                        value={globalMetrics.qualityOfLife}
                        max={1}
                        color="green"
                        icon={<Heart className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="Social Stability"
                        value={globalMetrics.socialStability}
                        max={1}
                        color="blue"
                        icon={<Users className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="Info Integrity"
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

                {/* Game Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Game Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={gameStarted ? 'default' : 'outline'}>
                          {gameStarted ? 'Running' : 'Ready'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span>{speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Attractor:</span>
                        <Badge variant={outcomeMetrics.activeAttractor === 'none' ? 'outline' : 'default'}>
                          {outcomeMetrics.activeAttractor}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="flex-1 overflow-hidden m-0">
              <ActionsSidebar />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
