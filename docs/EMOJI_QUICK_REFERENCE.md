# Emoji Quick Reference

**One-page cheat sheet for consistent emoji usage in simulation logs.**

Full documentation: [`EMOJI_SEMANTIC_MAP.md`](./EMOJI_SEMANTIC_MAP.md)

---

## Core Emojis (Use These!)

| Emoji | Category | Usage | Examples |
|-------|----------|-------|----------|
| ❌ | Error | Hard errors, crashes, failed assertions | `❌ Invalid state detected` |
| ⚠️ | Warning | Warnings, potential problems, threshold approaching | `⚠️ Threshold approaching 90%` |
| 🚨 | Critical Alert | Emergency situations, crisis declarations | `🚨 EMERGENCY AI PAUSE` |
| ✅ | Success | Successful operations, completions, passed checks | `✅ Batch complete` |
| 📊 | Data | Statistics, metrics display, analysis summaries | `📊 Outcome Distribution:` |
| 🔄 | Progress | In-progress operations, state transitions | `🔄 Economic Transition ongoing` |
| 💡 | Breakthrough | Research breakthroughs, innovations, discoveries | `💡 BREAKTHROUGH: Fusion power` |

---

## Domain-Specific Emojis

| Emoji | Domain | Usage |
|-------|--------|-------|
| ☢️ | Nuclear | Nuclear events, radiation, nuclear war |
| 🌍 | Environment | Climate, environmental systems, planetary boundaries |
| 🌡️ | Climate | Temperature/climate specifically |
| 🌊 | Ocean | Ocean/water events |
| 💧 | Water | Water resources/freshwater |
| 🦋 | Ecosystem | Biodiversity events |
| 🤖 | AI | AI agents, autonomous systems |
| 🧠 | Cognitive | Cognitive/intelligence/learning events |
| ⚡ | Compute | Energy/computational power |
| 🚀 | Deployment | Tech deployments, launches, major advances |
| 🏛️ | Governance | Government actions, political events |
| 🛡️ | Defense | Defensive systems, protection, safeguards |
| 🔬 | Research | Scientific research, experiments |
| 🔍 | Detection | Investigation, detection, analysis |
| 🧬 | Biology | Genetics, evolution, biology |
| 🤝 | Cooperation | Diplomacy, collective action, cooperation |
| 🎭 | Deception | Deception, manipulation, strategic behavior |
| 💔 | Trauma | Social breakdown, trauma, collapse |
| 📈 | Growth | Increasing trends |
| 📉 | Decline | Decreasing trends |

---

## Extinction-Only Emojis

| Emoji | Usage | Rule |
|-------|-------|------|
| ☠️ | Extinction | Use ONLY for extinction-level catastrophic events (grey goo, nuclear war, ecosystem collapse) |
| 💀 | Catastrophe | Use ONLY for catastrophic scenarios. For general errors, use ❌ |

---

## Deprecated Emojis (Replace These)

| ❌ Replace | ✅ With | Context |
|------------|---------|---------|
| 💀 | ❌ | General errors (keep 💀 only for extinction) |
| 🔥 | ❌ | General errors |
| 🎯 | ✅ | General success (keep 🎯 only for targeting/precision contexts) |
| 🌟 | ✅ | General success |
| ✨ | ✅ | General success |
| 🏆 | ✅ | General success |

---

## Combining Emojis

**Pattern**: `[DOMAIN][EVENT_TYPE] [MESSAGE]`

Examples:
- `🌍💡 BREAKTHROUGH: Carbon capture` (domain + breakthrough)
- `🧠💡 BREAKTHROUGH: AI alignment solved` (domain + breakthrough)
- `☢️💥 NUCLEAR DETONATION: ${nation}` (domain + severity)

**Rule**: Max 2 emojis. First = domain/context, second = event type.

---

## Decision Tree

```
Is it an error/failure?
├─ Yes: Is it an extinction-level event?
│  ├─ Yes: ☠️ or 💀
│  └─ No: ❌
└─ No: Is it a success?
   ├─ Yes: Is it a precision targeting/detection breakthrough?
   │  ├─ Yes: 🎯
   │  └─ No: ✅
   └─ No: Is it a warning?
      ├─ Yes: Is it an emergency requiring immediate action?
      │  ├─ Yes: 🚨
      │  └─ No: ⚠️
      └─ No: Check domain-specific emojis above
```

---

## Common Patterns

### Error Messages
```typescript
// ✅ CORRECT
console.log(`❌ State validation failed: ${reason}`);
console.log(`❌ Calculation resulted in NaN`);
console.log(`☠️ GREY GOO EXTINCTION TRIGGERED`); // Extinction only

// ❌ WRONG
console.log(`💀 State validation failed: ${reason}`); // Use ❌
console.log(`🔥 Calculation failed`); // Use ❌
```

### Success Messages
```typescript
// ✅ CORRECT
console.log(`✅ Technology deployed successfully`);
console.log(`✅ Simulation batch complete`);
console.log(`🎯 BREAKTHROUGH: Sandbagging detection enabled`); // Targeting

// ❌ WRONG
console.log(`🌟 Technology deployed`); // Use ✅
console.log(`✨ Batch complete`); // Use ✅
```

### Warnings vs Alerts
```typescript
// ✅ CORRECT
console.log(`⚠️ Population declining (trend warning)`);
console.log(`⚠️ Climate threshold approaching`);
console.log(`🚨 EMERGENCY AI DEVELOPMENT PAUSE`); // Emergency

// ❌ WRONG
console.log(`🚨 Population declining`); // Use ⚠️ (not emergency)
console.log(`⚠️ EMERGENCY PAUSE`); // Use 🚨 (is emergency)
```

### Breakthroughs
```typescript
// ✅ CORRECT
console.log(`💡 BREAKTHROUGH: ${tech.name}`);
console.log(`🌍💡 BREAKTHROUGH: Carbon capture`); // Domain + breakthrough
console.log(`🧠💡 BREAKTHROUGH: AI alignment solved`); // Domain + breakthrough

// ❌ WRONG
console.log(`🚀 BREAKTHROUGH: ${tech.name}`); // Use 💡 (🚀 = deployment)
console.log(`✨ BREAKTHROUGH: ${tech.name}`); // Use 💡
```

---

## Validation Commands

Check consistency:

```bash
# Find errors using deprecated emojis (should be empty after Phase 5)
grep -r "💀" src/ --include="*.ts" | grep -v "extinction" | grep -v "BOTTLENECK"
grep -r "🔥" src/ --include="*.ts"

# Find success using deprecated emojis (should be empty after Phase 5)
grep -r "🌟\|✨\|🏆" src/ --include="*.ts"

# Find alerts that should be warnings
grep -r "🚨" src/ --include="*.ts" | grep -v "EMERGENCY" | grep -v "CRITICAL"

# Find warnings that should be alerts
grep -r "⚠️" src/ --include="*.ts" | grep "EMERGENCY\|CRITICAL"
```

---

## Why This Matters

1. **Cognitive Load**: Consistent emojis = instant recognition in logs
2. **Grep Efficiency**: Find all errors with `grep "❌"` (not scattered across 💀🔥❌)
3. **Visual Scanning**: Color/shape coding faster than reading `[ERROR]`
4. **Token Efficiency**: Emojis are 1-4 bytes vs `[WARNING]` (8 bytes)
5. **Log Aggregation**: Monte Carlo analysis can reliably count event types

**Estimated ROI**: ~20% faster log scanning + 30% easier debugging after consolidation
