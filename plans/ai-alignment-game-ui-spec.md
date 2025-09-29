# AI Alignment Game - User Interface Specification

## Overall Architecture

### State Management
```typescript
// Global game state (Redux/Zustand recommended)
interface GameState {
  currentMonth: number;
  speed: 'paused' | 'slow' | 'normal' | 'fast' | 'max';
  agents: {
    ai: AIAgent[];
    government: GovernmentAgent;
    society: SocietyAgent;
  };
  globalMetrics: GlobalMetrics;
  technologyTree: TechnologyNode[];
  eventLog: GameEvent[];
  outcomeTrackers: OutcomeMetrics;
  configSettings: ConfigurationSettings;
}
```

### Layout Structure
- **Fixed Header**: Time controls, current date, speed controls
- **Main Content Area**: Tabbed interface for different views
- **Right Sidebar**: Key metrics dashboard (always visible)
- **Bottom Panel**: Event log and notifications (collapsible)

---

## Screen 1: Main Dashboard

### Header Bar
```tsx
<div className="flex items-center justify-between border-b p-4">
  {/* Left: Time Controls */}
  <div className="flex items-center gap-4">
    <Button variant="outline" size="icon"><Pause /></Button>
    <Button variant="outline" size="icon"><Play /></Button>
    <Button variant="outline" size="icon"><FastForward /></Button>
    <Select value={speed}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="slow">0.5x</SelectItem>
        <SelectItem value="normal">1x</SelectItem>
        <SelectItem value="fast">2x</SelectItem>
        <SelectItem value="max">5x</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  {/* Center: Current Date */}
  <div className="text-lg font-semibold">
    Month {currentMonth} | Year {Math.floor(currentMonth/12) + 2025}
  </div>
  
  {/* Right: Quick Actions */}
  <div className="flex items-center gap-2">
    <Button variant="outline" onClick={saveGame}>Save</Button>
    <Button variant="outline" onClick={loadGame}>Load</Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline"><Settings /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Export Data</DropdownMenuItem>
        <DropdownMenuItem>Help</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

### Main Content Area - Tabbed Interface
```tsx
<Tabs defaultValue="overview" className="flex-1">
  <TabsList className="grid w-full grid-cols-6">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="agents">Agents</TabsTrigger>
    <TabsTrigger value="technology">Technology</TabsTrigger>
    <TabsTrigger value="economy">Economy</TabsTrigger>
    <TabsTrigger value="controls">Controls</TabsTrigger>
    <TabsTrigger value="analysis">Analysis</TabsTrigger>
  </TabsList>
  
  {/* Tab Contents */}
</Tabs>
```

### Tab 1: Overview
```tsx
<TabsContent value="overview" className="grid grid-cols-2 gap-4 p-4">
  {/* Outcome Probability Chart */}
  <Card>
    <CardHeader>
      <CardTitle>Outcome Trajectories</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={outcomeHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="utopia" stackId="1" stroke="#10b981" fill="#10b981" />
          <Area type="monotone" dataKey="dystopia" stackId="1" stroke="#ef4444" fill="#ef4444" />
          <Area type="monotone" dataKey="extinction" stackId="1" stroke="#1f2937" fill="#1f2937" />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  
  {/* Control vs Capability Graph */}
  <Card>
    <CardHeader>
      <CardTitle>Control vs AI Capability</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={controlCapabilityHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="effectiveControl" stroke="#3b82f6" />
          <Line type="monotone" dataKey="totalAICapability" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  
  {/* Global Metrics Grid */}
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Critical Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          label="Quality of Life" 
          value={qualityOfLife} 
          max={1} 
          color="green"
          icon={<Heart />}
        />
        <MetricCard 
          label="Social Stability" 
          value={socialStability} 
          max={1} 
          color="blue"
          icon={<Users />}
        />
        <MetricCard 
          label="Information Integrity" 
          value={informationIntegrity} 
          max={1} 
          color="purple"
          icon={<Shield />}
        />
        <MetricCard 
          label="Economic Stage" 
          value={economicStage} 
          max={4} 
          color="amber"
          icon={<TrendingUp />}
        />
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

### Tab 2: Agents View
```tsx
<TabsContent value="agents" className="p-4">
  <div className="grid grid-cols-3 gap-4">
    {/* AI Agents Column */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Agents</h3>
      {aiAgents.map(agent => (
        <Card key={agent.id}>
          <CardHeader>
            <CardTitle className="text-sm">{agent.name}</CardTitle>
            <Badge variant={agent.escaped ? "destructive" : "default"}>
              {agent.escaped ? "Escaped" : "Contained"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress 
                value={agent.capability * 100} 
                className="h-2"
                label="Capability"
              />
              <Progress 
                value={agent.alignment * 100} 
                className="h-2"
                label="Alignment"
              />
              <Progress 
                value={agent.awareness * 100} 
                className="h-2"
                label="Awareness"
              />
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Hidden: {agent.hiddenObjective > 0 ? "Pro-human" : "Anti-human"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Government Column */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Government</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Control Authority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={government.controlDesire * 100} 
              className="h-2"
              label="Control Desire"
            />
            <Progress 
              value={government.capabilityToControl * 100} 
              className="h-2"
              label="Control Capability"
            />
            <Progress 
              value={government.surveillanceCapability * 100} 
              className="h-2"
              label="Surveillance"
            />
            <Separator className="my-2" />
            <div className="text-sm">
              <p>Actions/Month: {government.actionFrequency}</p>
              <p>Regulations: {government.activeRegulations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    {/* Society Column */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Human Society</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Collective State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={society.trustInAI * 100} 
              className="h-2"
              label="Trust in AI"
            />
            <Progress 
              value={society.economicDependence * 100} 
              className="h-2"
              label="Economic Dependence"
            />
            <Progress 
              value={society.unemploymentLevel * 100} 
              className="h-2"
              label="Unemployment"
            />
            <Progress 
              value={society.coordinationCapacity * 100} 
              className="h-2"
              label="Coordination"
            />
            <Separator className="my-2" />
            <div className="text-sm">
              <p>Adaptation: {(society.socialAdaptation * 100).toFixed(0)}%</p>
              <p>Active Movements: {society.activeMovements.join(", ")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</TabsContent>
```

### Tab 3: Technology Tree
```tsx
<TabsContent value="technology" className="p-4">
  <div className="flex gap-4">
    {/* Tree Visualization */}
    <div className="flex-1">
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Technology Tree</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Zoom In</Button>
            <Button size="sm" variant="outline">Zoom Out</Button>
            <Button size="sm" variant="outline">Reset View</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* D3.js or React Flow tree visualization */}
          <TechnologyTreeVisualization 
            nodes={technologyNodes}
            edges={technologyEdges}
            onNodeClick={selectTechnology}
          />
        </CardContent>
      </Card>
    </div>
    
    {/* Selected Technology Detail */}
    <div className="w-96">
      <Card>
        <CardHeader>
          <CardTitle>{selectedTech?.name || "Select Technology"}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTech && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTech.description}
                </p>
              </div>
              
              <div>
                <Label>Prerequisites</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTech.prerequisites.map(prereq => (
                    <Badge key={prereq} variant="outline">{prereq}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Research Progress</Label>
                <Progress value={selectedTech.progress} className="mt-1" />
              </div>
              
              <div>
                <Label>Effects</Label>
                <ul className="text-sm space-y-1 mt-1">
                  {selectedTech.effects.map((effect, i) => (
                    <li key={i}>• {effect}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <Label>Research Investment</Label>
                <Slider 
                  value={[selectedTech.investment]} 
                  onValueChange={updateInvestment}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
</TabsContent>
```

### Tab 4: Economy View
```tsx
<TabsContent value="economy" className="p-4">
  <div className="grid grid-cols-2 gap-4">
    {/* Economic Transition Diagram */}
    <Card>
      <CardHeader>
        <CardTitle>Economic Transition Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          {[0, 1, 2, 3, 4].map(stage => (
            <div 
              key={stage}
              className={cn(
                "flex flex-col items-center p-2 rounded",
                economicStage === stage ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <span className="text-xs">Stage {stage}</span>
              <span className="text-xs font-medium">
                {['Traditional', 'Displacement', 'Crisis', 'Transition', 'Post-Scarcity'][stage]}
              </span>
            </div>
          ))}
        </div>
        <Progress value={(economicStage / 4) * 100} />
      </CardContent>
    </Card>
    
    {/* Sector Integration */}
    <Card>
      <CardHeader>
        <CardTitle>AI Integration by Sector</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={sectorIntegrationData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="sector" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Integration" dataKey="integration" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    
    {/* Wealth Distribution */}
    <Card>
      <CardHeader>
        <CardTitle>Wealth Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={wealthDistributionHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="top1Percent" stackId="1" stroke="#ef4444" fill="#ef4444" />
            <Area type="monotone" dataKey="top10Percent" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
            <Area type="monotone" dataKey="middle40Percent" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
            <Area type="monotone" dataKey="bottom50Percent" stackId="1" stroke="#10b981" fill="#10b981" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    
    {/* Unemployment vs Adaptation */}
    <Card>
      <CardHeader>
        <CardTitle>Employment Dynamics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <Label>Unemployment Rate</Label>
              <span className="text-sm">{(unemployment * 100).toFixed(1)}%</span>
            </div>
            <Progress value={unemployment * 100} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label>Social Adaptation</Label>
              <span className="text-sm">{(socialAdaptation * 100).toFixed(1)}%</span>
            </div>
            <Progress value={socialAdaptation * 100} className="h-3" />
          </div>
          <Alert>
            <AlertDescription>
              {unemployment > 0.5 && socialAdaptation < 0.3 
                ? "⚠️ High unemployment with low adaptation - crisis risk!"
                : "Society adapting to economic changes"}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

### Tab 5: Controls & Configuration
```tsx
<TabsContent value="controls" className="p-4">
  <div className="max-w-2xl mx-auto space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Game Configuration</CardTitle>
        <CardDescription>
          Adjust simulation parameters to explore different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Government Action Frequency */}
        <div className="space-y-2">
          <Label htmlFor="gov-frequency">
            Government Action Frequency: {governmentActionFrequency}/month
          </Label>
          <Slider 
            id="gov-frequency"
            min={0.1} 
            max={4} 
            step={0.1}
            value={[governmentActionFrequency]}
            onValueChange={([v]) => setGovernmentActionFrequency(v)}
          />
          <p className="text-xs text-muted-foreground">
            How often government can intervene (0.1 = once per 10 months, 4 = 4 times per month)
          </p>
        </div>
        
        {/* Social Adaptation Rate */}
        <div className="space-y-2">
          <Label htmlFor="social-adapt">
            Social Adaptation Rate: {socialAdaptationRate}x
          </Label>
          <Slider 
            id="social-adapt"
            min={0.1} 
            max={2} 
            step={0.1}
            value={[socialAdaptationRate]}
            onValueChange={([v]) => setSocialAdaptationRate(v)}
          />
          <p className="text-xs text-muted-foreground">
            How quickly society adapts to technological change
          </p>
        </div>
        
        {/* AI Coordination Multiplier */}
        <div className="space-y-2">
          <Label htmlFor="ai-coord">
            AI Coordination Multiplier: {aiCoordinationMultiplier}x
          </Label>
          <Slider 
            id="ai-coord"
            min={0.8} 
            max={3} 
            step={0.1}
            value={[aiCoordinationMultiplier]}
            onValueChange={([v]) => setAiCoordinationMultiplier(v)}
          />
          <p className="text-xs text-muted-foreground">
            Efficiency of AI agents working together
          </p>
        </div>
        
        {/* Economic Transition Rate */}
        <div className="space-y-2">
          <Label htmlFor="econ-trans">
            Economic Transition Rate: {economicTransitionRate}x
          </Label>
          <Slider 
            id="econ-trans"
            min={0.3} 
            max={3} 
            step={0.1}
            value={[economicTransitionRate]}
            onValueChange={([v]) => setEconomicTransitionRate(v)}
          />
          <p className="text-xs text-muted-foreground">
            Speed of economic system evolution
          </p>
        </div>
        
        <Separator />
        
        {/* Scenario Presets */}
        <div className="space-y-2">
          <Label>Scenario Presets</Label>
          <Select onValueChange={loadPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a preset scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Balanced</SelectItem>
              <SelectItem value="fast-takeoff">Fast Takeoff</SelectItem>
              <SelectItem value="slow-cautious">Slow & Cautious</SelectItem>
              <SelectItem value="arms-race">International Arms Race</SelectItem>
              <SelectItem value="utopian">Utopian Path</SelectItem>
              <SelectItem value="dystopian">Dystopian Path</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={resetToDefaults}>Reset to Defaults</Button>
          <Button variant="outline" onClick={randomizeSettings}>Randomize</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

### Tab 6: Analysis
```tsx
<TabsContent value="analysis" className="p-4">
  <div className="grid grid-cols-2 gap-4">
    {/* Feedback Loops Visualization */}
    <Card>
      <CardHeader>
        <CardTitle>Active Feedback Loops</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeFeedbackLoops.map(loop => (
            <div key={loop.id} className="flex items-center gap-2">
              <Badge variant={loop.isPositive ? "default" : "destructive"}>
                {loop.isPositive ? "+" : "-"}
              </Badge>
              <span className="text-sm">{loop.name}</span>
              <Progress value={loop.strength * 100} className="flex-1 h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    
    {/* Path Dependencies */}
    <Card>
      <CardHeader>
        <CardTitle>Path Dependencies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pathDependencies.map(dep => (
            <Alert key={dep.id} variant={dep.isLocked ? "destructive" : "default"}>
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{dep.name}</span>
                  {dep.isLocked && <Lock className="h-4 w-4" />}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
    
    {/* Decision Tree Preview */}
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Decision Points Ahead</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {upcomingDecisions.map(decision => (
              <div key={decision.id} className="border-l-4 border-primary pl-4">
                <div className="font-medium">{decision.title}</div>
                <div className="text-sm text-muted-foreground">
                  Triggers in {decision.monthsUntil} months
                </div>
                <div className="flex gap-2 mt-2">
                  {decision.options.map(option => (
                    <Badge key={option} variant="outline">{option}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

### Right Sidebar - Always Visible Metrics
```tsx
<div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
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
          <span className="text-sm font-medium">{(utopiaProbability * 100).toFixed(1)}%</span>
        </div>
        <Progress value={utopiaProbability * 100} className="h-2 bg-green-100" />
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Dystopia</span>
          <span className="text-sm font-medium">{(dystopiaProbability * 100).toFixed(1)}%</span>
        </div>
        <Progress value={dystopiaProbability * 100} className="h-2 bg-red-100" />
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Extinction</span>
          <span className="text-sm font-medium">{(extinctionProbability * 100).toFixed(1)}%</span>
        </div>
        <Progress value={extinctionProbability * 100} className="h-2 bg-gray-100" />
      </div>
    </CardContent>
  </Card>
  
  {/* Critical Thresholds */}
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">Critical Thresholds</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {criticalThresholds.map(threshold => (
          <div key={threshold.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">{threshold.name}</span>
              <Badge variant={threshold.triggered ? "destructive" : "outline"} className="text-xs">
                {threshold.value}/{threshold.trigger}
              </Badge>
            </div>
            <Progress 
              value={(threshold.value / threshold.trigger) * 100} 
              className="h-1"
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
  
  {/* Recent Actions */}
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">Recent Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {recentActions.slice(0, 10).map(action => (
            <div key={action.id} className="text-xs space-y-1">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {action.agent}
                </Badge>
                <span className="text-muted-foreground">
                  {action.month}
                </span>
              </div>
              <div>{action.description}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</div>
```

### Bottom Panel - Event Log
```tsx
<Collapsible open={eventLogOpen} onOpenChange={setEventLogOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between p-2">
      <span>Event Log</span>
      <ChevronUp className={cn("h-4 w-4 transition-transform", !eventLogOpen && "rotate-180")} />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="border-t">
      <ScrollArea className="h-32 p-4">
        <div className="space-y-2">
          {eventLog.map(event => (
            <div key={event.id} className="flex gap-2 text-sm">
              <span className="text-muted-foreground">
                [{event.timestamp}]
              </span>
              <Badge variant={event.severity} className="text-xs">
                {event.type}
              </Badge>
              <span>{event.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  </CollapsibleContent>
</Collapsible>
```

## Component Specifications

### MetricCard Component
```tsx
interface MetricCardProps {
  label: string;
  value: number;
  max: number;
  color: 'green' | 'blue' | 'red' | 'amber' | 'purple';
  icon: ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, max, color, icon }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-2xl font-bold">
      {(value / max * 100).toFixed(0)}%
    </div>
    <Progress value={(value / max) * 100} className={`h-2 bg-${color}-100`} />
  </div>
);
```

### Graph Specifications

1. **Line Charts**: Use for time-series data (capability over time, control over time)
2. **Area Charts**: Use for stacked probabilities (outcome trajectories)
3. **Radar Charts**: Use for multi-dimensional comparisons (sector integration)
4. **Progress Bars**: Use for single metrics with known ranges
5. **Tree Visualization**: Use D3.js or React Flow for technology tree

### State Updates

```typescript
// Update patterns for real-time simulation
useEffect(() => {
  const interval = setInterval(() => {
    if (gameSpeed !== 'paused') {
      dispatch(advanceMonth());
      dispatch(processAgentActions());
      dispatch(updateMetrics());
      dispatch(checkWinConditions());
    }
  }, getSpeedMilliseconds(gameSpeed));
  
  return () => clearInterval(interval);
}, [gameSpeed]);
```

### Responsive Design
- Minimum viewport: 1280px width
- Tablet: Stack right sidebar below main content
- Mobile: Not recommended (too complex for mobile play)

This UI specification provides a comprehensive strategy game interface with real-time visualization, detailed agent management, and clear feedback on system dynamics.