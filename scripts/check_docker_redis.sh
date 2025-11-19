#!/bin/bash
# Check Docker Redis Configuration

set -e

echo "========================================="
echo "Docker Redis Configuration Check"
echo "========================================="
echo ""

# Find Redis container
echo "🔍 Finding Redis container..."
REDIS_CONTAINER=$(docker ps --filter "publish=6379" --format "{{.ID}}" | head -1)

if [ -z "$REDIS_CONTAINER" ]; then
    echo "❌ No Redis container found on port 6379"
    exit 1
fi

echo "✅ Found Redis container: $REDIS_CONTAINER"
echo ""

# Container details
echo "📦 Container Details:"
docker ps --filter "id=$REDIS_CONTAINER" --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}"
echo ""

# Check restart policy
echo "🔄 Restart Policy:"
docker inspect $REDIS_CONTAINER | jq -r '.[0].HostConfig.RestartPolicy.Name'
echo ""

# Check volumes/mounts
echo "💾 Data Persistence (Volumes/Mounts):"
MOUNTS=$(docker inspect $REDIS_CONTAINER | jq -r '.[0].Mounts')
if [ "$MOUNTS" == "[]" ] || [ "$MOUNTS" == "null" ]; then
    echo "⚠️  WARNING: No volumes mounted - data will be lost if container stops!"
    echo "   Recommendation: Recreate container with persistent volume"
else
    echo "$MOUNTS" | jq -r '.[] | "  ✅ \(.Type): \(.Source) -> \(.Destination)"'
fi
echo ""

# Check Redis config
echo "⚙️  Redis Configuration:"
docker exec $REDIS_CONTAINER redis-cli CONFIG GET appendonly
docker exec $REDIS_CONTAINER redis-cli CONFIG GET save
echo ""

# Test connection
echo "🧪 Testing Connection:"
if docker exec $REDIS_CONTAINER redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is responding"
else
    echo "❌ Redis is not responding"
    exit 1
fi
echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
RESTART_POLICY=$(docker inspect $REDIS_CONTAINER | jq -r '.[0].HostConfig.RestartPolicy.Name')
APPENDONLY=$(docker exec $REDIS_CONTAINER redis-cli CONFIG GET appendonly | tail -1)
HAS_VOLUMES=$(docker inspect $REDIS_CONTAINER | jq -r '.[0].Mounts | length')

echo "Restart on boot: $RESTART_POLICY"
echo "AOF persistence: $APPENDONLY"
echo "Volume mounts: $HAS_VOLUMES"
echo ""

if [ "$RESTART_POLICY" != "always" ] && [ "$RESTART_POLICY" != "unless-stopped" ]; then
    echo "⚠️  Recommendation: Update restart policy"
    echo "   docker update --restart unless-stopped $REDIS_CONTAINER"
fi

if [ "$HAS_VOLUMES" -eq 0 ]; then
    echo "⚠️  Recommendation: Add persistent volume"
    echo "   See scripts/setup_persistent_redis.sh"
fi

if [ "$APPENDONLY" != "yes" ]; then
    echo "⚠️  Recommendation: Enable AOF persistence"
    echo "   docker exec $REDIS_CONTAINER redis-cli CONFIG SET appendonly yes"
fi

echo ""
echo "✅ Docker Redis check complete"
