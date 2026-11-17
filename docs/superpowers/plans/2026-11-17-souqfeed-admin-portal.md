# Admin Portal Separation + Super Admin Role

Done ahead of Phase 4 at the owner's request (2026-11-17). Phase 13 still
owns the full admin console: user management, admin management, audit log.

## Goal

Admins sign in at their own URL, `/admin/login`. Buyers and suppliers sign in
at `/login`. Neither login accepts the other's accounts. Add a `SUPER_ADMIN`
role above `ADMIN`.

## Decisions

- **Separate path, same domain** (`/admin/login`), chosen over a subdomain.
- **Enforced on the server, inside Better Auth.** A `hooks.before` on
  `/sign-in/email` reads the `x-souqfeed-portal` header (`admin` or absent)
  and looks up the account's role. A staff account through the public portal,
  or a non-staff account through the admin portal, gets Better Auth's own
  "Invalid email or password" error, so the response doesn't reveal which
  portal an email belongs to. Sign-in stays on Better Auth's HTTP endpoint,
  so its rate limiting still applies (a Server Action would bypass it).
- The header can be forged. That only lets someone with the right password
  pick the other login page; the real boundary is still the password plus
  the role checks on every admin page and action.
- **Staff roles**: `ADMIN` and `SUPER_ADMIN`. Both can use the admin panel
  today (`isStaffRole`). Only super admins will manage admins, once Phase 13
  builds that. The seeded account becomes `SUPER_ADMIN`.
- **The admin area has its own chrome**: no public header, footer, or mobile
  nav, and its own top bar with sign-out back to `/admin/login`.

## Steps

1. `user_role` enum gains `SUPER_ADMIN` (migration `0004`).
2. `guards.ts`: `isStaffRole`, `canSignInThroughPortal`, `PORTAL_HEADER`
   (tested).
3. `config.ts`: the portal hook.
4. Move the admin pages into `src/app/admin/(panel)/` so `/admin/login`
   sits outside the guarded layout. URLs don't change.
5. `/admin/login` page and form; admin top bar with sign-out.
6. Redirects: `proxy.ts`, `requireAdminPage`, and `/dashboard` send staff
   and signed-out visitors to the right login. `/login` always goes to
   `/dashboard`.
7. Replace `authorizeRole(role, "ADMIN")` checks with `isStaffRole`.
8. Seed creates or repairs the account as `SUPER_ADMIN`.
9. Verify: tests, lint, types, build, and in Docker: admin through `/login`
   is rejected, supplier through `/admin/login` is rejected, each through
   its own portal works.
