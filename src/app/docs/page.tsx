/**
 * Documentation Landing Page
 *
 * Far-future aesthetic entry point for all documentation.
 * User-role based navigation: Students, Researchers, Developers.
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

interface DocSection {
  title: string
  description: string
  href: string
  icon: string
  color: string
}

const userRoles = {
  students: {
    title: 'Students & Learners',
    description: 'New to AI safety simulation? Start here.',
    sections: [
      {
        title: 'Quick Start Guide',
        description: 'Get running in 5 minutes. Initialize your first simulation and understand the basics.',
        href: '/docs/quick-start',
        icon: '🚀',
        color: 'cyan'
      },
      {
        title: 'Understanding the Dashboard',
        description: 'What do all these metrics mean? Learn to read the complex systems at a glance.',
        href: '/docs/dashboard-guide',
        icon: '📊',
        color: 'green'
      },
      {
        title: 'Emoji Reference',
        description: 'Decode the pictographic event language. Every emoji has meaning.',
        href: '/docs/emoji-reference',
        icon: '💡',
        color: 'amber'
      }
    ]
  },
  researchers: {
    title: 'Researchers',
    description: 'Using this tool for academic research? Technical details here.',
    sections: [
      {
        title: 'System Architecture',
        description: '37-phase engine, 900+ state variables, 17-dimensional spaces. How it all works.',
        href: '/docs/architecture',
        icon: '🏗️',
        color: 'cyan'
      },
      {
        title: 'Research Standards',
        description: 'Peer-reviewed sources, parameter justification, Monte Carlo validation.',
        href: '/docs/research-standards',
        icon: '🔬',
        color: 'purple'
      },
      {
        title: 'Multi-Paradigm DUI',
        description: '4 simultaneous worldviews: Western Liberal, Development, Ecological, Indigenous.',
        href: '/docs/multi-paradigm',
        icon: '🌍',
        color: 'green'
      },
      {
        title: 'Monte Carlo Analysis',
        description: 'Running parameter sweeps, interpreting distributions, statistical validation.',
        href: '/docs/monte-carlo',
        icon: '🎲',
        color: 'amber'
      }
    ]
  },
  developers: {
    title: 'Developers',
    description: 'Contributing to the codebase? Technical docs and conventions.',
    sections: [
      {
        title: 'Development Workflow',
        description: 'Agent-based development, quality gates, defensive coding patterns.',
        href: '/docs/development',
        icon: '⚙️',
        color: 'cyan'
      },
      {
        title: 'API Reference',
        description: 'GameState interface, phase architecture, simulation engine API.',
        href: '/docs/api',
        icon: '📚',
        color: 'purple'
      },
      {
        title: 'Testing & Validation',
        description: 'Unit tests, integration tests, Monte Carlo validation strategies.',
        href: '/docs/testing',
        icon: '✅',
        color: 'green'
      },
      {
        title: 'UI Components',
        description: 'Building far-future dashboards with Next.js and Tailwind.',
        href: '/docs/ui-components',
        icon: '🎨',
        color: 'amber'
      }
    ]
  }
}

const quickLinks = [
  { title: 'Full Wiki (3000+ lines)', href: 'https://github.com/lizTheDeveloper/ai_game_theory_simulation/blob/main/docs/wiki/README.md', external: true },
  { title: 'GitHub Repository', href: 'https://github.com/lizTheDeveloper/ai_game_theory_simulation', external: true },
  { title: 'Commands Reference', href: '/docs/commands', external: false },
  { title: 'Keyboard Shortcuts', href: '/docs/shortcuts', external: false }
]

export default function DocsPage() {
  const [selectedRole, setSelectedRole] = useState<keyof typeof userRoles | null>(null)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-8 py-20">
          <div className="inline-block mb-4 px-3 py-1 text-xs tracking-wider text-cyan-400 border border-cyan-400/30 rounded-sm bg-cyan-500/5">
            DOCUMENTATION
          </div>

          <h1 className="text-5xl font-light mb-6 tracking-tight">
            Superalignment to Utopia
          </h1>

          <p className="text-xl text-white/60 max-w-3xl leading-relaxed mb-8">
            A research simulation engine modeling pathways from AI super-alignment to sustainable human flourishing.
            <span className="block mt-2 text-white/40">
              17-dimensional AI capabilities • Multi-paradigm dystopia/utopia indicators • 900+ state variables
            </span>
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-black/40 border border-white/10 p-4 rounded">
              <div className="text-3xl font-light text-cyan-400">37</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wide">Simulation Phases</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded">
              <div className="text-3xl font-light text-green-400">900+</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wide">State Variables</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded">
              <div className="text-3xl font-light text-amber-400">71</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wide">Technologies</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded">
              <div className="text-3xl font-light text-purple-400">7</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wide">Outcome Tiers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-2xl font-light mb-8">
          Choose Your Path
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {(Object.keys(userRoles) as Array<keyof typeof userRoles>).map((role) => {
            const roleData = userRoles[role]
            const isSelected = selectedRole === role

            return (
              <button
                key={role}
                onClick={() => setSelectedRole(isSelected ? null : role)}
                className={`
                  text-left p-6 rounded border transition-all duration-300
                  ${isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                    : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5'
                  }
                `}
              >
                <h3 className="text-lg font-medium mb-2">{roleData.title}</h3>
                <p className="text-sm text-white/60">{roleData.description}</p>
              </button>
            )
          })}
        </div>

        {/* Role-Specific Sections */}
        {selectedRole && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
            <h3 className="text-xl font-light mb-6 text-cyan-400">
              {userRoles[selectedRole].title} Documentation
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {userRoles[selectedRole].sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`
                    group block p-6 rounded border border-white/10
                    hover:border-${section.color}-400/60
                    bg-black/40 hover:bg-${section.color}-500/5
                    transition-all duration-300
                    hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]
                  `}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{section.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-base font-medium mb-2 group-hover:text-cyan-400 transition-colors">
                        {section.title}
                      </h4>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-16 pt-16 border-t border-white/10">
          <h3 className="text-xl font-light mb-6">Quick Links</h3>

          <div className="grid md:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="
                  px-4 py-3 text-sm text-center
                  border border-white/20 rounded
                  hover:border-cyan-400/60 hover:bg-cyan-500/5
                  transition-all duration-300
                  hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]
                "
              >
                {link.title}
                {link.external && <span className="ml-1 text-xs text-white/40">↗</span>}
              </a>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="mt-12 p-6 border border-white/10 rounded bg-black/40">
          <h3 className="text-lg font-light mb-4 text-cyan-400">Dashboard Navigation</h3>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Overview</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">1</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Paradigms</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">2</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">AI Agents</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">3</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Crises</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">4</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Pause/Play</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Real-Time</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">0</kbd>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
