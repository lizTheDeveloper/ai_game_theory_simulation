/**
 * MetricCard Component - Far-Future Design System
 *
 * Displays a single metric with value, label, optional sparkline, and status indicator.
 * Core building block for all dashboard metrics.
 *
 * Reference: /designs/00_design_system.md
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sparkline } from "@/components/charts/Sparkline"
import { StatusIndicator } from "./StatusIndicator"

interface MetricCardProps {
  label: string
  value: number | string
  unit?: string
  sparkline?: number[]
  status?: 'normal' | 'warning' | 'critical' | 'extinction'
  className?: string
  trend?: 'up' | 'down' | 'stable'
  onClick?: () => void
}

export function MetricCard({
  label,
  value,
  unit,
  sparkline,
  status,
  className,
  trend,
  onClick
}: MetricCardProps) {
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value

  return (
    <div
      className={cn("metric-card", className, onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="metric-label">{label}</div>
        {status && <StatusIndicator status={status} />}
      </div>

      <div className="flex items-baseline">
        <span className="metric-value">{formattedValue}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>

      {sparkline && sparkline.length > 0 && (
        <div className="mt-3">
          <Sparkline data={sparkline} />
        </div>
      )}

      {trend && (
        <div className="mt-2 text-xs" style={{ color: 'var(--white-40)' }}>
          {trend === 'up' && '↑ Increasing'}
          {trend === 'down' && '↓ Decreasing'}
          {trend === 'stable' && '→ Stable'}
        </div>
      )}
    </div>
  )
}
