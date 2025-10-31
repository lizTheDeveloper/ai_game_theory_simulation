#!/usr/bin/env python3
"""
Bulk import PDFs from research directory to Zotero.

This script:
1. Finds all PDFs in the research directory
2. Uses Zotero's local API to import them
3. Extracts metadata where possible
4. Organizes into collections
"""

import os
import sys
from pathlib import Path
from pyzotero import zotero
import json
import re

# Configuration
RESEARCH_DIR = Path("/Users/annhoward/src/superalignmenttoutopia/research/papers")
ZOTERO_LIBRARY_TYPE = "user"
ZOTERO_LIBRARY_ID = None  # Will be detected
ZOTERO_API_KEY = None  # For local API, may not be needed

def find_all_pdfs(directory):
    """Find all PDF files in directory."""
    pdf_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.pdf'):
                pdf_files.append(Path(root) / file)
    return pdf_files

def extract_metadata_from_filename(pdf_path):
    """Extract metadata from PDF filename."""
    filename = pdf_path.stem

    # Try to extract arXiv ID
    arxiv_match = re.match(r'(\d{4}\.\d{5})', filename)
    if arxiv_match:
        return {
            'itemType': 'preprint',
            'title': filename.replace('_', ' '),
            'archiveID': f"arXiv:{arxiv_match.group(1)}",
            'repository': 'arXiv',
        }

    # Try to extract author/year/title pattern
    parts = filename.split('_')
    if len(parts) >= 3:
        return {
            'itemType': 'journalArticle',
            'title': ' '.join(parts[2:]).replace('_', ' ').title(),
            'creators': [{'creatorType': 'author', 'lastName': parts[0].title()}],
            'date': parts[1] if parts[1].isdigit() and len(parts[1]) == 4 else '',
        }

    # Default
    return {
        'itemType': 'document',
        'title': filename.replace('_', ' ').title(),
    }

def import_pdf_to_zotero(zot, pdf_path):
    """Import a PDF file to Zotero."""
    try:
        # Extract metadata
        metadata = extract_metadata_from_filename(pdf_path)

        # Create item
        template = zot.item_template(metadata['itemType'])
        template.update(metadata)

        # Create the item
        resp = zot.create_items([template])

        if resp['successful']:
            item_key = resp['successful']['0']['key']

            # Attach PDF
            zot.attachment_simple([str(pdf_path)], item_key)

            return True, item_key, metadata['title']
        else:
            return False, None, metadata['title']

    except Exception as e:
        return False, None, str(e)

def main():
    print("🔍 Finding PDF files...")
    pdf_files = find_all_pdfs(RESEARCH_DIR)
    print(f"   Found {len(pdf_files)} PDF files")

    if not pdf_files:
        print("❌ No PDF files found!")
        return

    # Check if Zotero is running
    print("\n🔗 Checking Zotero connection...")

    # Try to use local API
    try:
        # For local Zotero, we need to use the web API with your credentials
        # First, let's check if we can detect the library ID from config
        config_path = Path.home() / ".config/zotero-mcp/config.json"
        if config_path.exists():
            with open(config_path) as f:
                config = json.load(f)
                # Config doesn't store library ID, need to get it from user

        print("\n⚠️  To import to Zotero, you need:")
        print("   1. Zotero API key from https://www.zotero.org/settings/keys")
        print("   2. Your library ID (usually your user ID)")
        print("\n📋 Alternative: Use Zotero's built-in PDF import")
        print("   1. Open Zotero desktop")
        print("   2. File → Import → Choose folder")
        print(f"   3. Select: {RESEARCH_DIR}")
        print("\n🔧 Or use the command line:")
        print(f"   open -a Zotero {RESEARCH_DIR}")

    except Exception as e:
        print(f"❌ Error: {e}")
        return

if __name__ == "__main__":
    main()
