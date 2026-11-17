import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { db } from "@/lib/database/client";
import { getEnv } from "@/lib/validation/env";
import { resolveSignupRole } from "@/modules/auth/guards";

const env = getEnv();

export const auth = betterAuth({
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
        // database hook below, which never allows ADMIN.
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
