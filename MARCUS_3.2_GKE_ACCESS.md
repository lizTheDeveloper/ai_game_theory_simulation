# MARCUS 3.2 GKE Access Guide

**Quick reference for accessing MARCUS 3.2 services running on GKE from your local machine.**

---

## Port Mapping Strategy (Option B)

**Problem:** GKE services use ports that conflict with local services.

**Solution:** Port-forward with different local ports.

---

## Local Port Usage (DO NOT USE)

These ports are already occupied by local services:

```
Port 4000: Game Simulation Dashboard (Next.js research tool)
Port 5000: Grafana Dashboards (local MARCUS monitoring)
Port 9090: Prometheus (local metrics backend)
Port 9091: Game Sim Metrics Server
```

---

## GKE Port Mappings

Use these port-forward commands to access GKE services:

### 1. GraphQL API
**GKE Internal:** Port 4000
**Local Access:** Port 4001

```bash
# Forward GraphQL endpoint
kubectl port-forward -n marcus-platform svc/orchestrator 4001:4000

# Access GraphQL Playground
open http://localhost:4001/graphql

# Example query
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ platformStatus { status totalAgents healthyAgents } }"}'
```

### 2. Prometheus Metrics
**GKE Internal:** Port 9090
**Local Access:** Port 9095

```bash
# Forward Prometheus
kubectl port-forward -n marcus-platform svc/prometheus 9095:9090

# Access Prometheus UI
open http://localhost:9095

# Query example
curl http://localhost:9095/api/v1/query?query=up
```

### 3. Orchestrator Main API
**GKE Internal:** Port 3000
**Local Access:** Port 3000 (no conflict)

```bash
# Forward main API
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000

# Health check
curl http://localhost:3000/api/health
```

### 4. Jaeger UI (Distributed Tracing)
**GKE External IP:** http://34.123.164.214
**No port-forward needed** - accessible directly via LoadBalancer

```bash
# Access Jaeger UI
open http://34.123.164.214

# View traces for recent requests
# Search by service: marcus-platform
```

---

## Quick Start: Access All GKE Services

Run all port-forwards in separate terminals:

```bash
# Terminal 1: GraphQL
kubectl port-forward -n marcus-platform svc/orchestrator 4001:4000

# Terminal 2: Prometheus
kubectl port-forward -n marcus-platform svc/prometheus 9095:9090

# Terminal 3: Main API
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000
```

Then access:
- **GraphQL Playground:** http://localhost:4001/graphql
- **Prometheus:** http://localhost:9095
- **Main API:** http://localhost:3000
- **Jaeger UI:** http://34.123.164.214

---

## Port Reference Table

| Service | Local System | GKE Internal | Local Access (Port-Forward) |
|---------|-------------|--------------|----------------------------|
| Game Simulation Dashboard | 4000 | N/A | http://localhost:4000 |
| Grafana (local monitoring) | 5000 | N/A | http://localhost:5000 |
| Prometheus (local) | 9090 | N/A | http://localhost:9090 |
| Game Sim Metrics | 9091 | N/A | http://localhost:9091/metrics |
| **MARCUS Orchestrator API** | **3000*** | **3000** | **http://localhost:3000** |
| **MARCUS GraphQL** | **4001*** | **4000** | **http://localhost:4001/graphql** |
| **MARCUS Prometheus** | **9095*** | **9090** | **http://localhost:9095** |
| **Jaeger UI** | N/A | 16686 | **http://34.123.164.214** |

*Port-forward required

---

## Common GraphQL Queries

### Get Platform Status
```graphql
query {
  platformStatus {
    status
    totalAgents
    healthyAgents
    degradedAgents
    uptime
    version
  }
}
```

### List All Agents
```graphql
query {
  agents(limit: 10) {
    id
    status {
      reputation
      totalCitations
      isHealthy
    }
    metrics {
      avgIntegrityScore
      avgLatency
    }
  }
}
```

### Analyze Citation (Mutation)
```graphql
mutation {
  analyzeCitation(input: {
    text: "According to Smith et al. (2024), AI alignment is critical."
    claimedSource: "Smith et al. 2024"
  }) {
    integrityScore
    consensus
    recommendations
    latencyMs
  }
}
```

---

## Troubleshooting

### "Port already in use"
If you see `bind: address already in use`:

1. Check what's using the port:
   ```bash
   lsof -i :4001  # Replace with your port
   ```

2. Kill the process if safe:
   ```bash
   kill -9 <PID>
   ```

3. Or use a different local port:
   ```bash
   kubectl port-forward svc/orchestrator 4002:4000
   ```

### "Unable to connect to cluster"
Verify cluster authentication:

```bash
# Get credentials
gcloud container clusters get-credentials marcus-platform --region=us-central1

# Verify connection
kubectl get pods -n marcus-platform
```

### "Service not found"
Check service exists:

```bash
kubectl get svc -n marcus-platform
```

---

## Version Information

**MARCUS Version:** 3.2
**Docker Images:** v3.2.0
**Deployment Date:** 2025-11-22
**GKE Cluster:** marcus-platform (us-central1)
**Project:** project-6d921a00-c010-437c-990

---

## See Also

- **Port Mapping Reference:** `docs/PORT_MAPPING.md`
- **Port Separation Guide:** `docs/PORT_SEPARATION.md`
- **Architecture Diagrams:** `docs/MARCUS_ARCHITECTURE_DIAGRAMS.md`
- **GraphQL Schema:** `src/platform/graphql/schema.graphql`
- **L4 Implementation Guide:** `docs/L4_GRAPHQL_API_GUIDE.md`

---

**Last Updated:** 2025-11-22
**Maintained By:** Platform Team
