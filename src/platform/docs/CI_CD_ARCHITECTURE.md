# MARCUS 3.0 - CI/CD Architecture

## Overview

Comprehensive CI/CD automation for the MARCUS 3.0 Citation Integrity Platform, enabling rapid, safe iteration with automated testing, linting, building, and deployment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Code Push / PR                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────┐            ┌─────▼────┐
    │  Tests   │            │  Lint    │
    │ (Py/TS)  │            │ (Py/TS)  │
    └────┬─────┘            └─────┬────┘
         │                         │
         └────────────┬────────────┘
                      │
                ┌─────▼──────┐
                │  Security  │
                │    Scan    │
                └─────┬──────┘
                      │
                ┌─────▼──────┐
                │   Docker   │
                │   Build    │
                └─────┬──────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────┐            ┌─────▼────┐
    │   Dev    │            │ Staging  │
    │  Deploy  │            │  Deploy  │
    └──────────┘            └─────┬────┘
                                  │
                            ┌─────▼────┐
                            │  Manual  │
                            │ Approval │
                            └─────┬────┘
                                  │
                            ┌─────▼────┐
                            │   Prod   │
                            │  Deploy  │
                            └──────────┘
```

## Workflows

### 1. Python Tests (`marcus-python-tests.yml`)

**Triggers:** Push to main, PRs, manual dispatch

**Matrix:** Python 3.9, 3.10, 3.11, 3.12

**Services:** PostgreSQL 15, Redis 7

**Steps:**
1. Checkout code
2. Set up Python with caching
3. Install dependencies
4. Run pytest with coverage
5. Check 80% coverage threshold
6. Upload to Codecov
7. Upload artifacts

**Key Features:**
- Parallel execution across Python versions
- Service containers for integration tests
- Comprehensive coverage reporting
- Artifact preservation

### 2. TypeScript Tests (`marcus-typescript-tests.yml`)

**Triggers:** Push to main, PRs, manual dispatch

**Matrix:** Node.js 18, 20, 22

**Services:** PostgreSQL 15, Redis 7

**Steps:**
1. Checkout code
2. Set up Node.js with caching
3. Install dependencies (npm ci)
4. TypeScript compilation check
5. Run tests with coverage
6. Check 80% coverage threshold
7. Upload to Codecov
8. Upload artifacts

**Key Features:**
- Multi-version Node.js testing
- Type safety validation
- Coverage enforcement
- Fast npm ci installations

### 3. Linting (`marcus-lint.yml`)

**Triggers:** Push to main, PRs, manual dispatch

**Jobs:**

**Python Linting:**
- Black (formatting)
- isort (import sorting)
- flake8 (style)
- mypy (type checking)

**TypeScript Linting:**
- ESLint with security rules
- Prettier (formatting)
- TypeScript compiler (tsc --noEmit)

**Security Linting:**
- Bandit (Python security)
- Trufflehog (secret detection)

### 4. Docker Build (`marcus-docker-build.yml`)

**Triggers:** Push to main, tags, PRs, manual dispatch

**Images Built:**
- `marcus-agent` (Python citation agent)
- `marcus-orchestrator` (TypeScript orchestration)
- `marcus-benchmark` (evaluation framework)

**Features:**
- Multi-platform builds (linux/amd64, linux/arm64)
- Push to GitHub Container Registry
- Semantic versioning tags
- Trivy security scanning
- Cosign image signing
- Layer caching for speed
- Docker Compose integration test

### 5. Deployment Pipeline (`marcus-deploy.yml`)

**Triggers:** Push to main, manual dispatch

**Environments:**
1. **Development** (auto-deploy)
2. **Staging** (auto-deploy after dev)
3. **Production** (manual approval)

**Deployment Strategy:** Blue-Green

**Pipeline Stages:**
1. Test (all tests pass)
2. Build (Docker images)
3. Deploy to Dev (automatic)
4. Deploy to Staging (automatic)
5. Integration Tests (staging)
6. Deploy to Production (manual approval)
7. Smoke Tests (production)
8. Rollback (on failure)

**Features:**
- Zero-downtime deployments
- Automatic rollback on failure
- Health check validation
- Slack notifications
- Deployment tagging

### 6. Automated Benchmarking (`marcus-benchmark.yml`)

**Triggers:** Push to main, PRs, manual dispatch, daily schedule

**Benchmarks:**
- Citation analysis accuracy (>80% target)
- F1 score (>75% target)
- Consensus level (>80% target)
- p95 latency (<100ms target)
- Throughput (>50 citations/sec target)

**Features:**
- Baseline comparison
- Regression detection (10% threshold)
- Performance profiling (CPU, memory)
- HTML report generation
- PR comments with results
- Artifact preservation (90 days)

**Profiling:**
- py-spy (CPU profiling)
- memory-profiler (memory usage)
- Flame graphs
- Timeline visualizations

## Configuration Files

### Linting

**pyproject.toml:**
- Black: line-length 100, multi-version support
- isort: Black-compatible profile
- pytest: test discovery, strict mode
- coverage: 80% threshold, source tracking

**.flake8:**
- max-line-length: 100
- complexity: 10
- ignore: E203, W503, E501

**mypy.ini:**
- Python 3.11 target
- Strict equality, no implicit optional
- Ignore missing imports for external libs

**.prettierrc:**
- Semi-colons, single quotes
- 100 print width, 2 tab width
- Arrow parens, LF line endings

**.pre-commit-config.yaml:**
- Pre-commit hooks for all linters
- Automatic fixing on commit

### Docker

**Dockerfiles:**
- Multi-stage builds for size optimization
- Non-root users for security
- Health checks built-in
- Layer caching optimizations

**docker-compose.yml:**
- Complete stack (agents, orchestrator, DB, cache, monitoring)
- Service dependencies
- Health checks
- Volume persistence
- Network isolation

### Dependencies

**.github/dependabot.yml:**
- Weekly updates (Mondays, 9 AM)
- Separate ecosystems (pip, npm, actions, docker)
- Auto-labeling
- Review assignment
- Commit message formatting

## Monitoring & Observability

### Prometheus Metrics

**Exposed Endpoints:**
- `/metrics` - Orchestrator metrics
- Agent metrics (via service discovery)

**Key Metrics:**
- `citation_accuracy_total` (gauge)
- `citation_latency_ms` (histogram)
- `citation_throughput` (gauge)
- `citation_consensus` (gauge)
- `citation_f1_score` (gauge)

### Grafana Dashboards

**Provisioned:**
- Prometheus datasource
- Platform overview dashboard
- Performance metrics dashboard
- Agent health dashboard

## Security

### Scanning

**Trivy:**
- Container image scanning
- CRITICAL/HIGH severity detection
- SARIF upload to GitHub Security

**Bandit:**
- Python security scanning
- JSON report generation
- Artifact preservation

**Trufflehog:**
- Secret detection in commits
- Base branch comparison
- Pre-commit hook integration

### Secrets Management

**GitHub Secrets Required:**
- `CODECOV_TOKEN` - Coverage uploads
- `SLACK_WEBHOOK` - Notifications
- `DEV_HOST`, `DEV_USERNAME`, `DEV_SSH_KEY` - Dev deployment
- `STAGING_HOST`, `STAGING_USERNAME`, `STAGING_SSH_KEY` - Staging deployment
- `PROD_HOST`, `PROD_USERNAME`, `PROD_SSH_KEY` - Production deployment
- `DEV_URL`, `STAGING_URL`, `PROD_URL` - Health check endpoints
- `GRAFANA_USER`, `GRAFANA_PASSWORD` - Monitoring access

## Branch Protection

**Required Checks (main branch):**
- Python Tests (all versions)
- TypeScript Tests (all versions)
- Linting (Python + TypeScript)
- Security Scan
- Docker Build

**Rules:**
- Require pull request reviews (1 minimum)
- Require status checks to pass
- Require branches to be up to date
- Include administrators

## Notifications

**Slack Integration:**
- Deployment failures
- Production deployments
- Benchmark regressions
- Security vulnerabilities

**GitHub Notifications:**
- PR benchmark comments
- Failed workflow alerts
- Dependabot security alerts

## Performance Optimization

### Caching Strategy

**Python:**
- pip dependencies cached by Python version
- Cache key: `requirements.txt` hash

**Node.js:**
- node_modules cached
- Cache key: `package-lock.json` hash

**Docker:**
- Layer caching via GitHub Actions cache
- Cache mode: max (aggressive caching)

**Test Databases:**
- Service containers reused across tests
- Connection pooling

## Maintenance

### Daily Tasks (Automated)
- Benchmark runs (2 AM UTC)
- Dependency updates check

### Weekly Tasks (Automated)
- Dependabot PRs (Mondays, 9 AM)

### Monthly Tasks (Manual)
- Review benchmark trends
- Audit security scan results
- Update baseline if improvements stable
- Rotate secrets

## Troubleshooting

### Common Issues

**Coverage Below 80%:**
1. Check which files lack coverage
2. Add unit tests
3. Consider integration tests for complex paths

**Docker Build Failures:**
1. Check Dockerfile syntax
2. Verify base image availability
3. Review build logs for dependency issues

**Deployment Failures:**
1. Check SSH connectivity
2. Verify service health
3. Review deployment logs
4. Consider manual rollback

**Benchmark Regressions:**
1. Identify regressed metrics
2. Profile code changes
3. Review recent commits
4. Consider optimization or baseline update

### Debug Commands

```bash
# Local testing with act
act -j test

# Docker Compose local test
docker-compose up -d
docker-compose ps
docker-compose logs

# Health check
curl http://localhost:3000/health

# Metrics check
curl http://localhost:3000/metrics

# Manual benchmark
python src/platform/evaluation/citation_evaluation_benchmarks.py
```

## Future Enhancements

- [ ] E2E testing in staging
- [ ] Canary deployments
- [ ] Feature flags integration
- [ ] Multi-region deployment
- [ ] Custom Grafana dashboards
- [ ] Slack slash commands for deployment
- [ ] GitHub Apps for enhanced automation
- [ ] Cost optimization tracking
- [ ] SLA monitoring and alerting

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
