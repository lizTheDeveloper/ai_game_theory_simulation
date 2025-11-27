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

# MARCUS Persistence System - Complete Package

## 📦 What You've Got

This package contains a **production-ready VM persistence system** that's been enhanced specifically for the Marcus workflow. It prevents work loss, automates git operations, and provides comprehensive recovery options.

## 📄 Files Included

1. **marcus-persistence-setup.sh** (29KB)
   - Main installation script
   - Safe, checks for existing files
   - Creates complete Marcus ecosystem
   - Run this first!

2. **MARCUS_VM_CRON_QUICKSTART.md** (3.6KB)
   - Get started in 2 minutes
   - Essential commands only
   - Common workflows
   - Perfect for beginners

3. **MARCUS_VM_CRON_DOCUMENTATION.md** (14KB)
   - Complete reference guide
   - All features explained
   - Troubleshooting
   - Advanced usage
   - Best practices

4. **MARCUS_VM_CRON_VERSION_CLARIFICATION.md** (14KB)
   - Comparison with original script
   - What's new and improved
   - Feature-by-feature breakdown
   - Migration guide

## 🚀 Quick Installation

```bash
# 1. Make executable
chmod +x marcus-persistence-setup.sh

# 2. Run it
./marcus-persistence-setup.sh

# 3. Reload shell
source ~/.bashrc

# 4. Start working!
marcus
```

**That's it!** Your environment is now protected.

## 🎯 What This Does

### Automatically (Every 30 Minutes)
- ✅ Commits your changes
- ✅ Creates backup stashes
- ✅ Keeps your connection alive
- ✅ Logs everything

### On Every Commit
- ✅ Checks for debug code
- ✅ Warns about large files (>10MB)
- ✅ Detects sensitive data patterns
- ✅ Creates backup branches

### When You Need It
- ✅ Complete recovery system
- ✅ Easy access to all backups
- ✅ Persistent tmux workspace
- ✅ Comprehensive monitoring

## 🛡️ Safety Features

**This script is SAFE because:**
1. ✅ Checks for existing files before writing
2. ✅ Creates timestamped backups of everything
3. ✅ Never overwrites without permission
4. ✅ Preserves all your current configurations
5. ✅ Fully reversible installation

**Backups are stored in:** `~/.marcus-backup-TIMESTAMP/`

## 📚 Which Document to Read?

**Just want to start?** → Read `MARCUS_VM_CRON_QUICKSTART.md`

**Need complete info?** → Read `MARCUS_VM_CRON_DOCUMENTATION.md`

**Comparing to original?** → Read `MARCUS_VM_CRON_VERSION_CLARIFICATION.md`

**Want to see what's inside?** → Read the script comments in `marcus-persistence-setup.sh`

## 🎨 Key Features

### 1. Enhanced Git Hooks
- **pre-commit**: Debug code & sensitive data detection
- **post-commit**: Automatic logging & tagging suggestions
- **pre-push**: Backup branch creation
- **post-merge**: Dependency update alerts

### 2. Intelligent Automation
- Auto-commits every 30 minutes
- Stash backups every 15 minutes
- Connection keep-alive every 5 minutes
- Automatic cleanup of old data

### 3. Professional Tooling
- 20+ convenient commands
- Color-coded output
- Comprehensive logging
- Status dashboard (`m-info`)

### 4. Recovery System
- Multiple backup mechanisms
- Easy restoration commands
- Complete history tracking
- Time-travel capabilities

### 5. Workspace Management
- Persistent tmux sessions
- 5-window pre-configured layout
- Survives disconnections
- Organized structure

## 💻 Essential Commands

```bash
marcus          # Start persistent workspace
m-save          # Save now
m-wip "note"    # Quick WIP save
m-commit "msg"  # Commit with message
m-info          # System status
m-recover       # Show recovery options
```

## 📁 What Gets Installed

```
~/.marcus/
├── scripts/          # All automation scripts
│   ├── auto-commit.sh
│   ├── git-stash-backup.sh
│   ├── tmux-marcus.sh
│   ├── init-project.sh
│   └── setup-cron.sh
├── hooks/           # Git hooks framework
│   ├── pre-commit
│   ├── post-commit
│   ├── pre-push
│   ├── post-merge
│   └── install-hooks.sh
├── config/          # Configuration
│   └── marcus.conf
└── logs/            # All log files
    ├── auto-commit.log
    ├── git-stash.log
    └── ... more logs
```

## ⚙️ Configuration

Customize by editing: `~/.marcus/config/marcus.conf`

```bash
MARCUS_PROJECT_DIR="$HOME/projects"    # Your project location
MARCUS_AUTOCOMMIT_INTERVAL=30          # Minutes between auto-commits
MARCUS_AUTO_PUSH=false                 # Set true to auto-push
MARCUS_CREATE_TAGS=true                # Create backup tags
```

## 🔧 Tmux Workspace

When you run `marcus`, you get 5 windows:

1. **main** - Main workspace with git status
2. **code** - Code editing area  
3. **git** - Git operations
4. **logs** - Real-time log monitoring
5. **test** - Testing area

Switch between: `Ctrl+b` then `1`, `2`, `3`, `4`, or `5`
Detach (keeps running): `Ctrl+b d`

## 🆘 Troubleshooting

### Auto-commits not running?
```bash
crontab -l                              # Check if installed
~/.marcus/scripts/setup-cron.sh         # Reinstall cron
```

### Tmux session issues?
```bash
tmux ls                                 # List sessions
tmux kill-session -t marcus             # Kill session
marcus                                  # Create new one
```

### Lost changes?
```bash
m-recover                               # See all options
glog                                    # Recent commits
m-stash-list                            # Available stashes
```

## 📈 Comparison to Original

| Feature | Original | Marcus |
|---------|----------|---------|
| File Safety | ❌ | ✅ Backups |
| Git Hooks | 1 | 4 advanced |
| Commands | 5 | 20+ |
| Security | None | Full |
| Docs | Basic | Complete |
| Recovery | Manual | Automated |

**See `MARCUS_VM_CRON_VERSION_CLARIFICATION.md` for detailed comparison.**

## 🎯 Perfect For

✅ Claude-assisted development  
✅ VM-based workflows  
✅ Remote coding  
✅ Long development sessions  
✅ Multiple projects  
✅ Teams needing safety  
✅ Anyone who's lost work before  

## 🔐 Security

- ✅ Pre-commit hooks check for sensitive data
- ✅ Large file warnings
- ✅ Debug statement detection
- ✅ SSH key safety
- ✅ User-only permissions (chmod 700)
- ✅ No auto-push by default

## 💡 Best Practices

1. **Run `m-info` regularly** to check system status
2. **Use `m-wip`** for work-in-progress saves
3. **Check logs occasionally** for any issues
4. **Enable auto-push** for critical projects
5. **Create named stashes** before major refactoring
6. **Tag important milestones** manually

## 🌟 Why Marcus?

### Original Script
- Basic functionality
- Manual file management
- Limited features
- No safety checks

### Marcus Version
- Production-ready
- Automatic backups
- 4x more features
- Comprehensive safety
- Professional tooling
- Great documentation

## 📞 Next Steps

1. ✅ Install: `./marcus-persistence-setup.sh`
2. ✅ Read: `MARCUS_VM_CRON_QUICKSTART.md`
3. ✅ Start: `marcus`
4. ✅ Explore: `m-info`

## 🎓 Learning Path

**Day 1**: Installation + Quickstart
- Install system
- Learn basic commands
- Start using `marcus`

**Day 2-7**: Daily usage
- Let auto-commits work
- Try manual saves
- Explore the workspace

**Week 2+**: Advanced features
- Customize configuration
- Set up multiple projects
- Master recovery options

## 💬 Support

All commands have built-in help:
```bash
m-info              # System status & help
marcus --help       # Tmux help
man tmux           # Full manual
```

## 📄 License

MIT License - Free to use, modify, and distribute

## 🙏 Credits

Enhanced for Claude-assisted development workflows, integrating:
- Git automation best practices
- Tmux session management patterns
- Unix system administration principles
- DevOps continuous integration concepts

---

## 🎉 Ready to Install?

```bash
chmod +x marcus-persistence-setup.sh
./marcus-persistence-setup.sh
```

**Your work will never be lost again!**

---

**Made with ❤️ for developers who value their work**

*Questions? Read the docs. Issues? Check troubleshooting section.*
