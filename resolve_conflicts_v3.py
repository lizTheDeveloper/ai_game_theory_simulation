#!/usr/bin/env python3
"""
Resolve merge conflicts - handle partial merges with orphaned markers.

Pattern in files (from partial merges):
    actual_code_we_want_to_keep   <-- KEEP THIS
    >>>>>>> origin/branch1          <-- DELETE
    =======                         <-- DELETE
    alternative_code                <-- DELETE
    >>>>>>> origin/branch2          <-- DELETE
    =======                         <-- DELETE
    more_alternative_code           <-- DELETE
    >>>>>>> origin/branch3          <-- DELETE

Strategy: Delete any line that is a conflict marker (=======, >>>>>>>, <<<<<<)
          AND delete lines between ======= and >>>>>>> markers
"""

import sys
from pathlib import Path

def resolve_conflicts_in_file(filepath: Path) -> tuple[bool, int]:
    """
    Resolve conflicts by removing all conflict markers and their enclosed content.
    Returns (success, lines_removed)
    """
    try:
        content = filepath.read_text()
    except Exception as e:
        print(f"❌ Cannot read {filepath}: {e}")
        return False, 0

    lines = content.split('\n')
    resolved_lines = []
    i = 0
    lines_removed = 0
    in_conflict = False  # Are we inside a conflict region (between ======= and >>>>>>>)?

    while i < len(lines):
        line = lines[i]

        # Check if this is a conflict marker line
        if line.startswith('<<<<<<< '):
            # Start of conflict block - skip this marker
            in_conflict = False  # Reset (though we'll set it again at =======)
            lines_removed += 1
            i += 1
            continue

        elif line.startswith('======='):
            # Start of "theirs" section - skip marker and enter conflict mode
            in_conflict = True
            lines_removed += 1
            i += 1
            continue

        elif line.startswith('>>>>>>>'):
            # End of conflict block - skip marker and exit conflict mode
            in_conflict = False
            lines_removed += 1
            i += 1
            continue

        elif in_conflict:
            # We're inside a "theirs" section - skip this line
            lines_removed += 1
            i += 1
            continue

        else:
            # Normal line or HEAD content - keep it
            resolved_lines.append(line)
            i += 1

    if lines_removed > 0:
        resolved_content = '\n'.join(resolved_lines)
        try:
            filepath.write_text(resolved_content)
            return True, lines_removed
        except Exception as e:
            print(f"❌ Cannot write {filepath}: {e}")
            return False, 0
    else:
        return True, 0

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
            # Check for any conflict markers
            has_markers = any(
                marker in content
                for marker in ['<<<<<<<', '=======', '>>>>>>>']
            )
            if has_markers:
                conflicts.append(ts_file)
        except:
            pass

    if not conflicts:
        print("✓ No conflict markers found")
        return 0

    print(f"\n🔧 Resolving conflicts in {len(conflicts)} files...\n")

    total_lines_removed = 0
    success_count = 0

    for filepath in sorted(conflicts):
        success, lines_removed = resolve_conflicts_in_file(filepath)
        if success:
            success_count += 1
            if lines_removed > 0:
                print(f"✓ {filepath.name}: Removed {lines_removed} conflict lines")
                total_lines_removed += lines_removed

    print(f"\n✓ Processed {success_count}/{len(conflicts)} files")
    print(f"✓ Removed {total_lines_removed} total conflict lines")

    return 0

if __name__ == '__main__':
    sys.exit(main())
