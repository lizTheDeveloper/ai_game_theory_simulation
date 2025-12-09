/**
 * Monte Carlo Results Analysis Page
 *
 * Visualizes N>=10 run outcome distributions from monteCarloOutputs directory.
 * Features:
 * - Outcome distribution visualization (7-tier classification)
 * - Determinism validation (same seed = same results, CV < 0.01%)
 * - Run comparison and divergence analysis
 * - Statistical summaries (mean, median, std dev)
 *
 * Far-future aesthetic: black/white/glowing design language.
 */

'use client'

import { useState, useEffect } from 'react'
import { MonteCarloResultsAnalysisDashboard } from '@/components/dashboards/MonteCarloResultsAnalysisDashboard'
import type { AggregatedResults } from '@/app/api/monte-carlo-results/route'

interface ApiResponse {
  data?: AggregatedResults
  error?: string
  message?: string
  filesProcessed?: number
  directory?: string
}

export default function MonteCarloResultsPage() {
  const [results, setResults] = useState<AggregatedResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<{ filesProcessed?: number; directory?: string }>({})

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/monte-carlo-results')
        const result: ApiResponse = await response.json()

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to fetch results')
        }

        if (result.data) {
          setResults(result.data)
          setMetadata({
            filesProcessed: result.filesProcessed,
            directory: result.directory
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/monte-carlo-results')
      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch results')
      }

      if (result.data) {
        setResults(result.data)
        setMetadata({
          filesProcessed: result.filesProcessed,
          directory: result.directory
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-black">
      <MonteCarloResultsAnalysisDashboard
        data={results}
        loading={loading}
        error={error}
        metadata={metadata}
        onRefresh={handleRefresh}
      />
    </main>
  )
}
