#!/usr/bin/env python3
"""
MARCUS 3.0 Citation Worker Metrics Aggregator

HTTP server that exposes aggregated Prometheus metrics from all citation workers.
Uses connection pooling pattern - single endpoint for all worker metrics.

Architecture:
- All citation workers share the same Prometheus registry (METRICS_REGISTRY)
- This server exposes that shared registry at port 9300
- Prometheus scrapes once, gets all worker metrics
- Similar to database connection pooling (reduces overhead)

Port: 9300 (citation-worker-metrics)

Author: Marcus (Platform Engineer)
Date: 2025-11-22
"""

import logging
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

# Import the shared registry from citation_worker
try:
    # Add parent directory to path to import citation_worker
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'agents'))
    from citation_worker import METRICS_REGISTRY
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
except ImportError as e:
    print(f"❌ Failed to import dependencies: {e}")
    print("Ensure prometheus_client is installed and citation_worker.py is available")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MetricsHandler(BaseHTTPRequestHandler):
    """HTTP handler for Prometheus metrics endpoint."""

    def log_message(self, format, *args):
        """Override to use structured logging."""
        logger.info(f"{self.address_string()} - {format % args}")

    def do_GET(self):
        """Handle GET requests for /metrics and /health endpoints."""
        if self.path == '/metrics':
            self.handle_metrics()
        elif self.path == '/health':
            self.handle_health()
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Not Found\n\nAvailable endpoints:\n  /metrics - Prometheus metrics\n  /health - Health check\n')

    def handle_metrics(self):
        """Serve Prometheus metrics from shared registry."""
        try:
            metrics = generate_latest(METRICS_REGISTRY)
            self.send_response(200)
            self.send_header('Content-Type', CONTENT_TYPE_LATEST)
            self.end_headers()
            self.wfile.write(metrics)
        except Exception as e:
            logger.error(f"❌ Failed to generate metrics: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f'Error generating metrics: {e}\n'.encode())

    def handle_health(self):
        """Health check endpoint."""
        try:
            health_status = {
                'status': 'ok',
                'service': 'worker-metrics-aggregator',
                'port': 9300,
                'description': 'Aggregated Prometheus metrics from all citation workers'
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(health_status, indent=2).encode())
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f'Error: {e}\n'.encode())


def main():
    """Start the metrics aggregator HTTP server."""
    port = int(os.getenv('METRICS_PORT', '9300'))
    host = os.getenv('METRICS_HOST', '0.0.0.0')

    logger.info("🚀 Starting Citation Worker Metrics Aggregator")
    logger.info(f"   Port: {port}")
    logger.info(f"   Host: {host}")
    logger.info(f"   Pattern: Connection pooling (single endpoint for all workers)")

    try:
        server = HTTPServer((host, port), MetricsHandler)
        logger.info(f"✅ Metrics server listening on http://{host}:{port}")
        logger.info(f"   Endpoints:")
        logger.info(f"     - http://localhost:{port}/metrics (Prometheus)")
        logger.info(f"     - http://localhost:{port}/health (Health check)")
        logger.info("")
        logger.info("📊 Ready to aggregate metrics from citation workers")

        server.serve_forever()

    except KeyboardInterrupt:
        logger.info("⌨️ Keyboard interrupt received")
        server.shutdown()
        logger.info("🛑 Server stopped")
    except Exception as e:
        logger.critical(f"💥 Server failed to start: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
