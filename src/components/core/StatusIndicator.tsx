/**
 * StatusIndicator Component - Far-Future Design System
 *
 * Color-coded status dot with optional label and pulse animation.
 * Used throughout dashboard for health/alert states.
 *
 * Reference: /designs/00_design_system.md
 */

import * as React from "react"
import { cn } from "@/lib/utils"

type StatusType = 'normal' | 'warning' | 'critical' | 'extinction'

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  pulse?: boolean
  className?: string
}

const statusConfig: Record<StatusType, { color: string; label: string }> = {
  normal: { color: 'var(--color-green)', label: 'Normal' },
  warning: { color: 'var(--color-amber)', label: 'Warning' },
  critical: { color: 'var(--color-orange)', label: 'Critical' },
  extinction: { color: 'var(--color-red)', label: 'Extinction Risk' }
}

export function StatusIndicator({
  status,
  label,
  pulse = status === 'critical' || status === 'extinction',
  className
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const statusClass = `status-${status}`

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("status-indicator", statusClass)} />
      {label && (
        <span
          className="text-xs"
          style={{ color: config.color }}
        >
          {label || config.label}
        </span>
      )}
    </div>
  )
}
