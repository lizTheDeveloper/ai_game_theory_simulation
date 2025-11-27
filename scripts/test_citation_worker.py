#!/usr/bin/env python3
"""
Test script for citation worker service.

Pushes test tasks to Redis queue and retrieves results.

Usage:
    python scripts/test_citation_worker.py

Author: 404GeneNotFound
Date: 2025-11-22
"""

import json
import redis
import time
import uuid
from typing import Dict, Any, Optional


def create_test_task(text: str, claimed_source: str, actual_source: Optional[str] = None) -> Dict[str, Any]:
    """Create a test citation analysis task."""
    return {
        'task_id': str(uuid.uuid4()),
        'document': {
            'text': text,
            'claimed_source': claimed_source,
            'actual_source': actual_source,
            'metadata': {
                'test': True,
                'timestamp': time.time()
            }
        }
    }


def push_task(redis_client: redis.Redis, task: Dict[str, Any], queue: str = 'citations:tasks') -> str:
    """Push task to Redis queue."""
    task_id = task['task_id']
    redis_client.rpush(queue, json.dumps(task))
    print(f"✅ Pushed task {task_id} to queue")
    return task_id


def get_result(redis_client: redis.Redis, task_id: str, timeout: int = 30) -> Optional[Dict[str, Any]]:
    """Poll for result with timeout."""
    result_key = f"citations:results:{task_id}"
    start_time = time.time()

    print(f"⏳ Waiting for result (max {timeout}s)...")

    while time.time() - start_time < timeout:
        result_json = redis_client.get(result_key)

        if result_json:
            result = json.loads(result_json)
            print(f"✅ Got result for task {task_id}")
            return result

        time.sleep(0.5)

    print(f"❌ Timeout waiting for result (task {task_id})")
    return None


def main():
    """Main test function."""
    # Connect to Redis
    print("🔌 Connecting to Redis...")
    try:
        r = redis.Redis(host='localhost', port=6380, db=0, decode_responses=True)
        r.ping()
        print("✅ Redis connected (port 6380)")
    except redis.ConnectionError:
        print("❌ Redis connection failed - is Docker Compose running?")
        print("   Run: sg docker -c 'docker compose up -d postgres redis'")
        return 1

    # Test tasks
    test_tasks = [
        create_test_task(
            "According to Smith et al. (2024), climate change is accelerating.",
            "Smith et al. 2024",
            "Smith, J., et al. (2024). Climate Acceleration. Nature, 123, 45-67."
        ),
        create_test_task(
            "Jones (2023) found no evidence of AI risks.",
            "Jones 2023",
            None  # Fabricated citation
        ),
        create_test_task(
            "Recent studies (Brown, 2025) show promising results.",
            "Brown 2025",
            "Brown, A. (2025). Promising Results. Science, 456, 789-801."
        )
    ]

    print(f"\n📤 Pushing {len(test_tasks)} test tasks to queue")
    print("=" * 60)

    task_ids = []
    for task in test_tasks:
        task_id = push_task(r, task)
        task_ids.append(task_id)
        time.sleep(0.1)  # Small delay between tasks

    print(f"\n⏳ Waiting for workers to process tasks...")
    print("=" * 60)

    # Retrieve results
    results = []
    for task_id in task_ids:
        result = get_result(r, task_id, timeout=30)
        if result:
            results.append(result)
            print(f"\n📊 Task {task_id}:")
            print(f"   Success: {result.get('success')}")
            if result.get('success'):
                res_data = result.get('result', {})
                print(f"   Integrity Score: {res_data.get('integrity_score', 0):.2f}")
                print(f"   Behavior: {res_data.get('behavior_used')}")
                print(f"   Confidence: {res_data.get('confidence', 0):.2f}")
                print(f"   Agent: {result.get('agent_id')}")
                print(f"   Agent Reputation: {result.get('agent_reputation', 0):.2f}")
            else:
                print(f"   Error: {result.get('error')}")
        else:
            print(f"\n❌ No result for task {task_id}")

    # Summary
    print("\n" + "=" * 60)
    print(f"📈 Summary:")
    print(f"   Tasks pushed: {len(task_ids)}")
    print(f"   Results received: {len(results)}")
    print(f"   Success rate: {len(results) / len(task_ids) * 100:.0f}%")

    if len(results) == len(task_ids):
        print(f"\n✅ All tasks processed successfully!")
        return 0
    else:
        print(f"\n⚠️ Some tasks did not complete")
        return 1


if __name__ == '__main__':
    exit(main())
