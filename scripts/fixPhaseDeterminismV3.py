#!/usr/bin/env python3
"""
Fix Phase Determinism V3 - Add setDeterministicRng(rng) to all phases

IMPROVED VERSION: Uses Python to properly parse TypeScript files.

Roy says: "Bash sed is great for simple tasks. But multi-line import parsing?
           Time for a real parser. Or at least Python string manipulation."
"""

import os
import re
from pathlib import Path

# Paths
PHASES_DIR = Path("/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases")

# Counters
files_processed = 0
imports_added = 0
set_calls_added = 0

print("═" * 80)
print("  FIX PHASE DETERMINISM V3 - Add setDeterministicRng(rng) Calls")
print("═" * 80)
print()

for file_path in PHASES_DIR.glob("*.ts"):
    if ".bak" in file_path.name:
        continue

    print(f"🔧 Processing: {file_path.name}")

    # Read file content
    with open(file_path, "r") as f:
        content = f.read()

    modified = False

    # Check if already has setDeterministicRng import
    if "setDeterministicRng" not in content:
        # Find last import statement (handles multi-line)
        # Match: import ... from '...';
        # Strategy: Find all import statements, get the last one's end position

        import_pattern = r"import\s+.*?from\s+['\"].*?['\"];"
        imports = list(re.finditer(import_pattern, content, re.DOTALL))

        if imports:
            last_import = imports[-1]
            insert_pos = last_import.end()

            # Insert new import after last import
            new_import = "\nimport { setDeterministicRng } from '@/simulation/utils/deterministicRng';"
            content = content[:insert_pos] + new_import + content[insert_pos:]

            print(f"   ✅ Added setDeterministicRng import")
            imports_added += 1
            modified = True
        else:
            print(f"   ⚠️  No imports found")
    else:
        print(f"   ℹ️  Already has setDeterministicRng import")

    # Check if execute method already calls setDeterministicRng(rng)
    if "setDeterministicRng(rng)" not in content:
        # Find execute method signature
        execute_pattern = r"execute\s*\([^)]*rng[^)]*\)\s*(?::\s*\w+\s*)?{"
        execute_match = re.search(execute_pattern, content)

        if execute_match:
            # Find the opening brace position
            brace_pos = execute_match.end() - 1  # Position of '{'

            # Insert setDeterministicRng(rng); right after the opening brace
            insert_pos = brace_pos + 1
            set_call = "\n    setDeterministicRng(rng);"
            content = content[:insert_pos] + set_call + content[insert_pos:]

            print(f"   ✅ Added setDeterministicRng(rng) call")
            set_calls_added += 1
            modified = True
        else:
            print(f"   ⚠️  No execute method with rng parameter found")
    else:
        print(f"   ℹ️  Already calls setDeterministicRng(rng)")

    # Write back if modified
    if modified:
        with open(file_path, "w") as f:
            f.write(content)

    files_processed += 1
    print()

print("═" * 80)
print("✅ PHASE DETERMINISM UPDATE COMPLETE")
print("═" * 80)
print()
print("📊 Summary:")
print(f"   Phase files processed:     {files_processed}")
print(f"   Imports added:             {imports_added}")
print(f"   setDeterministicRng calls: {set_calls_added}")
print()
