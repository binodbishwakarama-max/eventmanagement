export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'client/dist/**',
      'server/uploads/**',
      'server/backups/**',
      'coverage/**'
    ]
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^(_|React$)' }],
      'no-undef': 'off',
      'no-redeclare': 'error',
      'no-constant-condition': 'warn',
      'no-duplicate-imports': 'error'
    }
  }
];
