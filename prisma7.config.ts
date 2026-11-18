import { defineConfig } from 'prisma/config';
import { CONFIGS } from './src/configs/constants';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    url: `file:${CONFIGS.DB_PATH}`,
  },
  migrations: {
    path: 'src/backend/prisma/migrations',
  },
  schema: 'src/backend/prisma/schema.prisma',
});
