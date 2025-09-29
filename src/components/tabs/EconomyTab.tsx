'use client';

import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { ECONOMIC_STAGE_NAMES } from '@/types/game';

export default function EconomyTab() {
  const { globalMetrics, society, history } = useGameStore();

  const economicStage = Math.floor(globalMetrics.economicTransitionStage);
  const stageProgress = (globalMetrics.economicTransitionStage % 1) * 100;

  // Mock sector data - in full implementation this would come from the store
  const sectorData = [
    { sector: 'Healthcare', integration: 30, risk: 20, benefit: 80 },
    { sector: 'Finance', integration: 60, risk: 70, benefit: 50 },
    { sector: 'Manufacturing', integration: 45, risk: 40, benefit: 70 },
    { sector: 'Legal', integration: 15, risk: 60, benefit: 40 },
    { sector: 'Media', integration: 50, risk: 55, benefit: 45 },
    { sector: 'Military', integration: 10, risk: 90, benefit: 60 },
  ];

  // Mock wealth distribution data
  const wealthDistribution = {
    top1Percent: 35,
    top10Percent: 25,
    middle40Percent: 30,
    bottom50Percent: 10
  };

  const getStageColor = (stage: number, currentStage: number) => {
    if (stage < currentStage) return 'bg-green-500 text-white';
    if (stage === currentStage) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getSectorRiskLevel = (risk: number) => {
    if (risk > 70) return { color: 'destructive', label: 'High Risk' };
    if (risk > 40) return { color: 'secondary', label: 'Medium Risk' };
    return { color: 'default', label: 'Low Risk' };
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      {/* Economic Transition Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Economic Transition Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              {[0, 1, 2, 3, 4].map(stage => (
                <div 
                  key={stage}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg text-center min-w-[120px]",
                    getStageColor(stage, economicStage)
                  )}
                >
                  <span className="text-sm font-medium">Stage {stage}</span>
                  <span className="text-xs mt-1">
                    {ECONOMIC_STAGE_NAMES[stage as keyof typeof ECONOMIC_STAGE_NAMES]}
                  </span>
                  {stage === economicStage && (
                    <div className="mt-2 w-full">
                      <Progress value={stageProgress} className="h-1" />
                      <span className="text-xs">{stageProgress.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Current stage: <strong>{ECONOMIC_STAGE_NAMES[economicStage as keyof typeof ECONOMIC_STAGE_NAMES]}</strong>
              {stageProgress > 0 && ` (${stageProgress.toFixed(0)}% progress to next stage)`}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* AI Sector Integration */}
        <Card>
          <CardHeader>
            <CardTitle>AI Integration by Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectorData.map(sector => {
                const riskLevel = getSectorRiskLevel(sector.risk);
                return (
                  <div key={sector.sector} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sector.sector}</span>
                      <div className="flex gap-2">
                        <Badge variant={riskLevel.color} className="text-xs">
                          {riskLevel.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {sector.integration}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Integration:</span>
                        <Progress value={sector.integration} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Benefit:</span>
                        <Progress value={sector.benefit} className="h-1 mt-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Wealth Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Wealth Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Top 1%</span>
                  <span>{wealthDistribution.top1Percent}%</span>
                </div>
                <Progress value={wealthDistribution.top1Percent} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Top 10%</span>
                  <span>{wealthDistribution.top10Percent}%</span>
                </div>
                <Progress value={wealthDistribution.top10Percent} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Middle 40%</span>
                  <span>{wealthDistribution.middle40Percent}%</span>
                </div>
                <Progress value={wealthDistribution.middle40Percent} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Bottom 50%</span>
                  <span>{wealthDistribution.bottom50Percent}%</span>
                </div>
                <Progress value={wealthDistribution.bottom50Percent} className="h-2" />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Distribution Index: {(globalMetrics.wealthDistribution * 100).toFixed(0)}% 
                (higher = more equal)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employment Dynamics */}
      <Card>
        <CardHeader>
          <CardTitle>Employment & Social Adaptation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Unemployment Rate
                  </span>
                  <span className="text-sm">{(society.unemploymentLevel * 100).toFixed(1)}%</span>
                </div>
                <Progress value={society.unemploymentLevel * 100} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Social Adaptation
                  </span>
                  <span className="text-sm">{(society.socialAdaptation * 100).toFixed(1)}%</span>
                </div>
                <Progress value={society.socialAdaptation * 100} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Economic Dependence on AI
                  </span>
                  <span className="text-sm">{(society.economicDependence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={society.economicDependence * 100} className="h-3" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Status Assessment */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {society.unemploymentLevel > 0.5 && society.socialAdaptation < 0.3 ? (
                    <span className="text-destructive font-medium">
                      ⚠️ Crisis Risk: High unemployment with low adaptation could lead to social instability
                    </span>
                  ) : society.unemploymentLevel > 0.7 && economicStage >= 3 ? (
                    <span className="text-green-600">
                      ✓ Post-Work Transition: High unemployment is expected in transition to post-scarcity
                    </span>
                  ) : society.socialAdaptation > 0.6 ? (
                    <span className="text-blue-600">
                      📈 Adapting Well: Society is successfully adapting to economic changes
                    </span>
                  ) : (
                    <span>
                      🔄 Economic Transition: Society is adapting to AI-driven changes
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Economic Stability:</span>
                  <Badge variant={globalMetrics.socialStability > 0.6 ? "default" : "destructive"}>
                    {globalMetrics.socialStability > 0.6 ? "Stable" : "Unstable"}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Transition Speed:</span>
                  <Badge variant="outline">
                    {globalMetrics.technologicalBreakthroughRate > 1.5 ? "Fast" : 
                     globalMetrics.technologicalBreakthroughRate > 0.8 ? "Moderate" : "Slow"}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Economic Model:</span>
                  <Badge variant="secondary">
                    {economicStage === 0 ? "Traditional" :
                     economicStage === 1 ? "Early Disruption" :
                     economicStage === 2 ? "Crisis Period" :
                     economicStage === 3 ? "Transition Policies" :
                     "Post-Scarcity"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
