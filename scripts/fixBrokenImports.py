#!/usr/bin/env python3
"""
Fix Broken Imports - Repair imports broken by naive sed script

Finds patterns like:
  import {
  import { deterministicRandom } from '@/simulation/utils/deterministicRng';
    SomeType,
  } from './something';

And fixes them to:
  import {
    SomeType,
  } from './something';
  import { deterministicRandom } from '@/simulation/utils/deterministicRng';
"""

import re
from pathlib import Path

ROOT = Path("/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src")

files_fixed = 0

print("🔧 Fixing broken imports...")

for file_path in ROOT.rglob("*.ts"):
    if ".bak" in file_path.name:
        continue

    with open(file_path, "r") as f:
        content = f.read()

    # Pattern: import { followed by import { deterministicRandom ...
    pattern = r"(import\s+\{\s*)\n\s*import\s+\{\s+deterministicRandom\s+\}\s+from\s+['\"]@/simulation/utils/deterministicRng['\"];"

    if re.search(pattern, content):
        print(f"  Fixing: {file_path.relative_to(ROOT)}")

        # Extract the import and move it to after the closing }
        # Strategy: Find the full import block, extract deterministicRandom line, move it after

        # This is tricky. Let's use a simpler approach:
        # Find lines with "import { deterministicRandom" that appear right after "import {"
        # and move them to after the next "} from '...'"

        lines = content.split("\n")
        fixed_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            # Check if this line starts an import block
            if line.strip().startswith("import {") and not "deterministicRandom" in line:
                # Check next line
                if i + 1 < len(lines) and "deterministicRandom" in lines[i + 1]:
                    # Found broken pattern
                    det_import = lines[i + 1].strip()  # Save the deterministicRandom import

                    # Add the opening import line
                    fixed_lines.append(line)
                    i += 2  # Skip both lines

                    # Find the closing } from '...'
                    while i < len(lines):
                        fixed_lines.append(lines[i])
                        if "} from" in lines[i] or lines[i].strip().endswith("';"):
                            # Found end of import block
                            # Add deterministicRandom import after this line
                            fixed_lines.append(det_import)
                            i += 1
                            break
                        i += 1
                else:
                    fixed_lines.append(line)
                    i += 1
            else:
                fixed_lines.append(line)
                i += 1

        content = "\n".join(fixed_lines)

        with open(file_path, "w") as f:
            f.write(content)

        files_fixed += 1

print(f"\n✅ Fixed {files_fixed} files")
