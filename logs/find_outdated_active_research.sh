#!/bin/bash

# Find research files that are:
# 1. Referenced in simulation code
# 2. Have sources >5 years old

echo "=== ACTIVELY-USED RESEARCH FILES WITH OUTDATED SOURCES ==="
echo ""

grep -rh "research/" src/simulation --include="*.ts" | grep -oP "research/[a-zA-Z0-9_-]+\.md" | sort | uniq | while IFS= read -r file; do
  basename_file=$(basename "$file")
  full_path="research/$basename_file"

  if [ -f "$full_path" ]; then
    oldest=$(grep -iE "^oldest_source:" "$full_path" 2>/dev/null | head -1 | grep -oP "[0-9]{4}" | head -1)

    if [ ! -z "$oldest" ]; then
      age=$((2025 - oldest))
      if [ $age -gt 5 ]; then
        # Check last_verified date
        last_verified=$(grep -iE "^last_verified:" "$full_path" 2>/dev/null | head -1)
        echo "FILE: $basename_file"
        echo "  Oldest source: $oldest ($age years old)"
        echo "  $last_verified"
        echo ""
      fi
    fi
  fi
done

echo "=== END ==="
