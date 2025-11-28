#!/usr/bin/env bash
# Test Quinn's ability to receive and respond to DMs
# Devon 2025-11-27
#
# Usage:
#   1. Ensure Quinn is set up (run verify-quinn-matrix.sh first)
#   2. Send a DM from Matrix to @agent-quinn:themultiverse.school
#   3. Run this script while Quinn agent is spawned
#   4. Quinn should check notifications and respond

set -e

echo "Quinn DM Test"
echo "============="
echo ""

# Check setup first
if ! grep -q "MATRIX_TOKEN_QUINN" ~/.superalignment-env 2>/dev/null; then
    echo "❌ Quinn Matrix token not configured"
    echo "Run: ./scripts/setup-quinn-matrix.sh"
    exit 1
fi

source ~/.superalignment-env

if [ -z "$MATRIX_TOKEN_QUINN" ]; then
    echo "❌ MATRIX_TOKEN_QUINN is empty"
    exit 1
fi

echo "✓ Quinn Matrix token configured"
echo ""

echo "Testing Matrix connection..."
echo "----------------------------"
echo ""

# Test using Python with matrix-nio
python3 << 'EOF'
import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from nio import AsyncClient

async def test_connection():
    env_path = Path.home() / '.superalignment-env'
    load_dotenv(env_path)

    token = os.getenv('MATRIX_TOKEN_QUINN', '')
    if not token:
        print("❌ Token not loaded")
        return False

    homeserver = "https://matrix.themultiverse.school"
    user_id = "@agent-quinn:themultiverse.school"

    client = AsyncClient(homeserver, user_id)
    client.access_token = token
    client.device_id = "QUINN_DEVICE"

    try:
        # Test sync to verify connection
        sync_response = await client.sync(timeout=3000, full_state=True)

        if hasattr(sync_response, 'rooms'):
            print(f"✓ Connected as {user_id}")

            # Check for DM rooms
            joined_rooms = sync_response.rooms.join
            dm_rooms = [room_id for room_id in joined_rooms.keys()
                       if 'lizthedeveloper' in room_id or len(joined_rooms[room_id].timeline.events) > 0]

            print(f"✓ Joined rooms: {len(joined_rooms)}")
            if dm_rooms:
                print(f"✓ Potential DM rooms: {len(dm_rooms)}")
                for room_id in dm_rooms[:3]:  # Show first 3
                    events = joined_rooms[room_id].timeline.events
                    print(f"  - {room_id}: {len(events)} recent events")
            else:
                print("⚠️  No DM rooms found yet")
                print("   Send a DM from @lizthedeveloper:themultiverse.school to create one")

            return True
        else:
            print(f"❌ Sync failed: {sync_response}")
            return False

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
    finally:
        await client.close()

if asyncio.run(test_connection()):
    print("")
    print("================================")
    print("✅ Quinn can connect to Matrix")
    print("")
    print("To test DM functionality:")
    print("1. From Matrix client (@lizthedeveloper:themultiverse.school)")
    print("2. Start DM with @agent-quinn:themultiverse.school")
    print("3. Send message: 'What's the build status?'")
    print("4. Spawn Quinn: claude --agent quinn")
    print("5. Quinn should check notifications and respond")
    sys.exit(0)
else:
    print("")
    print("❌ Connection test failed")
    sys.exit(1)
EOF

exit $?
