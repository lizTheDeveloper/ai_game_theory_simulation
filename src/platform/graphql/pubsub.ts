/**
 * MARCUS 3.1 PubSub Configuration
 *
 * M3 FIX: TODO - Implement Redis-backed PubSub for production.
 *
 * CURRENT STATE:
 * Uses in-memory graphql-subscriptions PubSub which has limitations:
 * - Memory grows with long-running subscriptions
 * - In multi-pod Kubernetes deployment, each pod has its own PubSub
 * - Subscriptions only work for the pod the client connects to
 *
 * IMPLEMENTATION PLAN:
 * 1. Install graphql-redis-subscriptions:
 *    npm install graphql-redis-subscriptions ioredis
 *
 * 2. Update this file to use RedisPubSub:
 *    ```typescript
 *    import { RedisPubSub } from 'graphql-redis-subscriptions';
 *    import Redis from 'ioredis';
 *
 *    const options = {
 *      host: process.env.REDIS_HOST || 'localhost',
 *      port: parseInt(process.env.REDIS_PORT || '6379'),
 *      retryStrategy: (times: number) => Math.min(times * 50, 2000)
 *    };
 *
 *    export const pubsub = new RedisPubSub({
 *      publisher: new Redis(options),
 *      subscriber: new Redis(options)
 *    });
 *    ```
 *
 * 3. Update GraphQLContext type in resolvers.ts:
 *    ```typescript
 *    import { RedisPubSub } from 'graphql-redis-subscriptions';
 *
 *    export interface GraphQLContext {
 *      // ... other fields
 *      pubsub: PubSub | RedisPubSub;
 *    }
 *    ```
 *
 * 4. Update server setup to use environment-based configuration:
 *    ```typescript
 *    const pubsub = process.env.NODE_ENV === 'production'
 *      ? createRedisPubSub()
 *      : new PubSub();
 *    ```
 *
 * 5. Test in multi-pod environment to verify cross-pod subscription delivery
 *
 * PRIORITY: Medium (consider for next sprint)
 * COMPLEXITY: Medium (requires package install, context type changes, multi-pod testing)
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-28
 */

import { PubSub } from 'graphql-subscriptions';

// TODO: M3 - Replace with Redis-backed PubSub for production
// See implementation plan above
export const pubsub = new PubSub();

/**
 * Factory function for future Redis PubSub implementation.
 * Currently returns in-memory PubSub.
 *
 * @returns PubSub instance
 */
export function createPubSub(): PubSub {
  // TODO: M3 - Check environment and return RedisPubSub for production
  // if (process.env.NODE_ENV === 'production') {
  //   return createRedisPubSub();
  // }
  return new PubSub();
}
