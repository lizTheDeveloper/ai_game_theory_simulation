# Publishing Guide: @political-science/government-agents

## Prerequisites

1. **npm Account**: Sign up at https://www.npmjs.com/signup
2. **npm CLI**: Verify with `npm whoami` (if not logged in: `npm login`)
3. **GitHub Account**: For repository hosting
4. **Build Success**: Run `npm run build` to verify TypeScript compilation

## Option 1: Quick Publish (Scoped Package)

### Step 1: Verify Package Name

The package name `@political-science/government-agents` is a **scoped package**.

- **Free npm accounts**: Scoped packages are PRIVATE by default
- **To publish public**: Use `--access public` flag

### Step 2: Build & Test

```bash
cd /path/to/government-agents

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Verify package contents
npm pack --dry-run
```

### Step 3: Update package.json

Update these fields before publishing:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/government-agents"
  },
  "author": "Your Name <your.email@example.com>",
  "homepage": "https://github.com/your-username/government-agents#readme",
  "bugs": {
    "url": "https://github.com/your-username/government-agents/issues"
  }
}
```

### Step 4: Publish to npm

```bash
# First time publish (public scoped package)
npm publish --access public

# Subsequent publishes (access level persists)
npm publish
```

### Step 5: Verify Publication

```bash
# Check on npm
npm view @political-science/government-agents

# Install in test project
mkdir test-install && cd test-install
npm init -y
npm install @political-science/government-agents

# Test import
node -e "const gov = require('@political-science/government-agents'); console.log(gov)"
```

## Option 2: Unscoped Package (Easier, But Name Must Be Unique)

If you prefer an unscoped package (no `@political-science/` prefix):

### Update package.json

```json
{
  "name": "government-agents-model",
  "version": "0.1.0"
}
```

### Publish

```bash
# Unscoped packages are public by default
npm publish
```

**Note**: Check name availability first: `npm view government-agents-model`

## Option 3: GitHub Packages (Alternative to npm)

Publish to GitHub Packages instead of npm:

### Step 1: Update package.json

```json
{
  "name": "@your-username/government-agents",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### Step 2: Authenticate

```bash
npm login --registry=https://npm.pkg.github.com
# Username: your-github-username
# Password: GitHub Personal Access Token (with write:packages scope)
```

### Step 3: Publish

```bash
npm publish
```

## Version Management

### Semantic Versioning

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward-compatible
- **PATCH** (0.0.1): Bug fixes

### Version Bumps

```bash
# Patch release (0.1.0 → 0.1.1)
npm version patch
npm publish

# Minor release (0.1.1 → 0.2.0)
npm version minor
npm publish

# Major release (0.2.0 → 1.0.0)
npm version major
npm publish
```

## What Gets Published?

Files included (check with `npm pack --dry-run`):

✅ **Included:**
- `dist/` - Compiled JavaScript + TypeScript definitions
- `README.md` - Documentation
- `LICENSE` - MIT license
- `package.json` - Package metadata
- `data/` - Country/party JSON files (in dist/)

❌ **Excluded (.npmignore):**
- `src/` - TypeScript source (users get compiled JS)
- `tests/` - Test files
- `examples/` - Example code
- `node_modules/` - Dependencies
- `.git/` - Git history
- Development config files

## Maintenance After Publishing

### Update Workflow

1. Make changes to source code
2. Update version in package.json
3. Run tests: `npm test`
4. Build: `npm run build`
5. Update CHANGELOG.md
6. Commit changes
7. Tag release: `git tag v0.2.0`
8. Push: `git push --tags`
9. Publish: `npm publish`

### Deprecate Old Version

```bash
npm deprecate @political-science/government-agents@0.1.0 "Please upgrade to 0.2.0"
```

### Unpublish (within 72 hours only)

```bash
npm unpublish @political-science/government-agents@0.1.0
```

**Warning**: Unpublishing is discouraged and only works within 72 hours of publish.

## Recommended Workflow

### 1. Create GitHub Repository First

```bash
# On GitHub: Create new repo "government-agents"
# Clone locally
git clone https://github.com/your-username/government-agents
cd government-agents

# Copy package files
cp -r /path/to/superalignmenttoutopia/packages/government-agents/* .

# Commit
git add .
git commit -m "Initial commit: Government modeling framework v0.1.0"
git push
```

### 2. Update package.json with GitHub URL

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/government-agents"
  }
}
```

### 3. Publish to npm

```bash
npm publish --access public
```

### 4. Add npm Badge to README

Add to top of README.md:

```markdown
[![npm version](https://badge.fury.io/js/@political-science%2Fgovernment-agents.svg)](https://www.npmjs.com/package/@political-science/government-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

## Security Considerations

### 1. Review Published Files

```bash
# Before publishing, check what will be included
npm pack --dry-run

# Inspect tarball contents
npm pack
tar -tzf political-science-government-agents-0.1.0.tgz
```

### 2. Ensure No Secrets

Check these files don't contain sensitive data:
- API keys
- Database credentials  
- Internal URLs
- Proprietary algorithms

### 3. Enable 2FA on npm

```bash
npm profile enable-2fa auth-and-writes
```

## CoMSES Net Submission (Academic Community)

For academic visibility, also submit to CoMSES Net:

1. Visit: https://www.comses.net/codebases/
2. Click "Submit Model"
3. Fill metadata:
   - Title: "Government Modeling Framework"
   - Type: "Agent-Based Model Component"
   - Programming Language: TypeScript
   - License: MIT
   - GitHub URL: https://github.com/your-username/government-agents
4. Add tags: coalition-formation, policy-modeling, elections, political-science
5. Submit for review

Benefits:
- Academic discoverability
- DOI assignment
- Citation tracking
- Peer review badge

## Citation

Provide this in README.md:

```bibtex
@software{government_agents_2025,
  title = {Government Modeling Framework: Coalition Formation and Policy Response},
  author = {Your Name},
  year = {2025},
  version = {0.1.0},
  url = {https://github.com/your-username/government-agents},
  note = {Research-backed government simulation with 36 peer-reviewed sources}
}
```

## Quick Checklist

Before `npm publish`:

- [ ] Tests passing: `npm test`
- [ ] Build successful: `npm run build`
- [ ] README.md complete with examples
- [ ] LICENSE file present (MIT)
- [ ] package.json metadata correct (author, repository, keywords)
- [ ] .npmignore excludes source/tests
- [ ] Version number appropriate (0.1.0 for initial)
- [ ] GitHub repo created and pushed
- [ ] Logged into npm: `npm whoami`
- [ ] Review tarball: `npm pack --dry-run`
- [ ] Ready to publish: `npm publish --access public`

## Support & Maintenance

After publishing:

1. **GitHub Issues**: Enable for bug reports and feature requests
2. **Versioning**: Follow semver strictly
3. **Changelog**: Document all changes
4. **Security**: Monitor for vulnerabilities with `npm audit`
5. **Dependencies**: Keep zero dependencies (current state)
6. **Breaking Changes**: Only in major versions

---

**Generated with Claude Code (claude.com/claude-code)**

**Questions?** Open an issue at https://github.com/your-username/government-agents/issues
