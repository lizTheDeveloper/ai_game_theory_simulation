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

# MARCUS System Architecture

## 📊 Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MARCUS PERSISTENCE SYSTEM                 │
│                   Your Work, Always Protected                │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │   Automation  │ │  Workspace    │ │   Recovery    │
    │   Layer       │ │  Layer        │ │   Layer       │
    └───────────────┘ └───────────────┘ └───────────────┘
```

## 🔄 Automation Layer

```
┌─────────────────────────────────────────────────────────┐
│                    CRON SCHEDULER                        │
├──────────────┬──────────────┬──────────────┬───────────┤
│   Every 30m  │   Every 15m  │   Every 5m   │  Daily    │
│              │              │              │           │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌────────┐
│ │Auto-     │ │ │ Stash    │ │ │ Keep-    │ │ │Cleanup │
│ │Commit    │ │ │ Backup   │ │ │ Alive    │ │ │Logs    │
│ └────┬─────┘ │ └────┬─────┘ │ └────┬─────┘ │ └────┬───┘
└──────┼───────┴──────┼───────┴──────┼───────┴──────┼────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────┐
│                  ~/.marcus/logs/                         │
│  • auto-commit.log  • git-stash.log  • keepalive.log    │
└──────────────────────────────────────────────────────────┘
```

## 🖥️ Workspace Layer

```
┌─────────────────────────────────────────────────────────┐
│              TMUX SESSION: "marcus"                      │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│ Window 1 │ Window 2 │ Window 3 │ Window 4 │  Window 5  │
│  main    │   code   │   git    │   logs   │    test    │
├──────────┼──────────┼──────────┼──────────┼────────────┤
│          │          │          │          │            │
│  ├─ pwd  │  ├─ vim  │  ├─ log  │  ├─ tail │  ├─ test   │
│  ├─ git  │  ├─ nano │  │  graph│  │  -f    │  ├─ npm   │
│  │  st   │  └─ code │  ├─ diff │  │  auto  │  └─ debug │
│  └─ ls   │          │  └─ show │  │  -com  │            │
│          │          │          │  │  mit   │            │
└──────────┴──────────┴──────────┴──────────┴────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    Ctrl+b d           Ctrl+b 1-5          Ctrl+b c
    (detach)          (switch win)         (new win)
```

## 🛡️ Safety Layer (Git Hooks)

```
┌─────────────────────────────────────────────────────────┐
│                   GIT OPERATIONS FLOW                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  git commit   │
                    └───────┬───────┘
                            │
                    ┌───────▼────────┐
                    │  PRE-COMMIT    │
                    │  Hook          │
                    ├────────────────┤
                    │ ✓ Debug code?  │
                    │ ✓ Large files? │
                    │ ✓ Secrets?     │
                    └───────┬────────┘
                            │
                    [Pass] ▼ [Fail → Prompt]
                            │
                    ┌───────▼────────┐
                    │  COMMIT        │
                    │  Created       │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  POST-COMMIT   │
                    │  Hook          │
                    ├────────────────┤
                    │ • Log details  │
                    │ • Tag suggest  │
                    └───────┬────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  git push     │
                    └───────┬───────┘
                            │
                    ┌───────▼────────┐
                    │  PRE-PUSH      │
                    │  Hook          │
                    ├────────────────┤
                    │ • Backup branch│
                    │ • Main warn    │
                    │ • Count commits│
                    └───────┬────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PUSHED ✓     │
                    └───────────────┘
```

## 💾 Storage Architecture

```
~/.marcus/                          (Marcus Home)
    │
    ├── scripts/                    (Executable Scripts)
    │   ├── auto-commit.sh          → Runs every 30m via cron
    │   ├── git-stash-backup.sh     → Runs every 15m via cron
    │   ├── tmux-marcus.sh          → Started by 'marcus' command
    │   ├── init-project.sh         → Run once per project
    │   └── setup-cron.sh           → Cron installer
    │
    ├── hooks/                      (Git Hooks Templates)
    │   ├── pre-commit              → Security checks
    │   ├── post-commit             → Logging
    │   ├── pre-push                → Backup creation
    │   ├── post-merge              → Dependency alerts
    │   └── install-hooks.sh        → Hook installer
    │
    ├── config/                     (Configuration)
    │   └── marcus.conf             → User-editable settings
    │
    └── logs/                       (Operation Logs)
        ├── auto-commit.log         → Commit history
        ├── git-stash.log           → Stash operations
        ├── commits.log             → Post-commit tracking
        ├── merges.log              → Merge history
        ├── keepalive.log           → Connection status
        ├── cron-autocommit.log     → Cron output
        └── cron-stash.log          → Cron stash output

~/.ssh/                             (SSH Configuration)
    └── config                      → Keep-alive settings

~/.tmux.conf                        (Tmux Configuration)

~/.bashrc                           (Shell Configuration)
    └── [MARCUS aliases & functions]

~/.marcus-backup-TIMESTAMP/         (Safety Backups)
    ├── .bashrc.backup
    ├── .tmux.conf.backup
    └── ...
```

## 🔄 Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                     USER WORKSPACE                        │
│                                                           │
│  ┌─────────────────────────────────────────────┐         │
│  │          Your Project Files                 │         │
│  │  • Modified files                           │         │
│  │  • Uncommitted changes                      │         │
│  │  • Work in progress                         │         │
│  └─────────────┬───────────────────────────────┘         │
└────────────────┼─────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│Auto-   │  │Manual  │  │Stash   │
│Commit  │  │Save    │  │Backup  │
│(30m)   │  │(m-save)│  │(15m)   │
└───┬────┘  └───┬────┘  └───┬────┘
    │           │           │
    └───────────┼───────────┘
                │
                ▼
        ┌───────────────┐
        │  GIT HOOKS    │
        │  (Safety)     │
        └───────┬───────┘
                │
                ▼
    ┌──────────────────────────┐
    │   LOCAL GIT REPOSITORY   │
    │                          │
    │  Commits → Branches →    │
    │  Tags → Stashes          │
    └──────────┬───────────────┘
               │
               ▼ (optional)
    ┌──────────────────────────┐
    │   REMOTE REPOSITORY      │
    │   (GitHub/GitLab/etc)    │
    └──────────────────────────┘
```

## 📊 Recovery Flow

```
                    ┌──────────────────┐
                    │  Lost Work? 😱   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   m-recover      │
                    │   (Command)      │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │  Recent     │   │   Stashes   │   │   Backup    │
    │  Commits    │   │             │   │   Branches  │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ git log     │   │ m-stash-    │   │ git branch  │
    │ git reset   │   │ list        │   │ git checkout│
    │ git cherry  │   │ m-unstash   │   │ backup-*    │
    └─────────────┘   └─────────────┘   └─────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Tags            │
                    │  auto-backup-*   │
                    └──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Work Restored!  │
                    │        ✓         │
                    └──────────────────┘
```

## 🚀 Startup Sequence

```
User runs: marcus
    │
    ▼
┌─────────────────────────────────┐
│ ~/.marcus/scripts/tmux-marcus.sh│
└─────────────┬───────────────────┘
              │
              ▼
      Check session exists?
              │
      ┌───────┴───────┐
      │               │
   [No]            [Yes]
      │               │
      ▼               ▼
Create new      Attach to
session         existing
      │               │
      ▼               │
Setup 5 windows       │
      │               │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ User in tmux  │
      │ workspace     │
      └───────┬───────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
Git Hooks  Auto-    Keep-
Active     Commit   Alive
           Running  Active
```

## 💡 Command Flow

```
User types: m-commit "message"
    │
    ▼
~/.bashrc function m-commit()
    │
    ├─> git add -A
    │
    ├─> git commit -m "MARCUS: message"
    │       │
    │       └─> Triggers pre-commit hook
    │               │
    │               ├─> Check debug code
    │               ├─> Check file sizes
    │               └─> Check secrets
    │                       │
    │                   [Pass/Fail]
    │                       │
    │       ┌───────────────┘
    │       │
    │       └─> Triggers post-commit hook
    │               │
    │               ├─> Log to commits.log
    │               └─> Suggest tags if milestone
    │
    └─> Echo confirmation
            │
            ▼
    User sees: "✓ Committed: message"
```

## 🔐 Security Checkpoints

```
┌─────────────────────────────────────────────────────┐
│            SECURITY CHECKPOINT FLOW                  │
└─────────────────────────────────────────────────────┘

    User prepares commit
            │
            ▼
    ┌──────────────────┐
    │  PRE-COMMIT      │
    │  HOOK            │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │ Scan for:        │
    │ • console.log    │
    │ • debugger       │
    │ • pdb.set_trace  │
    └────────┬─────────┘
             │
        [Found?]
             │
      ┌──────┴──────┐
    [Yes]         [No]
      │             │
      ▼             │
  ⚠️  Prompt        │
  user for          │
  confirmation      │
      │             │
      └──────┬──────┘
             │
    ┌────────▼─────────┐
    │ Check file sizes │
    │ (> 10MB?)        │
    └────────┬─────────┘
             │
        [Large?]
             │
      ┌──────┴──────┐
    [Yes]         [No]
      │             │
      ▼             │
  ⚠️  Prompt        │
  user for          │
  confirmation      │
      │             │
      └──────┬──────┘
             │
    ┌────────▼─────────┐
    │ Scan for:        │
    │ • password       │
    │ • api_key        │
    │ • secret         │
    │ • token          │
    └────────┬─────────┘
             │
       [Detected?]
             │
      ┌──────┴──────┐
    [Yes]         [No]
      │             │
      ▼             │
  🚨 WARNING        │
  Show matches      │
  Require confirm   │
      │             │
      └──────┬──────┘
             │
             ▼
    ┌────────────────┐
    │ All Checks ✓   │
    │ Proceed        │
    └────────────────┘
```

## 📈 Performance & Resource Usage

```
┌──────────────────────────────────────────┐
│         RESOURCE UTILIZATION             │
├──────────────────────────────────────────┤
│                                          │
│  CPU:  < 1%  (background processes)      │
│  RAM:  ~50MB (tmux + scripts)            │
│  Disk: ~1-5MB (logs, depends on usage)   │
│  Net:  Minimal (SSH keep-alive only)     │
│                                          │
│  Cron Jobs: 3 running periodically       │
│  • Auto-commit: 30s execution            │
│  • Stash backup: 10s execution           │
│  • Keep-alive: instant                   │
│                                          │
└──────────────────────────────────────────┘

Storage Growth:
├─ Logs: ~1KB/day (with rotation)
├─ Git objects: Efficient delta compression
├─ Stashes: Auto-cleaned (keep last 30)
└─ Tags: Auto-cleaned (keep last 50)
```

## 🌐 Network Topology

```
┌─────────────────┐
│   Your Local    │
│   Machine       │
└────────┬────────┘
         │ SSH Connection
         │ (with keep-alive)
         │
         ▼
┌─────────────────┐
│   VM / Remote   │
│   Server        │
│                 │
│  ┌───────────┐  │
│  │  MARCUS   │  │
│  │  System   │  │
│  └─────┬─────┘  │
│        │        │
│        │ Git    │
│        ▼        │
│  ┌───────────┐  │
│  │   Local   │  │
│  │   Git     │  │
│  │   Repo    │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │ Push (optional)
         │
         ▼
┌─────────────────┐
│   Remote Git    │
│   (GitHub/etc)  │
└─────────────────┘
```

---

## Legend

```
┌─────┐
│ Box │  = Component/Process
└─────┘

  │
  ▼      = Data flow direction

 ┌──┴──┐
 │     │  = Decision point
[Yes] [No]

  ✓      = Success
  ✗      = Failure
  ⚠      = Warning
  🚨     = Alert
```

---

This architecture ensures:
- ✅ **Redundancy**: Multiple backup mechanisms
- ✅ **Automation**: Minimal user intervention
- ✅ **Safety**: Multiple checkpoints
- ✅ **Recovery**: Easy restoration
- ✅ **Performance**: Minimal overhead
- ✅ **Monitoring**: Complete visibility
