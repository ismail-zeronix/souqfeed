import { count, desc, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { user } from "@/modules/auth/schema";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";
import { products } from "@/modules/products/schema";
import { suppliers } from "@/modules/suppliers/schema";

const countWhere = (condition: ReturnType<typeof sql>) =>
  sql<number>`count(*) filter (where ${condition})`.mapWith(Number);

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>;

/** Headline counts and recent sign-ups for the admin overview page. */
export async function getAdminOverview() {
  const [
    [accounts],
    [supplierProfiles],
    [catalog],
    [brandTotal],
    [categoryTotal],
    recentSignups,
  ] = await Promise.all([
    db
      .select({
        buyers: countWhere(sql`${user.role} = 'BUYER'`),
        suppliers: countWhere(sql`${user.role} = 'SUPPLIER'`),
        staff: countWhere(sql`${user.role} in ('ADMIN', 'SUPER_ADMIN')`),
        lastSevenDays: countWhere(
          sql`${user.createdAt} > now() - interval '7 days'`,
        ),
      })
      .from(user),
    db
      .select({
        total: count(),
        active: countWhere(sql`${suppliers.active}`),
        verified: countWhere(sql`${suppliers.verified}`),
        awaitingVerification: countWhere(
          sql`${suppliers.active} and not ${suppliers.verified}`,
        ),
      })
      .from(suppliers),
    db
      .select({
        total: count(),
        active: countWhere(sql`${products.active}`),
      })
      .from(products),
    db.select({ total: count() }).from(brands),
    db.select({ total: count() }).from(categories),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(6),
  ]);

  return {
    accounts,
    supplierProfiles,
    products: catalog,
    brandCount: brandTotal.total,
    categoryCount: categoryTotal.total,
    recentSignups,
  };
}
