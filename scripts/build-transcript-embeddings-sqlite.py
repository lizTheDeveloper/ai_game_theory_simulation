#!/usr/bin/env python3
"""
Build FAISS embeddings index from YouTube transcript VTT files with SQLite metadata storage
Uses sentence-transformers for fast local inference on Apple Silicon
"""

import os
import re
import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

print("Loading dependencies...")

# Configuration
RESEARCH_DIR = Path(__file__).parent.parent / "research"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
INDEX_DIR = Path(__file__).parent.parent / "research" / "embeddings"
DB_PATH = INDEX_DIR / "transcripts.db"
CHUNK_SIZE = 512  # Words per chunk
CHUNK_OVERLAP = 128  # Overlap between chunks

INDEX_DIR.mkdir(exist_ok=True)

print(f"Research directory: {RESEARCH_DIR}")
print(f"Embedding model: {EMBEDDING_MODEL}")
print(f"Index directory: {INDEX_DIR}")
print(f"Database: {DB_PATH}\n")


def init_database():
    """Initialize SQLite database with schema."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Videos table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT UNIQUE,
            title TEXT NOT NULL,
            channel TEXT NOT NULL,
            url TEXT,
            file_path TEXT NOT NULL,
            full_transcript TEXT,
            word_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Chunks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id INTEGER NOT NULL,
            chunk_index INTEGER NOT NULL,
            chunk_text TEXT NOT NULL,
            word_count INTEGER,
            faiss_index INTEGER NOT NULL,
            FOREIGN KEY (video_id) REFERENCES videos(id)
        )
    ''')

    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_video_id ON videos(video_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_channel ON videos(channel)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chunks_video ON chunks(video_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chunks_faiss ON chunks(faiss_index)')

    conn.commit()
    return conn


def extract_text_from_vtt(vtt_path: Path) -> str:
    """Extract clean text from WebVTT file."""
    with open(vtt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    text_lines = []

    for line in lines:
        if line.startswith('WEBVTT'):
            continue
        if line.startswith('Kind:'):
            continue
        if line.startswith('Language:'):
            continue
        if '-->' in line:
            continue
        if re.match(r'^\d{2}:\d{2}:\d{2}\.\d{3}', line):
            continue
        if line.strip().startswith('align:'):
            continue
        if not line.strip():
            continue

        clean_line = re.sub(r'<[^>]+>', '', line)
        if clean_line.strip():
            text_lines.append(clean_line.strip())

    return ' '.join(text_lines)


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks by word count."""
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)

    return chunks


def get_all_transcripts() -> List[Tuple[Path, Dict[str, str]]]:
    """Find all VTT transcripts and extract metadata."""
    transcripts = []

    for channel_dir in RESEARCH_DIR.glob("*/transcripts"):
        if not channel_dir.is_dir():
            continue

        channel_name = channel_dir.parent.name
        print(f"  Scanning {channel_name}...")

        for vtt_file in channel_dir.glob("*.vtt"):
            filename = vtt_file.stem

            video_id_match = re.search(r'\[([a-zA-Z0-9_-]{11})\]', filename)
            if video_id_match:
                video_id = video_id_match.group(1)
                title = filename[:video_id_match.start()].strip()
            else:
                title = filename.replace('.en', '')
                video_id = None

            metadata = {
                'title': title,
                'video_id': video_id,
                'channel': channel_name,
                'file_path': str(vtt_file),
                'url': f"https://www.youtube.com/watch?v={video_id}" if video_id else None
            }

            transcripts.append((vtt_file, metadata))

    return transcripts


def build_faiss_index():
    """Main function to build FAISS index with SQLite metadata."""
    print("\n" + "="*80)
    print("Building FAISS Index with SQLite Metadata")
    print("="*80 + "\n")

    # Step 1: Initialize database
    print("Step 1: Initializing SQLite database...")
    conn = init_database()
    cursor = conn.cursor()
    print("✓ Database initialized\n")

    # Step 2: Find all transcripts
    print("Step 2: Finding transcripts...")
    transcripts = get_all_transcripts()
    print(f"✓ Found {len(transcripts)} transcript files\n")

    if not transcripts:
        print("❌ No transcripts found. Run sync-all-channels.sh first.")
        return

    # Step 3: Extract text, chunk, and save to database
    print("Step 3: Processing transcripts and storing in database...")
    all_chunks = []
    faiss_index_counter = 0

    for vtt_path, metadata in transcripts:
        try:
            text = extract_text_from_vtt(vtt_path)
            chunks = chunk_text(text)
            word_count = len(text.split())

            # Insert video
            cursor.execute('''
                INSERT OR REPLACE INTO videos
                (video_id, title, channel, url, file_path, full_transcript, word_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (metadata['video_id'], metadata['title'], metadata['channel'],
                  metadata['url'], metadata['file_path'], text, word_count))

            video_db_id = cursor.lastrowid

            # Insert chunks
            for chunk_idx, chunk in enumerate(chunks):
                cursor.execute('''
                    INSERT INTO chunks
                    (video_id, chunk_index, chunk_text, word_count, faiss_index)
                    VALUES (?, ?, ?, ?, ?)
                ''', (video_db_id, chunk_idx, chunk, len(chunk.split()), faiss_index_counter))

                all_chunks.append(chunk)
                faiss_index_counter += 1

            print(f"  ✓ {metadata['channel']}: {metadata['title']} ({len(chunks)} chunks)")

        except Exception as e:
            print(f"  ⚠️  Error processing {vtt_path}: {e}")

    conn.commit()
    print(f"\n✓ Total chunks: {len(all_chunks)}\n")

    # Step 4: Load embedding model
    print("Step 4: Loading sentence-transformers model...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print("✓ Model loaded\n")

    # Step 5: Generate embeddings
    print("Step 5: Generating embeddings...")
    embeddings = model.encode(all_chunks, show_progress_bar=True, convert_to_numpy=True)
    print(f"✓ Generated {len(embeddings)} embeddings")
    print(f"  Embedding dimension: {embeddings.shape[1]}\n")

    # Step 6: Build FAISS index
    print("Step 6: Building FAISS index...")
    dimension = embeddings.shape[1]
    faiss.normalize_L2(embeddings)
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    print(f"✓ FAISS index built with {index.ntotal} vectors\n")

    # Step 7: Save master index
    print("Step 7: Saving master index...")
    index_path = INDEX_DIR / "youtube_transcripts.index"
    faiss.write_index(index, str(index_path))
    print(f"✓ Saved master FAISS index: {index_path}\n")

    # Step 8: Build per-channel indexes
    print("Step 8: Building per-channel indexes...")
    channels = cursor.execute('SELECT DISTINCT channel FROM videos').fetchall()

    for (channel,) in channels:
        print(f"  Building index for {channel}...")

        # Get chunks for this channel
        cursor.execute('''
            SELECT c.faiss_index, c.chunk_text
            FROM chunks c
            JOIN videos v ON c.video_id = v.id
            WHERE v.channel = ?
            ORDER BY c.faiss_index
        ''', (channel,))

        channel_data = cursor.fetchall()
        channel_indices = [row[0] for row in channel_data]
        channel_embeddings = embeddings[channel_indices]

        faiss.normalize_L2(channel_embeddings)
        channel_index = faiss.IndexFlatIP(dimension)
        channel_index.add(channel_embeddings)

        channel_index_path = INDEX_DIR / f"{channel}.index"
        faiss.write_index(channel_index, str(channel_index_path))
        print(f"    ✓ {channel}: {len(channel_indices)} chunks")

    # Step 9: Save stats
    print("\nStep 9: Saving statistics...")
    total_videos = cursor.execute('SELECT COUNT(*) FROM videos').fetchone()[0]
    total_chunks = cursor.execute('SELECT COUNT(*) FROM chunks').fetchone()[0]
    channels_list = [row[0] for row in channels]

    stats = {
        'total_videos': total_videos,
        'total_chunks': total_chunks,
        'embedding_dimension': dimension,
        'embedding_model': EMBEDDING_MODEL,
        'chunk_size': CHUNK_SIZE,
        'chunk_overlap': CHUNK_OVERLAP,
        'channels': channels_list,
        'database': str(DB_PATH)
    }

    stats_path = INDEX_DIR / "index_stats.json"
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)
    print(f"✓ Saved stats: {stats_path}")

    conn.close()

    # Summary
    print("\n" + "="*80)
    print("Index Build Complete!")
    print("="*80)
    print(f"Videos indexed: {stats['total_videos']}")
    print(f"Total chunks: {stats['total_chunks']}")
    print(f"Embedding dimension: {stats['embedding_dimension']}")
    print(f"Channels: {', '.join(stats['channels'])}")
    print(f"\nDatabase: {DB_PATH}")
    print(f"Index location: {INDEX_DIR}")
    print("\nUse search-transcripts-sqlite.py to query the index.")


if __name__ == "__main__":
    build_faiss_index()
