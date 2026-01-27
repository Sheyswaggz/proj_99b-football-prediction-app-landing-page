module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true,
    },
  },
  plugins: ['import', 'jsx-a11y', 'html'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.mjs', '.cjs'],
      },
    },
  },
  rules: {
    // Best Practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'no-shadow': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-return-await': 'error',
    'require-await': 'error',
    'no-async-promise-executor': 'error',
    
    // Code Quality
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'no-else-return': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'warn',
    'no-unneeded-ternary': 'error',
    'prefer-object-spread': 'error',
    'object-shorthand': ['error', 'always'],
    'quote-props': ['error', 'as-needed'],
    
    // ES6+ Features
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'template-curly-spacing': ['error', 'never'],
    
    // Import Rules
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'warn',
    'import/newline-after-import': 'error',
    'import/no-anonymous-default-export': 'warn',
    
    // Accessibility Rules
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'error',
    
    // Formatting (handled by Prettier, but some ESLint rules)
    'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    'max-depth': ['warn', 4],
    'complexity': ['warn', 15],
    
    // Comments and Documentation
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'multiline-comment-style': ['warn', 'starred-block'],
    
    // Error Prevention
    'no-throw-literal': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-extend-native': 'error',
    'no-proto': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-void': 'error',
    'radix': 'error',
    'yoda': 'error',
  },
  overrides: [
    {
      files: ['*.html'],
      processor: 'html/html',
    },
    {
      files: ['vite.config.js', 'vite.config.cjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['*.test.js', '*.spec.js', '**/__tests__/**'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'max-lines': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    'coverage',
    '*.min.js',
    'public/vendor',
  ],
};