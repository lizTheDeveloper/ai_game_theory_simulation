#!/bin/bash
# Start MLX embedding servers for Zotero
# Run this before starting Claude Desktop or Claude Code if you want MLX embeddings

set -e

echo "🚀 Starting MLX embedding servers..."

# Check if servers are already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ MLX server already running on port 8000"
else
    echo "📦 Starting MLX server (port 8000)..."
    cd /Users/annhoward/src/qwen3-embeddings-mlx
    source .venv/bin/activate
    nohup python server.py > /tmp/mlx-server.log 2>&1 &
    echo $! > /tmp/mlx-server.pid
    echo "   PID: $(cat /tmp/mlx-server.pid)"
    sleep 3
fi

if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ OpenAI wrapper already running on port 8001"
else
    echo "🔌 Starting OpenAI wrapper (port 8001)..."
    cd /Users/annhoward/src/superalignmenttoutopia
    source .venv/bin/activate
    nohup python scripts/mlx-openai-wrapper.py > /tmp/mlx-wrapper.log 2>&1 &
    echo $! > /tmp/mlx-wrapper.pid
    echo "   PID: $(cat /tmp/mlx-wrapper.pid)"
    sleep 2
fi

# Health checks
echo ""
echo "🔍 Health checks..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ MLX server: healthy"
else
    echo "❌ MLX server: not responding"
fi

if curl -s http://localhost:8001/health | grep -q "ok"; then
    echo "✅ OpenAI wrapper: healthy"
else
    echo "❌ OpenAI wrapper: not responding"
fi

echo ""
echo "✨ MLX embedding servers are ready!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Claude Desktop or Claude Code"
echo "   2. Zotero MCP will automatically use MLX embeddings"
echo ""
echo "📊 Monitoring:"
echo "   - MLX server log:  tail -f /tmp/mlx-server.log"
echo "   - Wrapper log:     tail -f /tmp/mlx-wrapper.log"
echo ""
echo "🛑 To stop servers:"
echo "   ./scripts/stop-mlx-embeddings.sh"
