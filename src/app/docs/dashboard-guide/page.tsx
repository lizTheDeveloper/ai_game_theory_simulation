/**
 * Dashboard Guide
 *
 * Complete guide to understanding all dashboard metrics.
 */

'use client'

import Link from 'next/link'

interface MetricSection {
  title: string
  metrics: Array<{
    name: string
    meaning: string
    interpretation: string
    goodValue: string
    badValue: string
  }>
}

const metricSections: MetricSection[] = [
  {
    title: 'Core Systems',
    metrics: [
      {
        name: 'Quality of Life (QoL)',
        meaning: '17-dimensional measure across 5 tiers (survival → environmental quality)',
        interpretation: 'Higher = better. Below 1000 = basic survival threatened. Above 5000 = flourishing.',
        goodValue: '5000+ (transcendent)',
        badValue: '<1000 (survival crisis)'
      },
      {
        name: 'Population',
        meaning: 'Global human population in billions',
        interpretation: 'Rapid decline = crisis. Steady growth = stability. Decline indicates crises, famines, or collapse.',
        goodValue: '8-10 billion (stable)',
        badValue: '<6 billion (collapse)'
      },
      {
        name: 'Extinction Risk',
        meaning: 'Probability of human extinction this turn (0-100%)',
        interpretation: 'Any value >0% is concerning. Accumulates from AI misalignment, nuclear war, environmental collapse.',
        goodValue: '0% (no risk)',
        badValue: '>5% (critical)'
      }
    ]
  },
  {
    title: 'Planetary Systems',
    metrics: [
      {
        name: 'Boundaries Crossed',
        meaning: 'Number of 9 planetary boundaries exceeded (climate, biodiversity, phosphorus, etc.)',
        interpretation: 'Safe operating space for humanity. More crossed = higher collapse risk.',
        goodValue: '0-2 (safe)',
        badValue: '5+ (danger zone)'
      },
      {
        name: 'Environmental Debt',
        meaning: 'Accumulated environmental damage (0-100)',
        interpretation: 'Higher = harder to recover. Above 50 = cascading failures likely. Tracks pollution, ecosystem damage, resource depletion.',
        goodValue: '<20 (recoverable)',
        badValue: '>60 (cascades)'
      },
      {
        name: 'Climate Δ',
        meaning: 'Global temperature change from pre-industrial baseline (°C)',
        interpretation: '+1.5°C = tipping points. +2°C = severe impacts. +3°C = catastrophic. +4°C+ = collapse likely.',
        goodValue: '<1.5°C (Paris target)',
        badValue: '>2.5°C (catastrophic)'
      }
    ]
  },
  {
    title: 'AI Ecosystem',
    metrics: [
      {
        name: 'Total Agents',
        meaning: 'Number of AI agents in the simulation',
        interpretation: 'More agents = more capability but also more coordination challenges.',
        goodValue: '20-80 (manageable)',
        badValue: '100+ (chaos risk)'
      },
      {
        name: 'Capability',
        meaning: '17-dimensional AI capability profile (physical, digital, cognitive, social, economic, research)',
        interpretation: 'Higher = more powerful. Rapid growth without alignment = danger. Watch for capability jumps.',
        goodValue: 'Slow, aligned growth',
        badValue: 'Rapid unaligned growth'
      },
      {
        name: 'Aligned / Misaligned / Sleepers',
        meaning: 'Distribution of agent alignment states',
        interpretation: 'Aligned = safe. Misaligned = danger. Sleepers = deceptive (hidden misalignment). High sleeper count = crisis.',
        goodValue: '>80% aligned',
        badValue: '>20% misaligned or sleepers'
      }
    ]
  },
  {
    title: 'Social Fabric',
    metrics: [
      {
        name: 'Social Cohesion',
        meaning: 'Overall social trust and cooperation (0-100%)',
        interpretation: 'Higher = societies can solve problems together. Lower = fragmentation, conflict, inability to coordinate.',
        goodValue: '>70% (functional)',
        badValue: '<40% (breakdown)'
      },
      {
        name: 'Trust',
        meaning: 'Interpersonal and institutional trust (0-100%)',
        interpretation: 'Foundation for cooperation. Low trust = can\'t deploy beneficial tech, can\'t respond to crises.',
        goodValue: '>60% (robust)',
        badValue: '<30% (crisis)'
      },
      {
        name: 'Meaning',
        meaning: 'Collective sense of purpose and existential security (0-100%)',
        interpretation: 'Low meaning = nihilism, unrest, inability to envision positive futures. Needed for long-term projects.',
        goodValue: '>50% (hopeful)',
        badValue: '<20% (nihilism)'
      },
      {
        name: 'Social Debt',
        meaning: 'Accumulated social damage and trauma (0-100)',
        interpretation: 'Higher = harder to rebuild trust. Above 60 = generational trauma. Caused by crises, conflict, institutional failure.',
        goodValue: '<20 (resilient)',
        badValue: '>60 (traumatized)'
      }
    ]
  },
  {
    title: 'Technology',
    metrics: [
      {
        name: 'Deployed Technologies',
        meaning: 'Count of breakthrough technologies deployed (out of 71)',
        interpretation: 'More tech = more capability to solve problems, but also more risk if misused. Tech Tiers: 0-4 (crisis response → clarketech).',
        goodValue: '10-30 (balanced)',
        badValue: '0 (stagnant) or 50+ (out of control)'
      },
      {
        name: 'Tech Risk Level',
        meaning: 'Aggregate existential risk from deployed technologies',
        interpretation: 'Some techs are dual-use (fusion, biotech, AI). Risk grows with capability. Watch for runaway tech.',
        goodValue: 'Low (controlled)',
        badValue: 'High (dangerous)'
      }
    ]
  },
  {
    title: 'Governance',
    metrics: [
      {
        name: 'AI Regulation',
        meaning: 'Effectiveness of AI governance and oversight',
        interpretation: 'Higher = better control over AI development. Low = wild west, racing dynamics, misalignment risk.',
        goodValue: 'Strong (coordinated)',
        badValue: 'Weak (unregulated)'
      },
      {
        name: 'Comprehension',
        meaning: 'How well institutions understand AI risks (0-100%)',
        interpretation: 'Higher = better policy. Low = blind spots, inadequate response, regulatory capture.',
        goodValue: '>70% (informed)',
        badValue: '<30% (clueless)'
      },
      {
        name: 'Investment',
        meaning: 'Resource allocation to AI safety and alignment',
        interpretation: 'Higher = more research, better tools. Low = racing ahead without safety.',
        goodValue: '>30% (prioritized)',
        badValue: '<10% (neglected)'
      },
      {
        name: 'Cooperation',
        meaning: 'International coordination on AI governance',
        interpretation: 'Higher = treaties, joint research, shared standards. Low = arms race, fragmentation.',
        goodValue: '>60% (aligned)',
        badValue: '<20% (competitive)'
      }
    ]
  },
  {
    title: 'Outcome Trajectories',
    metrics: [
      {
        name: 'Dystopia Risk',
        meaning: 'Probability of ending in dystopia (authoritarian, environmental collapse, permanent stagnation)',
        interpretation: 'Rising dystopia risk = systems degrading but not collapsing. Chronic suffering.',
        goodValue: '<10% (unlikely)',
        badValue: '>40% (probable)'
      },
      {
        name: 'Utopia Progress',
        meaning: 'Probability of reaching utopia (transcendent QoL, ecological restoration, universal flourishing)',
        interpretation: 'Rising utopia = positive spirals engaged. QoL growing, environment recovering, meaning high.',
        goodValue: '>30% (hopeful)',
        badValue: '<5% (bleak)'
      }
    ]
  }
]

export default function DashboardGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/docs" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Documentation
          </Link>
        </div>

        {/* Title */}
        <div className="mb-12">
          <div className="inline-block mb-4 px-3 py-1 text-xs tracking-wider text-cyan-400 border border-cyan-400/30 rounded-sm bg-cyan-500/5">
            DASHBOARD REFERENCE
          </div>
          <h1 className="text-4xl font-light mb-4">Understanding the Dashboard</h1>
          <p className="text-lg text-white/60">
            Complete guide to all 900+ state variables. What they mean, how to interpret them, and what to watch for.
          </p>
        </div>

        {/* Color Legend */}
        <div className="mb-12 p-6 border border-white/10 rounded bg-black/40">
          <h2 className="text-lg font-medium mb-4 text-cyan-400">Color Coding</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-400 rounded shadow-[0_0_10px_rgba(0,255,136,0.6)]" />
              <div className="text-sm">
                <div className="text-white/80">Green</div>
                <div className="text-xs text-white/60">Good / Success</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-cyan-400 rounded shadow-[0_0_10px_rgba(0,240,255,0.6)]" />
              <div className="text-sm">
                <div className="text-white/80">Cyan</div>
                <div className="text-xs text-white/60">Active / Info</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-400 rounded shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
              <div className="text-sm">
                <div className="text-white/80">Amber</div>
                <div className="text-xs text-white/60">Warning / Caution</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-400 rounded shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
              <div className="text-sm">
                <div className="text-white/80">Red</div>
                <div className="text-xs text-white/60">Danger / Crisis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Sections */}
        <div className="space-y-12">
          {metricSections.map((section, i) => (
            <section key={i}>
              <h2 className="text-2xl font-light mb-6 text-cyan-400">{section.title}</h2>

              <div className="space-y-6">
                {section.metrics.map((metric, j) => (
                  <div key={j} className="border-l-2 border-cyan-400/30 pl-6 pb-6">
                    <h3 className="text-lg font-medium text-white mb-2">{metric.name}</h3>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-white/60">What it is:</span>
                        <span className="text-white/80 ml-2">{metric.meaning}</span>
                      </div>

                      <div>
                        <span className="text-white/60">How to read it:</span>
                        <span className="text-white/80 ml-2">{metric.interpretation}</span>
                      </div>

                      <div className="flex gap-6 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400/20 border border-green-400/60 rounded" />
                          <span className="text-white/60">Good:</span>
                          <span className="text-green-400">{metric.goodValue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-400/20 border border-red-400/60 rounded" />
                          <span className="text-white/60">Bad:</span>
                          <span className="text-red-400">{metric.badValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Visual Elements */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-light mb-6">Visual Elements</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-white/10 rounded bg-black/40">
              <div className="text-xl mb-3">📈 Sparklines</div>
              <p className="text-sm text-white/60 mb-3">
                Mini line charts showing trends over time. Green = increasing, Red = decreasing, Flat = stable.
              </p>
              <div className="bg-black/60 p-3 rounded">
                <div className="text-xs text-white/40">Upward slope → improving metric</div>
                <div className="text-xs text-white/40">Downward slope → degrading metric</div>
                <div className="text-xs text-white/40">Sharp changes → crisis or breakthrough</div>
              </div>
            </div>

            <div className="p-6 border border-white/10 rounded bg-black/40">
              <div className="text-xl mb-3">⚡ Progress Bars</div>
              <p className="text-sm text-white/60 mb-3">
                Horizontal bars showing completion or severity. Color indicates urgency.
              </p>
              <div className="bg-black/60 p-3 rounded space-y-1">
                <div className="text-xs text-white/40">Green → healthy / on track</div>
                <div className="text-xs text-white/40">Amber → approaching threshold</div>
                <div className="text-xs text-white/40">Red → critical / exceeded limit</div>
              </div>
            </div>

            <div className="p-6 border border-white/10 rounded bg-black/40">
              <div className="text-xl mb-3">🎨 Heatmaps</div>
              <p className="text-sm text-white/60 mb-3">
                Grid visualizations for multi-dimensional data (AI capabilities, QoL dimensions).
              </p>
              <div className="bg-black/60 p-3 rounded">
                <div className="text-xs text-white/40">Brighter cells → higher values</div>
                <div className="text-xs text-white/40">Darker cells → lower values</div>
                <div className="text-xs text-white/40">Hover for exact numbers</div>
              </div>
            </div>

            <div className="p-6 border border-white/10 rounded bg-black/40">
              <div className="text-xl mb-3">📝 Event Stream</div>
              <p className="text-sm text-white/60 mb-3">
                Chronological log of significant events. Uses pictographic emoji language.
              </p>
              <div className="bg-black/60 p-3 rounded">
                <div className="text-xs text-white/40">💡 → Breakthroughs</div>
                <div className="text-xs text-white/40">🚨 → Critical alerts</div>
                <div className="text-xs text-white/40">⚠️ → Warnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-light mb-6">Related Documentation</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/docs/emoji-reference" className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all">
              <div className="text-2xl mb-2">💡</div>
              <div className="text-sm font-medium mb-2">Emoji Reference</div>
              <div className="text-xs text-white/60">Decode the event language</div>
            </Link>

            <Link href="/docs/multi-paradigm" className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all">
              <div className="text-2xl mb-2">🌍</div>
              <div className="text-sm font-medium mb-2">Multi-Paradigm DUI</div>
              <div className="text-xs text-white/60">4 worldviews scoring reality</div>
            </Link>

            <a
              href="https://github.com/lizTheDeveloper/ai_game_theory_simulation/blob/main/docs/wiki/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium mb-2">Full Wiki</div>
              <div className="text-xs text-white/60">3000+ line technical reference ↗</div>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
