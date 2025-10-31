# Remote Development Setup Guide

This guide explains how to set up the development environment on a remote VM (like the GCloud `remote-claude` instance).

## Quick Start

### 1. SSH into the VM

```bash
remote-claude
```

Or manually:
```bash
gcloud compute ssh claude-workspace --zone=europe-west10-a --project=multiverseschool
```

### 2. Clone the repository

```bash
cd ~
git clone git@github.com:lizTheDeveloper/ai_game_theory_simulation.git
cd ai_game_theory_simulation
```

Or use HTTPS:
```bash
git clone https://github.com/lizTheDeveloper/ai_game_theory_simulation.git
cd ai_game_theory_simulation
```

### 3. Run the install script

```bash
./install-remote.sh
```

This will:
- Install Node.js (LTS)
- Install Python 3.11
- Install Git
- Install Claude Code globally
- Create Python virtual environment (`.venv`)
- Install all dependencies (Python + Node.js)
- Generate MCP config with correct paths
- Build the project

### 4. Start developing

```bash
# Activate Python environment
source .venv/bin/activate

# Start dev server
npm run dev
```

Or use the helper script:
```bash
./start-dev.sh
```

## MCP Configuration

The install script automatically generates `.claude/mcp-config.json` with paths specific to your machine. This config is **project-local** and Claude Code will automatically detect it.

### Manual MCP Config Update

If you need to regenerate the config:

```bash
./setup-mcp-config.sh
```

This creates configs for:
- **ai-safety-transcripts**: YouTube transcript RAG search
- **pdf-rag**: PDF research paper RAG search
- **agent-memory**: Agent memory persistence system
- **chatroom**: Multi-agent coordination channels
- **playwright**: Browser automation for web scraping

## Eco-Friendly VM Management

### Stop the VM when not in use

```bash
# From your local machine (NOT from inside the VM)
gcloud compute instances stop claude-workspace --zone=europe-west10-a --project=multiverseschool
```

This saves ~$30/month and reduces carbon footprint!

### Start the VM when needed

```bash
gcloud compute instances start claude-workspace --zone=europe-west10-a --project=multiverseschool
```

### Check VM status

```bash
gcloud compute instances list --project=multiverseschool --filter="name=claude-workspace"
```

## Installed Tools

After running `install-remote.sh`, you'll have:

- **Node.js** (LTS): JavaScript runtime
- **npm**: Node package manager
- **Python 3.11**: Python runtime
- **pip**: Python package manager
- **Git**: Version control
- **Claude Code**: AI coding assistant
- **Virtual environment** (`.venv`): Isolated Python environment

## Running Simulations

```bash
# Monte Carlo simulation (runs in background)
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Check simulation progress
tail -f logs/mc_*.log
```

## Troubleshooting

### Python virtual environment not activated

```bash
source .venv/bin/activate
```

You should see `(.venv)` in your prompt.

### MCP servers not working

Regenerate the config:
```bash
./setup-mcp-config.sh
```

### Build errors

Try cleaning and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git authentication issues

Set up SSH keys or use personal access token:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/keys
cat ~/.ssh/id_ed25519.pub
```

## VM Specs

- **Name**: `claude-workspace`
- **Zone**: `europe-west10-a` (Berlin)
- **Machine type**: `e2-medium` (2 vCPUs, 4GB RAM)
- **Disk**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

## Cost Optimization

Running costs (~$30/month if left on 24/7):
- **Stop when not in use**: ~$2/month (storage only)
- **Delete when done**: $0/month (but you lose the setup)

**Recommendation**: Stop when not in use, restart when needed.
