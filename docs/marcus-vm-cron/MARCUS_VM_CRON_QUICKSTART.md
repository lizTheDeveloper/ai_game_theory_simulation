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

# MARCUS Quick Start Guide

## 🚀 Installation (2 minutes)

```bash
# 1. Run the setup script
chmod +x marcus-persistence-setup.sh
./marcus-persistence-setup.sh

# 2. Reload your shell
source ~/.bashrc

# 3. You're ready!
marcus
```

## 📝 Essential Commands

### Start Working
```bash
marcus          # Start your workspace (creates tmux session)
```

### Save Your Work
```bash
m-save          # Save now (manual)
m-wip "note"    # Quick work-in-progress save
m-commit "msg"  # Commit with message
```

### Check Status
```bash
m-info          # See what's saved, when, where
gst             # Git status (short format)
glog            # Recent commits (pretty graph)
```

### Recovery
```bash
m-recover       # Show all recovery options
m-stash-list    # List saved stashes
m-unstash 0     # Restore latest stash
```

## 🎯 What Happens Automatically?

✅ **Every 30 minutes**: Auto-commit your changes  
✅ **Every 15 minutes**: Create backup stash  
✅ **Every 5 minutes**: Keep connection alive  
✅ **Before push**: Create backup branch  
✅ **On commit**: Check for debug code & secrets  

## 💡 Common Workflows

### Daily Work Session
```bash
# Start
marcus

# Work normally in tmux...
# Auto-saves happen automatically

# Manual save anytime
m-save

# Check what's been saved
m-info

# Detach (keeps running)
Ctrl+b d
```

### New Project Setup
```bash
cd ~/my-new-project
m-init                    # Initialize Marcus
marcus                    # Start working
```

### Quick Saves
```bash
# Save work in progress
m-wip "trying new approach"

# Commit milestone
m-commit "Completed user auth"

# Create named backup
m-stash-save "before refactor"
```

### Recovery from Disconnection
```bash
# Just reconnect and run:
marcus                    # Reattaches to your session

# Everything is still there!
m-info                    # Verify your saves
```

## 🔧 Tmux Basics

```
Ctrl+b d     → Detach (session keeps running)
Ctrl+b c     → New window
Ctrl+b n     → Next window
Ctrl+b 1-5   → Jump to window 1-5
Ctrl+b [     → Scroll mode (press q to exit)
```

## 🆘 Quick Fixes

### Lost changes?
```bash
m-recover              # See all recovery options
glog                   # Check recent commits
m-stash-list          # Check stashes
```

### Auto-commit not working?
```bash
crontab -l            # Check if cron is set up
~/.marcus/scripts/setup-cron.sh    # Reinstall cron
```

### Need to check logs?
```bash
tail -f ~/.marcus/logs/auto-commit.log
```

## 📊 5-Window Workspace Layout

When you run `marcus`:

1. **main** → Your main workspace
2. **code** → Code editing area
3. **git** → Git operations
4. **logs** → Auto-commit monitoring
5. **test** → Testing area

Switch between them: `Ctrl+b` then `1`, `2`, `3`, `4`, or `5`

## ⚙️ Configuration

Edit `~/.marcus/config/marcus.conf`:

```bash
# Change auto-commit interval
MARCUS_AUTOCOMMIT_INTERVAL=60    # 60 minutes instead of 30

# Enable auto-push to remote
MARCUS_AUTO_PUSH=true            # Push commits automatically

# Change project directory
MARCUS_PROJECT_DIR="/path/to/project"
```

## 🎓 Next Steps

1. Read full docs: `cat ~/MARCUS_DOCUMENTATION.md`
2. Customize config: `nano ~/.marcus/config/marcus.conf`
3. Explore scripts: `ls -l ~/.marcus/scripts/`
4. Check logs: `m-logs`

## 💬 Help

```bash
m-info          # System status
m-recover       # Recovery options
marcus --help   # Tmux help
man tmux        # Full tmux manual
```

---

**That's it! Your work is now protected. Happy coding! 🎉**

Type `marcus` to start your persistent workspace.
