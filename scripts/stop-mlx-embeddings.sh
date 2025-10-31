#!/bin/bash
# Stop MLX embedding servers

echo "🛑 Stopping MLX embedding servers..."

# Stop wrapper
if [ -f /tmp/mlx-wrapper.pid ]; then
    PID=$(cat /tmp/mlx-wrapper.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "   Stopping OpenAI wrapper (PID: $PID)..."
        kill $PID
        rm /tmp/mlx-wrapper.pid
    fi
else
    # Try to find by port
    PID=$(lsof -ti:8001)
    if [ ! -z "$PID" ]; then
        echo "   Stopping OpenAI wrapper (PID: $PID)..."
        kill $PID
    fi
fi

# Stop MLX server
if [ -f /tmp/mlx-server.pid ]; then
    PID=$(cat /tmp/mlx-server.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "   Stopping MLX server (PID: $PID)..."
        kill $PID
        rm /tmp/mlx-server.pid
    fi
else
    # Try to find by port
    PID=$(lsof -ti:8000)
    if [ ! -z "$PID" ]; then
        echo "   Stopping MLX server (PID: $PID)..."
        kill $PID
    fi
fi

sleep 1

# Verify stopped
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Warning: Something still listening on port 8000"
else
    echo "✅ Port 8000 free"
fi

if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Warning: Something still listening on port 8001"
else
    echo "✅ Port 8001 free"
fi

echo ""
echo "✨ MLX embedding servers stopped"
echo "   To switch back to default embeddings, edit configs:"
echo "   - .mcp.json: ZOTERO_EMBEDDING_MODEL=default"
echo "   - claude_desktop_config.json: ZOTERO_EMBEDDING_MODEL=default"
