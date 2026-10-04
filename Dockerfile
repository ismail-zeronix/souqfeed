# syntax=docker/dockerfile:1

#######################################################################
# base: shared Node + pnpm foundation for every build-time stage.
# Not used by `runner` — the runtime image never needs pnpm/npm.
#######################################################################
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Pinned to match package.json's "packageManager" field exactly, for
# reproducible builds.
RUN npm install -g pnpm@12.8.1

#######################################################################
# deps: install all dependencies (prod + dev) once; cached by lockfile
# hash so source-code edits don't bust this layer.
#######################################################################
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

#######################################################################
# builder: compile the Next.js production build.
#######################################################################
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client JS bundle at build time
# by Next.js's compiler — this must be a build ARG, not a container
# `environment:` entry (that would only affect the server-side value,
# not what's already baked into the client bundle inside this image).
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Next.js's "Collecting page data" build step imports every page module
# (e.g. /admin, /dashboard) to read exported route config, even for
# routes that are later marked dynamic — this executes their top-level
# code, including `getEnv()` in src/lib/auth/config.ts and
# src/lib/database/client.ts (both module-scope, not inside a request
# handler). These values are never used for a real connection at build
# time (postgres.js/better-auth don't connect eagerly on construction)
# and are discarded entirely — the runner stage starts fresh and gets
# its real values from compose.yaml's `env_file` at container start.
# They just need to satisfy the Zod schema's shape so the build doesn't
# fail. Not real credentials; never used after this RUN step.
ENV DATABASE_URL="postgresql://build:build@build-time-placeholder:5432/build" \
    REDIS_URL="redis://build-time-placeholder:6379" \
    BETTER_AUTH_SECRET="docker-build-time-placeholder-value-not-a-real-secret" \
    BETTER_AUTH_URL="http://build-time-placeholder.invalid" \
    ADMIN_PASSWORD="docker-build-time-placeholder"

RUN pnpm build

#######################################################################
# migrator: full source + full (non-pruned) node_modules, for
# `drizzle-kit migrate` only. Branches off `deps` (pre-build) since
# migrations never need a compiled Next.js app. Never used to serve
# traffic, never run implicitly on container start — see compose.yaml's
# `migrate` service (profile-gated) for how this is invoked.
#######################################################################
FROM deps AS migrator
COPY . .
CMD ["pnpm", "db:migrate"]

#######################################################################
# runner: minimal image that actually serves traffic. No pnpm, no dev
# dependencies — only what next build's standalone output traced as
# actually imported at runtime.
#######################################################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
