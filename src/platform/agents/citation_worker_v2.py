#!/usr/bin/env python3
"""
MARCUS 3.1 Citation Worker with Async Support

Enhanced worker with feature flag support for async/sync agent selection.
Backward compatible with MARCUS 3.0 while enabling 3.1 async agents.

Key Features:
- Feature flag support (ENABLE_ASYNC_AGENT, ASYNC_AGENT_ROLLOUT_PERCENT)
- Canary deployment via consistent hashing
- Graceful fallback to sync mode if async fails
- Comprehensive metrics for both modes

Author: Marcus (Platform Engineer)
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
    from agent_factory import create_citation_agent, get_agent_stats
    from citation_integrity_agent import CitationDocument
    from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
except ImportError as e:
    raise ImportError(
        f"Missing required dependencies: {e}. "
        "Ensure agent_factory.py and citation_integrity_agent.py are in the same directory."
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
METRICS_REGISTRY = CollectorRegistry()

# Metrics for citation worker performance
TASKS_PROCESSED = Counter(
    'citation_tasks_processed_total',
    'Total citation tasks processed',
    ['agent_id', 'status', 'mode'],  # Added 'mode' label
    registry=METRICS_REGISTRY
)

TASK_DURATION = Histogram(
    'citation_task_duration_seconds',
    'Citation task processing duration',
    ['agent_id', 'mode'],  # Added 'mode' label
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

AGENT_MODE = Gauge(
    'citation_agent_mode',
    'Agent mode: 0=sync, 1=async',
    ['agent_id'],
    registry=METRICS_REGISTRY
)


class CitationWorkerV2:
    """
    Enhanced citation worker with async support and feature flags.

    Differences from v1:
    - Uses agent_factory for agent creation
    - Supports async/sync agents transparently
    - Tracks agent mode in metrics
    - Graceful fallback to sync if async fails
    """

    def __init__(
        self,
        agent_id: str,
        redis_host: str = 'localhost',
        redis_port: int = 6379,
        redis_password: Optional[str] = None,
        db_config: Optional[Dict[str, Any]] = None,
        task_queue: str = 'citations:tasks',
        result_ttl: int = 3600,
        force_agent_mode: Optional[str] = None
    ):
        """
        Initialize citation worker with feature flag support.

        Args:
            agent_id: Unique identifier for this worker
            redis_host: Redis server host
            redis_port: Redis server port
            redis_password: Redis password (optional)
            db_config: PostgreSQL connection config (optional)
            task_queue: Redis list key for tasks
            result_ttl: TTL for result keys (seconds)
            force_agent_mode: Force specific mode ("sync" or "async"), overrides feature flags
        """
        self.agent_id = agent_id
        self.task_queue = task_queue
        self.result_ttl = result_ttl
        self.shutdown_requested = False
        self.agent_mode = None  # Will be set during agent creation

        # Log feature flag configuration
        agent_stats = get_agent_stats()
        logger.info("=== Feature Flag Configuration ===")
        logger.info(f"  Async Enabled: {agent_stats['async_enabled']}")
        logger.info(f"  Rollout %: {agent_stats['rollout_percentage']}")
        logger.info(f"  Agent Mode: {agent_stats['agent_mode']}")

        # Connect to Redis
        cluster_mode = os.getenv('REDIS_CLUSTER_MODE', 'false').lower() == 'true'
        logger.info(f"🔌 Connecting to Redis at {redis_host}:{redis_port} (cluster={cluster_mode})")

        redis_config = {
            'host': redis_host,
            'port': redis_port,
            'db': 0,
            'password': redis_password,
            'cluster_mode': cluster_mode
        }

        try:
            if cluster_mode:
                from redis.cluster import ClusterNode
                startup_nodes = [ClusterNode(redis_host, redis_port)]
                self.redis_client = redis.RedisCluster(
                    startup_nodes=startup_nodes,
                    password=redis_password,
                    decode_responses=True,
                    skip_full_coverage_check=True
                )
            else:
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

        # Initialize agent using factory
        logger.info(f"🤖 Initializing citation agent {agent_id}")
        try:
            self.agent = create_citation_agent(
                agent_id=agent_id,
                force_mode=force_agent_mode,
                initial_reputation=0.5,
                exploration_rate=0.2,
                db_config=db_config,
                redis_config=redis_config
            )

            # Determine agent mode for metrics
            agent_class = self.agent.__class__.__name__
            if 'Async' in agent_class:
                self.agent_mode = 'async'
                AGENT_MODE.labels(agent_id=agent_id).set(1)
            else:
                self.agent_mode = 'sync'
                AGENT_MODE.labels(agent_id=agent_id).set(0)

            logger.info(f"✅ Agent initialized in {self.agent_mode} mode")

            # Try to load existing state
            state = self.agent.load_state()
            if state:
                self.agent.restore_from_state(state)
                logger.info(f"📥 Loaded saved state for agent {agent_id}")
            else:
                logger.info(f"🆕 No saved state, starting fresh")

        except Exception as e:
            logger.error(f"❌ Agent initialization failed: {e}")
            raise

        # Register signal handlers
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)

        # Register worker as active
        ACTIVE_WORKERS.inc()

        logger.info(f"🚀 Worker {agent_id} ready ({self.agent_mode} mode)")

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
            Dict with task result and stats
        """
        task_id = task_data.get('task_id', 'unknown')
        start_time = time.time()

        try:
            # Parse document
            doc_data = task_data['document']
            document = CitationDocument(
                text=doc_data['text'],
                claimed_source=doc_data['claimed_source'],
                actual_source=doc_data.get('actual_source'),
                metadata=doc_data.get('metadata', {})
            )

            # Process citation
            result, stats = self.agent.process_citation(document)

            # Record metrics
            duration = time.time() - start_time
            TASK_DURATION.labels(agent_id=self.agent_id, mode=self.agent_mode).observe(duration)
            TASKS_PROCESSED.labels(agent_id=self.agent_id, status='success', mode=self.agent_mode).inc()
            AGENT_REPUTATION.labels(agent_id=self.agent_id).set(self.agent.reputation)
            INTEGRITY_SCORE.labels(agent_id=self.agent_id).observe(result.integrity_score)

            # Prepare response
            response = {
                'task_id': task_id,
                'status': 'success',
                'result': {
                    'integrity_score': result.integrity_score,
                    'confidence': result.confidence,
                    'behavior_used': result.behavior_used.value,
                    'detected_violations': result.detected_violations,
                    'metadata': result.metadata
                },
                'stats': stats,
                'agent_mode': self.agent_mode,
                'duration_ms': int(duration * 1000)
            }

            logger.info(
                f"✅ Task {task_id}: integrity={result.integrity_score:.3f}, "
                f"confidence={result.confidence:.3f}, duration={duration*1000:.1f}ms, "
                f"mode={self.agent_mode}"
            )

            return response

        except Exception as e:
            duration = time.time() - start_time
            TASK_DURATION.labels(agent_id=self.agent_id, mode=self.agent_mode).observe(duration)
            TASKS_PROCESSED.labels(agent_id=self.agent_id, status='error', mode=self.agent_mode).inc()

            logger.error(f"❌ Task {task_id} failed: {e}")

            return {
                'task_id': task_id,
                'status': 'error',
                'error': str(e),
                'agent_mode': self.agent_mode,
                'duration_ms': int(duration * 1000)
            }

    def run(self) -> None:
        """
        Main worker loop - pull tasks from queue and process them.

        Runs until SIGTERM/SIGINT received.
        """
        logger.info(f"🔄 Starting task processing loop")

        while not self.shutdown_requested:
            try:
                # Update queue depth metric
                try:
                    queue_len = self.redis_client.llen(self.task_queue)
                    QUEUE_DEPTH.set(queue_len)
                except Exception as e:
                    logger.warning(f"Failed to get queue depth: {e}")

                # Blocking pop from task queue (5 second timeout)
                task_raw = self.redis_client.blpop(self.task_queue, timeout=5)

                if task_raw is None:
                    # Timeout - no tasks available
                    continue

                # Parse task
                _, task_json = task_raw
                task_data = json.loads(task_json)
                task_id = task_data.get('task_id', 'unknown')

                logger.info(f"📥 Received task {task_id}")

                # Process task
                result = self.process_task(task_data)

                # Push result to response queue
                result_key = f"citations:results:{task_id}"
                self.redis_client.setex(
                    result_key,
                    self.result_ttl,
                    json.dumps(result)
                )

                logger.info(f"📤 Published result for task {task_id}")

            except KeyboardInterrupt:
                logger.info("⌨️ Keyboard interrupt received")
                break

            except Exception as e:
                logger.error(f"❌ Unhandled error in main loop: {e}")
                time.sleep(1)  # Avoid tight error loop

        # Cleanup
        logger.info("🛑 Shutting down worker")
        ACTIVE_WORKERS.dec()

        # Save final state
        try:
            logger.info("💾 Saving final agent state")
            self.agent.save_state()
        except Exception as e:
            logger.error(f"Failed to save final state: {e}")

        logger.info("👋 Worker shutdown complete")


def main():
    """Entry point for citation worker."""
    # Configuration from environment
    agent_id = os.getenv('AGENT_ID', 'citation-worker-1')
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', '6379'))
    redis_password = os.getenv('REDIS_PASSWORD')
    force_mode = os.getenv('FORCE_AGENT_MODE')  # Optional override

    # Database configuration - check multiple env var formats
    db_host = os.getenv('DATABASE_HOST') or os.getenv('PGHOST') or os.getenv('POSTGRES_HOST')
    if db_host:
        db_config = {
            'host': db_host,
            'port': int(os.getenv('DATABASE_PORT', os.getenv('PGPORT', os.getenv('POSTGRES_PORT', '5432')))),
            'database': os.getenv('POSTGRES_DB', os.getenv('PGDATABASE', 'citations')),
            'user': os.getenv('POSTGRES_USER', os.getenv('PGUSER', 'postgres')),
            'password': os.getenv('POSTGRES_PASSWORD', os.getenv('PGPASSWORD', ''))
        }
    else:
        db_config = None

    # Create and run worker
    worker = CitationWorkerV2(
        agent_id=agent_id,
        redis_host=redis_host,
        redis_port=redis_port,
        redis_password=redis_password,
        db_config=db_config,
        force_agent_mode=force_mode
    )

    worker.run()


if __name__ == "__main__":
    main()
