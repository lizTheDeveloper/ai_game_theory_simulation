#!/bin/bash
# Setup script for MLX-based embeddings with Zotero

set -e

echo "🔧 Setting up MLX embeddings for Zotero..."

# Check if we're on Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
    echo "⚠️  Warning: MLX requires Apple Silicon (M1/M2/M3/M4)"
    exit 1
fi

# Create a directory for MLX embedding server
INSTALL_DIR="$HOME/src/qwen3-embeddings-mlx"

if [ ! -d "$INSTALL_DIR" ]; then
    echo "📦 Cloning qwen3-embeddings-mlx..."
    git clone https://github.com/jakedahn/qwen3-embeddings-mlx.git "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# Install dependencies
echo "📚 Installing dependencies..."
if ! command -v uv &> /dev/null; then
    echo "Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi

# Create virtual environment with uv
uv venv
source .venv/bin/activate

# Install mlx-lm and dependencies
uv pip install -r requirements.txt
uv pip install mlx-lm flask

echo ""
echo "✅ MLX embedding server installed!"
echo ""
echo "📋 Next steps:"
echo "1. Start the MLX embedding server:"
echo "   cd $INSTALL_DIR && python server.py"
echo ""
echo "2. Start the OpenAI-compatible wrapper:"
echo "   python /Users/annhoward/src/superalignmenttoutopia/scripts/mlx-openai-wrapper.py"
echo ""
echo "3. Update your Zotero config to use MLX embeddings:"
echo "   Edit ~/.config/zotero-mcp/config.json or set env vars:"
echo "   ZOTERO_EMBEDDING_MODEL=openai"
echo "   OPENAI_BASE_URL=http://localhost:8001/v1"
echo "   OPENAI_API_KEY=dummy"
echo ""
echo "🚀 Model will auto-download (~900MB) on first run"
