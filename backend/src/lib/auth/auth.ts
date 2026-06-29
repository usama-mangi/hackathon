import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { admin } from 'better-auth/plugins/admin';
import { PrismaPg } from '@prisma/adapter-pg';

// Use Prisma Accelerate (DATABASE_URL via HTTPS proxy) for runtime queries.
// PrismaPg / DIRECT_URL requires raw TCP on port 5432, which is not available
// for Prisma Postgres remote databases — they are only reachable via Accelerate.
const dbUrl = process.env.DATABASE_URL || '';
const prisma = dbUrl.startsWith('prisma+postgres://')
  ? new PrismaClient({
      accelerateUrl: dbUrl,
    }).$extends(withAccelerate())
  : new PrismaClient({
      adapter: new PrismaPg({
        connectionString: dbUrl,
      }),
    });

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma as any, {
    provider: 'postgresql',
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: 'PARTICIPANT',
          },
        }),
      },
    },
  },
  plugins: [admin()],
});
