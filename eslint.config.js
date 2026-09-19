// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    // The phase check loads modules by path on purpose, to prove they exist.
    files: ['src/__tests__/**'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // i18next's documented usage goes through the default export.
    files: ['src/i18n/**'],
    rules: { 'import/no-named-as-default-member': 'off' },
  },
  {
    rules: {
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
]);
