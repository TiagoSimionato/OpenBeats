import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { CONFIGS } from 'configs/constants';
import { PrismaClient } from './generated/client';

const connectionString = `file:${CONFIGS.DB_PATH}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
