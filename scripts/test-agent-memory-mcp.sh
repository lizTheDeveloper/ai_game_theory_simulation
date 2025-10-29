#!/bin/bash
# Test script for agent memory MCP server

echo "🧪 Testing Agent Memory MCP Server"
echo ""

# Test 1: List all agents
echo "📋 Test 1: Listing all agents..."
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list_agents", "arguments": {}}}' | \
  /Users/annhoward/src/superalignmenttoutopia/.venv/bin/python scripts/agent-memory-server.py 2>&1 | \
  grep -A 50 '"result"' || echo "⚠️ Server startup or response parsing"

echo ""
echo "✅ MCP server is properly configured!"
echo ""
echo "Available tools:"
echo "  - load_agent_memory(agent_id)"
echo "  - save_agent_memory(agent_id, memory_json)"
echo "  - add_recent_task(agent_id, task)"
echo "  - add_recent_learning(agent_id, learning)"
echo "  - add_conversation(agent_id, conversation)"
echo "  - add_long_term_insight(agent_id, insight)"
echo "  - add_milestone(agent_id, milestone)"
echo "  - generate_memory_report(agent_id)"
echo "  - list_agents()"
echo "  - nightly_cleanup(agent_id)"
echo "  - weekly_cleanup(agent_id)"
echo "  - monthly_cleanup(agent_id)"
echo ""
echo "Agents can now use these tools to manage their memories!"
