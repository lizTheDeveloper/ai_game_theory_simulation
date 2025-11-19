#!/usr/bin/env python3
"""
Resolve nested merge conflicts by keeping code BEFORE first >>>>>>> marker.

Pattern (from partial merges):
    good_code_line_1
    good_code_line_2      <-- KEEP ALL THIS
    >>>>>>> branch1        <-- DELETE from here...
    =======
    alternative_code
    >>>>>>> branch2
    =======
    more_alternative
    >>>>>>> branch3        <-- ...to here (inclusive)
    good_code_line_3      <-- KEEP THIS

Strategy: Within each conflict block, keep everything before first >>>>>>>
"""

import sys
from pathlib import Path

def resolve_file(filepath: Path) -> tuple[bool, int]:
    """Resolve conflicts keeping code before first >>>>>>> in each block."""
    try:
        lines = filepath.read_text().split('\n')
    except Exception as e:
        print(f"❌ Cannot read {filepath}: {e}")
        return False, 0

    resolved = []
    i = 0
    blocks_resolved = 0

    while i < len(lines):
        line = lines[i]

        # If we see >>>>>>> it starts a conflict tail section - delete until we exit
        if line.startswith('>>>>>>>'):
            blocks_resolved += 1
            # Skip this >>>>>>> and everything until the conflict block ends
            # (when we hit a line that's not ======= or >>>>>>>)
            while i < len(lines) and (lines[i].startswith('>>>>>>>') or lines[i].startswith('=======')):
                i += 1
                # Between ======= and >>>>>>>, skip content too
                if i < len(lines) and lines[i-1].startswith('======='):
                    while i < len(lines) and not lines[i].startswith('>>>>>>>') and not lines[i].startswith('======='):
                        i += 1
            continue

        # If we see ======= without preceding <<<<<<, it's part of a conflict tail
        elif line.startswith('======='):
            # Skip to next >>>>>>> or another =======
            i += 1
            while i < len(lines) and not lines[i].startswith('>>>>>>>') and not lines[i].startswith('======='):
                i += 1
            continue

        # If we see <<<<<<< HEAD, it's a full conflict block - keep HEAD section
        elif line.startswith('<<<<<<< HEAD'):
            blocks_resolved += 1
            i += 1  # Skip the <<<<<<< marker
            # Keep lines until =======
            while i < len(lines) and not lines[i].startswith('======='):
                resolved.append(lines[i])
                i += 1
            # Skip from ======= to end of conflict (all >>>>>>> and ======= markers)
            while i < len(lines) and (lines[i].startswith('=======') or lines[i].startswith('>>>>>>>')):
                i += 1
                if i < len(lines) and lines[i-1].startswith('======='):
                    while i < len(lines) and not lines[i].startswith('>>>>>>>') and not lines[i].startswith('======='):
                        i += 1
            continue

        # Normal line - keep it
        else:
            resolved.append(line)
            i += 1

    if blocks_resolved > 0:
        try:
            filepath.write_text('\n'.join(resolved))
            return True, blocks_resolved
        except Exception as e:
            print(f"❌ Cannot write {filepath}: {e}")
            return False, 0

    return True, 0

def main():
    # Reset files first to get conflict markers back
    print("🔄 Resetting files to HEAD (with conflict markers)...")
    import subprocess
    subprocess.run(['git', 'checkout', 'HEAD', 'src/'], check=True)

    src_dir = Path('src')
    conflicts = []

    # Find files with conflicts
    for ts_file in src_dir.rglob('*.ts'):
        try:
            content = ts_file.read_text()
            if any(m in content for m in ['<<<<<<<', '>>>>>>>', '=======']):
                conflicts.append(ts_file)
        except:
            pass

    if not conflicts:
        print("✓ No conflicts found")
        return 0

    print(f"\n🔧 Resolving {len(conflicts)} files with conflicts...\n")

    total_blocks = 0
    for filepath in sorted(conflicts):
        success, blocks = resolve_file(filepath)
        if success and blocks > 0:
            print(f"✓ {filepath.name}: {blocks} conflict blocks resolved")
            total_blocks += blocks

    print(f"\n✓ Resolved {total_blocks} conflict blocks in {len(conflicts)} files")
    return 0

if __name__ == '__main__':
    sys.exit(main())
