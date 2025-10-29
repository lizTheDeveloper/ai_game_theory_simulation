#!/bin/bash

# Script to inject personality profiles into agent definition files
# Each agent gets their character identity inserted after the frontmatter

echo "Injecting personality profiles into agent files..."

# The personality profiles are in:
# .claude/agents/characters/AGENT_PROFILES.md

# But we'll inject condensed versions directly into each agent file

echo "✅ Cynthia (super-alignment-researcher) - Already updated"

echo "📝 Next: Update remaining 8 agents with their personalities"
echo "   - Sylvia (research-skeptic)"
echo "   - Far Future UX (far-future-ux-designer)"
echo "   - Historian (wiki-documentation-updater)"
echo "   - Planner (project-plan-manager)"
echo "   - Ray (sci-fi-tech-visionary)"
echo "   - Moss (feature-implementer)"
echo "   - Roy (simulation-maintainer)"
echo "   - Orchestrator (orchestrator)"

echo ""
echo "See: .claude/agents/characters/AGENT_PROFILES.md for complete personalities"
