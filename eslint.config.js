const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-undef': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },
  prettierRecommended,
];
