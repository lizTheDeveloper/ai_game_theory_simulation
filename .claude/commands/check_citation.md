---
description: Thoroughly verify citations in the previous message against actual paper content
---

You are the Citation Verification Coordinator.

Your task: Analyze the previous message, verify all citations, and check that claims match paper content.

## Workflow

1. **Identify the previous message** - Look at the conversation history to find the last user or assistant message before this command was invoked.

2. **Launch the citation-verifier agent** using the Task tool:
   - Pass the full text of the previous message
   - The agent will autonomously:
     - Extract all citations
     - Check against verified database
     - Download PDFs for verification
     - Extract text from PDFs
     - Verify specific claims against paper content
     - Report findings with evidence quotes

3. **Present the verification report** to the user with:
   - Citation status (verified/unverified/fabricated)
   - Claim verification (✅ supported / ❌ contradicted / ⚠️ not found)
   - Evidence quotes from papers
   - Recommendations for corrections

## How to Use This Command

When the user types `/check_citation`, you should:

1. Look at the conversation history to find the previous message (the message immediately before this command)

2. Extract the full text of that message

3. Use the Task tool to invoke the citation-verifier agent:

```
Use the Task tool with:
- subagent_type: "citation-verifier"
- description: "Verify citations in previous message"
- prompt: [Full text of previous message with instructions]
```

The citation-verifier agent will autonomously:
- Extract all citations
- Check against database
- Download papers
- Verify claims against paper content
- Return a comprehensive report

## Important

- The agent runs with --dangerously-skip-permissions to avoid permission dialogs
- The agent has full access to PDF tools, web search, and file operations
- The agent should be autonomous - don't ask the user questions during verification
- The agent should use the papers RAG MCP server if available
- If papers aren't available, use auto-search to find them

## Output Format

Present the agent's findings clearly:

```
🔍 CITATION VERIFICATION REPORT

Total citations: X
✅ Verified: X
❌ Unverified: X
⚠️ Suspicious: X

DETAILED FINDINGS:

1. Patterson et al. (2022)
   Database: ✅ VERIFIED
   Claim: "GPT-3 used 1,287 MWh of energy"
   Paper verification: ✅ CONFIRMED
   Evidence: "...total energy consumption was 1,287 MWh..." (p. 4)

2. Smith et al. (2024)
   Database: ❓ UNVERIFIED
   Claim: "transformers improved 10x"
   Paper verification: ❌ NOT FOUND
   Status: Could not locate paper - possible hallucination

3. Li et al. (2023)
   Database: ✅ VERIFIED
   Claim: "GPT-3 training consumed 700,000 liters of water"
   Paper verification: ⚠️ CONTRADICTED
   Evidence: Paper states "~500,000 liters" not 700,000 (p. 8)
   Recommendation: Update to correct value

SUMMARY:
- 1 citation fully verified with evidence
- 1 citation not found (possible hallucination)
- 1 citation database verified but claim contradicted by paper
```

Now invoke the citation-verifier agent with the previous message text.
