#!/usr/bin/env python3
"""
Agent Memory MCP Server

Provides hierarchical memory management for autonomous agents.
Each agent has distinct memory layers: recent, medium-term, long-term, core, and compost.

Memory Structure:
- Recent: 24h memory, cleared nightly (tasks, learnings, conversations)
- Medium-term: 7 days, cleared weekly (patterns, insights)
- Long-term: Permanent (major insights, milestones)
- Core: PERSONALITY-SHAPING MOMENTS (defining realizations, behavior changes)
  * Always retrieved by default
  * Write sparingly - only truly formative experiences
  * Example: "From that day forward, I always verify research before implementation"
- Compost: Failed ideas that might be fertile ground later

Uses fastMCP with stdio transport for Claude integration.
"""

import json
import sys
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime
from fastmcp import FastMCP

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
MEMORY_DIR = PROJECT_ROOT / ".claude" / "agents" / "memories"
AUDIT_LOG = MEMORY_DIR / "audit.log"

# Agent memory file mapping
AGENT_MEMORY_FILES = {
    'cynthia': 'cynthia-memory.json',
    'sylvia': 'sylvia-memory.json',
    'operator': 'operator-memory.json',
    'tessa': 'tessa-memory.json',
    'historian': 'historian-memory.json',
    'planner': 'planner-memory.json',
    'ray': 'ray-memory.json',
    'moss': 'moss-memory.json',
    'roy': 'roy-memory.json',
}

# Create fastMCP server
mcp = FastMCP("Agent Memory System")


def audit(agent_id: str, action: str, details: str = "") -> None:
    """Log all memory operations for debugging and accountability."""
    timestamp = datetime.now().isoformat()
    entry = f"{timestamp} | {agent_id} | {action} | {details}\n"

    AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(AUDIT_LOG, 'a', encoding='utf-8') as f:
        f.write(entry)


def load_memory(agent_id: str) -> Dict[str, Any]:
    """Load agent memory from disk."""
    filename = AGENT_MEMORY_FILES.get(agent_id)
    if not filename:
        raise ValueError(f"Unknown agent ID: {agent_id}")

    filepath = MEMORY_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Memory file not found: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_memory(agent_id: str, memory: Dict[str, Any]) -> None:
    """Save agent memory to disk."""
    filename = AGENT_MEMORY_FILES.get(agent_id)
    if not filename:
        raise ValueError(f"Unknown agent ID: {agent_id}")

    # Update lastActive timestamp
    memory['lastActive'] = datetime.now().isoformat()

    filepath = MEMORY_DIR / filename
    filepath.parent.mkdir(parents=True, exist_ok=True)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(memory, f, indent=2, ensure_ascii=False)


def add_to_recent(memory: Dict[str, Any], field: str, content: str) -> Dict[str, Any]:
    """Add content to a recent memory field (tasks, learnings, conversations)."""
    if field not in ['tasks', 'learnings', 'conversations']:
        raise ValueError(f"Invalid recent memory field: {field}")

    memory['recent'][field].append(content)
    memory['recent']['lastUpdated'] = datetime.now().isoformat()
    return memory


# Define MCP tools
@mcp.tool()
def recall_context(agent_id: str) -> str:
    """
    Recall your recent context (what you should use on spawn).
    Returns a concise summary of what you've been working on.

    Args:
        agent_id: Your agent identifier (e.g., 'roy', 'cynthia')

    Returns:
        Formatted summary of recent tasks, learnings, and key memories
    """
    try:
        audit(agent_id, 'recall')
        memory = load_memory(agent_id)

        # Build concise context summary
        lines = [
            f"🧠 Memory Recall: {memory['agentName']}",
            f"Role: {memory['role']}",
            ""
        ]

        # CORE MEMORIES (ALWAYS SHOWN - personality-defining moments)
        lines.append("🌟 CORE IDENTITY (personality-shaping memories):")
        core = memory.get('coreMemory', {})

        if 'personality' in core:
            lines.append(f"  • Personality: {core['personality']}")
        if 'motto' in core:
            lines.append(f"  • Motto: \"{core['motto']}\"")
        if 'bias' in core:
            lines.append(f"  • Bias: {core['bias']}")
        if 'specialty' in core:
            lines.append(f"  • Specialty: {core['specialty']}")
        if 'workingDynamic' in core:
            lines.append(f"  • Dynamic: {core['workingDynamic']}")

        # Add any custom core memory items (behavior-changing moments)
        for key, value in core.items():
            if key not in ['personality', 'role', 'motto', 'bias', 'specialty',
                          'workingDynamic', 'voice', 'communicationStyle', 'relationships']:
                # These are special formative moments
                lines.append(f"  • [{key}]: {value}")

        lines.append("")

        # Recent tasks (last 5)
        if memory['recent']['tasks']:
            lines.append("📋 Recent tasks:")
            for task in memory['recent']['tasks'][-5:]:
                lines.append(f"  • {task}")
            lines.append("")

        # Recent learnings (last 5)
        if memory['recent']['learnings']:
            lines.append("💡 Recent learnings:")
            for learning in memory['recent']['learnings'][-5:]:
                lines.append(f"  • {learning}")
            lines.append("")

        # Long-term insights (last 3)
        if memory['longTerm']['majorInsights']:
            lines.append("🎯 Key insights:")
            for insight in memory['longTerm']['majorInsights'][-3:]:
                lines.append(f"  • {insight}")
            lines.append("")

        return "\n".join(lines)

    except Exception as e:
        return f"Error recalling memory: {str(e)}"


@mcp.tool()
def load_agent_memory(agent_id: str) -> str:
    """
    Load complete raw memory structure (rarely needed - use recall_context instead).

    Args:
        agent_id: Agent identifier (e.g., 'roy', 'cynthia')

    Returns:
        JSON string with agent's complete memory hierarchy
    """
    try:
        audit(agent_id, 'load')
        memory = load_memory(agent_id)
        return json.dumps(memory, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def save_agent_memory(agent_id: str, memory_json: str) -> str:
    """
    Save complete memory for an agent.

    Args:
        agent_id: Agent identifier
        memory_json: Complete memory structure as JSON string

    Returns:
        Success/error message
    """
    try:
        memory = json.loads(memory_json)
        save_memory(agent_id, memory)
        audit(agent_id, 'save', 'Full memory saved')
        return json.dumps({"success": True, "message": "Memory saved successfully"})
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def add_recent_task(agent_id: str, task: str) -> str:
    """
    Add a task to agent's recent memory.

    Args:
        agent_id: Agent identifier
        task: Task description to add

    Returns:
        Success/error message with updated recent memory
    """
    try:
        memory = load_memory(agent_id)
        memory = add_to_recent(memory, 'tasks', task)
        save_memory(agent_id, memory)
        audit(agent_id, 'add_task', task[:50] + '...' if len(task) > 50 else task)
        return json.dumps({
            "success": True,
            "recent": memory['recent']
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def add_recent_learning(agent_id: str, learning: str) -> str:
    """
    Add a learning to agent's recent memory.

    Args:
        agent_id: Agent identifier
        learning: Learning/insight to add

    Returns:
        Success/error message with updated recent memory
    """
    try:
        memory = load_memory(agent_id)
        memory = add_to_recent(memory, 'learnings', learning)
        save_memory(agent_id, memory)
        audit(agent_id, 'add_learning', learning[:50] + '...' if len(learning) > 50 else learning)
        return json.dumps({
            "success": True,
            "recent": memory['recent']
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def add_conversation(agent_id: str, conversation: str) -> str:
    """
    Add a conversation summary to agent's recent memory.

    Args:
        agent_id: Agent identifier
        conversation: Conversation summary to add

    Returns:
        Success/error message with updated recent memory
    """
    try:
        memory = load_memory(agent_id)
        memory = add_to_recent(memory, 'conversations', conversation)
        save_memory(agent_id, memory)
        audit(agent_id, 'add_conversation', conversation[:50] + '...' if len(conversation) > 50 else conversation)
        return json.dumps({
            "success": True,
            "recent": memory['recent']
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def add_long_term_insight(agent_id: str, insight: str) -> str:
    """
    Add a major insight to agent's long-term memory.

    Args:
        agent_id: Agent identifier
        insight: Major insight to preserve permanently

    Returns:
        Success/error message with updated long-term memory
    """
    try:
        memory = load_memory(agent_id)

        # Don't add duplicates
        if insight not in memory['longTerm']['majorInsights']:
            memory['longTerm']['majorInsights'].append(insight)
            save_memory(agent_id, memory)
            audit(agent_id, 'add_insight', insight[:50] + '...' if len(insight) > 50 else insight)

        return json.dumps({
            "success": True,
            "longTerm": memory['longTerm']
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def add_milestone(agent_id: str, milestone: str) -> str:
    """
    Add a project milestone to agent's long-term memory.

    Args:
        agent_id: Agent identifier
        milestone: Milestone description to preserve

    Returns:
        Success/error message with updated long-term memory
    """
    try:
        memory = load_memory(agent_id)

        # Add timestamp to milestone if not present
        if not milestone.startswith('20'):
            milestone = f"{datetime.now().strftime('%Y-%m-%d')}: {milestone}"

        memory['longTerm']['projectMilestones'].append(milestone)
        save_memory(agent_id, memory)
        audit(agent_id, 'add_milestone', milestone[:50] + '...' if len(milestone) > 50 else milestone)

        return json.dumps({
            "success": True,
            "longTerm": memory['longTerm']
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def add_core_memory(agent_id: str, key: str, value: str) -> str:
    """
    Add a PERSONALITY-SHAPING MOMENT to core memory.

    ⚠️ WARNING: Use EXTREMELY sparingly! Core memories define WHO YOU ARE.

    Core memories are for FORMATIVE, BEHAVIOR-CHANGING experiences:
    ✅ GOOD: "From that day forward, I always verify research before implementation"
    ✅ GOOD: "After the fabrication incident, I learned to question round numbers"
    ✅ GOOD: "I discovered I work best by challenging Cynthia's optimism constructively"

    ❌ BAD: Project details, task outcomes, temporary insights
    ❌ BAD: "Completed citation audit" (use long-term memory instead)
    ❌ BAD: "Found paper X useful" (use recent learnings instead)

    Core memories are ALWAYS shown on recall. They shape your personality forever.
    Write them as defining moments that changed how you approach your work.

    ⚠️ LIMIT: Maximum 3 sentences. Be concise - this is personality-defining, not documentation.

    Args:
        agent_id: Agent identifier
        key: Short identifier for this formative moment (e.g., "research_verification_principle")
        value: The personality-shaping realization or behavior change (max 3 sentences)

    Returns:
        Success/error message with updated core memory
    """
    try:
        # Enforce 3-sentence limit
        sentence_count = value.count('.') + value.count('!') + value.count('?')
        if sentence_count > 3:
            return json.dumps({
                "error": f"Core memory too long ({sentence_count} sentences). Maximum 3 sentences. Core memories must be concise personality-defining moments."
            })

        memory = load_memory(agent_id)
        memory['coreMemory'][key] = value
        save_memory(agent_id, memory)
        audit(agent_id, 'add_core_memory', f"{key}: {value[:50]}..." if len(value) > 50 else f"{key}: {value}")
        return json.dumps({
            "success": True,
            "message": f"⚠️ Core memory added: {key}",
            "coreMemory": memory['coreMemory']
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def generate_memory_report(agent_id: str) -> str:
    """
    Generate a formatted memory report for an agent.

    Args:
        agent_id: Agent identifier

    Returns:
        Markdown-formatted memory report
    """
    try:
        memory = load_memory(agent_id)
        audit(agent_id, 'report')

        report = f"""# Memory Report: {memory['agentName']}

**Role:** {memory['role']}
**Voice:** {memory['voice']}
**Last Active:** {memory['lastActive']}

## Core Memory
**Personality:** {memory['coreMemory'].get('personality', 'N/A')}
**Motto:** "{memory['coreMemory'].get('motto', 'N/A')}"

## Recent Activity ({len(memory['recent']['tasks'])} tasks)
"""

        for task in memory['recent']['tasks']:
            report += f"- {task}\n"

        report += f"\n## Medium-Term Insights ({len(memory['mediumTerm']['insights'])})\n"
        for insight in memory['mediumTerm']['insights']:
            report += f"- {insight}\n"

        report += f"\n## Long-Term Memory\n"
        report += f"**Major Insights:** {len(memory['longTerm']['majorInsights'])}\n"
        report += f"**Project Milestones:** {len(memory['longTerm']['projectMilestones'])}\n"

        compost = memory.get('compost', {})
        discarded = compost.get('discardedIdeas', [])
        failed = compost.get('failedApproaches', [])
        report += f"\n## Compost\n"
        report += f"**Discarded Ideas:** {len(discarded)}\n"
        report += f"**Failed Approaches:** {len(failed)}\n"

        return report

    except Exception as e:
        return f"Error generating report: {str(e)}"


@mcp.tool()
def list_agents() -> str:
    """
    List all agents with memory files and their basic info.

    Returns:
        JSON with all agents and their core info
    """
    try:
        agents = []

        for agent_id in AGENT_MEMORY_FILES.keys():
            try:
                memory = load_memory(agent_id)
                agents.append({
                    'agentId': agent_id,
                    'agentName': memory['agentName'],
                    'role': memory['role'],
                    'voice': memory['voice'],
                    'lastActive': memory['lastActive'],
                    'recentTaskCount': len(memory['recent']['tasks']),
                    'longTermInsights': len(memory['longTerm']['majorInsights']),
                    'milestones': len(memory['longTerm']['projectMilestones'])
                })
            except Exception as e:
                print(f"⚠️ Failed to load {agent_id}: {e}", file=sys.stderr)

        return json.dumps(agents, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def nightly_cleanup(agent_id: str) -> str:
    """
    Run nightly cleanup: Move recent → medium-term, clear recent memory.

    Args:
        agent_id: Agent identifier

    Returns:
        Success message with cleanup summary
    """
    try:
        memory = load_memory(agent_id)

        # Move learnings to medium-term insights
        if memory['recent']['learnings']:
            memory['mediumTerm']['insights'].extend(memory['recent']['learnings'])

        # Clear recent memory
        cleared = {
            'tasks': len(memory['recent']['tasks']),
            'learnings': len(memory['recent']['learnings']),
            'conversations': len(memory['recent']['conversations'])
        }

        memory['recent']['tasks'] = []
        memory['recent']['learnings'] = []
        memory['recent']['conversations'] = []
        memory['recent']['lastUpdated'] = datetime.now().isoformat()

        save_memory(agent_id, memory)
        audit(agent_id, 'nightly_cleanup', f"Cleared {cleared['tasks']} tasks, {cleared['learnings']} learnings")

        return json.dumps({
            "success": True,
            "message": f"Nightly cleanup complete for {memory['agentName']}",
            "cleared": cleared
        }, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def weekly_cleanup(agent_id: str) -> str:
    """
    Run weekly cleanup: Promote top medium-term insights → long-term, rest → compost.

    Args:
        agent_id: Agent identifier

    Returns:
        Success message with cleanup summary
    """
    try:
        memory = load_memory(agent_id)

        insights = memory['mediumTerm']['insights']

        # Promote top 3 insights to long-term
        promoted = insights[:3] if len(insights) >= 3 else insights
        memory['longTerm']['majorInsights'].extend(promoted)

        # Rest go to compost
        composted = insights[3:] if len(insights) > 3 else []
        if composted:
            if 'discardedIdeas' not in memory['compost']:
                memory['compost']['discardedIdeas'] = []
            memory['compost']['discardedIdeas'].extend(composted)

        # Clear medium-term
        memory['mediumTerm']['patterns'] = []
        memory['mediumTerm']['insights'] = []
        memory['mediumTerm']['lastCleared'] = datetime.now().isoformat()

        save_memory(agent_id, memory)
        audit(agent_id, 'weekly_cleanup', f"Promoted {len(promoted)} insights, composted {len(composted)}")

        return json.dumps({
            "success": True,
            "message": f"Weekly cleanup complete for {memory['agentName']}",
            "promoted": len(promoted),
            "composted": len(composted)
        }, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def monthly_cleanup(agent_id: str) -> str:
    """
    Run monthly cleanup: Clear compost (but preserve in audit log).

    Args:
        agent_id: Agent identifier

    Returns:
        Success message with cleanup summary
    """
    try:
        memory = load_memory(agent_id)

        compost = memory.get('compost', {})
        cleared = {
            'discardedIdeas': len(compost.get('discardedIdeas', [])),
            'failedApproaches': len(compost.get('failedApproaches', []))
        }

        # Clear compost
        memory['compost']['discardedIdeas'] = []
        memory['compost']['failedApproaches'] = []
        memory['compost']['lastCleared'] = datetime.now().isoformat()

        save_memory(agent_id, memory)
        audit(agent_id, 'monthly_cleanup', f"Cleared {cleared['discardedIdeas']} ideas, {cleared['failedApproaches']} approaches")

        return json.dumps({
            "success": True,
            "message": f"Monthly cleanup complete for {memory['agentName']}",
            "cleared": cleared
        }, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    print("🧠 Starting Agent Memory MCP Server (fastMCP + stdio)", file=sys.stderr)
    print(f"📁 Memory directory: {MEMORY_DIR}", file=sys.stderr)
    print(f"📋 Audit log: {AUDIT_LOG}", file=sys.stderr)
    print(f"👥 Agents: {len(AGENT_MEMORY_FILES)}", file=sys.stderr)

    # Run server with stdio transport
    mcp.run(transport="stdio")
