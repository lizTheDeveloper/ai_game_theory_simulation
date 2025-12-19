/**
 * MARCUS 3.2 PubSub Configuration
 *
 * M3 RESOLVED: Redis-backed PubSub for multi-pod production.
 *
 * ARCHITECTURE:
 * - Development: In-memory PubSub (simple, no dependencies)
 * - Production: Redis-backed PubSub (cross-pod subscription delivery)
 *
 * Redis PubSub enables subscriptions to work across multiple K8s pods:
 * - All pods publish to Redis
 * - All pods subscribe from Redis
 * - Clients on any pod receive updates from any other pod
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-28
 * Updated: 2025-11-28 (M3 implemented)
 */

import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

/**
 * Redis connection options for PubSub.
 * Uses same Redis instance as task queue for simplicity.
 */
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    // Exponential backoff with max 2 second delay
    const delay = Math.min(times * 50, 2000);
    console.log(`PubSub Redis connection retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Don't connect until first use
};

/**
 * Create Redis-backed PubSub for production.
 * Uses separate publisher and subscriber connections (Redis requirement).
 */
function createRedisPubSub(): RedisPubSub {
  const publisher = new Redis(redisOptions);
  const subscriber = new Redis(redisOptions);

  // Log connection events
  publisher.on('connect', () => console.log('PubSub Redis publisher connected'));
  publisher.on('error', (err) => console.error('PubSub Redis publisher error:', err.message));
  subscriber.on('connect', () => console.log('PubSub Redis subscriber connected'));
  subscriber.on('error', (err) => console.error('PubSub Redis subscriber error:', err.message));

  return new RedisPubSub({
    publisher,
    subscriber,
  });
}

/**
 * Create in-memory PubSub for development.
 * Simple, no external dependencies, but doesn't work across processes.
 */
function createInMemoryPubSub(): PubSub {
  console.log('Using in-memory PubSub (development mode)');
  return new PubSub();
}

/**
 * Shared PubSub instance.
 *
 * Uses Redis in production for cross-pod delivery.
 * Uses in-memory in development for simplicity.
 *
 * Set FORCE_REDIS_PUBSUB=true to use Redis in development (for testing).
 */
export const pubsub: PubSub | RedisPubSub =
  process.env.NODE_ENV === 'production' || process.env.FORCE_REDIS_PUBSUB === 'true'
    ? createRedisPubSub()
    : createInMemoryPubSub();

/**
 * Factory function for PubSub creation.
 * Returns the shared instance (don't create new instances per request).
 *
 * @returns Shared PubSub instance
 */
export function createPubSub(): PubSub | RedisPubSub {
  return pubsub;
}

/**
 * Check if using Redis-backed PubSub.
 */
export function isRedisPubSub(): boolean {
  return pubsub instanceof RedisPubSub;
}
