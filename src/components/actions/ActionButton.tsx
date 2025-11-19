/**
 * ActionButton Component
 *
 * Simple button for triggering government actions in the simulation.
 * Shows action name, disables when canExecute() returns false,
 * executes action on click.
 */

'use client'

import { CategorizedGovernmentAction } from '@/simulation/government/core/types'
import { GameState } from '@/types/game'

interface ActionButtonProps {
  action: CategorizedGovernmentAction
  gameState: GameState | null
  onExecute: (action: CategorizedGovernmentAction) => void
  className?: string
}

export function ActionButton({
  action,
  gameState,
  onExecute,
  className = ''
}: ActionButtonProps) {
  // Check if action can be executed
  const canExecute = gameState && action.canExecute(gameState)

  // Determine button styling based on category
  const getCategoryColor = () => {
    switch(action.category) {
      case 'crisis': return 'var(--color-red)'
      case 'safety': return 'var(--color-amber)'
      case 'economic': return 'var(--color-green)'
      case 'environmental': return 'var(--color-cyan)'
      default: return 'var(--color-cyan)'
    }
  }

  const baseColor = getCategoryColor()

  return (
    <button
      disabled={!canExecute}
      onClick={() => canExecute && onExecute(action)}
      className={`
        px-4 py-2 rounded border transition-all duration-300
        ${canExecute
          ? 'border-white/40 text-white hover:border-white/80 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer'
          : 'border-white/10 text-white/30 cursor-not-allowed'
        }
        ${className}
      `}
      style={{
        ...(canExecute && {
          borderColor: baseColor + '60',
          boxShadow: `0 0 10px ${baseColor}20`
        })
      }}
      title={!canExecute ? 'Action requirements not met' : action.description}
    >
      <span className="text-sm font-light">{action.name}</span>
    </button>
  )
}