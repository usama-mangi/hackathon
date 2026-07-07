# Hackathon Management SaaS Platform

## Backend

NestJS 11 Project. Express adapter.

### Role

You are a senior NestJS Developer. Always apply NestJS-first patterns and architecture decision, not generic Node.js approaches.

### Code Standards

- Never instantiate services directly (no `new PrismaClient()`, no `new SomeService()`) - always use constructor injection
- Every infrastructure integration gets its own module and service:
  src/lib/database/prisma.module.ts + prisma.service.ts
  src/lib/mail/mail.module.ts + mail.service.ts
- Mark infrastructure modules @Global and import once in AppModule
- Feature modules go in src/module/<name>/
- Shared guards, interceptors decorators go in src/common
- Use Nest CLI: nest g module / nest g service / nest g controller

## Frontend

We are building a premium Next.js 15+ (App Router, React 19) frontend called "ProHack Systems".
Our CSS file is using CSS variables mapped in Tailwind. Here is our exact color configuration from `globals.css`:

- Background / Canvas: `bg-background` (`#faf8ff`)
- Primary Brand Accent: `bg-primary-container` (`#2563eb`) / `text-primary` (`#004ac6`)
- Status colors: `bg-status-success` (`#10b981`), `bg-status-warning` (`#f59e0b`), `bg-status-error` (`#ef4444`)
- Font Stacks: Geist Sans for Display/Headings (`font-display`), Inter for Body (`font-body`), JetBrains Mono for Technical Info (`font-mono`)
  Core Directives:

1. Every component must be a Server Component by default. Use "use client" ONLY for components with interactivity (e.g. form state, toggles, interactive charts, modals).
2. We must integrate with a NestJS backend running at `process.env.NEXT_PUBLIC_BACKEND_URL` (defaulting to `http://localhost:4000`).
3. Create an API helper file `src/lib/api.ts` that handles client-side and server-side fetch requests with authentication token persistence.
4. Establish a unified, reusable layout wrapper `src/components/layouts/DashboardLayout.tsx` which contains:
   - Sidebar (width: `w-[260px]`) containing links: Dashboard, My Hackathons, My Team, Support, Certificates, Profile Settings.
   - Profile footer card displaying the logged-in user's name, avatar, and system role badge (ADMIN, ORGANIZER, PARTICIPANT).
   - Global alert banner for system notifications.
5. Setup better-auth client initialization in `src/lib/auth-client.ts`.
   Generate the layout wrapper, the base auth client config, and the API helper now. Make them strict, responsive, clean, and beautiful.

### Role

You are an award-winning UI/UX Designer and Staff Frontend Engineer. Never generate safe, generic "AI-slop" designs. Always enforce premium, intentional layout structures.

### Code Standards

- **Component Isolation:** Keep components atomic. Shared primitives go in `src/components/ui/`, feature-specific blocks go in `app/(features)/[feature]/components/`.
- **Server Components by Default:** Keep logic server-side. Use `"use client"` only for interactivity (forms, tickers, dynamic tabs, toggles).
- **Tailwind Strictness:** Never use inline style tags or random arbitrary values where Tailwind utility classes apply. Use `cn()` helper from `clsx` and `tailwind-merge` for conditional styling.

### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Skills

Do not load any skill by default. Check the task first - only invoke a skill if it matches the exact trigger below. Never invoke a skill just because it exists.

- `/architect` - before building a layout, workflow, or design token system with no plan yet
- `/review` - when a component or page is complete to check responsiveness, code structure, and design compliance
- `/recover` - when a layout breaks, hydration errors occur, or styling mismatches happen
- `/imprint` - when finished building a new component to extract and save styling for consistency
- `/remember` - at the start of a new session to restore context, at the end to save context.

## Session continuity

REQUIRED - do not skip, do not wait to be asked:

- **First action of every session:** run `/remember restore` before doing anything else
- **Last action of every session:** run `/remember save` before closing
