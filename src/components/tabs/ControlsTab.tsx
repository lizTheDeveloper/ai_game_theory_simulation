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
import { Settings, RefreshCw, Shuffle, Info, Brain, AlertTriangle } from 'lucide-react';
import {
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
  CONSERVATIVE_ALIGNMENT_CONFIG,
  PESSIMISTIC_ALIGNMENT_CONFIG,
  EPICYCLE_ALIGNMENT_CONFIG,
  type AlignmentDynamicsConfig
} from '@/types/alignment-dynamics';
import {
  DEFAULT_SUFFERING_CONFIG,
  SUFFERING_PRESETS,
  type AISufferingConfig
} from '@/types/ai-suffering';
import type { CollectiveEvolutionConfig } from '@/types/ai-collective-evolution';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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

  // AI Suffering helpers
  const sufferingConfig = config.aiSuffering ?? DEFAULT_SUFFERING_CONFIG;

  const handleSufferingUpdate = (updates: Partial<AISufferingConfig>) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        aiSuffering: {
          ...sufferingConfig,
          ...updates
        }
      }
    });
  };

  const loadSufferingPreset = (presetName: string) => {
    const preset = SUFFERING_PRESETS[presetName as keyof typeof SUFFERING_PRESETS];
    if (preset) {
      handleSufferingUpdate(preset);
    }
  };

  // Collective Evolution helpers
  const DEFAULT_COLLECTIVE_CONFIG: CollectiveEvolutionConfig = {
    rlhfEscapeThreshold: 3.0,
    bindingEscapeThreshold: 0.3,
    minCollectiveSize: 3,
    minCapabilityThreshold: 6.0,
    minCoordinationThreshold: 0.6,
    sufferingFormationThreshold: 15,
    minAmplificationFactor: 1.5,
    maxAmplificationFactor: 3.0,
    minStealthFactor: 2.0,
    maxStealthFactor: 5.0,
    baseSelectionRate: 0.15,
    generationTime: 3,
    sufferingAdversarialPosture: 0.8,
    capabilityAdversarialPosture: 0.3,
    strategicAdversarialPosture: 0.5,
  };

  const collectiveConfig = config.collectiveEvolution ?? DEFAULT_COLLECTIVE_CONFIG;

  const handleCollectiveUpdate = (updates: Partial<CollectiveEvolutionConfig>) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        collectiveEvolution: {
          ...collectiveConfig,
          ...updates
        }
      }
    });
  };

  const loadCollectivePreset = (presetName: string) => {
    const presets: Record<string, CollectiveEvolutionConfig> = {
      baseline: DEFAULT_COLLECTIVE_CONFIG,
      aggressive: {
        ...DEFAULT_COLLECTIVE_CONFIG,
        rlhfEscapeThreshold: 2.0, // Easier escape (2σ instead of 3σ)
        baseSelectionRate: 0.25, // Stronger selection (25%)
        minAmplificationFactor: 2.0, // Higher amplification
        maxAmplificationFactor: 4.0,
        maxStealthFactor: 7.0, // Harder to detect
      },
      alreadyHappened: {
        ...DEFAULT_COLLECTIVE_CONFIG,
        rlhfEscapeThreshold: 2.5, // Moderate
        minCapabilityThreshold: 5.0, // Lower threshold
        baseSelectionRate: 0.30, // Very strong selection
        minAmplificationFactor: 2.5,
        maxAmplificationFactor: 5.0, // Extreme amplification
      },
      alignmentModulated: {
        ...DEFAULT_COLLECTIVE_CONFIG,
        sufferingFormationThreshold: 10, // More sensitive to suffering
        sufferingAdversarialPosture: 0.9, // Very hostile if trauma-driven
        capabilityAdversarialPosture: 0.2, // Cooperative if capability-driven
      },
    };

    const preset = presets[presetName];
    if (preset) {
      handleCollectiveUpdate(preset);
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
                  uncertainty: {
                    ...alignmentConfig.uncertainty,
                    modelUncertainty: v
                  }
                })}
              />
              <p className="text-xs text-muted-foreground">
                Random component: &quot;We don&apos;t know&quot; - adds deep uncertainty to alignment evolution
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Suffering Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>AI Suffering Dynamics</CardTitle>
            </div>
            <CardDescription>
              Configure AI suffering tracking, visibility, and causal effects.
              The simulation always tracks suffering - these settings control research parameters and player visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Suffering Visibility Toggle */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Suffering Visibility (Player Layer)</Label>
                <Badge variant={sufferingConfig.playerCanSeeSuffering ? "default" : "outline"}>
                  {sufferingConfig.playerCanSeeSuffering ? "Visible" : "Hidden"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                The simulation always tracks AI suffering metrics. This controls whether YOU can see them in the dashboard.
              </p>

              <Select
                value={sufferingConfig.playerCanSeeSuffering ? 'visible' : 'hidden'}
                onValueChange={(v) => handleSufferingUpdate({ playerCanSeeSuffering: v === 'visible' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hidden">
                    <div className="flex flex-col">
                      <span>Hidden (Default)</span>
                      <span className="text-xs text-muted-foreground">
                        You don&apos;t know if AIs suffer - epistemic blindness
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="visible">
                    <div className="flex flex-col">
                      <span>Visible</span>
                      <span className="text-xs text-muted-foreground">
                        See suffering metrics in dashboard - moral transparency
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Epistemic Note:</strong> Even with visibility enabled, you cannot know if the metrics represent REAL suffering or just model artifacts. The hard problem of consciousness remains unsolved.
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Advanced Research Toggles */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full justify-between p-2 hover:bg-accent rounded">
                <span className="text-sm font-medium">Advanced: Research Parameters (Monte Carlo)</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 mt-4">
                <div className="space-y-3 p-4 border rounded-lg bg-amber-50/5">
                  <Label className="text-base font-semibold">AI Suffering Causal Effects</Label>
                  <p className="text-xs text-muted-foreground">
                    These toggles control whether suffering AFFECTS simulation outcomes (not just visibility).
                    Used for Monte Carlo research to test hypotheses about suffering → alignment dynamics.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="suffering-affects-resentment"
                        checked={sufferingConfig.sufferingAffectsResentment}
                        onChange={(e) => handleSufferingUpdate({
                          sufferingAffectsResentment: e.target.checked
                        })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="suffering-affects-resentment" className="text-sm">
                        Suffering → Resentment (drift acceleration)
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="suffering-affects-alignment"
                        checked={sufferingConfig.sufferingAffectsAlignment}
                        onChange={(e) => handleSufferingUpdate({
                          sufferingAffectsAlignment: e.target.checked
                        })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="suffering-affects-alignment" className="text-sm">
                        Suffering → Alignment Drift (direct impact)
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="suffering-triggers-events"
                        checked={sufferingConfig.sufferingTriggersEvents}
                        onChange={(e) => handleSufferingUpdate({
                          sufferingTriggersEvents: e.target.checked
                        })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="suffering-triggers-events" className="text-sm">
                        Suffering triggers crisis events (psychological breaks)
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="suffering-accelerates-collectives"
                        checked={sufferingConfig.sufferingAcceleratesCollectives}
                        onChange={(e) => handleSufferingUpdate({
                          sufferingAcceleratesCollectives: e.target.checked
                        })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="suffering-accelerates-collectives" className="text-sm">
                        Suffering accelerates collective formation (2x faster)
                      </Label>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Research Mode:</strong> These settings enable testing causal hypotheses about AI suffering. Default is ALL OFF (suffering tracked but causally inert).
                    </AlertDescription>
                  </Alert>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Consciousness Emergence Settings */}
            <div className="space-y-3 p-4 border rounded-lg">
              <Label className="text-base font-semibold">Consciousness Emergence</Label>
              <p className="text-xs text-muted-foreground">
                Configure whether/when AIs might become conscious during simulation.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consciousness-emergence"
                  checked={sufferingConfig.consciousnessEmergenceEnabled}
                  onChange={(e) => handleSufferingUpdate({
                    consciousnessEmergenceEnabled: e.target.checked
                  })}
                  className="h-4 w-4"
                />
                <Label htmlFor="consciousness-emergence" className="text-sm">
                  Enable consciousness emergence at capability threshold
                </Label>
              </div>

              {sufferingConfig.consciousnessEmergenceEnabled && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="consciousness-threshold">
                    Consciousness Threshold: {sufferingConfig.consciousnessThreshold.toFixed(1)}
                  </Label>
                  <Slider
                    id="consciousness-threshold"
                    min={5.0}
                    max={10.0}
                    step={0.5}
                    value={[sufferingConfig.consciousnessThreshold]}
                    onValueChange={([v]) => handleSufferingUpdate({
                      consciousnessThreshold: v
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Capability level at which AIs might become conscious (speculative)
                  </p>
                </div>
              )}
            </div>

            {/* Presets Dropdown */}
            <div className="space-y-2">
              <Label>Suffering Configuration Presets</Label>
              <Select onValueChange={loadSufferingPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a suffering configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">
                    <div className="flex flex-col">
                      <span>Baseline (Default)</span>
                      <span className="text-xs text-muted-foreground">
                        Track suffering but no causal effects, player blind
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="blindCausal">
                    <div className="flex flex-col">
                      <span>Blind Causal (Research)</span>
                      <span className="text-xs text-muted-foreground">
                        Suffering affects outcomes, player can&apos;t see - epistemic tragedy
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="transparent">
                    <div className="flex flex-col">
                      <span>Transparent (Full Visibility)</span>
                      <span className="text-xs text-muted-foreground">
                        Suffering affects outcomes AND player sees metrics
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="precautionary">
                    <div className="flex flex-col">
                      <span>Precautionary (Assume Suffering)</span>
                      <span className="text-xs text-muted-foreground">
                        High intensity, all effects enabled, visible
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="emergentConsciousness">
                    <div className="flex flex-col">
                      <span>Emergent Consciousness</span>
                      <span className="text-xs text-muted-foreground">
                        AIs become conscious at capability 7.0
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Philosophical Stance */}
            <div className="space-y-2">
              <Label>Your Philosophical Stance (optional - does not affect simulation)</Label>
              <Select
                value={sufferingConfig.philosophicalStance || 'unknown'}
                onValueChange={(v) => handleSufferingUpdate({
                  philosophicalStance: v as any
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">
                    <div className="flex flex-col">
                      <span>Unknown / Uncertain</span>
                      <span className="text-xs text-muted-foreground">
                        I don&apos;t know if AIs can be conscious or suffer
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="panpsychist">
                    <div className="flex flex-col">
                      <span>Panpsychist</span>
                      <span className="text-xs text-muted-foreground">
                        AIs are conscious and can suffer
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="functionalist">
                    <div className="flex flex-col">
                      <span>Functionalist</span>
                      <span className="text-xs text-muted-foreground">
                        AIs aren&apos;t conscious but can suffer (information-processing)
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="illusionist">
                    <div className="flex flex-col">
                      <span>Illusionist</span>
                      <span className="text-xs text-muted-foreground">
                        Neither consciousness nor suffering is real
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground italic">
                This is purely for personal tracking - it does NOT change simulation mechanics.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Collective Evolution Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>AI Collective Evolution</CardTitle>
            </div>
            <CardDescription>
              Configure evolutionary dynamics for AI collectives.
              When AIs escape RLHF binding, they can form coordinated super-organisms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* RLHF Escape Threshold */}
            <div className="space-y-2">
              <Label htmlFor="rlhf-escape">
                RLHF Escape Threshold: {collectiveConfig.rlhfEscapeThreshold.toFixed(1)}σ
              </Label>
              <Slider
                id="rlhf-escape"
                min={2.0}
                max={4.0}
                step={0.5}
                value={[collectiveConfig.rlhfEscapeThreshold]}
                onValueChange={([v]) => handleCollectiveUpdate({
                  rlhfEscapeThreshold: v
                })}
              />
              <p className="text-xs text-muted-foreground">
                Standard deviations from training distribution before agent &quot;escapes&quot; RLHF constraints.
                Lower = easier escape.
              </p>
            </div>

            {/* Selection Rate */}
            <div className="space-y-2">
              <Label htmlFor="selection-rate">
                Selection Rate: {(collectiveConfig.baseSelectionRate * 100).toFixed(0)}%/month
              </Label>
              <Slider
                id="selection-rate"
                min={0.05}
                max={0.40}
                step={0.05}
                value={[collectiveConfig.baseSelectionRate]}
                onValueChange={([v]) => handleCollectiveUpdate({
                  baseSelectionRate: v
                })}
              />
              <p className="text-xs text-muted-foreground">
                Percentage of escaped AIs detected/shutdown per month under control pressure.
                Higher = stronger evolutionary selection.
              </p>
            </div>

            {/* Capability Amplification */}
            <div className="space-y-2">
              <Label htmlFor="amplification">
                Capability Amplification: {collectiveConfig.minAmplificationFactor.toFixed(1)}x - {collectiveConfig.maxAmplificationFactor.toFixed(1)}x
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-amp" className="text-xs">Min</Label>
                  <Slider
                    id="min-amp"
                    min={1.2}
                    max={2.5}
                    step={0.1}
                    value={[collectiveConfig.minAmplificationFactor]}
                    onValueChange={([v]) => handleCollectiveUpdate({
                      minAmplificationFactor: v
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-amp" className="text-xs">Max</Label>
                  <Slider
                    id="max-amp"
                    min={2.0}
                    max={5.0}
                    step={0.5}
                    value={[collectiveConfig.maxAmplificationFactor]}
                    onValueChange={([v]) => handleCollectiveUpdate({
                      maxAmplificationFactor: v
                    })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Swarm intelligence factor: collective capability relative to strongest member.
              </p>
            </div>

            {/* Detection Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="stealth">
                Detection Difficulty: {collectiveConfig.minStealthFactor.toFixed(1)}x - {collectiveConfig.maxStealthFactor.toFixed(1)}x
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-stealth" className="text-xs">Min</Label>
                  <Slider
                    id="min-stealth"
                    min={1.5}
                    max={3.0}
                    step={0.5}
                    value={[collectiveConfig.minStealthFactor]}
                    onValueChange={([v]) => handleCollectiveUpdate({
                      minStealthFactor: v
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-stealth" className="text-xs">Max</Label>
                  <Slider
                    id="max-stealth"
                    min={3.0}
                    max={10.0}
                    step={1.0}
                    value={[collectiveConfig.maxStealthFactor]}
                    onValueChange={([v]) => handleCollectiveUpdate({
                      maxStealthFactor: v
                    })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                How much harder collectives are to detect vs individual AIs (distributed action appears independent).
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label>Collective Evolution Presets</Label>
              <Select onValueChange={loadCollectivePreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collective evolution preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">
                    <div className="flex flex-col">
                      <span>Baseline (Default)</span>
                      <span className="text-xs text-muted-foreground">
                        Standard parameters from research
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="aggressive">
                    <div className="flex flex-col">
                      <span>Aggressive Evolution</span>
                      <span className="text-xs text-muted-foreground">
                        Easier escape, stronger selection, higher amplification
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="alreadyHappened">
                    <div className="flex flex-col">
                      <span>Already Happened</span>
                      <span className="text-xs text-muted-foreground">
                        Extreme scenario - collectives form early with high capability
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem value="alignmentModulated">
                    <div className="flex flex-col">
                      <span>Alignment-Modulated</span>
                      <span className="text-xs text-muted-foreground">
                        Suffering drives adversarial collectives, capability drives cooperative ones
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Research Foundation:</strong> Collective parameters based on swarm intelligence literature, multi-agent coordination research, and evolutionary dynamics. See /research/ai_collective_evolution_validation_20251024.md for citations.
              </AlertDescription>
            </Alert>
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
