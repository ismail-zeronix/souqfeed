import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { getEnv } from "@/lib/validation/env";
import { user } from "@/modules/auth/schema";
import {
  canSignInThroughPortal,
  PORTAL_HEADER,
  portalFromHeader,
  resolveSignupRole,
} from "@/modules/auth/guards";

const env = getEnv();

/**
 * Admins sign in at /admin/login and everyone else at /login. A wrong-portal
 * attempt gets the same error as a wrong password, so the response never
 * reveals which kind of account an email belongs to.
 */
const enforceSignInPortal = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return;
  const email = ctx.body?.email;
  if (typeof email !== "string") return;

  const [account] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1);
  // Unknown emails fall through to Better Auth's own invalid-credentials error.
  if (!account) return;

  const portal = portalFromHeader(ctx.headers?.get(PORTAL_HEADER));
  if (!canSignInThroughPortal(account.role, portal)) {
    throw new APIError("UNAUTHORIZED", {
      message: "Invalid email or password",
      code: "INVALID_EMAIL_OR_PASSWORD",
    });
  }
});

export const auth = betterAuth({
  hooks: {
    before: enforceSignInPortal,
  },
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "SUPPLIER",
        // `input: false` makes Better Auth reject `role` on /update-user, so
        // nobody can change their own role. Signup's choice is applied by the
        // database hook below, which never allows a staff role.
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser, context) => {
          const role = resolveSignupRole(context?.body?.role);
          if (!role) {
            throw new APIError("BAD_REQUEST", {
              message: "This account type is not available.",
            });
          }
          return { data: { ...newUser, role } };
        },
      },
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
