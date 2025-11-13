# Abstract Agent Team

**Reusable multi-agent orchestration toolkit extracted from Super Alignment to Utopia project.**

This directory contains project-agnostic tools for:
- Multi-agent coordination via Matrix/NATS
- Persistent agent memory (MCP-based)
- Code quality automation (git hooks, citation verification)
- Document processing (PDF, XLSX, DOCX, PPTX)
- Safety checks (dangerous command detection)

## Directory Structure

```
abstract_agent_team/
├── agents/                      # Agent definitions and memory system
│   ├── *.md                     # Agent personas and prompts
│   ├── memories/                # Agent memory files (JSON)
│   ├── mcp-configs/             # Per-agent MCP configurations
│   ├── AGENT_MEMORY_MCP_SETUP.md
│   └── characters/              # Agent character profiles
├── hooks/                       # Git hooks and safety checks
│   ├── citation-check.sh        # Verify citations against database
│   ├── check-dangerous-command.sh
│   ├── check-dangerous-command-llm.sh
│   └── git/                     # Git pre-commit/post-commit hooks
├── mcp-chatroom/                # Matrix MCP server for multi-agent chat
│   ├── src/                     # TypeScript source
│   ├── dist/                    # Compiled JavaScript
│   └── README.md
├── mcp_configs/                 # Main MCP configurations
│   └── mcp-config.json
├── scripts/                     # Utility scripts
│   ├── citationChecker.py       # SpaCy-based citation verification
│   ├── channel-monitor.ts       # Monitor agent channels
│   └── monitor_mc.sh            # Monte Carlo monitoring
├── skills/                      # Document processing skills
│   ├── pdf/                     # PDF reader/writer
│   ├── xlsx/                    # Excel handler
│   ├── docx/                    # Word handler
│   └── pptx/                    # PowerPoint handler
├── coordination_templates/      # Agent coordination documents
│   ├── handoff_*.md             # Handoff templates
│   ├── *_task.md                # Task templates
│   └── channel-monitoring-*.md
├── monitor-state/               # State monitoring system
│   └── *.hash                   # Channel state hashes
└── README.md                    # This file
```

## Core Components

### 1. Agent System

**Location:** `agents/`

**11+ specialized agents:**
- `orchestrator.md` - Coordinates multi-agent workflows
- `architect.md` - Roadmap maintenance, session cleanup
- `simulation-maintainer.md` - Code quality, defensive patterns
- `far-future-ux-designer.md` - UI/UX design
- `super-alignment-researcher.md` - Academic research
- `research-skeptic.md` - Critical validation
- `architecture-skeptic.md` - Performance review
- `wiki-documentation-updater.md` - Documentation sync
- `feature-implementer.md` - Implementation work
- `citation-verifier.md` - Source verification
- `llm-interface-optimizer.md` - Prompt engineering

**Agent Memory System:**
- MCP-based persistent memory
- JSON storage in `agents/memories/`
- Tools: `recall_context`, `add_recent_task`, `add_recent_learning`, `add_conversation`
- See `agents/AGENT_MEMORY_MCP_SETUP.md` for setup

### 2. Matrix/NATS Coordination

**Matrix MCP Server:** `mcp-chatroom/`
- Real-time messaging for multi-agent coordination
- 11 private rooms map to channels
- Per-agent bot accounts
- Tools: `matrix_post_message`, `matrix_get_notifications`, `chatroom_read_new`

**NATS Integration:**
- Server: `nats://34.185.163.86:4222` (Europe-West3, eco-friendly)
- Streams: STAGING_ERRORS, PRODUCTION_ERRORS, INVESTIGATIONS, TASKS, RESULTS
- Use for automated error investigation workflows
- See main project CLAUDE.md for NATS setup

### 3. Git Hooks

**Location:** `hooks/git/`

**pre-commit:**
- Validates emoji usage against registry
- Checks field references
- Blocks commits with validation errors

**post-commit:**
- Auto-spawns documentation updater agent
- Analyzes commit diffs
- Updates documentation automatically
- Loop prevention (skips if message contains "historian")

**Installation:**
```bash
# From your project root
cp abstract_agent_team/hooks/git/* .git/hooks/
chmod +x .git/hooks/*
```

### 4. Safety Checks

**Location:** `hooks/`

**Citation Verification:**
```bash
./hooks/citation-check.sh --text "Your text with citations here"
```
- Uses SpaCy NLP to extract citations
- Verifies against citation database
- Prevents hallucinated references

**Dangerous Command Detection:**
```bash
./hooks/check-dangerous-command.sh "rm -rf /"
```
- Pattern-based safety check
- LLM-based analysis (`check-dangerous-command-llm.sh`)
- Warns before destructive operations

### 5. Document Processing Skills

**Location:** `skills/`

Claude Code skills for:
- **PDF:** Read/write PDF files
- **XLSX:** Excel spreadsheet handling
- **DOCX:** Word document processing
- **PPTX:** PowerPoint presentation handling

Each skill has its own README with usage instructions.

### 6. Utility Scripts

**Location:** `scripts/`

**citationChecker.py:**
```bash
python scripts/citationChecker.py "Text with citations"
```
- SpaCy-based citation extraction
- Verifies against verified citation database
- Prevents hallucinations

**channel-monitor.ts:**
```bash
npx tsx scripts/channel-monitor.ts
```
- Monitor agent channels for activity
- Track message flow
- Coordination health checks

## Integration Guide

### Adding to a New Project

1. **Copy the directory:**
   ```bash
   cp -r abstract_agent_team /path/to/your/project/
   ```

2. **Install git hooks (optional):**
   ```bash
   cp abstract_agent_team/hooks/git/* .git/hooks/
   chmod +x .git/hooks/*
   ```

3. **Configure agents:**
   - Edit `agents/*.md` to customize agent prompts
   - Update `agents/mcp-configs/*.json` for your Matrix server
   - Initialize agent memories in `agents/memories/`

4. **Set up Matrix (optional):**
   ```bash
   cd abstract_agent_team/mcp-chatroom
   npm install
   npm run build
   ```
   - Configure Matrix homeserver in MCP config
   - Create bot accounts for agents
   - Update `mcp_configs/mcp-config.json`

5. **Install Python dependencies (for citation checking):**
   ```bash
   pip install spacy
   python -m spacy download en_core_web_sm
   ```

6. **Configure NATS (optional):**
   - Install NATS CLI: `curl -sf https://binaries.nats.dev/nats-io/natscli/nats@latest | sh`
   - Create context: `nats context save myproject --server=nats://your-server:4222`
   - See main CLAUDE.md for stream setup

### Using in Claude Code

**Spawn agents with Task tool:**
```typescript
Task({
  subagent_type: "orchestrator",
  description: "Implement feature X",
  prompt: "Full feature requirements here. Coordinate research → validation → implementation → review."
})
```

**Agent memory (in agent context):**
```typescript
// Recall agent context
mcp__agent-memory__recall_context({agent_id: "sylvia"})

// Save learning
mcp__agent-memory__add_recent_learning({
  agent_id: "sylvia",
  learning: "Pattern X causes bug Y in situation Z"
})
```

**Matrix coordination:**
```typescript
// Read new messages
mcp__chatroom__chatroom_read_new({channel: "coordination", agent: "orchestrator"})

// Post message
mcp__matrix__matrix_post_message({
  channel: "coordination",
  agent: "orchestrator",
  message: "Task completed"
})
```

## Customization

### Agent Personas

Edit `agents/*.md` to customize:
- Agent personality and communication style
- Domain expertise and knowledge
- Decision-making patterns
- Quality gates and validation rules

### Hook Behavior

Edit `hooks/git/pre-commit` to add:
- Custom validation rules
- Code style checks
- Security scans

Edit `hooks/git/post-commit` to change:
- Which agent spawns
- Documentation update logic
- Auto-commit behavior

### MCP Servers

Extend `mcp-chatroom/src/index.ts` to add:
- New tools for agents
- Custom integrations
- Additional coordination features

## Dependencies

**Required:**
- Node.js 18+ (for MCP servers, TypeScript tools)
- Python 3.8+ (for citation checker)
- Git (for hooks)

**Optional:**
- SpaCy + en_core_web_sm (citation verification)
- Matrix homeserver (multi-agent chat)
- NATS server (distributed orchestration)

## Source Project

Extracted from: [Super Alignment to Utopia](https://github.com/lizthedeveloper/superalignmenttoutopia)

**Original purpose:** Research simulation modeling AI super-alignment to sustainable flourishing futures.

**Tools built for:**
- Coordinating 11 specialized agents
- Research validation workflows (2+ peer-reviewed sources required)
- Multi-quality-gate development (research → validation → implementation → review)
- Defensive coding patterns (fail-loudly assertions, no silent fallbacks)
- Monte Carlo validation (deterministic simulation requirements)

**Adaptations needed:**
- Remove project-specific references (GameState, simulation phases)
- Generalize validation rules (emoji registry, field checking)
- Configure Matrix/NATS for your infrastructure

## License

[Add your license here]

## Contributing

To add tools back to the abstract collection:
1. Ensure no project-specific dependencies
2. Document usage clearly
3. Add to appropriate directory
4. Update this README
