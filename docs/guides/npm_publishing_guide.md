# Publishing @political-science/government-agents - Quick Start

## TL;DR - Publish in 5 Commands

```bash
# 1. Navigate to package
cd packages/government-agents

# 2. Prepare for publishing (runs tests, builds, creates tarball)
./prepare-publish.sh

# 3. Login to npm (if not already)
npm login

# 4. Publish (use --access public for scoped package)
npm publish --access public

# 5. Verify
npm view @political-science/government-agents
```

## What You Need First

### 1. npm Account
- Sign up: https://www.npmjs.com/signup
- Free tier is fine (scoped packages can be public with `--access public`)

### 2. GitHub Repository (Recommended)
Create a new public repo for the package:

**Option A: Via GitHub CLI**
```bash
# Create new repo
gh repo create government-agents --public --description "Government modeling framework with coalition formation and policy response"

# Or with full path
gh repo create your-username/government-agents --public
```

**Option B: Via GitHub Web**
1. Go to https://github.com/new
2. Name: `government-agents`
3. Description: "Government modeling framework with coalition formation and policy response"
4. Public
5. Initialize: No (we'll push existing code)

### 3. Update package.json
Before publishing, update these fields in `packages/government-agents/package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/government-agents"
  },
  "author": "Your Name <your.email@example.com>",
  "homepage": "https://github.com/YOUR-USERNAME/government-agents#readme",
  "bugs": {
    "url": "https://github.com/YOUR-USERNAME/government-agents/issues"
  }
}
```

## Two Approaches

### Approach 1: Publish from Simulation Repo (Quickest)

Keep the package in your simulation monorepo, but publish only the package:

```bash
cd /Users/annhoward/src/superalignmenttoutopia/packages/government-agents

# Prepare
./prepare-publish.sh

# Publish
npm publish --access public
```

**Pros:**
- Fastest (no file copying)
- Maintain single source of truth
- Easy to update from simulation

**Cons:**
- Package source lives in private simulation repo
- Contributors need access to full simulation to contribute
- GitHub repo URL points to simulation (unless you create separate repo)

### Approach 2: Extract to Separate Repo (Recommended)

Create standalone repository for the package:

```bash
# Create new directory
cd ~/src
mkdir government-agents
cd government-agents

# Copy package files (excluding parent simulation)
cp -r /Users/annhoward/src/superalignmenttoutopia/packages/government-agents/* .

# Initialize git
git init
git add .
git commit -m "Initial commit: Government modeling framework v0.1.0

Production-ready government modeling package with:
- 30 governments with real WGI 2024 data
- Coalition formation (Laver 2020 algorithm)
- Policy response with crisis acceleration
- Elections and opinion dynamics
- International treaty coordination

Research-backed with 36 peer-reviewed sources (2019-2024).
58/58 tests passing, MIT licensed.

🤖 Generated with Claude Code (claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Create GitHub repo and push
gh repo create YOUR-USERNAME/government-agents --public --source=. --remote=origin
git push -u origin main

# Publish to npm
npm publish --access public
```

**Pros:**
- Clean standalone repository
- Easy for external contributors
- Can be maintained independently
- Better for open-source community

**Cons:**
- Need to sync changes between repos (if you update package in simulation)
- Slight duplication

## Syncing Strategy (If Using Separate Repo)

If you go with Approach 2, you can sync updates:

```bash
# In your simulation repo
cd /Users/annhoward/src/superalignmenttoutopia/packages/government-agents

# Make changes to package
# ... edit files ...

# Copy to standalone repo
rsync -av --exclude 'node_modules' --exclude 'dist' . ~/src/government-agents/

# Publish from standalone repo
cd ~/src/government-agents
npm version patch  # or minor/major
npm publish
git add .
git commit -m "Update to v0.1.1"
git push
```

## After Publishing

### 1. Verify Publication

```bash
# Check on npm
npm view @political-science/government-agents

# Test installation
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install @political-science/government-agents

# Test import
node -e "const gov = require('@political-science/government-agents'); console.log(Object.keys(gov))"
```

### 2. Add Badges to README

Add to top of `README.md`:

```markdown
# Government Modeling Framework

[![npm version](https://badge.fury.io/js/@political-science%2Fgovernment-agents.svg)](https://www.npmjs.com/package/@political-science/government-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-58%20passing-brightgreen)](https://github.com/YOUR-USERNAME/government-agents)
```

### 3. Submit to Academic Registries

**CoMSES Net** (Computational Modeling in Social and Ecological Sciences):
- URL: https://www.comses.net/codebases/
- Benefits: DOI, academic discoverability, peer review badge
- Takes: ~30 minutes to submit

**OpenABM** (Open Agent-Based Modeling):
- URL: https://www.comses.net/openabm/
- Benefits: Model library inclusion

### 4. Share on Social Media / Forums

**Where to announce:**
- Reddit: r/Political_Science, r/datascience, r/MachineLearning, r/AcademicPsychology
- Twitter/X: Tag #PoliticalScience #ABM #ComputationalSocialScience
- Hacker News: Show HN post
- LinkedIn: Academic networks
- Political Science forums

**Template announcement:**

```markdown
🎉 Launching @political-science/government-agents - an open-source government modeling framework!

Features:
✅ 30 real governments with WGI 2024 data
✅ Coalition formation (validated against real elections)
✅ Policy response with crisis acceleration
✅ Elections & opinion dynamics
✅ International treaty coordination

Research-backed with 36 peer-reviewed sources, 58/58 tests passing, MIT licensed.

npm install @political-science/government-agents

GitHub: https://github.com/YOUR-USERNAME/government-agents
npm: https://www.npmjs.com/package/@political-science/government-agents
```

## Maintenance Plan

### When to Publish Updates

**Patch (0.1.0 → 0.1.1):** Bug fixes only
```bash
npm version patch
npm publish
```

**Minor (0.1.0 → 0.2.0):** New features, backward-compatible
```bash
npm version minor
npm publish
```

**Major (0.1.0 → 1.0.0):** Breaking changes
```bash
npm version major
npm publish
```

### Deprecation Policy

If you need to deprecate a version:

```bash
npm deprecate @political-science/government-agents@0.1.0 "Please upgrade to 0.2.0 - includes critical bug fixes"
```

## Security Best Practices

### 1. Enable 2FA on npm

```bash
npm profile enable-2fa auth-and-writes
```

This requires 2FA for:
- Publishing packages
- Changing settings
- Generating tokens

### 2. Review Published Files

Before each publish:

```bash
npm pack --dry-run
```

Verify no secrets leaked (API keys, internal URLs, etc.)

### 3. Monitor Dependencies

Even though you have zero dependencies now, if you add any:

```bash
npm audit
npm audit fix
```

## Files Created for Publishing

I've created these files in `packages/government-agents/`:

1. **`.npmignore`** - Excludes source/tests from npm package (only publishes dist/)
2. **`prepare-publish.sh`** - Automated preparation script
3. **`CHANGELOG.md`** - Version history tracking
4. **`PUBLISHING_GUIDE.md`** - Comprehensive publishing documentation

## Complete Publishing Workflow

```bash
# 1. Make changes to package
cd packages/government-agents
# ... edit code ...

# 2. Run tests
npm test

# 3. Build
npm run build

# 4. Update version & changelog
npm version patch  # or minor/major
# Edit CHANGELOG.md with changes

# 5. Commit
git add .
git commit -m "Release v0.1.1: Bug fixes"

# 6. Tag
git tag v0.1.1

# 7. Push
git push --tags

# 8. Publish to npm
npm publish

# 9. Verify
npm view @political-science/government-agents
```

## Questions?

See the comprehensive guide: `packages/government-agents/PUBLISHING_GUIDE.md`

Or check:
- npm documentation: https://docs.npmjs.com/
- GitHub Packages: https://docs.github.com/en/packages
- Semantic Versioning: https://semver.org/

---

**Ready to publish?** Run `./prepare-publish.sh` in the package directory!
