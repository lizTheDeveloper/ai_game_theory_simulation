# Quinn Matrix Setup - Quickstart

**Status:** Infrastructure ready, just needs Matrix token registration

## One-Command Setup

```bash
./scripts/setup-quinn-matrix.sh
```

This will:
1. Register `@agent-quinn:themultiverse.school` on Matrix
2. Save access token to `~/.superalignment-env`
3. Verify configuration
4. Test connection

## What You'll Need

- Password for Quinn's bot account (you'll create this)
- Matrix registration token (may be optional depending on server config)

## After Setup

### 1. Verify Everything Works

```bash
./scripts/verify-quinn-matrix.sh
```

Should show: "✅ Quinn Matrix setup is COMPLETE"

### 2. Test Matrix Connection

```bash
./scripts/test-quinn-dm.sh
```

Should connect and show Quinn's joined rooms.

### 3. Invite Quinn to Channels

From your Matrix client (@lizthedeveloper:themultiverse.school), invite Quinn to:
- `coordination` - All agents
- `implementation` - Worker tracking
- `roadmap` - Priority coordination

### 4. Test DM Functionality

From Matrix client:
1. Start DM with `@agent-quinn:themultiverse.school`
2. Send: "What's the build status?"

Then spawn Quinn:
```bash
claude --agent quinn
```

Quinn should:
- Auto-check Matrix notifications on spawn
- See your DM
- Respond with current status

## Troubleshooting

### "No token provided" during setup
Re-run the registration script manually:
```bash
cd /Users/annhoward/src/superalignment-chatroom
./scripts/register-quinn-bot.sh
```
Copy the `MATRIX_TOKEN_QUINN="syt_..."` line and paste when prompted.

### Quinn not receiving DMs
1. Check Quinn is registered: `./scripts/verify-quinn-matrix.sh`
2. Check you've DM'd the right user: `@agent-quinn:themultiverse.school`
3. Test connection: `./scripts/test-quinn-dm.sh`

### Token in env but not loading
```bash
source ~/.superalignment-env
echo $MATRIX_TOKEN_QUINN  # Should show token
```

If empty, re-add to env file:
```bash
grep QUINN ~/.superalignment-env  # Check if present
# If not, add it
echo 'MATRIX_TOKEN_QUINN="syt_..."' >> ~/.superalignment-env
```

## What's Been Prepared

Devon has set up:
- ✅ Registration script: `/Users/annhoward/src/superalignment-chatroom/scripts/register-quinn-bot.sh`
- ✅ MCP config: `.claude/agents/mcp-configs/quinn.json`
- ✅ Agent definition: `.claude/agents/quinn.md`
- ✅ Matrix server update: quinn added to BOT_TOKENS
- ✅ Setup automation: `./scripts/setup-quinn-matrix.sh`
- ✅ Verification: `./scripts/verify-quinn-matrix.sh`
- ✅ Testing: `./scripts/test-quinn-dm.sh`

You just need to run `./scripts/setup-quinn-matrix.sh` to complete registration.

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/setup-quinn-matrix.sh` | Main setup script (run this) |
| `scripts/verify-quinn-matrix.sh` | Check if setup complete |
| `scripts/test-quinn-dm.sh` | Test Matrix connection |
| `docs/QUINN_MATRIX_SETUP.md` | Detailed setup guide |
| `QUINN_MATRIX_SETUP.md` | Original setup notes |

## Next Steps After Setup

1. **Enable monitoring** - Quinn should check status every 2 hours:
   ```bash
   # Add to crontab
   0 */2 * * * cd /Users/annhoward/src/superalignmenttoutopia && ./scripts/quinn-monitor.sh
   ```

2. **Test proactive updates** - Quinn should DM you status without being asked

3. **Set expectations** - Quinn's job is to keep you informed, not wait for questions

---

**Devon's note:** All infrastructure works. Matrix server knows about Quinn, MCP config is ready, just need the registration token. Should take 2 minutes to complete.
