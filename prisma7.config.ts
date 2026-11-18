import { join } from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ quiet: true });
config({ path: '.env.local', quiet: true });

const CACHE_PATH = process.env.CACHE_PATH ?? `/opt/openbeats`;

export default defineConfig({
  datasource: {
    url: `file:${join(CACHE_PATH, `openbeats.db`)}`,
  },
  migrations: {
    path: 'src/backend/prisma/migrations',
  },
  schema: 'src/backend/prisma/schema.prisma',
});
