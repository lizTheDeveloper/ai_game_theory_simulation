/**
 * GovernmentActionsPanel Component
 *
 * Displays available government actions grouped by category.
 * Allows player to trigger actions directly from the dashboard.
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { Panel } from '@/components/core/Panel'
import { ActionButton } from './ActionButton'
import { migratedActions } from '@/simulation/government/actions'
import { CategorizedGovernmentAction } from '@/simulation/government/core/types'
import { useSimulationWorker } from '@/lib/contexts/SimulationWorkerContext'
import { mulberry32 } from '@/simulation/utils/random'

interface ActionGroup {
  category: string
  actions: CategorizedGovernmentAction[]
  color: string
  icon: string
}

export function GovernmentActionsPanel() {
  const { client, lastUpdate } = useSimulationWorker()
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [recentActions, setRecentActions] = useState<string[]>([])

  // Get current game state from worker (reconstruct from delta)
  // Note: This is a simplified state - full state would need worker modification
  const gameState = useMemo(() => {
    if (!lastUpdate) return null

    // Create a minimal game state that satisfies action requirements
    // In a real implementation, you'd get the full state from the worker
    return {
      currentMonth: lastUpdate.currentMonth || 0,
      government: {
        controlDesire: 0.5,
        alignmentResearchInvestment: 0,
        computeGovernance: 'none' as const,
        lastMajorPolicyMonth: -10, // Allow major policies
        majorPoliciesThisYear: 0,
        structuralChoices: {
          ubiVariant: 'none' as const,
          dataPrivacyStance: 'moderate' as const,
          aiRightsStance: 'none' as const
        }
      },
      society: {
        unemploymentLevel: lastUpdate.unemploymentLevel || 0.3,
        socialCohesion: lastUpdate.socialCohesion || 0.5,
        polarization: 0.3,
        institutionalTrust: lastUpdate.institutionalTrust || 0.5,
        totalRelationalWealth: 0.5
      },
      globalMetrics: {
        economicTransitionStage: 2.5,
        wealthDistribution: 0.5
      },
      crisisLevel: {
        nuclear: 0,
        environmental: 0.3,
        social: 0.2,
        economic: 0.3,
        health: 0.1,
        cyber: 0.1
      },
      technologyTree: []
    } as any // Type assertion for simplified state
  }, [lastUpdate])

  // Group actions by category
  const actionGroups = useMemo<ActionGroup[]>(() => {
    const groups = new Map<string, ActionGroup>()

    for (const action of migratedActions) {
      if (!groups.has(action.category)) {
        groups.set(action.category, {
          category: action.category,
          actions: [],
          color: getCategoryColor(action.category),
          icon: getCategoryIcon(action.category)
        })
      }
      groups.get(action.category)!.actions.push(action)
    }

    // Sort groups by priority
    const priority = ['crisis', 'safety', 'economic', 'environmental', 'regulation', 'rights', 'research', 'security', 'international', 'detection']
    return Array.from(groups.values()).sort((a, b) =>
      priority.indexOf(a.category) - priority.indexOf(b.category)
    )
  }, [])

  const handleExecuteAction = useCallback((action: CategorizedGovernmentAction) => {
    if (!client || !gameState) return

    setExecutingAction(action.id)

    // Send government action as a player decision
    client.decision({
      type: 'policy',
      data: {
        actionType: 'government',
        actionId: action.id,
        action: {
          id: action.id,
          name: action.name,
          category: action.category
        }
      }
    })

    // Add to recent actions for visual feedback
    setRecentActions(prev => [action.id, ...prev.slice(0, 4)])

    // Clear executing state after animation
    setTimeout(() => {
      setExecutingAction(null)
    }, 500)

    console.log(`Executing government action: ${action.name}`)
  }, [client, gameState])

  if (!gameState) {
    return null // Don't show panel if simulation not initialized
  }

  return (
    <Panel
      title="Government Actions"
      glow="cyan"
      className="mt-6"
    >
      <div className="space-y-4">
        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <div className="pb-3 border-b border-white/10">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent Actions</div>
            <div className="flex flex-wrap gap-2">
              {recentActions.map(id => {
                const action = migratedActions.find(a => a.id === id)
                if (!action) return null
                return (
                  <span
                    key={id}
                    className="text-xs px-2 py-1 rounded bg-white/5 text-white/60"
                  >
                    {action.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Groups */}
        {actionGroups.map(group => {
          const availableCount = group.actions.filter(a => a.canExecute(gameState)).length

          return (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{group.icon}</span>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  {group.category}
                </span>
                {availableCount > 0 && (
                  <span
                    className="text-xs px-1.5 rounded"
                    style={{
                      backgroundColor: group.color + '20',
                      color: group.color
                    }}
                  >
                    {availableCount} available
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {group.actions.map(action => (
                  <ActionButton
                    key={action.id}
                    action={action}
                    gameState={gameState}
                    onExecute={handleExecuteAction}
                    className={executingAction === action.id ? 'animate-pulse' : ''}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Help Text */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-white/40">
            Actions represent government policy decisions. Disabled actions show requirements not met.
            Each action has energy costs and cooldowns. Use wisely to guide humanity's future.
          </p>
        </div>
      </div>
    </Panel>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    crisis: '#FF0040',
    safety: '#FFB000',
    economic: '#00FF88',
    environmental: '#00F0FF',
    regulation: '#0080FF',
    rights: '#FF00FF',
    research: '#8000FF',
    security: '#FF8000',
    international: '#00FF00',
    detection: '#FFFF00'
  }
  return colors[category] || '#00F0FF'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    crisis: '🚨',
    safety: '🛡️',
    economic: '💰',
    environmental: '🌍',
    regulation: '⚖️',
    rights: '🤝',
    research: '🔬',
    security: '🔒',
    international: '🌐',
    detection: '🔍'
  }
  return icons[category] || '📋'
}