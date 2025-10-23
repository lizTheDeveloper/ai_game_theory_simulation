/**
 * Navigation Component
 *
 * Main navigation for dashboard screens.
 * Supports keyboard shortcuts (1-9 for quick navigation).
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/dashboard', shortcut: '1' },
  { label: 'Paradigms', href: '/paradigms', shortcut: '2' },
  { label: 'AI Agents', href: '/ai-agents', shortcut: '3' },
  { label: 'Crises', href: '/crises', shortcut: '4' },
  { label: 'Environment', href: '/environment', shortcut: '5' },
  { label: 'Tech Tree', href: '/tech-tree', shortcut: '6' },
  { label: 'Detection', href: '/detection', shortcut: '7' },
  { label: 'Regions', href: '/regions', shortcut: '8' },
  { label: 'Timeline', href: '/timeline', shortcut: '9' },
  { label: 'Real-Time', href: '/realtime', shortcut: '0' },
]

export function Navigation() {
  const pathname = usePathname()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key
      if (key === '0') {
        // Real-time view (last item)
        window.location.href = navItems[navItems.length - 1]?.href || '/realtime'
      } else {
        const num = parseInt(key)
        if (num >= 1 && num <= 9) {
          const item = navItems[num - 1]
          if (item) {
            window.location.href = item.href
          }
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [])

  return (
    <nav className="fixed left-0 top-0 h-full w-64 border-r" style={{ borderColor: 'var(--white-10)', backgroundColor: 'var(--color-near-black)' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--white-10)' }}>
        <h1 className="text-lg font-semibold mb-1">Simulation Dashboard</h1>
        <p className="text-xs" style={{ color: 'var(--white-40)' }}>
          Research Tool
        </p>
      </div>

      {/* Nav Items */}
      <div className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded transition-colors",
                isActive
                  ? "glow-cyan"
                  : "hover:bg-white/5"
              )}
            >
              <span className={cn(
                "text-sm",
                isActive ? "text-white font-medium" : "text-white/60"
              )}>
                {item.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--white-30)' }}>
                {item.shortcut}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t text-xs" style={{ borderColor: 'var(--white-10)', color: 'var(--white-30)' }}>
        <div className="mb-2">Keyboard: 0-9 for quick nav</div>
        <div>Design: Elysium 2100s</div>
      </div>
    </nav>
  )
}
