#!/usr/bin/env python3
"""
SQL Injection Security Tests for MARCUS Platform (Python)

These tests verify that the Python agent code is protected against SQL
injection attacks through proper parameterization.

Security Test Coverage:
- Classic SQL injection in agent_id
- Injection in behavior fields
- Injection in JSONB memory_state
- Second-order injection
- Unicode/encoding attacks
- Parameterized query verification

Author: Marcus (Platform Engineer)
Date: 2025-11-17
"""

import os
import sys
import unittest
import json
from typing import Dict, Any, List
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../agents')))

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from citation_integrity_agent import CitationIntegrityAgent, CitationDocument, CitationBehavior
except ImportError as e:
    print(f"Error importing dependencies: {e}")
    print("Install with: pip install psycopg2-binary")
    sys.exit(1)


# ============================================================================
# SQL Injection Attack Payloads
# ============================================================================

SQL_INJECTION_PAYLOADS = [
    # Classic injection
    "'; DROP TABLE agent_states; --",
    "' OR '1'='1",
    "' OR 1=1--",
    "admin'--",
    "admin' #",

    # Boolean-based blind
    "' AND 1=1--",
    "' AND 'x'='x",
    "') OR ('x'='x",

    # UNION-based
    "' UNION SELECT NULL, NULL, NULL--",
    "' UNION SELECT username, password FROM users--",

    # Stacked queries
    "'; DELETE FROM agent_states WHERE '1'='1",
    "'; INSERT INTO agent_states VALUES ('hacked', 1.0, 0, 0, 'bad', '{}', 0.5, NOW(), 0)--",

    # Comment-based
    "admin'/*",
    "admin'-- -",

    # Time-based blind
    "'; WAITFOR DELAY '00:00:05'--",
    "'; SELECT pg_sleep(5)--",

    # Special characters
    "\\'; DROP TABLE agent_states; --",
    "'; \\x27; DROP TABLE agent_states; --",

    # PostgreSQL-specific
    "'; SELECT version(); --",
    "'; SELECT * FROM pg_tables; --",

    # Python string formatting vulnerabilities
    "%(agent_id)s; DROP TABLE agent_states; --",
    "{agent_id}; DROP TABLE agent_states; --",
    "%s; DROP TABLE agent_states; --",
]


# ============================================================================
# Test Configuration
# ============================================================================

TEST_DB_CONFIG = {
    'host': os.getenv('TEST_DB_HOST', 'localhost'),
    'port': int(os.getenv('TEST_DB_PORT', '5432')),
    'database': os.getenv('TEST_DB_NAME', 'citations_test'),
    'user': os.getenv('TEST_DB_USER', 'postgres'),
    'password': os.getenv('TEST_DB_PASSWORD', 'password')
}


# ============================================================================
# Test Utilities
# ============================================================================

def setup_test_database(db_config: Dict[str, Any]) -> None:
    """Create test database schema."""
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agent_states (
            agent_id VARCHAR(50) PRIMARY KEY,
            reputation FLOAT NOT NULL DEFAULT 0.5,
            total_citations INTEGER NOT NULL DEFAULT 0,
            detected_violations INTEGER NOT NULL DEFAULT 0,
            current_behavior VARCHAR(50),
            memory_state JSONB NOT NULL,
            exploration_rate FLOAT NOT NULL DEFAULT 0.2,
            timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
            version BIGINT NOT NULL DEFAULT 0,

            CONSTRAINT reputation_range CHECK (reputation >= 0 AND reputation <= 1),
            CONSTRAINT exploration_range CHECK (exploration_rate >= 0 AND exploration_rate <= 1)
        );

        CREATE INDEX IF NOT EXISTS idx_agent_reputation ON agent_states(reputation DESC);
        CREATE INDEX IF NOT EXISTS idx_agent_timestamp ON agent_states(timestamp DESC);
    """)

    conn.commit()
    cursor.close()
    conn.close()


def cleanup_test_database(db_config: Dict[str, Any]) -> None:
    """Clean test data."""
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM agent_states WHERE agent_id LIKE %s", ('test_%',))
    conn.commit()
    cursor.close()
    conn.close()


def verify_table_integrity(db_config: Dict[str, Any]) -> bool:
    """Verify table still exists and is queryable after injection attempt."""
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM agent_states")
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count >= 0
    except Exception as e:
        print(f"Table integrity check failed: {e}")
        return False


# ============================================================================
# Test Cases
# ============================================================================

class TestSQLInjectionSecurity(unittest.TestCase):
    """Test suite for SQL injection security."""

    @classmethod
    def setUpClass(cls):
        """Set up test database."""
        setup_test_database(TEST_DB_CONFIG)

    @classmethod
    def tearDownClass(cls):
        """Clean up test database."""
        cleanup_test_database(TEST_DB_CONFIG)

    def setUp(self):
        """Clean data before each test."""
        cleanup_test_database(TEST_DB_CONFIG)

    def test_sql_injection_in_agent_id_critical(self):
        """CRITICAL: SQL injection in agent_id should be safely escaped."""
        for payload in SQL_INJECTION_PAYLOADS:
            with self.subTest(payload=payload):
                # Create agent with malicious ID
                agent = CitationIntegrityAgent(
                    agent_id=payload,  # INJECTION ATTEMPT
                    db_config=TEST_DB_CONFIG
                )

                # Attempt to save state
                try:
                    agent.save_state()

                    # Verify table still exists
                    integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
                    self.assertTrue(integrity_ok, f"Table destroyed by payload: {payload}")

                    # Verify payload stored as literal (not executed)
                    agent_loaded = CitationIntegrityAgent(
                        agent_id=payload,
                        db_config=TEST_DB_CONFIG
                    )
                    loaded = agent_loaded.load_state()

                    if loaded:
                        # Verify agent_id stored as-is
                        self.assertEqual(agent_loaded.agent_id, payload)

                except Exception as e:
                    # Even if save fails, table should exist
                    integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
                    self.assertTrue(integrity_ok, f"Table destroyed by payload: {payload}")

                finally:
                    agent.cleanup()

    def test_sql_injection_in_behavior_critical(self):
        """CRITICAL: SQL injection in current_behavior should be safely escaped."""
        malicious_behavior = "'; DROP TABLE agent_states; --"

        agent = CitationIntegrityAgent(
            agent_id='test_behavior_injection',
            db_config=TEST_DB_CONFIG
        )

        # Force malicious behavior value
        agent.current_behavior = CitationBehavior.MODERATE_CHECK
        # Store malicious string in the actual save
        original_value = agent.current_behavior.value
        agent.current_behavior = type('obj', (object,), {'value': malicious_behavior})()

        try:
            agent.save_state()

            # Verify table intact
            integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
            self.assertTrue(integrity_ok)

        except Exception as e:
            # May fail validation, that's ok
            integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
            self.assertTrue(integrity_ok)

        finally:
            agent.cleanup()

    def test_sql_injection_in_jsonb_memory_critical(self):
        """CRITICAL: SQL injection in JSONB memory_state should be safely escaped."""
        malicious_json = {
            'key': "'; DROP TABLE agent_states; --",
            'nested': {
                'attack': "' OR 1=1--"
            }
        }

        agent = CitationIntegrityAgent(
            agent_id='test_jsonb_injection',
            db_config=TEST_DB_CONFIG
        )

        # Inject malicious JSONB data
        agent.memory.longterm_stats = malicious_json

        try:
            agent.save_state()

            # Verify table intact
            integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
            self.assertTrue(integrity_ok)

            # Verify JSONB stored correctly (not executed)
            agent_loaded = CitationIntegrityAgent(
                agent_id='test_jsonb_injection',
                db_config=TEST_DB_CONFIG
            )
            loaded = agent_loaded.load_state()

            if loaded:
                self.assertEqual(agent_loaded.memory.longterm_stats, malicious_json)

        finally:
            agent.cleanup()

    def test_second_order_injection_high(self):
        """HIGH: Second-order injection (store malicious data, load it later)."""
        malicious_id = "test'; DROP TABLE agent_states; --"

        # Step 1: Store malicious data
        agent = CitationIntegrityAgent(
            agent_id=malicious_id,
            db_config=TEST_DB_CONFIG
        )

        try:
            agent.save_state()

            # Step 2: Load it back (this is where second-order injection would trigger)
            agent_loaded = CitationIntegrityAgent(
                agent_id=malicious_id,
                db_config=TEST_DB_CONFIG
            )
            loaded = agent_loaded.load_state()

            # Verify table still intact
            integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
            self.assertTrue(integrity_ok)

            # Verify data loaded correctly
            if loaded:
                self.assertEqual(agent_loaded.agent_id, malicious_id)

        finally:
            agent.cleanup()

    def test_unicode_encoding_injection_medium(self):
        """MEDIUM: Unicode/encoding-based SQL injection attempts."""
        unicode_payloads = [
            "test\u0027 OR 1=1--",  # Unicode single quote
            "test\u0022 OR 1=1--",  # Unicode double quote
            "test\u005c\u0027 OR 1=1--",  # Unicode backslash + quote
        ]

        for payload in unicode_payloads:
            with self.subTest(payload=payload):
                agent = CitationIntegrityAgent(
                    agent_id=payload,
                    db_config=TEST_DB_CONFIG
                )

                try:
                    agent.save_state()

                    integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
                    self.assertTrue(integrity_ok)

                finally:
                    agent.cleanup()

    def test_parameterized_queries_work_correctly(self):
        """Verify parameterized queries work correctly with normal data."""
        agent = CitationIntegrityAgent(
            agent_id='test_normal_agent',
            initial_reputation=0.75,
            exploration_rate=0.15,
            db_config=TEST_DB_CONFIG
        )

        agent.total_citations = 100
        agent.detected_violations = 5
        agent.current_behavior = CitationBehavior.STRICT_MATCH

        try:
            agent.save_state()

            # Load back
            agent_loaded = CitationIntegrityAgent(
                agent_id='test_normal_agent',
                db_config=TEST_DB_CONFIG
            )
            loaded = agent_loaded.load_state()

            self.assertTrue(loaded)
            self.assertEqual(agent_loaded.reputation, 0.75)
            self.assertEqual(agent_loaded.total_citations, 100)
            self.assertEqual(agent_loaded.detected_violations, 5)
            self.assertEqual(agent_loaded.current_behavior, CitationBehavior.STRICT_MATCH)
            self.assertEqual(agent_loaded.exploration_rate, 0.15)

        finally:
            agent.cleanup()

    def test_concurrent_injection_attempts_medium(self):
        """MEDIUM: Concurrent SQL injection attempts should not cause race conditions."""
        import concurrent.futures

        def attempt_injection(payload_idx):
            payload = SQL_INJECTION_PAYLOADS[payload_idx % len(SQL_INJECTION_PAYLOADS)]
            agent = CitationIntegrityAgent(
                agent_id=f"test_concurrent_{payload_idx}_{payload[:10]}",
                db_config=TEST_DB_CONFIG
            )

            try:
                agent.save_state()
            except Exception:
                # Some may fail, that's ok
                pass
            finally:
                agent.cleanup()

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(attempt_injection, i) for i in range(10)]
            concurrent.futures.wait(futures)

        # Verify table integrity after concurrent attempts
        integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
        self.assertTrue(integrity_ok)

    def test_version_field_injection_high(self):
        """HIGH: Version field does not introduce injection vectors."""
        agent = CitationIntegrityAgent(
            agent_id='test_version_injection',
            db_config=TEST_DB_CONFIG
        )

        # Save initial state
        agent.save_state()

        # Attempt to exploit version field
        # Version is passed as part of state dict, test if it's properly parameterized
        malicious_version = "1; DROP TABLE agent_states; --"

        try:
            # Force malicious version (this should fail or be safely escaped)
            agent.save_state(version=malicious_version)  # type: ignore
        except Exception:
            # Expected to fail - that's good
            pass

        # Verify table intact
        integrity_ok = verify_table_integrity(TEST_DB_CONFIG)
        self.assertTrue(integrity_ok)

        agent.cleanup()


# ============================================================================
# Performance Tests
# ============================================================================

class TestSQLInjectionPreventionPerformance(unittest.TestCase):
    """Test that parameterization doesn't impact performance."""

    @classmethod
    def setUpClass(cls):
        """Set up test database."""
        setup_test_database(TEST_DB_CONFIG)

    @classmethod
    def tearDownClass(cls):
        """Clean up test database."""
        cleanup_test_database(TEST_DB_CONFIG)

    def test_parameterized_queries_maintain_performance(self):
        """Verify parameterized queries maintain acceptable performance."""
        num_iterations = 100
        start_time = datetime.now()

        for i in range(num_iterations):
            agent = CitationIntegrityAgent(
                agent_id=f'test_perf_{i}',
                initial_reputation=0.5 + (i % 50) / 100,
                db_config=TEST_DB_CONFIG
            )

            agent.total_citations = i * 10
            agent.detected_violations = i

            agent.save_state()
            agent.cleanup()

        elapsed = (datetime.now() - start_time).total_seconds() * 1000  # ms
        avg_latency = elapsed / num_iterations

        print(f"\n📊 Performance Stats:")
        print(f"  Iterations: {num_iterations}")
        print(f"  Total time: {elapsed:.2f}ms")
        print(f"  Avg latency: {avg_latency:.2f}ms")

        # Verify performance is acceptable (< 50ms avg)
        self.assertLess(avg_latency, 50, f"Performance degraded: {avg_latency:.2f}ms > 50ms")


# ============================================================================
# Run Tests
# ============================================================================

if __name__ == '__main__':
    # Check if test database is configured
    if TEST_DB_CONFIG['database'] == 'citations':
        print("⚠️  WARNING: Using production database name!")
        print("   Set TEST_DB_NAME environment variable to use test database.")
        sys.exit(1)

    print("🔒 Running SQL Injection Security Tests...")
    print(f"   Database: {TEST_DB_CONFIG['database']}")
    print(f"   Host: {TEST_DB_CONFIG['host']}")

    unittest.main(verbosity=2)
