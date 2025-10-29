/**
 * Quick Start Guide
 *
 * Get new users running in 5 minutes.
 */

'use client'

import Link from 'next/link'

export default function QuickStartPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/docs" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Documentation
          </Link>
        </div>

        {/* Title */}
        <div className="mb-12">
          <div className="inline-block mb-4 px-3 py-1 text-xs tracking-wider text-cyan-400 border border-cyan-400/30 rounded-sm bg-cyan-500/5">
            FOR STUDENTS
          </div>
          <h1 className="text-4xl font-light mb-4">Quick Start Guide</h1>
          <p className="text-lg text-white/60">
            Initialize your first simulation and understand the basics in 5 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="border-l-2 border-cyan-400 pl-8 relative">
            <div className="absolute -left-3 top-0 w-5 h-5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.6)]" />

            <h2 className="text-2xl font-light mb-4">
              <span className="text-cyan-400">Step 1:</span> Navigate to Dashboard
            </h2>

            <p className="text-white/80 mb-4 leading-relaxed">
              When you first load the application, you'll see the main dashboard. The left sidebar contains navigation
              to all dashboard views. Use keyboard shortcuts (1-9) for quick navigation.
            </p>

            <div className="bg-black/60 border border-white/10 p-4 rounded">
              <p className="text-sm text-white/60 mb-2">Pro Tip:</p>
              <p className="text-sm text-white/80">
                Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">1</kbd> to return to Overview,
                or <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Space</kbd> to pause/play the simulation.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-2 border-green-400 pl-8 relative">
            <div className="absolute -left-3 top-0 w-5 h-5 bg-green-400 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.6)]" />

            <h2 className="text-2xl font-light mb-4">
              <span className="text-green-400">Step 2:</span> Initialize Simulation
            </h2>

            <p className="text-white/80 mb-4 leading-relaxed">
              Click the <strong className="text-cyan-400">"Configure & Start"</strong> button in the left sidebar.
              This opens the initialization modal where you can configure your simulation.
            </p>

            <div className="bg-black/60 border border-white/10 p-4 rounded mb-4">
              <h3 className="text-sm font-medium mb-3 text-white/80">Configuration Options:</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><strong className="text-white/80">RNG Seed:</strong> Number for reproducibility (default: 42000)</li>
                <li><strong className="text-white/80">Scenario Mode:</strong> Historical (known AI timelines) or Unprecedented (novel scenarios)</li>
                <li><strong className="text-white/80">Simulation Speed:</strong> 0.5x to 4x (faster = more compute intensive)</li>
                <li><strong className="text-white/80">Alignment Dynamics:</strong> How stable is AI alignment? (default, conservative, pessimistic, epicycle)</li>
                <li><strong className="text-white/80">Climate Priority:</strong> Government resource allocation to climate (baseline to crisis mode)</li>
                <li><strong className="text-white/80">Epistemic Scenario:</strong> Your worldview (doom → cautious → baseline → progressive → utopia)</li>
              </ul>
            </div>

            <div className="bg-amber-500/10 border border-amber-400/30 p-4 rounded">
              <p className="text-sm text-amber-400 mb-2">⚠️ For Your First Run:</p>
              <p className="text-sm text-white/80">
                Stick with default settings. You can explore advanced configuration after you understand the basics.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-2 border-purple-400 pl-8 relative">
            <div className="absolute -left-3 top-0 w-5 h-5 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" />

            <h2 className="text-2xl font-light mb-4">
              <span className="text-purple-400">Step 3:</span> Watch It Run
            </h2>

            <p className="text-white/80 mb-4 leading-relaxed">
              Once initialized, the simulation starts running immediately. You'll see:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-black/60 border border-white/10 p-4 rounded">
                <div className="text-cyan-400 text-xl mb-2">📊 Metrics Update</div>
                <p className="text-sm text-white/60">
                  Quality of Life, AI capabilities, environmental boundaries, social cohesion, and more.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 p-4 rounded">
                <div className="text-green-400 text-xl mb-2">📝 Event Stream</div>
                <p className="text-sm text-white/60">
                  Narrative log of significant events (crises, breakthroughs, agent actions).
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 p-4 rounded">
                <div className="text-amber-400 text-xl mb-2">📈 Trend Lines</div>
                <p className="text-sm text-white/60">
                  Sparklines show trajectory over time. Upward = good, downward = crisis.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 p-4 rounded">
                <div className="text-purple-400 text-xl mb-2">🎯 Outcome Probabilities</div>
                <p className="text-sm text-white/60">
                  Real-time forecast of where this simulation is heading (utopia → extinction).
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-2 border-amber-400 pl-8 relative">
            <div className="absolute -left-3 top-0 w-5 h-5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />

            <h2 className="text-2xl font-light mb-4">
              <span className="text-amber-400">Step 4:</span> Explore Different Views
            </h2>

            <p className="text-white/80 mb-4 leading-relaxed">
              Each dashboard view focuses on a different system. Navigate using the sidebar or keyboard shortcuts:
            </p>

            <div className="grid md:grid-cols-2 gap-3">
              <Link href="/paradigms" className="p-3 border border-white/10 rounded hover:border-cyan-400/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">2</kbd>
                  <div>
                    <div className="text-sm font-medium group-hover:text-cyan-400 transition-colors">Paradigms</div>
                    <div className="text-xs text-white/60">4 worldviews scoring same reality</div>
                  </div>
                </div>
              </Link>

              <Link href="/ai-agents" className="p-3 border border-white/10 rounded hover:border-cyan-400/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">3</kbd>
                  <div>
                    <div className="text-sm font-medium group-hover:text-cyan-400 transition-colors">AI Agents</div>
                    <div className="text-xs text-white/60">20 agents, alignment, sandbagging</div>
                  </div>
                </div>
              </Link>

              <Link href="/environment" className="p-3 border border-white/10 rounded hover:border-cyan-400/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">5</kbd>
                  <div>
                    <div className="text-sm font-medium group-hover:text-cyan-400 transition-colors">Environment</div>
                    <div className="text-xs text-white/60">9 planetary boundaries</div>
                  </div>
                </div>
              </Link>

              <Link href="/crises" className="p-3 border border-white/10 rounded hover:border-cyan-400/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">4</kbd>
                  <div>
                    <div className="text-sm font-medium group-hover:text-cyan-400 transition-colors">Crises</div>
                    <div className="text-xs text-white/60">10 crisis types, cascades</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-l-2 border-red-400 pl-8 relative">
            <div className="absolute -left-3 top-0 w-5 h-5 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.6)]" />

            <h2 className="text-2xl font-light mb-4">
              <span className="text-red-400">Step 5:</span> Understand Outcomes
            </h2>

            <p className="text-white/80 mb-4 leading-relaxed">
              Simulations end when they reach a stable outcome (or extinction). The 7-tier classification system:
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/30 rounded">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="text-sm font-medium text-green-400">Tier 1-2: Utopia / Flourishing</div>
                  <div className="text-xs text-white/60">Transcendent QoL, ecological harmony, universal meaning</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded">
                <span className="text-2xl">⚖️</span>
                <div>
                  <div className="text-sm font-medium text-yellow-400">Tier 3-4: Status Quo / Muddling Through</div>
                  <div className="text-xs text-white/60">Survival maintained, some growth, ongoing crises</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-400/30 rounded">
                <span className="text-2xl">📉</span>
                <div>
                  <div className="text-sm font-medium text-orange-400">Tier 5-6: Dystopia / Collapse</div>
                  <div className="text-xs text-white/60">Quality of life declining, environmental/social breakdown</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-400/30 rounded">
                <span className="text-2xl">💀</span>
                <div>
                  <div className="text-sm font-medium text-red-400">Tier 7: Extinction</div>
                  <div className="text-xs text-white/60">Human extinction or irreversible collapse</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-light mb-6">Next Steps</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/docs/dashboard-guide" className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium mb-2">Dashboard Guide</div>
              <div className="text-xs text-white/60">Learn what every metric means</div>
            </Link>

            <Link href="/docs/emoji-reference" className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all">
              <div className="text-2xl mb-2">💡</div>
              <div className="text-sm font-medium mb-2">Emoji Reference</div>
              <div className="text-xs text-white/60">Decode the event language</div>
            </Link>

            <Link href="/docs/monte-carlo" className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all">
              <div className="text-2xl mb-2">🎲</div>
              <div className="text-sm font-medium mb-2">Monte Carlo Analysis</div>
              <div className="text-xs text-white/60">Run parameter sweeps</div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
