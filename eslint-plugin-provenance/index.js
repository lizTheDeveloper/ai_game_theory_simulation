/**
 * ESLint Plugin: provenance
 *
 * Custom ESLint plugin for the Citation Integrity Platform.
 * Enforces parameter provenance tracking in simulation code.
 *
 * Usage in eslint.config.mjs:
 *   import provenancePlugin from './eslint-plugin-provenance/index.js';
 *
 *   export default [
 *     {
 *       plugins: {
 *         provenance: provenancePlugin,
 *       },
 *       rules: {
 *         'provenance/require-provenance': ['error', {
 *           include: ['src/simulation/**\/*.ts'],
 *           exclude: ['**\/__tests__/**'],
 *         }],
 *       },
 *     },
 *   ];
 */

import requireProvenance from './rules/require-provenance.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-provenance',
    version: '1.0.0',
  },
  rules: {
    'require-provenance': requireProvenance,
  },
  configs: {
    recommended: {
      plugins: ['provenance'],
      rules: {
        'provenance/require-provenance': [
          'error',
          {
            include: ['src/simulation/**/*.ts', 'src/platform/**/*.ts'],
            exclude: ['**/__tests__/**', '**/*.test.ts', '**/node_modules/**'],
            allowedNames: ['index', 'i', 'j', 'k', 'count', 'length', 'tmp'],
          },
        ],
      },
    },
  },
};

export default plugin;
