/**
 * Standalone Prometheus Metrics Server
 *
 * Runs on port 9091 (separate from Next.js on port 3000)
 * This avoids Next.js build cache issues with API routes
 */

import * as http from 'http';

// Set descriptive process title for monitoring
process.title = 'game-sim-metrics-server';

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

    // === DASHBOARD 1: OVERVIEW ===

    // Current simulation progress
    if (typeof state.currentMonth === 'number') {
      metrics += formatMetric('simulation_current_month', state.currentMonth, 'Current simulation month', 'gauge');
    }

    // Simulation phase (derive from month ranges)
    if (typeof state.currentMonth === 'number') {
      let phase = 0; // 0=alignment, 1=transition, 2=stabilization, 3=transformation
      if (state.currentMonth >= 240) phase = 3;
      else if (state.currentMonth >= 120) phase = 2;
      else if (state.currentMonth >= 60) phase = 1;
      metrics += formatMetric('simulation_phase', phase, 'Current phase (0=alignment, 1=transition, 2=stabilization, 3=transformation)', 'gauge');
    }

    // Outcome tier
    if (typeof state.outcome === 'string') {
      const outcomes = ['extinction', 'collapse', 'decline', 'status_quo', 'improvement', 'transformation', 'utopia'];
      const tier = outcomes.indexOf(state.outcome);
      if (tier >= 0) {
        metrics += formatMetric('simulation_outcome_tier', tier, 'Outcome tier (0=extinction, 6=utopia)', 'gauge');
      }
    }

    // Overall Quality of Life (normalized to 0-1)
    if (state.globalMetrics && typeof state.globalMetrics.averageQoL === 'number') {
      const qolNormalized = state.globalMetrics.averageQoL / 100;
      metrics += formatMetric('simulation_qol_overall', qolNormalized, 'Overall quality of life (0-1)', 'gauge');
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

    // AI Agents count
    if (Array.isArray(state.aiAgents)) {
      metrics += formatMetric('simulation_ai_agents_count', state.aiAgents.length, 'Number of active AI agents', 'gauge');
    }

    // Tech tree deployed count
    if (Array.isArray(state.availableTechs)) {
      const deployed = state.availableTechs.filter((t: any) => t?.deployed).length;
      metrics += formatMetric('simulation_techs_deployed', deployed, 'Deployed breakthrough technologies', 'gauge');
    }

    // Active crises
    if (Array.isArray(state.activeCrises)) {
      metrics += formatMetric('simulation_active_crises', state.activeCrises.length, 'Number of active crises', 'gauge');
    }

    // === DASHBOARD 2: PARADIGMS ===

    if (state.paradigms && typeof state.paradigms === 'object') {
      for (const [paradigm, data] of Object.entries(state.paradigms)) {
        if (data && typeof data === 'object' && 'influence' in data) {
          const influence = (data as any).influence;
          if (typeof influence === 'number' && !isNaN(influence)) {
            metrics += formatMetric(
              'paradigm_influence',
              influence,
              'Paradigm influence level (0-1)',
              'gauge',
              { paradigm }
            );
          }
        }
      }
    }

    // Paradigm transition velocity (simplified: max influence change, would need history for accurate calculation)
    // For now, we'll just track current max influence as a proxy
    if (state.paradigms && typeof state.paradigms === 'object') {
      let maxInfluence = 0;
      for (const [, data] of Object.entries(state.paradigms)) {
        if (data && typeof data === 'object' && 'influence' in data) {
          const influence = (data as any).influence;
          if (typeof influence === 'number' && !isNaN(influence) && influence > maxInfluence) {
            maxInfluence = influence;
          }
        }
      }
      metrics += formatMetric('paradigm_transition_velocity', maxInfluence, 'Rate of paradigm shift (simplified as max influence)', 'gauge');
    }

    // === DASHBOARD 3: AI AGENTS ===

    // 17 AI capability dimensions (per agent and averaged)
    if (Array.isArray(state.aiAgents) && state.aiAgents.length > 0) {
      const dimensions = [
        'physical', 'digital', 'cognitive', 'social', 'economic', 'research',
        'governance', 'education', 'health', 'energy', 'transportation',
        'manufacturing', 'agriculture', 'communication', 'military',
        'environmental', 'space'
      ];

      // Aggregate capabilities across all agents
      const dimSums: Record<string, number> = {};
      const dimCounts: Record<string, number> = {};

      for (const agent of state.aiAgents) {
        if (agent?.capabilities?.dimensions && typeof agent.capabilities.dimensions === 'object') {
          for (const dim of dimensions) {
            const value = (agent.capabilities.dimensions as any)[dim];
            if (typeof value === 'number' && !isNaN(value)) {
              dimSums[dim] = (dimSums[dim] || 0) + value;
              dimCounts[dim] = (dimCounts[dim] || 0) + 1;
            }
          }
        }
      }

      // Average capabilities per dimension
      for (const dim of dimensions) {
        if (dimCounts[dim] && dimCounts[dim] > 0) {
          const avgValue = dimSums[dim] / dimCounts[dim];
          metrics += formatMetric(
            'ai_capability',
            avgValue,
            `AI capability in ${dim} dimension (0-1)`,
            'gauge',
            { dimension: dim }
          );
        }
      }

      // Overall average capability
      const totalSum = Object.values(dimSums).reduce((a, b) => a + b, 0);
      const totalCount = Object.values(dimCounts).reduce((a, b) => a + b, 0);
      if (totalCount > 0) {
        metrics += formatMetric('ai_avg_capability', totalSum / totalCount, 'Average AI capability across all dimensions (0-1)', 'gauge');
      }

      // Per-agent detection metrics
      for (const agent of state.aiAgents) {
        if (agent && typeof agent.id === 'string') {
          const agentId = agent.id;

          // Sandbagging detection
          if (typeof agent.sandbaggingDetected === 'boolean') {
            metrics += formatMetric(
              'ai_sandbagging_detected',
              agent.sandbaggingDetected ? 1 : 0,
              'Sandbagging detected (0=no, 1=yes)',
              'gauge',
              { agent: agentId }
            );
          }

          // Strategic gaming
          if (typeof agent.strategicGaming === 'boolean') {
            metrics += formatMetric(
              'ai_strategic_gaming',
              agent.strategicGaming ? 1 : 0,
              'Gaming behavior detected (0=no, 1=yes)',
              'gauge',
              { agent: agentId }
            );
          }
        }
      }
    }

    // === DASHBOARD 4: CRISES ===

    // Crisis active count (already done above)

    // Crisis severity by type
    if (Array.isArray(state.activeCrises)) {
      const crisisTypes = ['climate', 'nuclear', 'pandemic', 'economic', 'social', 'technological', 'environmental', 'geopolitical', 'existential', 'other'];

      for (const type of crisisTypes) {
        const crisis = state.activeCrises.find((c: any) => c?.type === type);
        if (crisis && typeof crisis.severity === 'number' && !isNaN(crisis.severity)) {
          metrics += formatMetric(
            'crisis_severity',
            crisis.severity,
            `${type} crisis severity (0-1)`,
            'gauge',
            { type }
          );
        }
      }

      // Cascade depth (simplified: max chain length)
      let maxDepth = 0;
      for (const crisis of state.activeCrises) {
        if (crisis && typeof crisis.cascadeDepth === 'number' && crisis.cascadeDepth > maxDepth) {
          maxDepth = crisis.cascadeDepth;
        }
      }
      metrics += formatMetric('crisis_cascade_depth', maxDepth, 'Maximum crisis cascade depth', 'gauge');

      // Cascade count (crises triggered by other crises)
      const cascadeCount = state.activeCrises.filter((c: any) => c?.triggeredBy || c?.cascadeDepth > 0).length;
      metrics += formatMetric('crisis_cascade_count', cascadeCount, 'Number of cascading crises', 'gauge');
    }

    // === DASHBOARD 5: ENVIRONMENT ===

    // Planetary boundaries (already done above, but rename for consistency)
    if (state.planetaryBoundariesSystem && typeof state.planetaryBoundariesSystem === 'object') {
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      if (boundaries && typeof boundaries === 'object') {
        for (const [boundary, data] of Object.entries(boundaries)) {
          if (data && typeof data === 'object' && 'currentValue' in data) {
            const value = (data as any).currentValue;
            if (typeof value === 'number' && !isNaN(value)) {
              metrics += formatMetric(
                'planetary_boundary',
                value,
                `Planetary boundary: ${boundary} (0-1, 1=safe)`,
                'gauge',
                { boundary }
              );
            }
          }
        }
      }
    }

    // Global temperature delta
    if (state.globalMetrics && typeof state.globalMetrics.temperatureDelta === 'number') {
      metrics += formatMetric(
        'global_temperature_delta',
        state.globalMetrics.temperatureDelta,
        'Temperature change from pre-industrial (°C)',
        'gauge'
      );
    }

    // Ocean pH level
    if (state.oceanAcidificationSystem && typeof state.oceanAcidificationSystem.pH === 'number') {
      metrics += formatMetric(
        'ocean_ph_level',
        state.oceanAcidificationSystem.pH,
        'Ocean pH level',
        'gauge'
      );
    }

    // === DASHBOARD 6: TECH TREE ===

    // Individual tech deployment status
    if (Array.isArray(state.availableTechs)) {
      for (const tech of state.availableTechs) {
        if (tech && typeof tech.id === 'string' && typeof tech.tier === 'number') {
          const deployed = tech.deployed ? 1 : 0;
          metrics += formatMetric(
            'tech_deployed',
            deployed,
            `Tech deployment status (0=not deployed, 1=deployed)`,
            'gauge',
            { tier: tech.tier.toString(), name: tech.id }
          );
        }
      }

      // Tier completion percentage
      const tierCounts: Record<number, { total: number; deployed: number }> = {};
      for (const tech of state.availableTechs) {
        if (tech && typeof tech.tier === 'number') {
          if (!tierCounts[tech.tier]) {
            tierCounts[tech.tier] = { total: 0, deployed: 0 };
          }
          tierCounts[tech.tier].total++;
          if (tech.deployed) {
            tierCounts[tech.tier].deployed++;
          }
        }
      }

      for (const [tier, counts] of Object.entries(tierCounts)) {
        const completion = counts.total > 0 ? counts.deployed / counts.total : 0;
        metrics += formatMetric(
          'tech_tier_completion',
          completion,
          `Percentage of tier completed (0-1)`,
          'gauge',
          { tier }
        );
      }

      // Tech dependency satisfaction (simplified: check if tech has prerequisites field)
      for (const tech of state.availableTechs) {
        if (tech && typeof tech.id === 'string' && Array.isArray(tech.prerequisites)) {
          const allPrereqsMet = tech.prerequisites.every((prereqId: string) => {
            const prereq = state.availableTechs.find((t: any) => t?.id === prereqId);
            return prereq && prereq.deployed;
          });
          metrics += formatMetric(
            'tech_dependency_satisfied',
            allPrereqsMet ? 1 : 0,
            'Dependencies met (0=no, 1=yes)',
            'gauge',
            { tech: tech.id }
          );
        }
      }
    }

    // === DASHBOARD 7: DETECTION (Adversarial AI Evaluation) ===

    if (Array.isArray(state.aiAgents)) {
      for (const agent of state.aiAgents) {
        if (agent && typeof agent.id === 'string') {
          const agentId = agent.id;

          // Adversarial eval score
          if (typeof agent.adversarialEvalScore === 'number' && !isNaN(agent.adversarialEvalScore)) {
            metrics += formatMetric(
              'adversarial_eval_score',
              agent.adversarialEvalScore,
              'Adversarial evaluation score (0-1)',
              'gauge',
              { agent: agentId }
            );
          }

          // Gaming detected
          if (typeof agent.gamingDetected === 'boolean') {
            metrics += formatMetric(
              'gaming_detected',
              agent.gamingDetected ? 1 : 0,
              'Gaming behavior detected (0=no, 1=yes)',
              'gauge',
              { agent: agentId }
            );
          }

          // Alignment fidelity
          if (typeof agent.alignmentFidelity === 'number' && !isNaN(agent.alignmentFidelity)) {
            metrics += formatMetric(
              'alignment_fidelity',
              agent.alignmentFidelity,
              'Alignment fidelity score (0-1)',
              'gauge',
              { agent: agentId }
            );
          }

          // Capability gap (true - revealed)
          if (typeof agent.trueCapability === 'number' && typeof agent.revealedCapability === 'number') {
            const gap = agent.trueCapability - agent.revealedCapability;
            if (!isNaN(gap)) {
              metrics += formatMetric(
                'capability_gap',
                gap,
                'True capability - revealed capability',
                'gauge',
                { agent: agentId }
              );
            }
          }
        }
      }
    }

    // === DASHBOARD 8: REGIONS ===

    if (state.regions && typeof state.regions === 'object') {
      for (const [region, data] of Object.entries(state.regions)) {
        if (data && typeof data === 'object') {
          const regionData = data as any;

          // Regional cooperation
          if (typeof regionData.cooperation === 'number' && !isNaN(regionData.cooperation)) {
            metrics += formatMetric(
              'region_cooperation',
              regionData.cooperation,
              'Regional cooperation level (0-1)',
              'gauge',
              { region }
            );
          }

          // Regional QoL
          if (typeof regionData.qol === 'number' && !isNaN(regionData.qol)) {
            metrics += formatMetric(
              'region_qol',
              regionData.qol,
              'Regional quality of life (0-1)',
              'gauge',
              { region }
            );
          }

          // Tech access
          if (typeof regionData.techAccess === 'number' && !isNaN(regionData.techAccess)) {
            metrics += formatMetric(
              'region_tech_access',
              regionData.techAccess,
              'Technology access level (0-1)',
              'gauge',
              { region }
            );
          }
        }
      }
    }

    // === DASHBOARD 9: TIMELINE (Events) ===

    if (Array.isArray(state.eventLog)) {
      // Total events
      metrics += formatMetric('events_total', state.eventLog.length, 'Total events logged', 'counter');

      // Critical decisions count
      const criticalCount = state.eventLog.filter((e: any) => e?.critical === true).length;
      metrics += formatMetric('critical_decisions_count', criticalCount, 'Number of critical decision points', 'counter');

      // Branching points count
      const branchingCount = state.eventLog.filter((e: any) => e?.branching === true).length;
      metrics += formatMetric('branching_points_count', branchingCount, 'Significant bifurcations', 'counter');

      // Events by type
      const eventTypes = ['breakthrough', 'crisis', 'tech', 'policy', 'social', 'environmental', 'conflict', 'cooperation'];
      for (const type of eventTypes) {
        const count = state.eventLog.filter((e: any) => e?.type === type).length;
        if (count > 0) {
          metrics += formatMetric(
            'events_by_type',
            count,
            `Events by type`,
            'counter',
            { type }
          );
        }
      }
    }

    // === DASHBOARD 10: REAL-TIME ===

    // Simulation speed (simplified: would need timing data for accurate calculation)
    // For now, just report 0 as we don't track tick timing
    metrics += formatMetric('simulation_speed', 0, 'Simulation ticks per second (not implemented)', 'gauge');

    // State update latency (time since last update)
    if (lastUpdateTime > 0) {
      const latency = Date.now() - lastUpdateTime;
      metrics += formatMetric('state_update_latency_ms', latency, 'State update delay (ms)', 'gauge');
    }

    // WebSocket connections (not implemented, report 0)
    metrics += formatMetric('websocket_connections', 0, 'Active WebSocket connections (not implemented)', 'gauge');

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
