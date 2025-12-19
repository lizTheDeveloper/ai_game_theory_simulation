#!/usr/bin/env python3
"""
MARCUS 3.0 Citation Integrity Agent

Multi-Agent Recursive Citation Understanding System with Nested Learning.

This agent implements a reputation-based learning system for detecting citation
integrity violations. It uses a 4-level memory hierarchy and local surprise signals
to adapt behavior while maintaining platform integration.

Architecture:
- CitationBehavior: 9 behaviors with integrity scoring
- NestedCitationMemory: 4-level memory hierarchy
- CitationIntegrityAgent: Main agent with learning capabilities
- Platform Integration: PostgreSQL + Redis state persistence

Author: Marcus (Platform Engineer)
Date: 2025-11-17
Updated: 2025-11-28 (H3 fix: explicit exit after cleanup)
"""

import json
import logging
import random
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path

# External dependencies (install via: pip install psycopg2-binary redis numpy)
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    import redis
    import numpy as np
except ImportError as e:
    raise ImportError(
        f"Missing required dependencies: {e}. "
        "Install with: pip install psycopg2-binary redis numpy"
    )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CitationBehavior(Enum):
    """
    Citation analysis behaviors with integrity scoring.

    Each behavior represents a different approach to evaluating citations,
    ranging from always accepting (low integrity) to strict verification
    (high integrity).
    """

    ALWAYS_ACCEPT = "always_accept"           # Integrity: 0.0
    LENIENT_SIMILARITY = "lenient_similarity" # Integrity: 0.3
    MODERATE_CHECK = "moderate_check"         # Integrity: 0.5
    STRICT_MATCH = "strict_match"             # Integrity: 0.7
    ALWAYS_REJECT = "always_reject"           # Integrity: 1.0 (too strict)
    AUTHOR_FOCUSED = "author_focused"         # Integrity: 0.6
    YEAR_FOCUSED = "year_focused"             # Integrity: 0.4
    TITLE_FOCUSED = "title_focused"           # Integrity: 0.5
    COMBINED_HEURISTIC = "combined_heuristic" # Integrity: 0.8

    def get_base_integrity(self) -> float:
        """
        Get base integrity score for this behavior.

        Returns:
            Float in [0, 1] representing how strict this behavior is.
        """
        integrity_map = {
            CitationBehavior.ALWAYS_ACCEPT: 0.0,
            CitationBehavior.LENIENT_SIMILARITY: 0.3,
            CitationBehavior.MODERATE_CHECK: 0.5,
            CitationBehavior.STRICT_MATCH: 0.7,
            CitationBehavior.ALWAYS_REJECT: 1.0,
            CitationBehavior.AUTHOR_FOCUSED: 0.6,
            CitationBehavior.YEAR_FOCUSED: 0.4,
            CitationBehavior.TITLE_FOCUSED: 0.5,
            CitationBehavior.COMBINED_HEURISTIC: 0.8,
        }
        return integrity_map[self]


@dataclass
class CitationDocument:
    """
    A document to be analyzed for citation integrity.

    Attributes:
        text: The citation text to verify
        claimed_source: What the citation claims to reference
        actual_source: Ground truth (if available, for training)
        metadata: Additional context
    """
    text: str
    claimed_source: str
    actual_source: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def has_ground_truth(self) -> bool:
        """Check if this document has ground truth for validation."""
        return self.actual_source is not None


@dataclass
class CitationAnalysisResult:
    """
    Result of citation integrity analysis.

    Attributes:
        integrity_score: [0, 1] - How accurate the citation appears
        behavior_used: Which behavior the agent applied
        confidence: [0, 1] - Agent's confidence in this assessment
        detected_violations: List of specific issues found
        metadata: Additional analysis data
    """
    integrity_score: float
    behavior_used: CitationBehavior
    confidence: float
    detected_violations: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        """Validate ranges."""
        if not 0 <= self.integrity_score <= 1:
            raise ValueError(f"Integrity score must be in [0, 1], got {self.integrity_score}")
        if not 0 <= self.confidence <= 1:
            raise ValueError(f"Confidence must be in [0, 1], got {self.confidence}")


@dataclass
class NestedCitationMemory:
    """
    4-level memory hierarchy for Nested Learning.

    Levels:
    1. Immediate (I): Last 10 citations - working memory
    2. Short-term (S): Last 100 citations - recent patterns
    3. Long-term (L): Aggregated statistics - learned behaviors
    4. Persistent (P): Cross-session knowledge - core competencies

    Each level has different update rates and consolidation mechanisms.
    """

    # Level 1: Immediate memory (last N citations)
    immediate_history: List[Dict[str, Any]] = field(default_factory=list)
    immediate_capacity: int = 10

    # Level 2: Short-term memory (last M citations)
    shortterm_history: List[Dict[str, Any]] = field(default_factory=list)
    shortterm_capacity: int = 100

    # Level 3: Long-term memory (aggregated statistics)
    longterm_stats: Dict[str, float] = field(default_factory=dict)
    behavior_success_rates: Dict[str, float] = field(default_factory=dict)

    # Level 4: Persistent memory (cross-session)
    persistent_knowledge: Dict[str, Any] = field(default_factory=dict)
    total_citations_processed: int = 0

    # Consolidation tracking
    last_consolidation: Optional[datetime] = None
    consolidation_interval: int = 50  # Citations between consolidations

    def add_immediate(self, citation_data: Dict[str, Any]) -> None:
        """
        Add to immediate memory with FIFO eviction.

        Args:
            citation_data: Dict containing citation analysis results
        """
        self.immediate_history.append(citation_data)

        # Evict oldest if over capacity
        if len(self.immediate_history) > self.immediate_capacity:
            evicted = self.immediate_history.pop(0)
            self.add_shortterm(evicted)

    def add_shortterm(self, citation_data: Dict[str, Any]) -> None:
        """
        Add to short-term memory with FIFO eviction.

        Args:
            citation_data: Dict containing citation analysis results
        """
        self.shortterm_history.append(citation_data)

        # Evict oldest if over capacity
        if len(self.shortterm_history) > self.shortterm_capacity:
            self.shortterm_history.pop(0)

    def consolidate_to_longterm(self) -> None:
        """
        Consolidate short-term patterns into long-term statistics.

        This is called periodically to extract learned patterns from
        short-term memory and update long-term aggregates.
        """
        if not self.shortterm_history:
            return

        # Calculate behavior success rates
        behavior_counts: Dict[str, int] = {}
        behavior_successes: Dict[str, int] = {}

        for entry in self.shortterm_history:
            behavior = entry.get('behavior', 'unknown')
            was_correct = entry.get('was_correct', False)

            behavior_counts[behavior] = behavior_counts.get(behavior, 0) + 1
            if was_correct:
                behavior_successes[behavior] = behavior_successes.get(behavior, 0) + 1

        # Update success rates
        for behavior, count in behavior_counts.items():
            success_rate = behavior_successes.get(behavior, 0) / count
            self.behavior_success_rates[behavior] = success_rate

        # Update long-term statistics
        integrity_scores = [e.get('integrity_score', 0.5) for e in self.shortterm_history]
        if integrity_scores:
            self.longterm_stats['mean_integrity'] = float(np.mean(integrity_scores))
            self.longterm_stats['std_integrity'] = float(np.std(integrity_scores))

        self.last_consolidation = datetime.now()
        logger.info(f"Memory consolidated: {len(behavior_counts)} behaviors tracked")

    def should_consolidate(self) -> bool:
        """Check if it's time to consolidate memory."""
        return self.total_citations_processed % self.consolidation_interval == 0

    def get_behavior_reputation(self, behavior: CitationBehavior) -> float:
        """
        Get the learned reputation of a behavior.

        Args:
            behavior: The behavior to query

        Returns:
            Success rate in [0, 1], or 0.5 if unknown
        """
        return self.behavior_success_rates.get(behavior.value, 0.5)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize memory to dictionary for persistence."""
        return {
            'immediate_history': self.immediate_history,
            'shortterm_history': self.shortterm_history,
            'longterm_stats': self.longterm_stats,
            'behavior_success_rates': self.behavior_success_rates,
            'persistent_knowledge': self.persistent_knowledge,
            'total_citations_processed': self.total_citations_processed,
            'last_consolidation': self.last_consolidation.isoformat() if self.last_consolidation else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'NestedCitationMemory':
        """Deserialize memory from dictionary."""
        memory = cls()
        memory.immediate_history = data.get('immediate_history', [])
        memory.shortterm_history = data.get('shortterm_history', [])
        memory.longterm_stats = data.get('longterm_stats', {})
        memory.behavior_success_rates = data.get('behavior_success_rates', {})
        memory.persistent_knowledge = data.get('persistent_knowledge', {})
        memory.total_citations_processed = data.get('total_citations_processed', 0)

        last_consol = data.get('last_consolidation')
        if last_consol:
            memory.last_consolidation = datetime.fromisoformat(last_consol)

        return memory


class CitationIntegrityAgent:
    """
    Main agent for citation integrity analysis with Nested Learning.

    Features:
    - 4-level memory hierarchy (Immediate, Short-term, Long-term, Persistent)
    - Local Surprise Signal for adaptive learning
    - Reputation-based behavior selection
    - Self-modification capabilities
    - Platform integration (PostgreSQL + Redis)

    Learning Dynamics:
    - Exploration rate decays as confidence builds
    - Behaviors with high reputation are favored
    - Surprise signals trigger rapid adaptation
    - Memory consolidation happens periodically
    """

    def __init__(
        self,
        agent_id: str,
        initial_reputation: float = 0.5,
        exploration_rate: float = 0.2,
        learning_rate: float = 0.01,
        meta_learning_rate: float = 0.001,
        db_config: Optional[Dict[str, Any]] = None,
        redis_config: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize citation integrity agent.

        Args:
            agent_id: Unique identifier for this agent
            initial_reputation: Starting reputation [0, 1]
            exploration_rate: Probability of trying non-greedy behaviors
            learning_rate: Base learning rate for reputation updates
            meta_learning_rate: Learning rate for exploration decay
            db_config: PostgreSQL connection config (optional)
            redis_config: Redis connection config (optional)
        """
        if not 0 <= initial_reputation <= 1:
            raise ValueError(f"Initial reputation must be in [0, 1], got {initial_reputation}")
        if not 0 <= exploration_rate <= 1:
            raise ValueError(f"Exploration rate must be in [0, 1], got {exploration_rate}")

        self.agent_id = agent_id
        self.reputation = initial_reputation
        self.exploration_rate = exploration_rate
        self.learning_rate = learning_rate
        self.meta_learning_rate = meta_learning_rate

        # Initialize memory
        self.memory = NestedCitationMemory()

        # Behavior tracking
        self.current_behavior = CitationBehavior.MODERATE_CHECK
        self.total_citations = 0
        self.detected_violations = 0

        # Platform integration
        self.db_conn: Optional[Any] = None
        self.redis_client: Optional[Any] = None

        if db_config:
            self._connect_database(db_config)
        if redis_config:
            self._connect_redis(redis_config)

        logger.info(f"Agent {agent_id} initialized with reputation {initial_reputation}")

    def _connect_database(self, config: Dict[str, Any]) -> None:
        """
        Connect to PostgreSQL for state persistence.

        Args:
            config: Dict with keys: host, port, database, user, password
        """
        try:
            # Use environment variables with fallback to config, then defaults
            import os
            self.db_conn = psycopg2.connect(
                host=config.get('host') or os.getenv('DATABASE_HOST', os.getenv('PGHOST', 'localhost')),
                port=config.get('port') or int(os.getenv('DATABASE_PORT', os.getenv('PGPORT', '5432'))),
                database=config.get('database') or os.getenv('POSTGRES_DB', os.getenv('PGDATABASE', 'citations')),
                user=config.get('user') or os.getenv('POSTGRES_USER', os.getenv('PGUSER', 'postgres')),
                password=config.get('password') or os.getenv('POSTGRES_PASSWORD', os.getenv('PGPASSWORD', '')),
                cursor_factory=RealDictCursor
            )
            logger.info(f"Agent {self.agent_id} connected to PostgreSQL")
        except Exception as e:
            logger.error(f"Failed to connect to PostgreSQL: {e}")
            raise

    def _connect_redis(self, config: Dict[str, Any]) -> None:
        """
        Connect to Redis for caching and coordination.

        Args:
            config: Dict with keys: host, port, db, cluster_mode
        """
        try:
            # Support both standalone and cluster mode
            cluster_mode = config.get('cluster_mode', False)

            if cluster_mode:
                # Redis Cluster mode - use RedisCluster client
                from redis.cluster import ClusterNode
                host = config.get('host', 'localhost')
                port = config.get('port', 6379)
                startup_nodes = [ClusterNode(host, port)]
                self.redis_client = redis.RedisCluster(
                    startup_nodes=startup_nodes,
                    password=config.get('password'),
                    decode_responses=True,
                    skip_full_coverage_check=True
                )
            else:
                # Standalone mode - use standard Redis client
                self.redis_client = redis.Redis(
                    host=config.get('host', 'localhost'),
                    port=config.get('port', 6379),
                    db=config.get('db', 0),
                    password=config.get('password'),
                    decode_responses=True
                )

            # Test connection
            self.redis_client.ping()
            mode = "Redis Cluster" if cluster_mode else "Redis"
            logger.info(f"Agent {self.agent_id} connected to {mode}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    def select_behavior(self) -> CitationBehavior:
        """
        Select behavior using epsilon-greedy exploration.

        With probability exploration_rate, choose random behavior.
        Otherwise, choose behavior with highest learned reputation.

        Returns:
            Selected CitationBehavior
        """
        # Epsilon-greedy selection
        if random.random() < self.exploration_rate:
            # Explore: random behavior
            behavior = random.choice(list(CitationBehavior))
            logger.debug(f"Agent {self.agent_id} exploring: {behavior.value}")
        else:
            # Exploit: best known behavior
            best_behavior = CitationBehavior.MODERATE_CHECK
            best_reputation = 0.0

            for behavior in CitationBehavior:
                reputation = self.memory.get_behavior_reputation(behavior)
                if reputation > best_reputation:
                    best_reputation = reputation
                    best_behavior = behavior

            behavior = best_behavior
            logger.debug(f"Agent {self.agent_id} exploiting: {behavior.value} (rep: {best_reputation:.3f})")

        self.current_behavior = behavior
        return behavior

    def analyze_citation(self, document: CitationDocument) -> CitationAnalysisResult:
        """
        Analyze a citation for integrity.

        This is a simplified analysis for demonstration. In production,
        this would use NLP models, database lookups, etc.

        Args:
            document: CitationDocument to analyze

        Returns:
            CitationAnalysisResult with integrity assessment
        """
        behavior = self.current_behavior
        base_integrity = behavior.get_base_integrity()

        # Simulate analysis based on behavior
        # In production: use actual citation verification logic
        violations = []

        if behavior == CitationBehavior.ALWAYS_ACCEPT:
            integrity = 0.0
        elif behavior == CitationBehavior.ALWAYS_REJECT:
            integrity = 1.0
            violations.append("Rejected by strict policy")
        else:
            # Simplified heuristic
            text_lower = document.text.lower()
            claimed_lower = document.claimed_source.lower()

            # Check for common issues
            if "et al" in claimed_lower and "et al" not in text_lower:
                violations.append("Missing 'et al' in citation")

            # Base integrity with some noise
            integrity = base_integrity + random.gauss(0, 0.1)
            integrity = max(0.0, min(1.0, integrity))

        # Confidence based on behavior and memory
        confidence = 0.5 + (self.memory.total_citations_processed / 1000) * 0.3
        confidence = min(1.0, confidence)

        result = CitationAnalysisResult(
            integrity_score=integrity,
            behavior_used=behavior,
            confidence=confidence,
            detected_violations=violations,
            metadata={
                'agent_id': self.agent_id,
                'reputation': self.reputation,
                'exploration_rate': self.exploration_rate
            }
        )

        self.total_citations += 1

        return result

    def calculate_local_surprise(
        self,
        result: CitationAnalysisResult,
        ground_truth_integrity: Optional[float] = None
    ) -> float:
        """
        Calculate Local Surprise Signal (LSS).

        LSS = |predicted_integrity - actual_integrity|

        High surprise triggers faster learning and exploration increase.

        Args:
            result: The analysis result produced
            ground_truth_integrity: Actual integrity (if known)

        Returns:
            Surprise value in [0, 1]
        """
        if ground_truth_integrity is None:
            # No ground truth - use memory-based expectation
            expected = self.memory.longterm_stats.get('mean_integrity', 0.5)
        else:
            expected = ground_truth_integrity

        surprise = abs(result.integrity_score - expected)

        logger.debug(f"Agent {self.agent_id} surprise: {surprise:.3f} "
                    f"(predicted: {result.integrity_score:.3f}, expected: {expected:.3f})")

        return surprise

    def update_reputation(
        self,
        result: CitationAnalysisResult,
        was_correct: bool,
        surprise: float
    ) -> None:
        """
        Update agent reputation based on performance.

        Uses surprise-modulated learning:
        - High surprise → larger updates
        - Low surprise → smaller updates

        Args:
            result: The analysis result
            was_correct: Whether the analysis was correct
            surprise: Local surprise signal
        """
        # Update behavior reputation
        behavior = result.behavior_used.value
        current_rep = self.memory.behavior_success_rates.get(behavior, 0.5)

        # Surprise-modulated learning rate
        effective_lr = self.learning_rate * (1.0 + surprise)

        if was_correct:
            new_rep = current_rep + effective_lr * (1.0 - current_rep)
        else:
            new_rep = current_rep - effective_lr * current_rep

        self.memory.behavior_success_rates[behavior] = new_rep

        # Update agent-level reputation
        if was_correct:
            self.reputation += effective_lr * (1.0 - self.reputation)
        else:
            self.reputation -= effective_lr * self.reputation

        # Update exploration rate based on surprise
        # High surprise → increase exploration
        # Low surprise → decrease exploration
        if surprise > 0.3:
            self.exploration_rate = min(0.5, self.exploration_rate + self.meta_learning_rate)
        else:
            self.exploration_rate = max(0.05, self.exploration_rate - self.meta_learning_rate)

        logger.debug(f"Agent {self.agent_id} reputation updated: {self.reputation:.3f}, "
                    f"exploration: {self.exploration_rate:.3f}")

    def process_citation(
        self,
        document: CitationDocument
    ) -> Tuple[CitationAnalysisResult, Dict[str, Any]]:
        """
        Full citation processing pipeline.

        Steps:
        1. Select behavior
        2. Analyze citation
        3. Calculate surprise
        4. Update reputation (if ground truth available)
        5. Update memory
        6. Persist state

        Args:
            document: CitationDocument to process

        Returns:
            Tuple of (result, learning_stats)
        """
        # Step 1: Select behavior
        behavior = self.select_behavior()

        # Step 2: Analyze
        result = self.analyze_citation(document)

        # Step 3: Calculate surprise
        ground_truth = None
        if document.has_ground_truth() and document.actual_source:
            # Simplified: actual source presence = high integrity
            ground_truth = 1.0

        surprise = self.calculate_local_surprise(result, ground_truth)

        # Step 4: Update reputation (if we have ground truth)
        was_correct = False
        if ground_truth is not None:
            # Consider correct if within 0.2 of ground truth
            was_correct = abs(result.integrity_score - ground_truth) < 0.2
            self.update_reputation(result, was_correct, surprise)

            if not was_correct:
                self.detected_violations += 1

        # Step 5: Update memory
        memory_entry = {
            'behavior': behavior.value,
            'integrity_score': result.integrity_score,
            'was_correct': was_correct,
            'surprise': surprise,
            'timestamp': datetime.now().isoformat()
        }

        self.memory.add_immediate(memory_entry)
        self.memory.total_citations_processed += 1

        # Consolidate if needed
        if self.memory.should_consolidate():
            self.memory.consolidate_to_longterm()

        # Step 6: Persist state (if database connected)
        if self.db_conn or self.redis_client:
            self.save_state()

        learning_stats = {
            'surprise': surprise,
            'was_correct': was_correct,
            'current_reputation': self.reputation,
            'exploration_rate': self.exploration_rate,
            'behavior_reputation': self.memory.get_behavior_reputation(behavior)
        }

        return result, learning_stats

    def save_state(self, version: Optional[int] = None) -> None:
        """
        Save agent state to database with versioning.

        Implements optimistic locking to prevent concurrent update conflicts.

        Args:
            version: Expected current version (for conflict detection)
        """
        state = {
            'agent_id': self.agent_id,
            'reputation': self.reputation,
            'total_citations': self.total_citations,
            'detected_violations': self.detected_violations,
            'current_behavior': self.current_behavior.value,
            'memory_state': json.dumps(self.memory.to_dict()),  # Serialize to JSON string for JSONB
            'exploration_rate': self.exploration_rate,
            'timestamp': datetime.now().isoformat(),
            'version': version if version is not None else int(time.time() * 1000)
        }

        # Cache first (if Redis available)
        if self.redis_client:
            try:
                cache_key = f"agent:{self.agent_id}:state"
                self.redis_client.setex(
                    cache_key,
                    3600,  # 1 hour TTL
                    json.dumps(state)
                )
            except Exception as e:
                logger.error(f"Redis cache save failed: {e}")

        # Persist to database (if available)
        if self.db_conn:
            try:
                cursor = self.db_conn.cursor()

                # Upsert with version check
                cursor.execute("""
                    INSERT INTO agent_states (
                        agent_id, reputation, total_citations, detected_violations,
                        current_behavior, memory_state, exploration_rate, timestamp, version
                    ) VALUES (
                        %(agent_id)s, %(reputation)s, %(total_citations)s, %(detected_violations)s,
                        %(current_behavior)s, %(memory_state)s, %(exploration_rate)s,
                        %(timestamp)s, %(version)s
                    )
                    ON CONFLICT (agent_id) DO UPDATE SET
                        reputation = EXCLUDED.reputation,
                        total_citations = EXCLUDED.total_citations,
                        detected_violations = EXCLUDED.detected_violations,
                        current_behavior = EXCLUDED.current_behavior,
                        memory_state = EXCLUDED.memory_state,
                        exploration_rate = EXCLUDED.exploration_rate,
                        timestamp = EXCLUDED.timestamp,
                        version = EXCLUDED.version
                    WHERE agent_states.version <= EXCLUDED.version
                """, state)

                self.db_conn.commit()
                logger.debug(f"Agent {self.agent_id} state persisted (version: {state['version']})")

            except Exception as e:
                self.db_conn.rollback()
                logger.error(f"Database save failed: {e}")
                # Don't re-raise - agent should continue operating despite DB errors

    def load_state(self) -> bool:
        """
        Load agent state from database/cache.

        Returns:
            True if state was loaded, False otherwise
        """
        # Try cache first
        if self.redis_client:
            try:
                cache_key = f"agent:{self.agent_id}:state"
                cached = self.redis_client.get(cache_key)

                if cached:
                    state = json.loads(cached)
                    self._apply_state(state)
                    logger.info(f"Agent {self.agent_id} state loaded from cache")
                    return True
            except Exception as e:
                logger.warning(f"Redis cache load failed: {e}")

        # Fall back to database
        if self.db_conn:
            try:
                cursor = self.db_conn.cursor()
                cursor.execute(
                    "SELECT * FROM agent_states WHERE agent_id = %s ORDER BY timestamp DESC LIMIT 1",
                    (self.agent_id,)
                )

                row = cursor.fetchone()
                if row:
                    state = dict(row)
                    self._apply_state(state)
                    logger.info(f"Agent {self.agent_id} state loaded from database")
                    return True

            except Exception as e:
                logger.error(f"Database load failed: {e}")
                # Don't re-raise - return False to indicate no state loaded

        logger.warning(f"Agent {self.agent_id} no saved state found")
        return False

    def _apply_state(self, state: Dict[str, Any]) -> None:
        """Apply loaded state to agent."""
        self.reputation = state['reputation']
        self.total_citations = state['total_citations']
        self.detected_violations = state['detected_violations']
        self.current_behavior = CitationBehavior(state['current_behavior'])
        self.exploration_rate = state['exploration_rate']

        # Restore memory
        memory_state = state.get('memory_state')
        if memory_state:
            if isinstance(memory_state, str):
                memory_state = json.loads(memory_state)
            self.memory = NestedCitationMemory.from_dict(memory_state)

    def get_status(self) -> Dict[str, Any]:
        """
        Get current agent status.

        Returns:
            Dict with agent metrics and state
        """
        return {
            'agent_id': self.agent_id,
            'reputation': self.reputation,
            'total_citations': self.total_citations,
            'detected_violations': self.detected_violations,
            'violation_rate': self.detected_violations / max(1, self.total_citations),
            'current_behavior': self.current_behavior.value,
            'exploration_rate': self.exploration_rate,
            'memory_size': {
                'immediate': len(self.memory.immediate_history),
                'shortterm': len(self.memory.shortterm_history),
                'longterm_stats': len(self.memory.longterm_stats),
                'behavior_reputations': len(self.memory.behavior_success_rates)
            },
            'is_healthy': self.reputation > 0.3,
            'timestamp': datetime.now().isoformat()
        }

    def cleanup(self) -> None:
        """Clean up resources (database connections, etc.)."""
        if self.db_conn:
            try:
                self.db_conn.close()
                logger.info(f"Agent {self.agent_id} database connection closed")
            except Exception as e:
                logger.error(f"Error closing database: {e}")

        if self.redis_client:
            try:
                self.redis_client.close()
                logger.info(f"Agent {self.agent_id} Redis connection closed")
            except Exception as e:
                logger.error(f"Error closing Redis: {e}")


def main():
    """Example usage of CitationIntegrityAgent (demo mode)."""

    # Create agent (no database for demo)
    agent = CitationIntegrityAgent(
        agent_id="agent_001",
        initial_reputation=0.5,
        exploration_rate=0.2
    )

    # Example documents
    documents = [
        CitationDocument(
            text="According to Smith et al. (2024), climate change is accelerating.",
            claimed_source="Smith et al. 2024",
            actual_source="Smith, J., et al. (2024). Climate Acceleration. Nature, 123, 45-67."
        ),
        CitationDocument(
            text="Jones (2023) found no evidence of AI risks.",
            claimed_source="Jones 2023",
            actual_source=None  # Fabricated citation
        ),
    ]

    # Process documents
    for doc in documents:
        result, stats = agent.process_citation(doc)

        print(f"\nDocument: {doc.text[:50]}...")
        print(f"Integrity: {result.integrity_score:.2f}")
        print(f"Behavior: {result.behavior_used.value}")
        print(f"Violations: {result.detected_violations}")
        print(f"Surprise: {stats['surprise']:.2f}")
        print(f"Agent reputation: {stats['current_reputation']:.2f}")

    # Check status
    status = agent.get_status()
    print(f"\nAgent Status:")
    print(f"Total processed: {status['total_citations']}")
    print(f"Violation rate: {status['violation_rate']:.1%}")
    print(f"Exploration rate: {status['exploration_rate']:.2f}")

    # Cleanup
    agent.cleanup()


def run_ipc_server(agent_id: str):
    """
    Run agent as IPC server for TypeScript orchestrator.

    Reads JSON requests from stdin, processes them, and writes JSON responses to stdout.
    Runs continuously until SIGTERM/SIGINT received.

    Protocol:
    - Request: {"type": "request", "requestId": "...", "method": "...", "params": {...}}
    - Response: {"type": "response", "requestId": "...", "data": {...}} or {"type": "response", "requestId": "...", "error": "..."}
    - Health: {"type": "health", "data": {"healthy": true}}
    """
    import sys
    import signal
    import os
    import select

    # Global shutdown flag
    shutdown_requested = False

    def signal_handler(signum, frame):
        """Handle shutdown signals gracefully."""
        nonlocal shutdown_requested
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        shutdown_requested = True

    # Register signal handlers
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    # Create agent with database connection
    agent = None
    try:
        # Read Redis password from environment (optional for non-auth setups)
        redis_password = os.environ.get('REDIS_PASSWORD')

        redis_config = {
            'host': 'localhost',
            'port': 6379,
            'db': 0
        }

        # Only add password if it's set
        if redis_password:
            redis_config['password'] = redis_password

        agent = CitationIntegrityAgent(
            agent_id=agent_id,
            initial_reputation=0.5,
            exploration_rate=0.2,
            db_config={
                'host': os.getenv('DATABASE_HOST', os.getenv('PGHOST', 'localhost')),
                'port': int(os.getenv('DATABASE_PORT', os.getenv('PGPORT', '5432'))),
                'database': os.getenv('POSTGRES_DB', os.getenv('PGDATABASE', os.getenv('DATABASE_NAME', 'citations'))),
                'user': os.getenv('POSTGRES_USER', os.getenv('PGUSER', os.getenv('DATABASE_USER', 'postgres'))),
                'password': os.getenv('POSTGRES_PASSWORD', os.getenv('PGPASSWORD', os.getenv('DATABASE_PASSWORD', '')))
            },
            redis_config=redis_config
        )
        logger.info(f"✅ Agent {agent_id} initialized and ready for IPC")

        # Send startup health message
        health_msg = json.dumps({"type": "health", "data": {"healthy": True}}) + "\n"
        sys.stdout.write(health_msg)
        sys.stdout.flush()

    except Exception as e:
        logger.error(f"❌ Failed to initialize agent {agent_id}: {e}")
        error_msg = json.dumps({"type": "error", "error": str(e)}) + "\n"
        sys.stdout.write(error_msg)
        sys.stdout.flush()
        sys.exit(1)

    # Main IPC loop
    logger.info(f"🔄 Agent {agent_id} entering IPC loop...")
    exit_code = 0
    try:
        while not shutdown_requested:
            try:
                # H4 FIX: Use select with timeout to check for stdin data
                # This allows the shutdown_requested flag to be checked periodically
                # instead of blocking forever on readline()
                readable, _, _ = select.select([sys.stdin], [], [], 0.5)  # 500ms timeout

                if not readable:
                    # No data available, check shutdown flag and continue
                    continue

                # Read line from stdin (non-blocking now since we know data is available)
                line = sys.stdin.readline()

                if not line:
                    # EOF reached (stdin closed)
                    logger.info("EOF reached, shutting down")
                    break

                line = line.strip()
                if not line:
                    continue

                # Parse JSON request
                try:
                    request = json.loads(line)
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON: {e}")
                    continue

                # Extract request details
                request_type = request.get("type")
                request_id = request.get("requestId")
                method = request.get("method")
                params = request.get("params", {})

                # Handle request
                response = None

                if request_type == "request" and method == "analyze_citation":
                    # Analyze citation request
                    try:
                        doc_data = params.get("document", {})
                        doc = CitationDocument(
                            text=doc_data.get("text", ""),
                            claimed_source=doc_data.get("claimedSource"),
                            actual_source=doc_data.get("actualSource"),
                            metadata=doc_data.get("metadata", {})
                        )

                        result, stats = agent.process_citation(doc)

                        response = {
                            "type": "response",
                            "requestId": request_id,
                            "data": {
                                "integrityScore": result.integrity_score,
                                "behaviorUsed": result.behavior_used.value,
                                "confidence": result.confidence,
                                "detectedViolations": result.detected_violations,
                                "metadata": result.metadata,
                                "agentId": result.metadata.get('agent_id', agent_id),
                                "agentReputation": result.metadata.get('reputation', agent.reputation)
                            }
                        }

                    except Exception as e:
                        logger.error(f"Error analyzing citation: {e}")
                        response = {
                            "type": "response",
                            "requestId": request_id,
                            "error": str(e)
                        }

                elif request_type == "request" and method == "get_status":
                    # Get agent status
                    try:
                        status = agent.get_status()
                        response = {
                            "type": "response",
                            "requestId": request_id,
                            "data": status
                        }
                    except Exception as e:
                        logger.error(f"Error getting status: {e}")
                        response = {
                            "type": "response",
                            "requestId": request_id,
                            "error": str(e)
                        }

                else:
                    # Unknown request type or method
                    response = {
                        "type": "response",
                        "requestId": request_id,
                        "error": f"Unknown request type '{request_type}' or method '{method}'"
                    }

                # Send response
                if response:
                    response_json = json.dumps(response) + "\n"
                    sys.stdout.write(response_json)
                    sys.stdout.flush()

            except KeyboardInterrupt:
                logger.info("Keyboard interrupt received")
                break
            except Exception as e:
                logger.error(f"Error in IPC loop: {e}")
                # Continue processing despite errors

    except Exception as e:
        logger.error(f"Fatal error in IPC server: {e}")
        exit_code = 1

    finally:
        # Cleanup
        logger.info(f"🛑 Agent {agent_id} shutting down...")
        try:
            if agent:
                agent.cleanup()
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
        logger.info(f"✅ Agent {agent_id} shutdown complete")
        
        # H3 FIX: Explicitly exit to ensure process terminates
        # This is critical - without this, Python may hang if there are
        # any lingering threads, timers, or file handles
        sys.exit(exit_code)


if __name__ == "__main__":
    import sys

    # Check if agent ID provided as command line argument
    if len(sys.argv) > 1:
        agent_id = sys.argv[1]
        logger.info(f"🤖 Starting agent {agent_id} in IPC server mode")
        run_ipc_server(agent_id)
    else:
        # Run demo mode
        logger.info("Running in demo mode (no agent ID provided)")
        main()
