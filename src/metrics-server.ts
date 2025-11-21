/**
 * Standalone Prometheus Metrics Server
 *
 * Runs on port 9091 (separate from Next.js on port 3000)
 * This avoids Next.js build cache issues with API routes
 */

import http from 'http';

// In-memory storage for simulation state
let latestState: any = null;
let lastUpdateTime = 0;
let serverStartTime = Date.now();

// Helper to format Prometheus metrics
function formatMetric(
  name: string,
  value: number,
  help: string,
  type: 'gauge' | 'counter' = 'gauge',
  labels?: Record<string, string>
): string {
  let labelStr = '';
  if (labels && typeof labels === 'object') {
    const entries = Object.entries(labels);
    if (entries && entries.length > 0) {
      labelStr = `{${entries.map(([k, v]) => `${k}="${v}"`).join(',')}}`;
    }
  }
  return `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n${name}${labelStr} ${value}\n`;
}

function generateMetrics(): string {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  let metrics = '';

  // System metrics (always available)
  metrics += formatMetric('simulation_up', 1, 'Simulation API health (1=up, 0=down)', 'gauge');
  metrics += formatMetric('simulation_uptime_seconds', uptime, 'API uptime in seconds', 'counter');
  metrics += formatMetric('simulation_last_update_timestamp', lastUpdateTime, 'Last state update timestamp', 'gauge');

  // Simulation state metrics (only if state exists)
  if (latestState && typeof latestState === 'object') {
    const state = latestState;

    // Current simulation progress
    if (typeof state.currentMonth === 'number') {
      metrics += formatMetric('simulation_current_month', state.currentMonth, 'Current simulation month', 'gauge');
    }

    // Population
    if (state.humanPopulationSystem && typeof state.humanPopulationSystem.population === 'number') {
      metrics += formatMetric(
        'simulation_population_billions',
        state.humanPopulationSystem.population,
        'Global human population in billions',
        'gauge'
      );
    }

    // Quality of Life
    if (state.globalMetrics && typeof state.globalMetrics.averageQoL === 'number') {
      metrics += formatMetric(
        'simulation_average_qol',
        state.globalMetrics.averageQoL,
        'Average global quality of life (0-100)',
        'gauge'
      );
    }

    // AI Agents
    if (Array.isArray(state.aiAgents)) {
      metrics += formatMetric('simulation_ai_agents_count', state.aiAgents.length, 'Number of active AI agents', 'gauge');

      // Average AI capability
      if (state.aiAgents.length > 0) {
        const totalCap = state.aiAgents.reduce((sum: number, agent: any) => {
          const cap = agent?.capabilities?.aggregate || 0;
          return sum + (typeof cap === 'number' ? cap : 0);
        }, 0);
        const avgCap = totalCap / state.aiAgents.length;
        metrics += formatMetric('simulation_ai_avg_capability', avgCap, 'Average AI capability (0-1)', 'gauge');
      }
    }

    // Planetary Boundaries
    if (state.planetaryBoundaries && typeof state.planetaryBoundaries === 'object') {
      for (const [boundary, data] of Object.entries(state.planetaryBoundaries)) {
        if (data && typeof data === 'object' && 'currentValue' in data) {
          const value = (data as any).currentValue;
          if (typeof value === 'number' && !isNaN(value)) {
            metrics += formatMetric(
              'simulation_planetary_boundary',
              value,
              `Planetary boundary: ${boundary}`,
              'gauge',
              { boundary }
            );
          }
        }
      }
    }

    // Tech tree
    if (Array.isArray(state.availableTechs)) {
      const deployed = state.availableTechs.filter((t: any) => t?.deployed).length;
      metrics += formatMetric('simulation_techs_deployed', deployed, 'Deployed breakthrough technologies', 'gauge');
      metrics += formatMetric('simulation_techs_total', state.availableTechs.length, 'Total available technologies', 'gauge');
    }

    // Crises
    if (Array.isArray(state.activeCrises)) {
      metrics += formatMetric('simulation_active_crises', state.activeCrises.length, 'Number of active crises', 'gauge');
    }

    // Paradigms
    if (state.paradigms && typeof state.paradigms === 'object') {
      for (const [paradigm, data] of Object.entries(state.paradigms)) {
        if (data && typeof data === 'object' && 'influence' in data) {
          const influence = (data as any).influence;
          if (typeof influence === 'number' && !isNaN(influence)) {
            metrics += formatMetric(
              'simulation_paradigm_influence',
              influence,
              'Paradigm influence level (0-1)',
              'gauge',
              { paradigm }
            );
          }
        }
      }
    }

    // Outcome classification
    if (typeof state.outcome === 'string') {
      const outcomes = ['extinction', 'collapse', 'decline', 'status_quo', 'improvement', 'transformation', 'utopia'];
      const tier = outcomes.indexOf(state.outcome);
      if (tier >= 0) {
        metrics += formatMetric(
          'simulation_outcome_tier',
          tier,
          'Outcome tier (0=extinction, 6=utopia)',
          'gauge'
        );
      }
    }
  } else {
    // No state available
    metrics += formatMetric('simulation_state_available', 0, 'Whether simulation state is available', 'gauge');
  }

  // Memory usage
  const mem = process.memoryUsage();
  metrics += formatMetric('simulation_memory_heap_used_bytes', mem.heapUsed, 'Node.js heap memory used', 'gauge');
  metrics += formatMetric('simulation_memory_heap_total_bytes', mem.heapTotal, 'Node.js heap memory total', 'gauge');

  return metrics;
}

// HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/metrics' && req.method === 'GET') {
    try {
      const metrics = generateMetrics();

      res.writeHead(200, {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
      res.end(metrics);
    } catch (error) {
      console.error('Error generating metrics:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('# HELP simulation_up Simulation API health\n# TYPE simulation_up gauge\nsimulation_up 0\n');
    }
  } else if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: Math.floor((Date.now() - serverStartTime) / 1000) }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.METRICS_PORT || 9091;

server.listen(PORT, () => {
  console.log(`✅ Prometheus metrics server listening on http://localhost:${PORT}/metrics`);
});

// Export function to update state from simulation worker
export function updateMetricsState(state: any) {
  latestState = state;
  lastUpdateTime = Date.now();
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('📊 Metrics server shutting down...');
  server.close(() => {
    console.log('✅ Metrics server closed');
    process.exit(0);
  });
});
