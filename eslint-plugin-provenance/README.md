# ESLint Plugin: Provenance

Custom ESLint plugin for the Citation Integrity Platform. Enforces parameter provenance tracking in simulation code.

## Purpose

Prevents "phantom parameters" - unmarked numeric values that affect simulation outcomes without documented provenance.

## Rules

### `provenance/require-provenance`

Requires all numeric constants in simulation code to be marked with `provenance()` decorator.

**Rule type:** `problem`
**Severity:** `error`

#### Examples

✅ **CORRECT:**

```typescript
import { provenance } from '@/platform/decorators/provenance';
import { createVerified } from '@/types/provenance';

const CO2_BASELINE = provenance(280, {
  name: 'CO2_BASELINE',
  units: 'ppm',
  provenance: createVerified(
    '10.1038/nature12121',
    'IPCC (2013). Climate Change 2013',
    280,
    0.95
  ),
});
```

❌ **WRONG:**

```typescript
const CO2_BASELINE = 280; // ❌ ERROR: Missing provenance!
```

#### Configuration

```javascript
// eslint.config.mjs
{
  files: ["src/simulation/**/*.ts"],
  plugins: {
    provenance: provenancePlugin,
  },
  rules: {
    "provenance/require-provenance": [
      "error",
      {
        // File patterns to enforce provenance (glob patterns)
        include: ["src/simulation/**/*.ts", "src/platform/**/*.ts"],

        // File patterns to exclude
        exclude: ["**/__tests__/**", "**/*.test.ts"],

        // Variable names to allow without provenance (loop counters, etc.)
        allowedNames: ["index", "i", "j", "k", "count", "length"],

        // Optional: Only check values >= minValue
        minValue: 10,

        // Optional: Only check values <= maxValue
        maxValue: 1000,
      },
    ],
  },
}
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | `string[]` | `["src/simulation/**/*.ts"]` | File patterns to enforce provenance |
| `exclude` | `string[]` | `["**/__tests__/**", "**/*.test.ts"]` | File patterns to exclude |
| `allowedNames` | `string[]` | `["index", "i", "j", "k", "count", "length"]` | Variable names to allow without provenance |
| `minValue` | `number` | `undefined` | Minimum value to require provenance |
| `maxValue` | `number` | `undefined` | Maximum value to require provenance |

#### Allowed Contexts

The rule automatically allows numeric literals in these contexts (where provenance isn't needed):

- **Common values:** `0`, `1`, `-1` (always allowed)
- **Array indices:** `arr[0]`, `arr[1]`
- **Loop conditions:** `i < 10`, `for (let i = 0; ...)`
- **Function default parameters:** `function foo(x = 5) {}`
- **Type annotations:** `type Foo = 5;`

#### Auto-fix

Currently no auto-fix available. You must manually wrap constants in `provenance()`.

## Usage

### Installation

The plugin is located in `eslint-plugin-provenance/` at the root of the repository. It's loaded directly in `eslint.config.mjs`:

```javascript
import provenancePlugin from "./eslint-plugin-provenance/index.js";
```

### Running

```bash
# Lint all files
npm run lint

# Lint specific file
npx eslint src/simulation/myPhase.ts

# Fix auto-fixable issues (none for this plugin yet)
npx eslint --fix src/simulation/
```

### Pre-commit Integration

See Task 1.2.3 for pre-commit hook setup.

## Development

### Adding New Rules

1. Create rule in `rules/new-rule.js`
2. Add to `index.js` exports
3. Add tests in `__tests__/new-rule.test.js`
4. Document in this README

### Testing

```bash
# Run ESLint on test fixtures
npm run lint

# Check specific file
npx eslint src/platform/decorators/provenance.ts
```

## Related

- **Decorator:** `src/platform/decorators/provenance.ts`
- **Types:** `src/types/provenance.ts`
- **Pre-commit hook:** `.husky/pre-commit` (Task 1.2.3)
- **Validation CLI:** `scripts/validateProvenance.ts` (Task 1.2.4)
