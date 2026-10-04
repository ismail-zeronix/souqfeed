import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Only genuinely public, stable routes. `/suppliers/[slug]` is deliberately
  // excluded — it's real code but 100% mock company data until suppliers are
  // onboarded for real (Phase 2/10); indexing it now would present fictional
  // businesses as real.
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];
}
