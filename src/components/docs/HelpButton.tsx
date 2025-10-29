/**
 * Help Button Component
 *
 * Floating help button with contextual documentation tooltips.
 * Far-future aesthetic with glowing cyan.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HelpContent {
  title: string
  description: string
  metrics?: Array<{
    name: string
    meaning: string
    interpretation: string
  }>
  docsLink?: string
}

interface HelpButtonProps {
  content: HelpContent
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function HelpButton({ content, position = 'top-right' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    'top-right': 'top-6 right-6',
    'bottom-right': 'bottom-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-left': 'bottom-6 left-6'
  }

  const tooltipPositionClasses = {
    'top-right': 'right-0 top-14',
    'bottom-right': 'right-0 bottom-14',
    'top-left': 'left-0 top-14',
    'bottom-left': 'left-0 bottom-14'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-12 h-12 rounded-full
          border-2 transition-all duration-300
          flex items-center justify-center
          ${isOpen
            ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.6)]'
            : 'border-white/30 bg-black/80 hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
          }
        `}
        aria-label="Help"
      >
        <span className={`text-xl transition-all ${isOpen ? 'text-cyan-400 rotate-45' : 'text-white/80'}`}>
          ?
        </span>
      </button>

      {/* Help Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div
            className={`
              absolute ${tooltipPositionClasses[position]}
              w-96 max-w-[calc(100vw-3rem)]
              bg-black border border-cyan-400/60
              rounded shadow-[0_0_30px_rgba(0,240,255,0.4)]
              p-6
              animate-[slideIn_0.2s_ease-out]
            `}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>

            {/* Title */}
            <h3 className="text-lg font-medium text-cyan-400 mb-3 pr-8">
              {content.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              {content.description}
            </p>

            {/* Metrics Explanation */}
            {content.metrics && content.metrics.length > 0 && (
              <div className="space-y-3 mb-4">
                <h4 className="text-xs uppercase tracking-wider text-white/60">Key Metrics</h4>
                {content.metrics.map((metric, i) => (
                  <div key={i} className="border-l-2 border-cyan-400/30 pl-3">
                    <div className="text-sm font-medium text-white mb-1">{metric.name}</div>
                    <div className="text-xs text-white/60 mb-1">{metric.meaning}</div>
                    <div className="text-xs text-white/40 italic">{metric.interpretation}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Documentation Link */}
            {content.docsLink && (
              <Link
                href={content.docsLink}
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  text-sm text-cyan-400
                  border border-cyan-400/30 rounded
                  hover:bg-cyan-500/10 hover:border-cyan-400/60
                  transition-all
                "
                onClick={() => setIsOpen(false)}
              >
                View Full Documentation
                <span className="text-xs">→</span>
              </Link>
            )}

            {/* Quick Shortcuts */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/60 space-y-1">
                <div>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">?</kbd> to toggle help</div>
                <div>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">Space</kbd> to pause/play</div>
                <div>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">1-9</kbd> to navigate</div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Metric Tooltip Component
 *
 * Inline tooltip for individual metrics on dashboards.
 */
interface MetricTooltipProps {
  metric: string
  meaning: string
  interpretation: string
  children: React.ReactNode
}

export function MetricTooltip({ metric, meaning, interpretation, children }: MetricTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64">
          <div className="bg-black border border-cyan-400/60 rounded p-3 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <div className="text-sm font-medium text-cyan-400 mb-1">{metric}</div>
            <div className="text-xs text-white/80 mb-2">{meaning}</div>
            <div className="text-xs text-white/60 italic">{interpretation}</div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 bg-black border-r border-b border-cyan-400/60 rotate-45" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
