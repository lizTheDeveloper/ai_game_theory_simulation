#!/usr/bin/env python3
"""
Test PDF search functionality directly (without MCP).
Verifies the index works correctly.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import sqlite3
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
INDEX_DIR = PROJECT_ROOT / "research" / "embeddings"
DB_PATH = INDEX_DIR / "pdfs.db"
INDEX_PATH = INDEX_DIR / "pdfs.index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

print("🔍 PDF Search Test")
print(f"📊 Index: {INDEX_PATH}")
print(f"💾 Database: {DB_PATH}")
print()

# Load model and index
print("📚 Loading embedding model...")
model = SentenceTransformer(EMBEDDING_MODEL)
print("✅ Model loaded")

print("📊 Loading FAISS index...")
index = faiss.read_index(str(INDEX_PATH))
print(f"✅ Index loaded: {index.ntotal} vectors")

print("🗄️ Connecting to database...")
conn = sqlite3.connect(str(DB_PATH))
conn.row_factory = sqlite3.Row
print("✅ Database connected")

# Get stats
cursor = conn.cursor()
pdf_count = cursor.execute('SELECT COUNT(*) FROM pdfs').fetchone()[0]
page_count = cursor.execute('SELECT COUNT(*) FROM pages').fetchone()[0]

print(f"\n📈 Index Statistics:")
print(f"   PDFs: {pdf_count}")
print(f"   Pages: {page_count}")
print(f"   Vectors: {index.ntotal}")

# Test searches
test_queries = [
    "planetary boundaries climate change",
    "AI water consumption data centers",
    "nuclear winter temperature",
    "superintelligence alignment"
]

print("\n🧪 Running test queries...")
for query in test_queries:
    print(f"\n📝 Query: '{query}'")

    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_embedding)

    # Search
    distances, indices = index.search(query_embedding, 3)

    # Get results
    for i, (idx, distance) in enumerate(zip(indices[0], distances[0]), 1):
        cursor.execute('''
            SELECT
                p.page_text,
                p.page_num,
                pdf.title,
                pdf.author,
                pdf.filename
            FROM pages p
            JOIN pdfs pdf ON p.pdf_id = pdf.id
            WHERE p.faiss_index = ?
        ''', (int(idx),))

        row = cursor.fetchone()
        if row:
            print(f"\n  Result {i} (similarity: {distance:.3f}):")
            print(f"    📄 {row['filename']}")
            print(f"    📖 {row['title'][:80]}...")
            print(f"    👤 {row['author'][:50] if row['author'] else 'Unknown'}")
            print(f"    📃 Page {row['page_num'] + 1}")
            print(f"    📝 Preview: {row['page_text'][:150].replace(chr(10), ' ')}...")

conn.close()
print("\n✅ Test complete!")
