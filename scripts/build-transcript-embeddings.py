#!/usr/bin/env python3
"""
Build FAISS embeddings index from YouTube transcript VTT files
Uses MLX-optimized Qwen3 embeddings (0.6B) for fast local inference on Apple Silicon
"""

import os
import re
import json
import pickle
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np
import faiss

print("Loading dependencies...")

# Configuration
RESEARCH_DIR = Path(__file__).parent.parent / "research"
EMBEDDING_MODEL = "mlx-community/Qwen3-Embedding-0.6B-4bit"  # Fast embeddings model
INDEX_DIR = Path(__file__).parent.parent / "research" / "embeddings"
CHUNK_SIZE = 512  # Tokens per chunk
CHUNK_OVERLAP = 128  # Overlap between chunks

INDEX_DIR.mkdir(exist_ok=True)

print(f"Research directory: {RESEARCH_DIR}")
print(f"Embedding model: {EMBEDDING_MODEL}")
print(f"Index directory: {INDEX_DIR}")


def extract_text_from_vtt(vtt_path: Path) -> str:
    """Extract clean text from WebVTT file."""
    with open(vtt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove VTT header and metadata
    lines = content.split('\n')
    text_lines = []

    for line in lines:
        # Skip WEBVTT header, timestamps, and metadata
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

        # Remove HTML-like tags (e.g., <00:00:00.320><c>)
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

    # Search all channel folders
    for channel_dir in RESEARCH_DIR.glob("*/transcripts"):
        if not channel_dir.is_dir():
            continue

        channel_name = channel_dir.parent.name
        print(f"  Scanning {channel_name}...")

        for vtt_file in channel_dir.glob("*.vtt"):
            # Extract video info from filename
            # Format: "Title [VideoID].en.vtt" or "Title.en.vtt"
            filename = vtt_file.stem  # Remove .en.vtt

            # Try to extract video ID from brackets
            video_id_match = re.search(r'\[([a-zA-Z0-9_-]{11})\]', filename)
            if video_id_match:
                video_id = video_id_match.group(1)
                title = filename[:video_id_match.start()].strip()
            else:
                # No video ID in filename, use filename as title
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


def generate_embeddings_mlx(texts: List[str], model, tokenizer) -> np.ndarray:
    """Generate embeddings using MLX with Qwen3."""
    print(f"  Generating {len(texts)} embeddings with MLX...")

    embeddings = []
    batch_size = 8  # Process in small batches for memory efficiency

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        # Tokenize batch
        inputs = tokenizer(
            batch,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="np"
        )

        # Convert to MLX arrays
        input_ids = mx.array(inputs['input_ids'])
        attention_mask = mx.array(inputs['attention_mask'])

        # Get model embeddings
        outputs = model(input_ids, attention_mask=attention_mask)

        # Mean pooling
        if hasattr(outputs, 'last_hidden_state'):
            hidden = outputs.last_hidden_state
        else:
            hidden = outputs[0]

        # Convert to numpy for FAISS
        hidden_np = np.array(hidden)
        attention_mask_np = np.array(attention_mask)

        # Mean pooling with attention mask
        for j in range(len(batch)):
            mask = attention_mask_np[j:j+1].T
            pooled = np.sum(hidden_np[j] * mask, axis=0) / np.sum(mask)
            embeddings.append(pooled)

        if (i + batch_size) % 100 == 0:
            print(f"    Processed {min(i + batch_size, len(texts))}/{len(texts)} chunks")

    return np.array(embeddings)


def build_faiss_index():
    """Main function to build FAISS index from all transcripts."""
    print("\n" + "="*80)
    print("Building FAISS Index from YouTube Transcripts")
    print("="*80 + "\n")

    # Step 1: Find all transcripts
    print("Step 1: Finding transcripts...")
    transcripts = get_all_transcripts()
    print(f"✓ Found {len(transcripts)} transcript files\n")

    if not transcripts:
        print("❌ No transcripts found. Run sync-all-channels.sh first.")
        return

    # Step 2: Extract and chunk text
    print("Step 2: Extracting and chunking text...")
    all_chunks = []
    chunk_metadata = []

    for vtt_path, metadata in transcripts:
        try:
            text = extract_text_from_vtt(vtt_path)
            chunks = chunk_text(text)

            for chunk_idx, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                chunk_metadata.append({
                    **metadata,
                    'chunk_index': chunk_idx,
                    'total_chunks': len(chunks)
                })

            print(f"  ✓ {metadata['channel']}: {metadata['title']} ({len(chunks)} chunks)")

        except Exception as e:
            print(f"  ⚠️  Error processing {vtt_path}: {e}")

    print(f"\n✓ Total chunks: {len(all_chunks)}\n")

    # Step 3: Load MLX embedding model
    print("Step 3: Loading Qwen3 embedding model with MLX...")
    print("  (This will download the model on first run)")

    try:
        from transformers import AutoTokenizer, AutoModel

        tokenizer = AutoTokenizer.from_pretrained(EMBEDDING_MODEL)
        model = AutoModel.from_pretrained(EMBEDDING_MODEL)

        print("✓ Model loaded\n")

    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("\nTrying alternative: sentence-transformers...")

        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        tokenizer = None
        print("✓ Fallback model loaded\n")

    # Step 4: Generate embeddings
    print("Step 4: Generating embeddings...")

    if tokenizer:
        # Use MLX model
        embeddings = generate_embeddings_mlx(all_chunks, model, tokenizer)
    else:
        # Use sentence-transformers fallback
        print("  Using sentence-transformers (fallback)...")
        embeddings = model.encode(all_chunks, show_progress_bar=True, convert_to_numpy=True)

    print(f"✓ Generated {len(embeddings)} embeddings")
    print(f"  Embedding dimension: {embeddings.shape[1]}\n")

    # Step 5: Build FAISS index
    print("Step 5: Building FAISS index...")

    dimension = embeddings.shape[1]

    # Use IndexFlatIP for inner product (cosine similarity with normalized vectors)
    # Normalize embeddings first
    faiss.normalize_L2(embeddings)

    # Create index
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    print(f"✓ FAISS index built with {index.ntotal} vectors\n")

    # Step 6: Save master index and metadata
    print("Step 6: Saving master index...")

    # Save FAISS index
    index_path = INDEX_DIR / "youtube_transcripts.index"
    faiss.write_index(index, str(index_path))
    print(f"✓ Saved master FAISS index: {index_path}")

    # Save metadata
    metadata_path = INDEX_DIR / "youtube_transcripts_metadata.pkl"
    with open(metadata_path, 'wb') as f:
        pickle.dump(chunk_metadata, f)
    print(f"✓ Saved master metadata: {metadata_path}")

    # Step 7: Build per-channel indexes
    print("\nStep 7: Building per-channel indexes...")

    channels = set(m['channel'] for m in chunk_metadata)

    for channel in sorted(channels):
        print(f"  Building index for {channel}...")

        # Get indices for this channel
        channel_indices = [i for i, m in enumerate(chunk_metadata) if m['channel'] == channel]
        channel_embeddings = embeddings[channel_indices]
        channel_metadata = [chunk_metadata[i] for i in channel_indices]

        # Normalize
        faiss.normalize_L2(channel_embeddings)

        # Create channel index
        channel_index = faiss.IndexFlatIP(dimension)
        channel_index.add(channel_embeddings)

        # Save channel index
        channel_index_path = INDEX_DIR / f"{channel}.index"
        faiss.write_index(channel_index, str(channel_index_path))

        # Save channel metadata
        channel_metadata_path = INDEX_DIR / f"{channel}_metadata.pkl"
        with open(channel_metadata_path, 'wb') as f:
            pickle.dump(channel_metadata, f)

        print(f"    ✓ {channel}: {len(channel_indices)} chunks")

    # Save stats
    stats = {
        'total_transcripts': len(transcripts),
        'total_chunks': len(all_chunks),
        'embedding_dimension': dimension,
        'embedding_model': EMBEDDING_MODEL,
        'chunk_size': CHUNK_SIZE,
        'chunk_overlap': CHUNK_OVERLAP,
        'channels': list(set(m['channel'] for m in chunk_metadata))
    }

    stats_path = INDEX_DIR / "index_stats.json"
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)
    print(f"✓ Saved stats: {stats_path}")

    # Summary
    print("\n" + "="*80)
    print("Index Build Complete!")
    print("="*80)
    print(f"Transcripts processed: {stats['total_transcripts']}")
    print(f"Total chunks: {stats['total_chunks']}")
    print(f"Embedding dimension: {stats['embedding_dimension']}")
    print(f"Channels indexed: {', '.join(stats['channels'])}")
    print(f"\nIndex location: {INDEX_DIR}")
    print("\nUse search-transcripts.py to query the index.")


if __name__ == "__main__":
    build_faiss_index()
