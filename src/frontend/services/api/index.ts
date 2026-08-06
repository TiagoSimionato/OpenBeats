import { createAPI } from 'tsm-utils';

export const api = createAPI('/api', { timeout: 30000 });
