# Game Demo Deployment Guide

**Status:** ✅ DEPLOYED (Dec 5, 2025)
**URL:** http://34.32.105.178/game-dashboard-demo
**Server:** Next.js production server on port 3000, proxied through nginx

## Architecture

```
External Request (port 80)
    ↓
Nginx Reverse Proxy
    ↓
Next.js Server (localhost:3000)
    ↓
Game Dashboard Demo
```

## What Was Deployed

The game demo includes:
- **Scenario selection** (Baseline/Optimistic/Pessimistic)
- **Player actions** wired to GameSession
- **SimulationRunner** connects game to simulation engine
- **OutcomeScreen** with dramatic win/lose reveal
- **13/13 validation tests passing**

Code complete as of commits:
- `c9236be8` - feat: Complete playable game demo (Phases 1-4)
- `fd687f59` - feat: Phase 2 - Wire player actions to GameSession
- `cc95d5b2` - test: Add comprehensive game loop validation tests
- `da319bbe` - fix: Merge and finalize game demo deployment

## Deployment Steps Executed (Dec 5, 2025)

1. **Built Next.js app** - `npm run build` (successful)
2. **Started production server** - `npm start` on port 3000
3. **Verified nginx proxy** - Already configured to proxy port 80 → localhost:3000
4. **Created systemd service** - `/etc/systemd/system/nextjs-game-demo.service`
5. **Enabled auto-start** - Service will restart on boot and on failure
6. **Smoke tested** - Verified http://34.32.105.178/game-dashboard-demo returns 200 OK

## Systemd Service

The game server runs as a systemd service for persistence:

**Service file:** `/etc/systemd/system/nextjs-game-demo.service`

**Commands:**
```bash
# Check status
sudo systemctl status nextjs-game-demo

# Start/stop/restart
sudo systemctl start nextjs-game-demo
sudo systemctl stop nextjs-game-demo
sudo systemctl restart nextjs-game-demo

# View logs
tail -f logs/nextjs-server.log
tail -f logs/nextjs-server-error.log
```

## Manual Deployment (if needed)

If you need to redeploy manually:

```bash
# 1. Pull latest code
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
git pull origin main

# 2. Rebuild
npm run build

# 3. Restart service
sudo systemctl restart nextjs-game-demo

# 4. Verify
curl -I http://localhost:3000/game-dashboard-demo
```

## Nginx Configuration

Location: `/etc/nginx/sites-available/default` (or main config)

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

**Game not loading?**
1. Check Next.js server: `sudo systemctl status nextjs-game-demo`
2. Check nginx: `sudo systemctl status nginx`
3. Check logs: `tail -f logs/nextjs-server-error.log`
4. Test direct access: `curl -I http://localhost:3000/game-dashboard-demo`

**Port 3000 already in use?**
```bash
# Find process
lsof -i :3000

# Kill if needed
kill -9 <PID>

# Restart service
sudo systemctl restart nextjs-game-demo
```

## Next Steps

- [x] Deploy game demo code (COMPLETE)
- [ ] Add game demo to main navigation
- [ ] User documentation for playing the game
- [ ] Multiplayer coordination features (Phase 5)
