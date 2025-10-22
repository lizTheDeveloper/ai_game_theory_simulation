/**
 * Dashboard Layout
 *
 * Wraps all dashboard pages with navigation.
 */

import { Navigation } from "@/components/core/Navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Navigation />
      <div className="ml-64 flex-1">
        {children}
      </div>
    </div>
  )
}
