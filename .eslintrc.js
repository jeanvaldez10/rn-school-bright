module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-native', 'react-hooks', 'prettier'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/sort-styles': 'off'
  },
};
