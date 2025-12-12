#!/bin/bash
npx -y @anthropic-ai/claude-code@latest task \
  --agent simulation-maintainer \
  --description "Implement supply chain cascades system with defensive coding" \
  --prompt "Implement supply chain cascade propagation system per handoff document at /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/HANDOFF_supply_chain_cascades_implementation.md. Research validated (Quality Gate 1 PASSED). Use defensive coding: required RNG, assertion utilities, fail loudly on errors, pictographic event language. Create supplyChainCascades.ts, update GameState, register phase, write tests. Conservative parameters from Sylvia's critique." \
  > /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/roy_implementation_$(date +%Y%m%d_%H%M%S).log 2>&1
