import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/database/client";
import { user } from "@/modules/auth/schema";
import { getEnv } from "@/lib/validation/env";

async function seed() {
  const env = getEnv();

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, env.ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin already exists: ${env.ADMIN_EMAIL}`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      name: "Admin",
    },
  });

  await db
    .update(user)
    .set({ role: "ADMIN" })
    .where(eq(user.email, env.ADMIN_EMAIL));

  console.log(`Seeded admin: ${env.ADMIN_EMAIL}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
