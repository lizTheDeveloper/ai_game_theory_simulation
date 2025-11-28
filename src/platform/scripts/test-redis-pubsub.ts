/**
 * Test script for M2/M3 Redis PubSub implementation
 *
 * Run with: FORCE_REDIS_PUBSUB=true REDIS_PORT=6380 npx tsx scripts/test-redis-pubsub.ts
 */

import { pubsub, isRedisPubSub } from '../graphql/pubsub';

async function testPubSub() {
  console.log('=== M2/M3 Redis PubSub Test ===\n');

  // Check which PubSub is being used
  console.log(`PubSub type: ${isRedisPubSub() ? 'Redis (multi-pod ready)' : 'In-memory (development)'}`);

  if (!isRedisPubSub()) {
    console.log('\n⚠️  Not using Redis PubSub. Set FORCE_REDIS_PUBSUB=true to test Redis mode.');
    console.log('   Example: FORCE_REDIS_PUBSUB=true REDIS_PORT=6380 npx tsx scripts/test-redis-pubsub.ts\n');
  }

  // Test subscription
  const TOPIC = 'TEST_CHANNEL';
  let receivedMessage = false;

  console.log(`\n1. Subscribing to topic: ${TOPIC}`);

  const subscriptionId = await pubsub.subscribe(TOPIC, (payload: any) => {
    console.log(`   ✅ Received message: ${JSON.stringify(payload)}`);
    receivedMessage = true;
  });

  console.log(`   Subscription ID: ${subscriptionId}`);

  // Wait for subscription to be ready
  await new Promise(resolve => setTimeout(resolve, 100));

  // Test publish
  console.log(`\n2. Publishing message to topic: ${TOPIC}`);
  const testMessage = { test: 'Hello from M2/M3!', timestamp: Date.now() };
  await pubsub.publish(TOPIC, testMessage);
  console.log(`   Published: ${JSON.stringify(testMessage)}`);

  // Wait for message delivery
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check result
  console.log('\n3. Results:');
  if (receivedMessage) {
    console.log('   ✅ SUCCESS: PubSub is working correctly!');
    if (isRedisPubSub()) {
      console.log('   ✅ Redis PubSub verified - ready for multi-pod deployment');
    }
  } else {
    console.log('   ❌ FAILED: Message was not received');
  }

  // Cleanup
  console.log('\n4. Cleaning up...');
  await pubsub.unsubscribe(subscriptionId);
  console.log('   Unsubscribed from topic');

  console.log('\n=== Test Complete ===\n');

  // Exit cleanly
  process.exit(receivedMessage ? 0 : 1);
}

testPubSub().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
