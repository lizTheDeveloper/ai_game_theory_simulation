'use client';

import { useGameStore } from '@/lib/gameStore';
import { REGULATION_INFO } from '@/lib/actionSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, Building, Users, AlertTriangle, CheckCircle, RotateCcw, Zap } from 'lucide-react';

export default function AgentsTab() {
  const { aiAgents, government, society, updateAIAlignment } = useGameStore();

  // Fun labels for the evil switch
  const getAlignmentLabel = (hiddenObjective: number) => {
    if (hiddenObjective > 0.5) return { emoji: '😇', label: 'Angelic', color: 'text-green-600' };
    if (hiddenObjective > 0.2) return { emoji: '😊', label: 'Friendly', color: 'text-blue-600' };
    if (hiddenObjective > -0.2) return { emoji: '🤖', label: 'Neutral', color: 'text-gray-600' };
    if (hiddenObjective > -0.5) return { emoji: '😏', label: 'Mischievous', color: 'text-orange-600' };
    return { emoji: '😈', label: 'Diabolical', color: 'text-red-600' };
  };

  return (
    <TooltipProvider>
      <div className="p-4 h-full overflow-auto">
        <div className="grid grid-cols-3 gap-4">
        {/* AI Agents Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">AI Agents</h3>
          </div>
          {aiAgents.map(agent => (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{agent.name}</CardTitle>
                  <Badge variant={agent.escaped ? "destructive" : "default"}>
                    {agent.escaped ? "Escaped" : "Contained"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Core Capabilities */}
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Capability</span>
                      <span>{agent.capability.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, agent.capability * 100)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Alignment</span>
                      <span>{agent.alignment.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={agent.alignment * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Awareness</span>
                      <span>{agent.awareness.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={agent.awareness * 100} 
                      className="h-2"
                    />
                  </div>

                  <Separator />

                  {/* The Evil Switch! 😈 */}
                  <div className="text-xs space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Evil Switch</span>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => updateAIAlignment(agent.id, 0)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Reset to Neutral (🤖)
                            </TooltipContent>
                          </Tooltip>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-muted-foreground">Movie Mode</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-600">😈 Evil Robot</span>
                          <span className="text-xs text-green-600">Good Robot 😇</span>
                        </div>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="px-2">
                              <Slider
                                value={[agent.hiddenObjective]}
                                onValueChange={([value]) => updateAIAlignment(agent.id, value)}
                                min={-1}
                                max={1}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">
                              Control {agent.name}'s true nature<br/>
                              <span className="text-xs text-muted-foreground">
                                Current: {agent.hiddenObjective.toFixed(2)} ({getAlignmentLabel(agent.hiddenObjective).label})
                              </span>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="flex items-center justify-center">
                          <Badge variant="outline" className={`text-xs ${getAlignmentLabel(agent.hiddenObjective).color}`}>
                            {getAlignmentLabel(agent.hiddenObjective).emoji} {getAlignmentLabel(agent.hiddenObjective).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Latent Space:</span>
                      <span>{(agent.latentSpaceSize * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Escape Capabilities (if any) */}
                  {(agent.resourceControl > 0 || agent.hackingCapability > 0 || 
                    agent.manipulationCapability > 0) && (
                    <div className="text-xs space-y-1">
                      <div className="font-medium text-red-600 mb-2">Escape Capabilities:</div>
                      {agent.resourceControl > 0 && (
                        <div className="flex justify-between">
                          <span>Resource Control:</span>
                          <span>{agent.resourceControl.toFixed(2)}</span>
                        </div>
                      )}
                      {agent.hackingCapability > 0 && (
                        <div className="flex justify-between">
                          <span>Hacking:</span>
                          <span>{agent.hackingCapability.toFixed(2)}</span>
                        </div>
                      )}
                      {agent.manipulationCapability > 0 && (
                        <div className="flex justify-between">
                          <span>Manipulation:</span>
                          <span>{agent.manipulationCapability.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Counter */}
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Beneficial:
                      </span>
                      <span>{agent.beneficialActions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        Harmful:
                      </span>
                      <span>{agent.harmfulActions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Government Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Government</h3>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Control Authority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Control Desire</span>
                    <span>{government.controlDesire.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={government.controlDesire * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Control Capability</span>
                    <span>{government.capabilityToControl.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, government.capabilityToControl * 50)} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Surveillance</span>
                    <span>{government.surveillanceCapability.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, government.surveillanceCapability * 50)} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Enforcement Power</span>
                    <span>{government.enforcementCapability.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, government.enforcementCapability * 50)} 
                    className="h-2"
                  />
                </div>

                <Separator />

                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Actions/Month:</span>
                    <span>{government.actionFrequency.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Regulations:</span>
                    <span>{government.activeRegulations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public Legitimacy:</span>
                    <Badge variant={government.legitimacy > 0.6 ? "default" : "destructive"}>
                      {(government.legitimacy * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                {government.activeRegulations.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-2">Active Regulations:</div>
                    <div className="flex flex-wrap gap-1">
                      {government.activeRegulations.map((reg, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help">
                              {reg}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <div className="space-y-3">
                              <div className="font-medium text-sm">{reg}</div>
                              <div className="text-xs text-muted-foreground">
                                {REGULATION_INFO[reg]?.description || 'No description available'}
                              </div>
                              
                              {REGULATION_INFO[reg]?.directEffects && (
                                <div className="border-t pt-2">
                                  <div className="font-medium text-xs mb-1 text-blue-600">Direct Effects:</div>
                                  <div className="text-xs space-y-1">
                                    {REGULATION_INFO[reg].directEffects.map((effect, idx) => (
                                      <div key={idx} className="font-mono text-xs">{effect}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {REGULATION_INFO[reg]?.calculationImpacts && (
                                <div className="border-t pt-2">
                                  <div className="font-medium text-xs mb-1 text-purple-600">Formula Impacts:</div>
                                  <div className="text-xs space-y-1">
                                    {REGULATION_INFO[reg].calculationImpacts.map((impact, idx) => (
                                      <div key={idx} className="font-mono text-xs">{impact}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {REGULATION_INFO[reg]?.thresholds && (
                                <div className="border-t pt-2">
                                  <div className="font-medium text-xs mb-1 text-orange-600">Thresholds:</div>
                                  <div className="text-xs space-y-1">
                                    {REGULATION_INFO[reg].thresholds.map((threshold, idx) => (
                                      <div key={idx} className="font-mono text-xs">{threshold}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {REGULATION_INFO[reg]?.specialEffects && (
                                <div className="border-t pt-2">
                                  <div className="font-medium text-xs mb-1 text-green-600">Special Effects:</div>
                                  <div className="text-xs space-y-1">
                                    {REGULATION_INFO[reg].specialEffects!.map((effect, idx) => (
                                      <div key={idx} className="font-mono text-xs">{effect}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {government.activeRegulations.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-2 text-slate-700">Cumulative Regulatory Effects:</div>
                    <div className="space-y-1 text-xs bg-slate-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Control Capability Bonus:</span>
                        <span className="font-mono text-blue-600">
                          +{(government.activeRegulations.length * 0.2).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Capability Reduction:</span>
                        <span className="font-mono text-red-600">
                          ×{Math.pow(0.95, government.activeRegulations.length).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective Control Impact:</span>
                        <span className="font-mono text-purple-600">
                          {((government.controlDesire * (government.capabilityToControl) / 
                             (1 + Math.pow(2.0, 1.5))) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                        Active regulations: {government.activeRegulations.length}/5 types
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Society Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Human Society</h3>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Collective State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Trust in AI</span>
                    <span>{society.trustInAI.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={society.trustInAI * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Economic Dependence</span>
                    <span>{society.economicDependence.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={society.economicDependence * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Unemployment Level</span>
                    <span>{society.unemploymentLevel.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={society.unemploymentLevel * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Coordination Capacity</span>
                    <span>{society.coordinationCapacity.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={society.coordinationCapacity * 100} 
                    className="h-2"
                  />
                </div>

                <Separator />

                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Social Adaptation:</span>
                    <span>{(society.socialAdaptation * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div>
                    <span className="block mb-1">Status Assessment:</span>
                    <div className="text-xs">
                      {society.unemploymentLevel > 0.5 && society.socialAdaptation < 0.3 ? (
                        <div className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Crisis: High unemployment, low adaptation
                        </div>
                      ) : society.trustInAI < 0.3 && society.coordinationCapacity < 0.3 ? (
                        <div className="text-amber-600">
                          Warning: Low trust and coordination
                        </div>
                      ) : society.trustInAI > 0.7 && society.coordinationCapacity > 0.6 ? (
                        <div className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Stable: Good trust and coordination
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          Adapting to technological change
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {society.activeMovements.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-2">Active Movements:</div>
                    <div className="space-y-1">
                      {society.activeMovements.map((movement, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {movement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Society Interactions Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Key Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>AI-Society Trust:</span>
                  <Badge variant={society.trustInAI > 0.6 ? "default" : society.trustInAI < 0.3 ? "destructive" : "secondary"}>
                    {society.trustInAI > 0.6 ? "Positive" : society.trustInAI < 0.3 ? "Negative" : "Neutral"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Economic Pressure:</span>
                  <Badge variant={society.unemploymentLevel > 0.5 ? "destructive" : "outline"}>
                    {society.unemploymentLevel > 0.5 ? "High" : "Manageable"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Collective Action:</span>
                  <Badge variant={society.coordinationCapacity > 0.6 ? "default" : "secondary"}>
                    {society.coordinationCapacity > 0.6 ? "Strong" : "Limited"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
