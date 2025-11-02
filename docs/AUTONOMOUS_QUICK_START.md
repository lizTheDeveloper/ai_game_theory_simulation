# Autonomous Claude Worker - Quick Start

## Status

✅ ACTIVE - Worker running every 30 minutes on GCloud VM (Berlin)

## Quick Commands

### SSH to VM
```bash
remote-claude
```

### Check Worker Status
```bash
sudo systemctl status claude-worker.timer
sudo journalctl -u claude-worker.service -n 50 --no-pager
```

### View Logs
```bash
tail -f ~/ai_game_theory_simulation/logs/autonomous/worker_*.log
```

### Stop/Start VM (Eco-Friendly!)
```bash
# Stop VM (save $28/month!)
gcloud compute instances stop claude-workspace --zone=europe-west10-a --project=multiverseschool

# Start VM
gcloud compute instances start claude-workspace --zone=europe-west10-a --project=multiverseschool
```

## How It Works

1. Timer triggers every 30 minutes
2. Worker pulls latest code
3. Claude reads roadmap
4. Works on highest priority items
5. Commits and pushes completed work
6. Logs everything to `logs/autonomous/`

## Files

- `autonomous-worker.sh` - Main script
- `.env` - API key (not committed)
- `/etc/systemd/system/claude-worker.{service,timer}` - Systemd files

## Troubleshooting

Manual test:
```bash
cd ~/ai_game_theory_simulation
./autonomous-worker.sh
```

Check API key:
```bash
cat ~/ai_game_theory_simulation/.env
```

View full systemd logs:
```bash
sudo journalctl -u claude-worker.service --no-pager
```
