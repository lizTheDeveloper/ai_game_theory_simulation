#!/bin/bash

cd research || exit

echo "=== FILES MISSING last_verified DATES ==="
echo ""

for file in $(grep -rh "research/" ../src/simulation --include="*.ts" | grep -oP "research/[a-zA-Z0-9_-]+\.md" | sort | uniq | sed 's/research\///'); do
  if [ -f "$file" ]; then
    last_ver=$(grep -iE "^last_verified:" "$file" 2>/dev/null | head -1)
    if [ -z "$last_ver" ]; then
      echo "⚠️  $file"
    fi
  fi
done

echo ""
echo "=== END ==="
