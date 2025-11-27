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

# MARCUS Installation Checklist

## ✅ Pre-Installation

- [ ] **Read this entire checklist first**
- [ ] **Backup important files** (optional, script does this automatically)
- [ ] **Have terminal access** to your VM or development environment
- [ ] **Ensure git is installed**: `git --version`
- [ ] **Check you have sudo** (if needed): `sudo -v`

## 📋 Installation Steps

### Step 1: Download Files
```bash
# If you have the files, skip to Step 2
# Otherwise download from your source
```
- [ ] `marcus-persistence-setup.sh` downloaded
- [ ] All documentation files available (optional but recommended)

### Step 2: Make Script Executable
```bash
chmod +x marcus-persistence-setup.sh
```
- [ ] Script is executable
- [ ] Verified with: `ls -l marcus-persistence-setup.sh`

### Step 3: Run Installation
```bash
./marcus-persistence-setup.sh
```
- [ ] Script started successfully
- [ ] No permission errors
- [ ] Watched for any warnings

### Step 4: Review Installation Output
Watch for these confirmations:
- [ ] ✓ SSH keep-alive configured
- [ ] ✓ Tmux installed and configured
- [ ] ✓ Auto-commit script created
- [ ] ✓ Intelligent stash system ready
- [ ] ✓ Advanced git hooks framework installed
- [ ] ✓ Marcus tmux session manager ready
- [ ] ✓ Comprehensive aliases & functions added
- [ ] ✓ Configuration file created

### Step 5: Cron Jobs (Interactive)
The script will ask:
```
Install cron jobs now? (y/n)
```
- [ ] Chose your preference (recommended: **y**)
- [ ] If yes: Verified cron installed: `crontab -l`

### Step 6: Reload Shell
```bash
source ~/.bashrc
```
- [ ] Shell reloaded
- [ ] No errors shown
- [ ] Welcome message appeared

### Step 7: Verify Installation
```bash
# Check Marcus command exists
type marcus

# Check aliases loaded
type m-save

# Verify directory structure
ls -la ~/.marcus/
```
- [ ] `marcus` command found
- [ ] `m-save` command found
- [ ] `~/.marcus/` directory exists

### Step 8: Check Backups Created
```bash
ls -la ~/.marcus-backup-*/
```
- [ ] Backup directory exists (if you had existing configs)
- [ ] Your original files are safely backed up

## 🔧 Post-Installation

### Test Basic Functions

#### Test 1: System Info
```bash
m-info
```
Expected output:
- Shows MARCUS system information
- Displays current project status
- No errors

- [ ] `m-info` works correctly

#### Test 2: Tmux Session
```bash
marcus
```
Expected result:
- Creates or attaches to tmux session
- Shows 5 windows (main, code, git, logs, test)
- No errors

- [ ] Tmux session created successfully
- [ ] Can see all 5 windows (Ctrl+b w to list)
- [ ] Can detach (Ctrl+b d)
- [ ] Can reattach (`marcus` again)

#### Test 3: Manual Save
Navigate to a git repository:
```bash
cd your-project  # or create test: mkdir test-repo && cd test-repo
git init         # if needed
echo "test" > test.txt
m-save
```
Expected result:
- Files committed
- No errors
- Confirmation message shown

- [ ] Manual save works

#### Test 4: Check Logs
```bash
tail ~/.marcus/logs/auto-commit.log
```
- [ ] Log file exists
- [ ] Contains entries (if auto-commit ran)

### Optional: Initialize a Project

If you have a project to work on:
```bash
cd ~/your-project
m-init
```
- [ ] Git initialized (if needed)
- [ ] Marcus hooks installed
- [ ] .gitignore created
- [ ] Initial commit made

## 🎯 Configuration (Optional)

### Customize Settings
```bash
nano ~/.marcus/config/marcus.conf
```

Consider adjusting:
- [ ] `MARCUS_PROJECT_DIR` - Set to your main project
- [ ] `MARCUS_AUTOCOMMIT_INTERVAL` - Change from 30 if desired
- [ ] `MARCUS_AUTO_PUSH` - Enable if you want auto-push
- [ ] Other settings as needed

After changes:
```bash
# Reinstall cron if you changed intervals
~/.marcus/scripts/setup-cron.sh
```

## 🔍 Verification Checklist

### Files & Directories
```bash
# Check all components installed
ls ~/.marcus/scripts/
ls ~/.marcus/hooks/
ls ~/.marcus/config/
ls ~/.marcus/logs/
```

- [ ] Scripts directory has: `auto-commit.sh`, `git-stash-backup.sh`, `tmux-marcus.sh`, `init-project.sh`, `setup-cron.sh`
- [ ] Hooks directory has: `pre-commit`, `post-commit`, `pre-push`, `post-merge`, `install-hooks.sh`
- [ ] Config directory has: `marcus.conf`
- [ ] Logs directory exists (may be empty initially)

### SSH Configuration
```bash
cat ~/.ssh/config
```
- [ ] Contains "MARCUS: SSH Keep-Alive" section
- [ ] Has ServerAliveInterval, ServerAliveCountMax, TCPKeepAlive

### Tmux Configuration
```bash
cat ~/.tmux.conf
```
- [ ] Contains "MARCUS Tmux Configuration"
- [ ] Has mouse, history, status bar settings

### Bash Configuration
```bash
grep "MARCUS PERSISTENCE SYSTEM" ~/.bashrc
```
- [ ] Section exists in .bashrc
- [ ] Contains all aliases and functions

### Cron Jobs
```bash
crontab -l | grep MARCUS
```
- [ ] Shows MARCUS cron entries (if installed)
- [ ] Auto-commit job (every 30 minutes)
- [ ] Stash backup job (every 15 minutes)
- [ ] Keep-alive job (every 5 minutes)
- [ ] Cleanup jobs

## 🚀 First Run

### Start Your First Marcus Session
```bash
# Navigate to your project
cd ~/your-project

# Initialize if new project
m-init

# Start Marcus workspace
marcus
```

Inside tmux:
- [ ] Window 1 (main) - shows git status
- [ ] Window 2 (code) - ready for coding
- [ ] Window 3 (git) - shows git log
- [ ] Window 4 (logs) - monitoring auto-commits
- [ ] Window 5 (test) - available for testing

### Test Tmux Navigation
- [ ] Switch windows: `Ctrl+b 1`, `Ctrl+b 2`, etc.
- [ ] Detach: `Ctrl+b d`
- [ ] Reattach: `marcus`
- [ ] Session persists after detach

### Test Auto-Save
Wait 30 minutes or manually trigger:
```bash
# In a separate terminal (not in tmux)
~/.marcus/scripts/auto-commit.sh
```
- [ ] Auto-commit runs successfully
- [ ] Check log: `tail ~/.marcus/logs/auto-commit.log`

### Test Git Hooks
Make a commit with debug code:
```bash
echo "console.log('test')" > test.js
git add test.js
git commit -m "test"
```
- [ ] Pre-commit hook runs
- [ ] Warns about debug code
- [ ] Prompts for confirmation

## 📚 Learn the Commands

Test each command:

- [ ] `m-info` - Shows system status
- [ ] `m-save` - Manual save
- [ ] `m-commit "msg"` - Quick commit
- [ ] `m-wip "note"` - Work in progress save
- [ ] `gst` - Git status
- [ ] `glog` - Git log graph
- [ ] `m-recover` - Show recovery options
- [ ] `m-stash-list` - List stashes

## 🎓 Read Documentation

- [ ] Read `MARCUS_VM_CRON_QUICKSTART.md` - Essential quick reference
- [ ] Browse `MARCUS_VM_CRON_DOCUMENTATION.md` - Comprehensive guide
- [ ] Check `MARCUS_VM_CRON_ARCHITECTURE.md` - Understand the system
- [ ] Review `MARCUS_VM_CRON_VERSION_CLARIFICATION.md` - See what's new

## 🛠️ Troubleshooting

### If something doesn't work:

1. **Check installation logs**
   ```bash
   # Look for error messages from installation
   ```

2. **Verify file permissions**
   ```bash
   ls -la ~/.marcus/scripts/
   # All scripts should be executable (rwxr-xr-x)
   ```

3. **Reload shell**
   ```bash
   source ~/.bashrc
   ```

4. **Check cron**
   ```bash
   crontab -l
   # Should show MARCUS jobs
   ```

5. **Test manual scripts**
   ```bash
   ~/.marcus/scripts/auto-commit.sh
   # Should run without errors
   ```

### Common Issues

**Issue**: `marcus: command not found`
- **Solution**: Run `source ~/.bashrc` or restart terminal

**Issue**: Tmux session won't start
- **Solution**: Check tmux installed: `tmux -V`
- **Fix**: `sudo apt-get install tmux`

**Issue**: Auto-commits not running
- **Solution**: Check cron: `crontab -l | grep MARCUS`
- **Fix**: Run `~/.marcus/scripts/setup-cron.sh`

**Issue**: Git hooks not working
- **Solution**: In your project: `~/.marcus/hooks/install-hooks.sh`

## ✅ Final Verification

Complete this final checklist:

- [ ] ✅ Marcus installed successfully
- [ ] ✅ All components verified
- [ ] ✅ Tmux session tested
- [ ] ✅ Cron jobs running (if enabled)
- [ ] ✅ Git hooks working
- [ ] ✅ Commands accessible
- [ ] ✅ Documentation read
- [ ] ✅ Ready to work!

## 🎉 Success!

If all items are checked, your Marcus Persistence System is fully installed and operational!

### Next Steps:

1. **Start working**: Run `marcus` and begin your session
2. **Work normally**: Marcus protects your work automatically
3. **Check status**: Run `m-info` periodically
4. **Customize**: Edit `~/.marcus/config/marcus.conf` as needed

### Remember:

- Auto-commits happen every 30 minutes
- Stash backups every 15 minutes
- Connection kept alive automatically
- Git hooks protect you from mistakes
- Recovery is always available (`m-recover`)

## 📞 Need Help?

- Run `m-info` for system status
- Check `~/.marcus/logs/` for operation logs
- Review documentation in the package
- All scripts have comments explaining their function

---

**Welcome to Marcus! Your work is now protected. Happy coding! 🚀**

---

## Installation Date

Installed on: ________________

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
