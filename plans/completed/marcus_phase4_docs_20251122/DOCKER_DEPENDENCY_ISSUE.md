# Docker Agent Dependency Issue [RESOLVED]

**Date:** November 22, 2025
**Issue:** Agent Docker image uses wrong requirements.txt file
**Resolution:** Fixed in commit f5c514c1 - agent now uses correct dependencies
**Severity:** HIGH - Missing critical dependencies for platform operation (FIXED)

---

## Problem

The `docker/Dockerfile.agent` currently copies and installs from the root `requirements.txt`, which contains dependencies for **MCP RAG servers**, not the **MARCUS platform agent**.

### Current State

**Dockerfile line 22:**
```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

**Installs (from root requirements.txt):**
- numpy, faiss-cpu, sentence-transformers, fastmcp
- anthropic, openai, tiktoken
- pandas, scikit-learn
- requests, beautifulsoup4
- python-dotenv, tqdm

**Missing (should be from src/platform/agents/requirements.txt):**
- ❌ `psycopg2-binary>=2.9.9` - PostgreSQL adapter (CRITICAL for DB access)
- ❌ `redis>=5.0.1` - Redis client (CRITICAL for caching/state)
- ❌ `colorlog>=6.8.0` - Better logging (nice-to-have)

---

## Fix Required

### Option 1: Use Platform Agent Requirements (Recommended)

Update Dockerfile to use the correct requirements file:

```dockerfile
# Before (line 22):
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# After:
COPY src/platform/agents/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

### Option 2: Install Both

If the agent needs both MCP RAG and platform dependencies:

```dockerfile
# Copy both requirements files
COPY requirements.txt ./requirements-mcp.txt
COPY src/platform/agents/requirements.txt ./requirements-agent.txt

# Install both
RUN pip install --no-cache-dir -r requirements-mcp.txt && \
    pip install --no-cache-dir -r requirements-agent.txt
```

---

## Impact

**Cannot test with current image:**
- ❌ Database operations (PostgreSQL connection)
- ❌ Redis caching/state coordination
- ❌ Platform agent core functionality

**Can still test:**
- ✅ Python runtime (3.11.14)
- ✅ Basic imports (numpy, anthropic)
- ✅ Container networking
- ✅ User permissions (marcus user)

---

## Rebuild Required

After fixing the Dockerfile:

```bash
# Fix the Dockerfile first
# Then rebuild (expect 10+ minute export phase)
sg docker -c "docker build -t marcus-citation-agent:v3.0.0 -f docker/Dockerfile.agent ."

# Tag old image for rollback if needed
sg docker -c "docker tag marcus-citation-agent:v3.0.0 marcus-citation-agent:v3.0.0-wrong-deps"
```

---

## ✅ Resolution Steps Completed

1. **✅ Documented issue** (this file)
2. **✅ Fixed Dockerfile** - Changed line 23 to use `src/platform/agents/requirements.txt`
3. **✅ Rebuilt agent image** - 629MB with correct dependencies
4. **✅ Rebuilt orchestrator** - Fresh build for consistency
5. **✅ Verified dependencies:**
   ```
   psycopg2-binary 2.9.11 ✅
   redis 7.1.0 ✅
   numpy 2.3.5 ✅
   colorlog 6.10.1 ✅
   ```
6. **✅ Committed fix** - Commit f5c514c1
7. **✅ Both images production-ready**

---

**Attribution:** 404GeneNotFound
**Discovered:** During image functionality testing (Nov 22, 2025)
**Resolved:** Same session - both images rebuilt with correct dependencies
