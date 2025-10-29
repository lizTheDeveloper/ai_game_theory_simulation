# GitHub Wiki Setup

**Status:** GitHub Action created, ready to enable

## What's Been Set Up

I've created a GitHub Action (`.github/workflows/sync-wiki.yml`) that will automatically sync your `docs/wiki/` folder to GitHub's native Wiki feature.

## How to Enable

### Step 1: Enable Wiki in GitHub

1. Go to your GitHub repo: `https://github.com/[your-username]/superalignmenttoutopia`
2. Click **Settings** (top right)
3. Scroll down to **Features** section
4. Check the **☑ Wikis** checkbox
5. Save

### Step 2: Initial Wiki Setup

Once enabled, GitHub will create an empty Wiki at:
`https://github.com/[your-username]/superalignmenttoutopia/wiki`

You have two options for the initial sync:

#### Option A: Let GitHub Action Do It (Recommended)

1. Make a small change to any file in `docs/wiki/` (add a space, fix typo)
2. Commit and push to main branch
3. GitHub Action will automatically sync everything
4. Check `https://github.com/[your-username]/superalignmenttoutopia/wiki`

#### Option B: Manual Initial Sync

```bash
# Clone the wiki repo (replace [your-username] with actual username)
git clone https://github.com/[your-username]/superalignmenttoutopia.wiki.git

# Copy all wiki docs
cp -r docs/wiki/* superalignmenttoutopia.wiki/

# Rename README.md to Home.md (GitHub Wiki convention)
cd superalignmenttoutopia.wiki
mv README.md Home.md

# Commit and push
git add .
git commit -m "Initial wiki sync from docs/wiki"
git push origin master
```

## How It Works

**After initial setup:**
- Every time you push changes to `docs/wiki/` on main branch
- GitHub Action automatically syncs to Wiki
- `README.md` → `Home.md` (GitHub Wiki convention)
- All other markdown files stay the same

**Key Files Synced:**
- ✅ `GETTING_STARTED.md` - Installation and first run
- ✅ `DASHBOARD_WALKTHROUGH.md` - UI tour
- ✅ `RUNNING_SIMULATIONS.md` - Monte Carlo guide
- ✅ `UNDERSTANDING_RESULTS.md` - Outcome interpretation
- ✅ `BIBLIOGRAPHY.md` - Research citations
- ✅ All system documentation in `systems/` folder

## Manual Trigger

You can also manually trigger the sync:
1. Go to **Actions** tab in GitHub
2. Click **Sync Wiki** workflow
3. Click **Run workflow** button

## Troubleshooting

**Wiki not enabled?**
- Make sure you checked the Wikis checkbox in Settings > Features

**Action failing?**
- Check that Wiki is enabled first
- Verify the repo has Wiki access in Settings

**Changes not showing up?**
- Check Actions tab for workflow status
- Wiki may take 1-2 minutes to update after push

## Alternative: GitHub Pages

If you prefer GitHub Pages instead of Wiki:
1. Go to Settings > Pages
2. Select "Deploy from a branch"
3. Choose "main" branch and "/docs" folder
4. Docs will be at: `https://[username].github.io/superalignmenttoutopia/wiki/`

## Summary

✅ **Created:** GitHub Action for automatic sync
⏳ **Next:** Enable Wiki in repo settings
🎯 **Result:** docs/wiki/ automatically synced to GitHub Wiki on every commit
