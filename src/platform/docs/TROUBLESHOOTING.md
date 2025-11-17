# MARCUS 3.0 - Troubleshooting Guide

## Common Issues

### CI/CD Issues

#### Tests Failing

**Issue: Python tests fail with import errors**

**Error:**
```
ImportError: No module named 'psycopg2'
```

**Solution:**
```bash
# Install dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.9+

# Verify PYTHONPATH
export PYTHONPATH=$(pwd)/src
pytest src/platform/tests/
```

**Issue: TypeScript tests fail with module not found**

**Error:**
```
Cannot find module '@/platform/...'
```

**Solution:**
```bash
# Install dependencies
npm ci

# Check tsconfig.json paths
# Verify node_modules installed
ls node_modules/

# Run TypeScript compilation
npx tsc --noEmit
```

#### Coverage Below Threshold

**Issue: Coverage report shows <80%**

**Solution:**
```bash
# Check which files lack coverage
pytest --cov=src/platform --cov-report=term-missing

# Add unit tests for uncovered lines
# Focus on critical paths first

# Re-run coverage
pytest --cov=src/platform --cov-report=html
open htmlcov/index.html
```

#### Linting Failures

**Issue: Black formatting check fails**

**Solution:**
```bash
# Auto-fix formatting
black src/platform/

# Check again
black --check src/platform/
```

**Issue: ESLint errors**

**Solution:**
```bash
# Auto-fix ESLint issues
npx eslint src/platform/**/*.ts --fix

# Check again
npx eslint src/platform/**/*.ts
```

#### Docker Build Failures

**Issue: Docker build fails with dependency errors**

**Error:**
```
ERROR: Could not find a version that satisfies the requirement
```

**Solution:**
```bash
# Update requirements.txt versions
pip install --upgrade pip
pip install -r requirements.txt

# Check base image
docker pull python:3.11-slim

# Build with no cache
docker build --no-cache -f docker/Dockerfile.agent .
```

**Issue: Multi-platform build fails**

**Solution:**
```bash
# Set up buildx
docker buildx create --use

# Verify platforms
docker buildx inspect --bootstrap

# Build single platform for testing
docker build --platform linux/amd64 -f docker/Dockerfile.agent .
```

### Deployment Issues

#### Health Checks Failing

**Issue: /health endpoint returns 503**

**Check database:**
```bash
docker-compose exec postgres pg_isready
docker-compose exec postgres psql -U marcus -d citation_integrity -c "SELECT 1;"
```

**Check Redis:**
```bash
docker-compose exec redis redis-cli ping
docker-compose exec redis redis-cli INFO
```

**Check orchestrator logs:**
```bash
docker-compose logs orchestrator
```

**Solution:**
```bash
# Restart services
docker-compose restart postgres redis
docker-compose restart orchestrator

# Check connections
docker-compose exec orchestrator curl http://localhost:3000/health
```

#### SSH Deployment Fails

**Issue: SSH connection refused**

**Solution:**
```bash
# Verify SSH key
ssh -i ~/.ssh/deploy_key marcus@server-host

# Check SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/deploy_key

# Verify host in known_hosts
ssh-keyscan server-host >> ~/.ssh/known_hosts
```

#### Blue-Green Deployment Issues

**Issue: Traffic switch fails**

**Check load balancer:**
```bash
# Verify nginx/haproxy config
nginx -t
service nginx status

# Check backend health
curl http://localhost:3000/health  # blue
curl http://localhost:3001/health  # green
```

**Solution:**
```bash
# Manually switch traffic
./switch-traffic.sh green

# Verify routing
curl -I https://marcus.example.com
```

### Runtime Issues

#### High Latency

**Symptoms:**
- p95 latency >200ms
- Slow response times
- Timeout errors

**Diagnosis:**
```bash
# Check system resources
docker stats

# Check database queries
docker-compose exec postgres psql -U marcus -c "
SELECT pid, query, state, wait_event, state_change
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY state_change;
"

# Check Redis performance
docker-compose exec redis redis-cli --latency

# Profile Python agent
py-spy top --pid $(pgrep -f citation_integrity_agent)
```

**Solutions:**

1. **Scale agents:**
```bash
docker-compose up -d --scale citation-agent=10
```

2. **Optimize database:**
```bash
# Add indexes
docker-compose exec postgres psql -U marcus -d citation_integrity -c "
CREATE INDEX idx_agent_timestamp ON agent_states(timestamp DESC);
"

# Vacuum database
docker-compose exec postgres psql -U marcus -d citation_integrity -c "VACUUM ANALYZE;"
```

3. **Increase Redis cache:**
```bash
docker-compose exec redis redis-cli CONFIG SET maxmemory 1gb
```

#### Memory Leaks

**Symptoms:**
- Memory usage grows over time
- OOM errors
- Container restarts

**Diagnosis:**
```bash
# Monitor memory over time
docker stats --no-stream

# Python memory profiling
mprof run src/platform/agents/citation_integrity_agent.py
mprof plot

# Check for memory leaks
docker-compose exec orchestrator node --expose-gc --inspect=0.0.0.0:9229
```

**Solutions:**

1. **Increase memory limits:**
```yaml
# docker-compose.yml
services:
  citation-agent:
    deploy:
      resources:
        limits:
          memory: 1G
```

2. **Fix memory leaks:**
```python
# Clear old memories
def consolidate_memory(self):
    # Keep only recent memories
    if len(self.recent_memory) > 100:
        self.recent_memory = self.recent_memory[-100:]
```

#### Database Connection Pool Exhausted

**Symptoms:**
- "too many connections" errors
- Connection timeouts

**Diagnosis:**
```bash
# Check current connections
docker-compose exec postgres psql -U marcus -c "
SELECT COUNT(*) FROM pg_stat_activity;
"

# Check connection limits
docker-compose exec postgres psql -U marcus -c "
SHOW max_connections;
"
```

**Solutions:**

1. **Terminate idle connections:**
```bash
docker-compose exec postgres psql -U marcus -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '5 minutes';
"
```

2. **Increase pool size:**
```bash
# .env
POSTGRES_POOL_SIZE=50
```

3. **Increase max connections:**
```bash
# PostgreSQL config
docker-compose exec postgres psql -U marcus -c "
ALTER SYSTEM SET max_connections = 200;
"
docker-compose restart postgres
```

### Benchmark Issues

#### Benchmark Regression

**Issue: Performance regression detected**

**Analysis:**
```bash
# View detailed comparison
cat benchmarks/comparison.json | jq .

# Check recent commits
git log --oneline -10

# Profile specific changes
git bisect start
git bisect bad HEAD
git bisect good {last-good-commit}
# Run benchmarks at each step
```

**Solutions:**

1. **Optimize bottlenecks:**
```bash
# Profile code
py-spy record -o profile.svg -- python src/platform/evaluation/citation_evaluation_benchmarks.py

# Review flame graph
open profile.svg
```

2. **Update baseline if improvement:**
```bash
# If regression is intentional (e.g., added features)
cp benchmarks/results.json benchmarks/baseline.json
git add benchmarks/baseline.json
git commit -m "chore: Update benchmark baseline"
```

#### Benchmark Timeout

**Issue: Benchmark runs timeout**

**Solution:**
```bash
# Increase timeout in workflow
# .github/workflows/marcus-benchmark.yml
timeout-minutes: 120

# Reduce dataset size for faster iteration
# src/platform/evaluation/generate_benchmark_datasets.py
DATASET_SIZE = 100  # instead of 1000
```

### Security Issues

#### Trivy Security Scan Failures

**Issue: Critical vulnerabilities detected**

**Analysis:**
```bash
# Run local scan
trivy image ghcr.io/your-org/marcus-agent:latest

# Check specific CVE
trivy image --severity CRITICAL ghcr.io/your-org/marcus-agent:latest
```

**Solutions:**

1. **Update dependencies:**
```bash
# Python
pip install --upgrade package-name

# Node
npm update package-name

# Rebuild images
docker-compose build --no-cache
```

2. **Ignore false positives:**
```yaml
# .trivyignore
CVE-2024-12345  # False positive - not applicable
```

#### Secret Detection

**Issue: Trufflehog detects secrets in code**

**Solution:**
```bash
# Remove secrets from code
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret" \
  --prune-empty --tag-name-filter cat -- --all

# Rotate exposed secrets immediately
# Update in GitHub Secrets
# Update in deployment environments

# Add to .gitignore
echo "secrets/" >> .gitignore
echo ".env" >> .gitignore
```

## Getting Help

### Debug Logs

**Enable debug logging:**
```bash
# Python
export LOG_LEVEL=DEBUG
python src/platform/agents/citation_integrity_agent.py

# TypeScript
export NODE_ENV=development
export DEBUG=*
npx tsx src/platform/integration/citationAgentIntegration.ts

# Docker
docker-compose logs -f --tail=100 orchestrator
docker-compose logs -f --tail=100 citation-agent
```

### Health Check Commands

```bash
# Orchestrator
curl http://localhost:3000/health

# Metrics
curl http://localhost:3000/metrics

# Agent status
curl http://localhost:3000/api/agents/status

# Database
docker-compose exec postgres pg_isready

# Redis
docker-compose exec redis redis-cli ping
```

### Performance Profiling

```bash
# Python CPU profiling
py-spy record -o cpu-profile.svg -- python src/platform/agents/citation_integrity_agent.py

# Python memory profiling
mprof run src/platform/agents/citation_integrity_agent.py
mprof plot

# TypeScript profiling
node --inspect src/platform/integration/citationAgentIntegration.ts
# Open chrome://inspect in Chrome
```

### Contact Support

**Issues:**
- GitHub Issues: https://github.com/your-org/ai_game_theory_simulation/issues
- Priority: Tag with `bug`, `ci-cd`, `deployment`, or `performance`

**Emergency:**
- On-call: [Phone number]
- Slack: #marcus-platform
- Email: marcus@platform.engineering

## Appendix: Useful Commands

```bash
# Full system restart
docker-compose down -v
docker-compose up -d
docker-compose ps

# Clear all data
docker-compose down -v
docker volume prune -f

# Check Docker logs
docker-compose logs -f

# SSH to running container
docker-compose exec orchestrator bash
docker-compose exec citation-agent bash

# Database queries
docker-compose exec postgres psql -U marcus -d citation_integrity

# Redis commands
docker-compose exec redis redis-cli

# Rebuild specific service
docker-compose build --no-cache orchestrator
docker-compose up -d orchestrator

# Scale agents
docker-compose up -d --scale citation-agent=5
```
