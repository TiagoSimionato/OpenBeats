import { lintConfig } from 'tsm-utils/lint';

export default [
  ...lintConfig,
  {
    rules: {
      'no-console': 'off',
    },
  },
];
