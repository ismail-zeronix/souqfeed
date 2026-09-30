import type { Category } from "./types";

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-laptops", name: "Laptops", slug: "laptops", offerCount: 142 },
  { id: "cat-desktops", name: "Desktops", slug: "desktops", offerCount: 64 },
  { id: "cat-storage", name: "Storage", slug: "storage", offerCount: 86 },
  {
    id: "cat-networking",
    name: "Networking",
    slug: "networking",
    offerCount: 73,
  },
  {
    id: "cat-components",
    name: "Components",
    slug: "components",
    offerCount: 95,
  },
  { id: "cat-monitors", name: "Monitors", slug: "monitors", offerCount: 58 },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    offerCount: 124,
  },
  { id: "cat-software", name: "Software", slug: "software", offerCount: 18 },
];

export function getMockCategories(): Category[] {
  return MOCK_CATEGORIES;
}
