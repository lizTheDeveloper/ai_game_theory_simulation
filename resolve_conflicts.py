#!/usr/bin/env python3
"""
Resolve merge conflicts by keeping HEAD version.

Pattern handled:
<<<<<<< HEAD
...HEAD code...
=======
...their code...
>>>>>>> origin/branch1
=======
...more their code...
>>>>>>> origin/branch2
"""

import re
import sys
from pathlib import Path

def resolve_conflicts_in_file(filepath: Path) -> bool:
    """Resolve conflicts in a single file by keeping HEAD version."""
    try:
        content = filepath.read_text()
    except Exception as e:
        print(f"❌ Cannot read {filepath}: {e}")
        return False

    original_content = content

    # Pattern: <<<<<<< HEAD ... ======= ... >>>>>>> origin/...
    # We want to keep everything from <<<<<<< HEAD to first =======
    # and delete everything from ======= to the last >>>>>>> in that block

    # Strategy: Find each conflict block and resolve it
    lines = content.split('\n')
    resolved_lines = []
    i = 0
    conflicts_found = 0

    while i < len(lines):
        line = lines[i]

        if line.startswith('<<<<<<< HEAD'):
            conflicts_found += 1
            # Start of conflict block
            # Collect HEAD version (until first =======)
            head_lines = []
            i += 1

            while i < len(lines) and not lines[i].startswith('======='):
                head_lines.append(lines[i])
                i += 1

            # Skip all ======= and >>>>>>> lines until we're past the conflict
            while i < len(lines) and (lines[i].startswith('=======') or lines[i].startswith('>>>>>>>')):
                i += 1
                # Also skip content between markers
                while i < len(lines) and not lines[i].startswith('=======') and not lines[i].startswith('>>>>>>>'):
                    if i < len(lines) and lines[i].startswith('<<<<<<< HEAD'):
                        break  # Nested conflict, back up
                    i += 1

            # Add the HEAD version
            resolved_lines.extend(head_lines)

        elif line.startswith('>>>>>>>') or (line.startswith('=======') and i+1 < len(lines) and
                                           any(lines[j].startswith('>>>>>>>') for j in range(i+1, min(i+10, len(lines))))):
            # Orphaned conflict marker (part of nested conflict we should skip)
            i += 1
        else:
            # Normal line
            resolved_lines.append(line)
            i += 1

    resolved_content = '\n'.join(resolved_lines)

    if conflicts_found > 0:
        print(f"✓ {filepath}: Resolved {conflicts_found} conflict blocks")
        try:
            filepath.write_text(resolved_content)
            return True
        except Exception as e:
            print(f"❌ Cannot write {filepath}: {e}")
            return False
    else:
        print(f"  {filepath}: No conflicts found")
        return True

def main():
    src_dir = Path('src')
    if not src_dir.exists():
        print("❌ src/ directory not found")
        sys.exit(1)

    # Find all TypeScript files with conflict markers
    conflicts = []
    for ts_file in src_dir.rglob('*.ts'):
        try:
            content = ts_file.read_text()
            if '<<<<<<< HEAD' in content or '>>>>>>>' in content:
                conflicts.append(ts_file)
        except:
            pass

    if not conflicts:
        print("✓ No conflict markers found")
        return 0

    print(f"\n🔧 Resolving conflicts in {len(conflicts)} files...\n")

    success_count = 0
    for filepath in sorted(conflicts):
        if resolve_conflicts_in_file(filepath):
            success_count += 1

    print(f"\n✓ Resolved {success_count}/{len(conflicts)} files")

    if success_count < len(conflicts):
        print(f"⚠️  {len(conflicts) - success_count} files had errors")
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
