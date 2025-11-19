#!/usr/bin/env python3
"""
Resolve merge conflicts - handle orphaned markers.

Handles two cases:
1. Complete conflict blocks: <<<<<<< HEAD ... ======= ... >>>>>>>
2. Orphaned markers: Just ======= and >>>>>>> without <<<<<<< HEAD
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
    lines = content.split('\n')
    resolved_lines = []
    i = 0
    conflicts_found = 0
    in_conflict_tail = False

    while i < len(lines):
        line = lines[i]

        # Complete conflict block starting with <<<<<<< HEAD
        if line.startswith('<<<<<<< HEAD'):
            conflicts_found += 1
            # Collect HEAD version (until first =======)
            head_lines = []
            i += 1

            while i < len(lines) and not lines[i].startswith('======='):
                head_lines.append(lines[i])
                i += 1

            # Skip all ======= and >>>>>>> lines
            while i < len(lines) and (lines[i].startswith('=======') or lines[i].startswith('>>>>>>>')):
                i += 1
                # Also skip content between markers
                while i < len(lines) and not lines[i].startswith('=======') and not lines[i].startswith('>>>>>>>'):
                    if lines[i].startswith('<<<<<<< HEAD'):
                        break  # Start of next conflict
                    i += 1

            # Add the HEAD version
            resolved_lines.extend(head_lines)

        # Orphaned >>>>>>> marker (tail from partial merge)
        elif line.startswith('>>>>>>>'):
            conflicts_found += 1
            i += 1  # Skip this marker
            in_conflict_tail = True

        # Orphaned ======= marker (middle of tail)
        elif line.startswith('=======') and in_conflict_tail:
            i += 1  # Skip this marker

        # Orphaned ======= marker starting new tail section
        elif line.startswith('======='):
            conflicts_found += 1
            in_conflict_tail = True
            i += 1  # Skip this marker

        else:
            # Normal line - but if we just exited a conflict tail, reset flag
            if in_conflict_tail and not (line.startswith('=======') or line.startswith('>>>>>>>')):
                in_conflict_tail = False

            resolved_lines.append(line)
            i += 1

    resolved_content = '\n'.join(resolved_lines)

    if resolved_content != original_content:
        print(f"✓ {filepath.name}: Resolved {conflicts_found} conflict markers")
        try:
            filepath.write_text(resolved_content)
            return True
        except Exception as e:
            print(f"❌ Cannot write {filepath}: {e}")
            return False
    else:
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
            if '<<<<<<< HEAD' in content or '>>>>>>>' in content or \
               any(line.strip() == '=======' for line in content.split('\n')):
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

    print(f"\n✓ Processed {success_count}/{len(conflicts)} files")

    return 0

if __name__ == '__main__':
    sys.exit(main())
