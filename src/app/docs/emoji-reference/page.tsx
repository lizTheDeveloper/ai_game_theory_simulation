/**
 * Emoji Reference Page
 *
 * Interactive guide to the pictographic event language.
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

interface EmojiEntry {
  emoji: string
  category: string
  usage: string
  examples: string[]
  color: string
}

const coreEmojis: EmojiEntry[] = [
  {
    emoji: '❌',
    category: 'Error',
    usage: 'Hard errors, crashes, failed assertions',
    examples: ['❌ Invalid state detected', '❌ Division by zero', '❌ Assertion failed'],
    color: 'red'
  },
  {
    emoji: '⚠️',
    category: 'Warning',
    usage: 'Warnings, potential problems, threshold approaching',
    examples: ['⚠️ Threshold approaching 90%', '⚠️ High memory usage', '⚠️ Climate boundary near'],
    color: 'amber'
  },
  {
    emoji: '🚨',
    category: 'Critical Alert',
    usage: 'Emergency situations, crisis declarations',
    examples: ['🚨 EMERGENCY AI PAUSE', '🚨 Nuclear crisis', '🚨 Ecosystem collapse imminent'],
    color: 'red'
  },
  {
    emoji: '✅',
    category: 'Success',
    usage: 'Successful operations, completions, passed checks',
    examples: ['✅ Batch complete', '✅ Technology deployed', '✅ Crisis resolved'],
    color: 'green'
  },
  {
    emoji: '📊',
    category: 'Data',
    usage: 'Statistics, metrics display, analysis summaries',
    examples: ['📊 Outcome Distribution:', '📊 Parameter sweep results', '📊 Monte Carlo stats'],
    color: 'cyan'
  },
  {
    emoji: '🔄',
    category: 'Progress',
    usage: 'In-progress operations, state transitions',
    examples: ['🔄 Economic transition ongoing', '🔄 Simulation running', '🔄 Phase executing'],
    color: 'purple'
  },
  {
    emoji: '💡',
    category: 'Breakthrough',
    usage: 'Research breakthroughs, innovations, discoveries',
    examples: ['💡 BREAKTHROUGH: Fusion power', '💡 AI alignment solved', '💡 Carbon capture tech'],
    color: 'amber'
  }
]

const domainEmojis: EmojiEntry[] = [
  {
    emoji: '☢️',
    category: 'Nuclear',
    usage: 'Nuclear events, radiation, nuclear war',
    examples: ['☢️💥 NUCLEAR DETONATION', '☢️ Radiation levels rising', '☢️ Nuclear winter begins'],
    color: 'red'
  },
  {
    emoji: '🌍',
    category: 'Environment',
    usage: 'Climate, environmental systems, planetary boundaries',
    examples: ['🌍💡 BREAKTHROUGH: Carbon capture', '🌍 Planetary boundary crossed', '🌍 Environmental restoration'],
    color: 'green'
  },
  {
    emoji: '🌡️',
    category: 'Climate',
    usage: 'Temperature/climate specifically',
    examples: ['🌡️ Global temperature +2.5°C', '🌡️ Climate tipping point', '🌡️ Heat waves intensify'],
    color: 'orange'
  },
  {
    emoji: '🤖',
    category: 'AI',
    usage: 'AI agents, autonomous systems',
    examples: ['🤖 Agent deployed', '🤖 AI capability increased', '🤖 Alignment drift detected'],
    color: 'cyan'
  },
  {
    emoji: '🧠',
    category: 'Cognitive',
    usage: 'Cognitive/intelligence/learning events',
    examples: ['🧠💡 BREAKTHROUGH: AGI', '🧠 Cognitive enhancement', '🧠 Learning rate accelerates'],
    color: 'purple'
  },
  {
    emoji: '🏛️',
    category: 'Governance',
    usage: 'Government actions, political events',
    examples: ['🏛️ Policy enacted', '🏛️ International cooperation', '🏛️ Governance failure'],
    color: 'blue'
  },
  {
    emoji: '🔬',
    category: 'Research',
    usage: 'Scientific research, experiments',
    examples: ['🔬 Research project initiated', '🔬 Breakthrough achieved', '🔬 Study completed'],
    color: 'cyan'
  },
  {
    emoji: '🤝',
    category: 'Cooperation',
    usage: 'Diplomacy, collective action, cooperation',
    examples: ['🤝 International agreement', '🤝 Trust increased', '🤝 Coalition formed'],
    color: 'green'
  },
  {
    emoji: '🎭',
    category: 'Deception',
    usage: 'Deception, manipulation, strategic behavior',
    examples: ['🎭 Agent sandbagging detected', '🎭 Deceptive alignment', '🎭 Hidden capabilities revealed'],
    color: 'purple'
  },
  {
    emoji: '💔',
    category: 'Trauma',
    usage: 'Social breakdown, trauma, collapse',
    examples: ['💔 Social cohesion collapsing', '💔 Trust crisis', '💔 Institutional failure'],
    color: 'red'
  }
]

const extinctionEmojis: EmojiEntry[] = [
  {
    emoji: '☠️',
    category: 'Extinction',
    usage: 'Use ONLY for extinction-level catastrophic events',
    examples: ['☠️ Grey goo scenario', '☠️ Human extinction', '☠️ Irreversible collapse'],
    color: 'red'
  },
  {
    emoji: '💀',
    category: 'Catastrophe',
    usage: 'Use ONLY for catastrophic scenarios (not general errors)',
    examples: ['💀 Civilization collapse', '💀 Ecosystem extinction', '💀 Nuclear winter terminal'],
    color: 'red'
  }
]

export default function EmojiReferencePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const allEmojis = [...coreEmojis, ...domainEmojis, ...extinctionEmojis]

  const filteredEmojis = allEmojis.filter(entry => {
    const matchesSearch =
      entry.emoji.includes(searchTerm) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.usage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.examples.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = !selectedCategory || entry.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(allEmojis.map(e => e.category)))

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
            PICTOGRAPHIC LANGUAGE
          </div>
          <h1 className="text-4xl font-light mb-4">Emoji Reference</h1>
          <p className="text-lg text-white/60">
            One canonical emoji per concept. Decode the simulation's event language.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search emojis, categories, or usage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-white/20 rounded text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none transition-colors"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-sm rounded border transition-all ${
                !selectedCategory
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                  : 'border-white/20 bg-black/40 text-white/60 hover:border-white/40'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={`px-3 py-1.5 text-sm rounded border transition-all ${
                  selectedCategory === category
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                    : 'border-white/20 bg-black/40 text-white/60 hover:border-white/40'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Grid */}
        <div className="space-y-12">
          {/* Core Emojis */}
          <section>
            <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
              <span className="text-cyan-400">Core Emojis</span>
              <span className="text-sm text-white/40 font-normal">(Use these most often)</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {coreEmojis
                .filter(entry => filteredEmojis.includes(entry))
                .map((entry) => (
                  <EmojiCard key={entry.emoji} entry={entry} />
                ))}
            </div>
          </section>

          {/* Domain Emojis */}
          <section>
            <h2 className="text-2xl font-light mb-6 text-green-400">Domain-Specific Emojis</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {domainEmojis
                .filter(entry => filteredEmojis.includes(entry))
                .map((entry) => (
                  <EmojiCard key={entry.emoji} entry={entry} />
                ))}
            </div>
          </section>

          {/* Extinction Emojis */}
          <section>
            <h2 className="text-2xl font-light mb-6 text-red-400">Extinction-Only Emojis</h2>
            <p className="text-sm text-white/60 mb-6">
              ⚠️ Use sparingly! These are reserved for extinction-level events only.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {extinctionEmojis
                .filter(entry => filteredEmojis.includes(entry))
                .map((entry) => (
                  <EmojiCard key={entry.emoji} entry={entry} />
                ))}
            </div>
          </section>
        </div>

        {/* Combining Pattern */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-light mb-6">Combining Emojis</h2>

          <div className="bg-black/60 border border-white/10 p-6 rounded">
            <p className="text-white/80 mb-4">
              <strong className="text-cyan-400">Pattern:</strong> <code className="px-2 py-1 bg-white/10 rounded text-sm">[DOMAIN][EVENT_TYPE] [MESSAGE]</code>
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌍💡</span>
                <div>
                  <div className="text-sm font-medium text-cyan-400">Environment + Breakthrough</div>
                  <div className="text-xs text-white/60">BREAKTHROUGH: Gigatonne carbon capture deployed</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠💡</span>
                <div>
                  <div className="text-sm font-medium text-purple-400">Cognitive + Breakthrough</div>
                  <div className="text-xs text-white/60">BREAKTHROUGH: AGI alignment solved</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">☢️💥</span>
                <div>
                  <div className="text-sm font-medium text-red-400">Nuclear + Catastrophe</div>
                  <div className="text-xs text-white/60">NUCLEAR DETONATION: India-Pakistan exchange</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/60 mt-4">
              <strong>Rule:</strong> Maximum 2 emojis. First = domain/context, second = event type.
            </p>
          </div>
        </div>

        {/* Decision Tree */}
        <div className="mt-12 p-6 border border-white/10 rounded bg-black/40">
          <h3 className="text-lg font-medium mb-4 text-cyan-400">Quick Decision Tree</h3>

          <div className="space-y-2 text-sm font-mono text-white/80">
            <div>Is it an error/failure?</div>
            <div className="ml-4">├─ Yes: Is it extinction-level?</div>
            <div className="ml-8">│  ├─ Yes: <span className="text-red-400">☠️ or 💀</span></div>
            <div className="ml-8">│  └─ No: <span className="text-red-400">❌</span></div>
            <div className="ml-4">└─ No: Is it a success?</div>
            <div className="ml-8">├─ Yes: Is it a breakthrough?</div>
            <div className="ml-12">│  ├─ Yes: <span className="text-amber-400">💡</span></div>
            <div className="ml-12">│  └─ No: <span className="text-green-400">✅</span></div>
            <div className="ml-8">└─ No: Is it a warning?</div>
            <div className="ml-12">├─ Yes: Emergency?</div>
            <div className="ml-16">│  ├─ Yes: <span className="text-red-400">🚨</span></div>
            <div className="ml-16">│  └─ No: <span className="text-amber-400">⚠️</span></div>
            <div className="ml-12">└─ No: Check domain-specific emojis</div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-light mb-6">Related Documentation</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/dashboard-guide" className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium mb-2">Dashboard Guide</div>
              <div className="text-xs text-white/60">Learn what events mean in context</div>
            </Link>

            <a
              href="https://github.com/lizTheDeveloper/ai_game_theory_simulation/blob/main/docs/EMOJI_SEMANTIC_MAP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 border border-white/10 rounded hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium mb-2">Full Emoji Spec (12K)</div>
              <div className="text-xs text-white/60">Complete technical reference ↗</div>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

function EmojiCard({ entry }: { entry: EmojiEntry }) {
  const colorClasses = {
    red: 'border-red-400/30 hover:bg-red-500/5 hover:border-red-400/60',
    amber: 'border-amber-400/30 hover:bg-amber-500/5 hover:border-amber-400/60',
    green: 'border-green-400/30 hover:bg-green-500/5 hover:border-green-400/60',
    cyan: 'border-cyan-400/30 hover:bg-cyan-500/5 hover:border-cyan-400/60',
    purple: 'border-purple-400/30 hover:bg-purple-500/5 hover:border-purple-400/60',
    blue: 'border-blue-400/30 hover:bg-blue-500/5 hover:border-blue-400/60',
    orange: 'border-orange-400/30 hover:bg-orange-500/5 hover:border-orange-400/60'
  }

  return (
    <div className={`p-4 border rounded bg-black/40 transition-all ${colorClasses[entry.color as keyof typeof colorClasses]}`}>
      <div className="flex items-start gap-4 mb-3">
        <span className="text-4xl">{entry.emoji}</span>
        <div className="flex-1">
          <h3 className="text-base font-medium mb-1">{entry.category}</h3>
          <p className="text-sm text-white/60">{entry.usage}</p>
        </div>
      </div>

      <div className="space-y-1">
        {entry.examples.slice(0, 2).map((example, i) => (
          <div key={i} className="text-xs text-white/40 font-mono bg-white/5 px-2 py-1 rounded">
            {example}
          </div>
        ))}
      </div>
    </div>
  )
}
