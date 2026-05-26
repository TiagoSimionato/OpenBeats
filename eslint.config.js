import config from '@antfu/eslint-config';
import pluginPreferArrow from 'eslint-plugin-prefer-arrow';

const lintConfig = [
  ...(await config({
    ignores: [
      'webp.js',
    ],
    jsx: true,
    plugins: {
      'prefer-arrow': pluginPreferArrow,
    },
    react: true,
    rules: {
      'antfu/top-level-function': 'off',
      'arrow-body-style': 'error',
      'import/no-default-export': 'error',
      'no-console': 'warn',
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'perfectionist/sort-array-includes': 'error',
      'perfectionist/sort-enums': 'error',
      'perfectionist/sort-exports': 'error',
      'perfectionist/sort-interfaces': 'error',
      'perfectionist/sort-jsx-props': 'error',
      'perfectionist/sort-maps': 'error',
      'perfectionist/sort-object-types': 'error',
      'perfectionist/sort-objects': 'error',
      'perfectionist/sort-union-types': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          classPropertiesAllowed: false,
          disallowPrototype: true,
          singleReturnOnly: false,
        },
      ],
      'react-refresh/only-export-components': 'off',
      'react/x-no-nested-component-definitions': 'error',
      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-return': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
    stylistic: {
      indent: 2,
      jsx: true,
      quotes: 'single',
      semi: true,
    },
  })),
  {
    files: ['**/layout.tsx', '**/page.tsx', '**/not-found.ts', '**.config.**', '**/reportWebVitals.ts', 'tailwind.config**', 'next.config**'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['**/lintConfig.**'],
    rules: {
      'antfu/no-top-level-await': 'off',
      'import/no-default-export': 'off',
    },
  },
];

export default lintConfig;
