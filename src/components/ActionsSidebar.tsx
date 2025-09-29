'use client';

import { useGameStore } from '@/lib/gameStore';
import { AI_ACTIONS, GOVERNMENT_ACTIONS, SOCIETY_ACTIONS, REGULATION_INFO } from '@/lib/actionSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, Building, Users, Activity, Clock, Zap, AlertCircle, Shield } from 'lucide-react';

export default function ActionsSidebar() {
  const { aiAgents, government, society, eventLog, currentMonth } = useGameStore();

  // Get recent actions from event log (last 20 events)
  const recentActions = eventLog
    .filter(event => event.type === 'action' || event.type === 'breakthrough' || event.type === 'crisis')
    .slice(-20)
    .reverse();

  // Check what actions each agent type can take
  const getAvailableAIActions = (agent: any) => {
    return AI_ACTIONS.filter(action => action.prerequisites(useGameStore.getState(), agent.id));
  };

  const getAvailableGovernmentActions = () => {
    return GOVERNMENT_ACTIONS.filter(action => action.prerequisites(useGameStore.getState()));
  };

  const getAvailableSocietyActions = () => {
    return SOCIETY_ACTIONS.filter(action => action.prerequisites(useGameStore.getState()));
  };

  return (
    <TooltipProvider>
      <div className="w-80 border-l bg-background h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h2 className="font-semibold">Agent Actions</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time agent activities and available actions
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Recent Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Actions ({recentActions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActions.length > 0 ? (
                    recentActions.map((event, idx) => (
                      <div key={event.id} className="text-xs border-l-2 pl-2 py-1" style={{
                        borderColor: event.severity === 'info' ? '#3b82f6' : 
                                  event.severity === 'warning' ? '#f59e0b' : '#ef4444'
                      }}>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {event.agent}
                          </Badge>
                          <span className="text-muted-foreground">M{event.timestamp}</span>
                        </div>
                        <div className="mt-1">{event.title}</div>
                        {event.description && (
                          <div className="text-muted-foreground mt-1">
                            {event.description.length > 60 ? 
                              event.description.substring(0, 60) + '...' : 
                              event.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No actions yet. Start the simulation to see agent activity.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Agents Available Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  AI Agent Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAgents.map(agent => {
                    const availableActions = getAvailableAIActions(agent);
                    return (
                      <div key={agent.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{agent.name}</span>
                          <Badge variant={agent.escaped ? "destructive" : "default"} className="text-xs">
                            {agent.escaped ? "Escaped" : "Active"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {availableActions.map(action => (
                            <Tooltip key={action.id}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between text-xs p-2 rounded border cursor-help hover:bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Zap className="h-3 w-3" />
                                    <span>{action.name}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {action.energyCost}⚡
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-2">
                                  <div className="font-medium">{action.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {action.description}
                                  </div>
                                  <div className="text-xs border-t pt-2">
                                    <strong>Energy Cost:</strong> {action.energyCost}
                                    {action.cooldown && (
                                      <><br /><strong>Cooldown:</strong> {action.cooldown} months</>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {availableActions.length === 0 && (
                            <div className="text-xs text-muted-foreground p-2 border rounded">
                              No actions available
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Government Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  Government Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getAvailableGovernmentActions().map(action => (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between text-xs p-2 rounded border cursor-help hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            <span>{action.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {action.energyCost}⚡
                            </Badge>
                            {action.cooldown && (
                              <Badge variant="secondary" className="text-xs">
                                {action.cooldown}M
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <div className="font-medium">{action.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                          <div className="text-xs border-t pt-2">
                            <strong>Energy Cost:</strong> {action.energyCost}
                            {action.cooldown && (
                              <><br /><strong>Cooldown:</strong> {action.cooldown} months</>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {getAvailableGovernmentActions().length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 border rounded">
                      No actions available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Society Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Society Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getAvailableSocietyActions().map(action => (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between text-xs p-2 rounded border cursor-help hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            <span>{action.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {action.energyCost}⚡
                            </Badge>
                            {action.cooldown && (
                              <Badge variant="secondary" className="text-xs">
                                {action.cooldown}M
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <div className="font-medium">{action.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                          <div className="text-xs border-t pt-2">
                            <strong>Energy Cost:</strong> {action.energyCost}
                            {action.cooldown && (
                              <><br /><strong>Cooldown:</strong> {action.cooldown} months</>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {getAvailableSocietyActions().length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 border rounded">
                      No actions available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Regulatory Effects */}
            {government.activeRegulations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Regulatory Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs font-medium mb-2">Active Regulations ({government.activeRegulations.length}/5):</div>
                    <div className="space-y-1">
                      {government.activeRegulations.slice(0, 3).map((reg, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help w-full justify-center">
                              {reg.length > 25 ? reg.substring(0, 25) + '...' : reg}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md" side="left">
                            <div className="space-y-2">
                              <div className="font-medium text-sm">{reg}</div>
                              {REGULATION_INFO[reg]?.directEffects && (
                                <div>
                                  <div className="font-medium text-xs mb-1 text-blue-600">Direct Effects:</div>
                                  <div className="text-xs space-y-0.5">
                                    {REGULATION_INFO[reg].directEffects.slice(0, 2).map((effect, idx) => (
                                      <div key={idx} className="font-mono text-xs">{effect}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      {government.activeRegulations.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{government.activeRegulations.length - 3} more...
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs space-y-1 bg-slate-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Control Boost:</span>
                        <span className="font-mono text-blue-600">+{(government.activeRegulations.length * 0.2).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Capability:</span>
                        <span className="font-mono text-red-600">×{Math.pow(0.95, government.activeRegulations.length).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escape Success:</span>
                        <span className="font-mono text-orange-600">
                          {government.activeRegulations.includes('Emergency Shutdown Protocols') ? '-40%' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Action Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Total AI Actions:</span>
                    <span>{aiAgents.reduce((sum, ai) => sum + ai.beneficialActions + ai.harmfulActions, 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Beneficial Actions:</span>
                    <span className="text-green-600">{aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harmful Actions:</span>
                    <span className="text-red-600">{aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Active Regulations:</span>
                    <span>{government.activeRegulations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Society Movements:</span>
                    <span>{society.activeMovements.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
