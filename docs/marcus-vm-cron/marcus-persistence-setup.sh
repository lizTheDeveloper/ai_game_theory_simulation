#!/bin/bash

#############################################################################
# MARCUS VM Persistence & Auto-Commit Integration Script
# 
# Safe integration with existing Marcus workflow:
# - Checks for existing files before overwriting
# - Backs up existing configurations
# - Enhanced git hooks for automation
# - Marcus-specific customizations
#############################################################################

set +e  # Disabled to allow backup_if_exists to return 1 safely

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BACKUP_DIR="$HOME/.marcus-backup-$(date +%Y%m%d-%H%M%S)"
MARCUS_SCRIPTS_DIR="$HOME/.marcus/scripts"
MARCUS_CONFIG_DIR="$HOME/.marcus/config"

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}\n"
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Function to safely backup files
backup_if_exists() {
    local file=$1
    if [ -f "$file" ]; then
        mkdir -p "$BACKUP_DIR"
        cp "$file" "$BACKUP_DIR/"
        print_warning "Backed up existing: $file → $BACKUP_DIR/$(basename $file)"
        return 0
    fi
    return 1
}

# Function to append to file only if content doesn't exist
append_if_not_exists() {
    local file=$1
    local content=$2
    local marker=$3
    
    if [ ! -f "$file" ]; then
        echo "$content" > "$file"
        return 0
    fi
    
    if ! grep -q "$marker" "$file" 2>/dev/null; then
        echo "$content" >> "$file"
        return 0
    fi
    return 1
}

print_header "MARCUS Persistence Integration Starting"

#############################################################################
# STEP 0: CREATE MARCUS DIRECTORIES
#############################################################################

print_header "Step 0: Marcus Directory Structure"

mkdir -p "$MARCUS_SCRIPTS_DIR"
mkdir -p "$MARCUS_CONFIG_DIR"
mkdir -p "$HOME/.marcus/logs"
mkdir -p "$HOME/.marcus/hooks"

print_success "Marcus directories created"

#############################################################################
# STEP 1: SSH KEEP-ALIVE (SAFE)
#############################################################################

print_header "Step 1: SSH Keep-Alive Configuration"

mkdir -p ~/.ssh
chmod 700 ~/.ssh

SSH_CONFIG_CONTENT='
# MARCUS: SSH Keep-Alive Configuration
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 30
    TCPKeepAlive yes
    Compression yes
'

if append_if_not_exists ~/.ssh/config "$SSH_CONFIG_CONTENT" "MARCUS: SSH Keep-Alive"; then
    print_success "SSH keep-alive configured"
else
    print_info "SSH keep-alive already configured"
fi

chmod 600 ~/.ssh/config

#############################################################################
# STEP 2: TERMINAL MULTIPLEXERS
#############################################################################

print_header "Step 2: Terminal Multiplexer Setup"

# Check for tmux
if ! command -v tmux &> /dev/null; then
    print_info "Installing tmux..."
    apt-get update -qq && apt-get install -y tmux > /dev/null 2>&1
    print_success "tmux installed"
else
    print_success "tmux already installed"
fi

# Safe tmux config
TMUX_CONFIG="$HOME/.tmux.conf"
backup_if_exists "$TMUX_CONFIG"

cat > "$TMUX_CONFIG" << 'EOF'
# MARCUS Tmux Configuration
set -g mouse on
set-option -g history-limit 50000
set-option -g allow-rename off

# Status bar
set -g status-bg colour24
set -g status-fg white
set -g status-left '#[fg=green][MARCUS:#S] '
set -g status-right '#[fg=yellow]%Y-%m-%d %H:%M | #(whoami)@#H'
set -g status-interval 60

# Activity monitoring
setw -g monitor-activity on
set -g visual-activity on

# Pane borders
set -g pane-border-style fg=colour240
set -g pane-active-border-style fg=colour24

# Better splitting
bind | split-window -h
bind - split-window -v
unbind '"'
unbind %

# Quick reload
bind r source-file ~/.tmux.conf \; display "Config reloaded!"
EOF

print_success "Tmux configured for Marcus workflow"

#############################################################################
# STEP 3: ENHANCED AUTO-COMMIT SCRIPT
#############################################################################

print_header "Step 3: Enhanced Auto-Commit Script"

cat > "$MARCUS_SCRIPTS_DIR/auto-commit.sh" << 'EOF'
#!/bin/bash

# MARCUS Auto-Commit Script with Enhanced Features

set -euo pipefail

# Configuration
PROJECT_DIR="${MARCUS_PROJECT_DIR:-$(pwd)}"
COMMIT_PREFIX="${MARCUS_COMMIT_PREFIX:-auto-save}"
LOG_FILE="$HOME/.marcus/logs/auto-commit.log"
MAX_COMMIT_SIZE_MB=50

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if we're in a git repository
if [ ! -d "$PROJECT_DIR/.git" ]; then
    log "ERROR: Not a git repository: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Check repository size
REPO_SIZE=$(du -sm . | cut -f1)
if [ "$REPO_SIZE" -gt "$MAX_COMMIT_SIZE_MB" ]; then
    log "WARNING: Repository size ($REPO_SIZE MB) exceeds limit"
fi

# Check for changes
if [[ -z $(git status --porcelain) ]]; then
    log "No changes to commit in $PROJECT_DIR"
    exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Get stats before commit
FILES_CHANGED=$(git status --porcelain | wc -l)
LINES_ADDED=$(git diff --cached --stat | tail -1 | grep -oP '\d+(?= insertion)' || echo "0")
LINES_DELETED=$(git diff --cached --stat | tail -1 | grep -oP '\d+(?= deletion)' || echo "0")

# Stage all changes
git add -A

# Create detailed commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="$COMMIT_PREFIX: $TIMESTAMP

Changes: $FILES_CHANGED files
Branch: $CURRENT_BRANCH
+$LINES_ADDED -$LINES_DELETED lines

[Auto-generated by MARCUS persistence system]"

# Commit with detailed message
if git commit -m "$COMMIT_MSG" --no-verify; then
    log "SUCCESS: Auto-committed $FILES_CHANGED files on $CURRENT_BRANCH"
    
    # Optional: Create backup tag
    TAG_NAME="auto-backup-$(date +%Y%m%d-%H%M%S)"
    git tag -a "$TAG_NAME" -m "Auto-backup: $TIMESTAMP" 2>/dev/null || true
    
    # Attempt to push if remote exists
    if git remote get-url origin &>/dev/null; then
        if git push origin "$CURRENT_BRANCH" 2>>"$LOG_FILE"; then
            log "SUCCESS: Pushed to origin/$CURRENT_BRANCH"
        else
            log "WARNING: Failed to push (will retry later)"
        fi
    fi
else
    log "ERROR: Failed to commit changes"
    exit 1
fi
EOF

chmod +x "$MARCUS_SCRIPTS_DIR/auto-commit.sh"
print_success "Enhanced auto-commit script created"

#############################################################################
# STEP 4: INTELLIGENT GIT STASH BACKUP
#############################################################################

print_header "Step 4: Intelligent Git Stash System"

cat > "$MARCUS_SCRIPTS_DIR/git-stash-backup.sh" << 'EOF'
#!/bin/bash

# MARCUS Intelligent Stash Backup System

set -euo pipefail

PROJECT_DIR="${MARCUS_PROJECT_DIR:-$(pwd)}"
LOG_FILE="$HOME/.marcus/logs/git-stash.log"
MAX_STASHES=30

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cd "$PROJECT_DIR" 2>/dev/null || exit 1

# Check for changes
if [[ -z $(git status --porcelain) ]]; then
    log "No changes to stash"
    exit 0
fi

# Create descriptive stash
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BRANCH=$(git rev-parse --abbrev-ref HEAD)
FILES=$(git status --porcelain | wc -l)
STASH_MSG="MARCUS_WIP: $BRANCH | $FILES files | $TIMESTAMP"

# Create stash
if git stash push -m "$STASH_MSG" --include-untracked; then
    log "Created stash: $STASH_MSG"
    
    # Re-apply to continue working
    git stash apply stash@{0} 2>/dev/null || log "WARNING: Could not re-apply stash"
    
    # Cleanup old stashes
    STASH_COUNT=$(git stash list | wc -l)
    if [ "$STASH_COUNT" -gt "$MAX_STASHES" ]; then
        STASHES_TO_DROP=$((STASH_COUNT - MAX_STASHES))
        for i in $(seq 1 $STASHES_TO_DROP); do
            git stash drop stash@{$MAX_STASHES} 2>/dev/null || true
        done
        log "Cleaned up $STASHES_TO_DROP old stashes"
    fi
    
    log "SUCCESS: Backup stash created ($STASH_COUNT total)"
else
    log "ERROR: Failed to create stash"
    exit 1
fi
EOF

chmod +x "$MARCUS_SCRIPTS_DIR/git-stash-backup.sh"
print_success "Intelligent stash system created"

#############################################################################
# STEP 5: ADVANCED GIT HOOKS
#############################################################################

print_header "Step 5: Advanced Git Hooks Framework"

cat > "$MARCUS_HOOKS_DIR/install-hooks.sh" << 'EOF'
#!/bin/bash

# MARCUS Git Hooks Installer

HOOK_DIR="${1:-.git/hooks}"

if [ ! -d "$HOOK_DIR" ]; then
    echo "Error: Not a git repository or hooks directory not found"
    exit 1
fi

install_hook() {
    local hook_name=$1
    local hook_file="$HOOK_DIR/$hook_name"
    
    if [ -f "$hook_file" ] && [ ! -L "$hook_file" ]; then
        cp "$hook_file" "$hook_file.backup-$(date +%s)"
        echo "Backed up existing $hook_name"
    fi
    
    cp "$HOME/.marcus/hooks/$hook_name" "$hook_file"
    chmod +x "$hook_file"
    echo "Installed: $hook_name"
}

echo "Installing MARCUS git hooks..."

for hook in pre-commit post-commit pre-push post-merge; do
    if [ -f "$HOME/.marcus/hooks/$hook" ]; then
        install_hook "$hook"
    fi
done

echo "Git hooks installed successfully!"
EOF

chmod +x "$MARCUS_HOOKS_DIR/install-hooks.sh"

# Create individual hooks

# PRE-COMMIT HOOK
cat > "$MARCUS_HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# MARCUS Pre-Commit Hook
# Runs checks before committing

echo "🔍 MARCUS pre-commit checks..."

# Check for debug statements
if git diff --cached | grep -qE "console\.log|debugger|pdb\.set_trace|binding\.pry"; then
    echo "⚠️  Warning: Debug statements detected"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for large files (>10MB)
LARGE_FILES=$(git diff --cached --name-only | xargs -I {} sh -c 'stat -c%s "{}" 2>/dev/null || stat -f%z "{}" 2>/dev/null' | awk '$1 > 10485760 {print}')
if [ -n "$LARGE_FILES" ]; then
    echo "⚠️  Warning: Large files detected (>10MB)"
    git diff --cached --name-only | while read file; do
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
        if [ "$size" -gt 10485760 ]; then
            echo "  - $file ($(numfmt --to=iec-i --suffix=B $size))"
        fi
    done
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for sensitive data patterns
if git diff --cached | grep -qiE "password|api[_-]?key|secret|token|aws_access"; then
    echo "🚨 WARNING: Possible sensitive data detected!"
    git diff --cached | grep -niE "password|api[_-]?key|secret|token|aws_access" | head -5
    read -p "Are you sure you want to commit this? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Pre-commit checks passed"
exit 0
EOF

# POST-COMMIT HOOK
cat > "$MARCUS_HOOKS_DIR/post-commit" << 'EOF'
#!/bin/bash

# MARCUS Post-Commit Hook
# Runs after successful commit

COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | wc -l)

echo "✓ Committed: $COMMIT_HASH on $BRANCH ($FILES files)"

# Log to Marcus tracking
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Commit: $COMMIT_HASH | Branch: $BRANCH | Files: $FILES" >> "$HOME/.marcus/logs/commits.log"

# Auto-tag important commits
if echo "$COMMIT_MSG" | grep -qiE "release|version|milestone"; then
    echo "📌 This looks like an important commit. Consider tagging it:"
    echo "   git tag -a v1.0.0 -m 'Release version 1.0.0'"
fi
EOF

# PRE-PUSH HOOK
cat > "$MARCUS_HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

# MARCUS Pre-Push Hook
# Creates backup and checks before pushing

echo "🚀 MARCUS pre-push checks..."

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE=$1
URL=$2

# Create automatic backup branch
BACKUP_BRANCH="backup/$BRANCH-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH" 2>/dev/null && echo "✓ Created backup: $BACKUP_BRANCH"

# Check if pushing to main/master
if [[ "$BRANCH" =~ ^(main|master)$ ]]; then
    echo "⚠️  You're pushing to $BRANCH"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for unpushed commits
UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l)
if [ "$UNPUSHED" -gt 10 ]; then
    echo "📊 You have $UNPUSHED commits to push"
fi

echo "✓ Pre-push checks passed"
exit 0
EOF

# POST-MERGE HOOK
cat > "$MARCUS_HOOKS_DIR/post-merge" << 'EOF'
#!/bin/bash

# MARCUS Post-Merge Hook
# Runs after successful merge

echo "🔀 Merge completed"

# Check for package.json changes (install dependencies)
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q "package.json"; then
    echo "📦 package.json changed, consider running: npm install"
fi

# Check for requirements.txt changes
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q "requirements.txt"; then
    echo "📦 requirements.txt changed, consider running: pip install -r requirements.txt"
fi

# Log merge
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Merge completed" >> "$HOME/.marcus/logs/merges.log"
EOF

chmod +x "$MARCUS_HOOKS_DIR"/*
print_success "Advanced git hooks framework created"

#############################################################################
# STEP 6: CRON JOBS
#############################################################################

print_header "Step 6: Automated Cron Jobs"

# Create cron job wrapper
cat > "$MARCUS_SCRIPTS_DIR/setup-cron.sh" << 'EOF'
#!/bin/bash

# MARCUS Cron Setup Script

# Backup existing crontab
crontab -l > "$HOME/.marcus/crontab.backup-$(date +%s)" 2>/dev/null || true

# Remove old MARCUS cron jobs
crontab -l 2>/dev/null | grep -v "MARCUS:" > /tmp/cron.tmp || true

# Add new MARCUS cron jobs
cat >> /tmp/cron.tmp << 'CRONEOF'

# ==================== MARCUS AUTOMATED TASKS ====================

# Auto-commit every 30 minutes
*/30 * * * * MARCUS_PROJECT_DIR="$HOME/projects" $HOME/.marcus/scripts/auto-commit.sh >> $HOME/.marcus/logs/cron-autocommit.log 2>&1

# Git stash backup every 15 minutes
*/15 * * * * MARCUS_PROJECT_DIR="$HOME/projects" $HOME/.marcus/scripts/git-stash-backup.sh >> $HOME/.marcus/logs/cron-stash.log 2>&1

# Keep-alive ping every 5 minutes
*/5 * * * * echo "keepalive $(date)" >> $HOME/.marcus/logs/keepalive.log 2>&1

# Cleanup old logs daily at 3 AM
0 3 * * * find $HOME/.marcus/logs -name "*.log" -mtime +7 -exec rm {} \; 2>&1

# Weekly backup tags cleanup (keep last 50)
0 4 * * 0 cd $HOME/projects 2>/dev/null && git tag | grep "^auto-backup-" | sort -r | tail -n +51 | xargs -r git tag -d 2>&1

# ================================================================

CRONEOF

# Install new crontab
crontab /tmp/cron.tmp
rm /tmp/cron.tmp

echo "✓ MARCUS cron jobs installed"
echo "Run 'crontab -l' to view"
EOF

chmod +x "$MARCUS_SCRIPTS_DIR/setup-cron.sh"

# Ask user if they want to install cron jobs now
read -p "Install cron jobs now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    "$MARCUS_SCRIPTS_DIR/setup-cron.sh"
    print_success "Cron jobs installed"
else
    print_info "Run later with: ~/.marcus/scripts/setup-cron.sh"
fi

#############################################################################
# STEP 7: TMUX SESSION MANAGER
#############################################################################

print_header "Step 7: Marcus Tmux Session Manager"

cat > "$MARCUS_SCRIPTS_DIR/tmux-marcus.sh" << 'EOF'
#!/bin/bash

# MARCUS Tmux Session Manager

SESSION_NAME="marcus"
PROJECT_DIR="${MARCUS_PROJECT_DIR:-$HOME/projects}"

# Check if session exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "♻️  Attaching to existing Marcus session..."
    exec tmux attach-session -t $SESSION_NAME
fi

# Create new Marcus workspace
echo "🚀 Creating new Marcus workspace..."

tmux new-session -d -s $SESSION_NAME -c "$PROJECT_DIR"

# Window 1: Main workspace
tmux rename-window -t $SESSION_NAME:1 'main'
tmux send-keys -t $SESSION_NAME:1 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION_NAME:1 "clear && echo '🎯 MARCUS Main Workspace' && echo ''" C-m
tmux send-keys -t $SESSION_NAME:1 "git status" C-m

# Window 2: Editor/Code
tmux new-window -t $SESSION_NAME:2 -n 'code' -c "$PROJECT_DIR"
tmux send-keys -t $SESSION_NAME:2 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION_NAME:2 "clear && echo '💻 Code Editor Ready'" C-m

# Window 3: Git operations
tmux new-window -t $SESSION_NAME:3 -n 'git' -c "$PROJECT_DIR"
tmux send-keys -t $SESSION_NAME:3 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION_NAME:3 "clear && echo '📊 Git Status'" C-m
tmux send-keys -t $SESSION_NAME:3 "git log --oneline --graph --decorate -10" C-m

# Window 4: Monitoring
tmux new-window -t $SESSION_NAME:4 -n 'logs' -c "$HOME/.marcus/logs"
tmux send-keys -t $SESSION_NAME:4 "clear && echo '📋 MARCUS Logs'" C-m
tmux send-keys -t $SESSION_NAME:4 "tail -f auto-commit.log" C-m

# Window 5: Testing/Experimental
tmux new-window -t $SESSION_NAME:5 -n 'test' -c "$PROJECT_DIR"
tmux send-keys -t $SESSION_NAME:5 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION_NAME:5 "clear && echo '🧪 Testing Area'" C-m

# Select first window
tmux select-window -t $SESSION_NAME:1

# Attach to session
echo "✓ Marcus workspace created with 5 windows"
exec tmux attach-session -t $SESSION_NAME
EOF

chmod +x "$MARCUS_SCRIPTS_DIR/tmux-marcus.sh"
print_success "Marcus tmux session manager created"

#############################################################################
# STEP 8: ENHANCED BASH ALIASES
#############################################################################

print_header "Step 8: Marcus Bash Aliases & Functions"

BASHRC_ADDITIONS="
# ==================== MARCUS PERSISTENCE SYSTEM ====================
# Added on $(date)

# Core aliases
alias marcus='~/.marcus/scripts/tmux-marcus.sh'
alias m-save='~/.marcus/scripts/auto-commit.sh'
alias m-backup='~/.marcus/scripts/git-stash-backup.sh'
alias m-logs='cd ~/.marcus/logs && ls -lh'
alias m-status='tail -20 ~/.marcus/logs/auto-commit.log'

# Git enhanced
alias gst='git status -sb'
alias glog='git log --oneline --graph --decorate -20'
alias gstash='git stash list'
alias gtags='git tag -l | tail -20'

# Quick functions
m-commit() {
    git add -A && git commit -m \"MARCUS: \$*\" --no-verify
    echo \"✓ Committed: \$*\"
}

m-wip() {
    git add -A && git commit -m \"WIP: \$(date '+%Y-%m-%d %H:%M') - \$*\" --no-verify
    echo \"✓ WIP saved: \$*\"
}

m-push() {
    BRANCH=\$(git rev-parse --abbrev-ref HEAD)
    git push origin \"\$BRANCH\"
    echo \"✓ Pushed to origin/\$BRANCH\"
}

m-pull() {
    BRANCH=\$(git rev-parse --abbrev-ref HEAD)
    git pull origin \"\$BRANCH\"
    echo \"✓ Pulled from origin/\$BRANCH\"
}

# Stash management
m-stash-save() {
    MSG=\${1:-\"Quick stash \$(date +%H:%M)\"}
    git stash push -m \"MARCUS: \$MSG\" --include-untracked
    echo \"✓ Stashed: \$MSG\"
}

m-stash-pop() {
    git stash pop
    echo \"✓ Restored latest stash\"
}

m-stash-list() {
    git stash list | head -20
}

# Project management
m-init() {
    PROJECT=\${1:-.}
    cd \"\$PROJECT\"
    
    if [ ! -d \".git\" ]; then
        git init
        echo \"✓ Git initialized\"
    fi
    
    # Install Marcus hooks
    if [ -f ~/.marcus/hooks/install-hooks.sh ]; then
        ~/.marcus/hooks/install-hooks.sh
        echo \"✓ Marcus hooks installed\"
    fi
    
    echo \"✓ Marcus initialized for: \$PROJECT\"
}

# Recovery functions
m-recover() {
    echo \"📦 MARCUS Recovery Options:\"
    echo \"\"
    echo \"1. Recent commits:\"
    git log --oneline -10
    echo \"\"
    echo \"2. Stashed work:\"
    git stash list | head -5
    echo \"\"
    echo \"3. Backup branches:\"
    git branch | grep backup | head -5
    echo \"\"
    echo \"4. Auto-backup tags:\"
    git tag -l 'auto-backup-*' | tail -5
}

m-unstash() {
    STASH_NUM=\${1:-0}
    git stash apply stash@{\$STASH_NUM}
    echo \"✓ Applied stash@{\$STASH_NUM}\"
}

# System status
m-info() {
    echo \"\"
    echo \"╔════════════════════════════════════════╗\"
    echo \"║     MARCUS Persistence System Info     ║\"
    echo \"╚════════════════════════════════════════╝\"
    echo \"\"
    echo \"📂 Project: \$(pwd)\"
    echo \"🌿 Branch: \$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'Not a git repo')\"
    echo \"💾 Uncommitted changes: \$(git status --porcelain 2>/dev/null | wc -l)\"
    echo \"📦 Stashes: \$(git stash list 2>/dev/null | wc -l)\"
    echo \"🏷️  Recent tag: \$(git describe --tags --abbrev=0 2>/dev/null || echo 'None')\"
    echo \"⏰ Last auto-commit: \$(tail -1 ~/.marcus/logs/auto-commit.log 2>/dev/null | cut -d']' -f1 | tr -d '[' || echo 'Never')\"
    echo \"\"
    echo \"Aliases: marcus, m-save, m-commit, m-wip, m-push, m-info\"
    echo \"Run 'm-recover' for recovery options\"
    echo \"\"
}

# Environment variable
export MARCUS_PROJECT_DIR=\"\${MARCUS_PROJECT_DIR:-\$HOME/projects}\"

# Welcome message (shown once per session)
if [ -z \"\$MARCUS_WELCOME_SHOWN\" ]; then
    export MARCUS_WELCOME_SHOWN=1
    echo \"\"
    echo \"✨ MARCUS Persistence System loaded\"
    echo \"   Type 'marcus' to start work session\"
    echo \"   Type 'm-info' for system status\"
    echo \"\"
fi

# ===================================================================
"

# Safely append to bashrc
backup_if_exists ~/.bashrc

if ! grep -q "MARCUS PERSISTENCE SYSTEM" ~/.bashrc 2>/dev/null; then
    echo "$BASHRC_ADDITIONS" >> ~/.bashrc
    print_success "Marcus aliases added to ~/.bashrc"
else
    print_info "Marcus aliases already exist in ~/.bashrc"
fi

#############################################################################
# STEP 9: PROJECT INITIALIZATION SCRIPT
#############################################################################

print_header "Step 9: Project Initialization Helper"

cat > "$MARCUS_SCRIPTS_DIR/init-project.sh" << 'EOF'
#!/bin/bash

# MARCUS Project Initialization Script

PROJECT_DIR="${1:-.}"
PROJECT_NAME="$(basename $(realpath $PROJECT_DIR))"

echo "🚀 Initializing MARCUS for: $PROJECT_NAME"

cd "$PROJECT_DIR" || exit 1

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    echo "✓ Git initialized"
fi

# Install Marcus hooks
if [ -f ~/.marcus/hooks/install-hooks.sh ]; then
    ~/.marcus/hooks/install-hooks.sh "$(pwd)/.git/hooks"
fi

# Create .gitignore if needed
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'GITIGNORE'
# MARCUS auto-generated .gitignore
node_modules/
__pycache__/
*.pyc
.env
.env.local
.DS_Store
*.log
.vscode/
.idea/
dist/
build/
*.swp
*.swo
GITIGNORE
    echo "✓ Created .gitignore"
fi

# Create README if needed
if [ ! -f "README.md" ]; then
    cat > README.md << 'README'
# ${PROJECT_NAME}

Project initialized with MARCUS persistence system.

## Features

- Auto-commit every 30 minutes
- Automatic stash backups every 15 minutes
- Enhanced git hooks for safety
- Tmux-based persistent workspace

## Usage

```bash
marcus          # Start Marcus workspace
m-save          # Manual save
m-commit <msg>  # Quick commit
m-info          # System status
```
README
    echo "✓ Created README.md"
fi

# Initial commit
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    git add -A
    git commit -m "Initial commit - MARCUS system initialized" --no-verify
    echo "✓ Initial commit created"
fi

# Set project directory environment variable
echo "export MARCUS_PROJECT_DIR=\"$(pwd)\"" >> ~/.bashrc

echo ""
echo "✅ MARCUS initialized successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.bashrc"
echo "  2. Start work: marcus"
echo "  3. View status: m-info"
echo ""
EOF

chmod +x "$MARCUS_SCRIPTS_DIR/init-project.sh"
print_success "Project initialization helper created"

#############################################################################
# STEP 10: CONFIGURATION FILE
#############################################################################

print_header "Step 10: Marcus Configuration"

cat > "$MARCUS_CONFIG_DIR/marcus.conf" << 'EOF'
# MARCUS Configuration File
# Edit this file to customize your setup

# Project directory
MARCUS_PROJECT_DIR="$HOME/projects"

# Commit settings
MARCUS_COMMIT_PREFIX="auto-save"
MARCUS_MAX_COMMIT_SIZE_MB=50

# Backup settings
MARCUS_MAX_STASHES=30
MARCUS_KEEP_BACKUP_DAYS=30

# Auto-commit intervals (in minutes)
MARCUS_AUTOCOMMIT_INTERVAL=30
MARCUS_STASH_INTERVAL=15

# Logging
MARCUS_LOG_RETENTION_DAYS=7

# Git hooks
MARCUS_HOOKS_ENABLED=true
MARCUS_CHECK_LARGE_FILES=true
MARCUS_LARGE_FILE_SIZE_MB=10
MARCUS_CHECK_SENSITIVE_DATA=true

# Tmux settings
MARCUS_TMUX_SESSION="marcus"
MARCUS_TMUX_WINDOWS=5

# Features
MARCUS_AUTO_PUSH=false
MARCUS_CREATE_TAGS=true
MARCUS_BACKUP_BRANCHES=true
EOF

print_success "Marcus configuration created at ~/.marcus/config/marcus.conf"

#############################################################################
# FINAL SETUP
#############################################################################

print_header "Final Setup & Summary"

# Create initial log files
touch "$HOME/.marcus/logs/auto-commit.log"
touch "$HOME/.marcus/logs/git-stash.log"
touch "$HOME/.marcus/logs/keepalive.log"
touch "$HOME/.marcus/logs/commits.log"
touch "$HOME/.marcus/logs/merges.log"

print_success "Log files initialized"

# Summary
cat << EOF

${GREEN}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           ✨ MARCUS PERSISTENCE SYSTEM INSTALLED ✨          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}

${BLUE}📦 Installation Summary:${NC}

${GREEN}✓${NC} SSH keep-alive configured
${GREEN}✓${NC} Tmux installed and configured
${GREEN}✓${NC} Auto-commit script created
${GREEN}✓${NC} Intelligent stash system ready
${GREEN}✓${NC} Advanced git hooks framework installed
${GREEN}✓${NC} Cron jobs configured (if enabled)
${GREEN}✓${NC} Marcus tmux session manager ready
${GREEN}✓${NC} Comprehensive aliases & functions added
${GREEN}✓${NC} Project initialization helper created
${GREEN}✓${NC} Configuration file created

${YELLOW}📂 Locations:${NC}
   Scripts:  ~/.marcus/scripts/
   Hooks:    ~/.marcus/hooks/
   Logs:     ~/.marcus/logs/
   Config:   ~/.marcus/config/
   Backups:  $BACKUP_DIR

${BLUE}🚀 Quick Start:${NC}

   1. Reload your shell:
      ${CYAN}source ~/.bashrc${NC}

   2. Initialize your project:
      ${CYAN}cd your-project && m-init${NC}

   3. Start Marcus workspace:
      ${CYAN}marcus${NC}

   4. Check system status:
      ${CYAN}m-info${NC}

${BLUE}📋 Key Commands:${NC}

   ${CYAN}marcus${NC}           - Start persistent tmux workspace
   ${CYAN}m-save${NC}            - Manual auto-commit now
   ${CYAN}m-commit <msg>${NC}    - Quick commit with message
   ${CYAN}m-wip <note>${NC}      - Save work in progress
   ${CYAN}m-backup${NC}          - Create stash backup
   ${CYAN}m-info${NC}            - System status & info
   ${CYAN}m-recover${NC}         - Show recovery options
   ${CYAN}m-init${NC}            - Initialize project with Marcus

${BLUE}🔧 Advanced:${NC}

   ${CYAN}~/.marcus/scripts/init-project.sh <dir>${NC}  - Full project setup
   ${CYAN}~/.marcus/hooks/install-hooks.sh${NC}        - Reinstall git hooks
   ${CYAN}~/.marcus/scripts/setup-cron.sh${NC}         - Setup/update cron jobs
   
${BLUE}📚 Git Hooks Installed:${NC}

   • pre-commit:  Check for debug code & sensitive data
   • post-commit: Log commits & suggest tags
   • pre-push:    Create backup branches
   • post-merge:  Check for dependency updates

${YELLOW}⚠️  Important Notes:${NC}

   • Auto-commits run every 30 minutes (via cron)
   • Stash backups created every 15 minutes
   • Your original configs backed up to: $BACKUP_DIR
   • Edit settings in: ~/.marcus/config/marcus.conf

${GREEN}✨ Your work is now protected by MARCUS!${NC}

Run ${CYAN}'m-info'${NC} anytime to see system status
Run ${CYAN}'marcus'${NC} to start your persistent workspace

EOF

# Offer to start Marcus now
read -p "Would you like to start Marcus workspace now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    source ~/.bashrc
    exec "$MARCUS_SCRIPTS_DIR/tmux-marcus.sh"
fi

print_success "Marcus setup complete! Run 'source ~/.bashrc' and then 'marcus' to begin."

exit 0
