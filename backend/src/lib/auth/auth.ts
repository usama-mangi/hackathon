import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { admin } from 'better-auth/plugins/admin';

// Use Prisma Accelerate (DATABASE_URL via HTTPS proxy) for runtime queries.
// PrismaPg / DIRECT_URL requires raw TCP on port 5432, which is not available
// for Prisma Postgres remote databases — they are only reachable via Accelerate.
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

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
            role: user.role ?? 'PARTICIPANT'
          }
        })
      }
    }
  },
  plugins: [
    admin(),
  ],
});
