# Emoji Inventory

**Complete list of all emojis used in the simulation codebase**

Last updated: October 28, 2025
Total unique emojis: ~50 semantic emojis (excluding digits, symbols, modifiers)

---

## Canonical Emojis (Actively Maintained)

These emojis follow the semantic mapping standards from `docs/EMOJI_SEMANTIC_MAP.md`.

### Core Status Emojis

| Emoji | Uses | Category | Purpose |
|-------|------|----------|---------|
| ❌ | 359 | Error | Hard errors, crashes, invalid state, failed operations |
| ⚠️ | 171 | Warning | Potential problems, threshold approaching, unstable state |
| 🚨 | 58 | Critical Alert | Emergency situations, crisis declarations, immediate action required |
| ✅ | 80 | Success | Successful operations, completions, passed checks |

### Data & Progress

| Emoji | Uses | Category | Purpose |
|-------|------|----------|---------|
| 📊 | 33 | Data | Statistics, metrics display, analysis summaries |
| 📈 | 7 | Growth Trend | Increasing trends, positive trajectory |
| 📉 | 9 | Decline Trend | Decreasing trends, negative trajectory |
| 🔄 | 9 | Progress | In-progress operations, state transitions |
| ⏰ | 7 | Timing | Time-based events, delays, timing constraints |

### Breakthrough & Innovation

| Emoji | Uses | Category | Purpose |
|-------|------|----------|---------|
| 💡 | 9 | Breakthrough | Research breakthroughs, innovations, discoveries |
| 🔬 | 20 | Research | Scientific research, experiments |
| 🔍 | 15 | Detection | Investigation, detection, analysis |

### Domain-Specific Emojis

#### Nuclear & Radiation
| Emoji | Uses | Purpose |
|-------|------|---------|
| ☢️ | 13 | Nuclear events, radiation, nuclear war |
| 💥 | 13 | Explosions, termination shock, system collapses |
| ☠️ | 19 | Extinction-level catastrophic events (RESERVED) |
| 💀 | 14 | Death/mortality (legacy - being phased out for non-extinction) |

#### Climate & Environment
| Emoji | Uses | Purpose |
|-------|------|---------|
| 🌍 | 12 | Planetary, environmental systems, global context |
| 🌡️ | 8 | Temperature/climate specifically |
| 🌊 | 3 | Ocean/water events |
| 💧 | 5 | Water resources/freshwater |
| 🦋 | 10 | Ecosystem/biodiversity events |
| 🪸 | 7 | Coral reefs specifically |

#### AI & Technology
| Emoji | Uses | Purpose |
|-------|------|---------|
| 🤖 | 10 | AI agents, autonomous systems |
| 🧠 | 8 | Cognitive/intelligence/learning events |
| ⚡ | 15 | Energy/computational power |
| 🚀 | 15 | Deployment/launches/major advances |

#### Governance & Defense
| Emoji | Uses | Purpose |
|-------|------|---------|
| 🏛️ | 18 | Government actions, political events |
| 🛡️ | 24 | Defensive systems, protection, safeguards |
| 🔒 | 8 | Locked/secured/controlled systems |
| 🛑 | 6 | Stopped/halted actions |

#### Social & Political
| Emoji | Uses | Purpose |
|-------|------|---------|
| 🤝 | 13 | Cooperation, diplomacy, collective action |
| 🎭 | 7 | Deception, manipulation, strategic behavior |
| 💔 | 7 | Social breakdown, trauma, collapse |
| 👥 | 4 | Groups/populations |

#### Biology & Science
| Emoji | Uses | Purpose |
|-------|------|---------|
| 🧬 | 6 | Genetics, evolution, biology |
| 🦠 | 4 | Pathogens, disease, biotech |
| 🧪 | 2 | Chemical/experimental |

#### Evidence Quality Indicators
| Emoji | Uses | Purpose |
|-------|------|---------|
| 🟢 | 9 | Strong/high-quality evidence |
| 🟡 | 15 | Moderate-quality evidence |
| 🔴 | 9 | Weak/low-quality evidence or critical status |

---

## Deprecated/Legacy Emojis

These emojis are being phased out per the semantic mapping consolidation (Oct 2025):

| Emoji | Legacy Uses | Replaced By | Status |
|-------|-------------|-------------|--------|
| 🔥 | 2 (fire/crisis) | 🚨 (for crises) | ✅ Replaced |
| 🌟 | 5 (success) | ✅ | ✅ Replaced |
| ✨ | 5 (success) | ✅ | ✅ Replaced |
| 🏆 | 1 (success) | ✅ | ✅ Replaced |

---

## Special-Purpose Emojis

These emojis have narrow, specific usage contexts:

| Emoji | Uses | Purpose | Context Rule |
|-------|------|---------|--------------|
| 🎯 | 7 | Targeting/Precision | Use ONLY for detection/targeting breakthroughs or precision achievements |
| 🕵️ | 6 | Investigation | Use for sleeper detection, investigation activities |
| ↔️ | 12 | Correlation | Use for showing bidirectional relationships, correlations |

---

## Rare/Single-Purpose Emojis

Emojis with <5 uses (special cases):

| Emoji | Uses | Purpose |
|-------|------|---------|
| 🌊 | 3 | Ocean events |
| 💧 | 5 | Water/freshwater |
| 👥 | 4 | Groups |
| 🦠 | 4 | Pathogens |
| 🧪 | 2 | Chemical |
| 🌱 | 2 | Nature/growth |
| 🌾 | 3 | Agriculture |
| 🍃 | (few) | Nature |

---

## UI/Display Emojis

Emojis used in Next.js frontend components (not simulation logic):

| Emoji | Context | Purpose |
|-------|---------|---------|
| ▶️ | Test UI | Simulation start indicator |
| ℹ️ | Dashboard | Information indicator |
| 📢 | UI | Communication/announcements |

---

## Guidelines for Adding New Emojis

**Before adding a new emoji:**

1. **Check if existing emoji covers the concept**
   - Review canonical emoji list above
   - Check `docs/EMOJI_QUICK_REFERENCE.md`

2. **Ensure semantic necessity**
   - Does this concept need visual distinction?
   - Is it used frequently enough (>3 uses expected)?

3. **Document the addition**
   - Add to `docs/EMOJI_SEMANTIC_MAP.md`
   - Update this inventory
   - Update `CLAUDE.md` if it's a core emoji

4. **Validate consistency**
   - Run `npx tsx scripts/validateEmojiConsistency.ts`
   - Ensure no conflicts with existing emojis

---

## Emoji Usage Statistics

**Current state (Oct 28, 2025):**
- **Total unique emojis**: ~50 semantic (excluding digits, symbols)
- **Most used**: ❌ (359), ⚠️ (171), ✅ (80), 🚨 (58)
- **Canonical compliance**: ~95% (37 non-canonical uses remaining, mostly judgment calls)
- **Deprecated emojis removed**: 17 instances (100% cleanup complete)

**Token efficiency:**
- Average emoji: 1-4 bytes
- vs. text labels: `[ERROR]` = 8 bytes, `[WARNING]` = 10 bytes
- **Savings**: ~40-60% reduction in log message size

---

## See Also

- **[Emoji Semantic Map](../EMOJI_SEMANTIC_MAP.md)** - Complete specification with examples
- **[Emoji Quick Reference](../EMOJI_QUICK_REFERENCE.md)** - One-page cheat sheet
- **[CLAUDE.md](../../CLAUDE.md)** - Project conventions including emoji usage
- **Validation tool**: `scripts/validateEmojiConsistency.ts`
- **Analysis tool**: `scripts/analyzeEmojiUsage.ts`
