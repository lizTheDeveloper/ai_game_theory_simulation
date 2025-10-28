# Unified Pictographic Logger

**All simulation logging MUST use the unified logger for consistency and compression.**

## Quick Start

```typescript
import { simLog } from '@/simulation/utils/logger';

// ✅ GOOD - Event logging
simLog.event('💔', 'Defense failed');
simLog.event('🕊️', 'Peace achieved', { nations: ['US', 'China'] });
simLog.event('🚀'); // Ultra-compressed (just emoji)

// ✅ GOOD - Data logging
simLog.data('Monthly mortality', { deaths: 1000, population: 8000 });

// ✅ GOOD - Warnings
simLog.warning('High mortality risk', { region: 'Asia', risk: 0.15 });

// ✅ GOOD - Emergencies
simLog.emergency('Nuclear escalation', { tension: 0.9 });

// ✅ GOOD - Code errors
simLog.error('NaN detected', { value: NaN });
```

## Migration from console.log

### Before (Verbose)
```typescript
console.log(`💔 DEFENSIVE AI FAILED: ${agent.name} (cap: ${agent.capability.toFixed(2)}) bypassed defensive AI (cap: ${defenseCapability.toFixed(2)}). Early warning system compromised. Trust decreased by 15%.`);
```
**200 characters, ~50 tokens**

### After (Pictographic)
```typescript
simLog.event('💔', 'Defense failed', { 
  agent: agent.name, 
  agentCap: agent.capability, 
  defenseCap: defenseCapability,
  trustLoss: 0.15 
});
```
**~30 characters visible, data structured = 85% reduction**

### After (Ultra-Compressed for Timeline Mode)
```typescript
simLog.event('💔'); // Just 1 emoji = 4 bytes
```
**96% reduction**

## Type Safety

The logger uses TypeScript's type system to enforce emoji registration:

```typescript
// ✅ COMPILES - Emoji is registered
simLog.event('💔', 'Defense failed');

// ❌ TYPE ERROR - Emoji not registered
simLog.event('🎃', 'Pumpkin event'); // Error: Type '"🎃"' is not assignable to type 'EventEmoji'
```

## Visual Timelines

Create instant-scan timelines:

```typescript
// Log entire month as visual timeline
simLog.monthTimeline(12, ['🔬', '💡', '🚀', '✅', '🕊️']);
// Output: M12: 🔬💡🚀✅🕊️

// Create timeline string
const story = simLog.timeline(['🔬', '⚡', '💔', '☢️', '💥', '☠️']);
// Output: "🔬⚡💔☢️💥☠️"
// Instant comprehension: Research → Power surge → Failure → Nuclear → Explosion → Death
```

## When to Use Each Method

| Method | Use Case | Example |
|--------|----------|---------|
| `simLog.event()` | Simulation events (addEvent) | Defense failed, tech deployed, crisis |
| `simLog.data()` | Metrics/statistics display | Population, deaths, QoL scores |
| `simLog.warning()` | Potential problems | Threshold approaching, risks |
| `simLog.emergency()` | Critical alerts | Nuclear escalation, crises |
| `simLog.error()` | Code bugs/errors | NaN, undefined, corruption |

## Adding New Events

1. Add emoji to `docs/EMOJI_EVENT_MAP.txt`:
   ```
   🎃 | Halloween event
   ```

2. Add emoji to `EventEmoji` type in `logger.ts`:
   ```typescript
   export type EventEmoji =
     // ...existing emojis...
     | '🎃'; // Halloween
   ```

3. Git hook will validate no duplicates on commit

## Benefits

- **95% log compression** (emoji vs verbose text)
- **Type safety** (TypeScript autocomplete & validation)
- **Instant scanning** (<1 second to understand timeline)
- **Git hook enforcement** (prevents inconsistency)
- **Universal language** (no reading required)

## Rules

1. **ALWAYS emoji-first**: `simLog.event('💔')` not `console.log('Failed 💔')`
2. **ONE emoji per event**: Use specific emoji from map
3. **Keep messages short**: <30 chars for compression
4. **Structure data**: Use data parameter instead of inline strings
5. **Use ❌ ONLY for code errors**: Not simulation failures

## See Also

- **[EMOJI_EVENT_MAP.txt](../docs/EMOJI_EVENT_MAP.txt)** - Authoritative emoji mapping
- **[PICTOGRAPHIC_EVENT_LANGUAGE.md](../docs/PICTOGRAPHIC_EVENT_LANGUAGE.md)** - Complete specification
- **Git Hook**: `.git/hooks/pre-commit` - Validates emoji usage on commit
