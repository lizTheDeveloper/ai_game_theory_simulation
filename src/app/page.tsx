/**
 * Dashboard Page
 *
 * Main simulation dashboard with overview.
 */

import { OverviewDashboard } from "@/components/dashboards/OverviewDashboard"

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <OverviewDashboard />
    </main>
  )
}
