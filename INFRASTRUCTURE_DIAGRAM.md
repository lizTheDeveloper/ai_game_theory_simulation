# MARCUS 3.1 Infrastructure Architecture

## Current Deployment (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                     GCP Project                                  │
│               project-6d921a00-c010-437c-990                    │
│                      Region: us-central1                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                ┌───────────────┴───────────────┐
                │                               │
                │                               │
┌───────────────▼────────────────┐    ┌────────▼──────────────┐
│      GKE Cluster               │    │   Testing VM          │
│      marcus-platform           │    │   marcus-test-vm-e2   │
│                                │    │                       │
│  ┌──────────────────────────┐ │    │  Type: e2-standard-16 │
│  │  3 Nodes (Regional)      │ │    │  Zone: us-west1-c     │
│  │                          │ │    │  IP: 34.19.38.132     │
│  │  e2-standard-4 each      │ │    │  Status: RUNNING      │
│  │  4 vCPU, 16 GB RAM       │ │    │                       │
│  │                          │ │    │  Use: Load Testing    │
│  │  Total: 12 vCPU, 48 GB   │ │    └───────────────────────┘
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  Namespace:              │ │
│  │  marcus-platform         │ │
│  └──────────────┬───────────┘ │
│                 │              │
│     ┌───────────┴──────────┐  │
│     │                      │  │
│  ┌──▼─────────┐  ┌────────▼──┐│
│  │ PostgreSQL │  │  Redis    ││
│  │            │  │  Cluster  ││
│  │ Primary:   │  │           ││
│  │  1 replica │  │ 6 nodes   ││
│  │  50 Gi     │  │ 60 Gi     ││
│  │            │  │ (10 Gi ea)││
│  │ Replicas:  │  │           ││
│  │  2 replicas│  │ Cluster   ││
│  │  100 Gi    │  │ Mode: ON  ││
│  │            │  │           ││
│  │ Total:     │  └───────────┘│
│  │  150 Gi    │               │
│  └────────────┘               │
│                                │
│  ┌─────────────────────────┐  │
│  │  Application Tier       │  │
│  │                         │  │
│  │  Citation Agents: 5/5   │  │
│  │  Orchestrator: 3/3      │  │
│  │                         │  │
│  │  Image: v3.0.2          │  │
│  └─────────────────────────┘  │
│                                │
│  ┌─────────────────────────┐  │
│  │  Configuration          │  │
│  │                         │  │
│  │  marcus-config: 27 keys │  │
│  │  marcus-secrets: 8 keys │  │
│  └─────────────────────────┘  │
└────────────────────────────────┘
                │
                │
        ┌───────▼────────┐
        │ Artifact       │
        │ Registry       │
        │                │
        │ 2.6 GB         │
        │ 27 images      │
        └────────────────┘
```

---

## Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│  VPC Network                                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Subnet: default (us-central1)                         │ │
│  │  Range: 10.128.0.0/20                                  │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Node 1       │  │ Node 2       │  │ Node 3      │ │ │
│  │  │ 10.128.0.4   │  │ 10.128.0.3   │  │ 10.128.0.5  │ │ │
│  │  │ zone: -a     │  │ zone: -c     │  │ zone: -f    │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │ │
│  │         │                 │                 │        │ │
│  │  ┌──────▼─────────────────▼─────────────────▼─────┐  │ │
│  │  │        Kubernetes Service Network              │  │ │
│  │  │        ClusterIP Range: 34.118.224.0/20        │  │ │
│  │  │                                                 │  │ │
│  │  │  postgres-primary:      34.118.235.200:5432   │  │ │
│  │  │  postgres-replica:      34.118.236.126:5432   │  │ │
│  │  │  redis:                 34.118.226.74:6379    │  │ │
│  │  │  orchestrator:          34.118.235.222:3000   │  │ │
│  │  │  citation-agent:        34.118.232.195:8000   │  │ │
│  │  │                                                 │  │ │
│  │  │  DNS (internal):                               │  │ │
│  │  │  *.marcus-platform.svc.cluster.local          │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  External IPs (Nodes):                                      │
│    34.121.250.3, 35.192.104.145, 136.114.12.100            │
│                                                              │
│  No Ingress/LoadBalancer (all internal)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Storage Architecture

```
┌────────────────────────────────────────────────────────┐
│  Persistent Storage (GCE Persistent Disks)             │
│  Storage Class: standard-rwo (Regional SSD)            │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  PostgreSQL Storage (150 Gi)                    │  │
│  │                                                 │  │
│  │  Primary:  pvc-f35f6c0f  ──► 50 Gi ──► Bound  │  │
│  │  Replica0: pvc-da40f4b2  ──► 50 Gi ──► Bound  │  │
│  │  Replica1: pvc-c9848fbd  ──► 50 Gi ──► Bound  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Redis Storage (60 Gi)                          │  │
│  │                                                 │  │
│  │  redis-0: pvc-f393e797  ──► 10 Gi ──► Bound   │  │
│  │  redis-1: pvc-0e94802c  ──► 10 Gi ──► Bound   │  │
│  │  redis-2: pvc-d12cabf5  ──► 10 Gi ──► Bound   │  │
│  │  redis-3: pvc-d54c96e2  ──► 10 Gi ──► Bound   │  │
│  │  redis-4: pvc-c4e6cbb3  ──► 10 Gi ──► Bound   │  │
│  │  redis-5: pvc-c68c5a88  ──► 10 Gi ──► Bound   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  Total Allocated: 210 Gi                              │
│  Total Bound: 9/9 (100%)                              │
│  Monthly Cost: ~$36                                   │
└────────────────────────────────────────────────────────┘
```

---

## Application Architecture

```
┌───────────────────────────────────────────────────────────┐
│  MARCUS 3.0 Platform (marcus-platform namespace)          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Orchestrator (Deployment)                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │ Pod 1    │  │ Pod 2    │  │ Pod 3    │         │   │
│  │  │          │  │          │  │          │         │   │
│  │  │ Image:   │  │ Image:   │  │ Image:   │         │   │
│  │  │ v3.0.2   │  │ v3.0.2   │  │ v3.0.2   │         │   │
│  │  │          │  │          │  │          │         │   │
│  │  │ Ports:   │  │ Ports:   │  │ Ports:   │         │   │
│  │  │  3000    │  │  3000    │  │  3000    │         │   │
│  │  │  9090    │  │  9090    │  │  9090    │         │   │
│  │  │ (metrics)│  │ (metrics)│  │ (metrics)│         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  │          │             │             │             │   │
│  │          └─────────────┼─────────────┘             │   │
│  │                        │                           │   │
│  │                  ┌─────▼─────┐                     │   │
│  │                  │  Service  │                     │   │
│  │                  │ ClusterIP │                     │   │
│  │                  └─────┬─────┘                     │   │
│  │                        │                           │   │
│  └────────────────────────┼───────────────────────────┘   │
│                           │                               │
│  ┌────────────────────────▼───────────────────────────┐   │
│  │  Citation Agent Workers (Deployment)               │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───┤   │
│  │  │Agent 1 │ │Agent 2 │ │Agent 3 │ │Agent 4 │ │A 5│   │
│  │  │        │ │        │ │        │ │        │ │   │   │
│  │  │ Python │ │ Python │ │ Python │ │ Python │ │ P │   │
│  │  │ Worker │ │ Worker │ │ Worker │ │ Worker │ │ W │   │
│  │  │        │ │        │ │        │ │        │ │   │   │
│  │  │ Image: │ │ Image: │ │ Image: │ │ Image: │ │ I │   │
│  │  │ v3.0.2 │ │ v3.0.2 │ │ v3.0.2 │ │ v3.0.2 │ │ v │   │
│  │  │        │ │        │ │        │ │        │ │ 3 │   │
│  │  │ Ports: │ │ Ports: │ │ Ports: │ │ Ports: │ │ P │   │
│  │  │  8000  │ │  8000  │ │  8000  │ │  8000  │ │ 8 │   │
│  │  │  9091  │ │  9091  │ │  9091  │ │  9091  │ │ 9 │   │
│  │  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ └─┬─┤   │
│  │       │          │          │          │        │ │   │
│  │       └──────────┼──────────┼──────────┼────────┘ │   │
│  │                  │          │          │          │   │
│  │            ┌─────▼──────────▼──────────▼──────┐   │   │
│  │            │      Service (ClusterIP)        │   │   │
│  │            └─────┬──────────┬──────────┬──────┘   │   │
│  │                  │          │          │          │   │
│  └──────────────────┼──────────┼──────────┼──────────┘   │
│                     │          │          │              │
│  ┌──────────────────▼──┐  ┌────▼──────────▼───┐          │
│  │  PostgreSQL         │  │  Redis Cluster    │          │
│  │                     │  │                   │          │
│  │  Primary:           │  │  6-node cluster   │          │
│  │   marcus_app        │  │  Cluster mode: ON │          │
│  │   citation_integrity│  │                   │          │
│  │                     │  │  Masters: 3       │          │
│  │  Tables:            │  │  Replicas: 3      │          │
│  │   - agent_states    │  │                   │          │
│  │   - citation_*      │  │  Hash slots:      │          │
│  │   - agent_metrics   │  │   0-16383         │          │
│  │   - learning_*      │  │   distributed     │          │
│  │                     │  │                   │          │
│  │  Replicas: 2        │  │  Ports:           │          │
│  │  (read scaling)     │  │   6379 (client)   │          │
│  │                     │  │   16379 (gossip)  │          │
│  └─────────────────────┘  └───────────────────┘          │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌──────────────┐
│   Client     │
│  (External)  │
└──────┬───────┘
       │
       │ (No external access currently)
       │ Use: kubectl port-forward
       │
┌──────▼────────────────────────────────────────────────┐
│  Kubernetes Service Layer                             │
│                                                        │
│  ┌────────────────┐        ┌─────────────────────┐   │
│  │ Orchestrator   │◄──────►│ Citation Agent      │   │
│  │ Service        │        │ Service             │   │
│  │ :3000          │        │ :8000               │   │
│  └────────┬───────┘        └──────────┬──────────┘   │
│           │                           │              │
│           │                           │              │
│  ┌────────▼───────────────────────────▼──────────┐   │
│  │                                                │   │
│  │         Task Queue (Redis)                    │   │
│  │         citations:tasks                       │   │
│  │                                                │   │
│  │   Producer: Orchestrator                      │   │
│  │   Consumer: Citation Agents                   │   │
│  │                                                │   │
│  └────────┬───────────────────────────┬──────────┘   │
│           │                           │              │
│  ┌────────▼─────────┐       ┌────────▼──────────┐   │
│  │  Agent State     │       │  Analysis Results │   │
│  │  (Redis Cache)   │       │  (PostgreSQL)     │   │
│  │                  │       │                   │   │
│  │  TTL: 24h        │       │  Persistent       │   │
│  │  Fast access     │       │  Historical       │   │
│  └──────────────────┘       └───────────────────┘   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Metrics & Observability

```
┌─────────────────────────────────────────────────────────┐
│  Prometheus Metrics Collection                          │
│                                                          │
│  ┌────────────────┐         ┌────────────────┐          │
│  │ Orchestrator   │         │ Citation Agent │          │
│  │                │         │                │          │
│  │ /metrics:9090  │         │ /metrics:9091  │          │
│  │                │         │                │          │
│  │ Exports:       │         │ Exports:       │          │
│  │ - Latency      │         │ - Analysis time│          │
│  │ - Throughput   │         │ - Reputation   │          │
│  │ - Queue depth  │         │ - Violations   │          │
│  │ - Consensus    │         │ - Behavior     │          │
│  └────────┬───────┘         └────────┬───────┘          │
│           │                          │                  │
│           └──────────┬───────────────┘                  │
│                      │                                  │
│         ┌────────────▼──────────────┐                   │
│         │  Prometheus Server        │ (Optional)        │
│         │  (Not currently deployed) │                   │
│         └────────────┬──────────────┘                   │
│                      │                                  │
│         ┌────────────▼──────────────┐                   │
│         │  Grafana                  │ (Optional)        │
│         │  (Not currently deployed) │                   │
│         └───────────────────────────┘                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Distributed Tracing (Jaeger)                  │     │
│  │  Configured but not deployed                   │     │
│  │                                                 │     │
│  │  Config:                                        │     │
│  │    jaeger-agent.marcus-platform.svc.local:6831 │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## High Availability Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Regional GKE Cluster (us-central1)                     │
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    │
│  │  Zone A    │    │  Zone C    │    │  Zone F    │    │
│  │            │    │            │    │            │    │
│  │  Node 1    │    │  Node 2    │    │  Node 3    │    │
│  │            │    │            │    │            │    │
│  │  Pods:     │    │  Pods:     │    │  Pods:     │    │
│  │  - Orch 1  │    │  - Orch 2  │    │  - Orch 3  │    │
│  │  - Agent 1 │    │  - Agent 2 │    │  - Agent 3 │    │
│  │  - Agent 2 │    │  - Agent 3 │    │  - Agent 4 │    │
│  │  - PG Prim │    │  - Redis 0 │    │  - Redis 1 │    │
│  │  - Redis 2 │    │  - Redis 3 │    │  - Redis 4 │    │
│  │            │    │            │    │  - Redis 5 │    │
│  └────────────┘    └────────────┘    └────────────┘    │
│                                                          │
│  Failure Tolerance:                                     │
│   - 1 zone failure: Cluster continues (2/3 nodes)      │
│   - 1 node failure: Pods reschedule automatically      │
│   - Database: 2 replicas provide read scaling          │
│   - Redis: Cluster mode ensures no data loss          │
│   - Orchestrator: 3 replicas for load distribution    │
│   - Agents: 5 workers, can lose up to 4               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Resource Allocation

```
┌─────────────────────────────────────────────────────────┐
│  Cluster Resources: 12 vCPU, 48 GB RAM                  │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Allocated Resources                           │     │
│  │                                                 │     │
│  │  PostgreSQL:                                    │     │
│  │    Requests: 1.5 CPU, 3 GB RAM (3 pods)        │     │
│  │    Limits: 3 CPU, 6 GB RAM                     │     │
│  │                                                 │     │
│  │  Redis:                                         │     │
│  │    Default limits (6 pods)                     │     │
│  │    Estimated: 1.2 CPU, 3 GB RAM                │     │
│  │                                                 │     │
│  │  Citation Agents:                               │     │
│  │    Requests: 0.5 CPU, 1.28 GB RAM (5 pods)     │     │
│  │    Limits: 2.5 CPU, 2.56 GB RAM                │     │
│  │                                                 │     │
│  │  Orchestrator:                                  │     │
│  │    Default limits (3 pods)                     │     │
│  │    Estimated: 0.6 CPU, 1.5 GB RAM              │     │
│  │                                                 │     │
│  │  System Pods:                                   │     │
│  │    (kube-system, gmp-system, etc)              │     │
│  │    Estimated: 2 CPU, 4 GB RAM                  │     │
│  │                                                 │     │
│  │  Total Used: ~7.8 CPU, ~15.8 GB RAM            │     │
│  │  Available: ~4.2 CPU, ~32.2 GB RAM             │     │
│  │                                                 │     │
│  │  Utilization: 65% CPU, 33% RAM                 │     │
│  │  Status: Healthy headroom for v3.1             │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Deployment History

```
Timeline (Last 13 hours):
═══════════════════════════

06:40 UTC - Artifact Registry created
06:42 UTC - Citation agent deployment created (v1)
06:45 UTC - First images pushed to registry
06:48 UTC - ConfigMap and secrets created
06:50 UTC - PostgreSQL StatefulSets deployed
06:51 UTC - Redis Cluster deployed
06:52 UTC - Redis cluster initialization complete
06:54 UTC - Citation agents restarted (config update)
07:13 UTC - Citation agents updated to v3.0.1
07:14 UTC - Citation agents updated to v3.0.2 (current)
07:19 UTC - Orchestrator first update
07:25 UTC - Orchestrator second update
07:37 UTC - Orchestrator third update
07:41 UTC - Orchestrator fourth update
07:46 UTC - Orchestrator final update (current)

Current State:
- citation-agent: v3.0.2 (stable for 12 hours)
- orchestrator: latest (stable for 6 hours)
- Database: 9 agent states initialized
- All pods healthy and ready
```

---

**Infrastructure Verified: 2025-11-22**
**Status: READY FOR MARCUS 3.1**
