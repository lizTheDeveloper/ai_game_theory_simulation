'use client';

import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Building, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AgentsTab() {
  const { aiAgents, government, society } = useGameStore();

  return (
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

                  {/* Hidden Attributes (partially revealed) */}
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Hidden Objective:</span>
                      <Badge variant="outline" className="text-xs">
                        {agent.hiddenObjective > 0.2 ? "Pro-human" : 
                         agent.hiddenObjective < -0.2 ? "Anti-human" : "Neutral"}
                      </Badge>
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
                    <div className="space-y-1">
                      {government.activeRegulations.map((reg, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reg}
                        </Badge>
                      ))}
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
  );
}
