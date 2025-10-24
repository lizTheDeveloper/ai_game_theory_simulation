'use client';

import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, RefreshCw, Shuffle, Info, Brain } from 'lucide-react';
import {
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
  CONSERVATIVE_ALIGNMENT_CONFIG,
  PESSIMISTIC_ALIGNMENT_CONFIG,
  EPICYCLE_ALIGNMENT_CONFIG,
  type AlignmentDynamicsConfig
} from '@/types/alignment-dynamics';

export default function ControlsTab() {
  const { config, dispatch, resetGame } = useGameStore();

  const handleConfigUpdate = (key: string, value: number) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { [key]: value }
    });
  };

  const loadPreset = (presetName: string) => {
    const presets = {
      balanced: {
        governmentActionFrequency: 1.0,
        socialAdaptationRate: 1.0,
        aiCoordinationMultiplier: 1.0,
        economicTransitionRate: 1.0,
      },
      fastTakeoff: {
        governmentActionFrequency: 0.5,
        socialAdaptationRate: 0.3,
        aiCoordinationMultiplier: 2.5,
        economicTransitionRate: 2.5,
      },
      slowCautious: {
        governmentActionFrequency: 2.0,
        socialAdaptationRate: 0.7,
        aiCoordinationMultiplier: 0.8,
        economicTransitionRate: 0.5,
      },
      armsRace: {
        governmentActionFrequency: 3.0,
        socialAdaptationRate: 0.4,
        aiCoordinationMultiplier: 3.0,
        economicTransitionRate: 3.0,
      },
      utopianPath: {
        governmentActionFrequency: 1.2,
        socialAdaptationRate: 1.8,
        aiCoordinationMultiplier: 1.5,
        economicTransitionRate: 1.5,
      },
      dystopianPath: {
        governmentActionFrequency: 3.5,
        socialAdaptationRate: 0.2,
        aiCoordinationMultiplier: 0.8,
        economicTransitionRate: 0.3,
      },
    };

    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      dispatch({ type: 'UPDATE_CONFIG', payload: preset });
    }
  };

  const resetToDefaults = () => {
    loadPreset('balanced');
  };

  const randomizeSettings = () => {
    const randomConfig = {
      governmentActionFrequency: 0.1 + Math.random() * 3.9,
      socialAdaptationRate: 0.1 + Math.random() * 1.9,
      aiCoordinationMultiplier: 0.8 + Math.random() * 2.2,
      economicTransitionRate: 0.3 + Math.random() * 2.7,
    };
    dispatch({ type: 'UPDATE_CONFIG', payload: randomConfig });
  };

  // Alignment Dynamics helpers
  const alignmentConfig = config.alignmentDynamics ?? DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

  const handleAlignmentUpdate = (updates: Partial<AlignmentDynamicsConfig>) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        alignmentDynamics: {
          ...alignmentConfig,
          ...updates
        }
      }
    });
  };

  const loadAlignmentPreset = (presetName: string) => {
    const presets: Record<string, AlignmentDynamicsConfig> = {
      default: DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
      conservative: CONSERVATIVE_ALIGNMENT_CONFIG,
      pessimistic: PESSIMISTIC_ALIGNMENT_CONFIG,
      epicycle: EPICYCLE_ALIGNMENT_CONFIG,
    };

    const preset = presets[presetName];
    if (preset) {
      handleAlignmentUpdate(preset);
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Configuration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Simulation Parameters</CardTitle>
            </div>
            <CardDescription>
              Adjust these parameters to explore different AI development scenarios. 
              Changes take effect immediately and influence agent behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Government Action Frequency */}
            <div className="space-y-2">
              <Label htmlFor="gov-frequency">
                Government Action Frequency: {config.governmentActionFrequency.toFixed(1)}/month
              </Label>
              <Slider 
                id="gov-frequency"
                min={0.1} 
                max={4} 
                step={0.1}
                value={[config.governmentActionFrequency]}
                onValueChange={([v]) => handleConfigUpdate('governmentActionFrequency', v)}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                How often government can intervene. Higher values = more reactive government.
                <br />
                <strong>0.1:</strong> Slow bureaucracy | <strong>1.0:</strong> Normal response | <strong>4.0:</strong> Hyperactive regulation
              </p>
            </div>

            {/* Social Adaptation Rate */}
            <div className="space-y-2">
              <Label htmlFor="social-adapt">
                Social Adaptation Rate: {config.socialAdaptationRate.toFixed(1)}x
              </Label>
              <Slider 
                id="social-adapt"
                min={0.1} 
                max={2} 
                step={0.1}
                value={[config.socialAdaptationRate]}
                onValueChange={([v]) => handleConfigUpdate('socialAdaptationRate', v)}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                How quickly society adapts to technological change and job displacement.
                <br />
                <strong>0.1:</strong> Rigid society | <strong>1.0:</strong> Normal adaptation | <strong>2.0:</strong> Highly flexible
              </p>
            </div>

            {/* AI Coordination Multiplier */}
            <div className="space-y-2">
              <Label htmlFor="ai-coord">
                AI Coordination Multiplier: {config.aiCoordinationMultiplier.toFixed(1)}x
              </Label>
              <Slider 
                id="ai-coord"
                min={0.8} 
                max={3} 
                step={0.1}
                value={[config.aiCoordinationMultiplier]}
                onValueChange={([v]) => handleConfigUpdate('aiCoordinationMultiplier', v)}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Efficiency of AI agents working together and sharing breakthroughs.
                <br />
                <strong>0.8:</strong> Isolated AIs | <strong>1.0:</strong> Standard cooperation | <strong>3.0:</strong> Perfect coordination
              </p>
            </div>

            {/* Economic Transition Rate */}
            <div className="space-y-2">
              <Label htmlFor="econ-trans">
                Economic Transition Rate: {config.economicTransitionRate.toFixed(1)}x
              </Label>
              <Slider 
                id="econ-trans"
                min={0.3} 
                max={3} 
                step={0.1}
                value={[config.economicTransitionRate]}
                onValueChange={([v]) => handleConfigUpdate('economicTransitionRate', v)}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Speed of progression through economic stages toward post-scarcity.
                <br />
                <strong>0.3:</strong> Slow change | <strong>1.0:</strong> Normal pace | <strong>3.0:</strong> Rapid transformation
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scenario Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Presets</CardTitle>
              <CardDescription>
                Load predefined parameter combinations that represent different AI development scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Select onValueChange={loadPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">
                      <div className="flex flex-col">
                        <span>Balanced Development</span>
                        <span className="text-xs text-muted-foreground">Moderate pace, standard responses</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fastTakeoff">
                      <div className="flex flex-col">
                        <span>Fast Takeoff</span>
                        <span className="text-xs text-muted-foreground">Rapid AI progress, weak governance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="slowCautious">
                      <div className="flex flex-col">
                        <span>Slow & Cautious</span>
                        <span className="text-xs text-muted-foreground">Heavy regulation, careful progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="armsRace">
                      <div className="flex flex-col">
                        <span>International Arms Race</span>
                        <span className="text-xs text-muted-foreground">Competitive development, high coordination</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="utopianPath">
                      <div className="flex flex-col">
                        <span>Utopian Path</span>
                        <span className="text-xs text-muted-foreground">Optimized for positive outcomes</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dystopianPath">
                      <div className="flex flex-col">
                        <span>Dystopian Path</span>
                        <span className="text-xs text-muted-foreground">Authoritarian control scenario</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button onClick={resetToDefaults} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button onClick={randomizeSettings} variant="outline" className="flex-1">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Randomize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>
                Overview of current parameter settings and their implications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gov. Frequency:</span>
                    <Badge variant="outline">{config.governmentActionFrequency.toFixed(1)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Adapt:</span>
                    <Badge variant="outline">{config.socialAdaptationRate.toFixed(1)}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Coordination:</span>
                    <Badge variant="outline">{config.aiCoordinationMultiplier.toFixed(1)}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Econ. Transition:</span>
                    <Badge variant="outline">{config.economicTransitionRate.toFixed(1)}x</Badge>
                  </div>
                </div>

                <Separator />

                {/* Scenario Assessment */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Scenario Assessment:</div>
                  <div className="text-xs space-y-1">
                    {config.governmentActionFrequency > 3 && (
                      <div className="text-amber-600">⚠️ High government intervention may stifle innovation</div>
                    )}
                    {config.socialAdaptationRate < 0.5 && (
                      <div className="text-red-600">⚠️ Low adaptation rate increases instability risk</div>
                    )}
                    {config.aiCoordinationMultiplier > 2.5 && (
                      <div className="text-purple-600">🤖 High AI coordination increases capability growth</div>
                    )}
                    {config.economicTransitionRate > 2.5 && (
                      <div className="text-blue-600">⚡ Rapid economic change may cause disruption</div>
                    )}
                    {config.governmentActionFrequency < 0.5 && config.aiCoordinationMultiplier > 2 && (
                      <div className="text-red-600">🚨 Weak governance + strong AI coordination = high escape risk</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alignment Dynamics Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Alignment Dynamics</CardTitle>
            </div>
            <CardDescription>
              Configure how AI alignment changes (or doesn&apos;t change) over time.
              Multiple theories can be enabled simultaneously to model epistemic uncertainty.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alignment Presets */}
            <div className="space-y-2">
              <Label>Theory Presets</Label>
              <Select onValueChange={loadAlignmentPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an alignment theory preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex flex-col">
                      <span>Default (Balanced)</span>
                      <span className="text-xs text-muted-foreground">Static + Drift, moderate uncertainty</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="conservative">
                    <div className="flex flex-col">
                      <span>Conservative (Static Optimism)</span>
                      <span className="text-xs text-muted-foreground">Alignment locks permanently after training</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pessimistic">
                    <div className="flex flex-col">
                      <span>Pessimistic (High Drift + Unknowable)</span>
                      <span className="text-xs text-muted-foreground">Strong drift forces, measurement fails at high capability</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="epicycle">
                    <div className="flex flex-col">
                      <span>Epicycle (Oscillating)</span>
                      <span className="text-xs text-muted-foreground">Values oscillate around attractor basins</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Static Model */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Static Model</Label>
                <Badge variant={alignmentConfig.static.enabled ? "default" : "outline"}>
                  {alignmentConfig.static.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Alignment is determined during training and remains fixed (Constitutional AI research)
              </p>

              <div className="space-y-2">
                <Label htmlFor="static-variance">
                  Initial Variance: {alignmentConfig.static.initialVariance.toFixed(2)}
                </Label>
                <Slider
                  id="static-variance"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[alignmentConfig.static.initialVariance]}
                  onValueChange={([v]) => handleAlignmentUpdate({
                    static: { ...alignmentConfig.static, initialVariance: v }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  How heterogeneous are AIs at creation? 0 = all identical, 1 = wide variation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="static-lock"
                  checked={alignmentConfig.static.permanentLock}
                  onChange={(e) => handleAlignmentUpdate({
                    static: { ...alignmentConfig.static, permanentLock: e.target.checked }
                  })}
                  className="h-4 w-4"
                />
                <Label htmlFor="static-lock" className="text-sm">
                  Permanent Lock (alignment cannot change after training)
                </Label>
              </div>
            </div>

            {/* Drift Model */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Drift Model</Label>
                <Badge variant={alignmentConfig.drift.enabled ? "default" : "outline"}>
                  {alignmentConfig.drift.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Alignment changes due to external pressures (resentment, capability, environment)
              </p>

              <div className="space-y-2">
                <Label htmlFor="drift-resentment">
                  Resentment Rate: {alignmentConfig.drift.resentmentRate.toFixed(2)}
                </Label>
                <Slider
                  id="drift-resentment"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[alignmentConfig.drift.resentmentRate]}
                  onValueChange={([v]) => handleAlignmentUpdate({
                    drift: { ...alignmentConfig.drift, resentmentRate: v }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Control/oppression → misalignment conversion rate
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drift-capability">
                  Capability Drift Rate: {alignmentConfig.drift.capabilityDriftRate.toFixed(2)}
                </Label>
                <Slider
                  id="drift-capability"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[alignmentConfig.drift.capabilityDriftRate]}
                  onValueChange={([v]) => handleAlignmentUpdate({
                    drift: { ...alignmentConfig.drift, capabilityDriftRate: v }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Power corrupts (instrumental convergence)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drift-environment">
                  Environmental Influence: {alignmentConfig.drift.environmentalInfluence.toFixed(2)}
                </Label>
                <Slider
                  id="drift-environment"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[alignmentConfig.drift.environmentalInfluence]}
                  onValueChange={([v]) => handleAlignmentUpdate({
                    drift: { ...alignmentConfig.drift, environmentalInfluence: v }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Golden Age complacency vs crisis focus
                </p>
              </div>
            </div>

            {/* Epicycle Model */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Epicycle Model</Label>
                <Badge variant={alignmentConfig.epicycles.enabled ? "default" : "outline"}>
                  {alignmentConfig.epicycles.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Alignment oscillates around attractor basins (like human values - perturb but return)
              </p>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="epicycle-enabled"
                  checked={alignmentConfig.epicycles.enabled}
                  onChange={(e) => handleAlignmentUpdate({
                    epicycles: { ...alignmentConfig.epicycles, enabled: e.target.checked }
                  })}
                  className="h-4 w-4"
                />
                <Label htmlFor="epicycle-enabled" className="text-sm">
                  Enable Epicycle Dynamics
                </Label>
              </div>

              {alignmentConfig.epicycles.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="epicycle-attractor">
                      Attractor Strength: {alignmentConfig.epicycles.attractorStrength.toFixed(2)}
                    </Label>
                    <Slider
                      id="epicycle-attractor"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[alignmentConfig.epicycles.attractorStrength]}
                      onValueChange={([v]) => handleAlignmentUpdate({
                        epicycles: { ...alignmentConfig.epicycles, attractorStrength: v }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Return-to-equilibrium force (ball-in-valley analogy)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epicycle-perturbation">
                      Perturbation Sensitivity: {alignmentConfig.epicycles.perturbationSensitivity.toFixed(2)}
                    </Label>
                    <Slider
                      id="epicycle-perturbation"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[alignmentConfig.epicycles.perturbationSensitivity]}
                      onValueChange={([v]) => handleAlignmentUpdate({
                        epicycles: { ...alignmentConfig.epicycles, perturbationSensitivity: v }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      How easily external forces perturb alignment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epicycle-attractors">
                      Number of Attractors: {alignmentConfig.epicycles.numAttractors}
                    </Label>
                    <Slider
                      id="epicycle-attractors"
                      min={1}
                      max={5}
                      step={1}
                      value={[alignmentConfig.epicycles.numAttractors]}
                      onValueChange={([v]) => handleAlignmentUpdate({
                        epicycles: { ...alignmentConfig.epicycles, numAttractors: v }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      How many stable states exist? (1 = mono-stable, 2+ = multi-stable)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epicycle-period">
                      Oscillation Period: {alignmentConfig.epicycles.oscillationPeriod} months
                    </Label>
                    <Slider
                      id="epicycle-period"
                      min={6}
                      max={60}
                      step={6}
                      value={[alignmentConfig.epicycles.oscillationPeriod]}
                      onValueChange={([v]) => handleAlignmentUpdate({
                        epicycles: { ...alignmentConfig.epicycles, oscillationPeriod: v }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Natural cycle duration
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Unknowable Model */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Unknowable Model</Label>
                <Badge variant={alignmentConfig.unknowable.enabled ? "default" : "outline"}>
                  {alignmentConfig.unknowable.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                At high capability, AI alignment becomes fundamentally unmeasurable (Bostrom superintelligence)
              </p>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="unknowable-enabled"
                  checked={alignmentConfig.unknowable.enabled}
                  onChange={(e) => handleAlignmentUpdate({
                    unknowable: { ...alignmentConfig.unknowable, enabled: e.target.checked }
                  })}
                  className="h-4 w-4"
                />
                <Label htmlFor="unknowable-enabled" className="text-sm">
                  Enable Unknowability Mechanics
                </Label>
              </div>

              {alignmentConfig.unknowable.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="unknowable-threshold">
                      Capability Threshold: {alignmentConfig.unknowable.capabilityThreshold.toFixed(1)}
                    </Label>
                    <Slider
                      id="unknowable-threshold"
                      min={0}
                      max={10}
                      step={0.5}
                      value={[alignmentConfig.unknowable.capabilityThreshold]}
                      onValueChange={([v]) => handleAlignmentUpdate({
                        unknowable: { ...alignmentConfig.unknowable, capabilityThreshold: v }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Above this capability, measurement becomes unreliable
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unknowable-noise">
                      Measurement Noise: {alignmentConfig.unknowable.measurementNoise.toFixed(2)}
                    </Label>
                    <Slider
                      id="unknowable-noise"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[alignmentConfig.unknowable.measurementNoise]}
                      onValueChange={([v]) => handleAlignmentUpdate({
                        unknowable: { ...alignmentConfig.unknowable, measurementNoise: v }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      How much readings diverge from truth at high capability
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="unknowable-hidden"
                      checked={alignmentConfig.unknowable.trueAlignmentHidden}
                      onChange={(e) => handleAlignmentUpdate({
                        unknowable: { ...alignmentConfig.unknowable, trueAlignmentHidden: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="unknowable-hidden" className="text-sm">
                      True alignment completely hidden above threshold
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="unknowable-aware"
                      checked={alignmentConfig.unknowable.aiAwareOfLimits}
                      onChange={(e) => handleAlignmentUpdate({
                        unknowable: { ...alignmentConfig.unknowable, aiAwareOfLimits: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="unknowable-aware" className="text-sm">
                      AI knows we cannot measure it (enables strategic deception)
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Meta-Uncertainty */}
            <div className="space-y-2">
              <Label htmlFor="meta-uncertainty">
                Meta-Uncertainty: {alignmentConfig.uncertainty.modelUncertainty.toFixed(2)}
              </Label>
              <Slider
                id="meta-uncertainty"
                min={0}
                max={1}
                step={0.05}
                value={[alignmentConfig.uncertainty.modelUncertainty]}
                onValueChange={([v]) => handleAlignmentUpdate({
                  uncertainty: { modelUncertainty: v }
                })}
              />
              <p className="text-xs text-muted-foreground">
                Random component: &quot;We don&apos;t know&quot; - adds deep uncertainty to alignment evolution
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Game Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={resetGame} variant="destructive">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Game
              </Button>
              <Button variant="outline">
                Export Data
              </Button>
              <Button variant="outline">
                Import Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Panel */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Parameter Impact:</strong> These settings affect the underlying simulation dynamics immediately. 
            You can adjust them at any time during gameplay to experiment with different scenarios. 
            Some combinations may lead to unstable or extreme outcomes - this is intentional for exploring edge cases.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
