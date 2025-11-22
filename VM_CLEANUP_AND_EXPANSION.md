# VM Cleanup and Expansion Guide

**Date:** November 22, 2025
**VM:** Google Cloud Compute Engine
**Initial State:** 28GB used / 39GB total (73% full)
**After Cleanup:** 19GB used / 39GB total (48% full)
**Space Freed:** ~9GB

---

## Quick Cleanup Commands

### Docker Cleanup (Frees 5-9GB)

```bash
# Remove all unused Docker resources
sg docker -c "docker system prune -a -f --volumes"

# Check space reclaimed
df -h /
```

### Log Cleanup (Frees 100-500MB)

```bash
# Clean journal logs older than 7 days
sudo journalctl --vacuum-time=7d

# Remove old compressed logs
sudo find /var/log -type f \( -name "*.log.*" -o -name "*.gz" \) -delete
```

### Package Cache Cleanup

```bash
# Clean APT cache
sudo apt-get clean -y
```

---

## Google Cloud VM Expansion

### Option 1: Expand Disk (Recommended)

**Via Console:**
1. Go to: [Compute Engine → Disks](https://console.cloud.google.com/compute/disks)
2. Find your VM's boot disk (same name as VM)
3. Click **EDIT** → Change **Size** to 100GB → **SAVE**
4. On VM, resize filesystem:

```bash
sudo growpart /dev/sda 1
sudo resize2fs /dev/sda1
df -h /  # Verify new size
```

**Cost:** ~$0.04/GB/month (100GB = ~$4/month)

### Option 2: Upgrade Machine Type

**Via Console:**
1. **Stop VM**: Compute Engine → VM instances → Stop
2. Click VM name → **EDIT**
3. Change **Machine type** (e.g., e2-standard-4 → e2-standard-8)
4. **SAVE** → **START**

**Cost Comparison (us-central1):**
- e2-standard-2 (2 vCPU, 8GB RAM): ~$49/month
- e2-standard-4 (4 vCPU, 16GB RAM): ~$97/month
- e2-standard-8 (8 vCPU, 32GB RAM): ~$194/month

---

## What Gets Cleaned

### Docker Resources
- Old/unused Docker images (multiple versions, duplicates)
- Stopped containers
- Build cache layers
- Unused volumes
- Dangling images

### System Logs
- Old journal entries (systemd logs)
- Compressed log archives (*.log.*, *.gz)
- Large syslog/auth.log files

### Package Caches
- APT package cache (/var/cache/apt/archives)

---

## When to Expand

**Expand disk when:**
- Less than 20% free space remaining
- Frequent "disk full" errors
- Need more storage for databases/logs

**Upgrade machine type when:**
- High CPU usage (>80% sustained)
- Out of memory errors
- Slow performance on CPU-intensive tasks

---

## Maintenance Schedule

**Weekly:**
```bash
# Quick Docker cleanup
sg docker -c "docker system prune -f"
```

**Monthly:**
```bash
# Full cleanup
sg docker -c "docker system prune -a -f --volumes"
sudo journalctl --vacuum-time=30d
sudo apt-get clean -y
```

**Monitor disk usage:**
```bash
df -h /
sg docker -c "docker system df"
```

---

## Session Results (Nov 22, 2025)

**Cleaned:**
- ✅ Removed old Docker images: marcus-citation-agent v3.0.0, v3.0.1
- ✅ Removed duplicate orchestrator image
- ✅ Removed monitoring stack images (Grafana, Prometheus, Loki, Jaeger)
- ✅ Cleared 4.8GB build cache
- ✅ Removed unused volumes
- ✅ Cleaned compressed log files

**Final State:**
- Docker images: 0 (all clean - rebuild as needed)
- Available space: 21GB (53% free)
- Ready for Phase 5 development

**Attribution:** 404GeneNotFound
**Reference:** Docker port configuration documented in `DOCKER_PORT_CONFIGURATION.md`
