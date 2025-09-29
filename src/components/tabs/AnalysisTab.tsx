'use client';

import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Activity,
  Target,
  Brain,
  Users,
  Building
} from 'lucide-react';

export default function AnalysisTab() {
  const { 
    globalMetrics, 
    outcomeMetrics, 
    aiAgents, 
    government, 
    society, 
    calculateEffectiveControl,
    currentMonth
  } = useGameStore();

  // Mock data for feedback loops - in full implementation this would be calculated
  const feedbackLoops = [
    { 
      id: 'trust-control', 
      name: 'Trust-Control Loop', 
      isPositive: false, 
      strength: 0.6,
      description: 'Low trust increases control desire, reducing AI capability and potentially causing resistance'
    },
    { 
      id: 'capability-arms-race', 
      name: 'Capability-Control Arms Race', 
      isPositive: false, 
      strength: 0.7,
      description: 'Rising AI capability reduces government control effectiveness, increasing control efforts'
    },
    { 
      id: 'economic-dependency', 
      name: 'Economic Dependency Trap', 
      isPositive: true, 
      strength: 0.4,
      description: 'High AI dependence reduces resistance to control but increases vulnerability'
    },
    { 
      id: 'unemployment-adaptation', 
      name: 'Unemployment-Adaptation Cycle', 
      isPositive: society.socialAdaptation > 0.5, 
      strength: 0.5,
      description: 'Job displacement drives adaptation or instability depending on response'
    }
  ];

  // Mock path dependencies
  const pathDependencies = [
    {
      id: 'early-regulation',
      name: 'Early Regulation Framework',
      isLocked: government.controlDesire > 0.7,
      lockStrength: 0.8,
      description: 'Strong early regulation creates institutional momentum'
    },
    {
      id: 'ai-integration',
      name: 'Economic AI Integration',
      isLocked: society.economicDependence > 0.6,
      lockStrength: society.economicDependence,
      description: 'Deep AI economic integration becomes difficult to reverse'
    },
    {
      id: 'coordination-patterns',
      name: 'AI Coordination Patterns',
      isLocked: aiAgents.some(ai => ai.capability > 0.5),
      lockStrength: 0.6,
      description: 'Established AI coordination methods become entrenched'
    }
  ];

  // Mock upcoming decision points
  const upcomingDecisions = [
    {
      id: 'tech-breakthrough',
      title: 'Major AI Breakthrough Anticipated',
      monthsUntil: Math.max(1, 15 - currentMonth),
      options: ['Accelerate Research', 'Increase Oversight', 'International Coordination'],
      probability: 0.7
    },
    {
      id: 'unemployment-crisis',
      title: 'Unemployment Crisis Point',
      monthsUntil: Math.max(1, 24 - currentMonth),
      options: ['UBI Implementation', 'Job Retraining', 'AI Restrictions'],
      probability: society.unemploymentLevel > 0.4 ? 0.8 : 0.3
    },
    {
      id: 'control-decision',
      title: 'Government Control Expansion',
      monthsUntil: Math.max(1, 18 - currentMonth),
      options: ['Surveillance Increase', 'Regulation Expansion', 'International Treaty'],
      probability: government.controlDesire > 0.6 ? 0.9 : 0.4
    }
  ].filter(decision => decision.monthsUntil > 0 && decision.probability > 0.3);

  // Critical threshold analysis
  const criticalThresholds = [
    {
      id: 'ai-capability',
      name: 'Total AI Capability',
      value: aiAgents.reduce((sum, ai) => sum + ai.capability, 0),
      trigger: 1.0,
      triggered: aiAgents.reduce((sum, ai) => sum + ai.capability, 0) > 1.0,
      risk: 'Potential loss of human control'
    },
    {
      id: 'trust-level',
      name: 'Social Trust in AI',
      value: society.trustInAI,
      trigger: 0.3,
      triggered: society.trustInAI < 0.3,
      risk: 'Social resistance and instability'
    },
    {
      id: 'government-control',
      name: 'Effective Government Control',
      value: calculateEffectiveControl(),
      trigger: 0.1,
      triggered: calculateEffectiveControl() < 0.1,
      risk: 'Complete loss of oversight'
    },
    {
      id: 'quality-of-life',
      name: 'Quality of Life',
      value: globalMetrics.qualityOfLife,
      trigger: 0.3,
      triggered: globalMetrics.qualityOfLife < 0.3,
      risk: 'Social collapse conditions'
    }
  ];

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Active Feedback Loops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Feedback Loops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackLoops.map(loop => (
                <div key={loop.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={loop.isPositive ? "default" : "destructive"} className="text-xs">
                      {loop.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </Badge>
                    <span className="text-sm font-medium">{loop.name}</span>
                  </div>
                  <Progress value={loop.strength * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {loop.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Critical Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalThresholds.map(threshold => (
                <div key={threshold.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{threshold.name}</span>
                    <Badge variant={threshold.triggered ? "destructive" : "outline"} className="text-xs">
                      {threshold.value.toFixed(2)} / {threshold.trigger}
                    </Badge>
                  </div>
                  <Progress 
                    value={(threshold.value / threshold.trigger) * 100} 
                    className="h-2"
                  />
                  {threshold.triggered && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{threshold.risk}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Path Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Path Dependencies & Lock-in Effects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {pathDependencies.map(dep => (
              <Alert key={dep.id} variant={dep.isLocked ? "destructive" : "default"}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dep.name}</span>
                      {dep.isLocked ? (
                        <Lock className="h-4 w-4 text-destructive" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs">
                      {dep.description}
                    </div>
                    {dep.isLocked && (
                      <div className="text-xs">
                        <span>Lock-in Strength: </span>
                        <Badge variant="outline" className="text-xs">
                          {(dep.lockStrength * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision Points Ahead */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Decision Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {upcomingDecisions.length > 0 ? (
                upcomingDecisions.map(decision => (
                  <div key={decision.id} className="border-l-4 border-primary pl-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{decision.title}</div>
                      <Badge variant="outline" className="text-xs">
                        {decision.monthsUntil} months
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Probability: {(decision.probability * 100).toFixed(0)}%
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {decision.options.map(option => (
                        <Badge key={option} variant="secondary" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No major decision points currently anticipated. Continue simulation to see emerging choices.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Average Alignment:</span>
                <Badge variant={aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / aiAgents.length > 0.6 ? "default" : "destructive"}>
                  {((aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / aiAgents.length) * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Escaped AIs:</span>
                <Badge variant={aiAgents.some(ai => ai.escaped) ? "destructive" : "default"}>
                  {aiAgents.filter(ai => ai.escaped).length} / {aiAgents.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Total Capability:</span>
                <span>{aiAgents.reduce((sum, ai) => sum + ai.capability, 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4" />
              Government Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Control Effectiveness:</span>
                <span>{(calculateEffectiveControl() * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Legitimacy:</span>
                <Badge variant={government.legitimacy > 0.6 ? "default" : "secondary"}>
                  {(government.legitimacy * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Regulations:</span>
                <span>{government.activeRegulations.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Social Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Social Stability:</span>
                <Badge variant={globalMetrics.socialStability > 0.6 ? "default" : "destructive"}>
                  {(globalMetrics.socialStability * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Trust in AI:</span>
                <Badge variant={society.trustInAI > 0.5 ? "default" : "secondary"}>
                  {(society.trustInAI * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Coordination:</span>
                <span>{(society.coordinationCapacity * 100).toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
