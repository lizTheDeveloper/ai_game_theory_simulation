# Git Hooks

This directory contains git hooks that enforce code quality and maintain documentation hygiene.

## Installation

After cloning the repository, run:

```bash
./scripts/install-hooks.sh
```

This copies the hooks from `.claude/hooks/git/` to `.git/hooks/` and makes them executable.

## Hooks

### pre-commit

**Runs before each commit**

Validates:
1. **Emoji usage** - Ensures emojis used in simulation code are registered in `docs/EMOJI_EVENT_MAP.txt`
2. **GameState field references** - Warns about invalid `state.fieldName` patterns

**Exit codes:**
- `0` - Validation passed, commit proceeds
- `1` - Validation failed, commit blocked (unregistered emojis or duplicates)

**Example output:**
```
🎨 Validating emoji usage...
  1. Checking emoji map for duplicates...
     ✅ No duplicates in emoji map
  2. Checking staged files for emoji usage...
     ✅ All emojis registered
  3. Validating GameState field references...
     ✅ GameState field references look valid

✅ Pre-commit validation passed
```

### post-commit

**Runs after each successful commit**

Automatically spawns the `wiki-documentation-updater` (historian) agent to:
1. Analyze what changed in the commit
2. Update `docs/wiki/README.md` and related documentation
3. Create research verification files for new mechanics/parameters
4. Auto-commit documentation changes with "historian" in the message

**Loop prevention:**
- Skips if commit message contains "historian" (prevents infinite loop)
- Skips if docs were already updated in the original commit

**Example workflow:**
```
You commit changes
  ↓
Post-commit hook runs
  ↓
Historian agent spawns
  ↓
Analyzes commit diff
  ↓
Updates documentation
  ↓
Auto-commits with "historian commit: ..."
```

## Updating Hooks

If you modify the hooks in `.claude/hooks/git/`, reinstall them:

```bash
./scripts/install-hooks.sh
```

## Disabling Hooks

To temporarily disable hooks without uninstalling:

```bash
# Skip pre-commit validation
git commit --no-verify

# Or uninstall completely
rm .git/hooks/pre-commit .git/hooks/post-commit
```

## VM Setup

On the VM, hooks are automatically installed during repository setup. The post-commit hook is disabled in autonomous mode to prevent spawning interactive agents.

## Maintenance

**When to update these hooks:**
- Adding new validation rules (emoji patterns, field naming conventions)
- Changing documentation workflow (new doc generation steps)
- Modifying agent spawn logic (different prompts for historian)

**Testing hooks:**
1. Make a test commit on a branch
2. Verify pre-commit validation runs
3. Check if post-commit spawns historian
4. Verify historian auto-commits correctly
5. Check for loop prevention (commit message contains "historian")
