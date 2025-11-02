#!/bin/bash
# Setup minimal Python environment for autonomous worker
# (Citation checking + optional RAG servers, without 5.5GB PyTorch/CUDA)

set -e

echo "Creating Python virtual environment..."
python3 -m venv .venv

echo "Activating environment..."
source .venv/bin/activate

echo "Installing minimal dependencies (434MB vs 5.5GB)..."
pip install --upgrade pip
pip install -r requirements-minimal.txt

echo "Downloading spaCy language model..."
python -m spacy download en_core_web_sm

echo ""
echo "✅ Setup complete!"
echo ""
echo "Installed:"
echo "  - spaCy (for citation checking)"
echo "  - FastMCP + Anthropic (for optional RAG servers)"
echo "  - BeautifulSoup + Requests (for web scraping)"
echo ""
echo "NOT installed (use requirements.txt if needed):"
echo "  - PyTorch/CUDA (5GB+)"
echo "  - sentence-transformers (depends on PyTorch)"
echo "  - MLX (Apple Silicon only - Mac-only)"
echo ""
echo "Total size: 434MB (vs 5.5GB with full requirements.txt)"
