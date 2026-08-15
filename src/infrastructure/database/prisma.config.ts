import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import env from './../../config/env';

const adapter = new PrismaMariaDb({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  user: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
