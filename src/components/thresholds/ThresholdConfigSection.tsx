/**
 * Threshold Configuration Section
 *
 * Displays Phase 1 & Phase 2 threshold uncertainty configurations.
 * Shows research-backed distributions with visual sparklines.
 *
 * Phase 1: Read-only display (this component)
 * Phase 2: Custom distribution override (future)
 */

'use client';

import { useState } from 'react';
import { DistributionVisualizer } from './DistributionVisualizer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ThresholdMetadata {
  id: string;
  name: string;
  icon: string;
  unit: string;
  distributionType: 'normal' | 'triangular' | 'uniform' | 'beta' | 'lognormal';
  params: {
    min?: number;
    max?: number;
    mode?: number;
    mean?: number;
    stdDev?: number;
    alpha?: number;
    beta?: number;
  };
  range: string;
  citation: string;
  impact: string;
}

const TIER1_THRESHOLDS: ThresholdMetadata[] = [
  {
    id: 'socialCriticalMass',
    name: 'Social Critical Mass',
    icon: '👥',
    unit: 'population fraction',
    distributionType: 'normal',
    params: { mean: 0.25, stdDev: 0.02 },
    range: '20-30% (μ=25%)',
    citation: 'Centola et al. (2018, Science) - tipping points in social convention',
    impact: 'Threshold for social movements and norm changes to spread'
  },
  {
    id: 'trustRecoveryRate',
    name: 'Trust Recovery Rate',
    icon: '🛡️',
    unit: 'monthly recovery',
    distributionType: 'beta',
    params: { alpha: 2, beta: 5, min: 0.005, max: 0.03 },
    range: '0.5-3% per month (mode ~1%)',
    citation: 'Gillespie & Dietz (2009), Lewicki & Brinsfield (2017) - trust repair',
    impact: 'How quickly society recovers trust after AI failures or crises'
  },
  {
    id: 'climateSensitivity',
    name: 'Climate Sensitivity (ECS)',
    icon: '🌍',
    unit: '°C per CO₂ doubling',
    distributionType: 'lognormal',
    params: { mean: 3.0, stdDev: 0.75, min: 2.0, max: 5.0 },
    range: '2.0-5.0°C (best: 3.0°C)',
    citation: 'IPCC AR6 WG1 (2021) Ch 7 - Equilibrium Climate Sensitivity',
    impact: 'Controls climate tipping point timing and severity'
  },
  {
    id: 'automationTransitionSpeed',
    name: 'Automation Transition Speed',
    icon: '🤖',
    unit: 'adoption rate',
    distributionType: 'beta',
    params: { alpha: 2, beta: 5, min: 0.05, max: 0.30 },
    range: '5-30% per year (mode ~8%)',
    citation: 'Acemoglu & Restrepo (2019) - automation and task displacement',
    impact: 'How fast AI automation displaces human labor across sectors'
  },
  {
    id: 'detectionCeiling',
    name: 'Deception Detection Ceiling',
    icon: '🔍',
    unit: 'max detection rate',
    distributionType: 'beta',
    params: { alpha: 2, beta: 3, min: 0.15, max: 0.35 },
    range: '15-35% (mode ~25%)',
    citation: 'Adversarial evaluation research - sandbagging detection limits',
    impact: 'Maximum detection rate for AI deception even with full investment'
  }
];

const TIER2_THRESHOLDS: ThresholdMetadata[] = [
  {
    id: 'governmentLegitimacyCrisis',
    name: 'Government Legitimacy Crisis',
    icon: '🏛️',
    unit: 'legitimacy %',
    distributionType: 'triangular',
    params: { min: 0.25, mode: 0.30, max: 0.40 },
    range: '25-40% (mode: 30%)',
    citation: 'Historical state collapse (Weimar, USSR, Arab Spring)',
    impact: 'Legitimacy level triggering state collapse or revolution'
  },
  {
    id: 'surveillanceDystopiaThreshold',
    name: 'Surveillance Dystopia Threshold',
    icon: '👁️',
    unit: 'surveillance intensity',
    distributionType: 'uniform',
    params: { min: 0.65, max: 0.80 },
    range: '65-80% (uniform)',
    citation: 'Authoritarian surveillance states (East Germany, China, North Korea)',
    impact: 'Surveillance intensity enabling stable authoritarian control'
  },
  {
    id: 'automationDisplacementCrisis',
    name: 'Automation Displacement Crisis',
    icon: '📉',
    unit: 'unemployment rate',
    distributionType: 'triangular',
    params: { min: 0.40, mode: 0.50, max: 0.60 },
    range: '40-60% (mode: 50%)',
    citation: 'Industrial Revolution, Great Depression, Acemoglu & Restrepo (2019)',
    impact: 'Unemployment rate triggering social crisis and instability'
  },
  {
    id: 'aiRecursiveImprovementThreshold',
    name: 'AI Recursive Improvement Threshold',
    icon: '🔄',
    unit: 'monthly multiplier',
    distributionType: 'uniform',
    params: { min: 1.2, max: 1.5 },
    range: '1.2-1.5× per month (uniform)',
    citation: 'Technological improvement analogs (Moore\'s Law, AlphaGo, bootstrapping)',
    impact: 'Capability growth rate enabling AI recursive self-improvement'
  },
  {
    id: 'resentmentRevoltTrigger',
    name: 'Resentment Revolt Trigger',
    icon: '😡',
    unit: 'composite resentment',
    distributionType: 'triangular',
    params: { min: 0.60, mode: 0.70, max: 0.80 },
    range: '60-80% (mode: 70%)',
    citation: 'Historical revolutions (French, Russian, Arab Spring) - Gurr (1970)',
    impact: 'Resentment level triggering mass revolt or revolution'
  }
];

export function ThresholdConfigSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Threshold Uncertainty Configuration</CardTitle>
        </div>
        <CardDescription>
          Epistemic uncertainty distributions for critical simulation parameters.
          <Badge variant="outline" className="ml-2">10 thresholds</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
            <span className="text-muted-foreground">
              Using research-backed distributions. Click to view details.
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-4">
            <div className="space-y-6">
              {/* Description */}
              <div className="text-sm text-muted-foreground mb-4" style={{ lineHeight: '1.6' }}>
                These thresholds control key uncertainties in the simulation. Each run samples
                from these distributions to represent epistemic uncertainty (what we don't know).
                Values are based on peer-reviewed research and historical data.
              </div>

              {/* Tier 1: Empirical Thresholds */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">
                  Tier 1: Empirical Thresholds <Badge variant="secondary">High Confidence</Badge>
                </h3>
                <div className="text-xs text-muted-foreground mb-3">
                  Based on peer-reviewed research with statistical confidence intervals
                </div>

                <div className="space-y-3">
                  {TIER1_THRESHOLDS.map((threshold) => (
                    <ThresholdCard key={threshold.id} threshold={threshold} />
                  ))}
                </div>
              </div>

              {/* Tier 2: Historical Ranges */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-orange-400">
                  Tier 2: Historical Ranges <Badge variant="secondary">Moderate Confidence</Badge>
                </h3>
                <div className="text-xs text-muted-foreground mb-3">
                  Derived from historical case studies and technological analogs
                </div>

                <div className="space-y-3">
                  {TIER2_THRESHOLDS.map((threshold) => (
                    <ThresholdCard key={threshold.id} threshold={threshold} />
                  ))}
                </div>
              </div>

              {/* Help text */}
              <div className="text-xs text-muted-foreground border-t border-border pt-4 mt-4">
                💡 <strong>About Threshold Uncertainty:</strong> Each simulation run samples
                new values from these distributions. This represents our uncertainty about
                the exact values of these parameters. Monte Carlo analysis (N≥10) explores
                how outcomes vary across this uncertainty space.
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

/**
 * Individual threshold display card
 */
function ThresholdCard({ threshold }: { threshold: ThresholdMetadata }) {
  return (
    <div className="p-3 border border-border rounded-md bg-card">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{threshold.icon}</span>
        <div className="flex-1">
          <div className="font-medium">{threshold.name}</div>
          <div className="text-xs text-muted-foreground">
            {threshold.unit}
          </div>
        </div>
      </div>

      {/* Distribution visualization row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm text-muted-foreground min-w-[100px]">
          {capitalizeFirst(threshold.distributionType)}
        </div>
        <DistributionVisualizer
          type={threshold.distributionType}
          params={threshold.params}
          width={100}
          height={30}
        />
        <div className="text-sm text-muted-foreground">
          {threshold.range}
        </div>
      </div>

      {/* Impact */}
      <div className="text-sm text-muted-foreground mb-1" style={{ lineHeight: '1.4' }}>
        <strong className="text-foreground">Impact:</strong> {threshold.impact}
      </div>

      {/* Citation */}
      <div className="text-xs text-muted-foreground italic">
        Source: {threshold.citation}
      </div>
    </div>
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
