# Autonomous Worker Quick Start

Get Claude Code working autonomously on your project in 3 steps.

## 1️⃣ Set API Key

```bash
export ANTHROPIC_API_KEY="sk-ant-YOUR-KEY-HERE"
```

Make it permanent:
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-YOUR-KEY-HERE"' >> ~/.bashrc
source ~/.bashrc
```

## 2️⃣ Activate

```bash
cd ~/ai_game_theory_simulation
./activate-autonomous.sh
```

## 3️⃣ Monitor

```bash
# Watch live activity
sudo journalctl -u claude-worker.service -f

# Check work logs  
ls -lt logs/autonomous/
```

---

## 📋 Essential Commands

| Action | Command |
|--------|---------|
| **Activate** | `./activate-autonomous.sh` |
| **Stop** | `sudo systemctl stop claude-worker.timer` |
| **Start** | `sudo systemctl start claude-worker.timer` |
| **Status** | `sudo systemctl status claude-worker.timer` |
| **Live Logs** | `sudo journalctl -u claude-worker.service -f` |
| **Work Logs** | `ls -lt logs/autonomous/` |
| **Disable** | `sudo systemctl disable claude-worker.timer` |

## ⚙️ Configuration

**Change frequency** - Edit `/etc/systemd/system/claude-worker.timer`:

```ini
# Every hour
OnCalendar=hourly

# Every 15 minutes  
OnCalendar=*:0/15

# Weekdays 9 AM - 5 PM
OnCalendar=Mon-Fri *-*-* 09..17:00/1
```

Then reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart claude-worker.timer
```

## 💰 Cost Control

**Expected costs:**
- Every 30 min: ~$5-25/day (~$150-750/month)
- Every hour: ~$2-12/day (~$60-360/month)
- Business hours only: ~$40-200/month

**To reduce costs:**
1. Increase interval (hourly instead of 30min)
2. Use business hours only schedule
3. Set usage limits in Anthropic dashboard
4. Stop when not actively developing

## 🛡️ Safety Features

✅ 30-minute timeout per session  
✅ Full logging of all actions  
✅ Git audit trail  
✅ Auto-cleanup of old logs  
✅ Pulls latest before working  

## 📖 Full Documentation

See [AUTONOMOUS_SETUP.md](./AUTONOMOUS_SETUP.md) for complete details.

---

**What It Does:**

Every 30 minutes, Claude Code will:
1. Pull latest changes
2. Check roadmap for highest priority task
3. Complete task autonomously if possible
4. Otherwise, do code reviews or research
5. Commit and push work with detailed messages
6. Log everything for review

**Task Priority:**
1. CRITICAL roadmap items
2. HIGH priority tasks  
3. Research verification
4. Code reviews
5. Documentation

---

🤖 **Autonomous development, continuously improving your project**
