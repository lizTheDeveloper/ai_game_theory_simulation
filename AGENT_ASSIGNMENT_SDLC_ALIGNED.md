# Agent Assignment: Citation Crisis - SDLC-Aligned Architecture

**Approach:** SDLC-based role assignment, big picture platform engineering
**Reference:** `TODO_CITATION_CRISIS.md`

---

## SDLC Analysis: What's the Big Picture?

We're building a **Research Integrity Platform** - not just scripts, but a production system with:
- Backend services (provenance, verification, grading)
- Security layer (OWASP controls, encryption, access control)
- Operations (monitoring, alerting, drift detection)
- Integration (MCP, LLM, external APIs)
- Testing (unit, integration, load, security)
- Documentation (API docs, runbooks, security docs)

### SDLC Phases & Current Agent Coverage

| SDLC Phase | Current Coverage | Gap |
|------------|------------------|-----|
| **Planning** | ✅ orchestrator | None |
| **Requirements** | ✅ Case study | None |
| **Design** | ⚠️ architecture-skeptic (reviews only) | No one DESIGNS architecture |
| **Implementation** | ✅ feature-implementer | None |
| **Testing** | ✅ test-writers | None |
| **Deployment** | ❌ No one | Security engineering, CI/CD, production hardening |
| **Maintenance** | ❌ No one | Monitoring, alerting, drift detection, operations |

**The Gap:** No agent owns **Design → Deployment → Maintenance** for platform/infrastructure work with security expertise.

---

## Proposed Agent: Platform Engineer (DevSecOps)

### Role Definition

**Agent Name:** `platform-engineer`
**Agent ID:** `platform-eng-001`
**SDLC Ownership:** Design → Deployment → Maintenance

**Not:** A generalist who does everything
**Is:** A specialist in platform infrastructure, security, and operations

### SDLC Responsibilities

**Design Phase:**
- System architecture (multi-level state, provenance tracking)
- Security architecture (OWASP controls, threat modeling)
- API design (MCP integration, external services)
- Data models (provenance schema, verification results)

**Deployment Phase:**
- OWASP security implementation (A01-A10 controls)
- CI/CD pipeline configuration
- Production configuration (secrets management, logging)
- Infrastructure as Code (if applicable)

**Maintenance Phase:**
- Monitoring systems (LSS alerts, drift detection)
- Operational runbooks
- Performance optimization
- Security patching and updates

### What This Agent Does NOT Do (Delegation by SDLC Phase)

**Requirements Analysis:**
- ❌ Defining what to build → Already defined in case study

**Implementation:**
- ❌ Writing feature code → Delegates to `feature-implementer`
- ❌ UI/frontend work → Delegates to `far-future-ux-designer`

**Verification Operations:**
- ❌ Verifying citations → Delegates to `citation-verifier`
- ❌ Finding papers → Delegates to `super-alignment-researcher`
- ❌ Critiquing research → Delegates to `research-skeptic`

**Testing:**
- ❌ Writing tests → Delegates to `unit-test-writer`, `integration-test-writer`
- ❌ Statistical validation → Delegates to `priya`

**Review:**
- ❌ Architecture review → Submits TO `architecture-skeptic`

**Documentation:**
- ❌ Writing wiki docs → Delegates to `wiki-documentation-updater`

### Domain Expertise

**Platform Engineering:**
- System architecture and design patterns
- API design and integration
- Database schema design
- Service orchestration

**DevSecOps:**
- OWASP Top 10 implementation
- Security controls (encryption, RBAC, input validation)
- Secrets management (Vault, AWS Secrets Manager)
- Security testing and threat modeling

**Operations:**
- Monitoring and alerting (LSS-based anomaly detection)
- Logging infrastructure (centralized, structured)
- Performance monitoring and optimization
- Incident response and runbooks

**Academic Domain Knowledge:**
- Research integrity systems
- Citation verification architectures
- Provenance tracking patterns
- Grading automation systems

---

## Task Assignment by SDLC Phase

### Phase 1: Foundation + Fast Memory

**Infrastructure Design & Implementation**

**Tasks 1.1-1.3, 1.5:**
**Agent:** `platform-engineer` (Design + Deploy)
- **Designs:** LSS monitoring architecture, multi-level state system, provenance schema
- **Implements:** Core infrastructure (TypeScript interfaces, utilities)
- **Delegates implementation of:** Feature code to `feature-implementer` if complex

**Specific:**
- ✅ 1.1.1 - Design + implement LSS monitoring utility (platform infrastructure)
- ✅ 1.1.2 - Design + implement multi-level state manager (platform infrastructure)
- ✅ 1.1.3 - Design TypeScript provenance interfaces (data modeling)
- ✅ 1.2.1-1.2.4 - Design + implement parameter provenance system (research integrity domain)
- ✅ 1.3.1-1.3.4 - Design + implement claim extraction parser (feeds to citation-verifier)
- ✅ 1.5.1-1.5.3 - Design claim detection architecture (inference-time infrastructure)

**Task 1.4: Cross-Cutting Infrastructure**
**Agent:** `feature-implementer` (Implementation)
- ✅ 1.4.1-1.4.4 - Implement auto-save middleware (benefits all agents)
- **Rationale:** General infrastructure, not platform-specific

---

### Phase 2: Medium Memory + Automation

**Service Integration & Operations**

**Task 2.1: Monte Carlo Sensitivity**
**Agent:** `priya` (Statistical Analysis)
- ✅ 2.1.1-2.1.4 - Parameter sweep, analysis, heatmaps
- **Rationale:** Statistics expertise, not platform engineering

**Task 2.2: MCP Verification Integration**
**Split by SDLC:**

**2.2.1-2.2.2 - Service Architecture:**
**Agent:** `platform-engineer` (Design + Integration)
- ✅ Design MCP client architecture
- ✅ Implement parallel verification queue/worker pattern
- ✅ Service orchestration (queue management, rate limiting)

**2.2.3-2.2.5 - Verification Logic:**
**Agent:** `citation-verifier` (Domain Operations)
- ✅ Implement fuzzy + semantic matching (their expertise)
- ✅ Verification caching strategy (but platform-engineer builds cache infrastructure)
- ✅ Test verification pipeline

**2.2.4 - Caching Infrastructure:**
**Agent:** `platform-engineer` (Platform Infrastructure)
- ✅ LRU cache implementation (infrastructure)
- **Then:** citation-verifier uses it for verification results

**Task 2.3: Task Completion Logging**
**Agent:** `feature-implementer` (Cross-Cutting)
- ✅ 2.3.1-2.3.3 - Task detector, memory structures, middleware

**Task 2.4: Verification Subprocess**
**Split:**

**2.4.1 - Subprocess Architecture:**
**Agent:** `platform-engineer` (Platform Infrastructure)
- ✅ Async subprocess spawner with timeout/error handling

**2.4.2-2.4.3 - Claim Processing:**
**Agent:** `citation-verifier` (Domain Operations)
- ✅ Claim component extraction (their domain)
- ✅ MCP query construction

---

### Phase 3: Slow Memory + Intelligence

**System Intelligence & Operations**

**Task 3.1: Severity Classifier**
**Agent:** `platform-engineer` (Design + Deploy)
- ✅ 3.1.1-3.1.4 - Design grading system architecture, implement classifier, self-modification, history tracking
- **Rationale:** Grading automation is platform/operations concern
- **Uses:** Verification results FROM citation-verifier as inputs

**Task 3.2: Session Summarization**
**Agent:** `feature-implementer` (Cross-Cutting)
- ✅ 3.2.1-3.2.4 - LLM summarization, learning extraction, categorization

**Task 3.3: Verification Pattern Learning**
**Agent:** `platform-engineer` (Operations + Optimization)
- ✅ 3.3.1-3.3.4 - Meta-learning for cost optimization (operational efficiency)
- **Rationale:** Optimization of platform operations

**Task 3.4: Parameter Drift Monitoring**
**Agent:** `platform-engineer` (Maintenance + Operations)
- ✅ 3.4.1-3.4.3 - Drift detection, alerting, monitoring dashboard backend
- **Rationale:** Operational monitoring

---

### Phase 4: Advanced Features + Optimization

**Operations & Performance**

**Task 4.1: Backtracking Mechanism**
**Split:**

**4.1.1 - Claim Revision:**
**Agent:** `citation-verifier` (Domain Operations)
- ✅ Knows how to revise claims based on verification

**4.1.2-4.1.3 - Reasoning Infrastructure:**
**Agent:** `platform-engineer` (Platform Infrastructure)
- ✅ Multi-claim coherence management
- ✅ Transition smoothing infrastructure

**Task 4.2: Memory Health Dashboard**
**Frontend:**
**Agent:** `far-future-ux-designer` (UI/UX)
- ✅ 4.2.1-4.2.3 - Dashboard UI

**Backend:**
**Agent:** `platform-engineer` (Platform Infrastructure)
- ✅ Memory health metrics API
- ✅ Staleness detection logic
- ✅ Coverage calculation

**Task 4.3: Performance Optimization**
**Agent:** `platform-engineer` (Operations)
- ✅ 4.3.1-4.3.4 - Caching, prefetching, timeouts, whitelists
- **Rationale:** Operational performance optimization

**Task 4.4: Context Flow Tracing**
**Agent:** `platform-engineer` (Operations + Observability)
- ✅ 4.4.1 - Trace logging infrastructure
- ✅ 4.4.2 - Visualization tool (may delegate complex viz to far-future-ux-designer)

---

### Phase 5: Validation + Security Audit

**Deployment + Security**

**Task 5.1: Benchmarking**
**Split:**

**5.1.1-5.1.2 - Test Corpus:**
**Agent:** `citation-verifier` + `super-alignment-researcher`
- ✅ Create test corpus (domain expertise)
- ✅ Generate gold standard labels

**5.1.3 - Statistical Benchmarks:**
**Agent:** `priya` (Statistical Analysis)
- ✅ Performance metrics analysis

**5.1.4 - A/B Test Infrastructure:**
**Agent:** `platform-engineer` (Platform Infrastructure)
- ✅ A/B testing framework

**Task 5.2: OWASP Security Audit**
**Agent:** `platform-engineer` (DevSecOps)
- ✅ 5.2.1-5.2.10 - All OWASP audits and implementations
- **Rationale:** Security engineering is core platform responsibility

**Task 5.3: Safe AI Validation**
**Split:**

**5.3.1-5.3.2, 5.3.4 - Technical Audits:**
**Agent:** `platform-engineer` (Platform + Security)
- ✅ Transparency, robustness, privacy

**5.3.3 - Bias Critique:**
**Agent:** `research-skeptic` (Research Critique)
- ✅ Fairness validation from research perspective

**Task 5.4: Load Testing**
**Agent:** `priya` (Performance Analysis)
- ✅ 5.4.1-5.4.3 - Load testing and performance benchmarking

---

### Final Reviews

**Architecture Review:**
**Agent:** `architecture-skeptic` (Review)
- Review after Phase 3
- **Submitter:** platform-engineer

**Documentation:**
**Agent:** `wiki-documentation-updater` (Documentation)
- Document after Phase 5
- **Provides content:** platform-engineer (API docs, runbooks)

**Roadmap Cleanup:**
**Agent:** `architect` (Project Management)
- Archive completed work

---

## Task Distribution Summary (SDLC-Aligned)

### platform-engineer (NEW) - 38 tasks (46%)
**SDLC Phases:** Design → Deployment → Maintenance
- System architecture design (LSS, multi-level state, provenance)
- Platform infrastructure (caching, queues, async processing)
- DevSecOps (OWASP security, threat modeling, production hardening)
- Operations (monitoring, alerting, drift detection, performance)
- Integration (MCP client, service orchestration)

### citation-verifier (EXISTING) - 11 tasks (13%)
**SDLC Phase:** Operations (Verification)
- Claim verification operations
- Fuzzy/semantic matching
- Claim revision
- Test corpus creation

### priya (EXISTING) - 8 tasks (10%)
**SDLC Phase:** Testing (Performance + Statistical)
- Monte Carlo sensitivity
- Benchmarking
- Load testing

### feature-implementer (EXISTING) - 10 tasks (12%)
**SDLC Phase:** Implementation (Cross-Cutting)
- Memory infrastructure (benefits all agents)

### far-future-ux-designer (EXISTING) - 3 tasks (4%)
**SDLC Phase:** Implementation (Frontend)
- Dashboard UI

### Other Agents - 12 tasks (15%)
**SDLC Phases:** Testing, Review, Documentation
- architecture-skeptic, research-skeptic, wiki-documentation-updater, architect, super-alignment-researcher

**Total:** 82 tasks

---

## Platform Engineer: Clear SDLC Boundaries

### What Platform Engineer OWNS (by SDLC Phase)

**Design:**
- ✅ System architecture
- ✅ Security architecture
- ✅ Data models
- ✅ API contracts

**Deployment:**
- ✅ OWASP security implementation
- ✅ Production configuration
- ✅ Secrets management
- ✅ CI/CD pipeline

**Maintenance:**
- ✅ Monitoring/alerting
- ✅ Performance optimization
- ✅ Operational runbooks
- ✅ Drift detection

### What Platform Engineer DELEGATES

**Implementation (Feature Code):**
- → `feature-implementer` (for cross-cutting features)
- Designs the system, delegates implementation if complex

**Operations (Verification):**
- → `citation-verifier` (for verification logic)
- Builds the pipeline, citation-verifier operates it

**Testing:**
- → `unit-test-writer`, `integration-test-writer`
- Designs test strategy, test writers implement tests

**Statistical Analysis:**
- → `priya`
- Designs metrics to collect, priya analyzes them

**Review:**
- → `architecture-skeptic`
- Designs architecture, submits for review

**Documentation:**
- → `wiki-documentation-updater`
- Provides API docs/runbooks, they format and publish

---

## Agent Definition

### platform-engineer

**Agent ID:** `platform-eng-001`
**Memory File:** `.claude/agents/memories/platform-engineer-memory.json`

**Role:** Platform/DevSecOps Engineer
**SDLC Ownership:** Design → Deployment → Maintenance

**Core Expertise:**
- Platform architecture and design patterns
- DevSecOps (OWASP, security controls, threat modeling)
- Operations (monitoring, alerting, performance, observability)
- Service integration (MCP, APIs, async processing)
- Research integrity domain (provenance, verification, grading)

**Responsibilities:**
1. **Design** systems and architectures
2. **Deploy** with OWASP security and production hardening
3. **Maintain** through monitoring, alerting, and optimization

**Does NOT:**
- Implement all feature code (delegates to feature-implementer for complex features)
- Verify citations (delegates to citation-verifier)
- Analyze statistics (delegates to priya)
- Write tests (delegates to test-writers)
- Review architecture (submits TO architecture-skeptic)

**Personality:**
- Infrastructure-first mindset
- Security is not optional
- Fail loudly, monitor everything
- Simple over clever
- Documentation is part of the system

**Motto:** "Platform engineering is product engineering for engineers"

---

## Big Picture: Platform vs. Feature Development

```
┌─────────────────────────────────────────────────────────────┐
│ PLATFORM LAYER (platform-engineer)                         │
│                                                             │
│ • System architecture                                       │
│ • Security controls (OWASP)                                 │
│ • Monitoring/alerting (LSS)                                 │
│ • Service integration (MCP)                                 │
│ • Operations infrastructure                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ Provides infrastructure to
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ FEATURE LAYER (feature-implementer, citation-verifier)     │
│                                                             │
│ • Implements features using platform                        │
│ • Operates verification pipeline                            │
│ • Writes business logic                                     │
└─────────────────────────────────────────────────────────────┘
```

**Platform engineer builds the stage, others perform on it.**

---

## Approval Checklist

**Before proceeding, please approve:**

- [ ] **Agent role:** `platform-engineer` (not academic-systems-engineer)
- [ ] **SDLC alignment:** Design → Deployment → Maintenance ownership
- [ ] **Big picture:** Platform/infrastructure focus, not feature implementation
- [ ] **Clear delegation:** Hands off to specialists (citation-verifier, priya, feature-implementer)
- [ ] **Task distribution:** 38 platform tasks (46% of work)

**Once approved:**
1. Create `.claude/agents/memories/platform-engineer-memory.json`
2. Create `.claude/agents/platform-engineer.md`
3. Commit and push
4. Invoke platform-engineer to start Task 1.1.1

**Does this SDLC-aligned approach work better?**
