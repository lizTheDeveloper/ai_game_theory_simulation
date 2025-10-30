#!/bin/bash
# Query paper sections by type

SECTIONS_DIR="research/embeddings/by_section"

if [ ! -d "$SECTIONS_DIR" ]; then
    echo "❌ Sections directory not found. Run reindex-all-papers.py first."
    exit 1
fi

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <section_type> [search_term]"
    echo ""
    echo "Available sections:"
    ls -1 "$SECTIONS_DIR"/*.json 2>/dev/null | xargs -n1 basename | sed 's/.json$//'
    echo ""
    echo "Examples:"
    echo "  # Show all abstracts"
    echo "  $0 abstract"
    echo ""
    echo "  # Search abstracts for 'alignment'"
    echo "  $0 abstract alignment"
    echo ""
    echo "  # Search results sections for 'mortality'"
    echo "  $0 results mortality"
    echo ""
    echo "  # Count sections by type"
    echo "  for s in abstract introduction methods results discussion conclusion; do"
    echo "    echo \"\$s: \$(jq '.count' $SECTIONS_DIR/\$s.json 2>/dev/null || echo 0)\""
    echo "  done"
    exit 0
fi

SECTION_TYPE="$1"
SEARCH_TERM="${2:-}"

SECTION_FILE="$SECTIONS_DIR/$SECTION_TYPE.json"

if [ ! -f "$SECTION_FILE" ]; then
    echo "❌ Section type '$SECTION_TYPE' not found."
    echo "Available sections:"
    ls -1 "$SECTIONS_DIR"/*.json 2>/dev/null | xargs -n1 basename | sed 's/.json$//' | sed 's/^/  /'
    exit 1
fi

# Count total chunks
TOTAL=$(jq '.count' "$SECTION_FILE")
echo "📊 Found $TOTAL $SECTION_TYPE sections across all papers"
echo ""

if [ -z "$SEARCH_TERM" ]; then
    # Show all sections (limit to first 10)
    echo "Showing first 10 sections (use jq to see all):"
    echo ""
    jq -r '.chunks[0:10][] | "[\(.source)]\\n\(.text[0:200])...\\n"' "$SECTION_FILE"
else
    # Search for term
    echo "Searching for '$SEARCH_TERM':"
    echo ""
    jq -r ".chunks[] | select(.text | ascii_downcase | contains(\"$(echo "$SEARCH_TERM" | tr '[:upper:]' '[:lower:]')\")) | \"[\(.source)]\\n\(.section_header)\\n\(.text[0:300])...\\n\"" "$SECTION_FILE"
fi
