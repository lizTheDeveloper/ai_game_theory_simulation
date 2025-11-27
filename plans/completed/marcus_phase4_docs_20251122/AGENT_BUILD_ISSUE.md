# Python Agent Build Issue - Export Hang [RESOLVED]

**Date:** November 22, 2025
**Issue:** marcus-citation-agent:v3.0.0 build appeared to hang at "exporting layers"
**Resolution:** Build was NOT hung - export phase takes 7-8 minutes for Python base images (normal behavior)

---

## Problem Summary

The Python agent Docker build completes all build steps successfully (all layers CACHED), but appeared to **hang indefinitely during the export phase**:

```
#12 [8/8] RUN chown -R marcus:marcus /app
#12 CACHED

#13 exporting to image
#13 exporting layers
[hangs forever]
```

---

## Attempts Made

1. ✅ **Initial build** - Hung at export (20+ min)
2. ✅ **Docker cleanup** - Freed 5.657GB, disk 83% → 35%
3. ✅ **Orchestrator rebuild** - SUCCESS (proves Docker works)
4. ✅ **Docker daemon restart** - Still hangs at export
5. ✅ **Fresh build after restart** - Still hangs at export

---

## Root Cause Analysis

**Not a disk space issue** (26GB free, orchestrator built fine)
**Not a general Docker issue** (orchestrator builds successfully)
**Specific to agent image export** - Likely:

1. **Python base image layers** - Large layers in python:3.11-slim
2. **Docker buildkit issue** - Export optimization failing
3. **Storage driver problem** - overlay2 struggling with specific layer types
4. **Filesystem fragmentation** - After 83% disk usage

---

## Alternative Solutions

### Option 1: Use docker-compose (Recommended)

docker-compose may handle layer export differently:

```bash
sg docker -c "docker-compose build citation-agent"
```

### Option 2: Build with Legacy Builder

Disable buildkit and use legacy builder:

```bash
DOCKER_BUILDKIT=0 sg docker -c "docker build -t marcus-citation-agent:v3.0.0 -f docker/Dockerfile.agent ."
```

### Option 3: Simplify Dockerfile

Remove the final chown step (may be causing export issues):

```dockerfile
# Comment out or remove:
# RUN chown -R marcus:marcus /app
```

Then rebuild.

### Option 4: Build on Different Machine

Build the image on a machine with:
- More disk space
- Different Docker version
- Different storage driver

Then export/import:

```bash
# On other machine:
docker save marcus-citation-agent:v3.0.0 | gzip > agent.tar.gz

# On this VM:
gunzip -c agent.tar.gz | docker load
```

### Option 5: Use Multi-Stage Build

Split into smaller stages to avoid large layer export:

```dockerfile
FROM python:3.11-slim as builder
# ... build steps ...

FROM python:3.11-slim as runtime
COPY --from=builder /app /app
# ... runtime setup ...
```

---

## Immediate Next Steps

**Try docker-compose first** (most likely to work):

```bash
# Check docker-compose.yml configuration
cat docker-compose.yml

# Build via compose
sg docker -c "docker-compose build citation-agent"
```

**If compose fails, try legacy builder**:

```bash
DOCKER_BUILDKIT=0 sg docker -c "docker build -t marcus-citation-agent:v3.0.0 -f docker/Dockerfile.agent ."
```

---

## Current Status

✅ **marcus-orchestrator:v3.0.0** - Built and ready (c2e1a67323ec, 3.51GB)
✅ **marcus-citation-agent:v3.0.0** - Built and ready (23bac8534b98, 12.8GB)
✅ **Dockerfiles** - Fixed and committed (84d76740)
✅ **Docker daemon** - Restarted and healthy
✅ **Disk space** - 35% used (26GB free)

---

## ✅ Resolution

**What Actually Happened:**

The build was **NOT hanging** - it was completing successfully, just taking a long time:

```
#13 exporting layers 464.5s done     # 7.7 minutes - NORMAL for Python images
#13 unpacking to docker.io/library/marcus-citation-agent:v3.0.0 121.2s done  # 2 minutes
#13 DONE 585.9s  # Total: ~10 minutes
```

**Key Insights:**

1. **Python base images have many layers** - python:3.11-slim + dependencies = large image
2. **Export phase is CPU/IO intensive** - Docker compresses and writes layers to disk
3. **10 minutes is normal** for a 12.8GB uncompressed / 4.48GB compressed image
4. **Patience required** - No progress indicator during export can look like a hang

**Lessons Learned:**

- Don't assume hang without waiting 10-15 minutes for large Python images
- Check logs after completion to see actual timing (export layers shows duration)
- Docker cleanup + daemon restart didn't change timing (expected behavior)

**Both images now ready for Phase 4 testing.**

---

**Attribution:** 404GeneNotFound
