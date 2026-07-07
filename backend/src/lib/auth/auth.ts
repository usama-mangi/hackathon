import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { admin } from 'better-auth/plugins/admin';
import { PrismaPg } from '@prisma/adapter-pg';
import { MailService } from '../mail/mail.service';

import { createAuthMiddleware } from 'better-auth/api';

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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      const mailService = MailService.getInstance();
      if (mailService) {
        await mailService.sendResetPasswordEmail(user.email, user.name, url);
      } else {
        console.log('\n' + '='.repeat(80));
        console.log(`[DEVELOPMENT PASSWORD RESET PIPELINE - MailService NOT INITIALIZED]`);
        console.log(`TO: ${user.name} <${user.email}>`);
        console.log(`LINK: ${url}`);
        console.log('='.repeat(80) + '\n');
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const mailService = MailService.getInstance();
      if (mailService) {
        await mailService.sendVerificationEmail(user.email, user.name, url);
      } else {
        console.log('\n' + '='.repeat(80));
        console.log(`[DEVELOPMENT EMAIL VERIFICATION PIPELINE - MailService NOT INITIALIZED]`);
        console.log(`TO: ${user.name} <${user.email}>`);
        console.log(`LINK: ${url}`);
        console.log('='.repeat(80) + '\n');
      }
    },
  },
  database: prismaAdapter(prisma as any, {
    provider: 'postgresql',
  }),
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Intercept signup endpoint to extract user role if specified by client
      if (ctx.path === '/sign-up/email') {
        const requestedRole = ctx.body?.signupRole;
        // Strip role from the body so Better Auth doesn't fail with FIELD_NOT_ALLOWED
        const { role, ...newBody } = ctx.body || {};
        
        // Save the requested role to request context so database hooks can access it
        ctx.context.requestedSignupRole = requestedRole;

        return {
          context: {
            ...ctx,
            body: newBody,
          },
        };
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const requestedRole = ctx?.context?.requestedSignupRole;
          return {
            data: {
              ...user,
              // Map requestedRole to role, whitelisting only ORGANIZER, ADMIN, and PARTICIPANT.
              role:
                requestedRole === 'ORGANIZER'
                  ? 'ORGANIZER'
                    : 'PARTICIPANT',
            },
          };
        },
      },
    },
  },
  plugins: [admin()],
});
