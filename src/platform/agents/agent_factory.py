#!/usr/bin/env python3
"""
MARCUS 3.1 Agent Factory with Feature Flags

Factory pattern for creating citation agents with feature flag support.
Enables gradual rollout of async agents (10% -> 50% -> 100%).

Feature Flags:
- ENABLE_ASYNC_AGENT: Master switch for async agents
- ASYNC_AGENT_ROLLOUT_PERCENT: Percentage of agents using async (0-100)

Environment Variables:
- ENABLE_ASYNC_AGENT=true|false (default: false)
- ASYNC_AGENT_ROLLOUT_PERCENT=0-100 (default: 0)
- AGENT_MODE=sync|async|auto (default: auto)

Usage:
    # Auto mode - respects rollout percentage
    agent = create_citation_agent(agent_id="agent-1")

    # Force sync mode
    agent = create_citation_agent(agent_id="agent-1", force_mode="sync")

    # Force async mode
    agent = create_citation_agent(agent_id="agent-1", force_mode="async")

Author: Marcus (Platform Engineer)
Date: 2025-11-22
"""

import hashlib
import logging
import os
from typing import Optional, Dict, Any, Union

# Import both sync and async implementations
try:
    from citation_integrity_agent import CitationIntegrityAgent
    from citation_integrity_agent_async import (
        AsyncCitationIntegrityAgent,
        CitationIntegrityAgentAsyncWrapper
    )
except ImportError as e:
    raise ImportError(
        f"Failed to import agent implementations: {e}. "
        "Ensure both citation_integrity_agent.py and citation_integrity_agent_async.py exist."
    )

logger = logging.getLogger(__name__)


def get_feature_flag(name: str, default: str = "false") -> str:
    """
    Get feature flag value from environment.

    Args:
        name: Feature flag name
        default: Default value if not set

    Returns:
        Feature flag value (lowercased)
    """
    return os.getenv(name, default).lower()


def is_async_enabled() -> bool:
    """
    Check if async agents are enabled.

    Returns:
        True if async agents should be used
    """
    return get_feature_flag("ENABLE_ASYNC_AGENT", "false") == "true"


def get_rollout_percentage() -> int:
    """
    Get async agent rollout percentage.

    Returns:
        Percentage (0-100) of agents that should use async mode
    """
    try:
        percent = int(os.getenv("ASYNC_AGENT_ROLLOUT_PERCENT", "0"))
        return max(0, min(100, percent))
    except ValueError:
        logger.warning("Invalid ASYNC_AGENT_ROLLOUT_PERCENT, defaulting to 0")
        return 0


def should_use_async_for_agent(agent_id: str) -> bool:
    """
    Determine if a specific agent should use async mode.

    Uses consistent hashing to ensure the same agent_id always gets
    the same decision, enabling stable canary deployments.

    Args:
        agent_id: Unique agent identifier

    Returns:
        True if this agent should use async mode
    """
    if not is_async_enabled():
        return False

    rollout_percent = get_rollout_percentage()

    if rollout_percent == 0:
        return False
    elif rollout_percent >= 100:
        return True

    # Consistent hashing: use agent_id hash to determine assignment
    # This ensures same agent_id always gets same result
    hash_value = int(hashlib.md5(agent_id.encode()).hexdigest(), 16)
    bucket = hash_value % 100  # 0-99

    # If bucket < rollout_percent, use async
    return bucket < rollout_percent


def get_agent_mode() -> str:
    """
    Get configured agent mode.

    Returns:
        "sync", "async", or "auto"
    """
    mode = get_feature_flag("AGENT_MODE", "auto")
    if mode not in ["sync", "async", "auto"]:
        logger.warning(f"Invalid AGENT_MODE '{mode}', defaulting to 'auto'")
        return "auto"
    return mode


def create_citation_agent(
    agent_id: str,
    force_mode: Optional[str] = None,
    **kwargs
) -> Union[CitationIntegrityAgent, CitationIntegrityAgentAsyncWrapper]:
    """
    Factory function for creating citation agents with feature flag support.

    Args:
        agent_id: Unique agent identifier
        force_mode: Force specific mode ("sync" or "async"), overrides feature flags
        **kwargs: Additional arguments passed to agent constructor

    Returns:
        CitationIntegrityAgent (sync or async wrapper)

    Raises:
        ValueError: If force_mode is invalid
    """
    # Determine which implementation to use
    use_async = False

    if force_mode:
        # Explicit mode override
        if force_mode == "async":
            use_async = True
        elif force_mode == "sync":
            use_async = False
        else:
            raise ValueError(f"Invalid force_mode '{force_mode}', must be 'sync' or 'async'")

        logger.info(f"Agent {agent_id}: Mode forced to {force_mode}")
    else:
        # Auto mode - check feature flags
        configured_mode = get_agent_mode()

        if configured_mode == "async":
            use_async = True
            logger.info(f"Agent {agent_id}: Using async (AGENT_MODE=async)")
        elif configured_mode == "sync":
            use_async = False
            logger.info(f"Agent {agent_id}: Using sync (AGENT_MODE=sync)")
        else:  # auto
            use_async = should_use_async_for_agent(agent_id)
            rollout = get_rollout_percentage()
            logger.info(
                f"Agent {agent_id}: {'Async' if use_async else 'Sync'} "
                f"(rollout: {rollout}%, consistent hashing)"
            )

    # Create appropriate agent
    if use_async:
        logger.info(f"✨ Creating async agent: {agent_id}")
        agent = CitationIntegrityAgentAsyncWrapper(agent_id=agent_id, **kwargs)
    else:
        logger.info(f"📦 Creating sync agent: {agent_id}")
        agent = CitationIntegrityAgent(agent_id=agent_id, **kwargs)

    return agent


def get_agent_stats() -> Dict[str, Any]:
    """
    Get current agent configuration statistics.

    Returns:
        Dict with feature flag values and rollout status
    """
    return {
        'async_enabled': is_async_enabled(),
        'rollout_percentage': get_rollout_percentage(),
        'agent_mode': get_agent_mode(),
        'env': {
            'ENABLE_ASYNC_AGENT': os.getenv('ENABLE_ASYNC_AGENT', 'not set'),
            'ASYNC_AGENT_ROLLOUT_PERCENT': os.getenv('ASYNC_AGENT_ROLLOUT_PERCENT', 'not set'),
            'AGENT_MODE': os.getenv('AGENT_MODE', 'not set')
        }
    }


# Example usage and testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=== Agent Factory Feature Flag Demo ===\n")

    # Print current configuration
    stats = get_agent_stats()
    print(f"Configuration:")
    print(f"  Async Enabled: {stats['async_enabled']}")
    print(f"  Rollout %: {stats['rollout_percentage']}")
    print(f"  Agent Mode: {stats['agent_mode']}")
    print(f"\nEnvironment:")
    for key, value in stats['env'].items():
        print(f"  {key}: {value}")

    print("\n=== Testing Agent Creation ===\n")

    # Test agent creation with different IDs
    test_ids = [f"agent-{i}" for i in range(1, 11)]

    async_count = 0
    for agent_id in test_ids:
        use_async = should_use_async_for_agent(agent_id)
        if use_async:
            async_count += 1
        print(f"{agent_id}: {'Async ✨' if use_async else 'Sync 📦'}")

    print(f"\nAsync agents: {async_count}/{len(test_ids)} ({async_count * 10}%)")

    print("\n=== Canary Rollout Simulation ===\n")

    # Simulate gradual rollout
    rollout_stages = [0, 10, 25, 50, 75, 100]

    for percent in rollout_stages:
        os.environ['ASYNC_AGENT_ROLLOUT_PERCENT'] = str(percent)
        os.environ['ENABLE_ASYNC_AGENT'] = 'true'

        async_count = sum(
            1 for agent_id in test_ids
            if should_use_async_for_agent(agent_id)
        )

        print(f"Rollout {percent:3d}%: {async_count}/{len(test_ids)} agents async")
