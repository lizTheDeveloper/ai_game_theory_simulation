'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Brain, Shield, Building2 } from 'lucide-react';

export default function TechnologyTab() {
  const { technologyTree } = useGameStore();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const selectedTechnology = technologyTree.find(tech => tech.id === selectedTech);

  const getBranchIcon = (branch: string) => {
    switch (branch) {
      case 'foundation': return <Zap className="h-4 w-4" />;
      case 'applied': return <Brain className="h-4 w-4" />;
      case 'alignment': return <Shield className="h-4 w-4" />;
      case 'policy': return <Building2 className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'foundation': return 'text-amber-600';
      case 'applied': return 'text-purple-600';
      case 'alignment': return 'text-green-600';
      case 'policy': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const groupedTechnologies = technologyTree.reduce((acc, tech) => {
    if (!acc[tech.branch]) acc[tech.branch] = [];
    acc[tech.branch].push(tech);
    return acc;
  }, {} as Record<string, typeof technologyTree>);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex gap-4 h-full">
        {/* Technology Tree Visualization (Simplified) */}
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Technology Tree</CardTitle>
              <div className="text-sm text-muted-foreground">
                Click on technologies to view details and adjust research investment
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {Object.entries(groupedTechnologies).map(([branch, technologies]) => (
                    <div key={branch} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={getBranchColor(branch)}>
                          {getBranchIcon(branch)}
                        </div>
                        <h3 className="font-semibold capitalize">
                          {branch} Technologies
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 ml-6">
                        {technologies.map(tech => (
                          <Card 
                            key={tech.id}
                            className={`cursor-pointer transition-colors ${
                              selectedTech === tech.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedTech(tech.id)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{tech.name}</span>
                                  <Badge variant={tech.completed ? "default" : "outline"} className="text-xs">
                                    {tech.completed ? "Complete" : tech.difficulty}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{(tech.progress * 100).toFixed(0)}%</span>
                                  </div>
                                  <Progress value={tech.progress * 100} className="h-1" />
                                </div>
                                
                                {tech.investment > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Investment: {tech.investment}%
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Selected Technology Detail */}
        <div className="w-96">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedTechnology?.name || "Select Technology"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTechnology ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Description</div>
                    <p className="text-sm text-muted-foreground">
                      {selectedTechnology.description}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Branch & Difficulty</div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <div className={getBranchColor(selectedTechnology.branch)}>
                          {getBranchIcon(selectedTechnology.branch)}
                        </div>
                        {selectedTechnology.branch}
                      </Badge>
                      <Badge variant="secondary">
                        {selectedTechnology.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Prerequisites</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTechnology.prerequisites.length > 0 ? (
                        selectedTechnology.prerequisites.map(prereq => (
                          <Badge key={prereq} variant="outline" className="text-xs">
                            {prereq}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Research Progress</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{(selectedTechnology.progress * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedTechnology.progress * 100} />
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Effects</div>
                    <ul className="text-sm space-y-1">
                      {selectedTechnology.effects.map((effect, i) => (
                        <li key={i} className="text-muted-foreground">
                          • {effect}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!selectedTechnology.completed && (
                    <div>
                      <div className="text-sm font-medium mb-2">Research Investment</div>
                      <div className="space-y-2">
                        <Slider 
                          value={[selectedTechnology.investment]} 
                          onValueChange={([value]) => {
                            // TODO: Update investment in store
                            console.log(`Setting ${selectedTechnology.name} investment to ${value}%`);
                          }}
                          max={100}
                          step={5}
                        />
                        <div className="text-xs text-muted-foreground">
                          Current: {selectedTechnology.investment}% of total research budget
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTechnology.completed && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm font-medium text-green-800 mb-1">
                        ✓ Research Complete
                      </div>
                      <div className="text-xs text-green-700">
                        This technology is fully researched and its effects are active.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Click on a technology in the tree to view details and manage research investment.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
