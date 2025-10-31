#!/bin/bash
# Determinism Fix Script (Oct 30, 2025)
# Applies systematic fixes for Math.random() and Date.now() non-determinism
#
# Pattern 1: generateUniqueId in agent files (Date.now() → state.eventIdCounter)
# Pattern 2: Math.random() for probability checks → rng()
# Pattern 3: Math.random().toString(36).substr(2, 9) → generateShortId(state)

set -e  # Exit on error

echo "🔧 Applying determinism fixes to simulation code..."

# ============================================================================
# PART 1: Fix generateUniqueId pattern in agent files
# ============================================================================

echo ""
echo "=== Part 1: Fixing agent ID generators ==="

# Pattern: let eventIdCounter = 0; const generateUniqueId = (prefix: string) => `${prefix}_${Date.now()}_${eventIdCounter++}`
# Fix: const generateUniqueId = (state: GameState, prefix: string) => { state.eventIdCounter++; return `${prefix}_${state.currentMonth}_${state.eventIdCounter}`; }

fix_agent_id_generator() {
  local file=$1
  echo "  Fixing: $file"

  # Replace function signature
  sed -i.bak_det -E \
    's/let eventIdCounter = 0;[[:space:]]*const generateUniqueId = \(prefix: string\):/const generateUniqueId = (state: GameState, prefix: string):/' \
    "$file"

  # Replace function body
  sed -i.bak_det2 -E \
    's/return `\$\{prefix\}_\$\{Date\.now\(\)\}_\$\{eventIdCounter\}`;/const id = `${prefix}_${state.currentMonth}_${state.eventIdCounter}`; state.eventIdCounter++; return id;/' \
    "$file"

  # Add import if not present
  if ! grep -q "import type { GameState }" "$file"; then
    sed -i.bak_det3 "1i\\
import type { GameState } from '@/types/game';
" "$file"
  fi

  # Clean up backup files
  rm -f "$file".bak_det*
}

# Fix agent files with generateUniqueId pattern
fix_agent_id_generator "src/simulation/agents/societyAgent.ts"
fix_agent_id_generator "src/simulation/agents/aiAgent.ts"
fix_agent_id_generator "src/simulation/agents/governmentAgent.ts"

echo "✓ Agent ID generators fixed"

# ============================================================================
# PART 2: Find files that need manual RNG threading
# ============================================================================

echo ""
echo "=== Part 2: Identifying files needing RNG threading ==="

# Find all Math.random() calls in simulation code (excluding backups)
echo "Files with Math.random() probability checks:"
grep -r "if.*Math\.random\(\)" src/simulation/*.ts 2>/dev/null | grep -v "\.bak" | cut -d: -f1 | sort -u || true

echo ""
echo "Files with Math.random() in calculations:"
grep -r "Math\.random\(\)" src/simulation/*.ts 2>/dev/null | grep -v "\.bak" | grep -v "if.*Math\.random" | cut -d: -f1 | sort -u || true

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo "=== SUMMARY ==="
echo "✓ Part 1 complete: Agent ID generators fixed"
echo "⚠️  Part 2: Manual fixes required for Math.random() → rng()"
echo ""
echo "Next steps:"
echo "1. Run type checking: npx tsc --noEmit"
echo "2. Fix TypeScript errors for generateUniqueId(state, ...) calls"
echo "3. Manually thread rng() parameter through files with Math.random()"
echo "4. Run verification: npx tsx scripts/verifyDeterminism.ts"

