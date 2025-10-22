/**
 * Panel Component - Far-Future Design System
 *
 * Wrapper around ShadCN Card with Elysium-inspired styling.
 * Used for all major content sections in the dashboard.
 *
 * Reference: /designs/00_design_system.md
 */

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PanelProps {
  title?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  glow?: 'none' | 'cyan' | 'amber' | 'red'
}

export function Panel({
  title,
  children,
  className,
  actions,
  glow = 'none'
}: PanelProps) {
  const glowClass = glow !== 'none' ? `glow-${glow}` : ''

  return (
    <Card className={cn("panel", glowClass, className)}>
      {title && (
        <CardHeader className="panel-header">
          <CardTitle className="panel-title">{title}</CardTitle>
          {actions && <div className="ml-auto">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="panel-content">
        {children}
      </CardContent>
    </Card>
  )
}
