#!/usr/bin/env python3
"""Clean merge conflict markers from OpenSpec files."""

import re
from pathlib import Path

def clean_merge_markers(file_path: Path) -> tuple[str, int]:
    """Remove merge conflict markers from a file.

    Returns:
        Tuple of (cleaned content, number of markers removed)
    """
    content = file_path.read_text()
    original_lines = content.splitlines(keepends=True)
    cleaned_lines = []
    markers_removed = 0

    for line in original_lines:
        # Skip merge conflict markers
        if re.match(r'^<<<<<<< ', line):
            markers_removed += 1
            continue
        if re.match(r'^=======\s*$', line):
            markers_removed += 1
            continue
        if re.match(r'^>>>>>>> ', line):
            markers_removed += 1
            continue

        cleaned_lines.append(line)

    return ''.join(cleaned_lines), markers_removed

def main():
    """Clean all OpenSpec files."""
    files = [
        'openspec/specs/project/spec.md',
        'openspec/specs/simulation/spec.md',
        'openspec/specs/frontend/spec.md',
        'openspec/specs/research/verification-queue.md',
    ]

    total_markers = 0
    for file_path in files:
        path = Path(file_path)
        if not path.exists():
            print(f"❌ File not found: {file_path}")
            continue

        cleaned_content, markers = clean_merge_markers(path)
        if markers > 0:
            path.write_text(cleaned_content)
            print(f"✅ {file_path}: Removed {markers} merge markers")
            total_markers += markers
        else:
            print(f"✅ {file_path}: No markers found")

    print(f"\n✅ Total markers removed: {total_markers}")

if __name__ == '__main__':
    main()
