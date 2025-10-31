#!/usr/bin/env python3
"""
OpenAI-compatible wrapper for qwen3-embeddings-mlx server.

This allows zotero-mcp (and other tools expecting OpenAI embedding API)
to use the local MLX Qwen embedding server.

Usage:
1. Start qwen3-embeddings-mlx server: python server.py (port 8000)
2. Start this wrapper: python mlx-openai-wrapper.py (port 8001)
3. Configure zotero-mcp:
   ZOTERO_EMBEDDING_MODEL=openai
   OPENAI_BASE_URL=http://localhost:8001/v1
   OPENAI_API_KEY=dummy (any value, not used)
"""

from flask import Flask, request, jsonify
import requests
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

MLX_SERVER_URL = "http://localhost:8000"

@app.route('/v1/embeddings', methods=['POST'])
def create_embedding():
    """OpenAI-compatible embedding endpoint that proxies to MLX server."""
    try:
        data = request.json

        # OpenAI format: {"input": "text" or ["text1", "text2"], "model": "..."}
        input_text = data.get('input', '')
        model = data.get('model', 'small')  # small, medium, or large

        # Convert to list if single string
        if isinstance(input_text, str):
            texts = [input_text]
            single_input = True
        else:
            texts = input_text
            single_input = False

        # Call MLX server's batch endpoint
        mlx_response = requests.post(
            f"{MLX_SERVER_URL}/embed_batch",
            json={"texts": texts, "model": model},
            timeout=30
        )
        mlx_response.raise_for_status()
        mlx_data = mlx_response.json()

        # Convert MLX format to OpenAI format
        embeddings_list = mlx_data.get('embeddings', [])

        # OpenAI response format
        openai_response = {
            "object": "list",
            "data": [
                {
                    "object": "embedding",
                    "embedding": emb,
                    "index": idx
                }
                for idx, emb in enumerate(embeddings_list)
            ],
            "model": model,
            "usage": {
                "prompt_tokens": sum(len(t.split()) for t in texts),
                "total_tokens": sum(len(t.split()) for t in texts)
            }
        }

        return jsonify(openai_response)

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/v1/models', methods=['GET'])
def list_models():
    """List available models (OpenAI-compatible)."""
    return jsonify({
        "object": "list",
        "data": [
            {"id": "small", "object": "model", "owned_by": "mlx"},
            {"id": "medium", "object": "model", "owned_by": "mlx"},
            {"id": "large", "object": "model", "owned_by": "mlx"}
        ]
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    try:
        # Check if MLX server is accessible
        resp = requests.get(f"{MLX_SERVER_URL}/health", timeout=2)
        if resp.status_code == 200:
            return jsonify({"status": "ok", "mlx_server": "connected"})
        else:
            return jsonify({"status": "degraded", "mlx_server": "error"}), 503
    except Exception as e:
        return jsonify({"status": "down", "error": str(e)}), 503

if __name__ == '__main__':
    print("🚀 Starting OpenAI-compatible MLX embedding wrapper on port 8001")
    print(f"📍 Proxying to MLX server at {MLX_SERVER_URL}")
    print("📝 Configure zotero-mcp with:")
    print("   ZOTERO_EMBEDDING_MODEL=openai")
    print("   OPENAI_BASE_URL=http://localhost:8001/v1")
    print("   OPENAI_API_KEY=dummy")
    app.run(host='0.0.0.0', port=8001, debug=False)
