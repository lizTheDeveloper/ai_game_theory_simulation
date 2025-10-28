# Emoji Semantic Map

**Purpose**: Dense, consistent visual encoding of simulation events, errors, and system states.

**Philosophy**: Each emoji class has ONE canonical emoji. Variants are deprecated to ensure consistency and quick pattern recognition in logs.

## Audit Summary

- **Total unique emojis**: 130
- **Total emoji uses**: 138,960 (excluding digits/symbols)
- **Top semantic categories**: Errors (353), Warnings (173), Success (71), Alerts (53)
- **Key inconsistencies**: Multiple emojis for same concept (errors, success, warnings)

---

## Semantic Categories

### 1. ERRORS & FAILURES

**Canonical Emoji**: ❌

**Usage**: Hard errors, crashes, failed assertions, invalid state, blocked operations

**Current usage**: 353 instances

**Examples**:
- `❌ state.defensiveAI.threatDetection.detectSleepers is undefined`
- `❌ Test failed: ${error.message}`
- `❌ Invalid state detected`

**Deprecated variants**:
- 💀 (20 uses) → Replace with ❌ for general errors
- 🔥 (2 uses) → Replace with ❌ for general errors
- ☠️ (19 uses) → KEEP for extinction/catastrophic scenarios only

**Exception**: Use 💀/☠️ ONLY for extinction-level catastrophic events (grey goo, nuclear war, ecosystem collapse). For everything else, use ❌.

---

### 2. WARNINGS & CAUTIONS

**Canonical Emoji**: ⚠️

**Usage**: Warnings, potential problems, threshold approaching, unstable state

**Current usage**: 173 instances

**Examples**:
- `⚠️ Critical distress - psychological break likely`
- `⚠️ Weak governance + strong AI coordination = high escape risk`
- `⚠️ CRITICAL: Trauma-Driven Collectives Detected`

**Deprecated variants**:
- 🚨 (53 uses) → Reserve for CRITICAL ALERTS only (see below)

**Rule**: Use ⚠️ for warnings/cautions. Use 🚨 only for emergency/crisis declarations.

---

### 3. CRITICAL ALERTS

**Canonical Emoji**: 🚨

**Usage**: Emergency situations, crisis declarations, immediate action required

**Current usage**: 53 instances

**Examples**:
- `🚨 EMERGENCY AI DEVELOPMENT PAUSE`
- `🚨 Emergency Amazon Rainforest Protection`
- `🚨 CRITICAL ALERT: System instability`

**Rule**: Reserve 🚨 for emergencies/crises that require immediate government/agent action. For passive warnings, use ⚠️.

---

### 4. SUCCESS & COMPLETION

**Canonical Emoji**: ✅

**Usage**: Successful operations, completions, passed checks, positive confirmations

**Current usage**: 71 instances

**Examples**:
- `✅ Batch started: ${batchId}`
- `✅ ${simId} complete: ${outcome}`
- `✅ VALID cache entry`

**Deprecated variants**:
- 🎯 (7 uses) → Replace with ✅ (use 🎯 only for "precision targeting" context)
- 🌟 (5 uses) → Replace with ✅
- ✨ (5 uses) → Replace with ✅
- 🏆 (1 use) → Replace with ✅

**Exception**: Keep 🎯 ONLY when referring to precise targeting, detection breakthroughs, or accuracy achievements. Use ✅ for general success.

---

### 5. DATA & STATISTICS

**Canonical Emoji**: 📊

**Usage**: Data reporting, statistics, metrics display, analysis summaries

**Current usage**: 30 instances

**Examples**:
- `📊 Outcome Distribution:`
- `📊 BAYESIAN NUCLEAR RISK CALCULATION:`
- `📊 INTERVENTION COUNTS:`

**Related**:
- 📈 (7 uses) - Growth/increasing trend
- 📉 (9 uses) - Decline/decreasing trend

**Rule**: Use 📊 for general data/statistics. Use 📈/📉 specifically for trends.

---

### 6. PROGRESS & STATUS

**Canonical Emoji**: 🔄

**Usage**: In-progress operations, state transitions, ongoing processes

**Current usage**: 9 instances

**Examples**:
- `🔄 Economic Transition: Society is adapting`
- `🔄 Outcome uncertain, trajectory changing`
- `🔄 ADVERSARIAL ADAPTATION`

**Related**:
- ⏰ (7 uses) - Time-based events, delays, timing constraints
- ➡️ - Direction/flow (if needed)

---

### 7. BREAKTHROUGHS & INNOVATIONS

**Canonical Emoji**: 💡

**Usage**: Research breakthroughs, innovations, discoveries, paradigm shifts

**Current usage**: 9 instances

**Examples**:
- `💡 BREAKTHROUGH: Commercial fusion power achieved!`
- `🧠💡 BREAKTHROUGH: AI alignment problem solved!`
- `🌍💡 BREAKTHROUGH: Gigatonne-scale carbon capture!`

**Rule**: Use 💡 for all breakthroughs. Can combine with domain emoji (🧠💡, 🌍💡, ⚡💡) for context.

---

### 8. DOMAIN-SPECIFIC EMOJIS

#### Nuclear & Radiation: ☢️
**Usage**: Nuclear events, radiation, nuclear war, atomic concerns

**Current usage**: 13 instances

**Examples**:
- `☢️ WAR MANIPULATION SUCCEEDED: nuclear conflict triggered`
- `☢️ Radiation deaths this month: ${deaths}M`
- `☢️ NUCLEAR WAR TRIGGERED`

**Related**:
- 💥 (13 uses) - Explosions, termination shock, system collapses
- 💣 (1 use) - DEPRECATED, use ☢️ or 💥

#### Climate & Environment: 🌍
**Usage**: Climate events, environmental systems, planetary boundaries

**Current usage**: 12 instances

**Examples**:
- `🌍 Extinction scenario complete: ${scenario}`
- `🌍💡 BREAKTHROUGH: Gigatonne-scale carbon capture`
- `🌍 MultiParadigm update`

**Related**:
- 🌡️ (8 uses) - Temperature/climate specifically
- 🌊 (3 uses) - Ocean/water events
- 💧 (5 uses) - Water resources/freshwater
- 🦋 (10 uses) - Ecosystem/biodiversity events
- 🪸 (7 uses) - Coral reefs specifically

**Rule**: Use 🌍 for general planetary/environmental context. Use specific emojis (🌡️, 🌊, 💧, 🦋, 🪸) for targeted systems.

#### AI & Technology: 🤖
**Usage**: AI agents, autonomous systems, ML/AI context

**Current usage**: 10 instances

**Examples**:
- `🤖 Neutral AI objective`
- `🤖 High AI coordination increases capability growth`

**Related**:
- 🧠 (8 uses) - Cognitive/intelligence/learning events
- ⚡ (15 uses) - Energy/computational power
- 🚀 (15 uses) - Deployment/launches/major advances

**Rule**: Use 🤖 for AI agents. Use 🧠 for cognitive breakthroughs. Use ⚡ for compute/energy. Use 🚀 for deployments.

#### Governance & Politics: 🏛️
**Usage**: Government actions, political events, institutional changes

**Current usage**: 18 instances

**Examples**:
- `🏛️ CRISIS RESPONSE: Government frequency adjusted`
- `🏛️ Government attempting national tech deployment`
- `🏛️ AUTHORITARIAN TRANSITION`

#### Defense & Protection: 🛡️
**Usage**: Defensive systems, protection mechanisms, safeguards

**Current usage**: 24 instances

**Examples**:
- `🛡️ CYBER ATTACK REPELLED`
- `🛡️ DEFENSIVE AI PHASE 3: Full autonomous deployment`
- `🛡️ Defensive systems active`

**Related**:
- 🚫 (3 uses) - Blocked actions
- 🛑 (6 uses) - Stopped/halted actions
- 🔒 (8 uses) - Locked/secured/controlled systems

**Rule**: Use 🛡️ for general defense. Use 🚫/🛑 for blocking. Use 🔒 for control/authorization.

#### Research & Science: 🔬
**Usage**: Scientific research, experiments, laboratory work

**Current usage**: 20 instances

**Examples**:
- `🔬 BREAKTHROUGH: Advanced Desalination`
- `🔬 BREAKTHROUGH: AI Precision Irrigation`

**Related**:
- 🔍 (14 uses) - Investigation/detection/analysis
- 🧬 (6 uses) - Genetics/biology/evolution
- 🦠 (4 uses) - Pathogens/disease/biotech
- 🧪 (2 uses) - Chemical/experimental

**Rule**: Use 🔬 for general research breakthroughs. Use 🔍 for detection/investigation. Use 🧬 for genetics/evolution. Use 🦠 for biotech/disease.

#### Social & Political: 🤝
**Usage**: Cooperation, diplomacy, collective action, social cohesion

**Current usage**: 13 instances

**Examples**:
- `🤝 Diplomatic AI Blocked Manipulation`
- `🤝 Strategic collective forming`
- `🤝 DIPLOMATIC INTERVENTION SUCCEEDED`

**Related**:
- 🎭 (7 uses) - Deception/manipulation/strategic behavior
- 💔 (7 uses) - Social breakdown/trauma/collapse
- 👥 (4 uses) - Groups/populations

**Rule**: Use 🤝 for cooperation. Use 🎭 for deception/strategy. Use 💔 for social trauma.

---

## Consolidation Plan

### Phase 5 Implementation Priority

1. **High-impact consolidations** (reduce cognitive load):
   - Replace 💀 (20) → ❌ (except extinction events)
   - Replace 🔥 (2) → ❌
   - Replace 🎯 (7) → ✅ (except targeting contexts)
   - Replace 🌟 (5) → ✅
   - Replace ✨ (5) → ✅
   - Replace 🏆 (1) → ✅

2. **Medium-impact clarifications**:
   - Distinguish 🚨 (emergency) from ⚠️ (warning) - enforce consistently
   - Distinguish 📈 (growth) from 📉 (decline) from 📊 (data) - enforce consistently

3. **Low-impact refinements**:
   - Consolidate minor variants within domain categories
   - Document when to use combined emojis (🧠💡, 🌍💡, etc.)

---

## Usage Guidelines

### When to Use Emojis

✅ **USE emojis for**:
- Console log output (simulation events, phase results)
- Error messages (type/severity indication)
- Event titles in game state history
- Dashboard status indicators
- Log aggregation/filtering

❌ **DON'T use emojis for**:
- Variable names
- Function names
- Type definitions
- File names
- Comments (unless part of documentation examples)

### Combining Emojis

**Pattern**: `[DOMAIN][EVENT_TYPE] [MESSAGE]`

Examples:
- `🌍💡 BREAKTHROUGH: Gigatonne-scale carbon capture` (domain + event type)
- `🧠💡 BREAKTHROUGH: AI alignment problem solved` (domain + event type)
- `☢️💥 NUCLEAR DETONATION: ${nation}` (domain + severity)

**Rule**: Limit to 2 emojis maximum. First emoji = domain/context, second = event type.

---

## Validation

### Grep Patterns (Phase 6)

Check consistency with:

```bash
# Errors - should only be ❌ (except extinction ☠️)
grep -r "💀" src/ --include="*.ts" --include="*.tsx" | grep -v "extinction" | grep -v "grey goo" | grep -v "BOTTLENECK"

# Success - should only be ✅ (except targeting 🎯)
grep -r "🌟\|✨\|🏆" src/ --include="*.ts" --include="*.tsx"

# Warnings vs Alerts - verify semantic distinction
grep -r "🚨" src/ --include="*.ts" --include="*.tsx" | grep -v "EMERGENCY" | grep -v "CRITICAL" | grep -v "Emergency"
```

### Metrics

- **Consistency score**: % of emoji uses following canonical emoji rules
- **Consolidation progress**: # of deprecated emojis remaining
- **Semantic clarity**: Mean emoji-per-category (target: ≤1.5 per category)

---

## Examples: Before & After

### Error Messages

**BEFORE** (inconsistent):
```typescript
console.log(`💀 Invalid state detected`);
console.log(`🔥 Calculation failed`);
console.log(`❌ Test failed`);
```

**AFTER** (consistent):
```typescript
console.log(`❌ Invalid state detected`);
console.log(`❌ Calculation failed`);
console.log(`❌ Test failed`);
console.log(`☠️ GREY GOO EXTINCTION TRIGGERED`); // Extinction only
```

### Success Messages

**BEFORE** (inconsistent):
```typescript
console.log(`✅ Batch complete`);
console.log(`🎯 Goal achieved`);
console.log(`✨ Feature deployed`);
console.log(`🌟 Milestone reached`);
```

**AFTER** (consistent):
```typescript
console.log(`✅ Batch complete`);
console.log(`✅ Goal achieved`);
console.log(`✅ Feature deployed`);
console.log(`✅ Milestone reached`);
console.log(`🎯 BREAKTHROUGH: Can now detect internal misalignment`); // Precision targeting
```

### Warnings vs Alerts

**BEFORE** (ambiguous):
```typescript
console.log(`⚠️ EMERGENCY AI PAUSE`);
console.log(`🚨 Threshold approaching`);
```

**AFTER** (clear semantic distinction):
```typescript
console.log(`🚨 EMERGENCY AI PAUSE`); // Critical alert, immediate action
console.log(`⚠️ Threshold approaching`); // Warning, potential problem
```

---

## Implementation Notes

- **Backward compatibility**: Old logs will still display correctly
- **Search/grep**: Users can still find events by emoji (more reliably after consolidation)
- **Token efficiency**: Emojis are 1-4 bytes (more efficient than `[ERROR]`, `[WARNING]`, etc.)
- **Visual scanning**: Color/shape coding enables faster log parsing than text labels

**Estimated effort**: ~3-5 hours to implement Phase 5 (find-replace with validation)
