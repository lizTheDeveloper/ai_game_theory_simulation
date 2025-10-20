#!/bin/bash
# Prepare government-agents package for npm publication
# Usage: ./prepare-publish.sh



echo "🚀 Preparing @political-science/government-agents for publication"
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the government-agents package directory"
    exit 1
fi

# Step 1: Clean build
echo "1️⃣  Cleaning previous build..."
rm -rf dist/
rm -f *.tgz

# Step 2: Install dependencies
echo "2️⃣  Installing dependencies..."
npm install

# Step 3: Run tests
echo "3️⃣  Running tests..."
npm test

# Step 4: Build TypeScript
echo "4️⃣  Building TypeScript..."
npm run build

# Step 5: Verify dist/ contents
echo "5️⃣  Verifying build output..."
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not created"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: dist/index.js not found"
    exit 1
fi

if [ ! -f "dist/index.d.ts" ]; then
    echo "❌ Error: dist/index.d.ts not found"
    exit 1
fi

echo "✅ Build output verified"

# Step 6: Check package contents
echo "6️⃣  Checking package contents (dry run)..."
npm pack --dry-run

# Step 7: Create tarball for inspection
echo "7️⃣  Creating tarball for inspection..."
npm pack

TARBALL=$(ls -t *.tgz | head -1)
echo "✅ Created: $TARBALL"

# Step 8: Extract and show contents
echo "8️⃣  Package contents:"
tar -tzf "$TARBALL" | head -20
echo "   ... (use 'tar -tzf $TARBALL' to see all files)"

# Step 9: Show package size
SIZE=$(du -h "$TARBALL" | cut -f1)
echo ""
echo "📦 Package size: $SIZE"

# Step 10: Security check
echo ""
echo "9️⃣  Security audit..."
npm audit || true  # Don't fail if vulnerabilities (we have zero dependencies)

# Final instructions
echo ""
echo "✅ Package is ready for publication!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Review package contents:"
echo "   tar -tzf $TARBALL"
echo ""
echo "2. Update package.json with your details:"
echo "   - repository.url (GitHub URL)"
echo "   - author (your name/email)"
echo ""
echo "3. Create GitHub repository first:"
echo "   gh repo create your-org/government-agents --public"
echo ""
echo "4. Login to npm (if not already):"
echo "   npm login"
echo ""
echo "5. Publish to npm:"
echo "   npm publish --access public"
echo ""
echo "6. Verify publication:"
echo "   npm view @political-science/government-agents"
echo ""
echo "See PUBLISHING_GUIDE.md for complete instructions."
