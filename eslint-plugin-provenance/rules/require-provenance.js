/**
 * ESLint Rule: require-provenance
 *
 * Enforces that all numeric constants in simulation code are marked with provenance metadata.
 * This prevents "phantom parameters" - unmarked values that affect simulation outcomes.
 *
 * Usage:
 *   ✅ CORRECT:
 *   const CO2_BASELINE = provenance(280, { name: 'CO2_BASELINE', provenance: ... });
 *
 *   ❌ WRONG:
 *   const CO2_BASELINE = 280; // Missing provenance!
 *
 * Configuration:
 *   {
 *     "rules": {
 *       "provenance/require-provenance": ["error", {
 *         "include": ["src/simulation/**\/*.ts"],
 *         "exclude": ["**\/__tests__/**", "**\/*.test.ts"]
 *       }]
 *     }
 *   }
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require provenance metadata for all numeric constants in simulation code',
      category: 'Citation Integrity',
      recommended: true,
    },
    messages: {
      missingProvenance:
        'Parameter "{{name}}" requires @provenance annotation. Use: provenance({{value}}, { name: "{{name}}", provenance: ... })',
      missingProvenanceLiteral:
        'Numeric literal {{value}} requires provenance metadata. Extract to a named constant with provenance().',
    },
    schema: [
      {
        type: 'object',
        properties: {
          include: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns to enforce provenance (glob patterns)',
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns to exclude (glob patterns)',
          },
          allowedNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Variable names to exclude (e.g., "index", "count")',
          },
          minValue: {
            type: 'number',
            description: 'Minimum value to require provenance (default: none)',
          },
          maxValue: {
            type: 'number',
            description: 'Maximum value to require provenance (default: none)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const includePatterns = options.include || ['src/simulation/**/*.ts'];
    const excludePatterns = options.exclude || ['**/__tests__/**', '**/*.test.ts'];
    const allowedNames = new Set(options.allowedNames || ['index', 'i', 'j', 'k', 'count', 'length']);
    const minValue = options.minValue;
    const maxValue = options.maxValue;

    // Check if current file should be checked
    const filename = context.getFilename();
    const shouldCheck = matchesPatterns(filename, includePatterns, excludePatterns);

    if (!shouldCheck) {
      return {}; // Skip this file
    }

    /**
     * Check if a value is within the range that requires provenance
     */
    function requiresProvenance(value) {
      if (minValue !== undefined && Math.abs(value) < minValue) {
        return false;
      }
      if (maxValue !== undefined && Math.abs(value) > maxValue) {
        return false;
      }
      return true;
    }

    /**
     * Check if a variable declaration uses provenance()
     */
    function hasProvenanceCall(init) {
      if (!init) return false;

      // Check if init is a call to provenance()
      if (init.type === 'CallExpression') {
        const callee = init.callee;
        if (callee.type === 'Identifier' && callee.name === 'provenance') {
          return true;
        }
      }

      return false;
    }

    return {
      /**
       * Check variable declarations for unmarked numeric constants
       */
      VariableDeclarator(node) {
        // Only check const declarations (not let/var)
        if (node.parent.kind !== 'const') {
          return;
        }

        // Only check top-level or module-scoped constants
        const scope = context.getScope();
        if (scope.type !== 'module' && scope.type !== 'global') {
          return;
        }

        // Get variable name
        if (node.id.type !== 'Identifier') {
          return; // Skip destructuring assignments
        }

        const varName = node.id.name;

        // Skip allowed names (loop counters, etc.)
        if (allowedNames.has(varName)) {
          return;
        }

        // Skip private variables (starting with _)
        if (varName.startsWith('_')) {
          return;
        }

        // Check if init is a numeric literal
        if (node.init && node.init.type === 'Literal' && typeof node.init.value === 'number') {
          const value = node.init.value;

          // Skip common values that don't need provenance
          if (value === 0 || value === 1 || value === -1) {
            return;
          }

          // Check range filter
          if (!requiresProvenance(value)) {
            return;
          }

          // Check if wrapped in provenance()
          if (!hasProvenanceCall(node.init)) {
            context.report({
              node,
              messageId: 'missingProvenance',
              data: {
                name: varName,
                value: String(value),
              },
            });
          }
        }

        // Check if init is a numeric expression (e.g., 1.5 * 2)
        if (node.init && node.init.type === 'BinaryExpression') {
          // Only check if the expression contains numeric literals
          const hasNumericLiteral = containsNumericLiteral(node.init);
          if (hasNumericLiteral && !hasProvenanceCall(node.init)) {
            context.report({
              node,
              messageId: 'missingProvenance',
              data: {
                name: varName,
                value: 'expression',
              },
            });
          }
        }
      },

      /**
       * Check numeric literals used directly in simulation code
       * (This catches magic numbers used inline)
       */
      Literal(node) {
        if (typeof node.value !== 'number') {
          return;
        }

        const value = node.value;

        // Skip common values
        if (value === 0 || value === 1 || value === -1) {
          return;
        }

        // Skip if already inside provenance() call
        let parent = node.parent;
        while (parent) {
          if (parent.type === 'CallExpression' && parent.callee.name === 'provenance') {
            return; // Already wrapped
          }
          parent = parent.parent;
        }

        // Skip if used in specific contexts where provenance isn't needed
        if (isAllowedContext(node)) {
          return;
        }

        // Check range filter
        if (!requiresProvenance(value)) {
          return;
        }

        // Report magic number
        context.report({
          node,
          messageId: 'missingProvenanceLiteral',
          data: {
            value: String(value),
          },
        });
      },
    };
  },
};

/**
 * Check if filename matches include/exclude patterns
 */
function matchesPatterns(filename, includePatterns, excludePatterns) {
  // Convert glob patterns to regex (simple implementation)
  const includeRegexes = includePatterns.map(patternToRegex);
  const excludeRegexes = excludePatterns.map(patternToRegex);

  // Check exclude first (takes precedence)
  for (const regex of excludeRegexes) {
    if (regex.test(filename)) {
      return false;
    }
  }

  // Check include
  for (const regex of includeRegexes) {
    if (regex.test(filename)) {
      return true;
    }
  }

  return false;
}

/**
 * Convert glob pattern to regex
 */
function patternToRegex(pattern) {
  const escaped = pattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '.*') // ** matches any path
    .replace(/\*/g, '[^/]*'); // * matches any file/dir name

  return new RegExp(escaped);
}

/**
 * Check if AST node contains numeric literals
 */
function containsNumericLiteral(node) {
  if (node.type === 'Literal' && typeof node.value === 'number') {
    return true;
  }

  // Recursively check children
  for (const key in node) {
    if (key === 'parent' || key === 'loc' || key === 'range') {
      continue; // Skip metadata
    }

    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && containsNumericLiteral(item)) {
          return true;
        }
      }
    } else if (child && typeof child === 'object' && containsNumericLiteral(child)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a literal is used in an allowed context where provenance isn't required
 */
function isAllowedContext(node) {
  const parent = node.parent;

  // Array indices: arr[0], arr[1]
  if (parent.type === 'MemberExpression' && parent.property === node) {
    return true;
  }

  // Loop conditions: i < 10, for (let i = 0; ...)
  if (
    parent.type === 'BinaryExpression' ||
    parent.type === 'ForStatement' ||
    parent.type === 'WhileStatement'
  ) {
    return true;
  }

  // Function default parameters (context-specific)
  if (parent.type === 'AssignmentPattern') {
    return true;
  }

  // Type annotations (TypeScript)
  if (parent.type === 'TSLiteralType') {
    return true;
  }

  return false;
}
