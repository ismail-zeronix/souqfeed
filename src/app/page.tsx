import { HomeSummary } from "@/components/home/home-summary";
import { getMockCategories } from "@/modules/categories/mock-data";
import {
  getMockMarketStats,
  getMockOffers,
  getMockWtbRequests,
} from "@/modules/offers/mock-data";
import { db } from "@/lib/database/client";
import { categories as categoryTable } from "@/modules/categories/schema";

export default async function HomePage() {
  const stats = getMockMarketStats();
  const offers = getMockOffers();
  const wtbRequests = getMockWtbRequests();
  let categories = getMockCategories();
  try {
    const seededCategories = await db.select().from(categoryTable);
    const seededBySlug = new Map(
      seededCategories.map((category) => [category.slug, category]),
    );
    categories = getMockCategories().map((fallbackCategory) => {
      const category = seededBySlug.get(fallbackCategory.slug);
      return category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            offerCount: fallbackCategory.offerCount,
          }
        : fallbackCategory;
    });
  } catch {
    // Keep the homepage available when the database is not configured locally.
  }

  return (
    <HomeSummary
      stats={stats}
      offers={offers}
      categories={categories}
      wtbRequests={wtbRequests}
    />
  );
}
