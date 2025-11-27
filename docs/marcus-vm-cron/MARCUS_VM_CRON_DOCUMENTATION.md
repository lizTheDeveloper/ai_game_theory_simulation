---

# ⚠️ IMPORTANT: Marcus VM Cron Persistence System

**This documentation is for VM session persistence, NOT the Marcus 3.0 Platform**

| System | Purpose |
|--------|---------|
| ✅ **Marcus VM Cron** (This) | VM session persistence, auto-commits, cron jobs, tmux workspace |
| ❌ **Marcus 3.0 Platform** (Different) | Citation integrity platform, Python agents, PostgreSQL, API |

**You are reading:** Marcus VM Cron Persistence System documentation  
**If you need:** Marcus 3.0 Platform, see `/home/404GeneNotFound/ai_game_theory_simulation/src/platform/`

---

# MARCUS Persistence System - Complete Documentation

## Overview

The MARCUS (Multi-Agent Recursive Code Understanding System) Persistence System is an advanced workflow automation framework that prevents work loss in VM environments by combining:

- **Automated git operations** (commits, stashes, backups)
- **SSH keep-alive** to prevent disconnections
- **Persistent tmux sessions** that survive disconnects
- **Intelligent git hooks** for safety and automation
- **Comprehensive recovery options**

## Features

### 🔄 Automated Backups
- Auto-commits every 30 minutes
- Stash backups every 15 minutes
- Automatic backup branches before pushes
- Tagged backups for easy recovery

### 🛡️ Safety Features
- Pre-commit checks for debug code & sensitive data
- Large file detection (>10MB warning)
- Backup before destructive operations
- Intelligent stash management (keeps last 30)

### 🚀 Enhanced Workflow
- Persistent tmux workspace with 5 pre-configured windows
- Smart git hooks that automate common tasks
- Comprehensive CLI with intuitive aliases
- Project-specific configuration

### 📊 Monitoring & Recovery
- Detailed logging of all operations
- Easy access to commit history
- Multiple recovery mechanisms
- System status at a glance

## Installation

### Quick Start

```bash
# Download and run the setup script
chmod +x marcus-persistence-setup.sh
./marcus-persistence-setup.sh

# Reload your shell
source ~/.bashrc

# Initialize your project (optional)
cd ~/your-project
m-init

# Start working
marcus
```

### What Gets Installed

```
~/.marcus/
├── scripts/
│   ├── auto-commit.sh           # Automated commit script
│   ├── git-stash-backup.sh      # Stash backup system
│   ├── tmux-marcus.sh           # Tmux session manager
│   ├── init-project.sh          # Project initialization
│   └── setup-cron.sh            # Cron job installer
├── hooks/
│   ├── pre-commit               # Pre-commit safety checks
│   ├── post-commit              # Post-commit logging
│   ├── pre-push                 # Backup before push
│   ├── post-merge               # Dependency check alerts
│   └── install-hooks.sh         # Hook installer
├── config/
│   └── marcus.conf              # Configuration file
└── logs/
    ├── auto-commit.log          # Auto-commit history
    ├── git-stash.log            # Stash operation log
    ├── commits.log              # Commit tracking
    ├── merges.log               # Merge history
    └── keepalive.log            # Connection keepalive
```

## Configuration

Edit `~/.marcus/config/marcus.conf` to customize:

```bash
# Project directory
MARCUS_PROJECT_DIR="$HOME/projects"

# Commit settings
MARCUS_COMMIT_PREFIX="auto-save"
MARCUS_MAX_COMMIT_SIZE_MB=50

# Auto-commit intervals (minutes)
MARCUS_AUTOCOMMIT_INTERVAL=30
MARCUS_STASH_INTERVAL=15

# Features
MARCUS_AUTO_PUSH=false           # Set to true for auto-push
MARCUS_CREATE_TAGS=true          # Create backup tags
MARCUS_BACKUP_BRANCHES=true      # Create backup branches
```

## Commands Reference

### Core Commands

| Command | Description |
|---------|-------------|
| `marcus` | Start persistent tmux workspace |
| `m-save` | Manual auto-commit now |
| `m-info` | Show system status & statistics |
| `m-logs` | View log directory |
| `m-status` | View recent auto-commit activity |

### Git Operations

| Command | Description | Example |
|---------|-------------|---------|
| `m-commit <msg>` | Quick commit with message | `m-commit "Added feature X"` |
| `m-wip <note>` | Save work in progress | `m-wip "testing new approach"` |
| `m-push` | Push current branch to origin | `m-push` |
| `m-pull` | Pull current branch from origin | `m-pull` |

### Stash Management

| Command | Description | Example |
|---------|-------------|---------|
| `m-stash-save <msg>` | Create named stash | `m-stash-save "before refactor"` |
| `m-stash-pop` | Restore latest stash | `m-stash-pop` |
| `m-stash-list` | List all stashes | `m-stash-list` |
| `m-unstash <n>` | Apply specific stash | `m-unstash 2` |
| `m-backup` | Create backup stash | `m-backup` |

### Project Management

| Command | Description | Example |
|---------|-------------|---------|
| `m-init` | Initialize Marcus in project | `cd my-project && m-init` |
| `m-recover` | Show all recovery options | `m-recover` |

### Git Aliases

| Alias | Command | Description |
|-------|---------|-------------|
| `gst` | `git status -sb` | Short git status |
| `glog` | `git log --oneline --graph -20` | Pretty log graph |
| `gstash` | `git stash list` | List stashes |
| `gtags` | `git tag -l \| tail -20` | Recent tags |

## Workflows

### Daily Workflow

```bash
# Morning: Start your session
marcus

# Work continues automatically with:
# - Auto-commits every 30 minutes
# - Stash backups every 15 minutes
# - Connection keep-alive

# Manual save at any time
m-save

# Quick commit when you reach a milestone
m-commit "Completed user authentication"

# Check what's been saved
m-info

# Evening: Just detach (work persists)
# Press: Ctrl+b d
```

### Disconnection Recovery

```bash
# If you get disconnected, simply reconnect and:
marcus  # Reattaches to existing session

# All your work is there:
# - Your tmux session is still running
# - Recent work is auto-committed
# - Additional stashes available
```

### Project Initialization

```bash
# Initialize a new project with Marcus
cd ~/new-project
m-init

# This sets up:
# ✓ Git repository
# ✓ Marcus hooks
# ✓ .gitignore
# ✓ Initial commit
# ✓ Environment configuration
```

### Recovery Scenarios

#### Lost Changes?

```bash
# View recovery options
m-recover

# This shows:
# 1. Recent commits (last 10)
# 2. Available stashes
# 3. Backup branches
# 4. Auto-backup tags

# Restore from stash
m-stash-list           # Find the stash you need
m-unstash 3            # Restore stash #3

# Or restore from auto-commit
glog                   # Find commit hash
git cherry-pick <hash> # Restore specific commit
```

#### Accidentally Committed Wrong Code?

```bash
# Undo last commit (keep changes)
git reset HEAD~1

# Or view reflog to find any state
git reflog
git reset --hard <hash>
```

#### Need to Go Back in Time?

```bash
# View backup tags
gtags | grep auto-backup

# Checkout a backup
git checkout auto-backup-20240521-143000

# Or create a recovery branch
git checkout -b recovery-branch <backup-tag>
```

## Git Hooks Explained

### Pre-Commit Hook

**Runs:** Before each commit

**Checks:**
- Debug statements (`console.log`, `debugger`, `pdb.set_trace`)
- Large files (>10MB)
- Sensitive data patterns (`password`, `api_key`, `secret`, `token`)

**Action:** Prompts for confirmation if issues found

### Post-Commit Hook

**Runs:** After successful commit

**Actions:**
- Logs commit details
- Suggests tagging for important commits (release, version, milestone)

### Pre-Push Hook

**Runs:** Before pushing to remote

**Actions:**
- Creates automatic backup branch (`backup/<branch>-<timestamp>`)
- Warns when pushing to main/master
- Shows unpushed commit count

### Post-Merge Hook

**Runs:** After merge completion

**Actions:**
- Detects `package.json` changes → suggests `npm install`
- Detects `requirements.txt` changes → suggests `pip install`
- Logs merge operation

## Tmux Workspace Layout

When you run `marcus`, you get a 5-window workspace:

```
Window 1 (main):    Main workspace with git status
Window 2 (code):    Code editor area
Window 3 (git):     Git operations and history
Window 4 (logs):    Real-time log monitoring
Window 5 (test):    Testing and experimental area
```

### Tmux Commands

| Command | Action |
|---------|--------|
| `Ctrl+b d` | Detach (session continues) |
| `Ctrl+b c` | New window |
| `Ctrl+b n` | Next window |
| `Ctrl+b p` | Previous window |
| `Ctrl+b 1-5` | Switch to window 1-5 |
| `Ctrl+b [` | Scroll mode (q to exit) |
| `Ctrl+b "` | Split horizontally |
| `Ctrl+b %` | Split vertically |

## Cron Jobs

The system sets up these automated tasks:

| Frequency | Task | Purpose |
|-----------|------|---------|
| Every 30 min | Auto-commit | Save current work |
| Every 15 min | Stash backup | Create recovery point |
| Every 5 min | Keep-alive | Prevent disconnection |
| Daily 3 AM | Log cleanup | Remove old logs (>7 days) |
| Weekly | Tag cleanup | Remove old backup tags (keep 50) |

### Managing Cron Jobs

```bash
# View current cron jobs
crontab -l

# Edit cron jobs
crontab -e

# Reinstall Marcus cron jobs
~/.marcus/scripts/setup-cron.sh

# View cron logs
tail -f ~/.marcus/logs/cron-autocommit.log
```

## Monitoring

### System Status

```bash
m-info
```

Shows:
- Current project and branch
- Uncommitted changes count
- Number of stashes
- Most recent tag
- Last auto-commit time

### Log Monitoring

```bash
# Watch auto-commits in real-time
tail -f ~/.marcus/logs/auto-commit.log

# View recent activity
m-status

# All logs location
m-logs
```

## Troubleshooting

### Auto-commits not running

```bash
# Check cron is running
crontab -l | grep MARCUS

# Check logs for errors
cat ~/.marcus/logs/cron-autocommit.log

# Manually test auto-commit
~/.marcus/scripts/auto-commit.sh
```

### Tmux session issues

```bash
# List all sessions
tmux ls

# Kill stuck session
tmux kill-session -t marcus

# Create fresh session
marcus
```

### Git hooks not working

```bash
# Reinstall hooks
cd your-project
~/.marcus/hooks/install-hooks.sh

# Check hooks are executable
ls -l .git/hooks/
```

### Too many auto-commits

Edit `~/.marcus/config/marcus.conf`:
```bash
MARCUS_AUTOCOMMIT_INTERVAL=60  # Change to 60 minutes
```

Then reinstall cron:
```bash
~/.marcus/scripts/setup-cron.sh
```

## Advanced Usage

### Custom Project Configuration

Create `.marcus` file in project root:

```bash
# Project-specific Marcus config
MARCUS_COMMIT_PREFIX="myproject"
MARCUS_AUTOCOMMIT_INTERVAL=20
MARCUS_AUTO_PUSH=true
```

### Multiple Projects

```bash
# Set different project directories
export MARCUS_PROJECT_DIR="/path/to/project1"
m-save  # Saves project1

export MARCUS_PROJECT_DIR="/path/to/project2"
m-save  # Saves project2
```

### Integration with CI/CD

Exclude Marcus auto-commits from CI:

```yaml
# .github/workflows/ci.yml
on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]
jobs:
  build:
    if: "!contains(github.event.head_commit.message, 'auto-save:')"
```

### Custom Hooks

Add your own hooks to `~/.marcus/hooks/`:

```bash
#!/bin/bash
# ~/.marcus/hooks/pre-commit-custom

# Your custom checks
echo "Running custom checks..."
```

Then source it from the main pre-commit:
```bash
# In ~/.marcus/hooks/pre-commit
if [ -f ~/.marcus/hooks/pre-commit-custom ]; then
    source ~/.marcus/hooks/pre-commit-custom
fi
```

## Best Practices

1. **Commit Frequently**: Use `m-wip` for work-in-progress states
2. **Meaningful Messages**: Use `m-commit` with descriptive messages for milestones
3. **Check Status**: Run `m-info` regularly to monitor system
4. **Use Stashes**: Before major refactoring, create a named stash
5. **Tag Important Points**: Use git tags for releases and major milestones
6. **Monitor Logs**: Occasionally check logs for issues
7. **Clean Up**: Periodically clean old stashes and backup branches
8. **Backup Remote**: Enable `MARCUS_AUTO_PUSH=true` for critical projects

## Security Considerations

- **Sensitive Data**: Pre-commit hooks check for common sensitive patterns
- **Large Files**: Warnings for files >10MB
- **Git History**: Auto-commits are local by default (no auto-push)
- **SSH Keys**: Keep-alive uses standard SSH configuration
- **Permissions**: All scripts are user-only (chmod 700)

## Uninstallation

If you need to remove Marcus:

```bash
# Remove cron jobs
crontab -l | grep -v "MARCUS:" | crontab -

# Remove directories
rm -rf ~/.marcus

# Remove aliases from .bashrc
# Edit ~/.bashrc and remove the MARCUS section

# Remove tmux config (optional)
mv ~/.tmux.conf ~/.tmux.conf.backup

# Reload shell
source ~/.bashrc
```

## FAQ

**Q: Will this affect my existing git workflow?**
A: No, Marcus adds automation but doesn't change git behavior. You can continue using git normally.

**Q: Can I use this with GitHub/GitLab?**
A: Yes! Set `MARCUS_AUTO_PUSH=true` to auto-push commits.

**Q: What if I'm working on multiple branches?**
A: Marcus works per-branch. Each branch gets its own auto-commits.

**Q: How much disk space do auto-commits use?**
A: Minimal. Git is efficient with similar commits. Old backup tags are auto-cleaned.

**Q: Can I disable auto-commits temporarily?**
A: Yes. Comment out the cron job: `crontab -e` and add `#` before the MARCUS lines.

**Q: Does this work on macOS?**
A: Yes, with minor modifications. The script auto-detects the OS.

**Q: Can I customize commit messages?**
A: Yes, edit `MARCUS_COMMIT_PREFIX` in `~/.marcus/config/marcus.conf`.

**Q: What happens if my VM is destroyed?**
A: Push to a remote regularly. Set `MARCUS_AUTO_PUSH=true` for automatic backup.

## Support & Contributing

- Report issues: Create detailed bug reports with log files
- Feature requests: Describe your use case
- Contributions: Fork and submit pull requests

## Version History

- **v1.0**: Initial release with core features
- **v1.1**: Added git hooks framework
- **v1.2**: Enhanced recovery options
- **v1.3**: Added project-specific configuration
- **v2.0**: Complete Marcus integration with safety features

## License

MIT License - Feel free to modify and distribute

## Credits

Designed for Claude-assisted development workflows, integrating best practices from:
- Git automation patterns
- Tmux session management
- Unix system administration
- DevOps continuous integration principles

---

**Made with ❤️ for developers who never want to lose their work again**
