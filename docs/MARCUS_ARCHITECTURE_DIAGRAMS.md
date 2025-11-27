# MARCUS 3.0 Architecture Diagrams

This document provides comprehensive architecture diagrams for the MARCUS 3.0 citation integrity platform. All diagrams use Mermaid syntax for easy rendering in GitHub and documentation tools.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Citation Analysis Flow](#citation-analysis-flow)
4. [Agent Orchestration Data Flow](#agent-orchestration-data-flow)
5. [Kubernetes Deployment Topology](#kubernetes-deployment-topology)
6. [Database Schema](#database-schema)
7. [Metrics Pipeline](#metrics-pipeline)

---

## System Architecture Overview

High-level system architecture showing all major components and their interactions.

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        API_Client[API Client]
    end

    subgraph "Load Balancing"
        LB[Load Balancer / Ingress]
    end

    subgraph "Application Layer"
        API1[API Server 1<br/>Node.js/TypeScript]
        API2[API Server 2<br/>Node.js/TypeScript]
        API3[API Server 3<br/>Node.js/TypeScript]
    end

    subgraph "Agent Layer"
        Agent_Pool[Agent Process Pool<br/>Python 3.10+]
        subgraph "Agent Types"
            CA[Citation Analyzer]
            CC[Consensus Coordinator]
            NL[Nested Learning Agent]
        end
    end

    subgraph "Cache Layer"
        Redis[(Redis 7+<br/>Cache & Queues)]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL 15+<br/>Primary Database)]
        S3[Object Storage<br/>S3/GCS]
    end

    subgraph "Monitoring"
        Prometheus[Prometheus<br/>Metrics]
        Grafana[Grafana<br/>Dashboards]
        Logs[Centralized Logs<br/>ELK/Loki]
    end

    Web --> LB
    API_Client --> LB
    LB --> API1
    LB --> API2
    LB --> API3

    API1 --> Redis
    API2 --> Redis
    API3 --> Redis

    API1 --> PostgreSQL
    API2 --> PostgreSQL
    API3 --> PostgreSQL

    API1 -.->|spawn/orchestrate| Agent_Pool
    API2 -.->|spawn/orchestrate| Agent_Pool
    API3 -.->|spawn/orchestrate| Agent_Pool

    Agent_Pool --> CA
    Agent_Pool --> CC
    Agent_Pool --> NL

    CA --> PostgreSQL
    CC --> PostgreSQL
    NL --> PostgreSQL

    CA --> Redis
    CC --> Redis
    NL --> Redis

    API1 --> S3
    Agent_Pool --> S3

    API1 -.->|metrics| Prometheus
    API2 -.->|metrics| Prometheus
    API3 -.->|metrics| Prometheus
    Agent_Pool -.->|metrics| Prometheus

    Prometheus --> Grafana

    API1 -.->|logs| Logs
    Agent_Pool -.->|logs| Logs

    style Web fill:#e1f5ff
    style API_Client fill:#e1f5ff
    style LB fill:#fff4e1
    style Redis fill:#ffe1e1
    style PostgreSQL fill:#e1ffe1
    style Prometheus fill:#f0e1ff
    style Grafana fill:#f0e1ff
```

**Key Components:**

- **Client Layer:** Web browsers and API clients
- **Load Balancer:** Distributes traffic across API servers (Nginx, AWS ALB, GCP Load Balancer)
- **API Servers:** Node.js/TypeScript application servers (3+ replicas for HA)
- **Agent Pool:** Python-based citation analysis agents (spawned on-demand)
- **Cache Layer:** Redis for session storage, rate limiting, job queues
- **Data Layer:** PostgreSQL for persistent storage, S3/GCS for artifacts
- **Monitoring:** Prometheus metrics, Grafana dashboards, centralized logging

---

## Authentication Flow

Detailed sequence diagram showing user authentication with JWT tokens and session management.

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant LB as Load Balancer
    participant API as API Server
    participant Redis
    participant DB as PostgreSQL
    participant Email as Email Service

    Note over Client,Email: User Registration Flow

    Client->>LB: POST /api/auth/register
    LB->>API: Forward request
    API->>API: Validate input<br/>(email, password strength)
    API->>DB: Check if user exists
    DB-->>API: User not found
    API->>API: Hash password (bcrypt, cost=12)
    API->>DB: INSERT INTO users
    DB-->>API: User created (ID: 123)
    API->>API: Generate verification token
    API->>DB: INSERT INTO verification_tokens
    API->>Email: Send verification email
    Email-->>Client: Verification email sent
    API-->>Client: 201 Created {userId, message}

    Note over Client,Email: Email Verification Flow

    Client->>LB: GET /api/auth/verify/:token
    LB->>API: Forward request
    API->>DB: SELECT * FROM verification_tokens<br/>WHERE token = :token
    DB-->>API: Token found, user_id: 123
    API->>DB: UPDATE users SET verified = true
    API->>DB: DELETE FROM verification_tokens
    API-->>Client: 200 OK {verified: true}

    Note over Client,Email: Login Flow

    Client->>LB: POST /api/auth/login<br/>{email, password}
    LB->>API: Forward request
    API->>DB: SELECT * FROM users WHERE email = :email
    DB-->>API: User found (id: 123, password_hash)
    API->>API: Compare password<br/>(bcrypt.compare)

    alt Password invalid
        API-->>Client: 401 Unauthorized
    end

    API->>API: Check if verified

    alt Not verified
        API-->>Client: 403 Forbidden<br/>(verify email first)
    end

    API->>Redis: Increment login_attempts:<br/>user:123
    Redis-->>API: Attempts: 1

    API->>API: Generate JWT tokens<br/>(access + refresh)
    API->>Redis: SET session:uuid<br/>{userId, refreshToken}<br/>EX 604800
    API->>DB: UPDATE users SET last_login = NOW()
    API->>DB: INSERT INTO audit_log<br/>(LOGIN_SUCCESS)
    API-->>Client: 200 OK<br/>{accessToken, refreshToken}

    Note over Client,Email: Authenticated Request Flow

    Client->>LB: GET /api/citations<br/>Authorization: Bearer {accessToken}
    LB->>API: Forward request
    API->>API: Verify JWT signature

    alt Token expired or invalid
        API-->>Client: 401 Unauthorized
    end

    API->>API: Extract userId from token
    API->>Redis: GET session:uuid
    Redis-->>API: Session found
    API->>DB: SELECT protected resource
    DB-->>API: Resource data
    API-->>Client: 200 OK {data}

    Note over Client,Email: Token Refresh Flow

    Client->>LB: POST /api/auth/refresh<br/>{refreshToken}
    LB->>API: Forward request
    API->>Redis: GET session:uuid
    Redis-->>API: Session found {userId: 123}
    API->>API: Verify refresh token
    API->>API: Generate new access token
    API-->>Client: 200 OK {accessToken}

    Note over Client,Email: Logout Flow

    Client->>LB: POST /api/auth/logout<br/>{refreshToken}
    LB->>API: Forward request
    API->>Redis: DEL session:uuid
    API->>DB: INSERT INTO audit_log<br/>(LOGOUT)
    API-->>Client: 200 OK

    Note over Client,Email: Password Reset Flow

    Client->>LB: POST /api/auth/forgot-password<br/>{email}
    LB->>API: Forward request
    API->>DB: SELECT * FROM users WHERE email = :email
    DB-->>API: User found (id: 123)
    API->>API: Generate reset token<br/>(crypto.randomBytes)
    API->>DB: INSERT INTO password_reset_tokens<br/>(user_id, token, expires_at)
    API->>Email: Send reset email<br/>(link with token)
    Email-->>Client: Reset email sent
    API-->>Client: 200 OK

    Client->>LB: POST /api/auth/reset-password<br/>{token, newPassword}
    LB->>API: Forward request
    API->>DB: SELECT * FROM password_reset_tokens<br/>WHERE token = :token
    DB-->>API: Token valid, user_id: 123
    API->>API: Check expiration<br/>(expires_at > NOW())
    API->>API: Hash new password
    API->>DB: UPDATE users SET password_hash
    API->>DB: DELETE FROM password_reset_tokens
    API->>Redis: DEL all sessions for user:123
    API->>DB: INSERT INTO audit_log<br/>(PASSWORD_RESET)
    API-->>Client: 200 OK
```

**Security Features:**

- **Password Hashing:** bcrypt with cost factor 12
- **JWT Tokens:** Access token (15 min expiry) + Refresh token (7 days)
- **Session Management:** Redis-backed sessions with automatic expiration
- **Rate Limiting:** Login attempt tracking per user
- **Audit Logging:** All authentication events logged to PostgreSQL
- **Email Verification:** Required before account activation
- **Password Reset:** Time-limited tokens with single-use enforcement

---

## Citation Analysis Flow

Sequence diagram showing the complete citation analysis workflow with multi-agent coordination.

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant API as API Server
    participant Queue as Redis Queue
    participant Orchestrator as Orchestrator Agent
    participant CA1 as Citation Analyzer 1
    participant CA2 as Citation Analyzer 2
    participant CC as Consensus Coordinator
    participant NL as Nested Learning Agent
    participant DB as PostgreSQL
    participant S3 as Object Storage

    Note over Client,S3: Citation Analysis Request

    Client->>API: POST /api/citations/analyze<br/>{paperId, fullText}
    API->>API: Validate request<br/>(auth, rate limit)
    API->>DB: INSERT INTO citation_jobs<br/>(status: PENDING)
    DB-->>API: Job created (ID: 456)
    API->>Queue: RPUSH jobs:citation<br/>{jobId: 456, paperId, text}
    API-->>Client: 202 Accepted<br/>{jobId: 456, status: PENDING}

    Note over Client,S3: Background Processing

    Orchestrator->>Queue: BLPOP jobs:citation
    Queue-->>Orchestrator: Job {jobId: 456}
    Orchestrator->>DB: UPDATE citation_jobs<br/>SET status = PROCESSING
    Orchestrator->>DB: SELECT paper metadata
    DB-->>Orchestrator: Paper data

    Orchestrator->>S3: PUT /papers/456/fulltext.txt
    S3-->>Orchestrator: Stored

    Note over Orchestrator,NL: Multi-Agent Analysis Phase

    par Parallel Citation Extraction
        Orchestrator->>CA1: analyze_citations(paperId: 456)<br/>method: regex_extraction
        Orchestrator->>CA2: analyze_citations(paperId: 456)<br/>method: ml_extraction
    end

    CA1->>S3: GET /papers/456/fulltext.txt
    S3-->>CA1: Full text
    CA1->>CA1: Extract citations<br/>(regex patterns)
    CA1->>DB: INSERT INTO citations_raw<br/>(agent: CA1, count: 47)
    CA1-->>Orchestrator: Result {citations: 47, confidence: 0.85}

    CA2->>S3: GET /papers/456/fulltext.txt
    S3-->>CA2: Full text
    CA2->>CA2: Extract citations<br/>(ML model)
    CA2->>DB: INSERT INTO citations_raw<br/>(agent: CA2, count: 52)
    CA2-->>Orchestrator: Result {citations: 52, confidence: 0.92}

    Note over Orchestrator,NL: Consensus & Validation Phase

    Orchestrator->>CC: build_consensus(job: 456)
    CC->>DB: SELECT * FROM citations_raw<br/>WHERE job_id = 456
    DB-->>CC: Raw citations from CA1, CA2
    CC->>CC: Compare results<br/>Intersection: 45<br/>Union: 54
    CC->>CC: Calculate agreement<br/>45/54 = 83.3%
    CC->>DB: INSERT INTO consensus_results<br/>(agreement: 83.3%)

    alt Agreement < 80%
        CC->>Orchestrator: Low consensus warning
        Orchestrator->>NL: review_discrepancies(job: 456)
        NL->>DB: SELECT discrepancies
        NL->>NL: Meta-learning analysis
        NL->>DB: INSERT INTO learning_insights
        NL-->>CC: Recommendations
    end

    CC->>DB: INSERT INTO citations_final<br/>(verified citations: 45)
    CC-->>Orchestrator: Consensus complete

    Note over Orchestrator,NL: Quality Assessment

    Orchestrator->>NL: assess_quality(job: 456)
    NL->>DB: SELECT citations_final<br/>WHERE job_id = 456
    NL->>NL: Analyze patterns<br/>- Citation diversity<br/>- Source quality<br/>- Temporal distribution
    NL->>DB: INSERT INTO quality_metrics<br/>(diversity: 0.72, recency: 0.88)
    NL->>NL: Update learning model<br/>(Bayesian update)
    NL->>DB: UPDATE agent_swarm_state<br/>(reputation, memory)
    NL-->>Orchestrator: Quality score: 0.85

    Note over Orchestrator,S3: Finalization

    Orchestrator->>DB: UPDATE citation_jobs<br/>SET status = COMPLETED<br/>quality_score = 0.85
    Orchestrator->>S3: PUT /papers/456/analysis.json<br/>{citations, quality, consensus}
    Orchestrator->>Queue: PUBLISH events:jobs<br/>{jobId: 456, status: COMPLETED}

    Note over Client,S3: Client Polling / Webhook

    Client->>API: GET /api/citations/jobs/456
    API->>DB: SELECT * FROM citation_jobs<br/>WHERE id = 456
    DB-->>API: Job data (status: COMPLETED)
    API->>S3: GET /papers/456/analysis.json
    S3-->>API: Analysis results
    API-->>Client: 200 OK<br/>{citations: 45, quality: 0.85, consensus: 83.3%}

    Note over Client,S3: Error Handling

    opt Analysis Failure
        CA1->>Orchestrator: Error: timeout
        Orchestrator->>DB: UPDATE citation_jobs<br/>SET status = FAILED<br/>error = "Analyzer timeout"
        Orchestrator->>Queue: PUBLISH events:jobs<br/>{jobId: 456, status: FAILED}
    end
```

**Analysis Pipeline Features:**

- **Multi-Agent Extraction:** Parallel citation extraction using different methods (regex, ML)
- **Consensus Building:** Cross-validation between agents, agreement threshold enforcement
- **Nested Learning:** Meta-learning agent analyzes discrepancies and updates models
- **Quality Metrics:** Citation diversity, source quality, temporal distribution analysis
- **Fault Tolerance:** Timeout handling, retry logic, error state persistence
- **Result Storage:** S3 for large analysis artifacts, PostgreSQL for metadata
- **Real-time Updates:** Redis pub/sub for job status notifications

---

## Agent Orchestration Data Flow

Data flow diagram showing how agents communicate and coordinate through Redis and PostgreSQL.

```mermaid
graph TB
    subgraph "API Layer"
        API[API Server<br/>TypeScript]
    end

    subgraph "Message Queue"
        RedisQueue[(Redis Queues)]
        JobQueue[jobs:citation]
        EventBus[events:jobs]
        AgentQueue[agents:tasks]
    end

    subgraph "Agent Orchestrator"
        Orchestrator[Orchestrator Service<br/>Python]
    end

    subgraph "Agent Pool"
        CA1[Citation Analyzer 1]
        CA2[Citation Analyzer 2]
        CC[Consensus Coordinator]
        NL[Nested Learning]
    end

    subgraph "State Management"
        AgentState[(PostgreSQL<br/>agent_swarm_state)]
        JobState[(PostgreSQL<br/>citation_jobs)]
        ResultCache[(Redis<br/>Cached Results)]
    end

    subgraph "Storage"
        S3[(Object Storage<br/>S3/GCS)]
    end

    %% Job submission flow
    API -->|1. RPUSH job| JobQueue
    API -->|2. INSERT job record| JobState

    %% Orchestrator picks up job
    Orchestrator -->|3. BLPOP| JobQueue
    Orchestrator -->|4. UPDATE status| JobState
    Orchestrator -->|5. Read metadata| JobState

    %% Orchestrator spawns agents
    Orchestrator -->|6. RPUSH tasks| AgentQueue
    Orchestrator -->|7. UPDATE state| AgentState

    %% Agents process tasks
    AgentQueue -->|8. BLPOP| CA1
    AgentQueue -->|8. BLPOP| CA2

    CA1 -->|9. Read state| AgentState
    CA2 -->|9. Read state| AgentState

    CA1 -->|10. GET artifact| S3
    CA2 -->|10. GET artifact| S3

    CA1 -->|11. Process citations| CA1
    CA2 -->|11. Process citations| CA2

    CA1 -->|12. PUT results| S3
    CA2 -->|12. PUT results| S3

    CA1 -->|13. INSERT raw results| JobState
    CA2 -->|13. INSERT raw results| JobState

    CA1 -->|14. RPUSH complete| AgentQueue
    CA2 -->|14. RPUSH complete| AgentQueue

    %% Consensus phase
    Orchestrator -->|15. Trigger consensus| CC
    CC -->|16. SELECT raw results| JobState
    CC -->|17. Calculate agreement| CC
    CC -->|18. INSERT consensus| JobState
    CC -->|19. PUBLISH event| EventBus

    %% Learning phase
    Orchestrator -->|20. Trigger learning| NL
    NL -->|21. SELECT final results| JobState
    NL -->|22. Analyze patterns| NL
    NL -->|23. UPDATE state<br/>(reputation, memory)| AgentState
    NL -->|24. INSERT metrics| JobState

    %% Finalization
    Orchestrator -->|25. UPDATE status<br/>COMPLETED| JobState
    Orchestrator -->|26. SET cache| ResultCache
    Orchestrator -->|27. PUBLISH done| EventBus

    %% API retrieves results
    API -->|28. GET from cache| ResultCache
    ResultCache -.->|cache miss| API
    API -->|29. SELECT results| JobState
    API -->|30. GET analysis| S3

    style API fill:#e1f5ff
    style Orchestrator fill:#fff4e1
    style CA1 fill:#ffe1e1
    style CA2 fill:#ffe1e1
    style CC fill:#ffe1e1
    style NL fill:#ffe1e1
    style AgentState fill:#e1ffe1
    style JobState fill:#e1ffe1
    style ResultCache fill:#f0e1ff
```

**Data Flow Patterns:**

1. **Job Submission:** API → Redis Queue → PostgreSQL (job record)
2. **Orchestration:** Orchestrator polls queue → spawns agents → tracks state
3. **Parallel Processing:** Multiple agents work simultaneously on tasks
4. **State Synchronization:** All agents read/write to shared PostgreSQL state
5. **Result Aggregation:** Consensus coordinator merges agent outputs
6. **Learning Loop:** Nested learning agent updates models based on results
7. **Caching:** Redis caches frequently accessed results
8. **Event Notifications:** Pub/sub for real-time status updates

---

## Kubernetes Deployment Topology

Detailed Kubernetes cluster architecture with all services, pods, and networking.

```mermaid
graph TB
    subgraph "Internet"
        Users[Users/API Clients]
    end

    subgraph "Kubernetes Cluster (GKE/EKS)"

        subgraph "Ingress Controller"
            Ingress[Nginx Ingress<br/>:80, :443]
            Cert[cert-manager<br/>Let's Encrypt]
        end

        subgraph "marcus-platform Namespace"

            subgraph "API Deployment"
                API_Svc[marcus-api-service<br/>ClusterIP :3000]
                API_Pod1[API Pod 1<br/>marcus-platform:v3.0]
                API_Pod2[API Pod 2<br/>marcus-platform:v3.0]
                API_Pod3[API Pod 3<br/>marcus-platform:v3.0]
                API_HPA[HorizontalPodAutoscaler<br/>min: 3, max: 10<br/>CPU: 70%]
            end

            subgraph "Agent Deployment"
                Agent_Svc[marcus-agent-service<br/>ClusterIP :8000]
                Agent_Pod1[Agent Pod 1<br/>marcus-agents:v3.0<br/>Python]
                Agent_Pod2[Agent Pod 2<br/>marcus-agents:v3.0<br/>Python]
                Agent_HPA[HorizontalPodAutoscaler<br/>min: 2, max: 20<br/>CPU: 80%]
            end

            subgraph "Worker Deployment"
                Worker_Pod1[Worker Pod 1<br/>Background Jobs]
                Worker_Pod2[Worker Pod 2<br/>Background Jobs]
            end

        end

        subgraph "data Namespace"

            subgraph "Redis StatefulSet"
                Redis_Svc[redis-service<br/>ClusterIP :6379]
                Redis_Pod1[Redis Pod 0<br/>redis:7-alpine]
                Redis_PVC1[PersistentVolumeClaim<br/>10Gi SSD]
            end

        end

        subgraph "monitoring Namespace"

            subgraph "Prometheus Stack"
                Prom_Svc[prometheus-service<br/>ClusterIP :9090]
                Prom_Pod[Prometheus Pod<br/>prom/prometheus]
                Prom_PVC[PVC: 50Gi]
            end

            subgraph "Grafana"
                Grafana_Svc[grafana-service<br/>LoadBalancer :3000]
                Grafana_Pod[Grafana Pod<br/>grafana/grafana]
            end

        end

        subgraph "Secrets & ConfigMaps"
            Secret_DB[Secret: database-credentials<br/>POSTGRES_PASSWORD]
            Secret_Redis[Secret: redis-credentials<br/>REDIS_PASSWORD]
            Secret_API[Secret: api-keys<br/>ANTHROPIC_API_KEY]
            ConfigMap[ConfigMap: app-config<br/>NODE_ENV, LOG_LEVEL]
        end

    end

    subgraph "Cloud Managed Services"

        subgraph "Database"
            PostgreSQL[(Cloud SQL / RDS<br/>PostgreSQL 15<br/>Multi-AZ)]
        end

        subgraph "Storage"
            S3[(Object Storage<br/>S3 / GCS)]
        end

        subgraph "DNS & CDN"
            DNS[Cloud DNS<br/>marcus-platform.com]
            CDN[CloudFront / CDN<br/>Static Assets]
        end

    end

    %% User traffic flow
    Users -->|HTTPS| DNS
    DNS --> Ingress
    Ingress -->|TLS termination| Cert

    %% API routing
    Ingress -->|/api/*| API_Svc
    API_Svc --> API_Pod1
    API_Svc --> API_Pod2
    API_Svc --> API_Pod3

    %% Agent routing
    API_Pod1 -.->|internal gRPC| Agent_Svc
    API_Pod2 -.->|internal gRPC| Agent_Svc
    API_Pod3 -.->|internal gRPC| Agent_Svc
    Agent_Svc --> Agent_Pod1
    Agent_Svc --> Agent_Pod2

    %% Autoscaling
    API_HPA -.->|scale| API_Pod1
    Agent_HPA -.->|scale| Agent_Pod1

    %% Redis connections
    API_Pod1 --> Redis_Svc
    API_Pod2 --> Redis_Svc
    API_Pod3 --> Redis_Svc
    Worker_Pod1 --> Redis_Svc
    Worker_Pod2 --> Redis_Svc
    Agent_Pod1 --> Redis_Svc
    Agent_Pod2 --> Redis_Svc

    Redis_Svc --> Redis_Pod1
    Redis_Pod1 --> Redis_PVC1

    %% Database connections
    API_Pod1 --> PostgreSQL
    API_Pod2 --> PostgreSQL
    API_Pod3 --> PostgreSQL
    Agent_Pod1 --> PostgreSQL
    Agent_Pod2 --> PostgreSQL
    Worker_Pod1 --> PostgreSQL
    Worker_Pod2 --> PostgreSQL

    %% Object storage
    API_Pod1 --> S3
    Agent_Pod1 --> S3
    Agent_Pod2 --> S3

    %% Secrets
    API_Pod1 -.->|mount| Secret_DB
    API_Pod1 -.->|mount| Secret_Redis
    API_Pod1 -.->|mount| Secret_API
    API_Pod1 -.->|mount| ConfigMap
    Agent_Pod1 -.->|mount| Secret_DB
    Agent_Pod1 -.->|mount| Secret_API

    %% Monitoring
    API_Pod1 -.->|/metrics| Prom_Svc
    Agent_Pod1 -.->|/metrics| Prom_Svc
    Redis_Pod1 -.->|/metrics| Prom_Svc
    Prom_Svc --> Prom_Pod
    Prom_Pod --> Prom_PVC
    Grafana_Pod -->|query| Prom_Pod
    Users -.->|dashboards| Grafana_Svc

    %% CDN
    Users -.->|static assets| CDN
    CDN -.-> S3

    style Users fill:#e1f5ff
    style Ingress fill:#fff4e1
    style API_Svc fill:#ffe1e1
    style Agent_Svc fill:#ffe1e1
    style Redis_Svc fill:#f0e1ff
    style PostgreSQL fill:#e1ffe1
    style S3 fill:#e1ffe1
    style Prom_Svc fill:#ffede1
    style Grafana_Svc fill:#ffede1
```

**Kubernetes Resources:**

**Namespaces:**
- `marcus-platform` - Application workloads
- `data` - Redis StatefulSet
- `monitoring` - Prometheus, Grafana
- `ingress-nginx` - Ingress controller

**Deployments:**
- `marcus-api` - 3 replicas (HPA: 3-10)
- `marcus-agents` - 2 replicas (HPA: 2-20)
- `marcus-workers` - 2 replicas (background jobs)

**StatefulSets:**
- `redis` - 1 replica with persistent storage (10Gi SSD)

**Services:**
- `marcus-api-service` - ClusterIP (internal)
- `marcus-agent-service` - ClusterIP (internal)
- `redis-service` - ClusterIP (internal)
- `grafana-service` - LoadBalancer (external)

**Ingress:**
- TLS termination with cert-manager
- Routes `/api/*` to API service
- Automatic HTTPS redirection

**Autoscaling:**
- API HPA: 3-10 pods (70% CPU target)
- Agent HPA: 2-20 pods (80% CPU target)
- Cluster Autoscaler for node scaling

---

## Database Schema

Entity-relationship diagram showing core database tables and relationships.

```mermaid
erDiagram
    users ||--o{ citation_jobs : creates
    users ||--o{ audit_logs : generates
    users ||--o{ verification_tokens : has
    users ||--o{ password_reset_tokens : requests
    users {
        uuid id PK
        string email UK
        string password_hash
        boolean verified
        timestamp created_at
        timestamp updated_at
        timestamp last_login
        jsonb settings
    }

    citation_jobs ||--o{ citations_raw : contains
    citation_jobs ||--o{ citations_final : produces
    citation_jobs ||--|| consensus_results : has
    citation_jobs ||--o{ quality_metrics : measures
    citation_jobs {
        uuid id PK
        uuid user_id FK
        string paper_id
        string status
        decimal quality_score
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        timestamp completed_at
        text error_message
    }

    citations_raw {
        uuid id PK
        uuid job_id FK
        string agent_id
        string citation_text
        jsonb parsed_data
        decimal confidence
        timestamp extracted_at
    }

    citations_final {
        uuid id PK
        uuid job_id FK
        string citation_text
        jsonb parsed_data
        decimal consensus_score
        boolean verified
        timestamp created_at
    }

    consensus_results {
        uuid id PK
        uuid job_id FK
        decimal agreement_percentage
        int total_citations
        int agreed_citations
        jsonb discrepancies
        timestamp calculated_at
    }

    quality_metrics {
        uuid id PK
        uuid job_id FK
        decimal diversity_score
        decimal recency_score
        decimal source_quality_score
        jsonb detailed_metrics
        timestamp calculated_at
    }

    agent_swarm_state ||--o{ agent_memory : has
    agent_swarm_state {
        uuid id PK
        string agent_id UK
        string agent_type
        decimal reputation_score
        int tasks_completed
        int tasks_failed
        jsonb performance_metrics
        timestamp created_at
        timestamp updated_at
    }

    agent_memory {
        uuid id PK
        uuid agent_state_id FK
        string memory_type
        jsonb memory_data
        decimal relevance_score
        timestamp created_at
        timestamp expires_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        string event_type
        string resource_type
        uuid resource_id
        jsonb event_data
        inet ip_address
        string user_agent
        timestamp created_at
    }

    verification_tokens {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
        timestamp created_at
    }

    password_reset_tokens {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
        timestamp created_at
        boolean used
    }
```

**Key Tables:**

- **users:** User accounts with authentication credentials
- **citation_jobs:** Citation analysis job tracking
- **citations_raw:** Raw citation extraction results from individual agents
- **citations_final:** Consensus-validated final citations
- **consensus_results:** Agreement metrics between agents
- **quality_metrics:** Citation quality assessment scores
- **agent_swarm_state:** Agent reputation and performance tracking
- **agent_memory:** Agent learning and context storage
- **audit_logs:** Security and compliance event logging
- **verification_tokens:** Email verification tokens
- **password_reset_tokens:** Password reset flow tokens

**Indexes:**
- All foreign keys indexed
- `users.email` unique index
- `citation_jobs.status` index (for job polling)
- `audit_logs.created_at` index (for log queries)
- `agent_swarm_state.agent_id` unique index
- Composite index on `(user_id, created_at)` for user history queries

---

## Metrics Pipeline

Data flow showing how metrics are collected, aggregated, and visualized.

```mermaid
graph LR
    subgraph "Application Layer"
        API[API Server<br/>prom-client]
        Agent[Agent Process<br/>prometheus-python]
        Worker[Worker Process<br/>prom-client]
    end

    subgraph "Metrics Collection"
        API -->|HTTP /metrics| Metrics_API[API Metrics<br/>• Request count<br/>• Response time<br/>• Error rate]
        Agent -->|HTTP /metrics| Metrics_Agent[Agent Metrics<br/>• Tasks processed<br/>• Accuracy<br/>• Processing time]
        Worker -->|HTTP /metrics| Metrics_Worker[Worker Metrics<br/>• Jobs completed<br/>• Queue depth<br/>• Failure rate]
    end

    subgraph "Infrastructure Metrics"
        K8s[Kubernetes<br/>kube-state-metrics] -->|cluster state| Metrics_K8s[K8s Metrics<br/>• Pod status<br/>• Resource usage<br/>• Node health]
        DB[(PostgreSQL<br/>postgres_exporter)] -->|DB stats| Metrics_DB[DB Metrics<br/>• Connections<br/>• Query time<br/>• Lock waits]
        Redis_Metrics[(Redis<br/>redis_exporter)] -->|Redis stats| Metrics_Redis[Redis Metrics<br/>• Memory usage<br/>• Hit rate<br/>• Evictions]
    end

    subgraph "Prometheus"
        Prometheus[Prometheus Server<br/>Scrape interval: 15s]
        Prometheus -->|scrape| Metrics_API
        Prometheus -->|scrape| Metrics_Agent
        Prometheus -->|scrape| Metrics_Worker
        Prometheus -->|scrape| Metrics_K8s
        Prometheus -->|scrape| Metrics_DB
        Prometheus -->|scrape| Metrics_Redis

        Prometheus -->|store| TSDB[(Time Series DB<br/>Retention: 30d)]
    end

    subgraph "Alerting"
        Prometheus -->|evaluate| AlertRules[Alert Rules<br/>• High error rate<br/>• Low consensus<br/>• Resource exhaustion]
        AlertRules -->|trigger| AlertManager[Alertmanager<br/>Deduplication<br/>Routing<br/>Silencing]
        AlertManager -->|notify| PagerDuty[PagerDuty<br/>Critical alerts]
        AlertManager -->|notify| Slack[Slack<br/>Warning alerts]
        AlertManager -->|notify| Email[Email<br/>Info alerts]
    end

    subgraph "Visualization"
        TSDB -->|PromQL queries| Grafana[Grafana Dashboards]
        Grafana -->|display| Dashboard_Ops[Operations Dashboard<br/>• System health<br/>• Resource usage<br/>• Error rates]
        Grafana -->|display| Dashboard_Business[Business Dashboard<br/>• Jobs processed<br/>• Quality scores<br/>• User activity]
        Grafana -->|display| Dashboard_Agents[Agent Performance<br/>• Accuracy trends<br/>• Consensus rates<br/>• Learning progress]
    end

    style API fill:#e1f5ff
    style Agent fill:#e1f5ff
    style Worker fill:#e1f5ff
    style Prometheus fill:#ffe1e1
    style TSDB fill:#f0e1ff
    style Grafana fill:#e1ffe1
    style AlertManager fill:#fff4e1
```

**Metrics Categories:**

**Application Metrics:**
- Request rate, latency, error rate (RED method)
- Citation job throughput and quality scores
- Agent consensus agreement percentages
- User authentication success/failure rates

**Infrastructure Metrics:**
- CPU, memory, disk, network usage
- Kubernetes pod/node health
- Database connection pool usage
- Redis cache hit/miss rates

**Business Metrics:**
- Daily active users
- Citations analyzed per hour
- Average quality score
- Cost per citation (cloud spend)

**Alert Rules:**
```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  severity: critical

# Low consensus
- alert: LowConsensusRate
  expr: avg_over_time(citation_consensus_agreement[1h]) < 0.7
  for: 15m
  severity: warning

# Database connection exhaustion
- alert: DatabaseConnectionsHigh
  expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
  for: 5m
  severity: critical
```

---

## Summary

This document provides comprehensive architecture diagrams for the MARCUS 3.0 platform, covering:

1. **System Architecture:** High-level component overview and interactions
2. **Authentication Flow:** Detailed JWT-based authentication with security measures
3. **Citation Analysis:** Multi-agent citation extraction and consensus workflow
4. **Agent Orchestration:** Data flow between agents, queues, and storage
5. **Kubernetes Topology:** Complete cluster architecture with autoscaling
6. **Database Schema:** Entity relationships and data model
7. **Metrics Pipeline:** Observability infrastructure for monitoring and alerting

All diagrams use Mermaid syntax and can be rendered in GitHub, GitLab, VS Code, and most documentation tools.

For implementation details, refer to:
- **Deployment Guide:** `docs/MARCUS_DEPLOYMENT_GUIDE.md`
- **API Documentation:** `docs/MARCUS_API_REFERENCE.md`
- **Task Checklist:** `docs/MARCUS_CONSOLIDATED_TASK_CHECKLIST.md`
