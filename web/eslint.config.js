import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.ts',
      '*.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: path.resolve(__dirname, './tsconfig.json'),
        },
        node: true,
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app/**',
          mode: 'folder',
        },
        {
          type: 'feature-entry',
          pattern: 'src/features/*/index.ts',
          mode: 'file',
          capture: ['feature'],
        },
        {
          type: 'feature-ui',
          pattern: 'src/features/*/ui/**',
          mode: 'folder',
          capture: ['feature'],
        },
        {
          type: 'feature-logic',
          pattern: 'src/features/*/logic/**',
          mode: 'folder',
          capture: ['feature'],
        },
        {
          type: 'feature-data',
          pattern: 'src/features/*/data/**',
          mode: 'folder',
          capture: ['feature'],
        },
        {
          type: 'feature-models',
          pattern: 'src/features/*/models/**',
          mode: 'folder',
          capture: ['feature'],
        },
        {
          type: 'shared',
          pattern: 'src/shared/**',
          mode: 'folder',
        },
        {
          type: 'core',
          pattern: 'src/core/**',
          mode: 'folder',
        },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message:
            'Architectural boundary violation: (${from.type}) is not allowed to import (${target.type})',
          rules: [
            // Core zone: zero outward dependencies (only core and external libraries)
            {
              from: 'core',
              allow: ['core'],
            },

            // Shared zone: only allowed to import from core
            {
              from: 'shared',
              allow: ['shared', 'core'],
            },

            // Feature models: pure definitions, cannot import ui, logic, or data
            {
              from: 'feature-models',
              allow: [
                ['feature-models', { feature: '${from.captured.feature}' }],
                'core',
              ],
            },

            // Feature data: repository implementations touching core storage
            {
              from: 'feature-data',
              allow: [
                ['feature-data', { feature: '${from.captured.feature}' }],
                ['feature-models', { feature: '${from.captured.feature}' }],
                'shared',
                'core',
              ],
            },

            // Feature logic: business orchestration, DI via models, never imports UI or data directly
            {
              from: 'feature-logic',
              allow: [
                ['feature-logic', { feature: '${from.captured.feature}' }],
                ['feature-models', { feature: '${from.captured.feature}' }],
                'feature-entry',
                'shared',
                'core',
              ],
            },

            // Feature ui: presentation layer, can import logic and models from same feature, never data
            {
              from: 'feature-ui',
              allow: [
                ['feature-ui', { feature: '${from.captured.feature}' }],
                ['feature-logic', { feature: '${from.captured.feature}' }],
                ['feature-models', { feature: '${from.captured.feature}' }],
                'feature-entry',
                'shared',
                'core',
              ],
            },

            // Feature entry: public API barrel export, can aggregate from internal layers of the same feature
            {
              from: 'feature-entry',
              allow: [
                ['feature-ui', { feature: '${from.captured.feature}' }],
                ['feature-logic', { feature: '${from.captured.feature}' }],
                ['feature-data', { feature: '${from.captured.feature}' }],
                ['feature-models', { feature: '${from.captured.feature}' }],
                'shared',
                'core',
              ],
            },

            // App zone: bootstrap, providers, layout shell; imports feature public API, shared, and core
            {
              from: 'app',
              allow: ['app', 'feature-entry', 'shared', 'core'],
            },
          ],
        },
      ],
      // Entry point boundary: prevent deep imports across features
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              target: ['feature-entry'],
              allow: ['index.ts', 'index.tsx'],
            },
            {
              target: [
                'app',
                'shared',
                'core',
                'feature-ui',
                'feature-logic',
                'feature-data',
                'feature-models',
              ],
              allow: ['**/*'],
            },
          ],
        },
      ],
    },
  },
  prettier
);
