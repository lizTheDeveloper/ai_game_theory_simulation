# Correct SSH Tunnel Command

**Use this command to access all services from your Mac:**

```bash
gcloud compute ssh g7throwawayplz@marcus-test-vm-e2 \
    --zone=us-west1-c \
    -- -L 4000:localhost:4000 \
       -L 5000:localhost:5000 \
       -L 9090:localhost:9090
```

## What this does:

| Your Mac | → | VM Service |
|----------|---|------------|
| localhost:4000 | → | Game Simulation Dashboard |
| localhost:5000 | → | Grafana (5 monitoring dashboards) |
| localhost:9090 | → | Prometheus (raw metrics) |

## Access URLs (on your Mac):

```
🎮 Game Simulation:     http://localhost:4000
📊 Grafana Dashboards:  http://localhost:5000  (login: admin/admin)
📈 Prometheus:          http://localhost:9090
```

## What was wrong before:

Your old command had:
```bash
-L 9090:localhost:5000 -L 9090:localhost:9090
#    ^^^^              #    ^^^^
# Both trying to use local port 9090 = CONFLICT!
```

The first one succeeded (Grafana), the second failed (Prometheus), so:
- ✅ localhost:9090 showed Grafana (confusing!)
- ❌ Prometheus was unreachable
- ❌ localhost:5000 was empty (no tunnel)

## Alternative: Use different local ports

If you prefer different port numbers locally:

```bash
gcloud compute ssh g7throwawayplz@marcus-test-vm-e2 \
    --zone=us-west1-c \
    -- -L 4000:localhost:4000 \
       -L 3000:localhost:5000 \
       -L 9090:localhost:9090
```

Then access:
- Game Simulation: localhost:4000
- Grafana: localhost:**3000** (different from remote)
- Prometheus: localhost:9090

## Quick Test

After connecting with the correct command, verify all services:

```bash
# On your Mac:
curl http://localhost:4000  # Should return game simulation HTML
curl http://localhost:5000/api/health  # Should return Grafana health JSON
curl http://localhost:9090/-/healthy  # Should return "Prometheus is Healthy."
```

## Port Mapping Reference

**ON THE VM (actual services):**
- Port 4000: Game Simulation
- Port 5000: Grafana
- Port 9090: Prometheus

**ON YOUR MAC (after tunnel):**
- Port 4000 → VM:4000 (Game Simulation)
- Port 5000 → VM:5000 (Grafana)
- Port 9090 → VM:9090 (Prometheus)

Same ports on both sides = less confusion!
