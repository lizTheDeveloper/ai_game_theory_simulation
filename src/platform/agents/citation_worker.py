#!/usr/bin/env python3
"""
MARCUS 3.0 Citation Worker - Redis Queue-Based Service

Long-lived worker service that pulls citation analysis tasks from a Redis queue,
processes them using the CitationIntegrityAgent, and pushes results back.

This enables horizontal scaling of agents without run-once demo mode restarts.

Architecture:
- Worker pulls tasks from Redis list (BLPOP - blocking)
- Processes citation using CitationIntegrityAgent
- Pushes result to response queue
- Runs continuously until SIGTERM/SIGINT

Queue Protocol:
- Task Queue: citations:tasks (Redis list)
- Result Queue: citations:results:{task_id} (Redis key with TTL)
- Task Format: {"task_id": "...", "document": {...}}
- Result Format: {"task_id": "...", "result": {...}, "stats": {...}}

Author: 404GeneNotFound
Date: 2025-11-22
"""

import json
import logging
import os
import signal
import sys
import time
from typing import Optional, Dict, Any

try:
    import redis
    from citation_integrity_agent import CitationIntegrityAgent, CitationDocument
    from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
except ImportError as e:
    raise ImportError(
        f"Missing required dependencies: {e}. "
        "Ensure citation_integrity_agent.py is in the same directory and prometheus_client is installed."
    )

# Configure logging with colorlog if available
try:
    from colorlog import ColoredFormatter

    formatter = ColoredFormatter(
        "%(log_color)s%(asctime)s - %(name)s - %(levelname)s%(reset)s - %(message)s",
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'bold_red',
        }
    )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler]
    )
except ImportError:
    # Fall back to basic logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

logger = logging.getLogger(__name__)


# Shared Prometheus registry for aggregator pattern
# All workers use the same registry so the aggregator can collect metrics
METRICS_REGISTRY = CollectorRegistry()

# Metrics for citation worker performance
TASKS_PROCESSED = Counter(
    'citation_tasks_processed_total',
    'Total citation tasks processed',
    ['agent_id', 'status'],
    registry=METRICS_REGISTRY
)

TASK_DURATION = Histogram(
    'citation_task_duration_seconds',
    'Citation task processing duration',
    ['agent_id'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    registry=METRICS_REGISTRY
)

AGENT_REPUTATION = Gauge(
    'citation_agent_reputation',
    'Agent reputation score (0-1)',
    ['agent_id'],
    registry=METRICS_REGISTRY
)

QUEUE_DEPTH = Gauge(
    'citation_queue_depth',
    'Number of tasks in Redis queue',
    registry=METRICS_REGISTRY
)

INTEGRITY_SCORE = Histogram(
    'citation_integrity_score',
    'Distribution of citation integrity scores',
    ['agent_id'],
    buckets=[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    registry=METRICS_REGISTRY
)

ACTIVE_WORKERS = Gauge(
    'citation_workers_active',
    'Number of active citation workers',
    registry=METRICS_REGISTRY
)


class CitationWorker:
    """
    Long-lived worker service for citation integrity analysis.

    Pulls tasks from Redis queue, processes them, and pushes results back.
    Designed for horizontal scaling in Docker environments.
    """

    def __init__(
        self,
        agent_id: str,
        redis_host: str = 'localhost',
        redis_port: int = 6379,
        redis_password: Optional[str] = None,
        db_config: Optional[Dict[str, Any]] = None,
        task_queue: str = 'citations:tasks',
        result_ttl: int = 3600
    ):
        """
        Initialize citation worker.

        Args:
            agent_id: Unique identifier for this worker
            redis_host: Redis server host
            redis_port: Redis server port
            redis_password: Redis password (optional)
            db_config: PostgreSQL connection config (optional)
            task_queue: Redis list key for tasks
            result_ttl: TTL for result keys (seconds)
        """
        self.agent_id = agent_id
        self.task_queue = task_queue
        self.result_ttl = result_ttl
        self.shutdown_requested = False

        # Connect to Redis (detect cluster mode from environment)
        cluster_mode = os.getenv('REDIS_CLUSTER_MODE', 'false').lower() == 'true'
        logger.info(f"🔌 Connecting to Redis at {redis_host}:{redis_port} (cluster={cluster_mode})")

        redis_config = {
            'host': redis_host,
            'port': redis_port,
            'decode_responses': True,
            'socket_keepalive': True,
            'socket_timeout': 5,
            'retry_on_timeout': True,
            'cluster_mode': cluster_mode
        }

        if redis_password:
            redis_config['password'] = redis_password

        try:
            if cluster_mode:
                # Redis Cluster mode
                from redis.cluster import ClusterNode
                startup_nodes = [ClusterNode(redis_host, redis_port)]
                self.redis_client = redis.RedisCluster(
                    startup_nodes=startup_nodes,
                    password=redis_password,
                    decode_responses=True,
                    skip_full_coverage_check=True
                )
            else:
                # Standalone mode
                self.redis_client = redis.Redis(
                    host=redis_host,
                    port=redis_port,
                    db=0,
                    password=redis_password,
                    decode_responses=True,
                    socket_keepalive=True,
                    socket_timeout=5,
                    retry_on_timeout=True
                )

            self.redis_client.ping()
            mode = "Redis Cluster" if cluster_mode else "Redis"
            logger.info(f"✅ {mode} connected")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise

        # Initialize agent with database config
        logger.info(f"🤖 Initializing citation agent {agent_id}")
        try:
            self.agent = CitationIntegrityAgent(
                agent_id=agent_id,
                initial_reputation=0.5,
                exploration_rate=0.2,
                db_config=db_config,
                redis_config=redis_config
            )

            # Try to load existing state
            if self.agent.load_state():
                logger.info(f"📥 Loaded saved state for agent {agent_id}")
            else:
                logger.info(f"🆕 No saved state, starting fresh")

            logger.info(f"✅ Agent initialized")
        except Exception as e:
            logger.error(f"❌ Agent initialization failed: {e}")
            raise

        # Register signal handlers
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)

        # Register worker as active
        ACTIVE_WORKERS.inc()

        logger.info(f"🚀 Worker {agent_id} ready")

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info(f"📡 Received signal {signum}, initiating graceful shutdown")
        self.shutdown_requested = True

    def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single citation analysis task.

        Args:
            task_data: Dict with 'task_id' and 'document' keys

        Returns:
            Result dict with 'task_id', 'result', and 'stats'
        """
        task_id = task_data.get('task_id', 'unknown')
        doc_data = task_data.get('document', {})

        logger.info(f"🔍 Processing task {task_id}")

        # Start timing
        start_time = time.time()

        try:
            # Create document
            document = CitationDocument(
                text=doc_data.get('text', ''),
                claimed_source=doc_data.get('claimed_source', ''),
                actual_source=doc_data.get('actual_source'),
                metadata=doc_data.get('metadata', {})
            )

            # Analyze citation
            result, stats = self.agent.process_citation(document)

            # Build response
            response = {
                'task_id': task_id,
                'result': {
                    'integrity_score': result.integrity_score,
                    'behavior_used': result.behavior_used.value,
                    'confidence': result.confidence,
                    'detected_violations': result.detected_violations,
                    'metadata': result.metadata
                },
                'stats': stats,
                'agent_id': self.agent_id,
                'agent_reputation': self.agent.reputation,
                'success': True
            }

            # Record success metrics
            TASKS_PROCESSED.labels(
                agent_id=self.agent_id,
                status='success'
            ).inc()

            # Record integrity score distribution
            INTEGRITY_SCORE.labels(
                agent_id=self.agent_id
            ).observe(result.integrity_score)

            # Update reputation gauge
            AGENT_REPUTATION.labels(
                agent_id=self.agent_id
            ).set(self.agent.reputation)

            logger.info(f"✅ Task {task_id} completed - Integrity: {result.integrity_score:.2f}")
            return response

        except Exception as e:
            logger.error(f"❌ Task {task_id} failed: {e}")

            # Record failure metrics
            TASKS_PROCESSED.labels(
                agent_id=self.agent_id,
                status='failure'
            ).inc()

            return {
                'task_id': task_id,
                'error': str(e),
                'agent_id': self.agent_id,
                'success': False
            }

        finally:
            # Record duration regardless of success/failure
            duration = time.time() - start_time
            TASK_DURATION.labels(
                agent_id=self.agent_id
            ).observe(duration)

            # Update queue depth
            try:
                queue_length = self.redis_client.llen(self.task_queue)
                QUEUE_DEPTH.set(queue_length)
            except Exception:
                pass  # Don't fail task on metrics error

    def publish_result(self, task_id: str, result: Dict[str, Any]) -> None:
        """
        Publish result to Redis with TTL.

        Args:
            task_id: Task identifier
            result: Result dictionary
        """
        result_key = f"citations:results:{task_id}"

        try:
            self.redis_client.setex(
                result_key,
                self.result_ttl,
                json.dumps(result)
            )
            logger.debug(f"📤 Result published to {result_key}")
        except Exception as e:
            logger.error(f"❌ Failed to publish result for task {task_id}: {e}")
            raise

    def run(self) -> None:
        """
        Main worker loop - runs until shutdown signal received.

        Blocks on Redis BLPOP (5 second timeout) to wait for tasks.
        Gracefully handles connection errors and retries.
        """
        logger.info(f"🔄 Worker {self.agent_id} entering main loop")
        logger.info(f"📥 Listening on queue: {self.task_queue}")

        consecutive_errors = 0
        max_consecutive_errors = 10

        while not self.shutdown_requested:
            try:
                # Blocking pop with 5-second timeout (allows signal checking)
                result = self.redis_client.blpop(self.task_queue, timeout=5)

                if result is None:
                    # Timeout - no task available
                    # Heartbeat log every ~60 seconds (12 timeouts)
                    if consecutive_errors == 0:  # Only log when no errors
                        logger.debug(f"💓 Worker {self.agent_id} alive (queue empty)")
                    continue

                # Reset error counter on successful pop
                consecutive_errors = 0

                # Parse task
                _, task_json = result
                try:
                    task_data = json.loads(task_json)
                except json.JSONDecodeError as e:
                    logger.error(f"❌ Invalid JSON in task: {e}")
                    continue

                # Process task
                task_result = self.process_task(task_data)

                # Publish result
                task_id = task_data.get('task_id', 'unknown')
                self.publish_result(task_id, task_result)

            except redis.ConnectionError as e:
                consecutive_errors += 1
                logger.error(f"🔌 Redis connection error ({consecutive_errors}/{max_consecutive_errors}): {e}")

                if consecutive_errors >= max_consecutive_errors:
                    logger.critical(f"💥 Too many consecutive errors, shutting down")
                    self.shutdown_requested = True
                else:
                    # Exponential backoff
                    backoff = min(30, 2 ** consecutive_errors)
                    logger.info(f"⏳ Retrying in {backoff} seconds...")
                    time.sleep(backoff)

            except KeyboardInterrupt:
                logger.info("⌨️ Keyboard interrupt received")
                self.shutdown_requested = True

            except Exception as e:
                consecutive_errors += 1
                logger.error(f"❌ Unexpected error in worker loop: {e}")

                if consecutive_errors >= max_consecutive_errors:
                    logger.critical(f"💥 Too many consecutive errors, shutting down")
                    self.shutdown_requested = True

        logger.info(f"🛑 Worker {self.agent_id} exiting main loop")
        self.cleanup()

    def cleanup(self) -> None:
        """Clean up resources before shutdown."""
        logger.info(f"🧹 Cleaning up worker {self.agent_id}")

        # Decrement active workers counter
        ACTIVE_WORKERS.dec()

        try:
            # Save agent state one last time
            self.agent.save_state()
            logger.info(f"💾 Agent state saved")
        except Exception as e:
            logger.error(f"❌ Failed to save agent state: {e}")

        try:
            # Close agent connections
            self.agent.cleanup()
            logger.info(f"🔌 Agent connections closed")
        except Exception as e:
            logger.error(f"❌ Failed to cleanup agent: {e}")

        try:
            # Close Redis connection
            self.redis_client.close()
            logger.info(f"🔌 Redis connection closed")
        except Exception as e:
            logger.error(f"❌ Failed to close Redis: {e}")

        logger.info(f"✅ Worker {self.agent_id} shutdown complete")


def main():
    """Entry point for citation worker service."""

    # Read configuration from environment
    agent_id = os.getenv('AGENT_ID', f'agent_{os.getpid()}')
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', '6379'))
    redis_password = os.getenv('REDIS_PASSWORD')
    cluster_mode = os.getenv('REDIS_CLUSTER_MODE', 'false').lower() == 'true'

    # Database configuration
    db_config = None
    if os.getenv('DATABASE_URL') or os.getenv('DATABASE_HOST') or os.getenv('PGHOST'):
        db_config = {
            'host': os.getenv('DATABASE_HOST', os.getenv('PGHOST', 'localhost')),
            'port': int(os.getenv('DATABASE_PORT', os.getenv('PGPORT', '5432'))),
            'database': os.getenv('POSTGRES_DB', os.getenv('PGDATABASE', os.getenv('DATABASE_NAME', 'citations'))),
            'user': os.getenv('POSTGRES_USER', os.getenv('PGUSER', os.getenv('DATABASE_USER', 'postgres'))),
            'password': os.getenv('POSTGRES_PASSWORD', os.getenv('PGPASSWORD', os.getenv('DATABASE_PASSWORD', '')))
        }

    logger.info(f"🚀 Starting citation worker")
    logger.info(f"   Agent ID: {agent_id}")
    logger.info(f"   Redis: {redis_host}:{redis_port}")
    logger.info(f"   Database: {'enabled' if db_config else 'disabled'}")

    try:
        worker = CitationWorker(
            agent_id=agent_id,
            redis_host=redis_host,
            redis_port=redis_port,
            redis_password=redis_password,
            db_config=db_config
        )

        worker.run()

    except Exception as e:
        logger.critical(f"💥 Worker failed to start: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
