import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // The Playwright specs and the Vite config run under Node, not in the
    // browser: Buffer and process are real there. Without this every lint run
    // reported eight no-undef errors that were not errors.
    files: ['e2e/**/*.js', 'vite.config.js', 'playwright.config.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Context modules deliberately co-locate the provider component with its
    // consumer hook, trading fast-refresh precision in these two files for a
    // single import site per context. LanguageContext established the pattern
    // and AuthContext follows it.
    files: ['src/context/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
