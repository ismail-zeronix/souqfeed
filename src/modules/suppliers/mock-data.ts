import type { SupplierProfile, SupplierSummary } from "./types";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const AL_HADI: SupplierProfile = {
  id: "supplier-al-hadi",
  slug: "al-hadi-computers",
  companyName: "Al Hadi Computers LLC",
  logoInitial: "A",
  verified: true,
  locationName: "Bur Dubai",
  activeOfferCount: 320,
  positiveScorePercent: 98,
  description:
    "Al Hadi Computers LLC is a leading IT distributor based in Bur Dubai, specializing in laptops, desktops, components and enterprise solutions. We supply genuine products from global brands with competitive wholesale pricing.",
  whatsappNumber: "+971543521234",
  phone: "+97143526611",
  email: "sales@alhadi-computers.ae",
  address: "Bur Dubai, Dubai, UAE",
  googleMapsUrl: "https://maps.google.com/?q=Al+Hadi+Computers+Bur+Dubai",
  tags: ["Laptops", "Desktops", "Components", "Networking", "Accessories", "Software"],
  lastBroadcastAt: hoursAgo(2),
  memberSinceYear: 2016,
  avgResponseTimeLabel: "< 2 hours",
  topBrands: [
    { brandId: "brand-lenovo", brandName: "Lenovo", sharePercent: 28 },
    { brandId: "brand-hp", brandName: "HP", sharePercent: 22 },
    { brandId: "brand-dell", brandName: "Dell", sharePercent: 18 },
    { brandId: "brand-apple", brandName: "Apple", sharePercent: 8 },
    { brandId: "brand-wd", brandName: "WD", sharePercent: 8 },
    { brandId: "brand-aruba", brandName: "Aruba", sharePercent: 6 },
  ],
  categoryMix: [
    { categoryId: "cat-laptops", categoryName: "Laptops", sharePercent: 42 },
    { categoryId: "cat-desktops", categoryName: "Desktops", sharePercent: 18 },
    { categoryId: "cat-storage", categoryName: "Storage", sharePercent: 14 },
    { categoryId: "cat-networking", categoryName: "Networking", sharePercent: 12 },
    { categoryId: "cat-components", categoryName: "Components", sharePercent: 8 },
    { categoryId: "cat-accessories", categoryName: "Accessories", sharePercent: 6 },
  ],
  broadcastActivity: [
    { label: "Mar 10", count: 18 },
    { label: "Mar 11", count: 22 },
    { label: "Mar 12", count: 15 },
    { label: "Mar 13", count: 48 },
    { label: "Mar 14", count: 30 },
    { label: "Mar 15", count: 26 },
    { label: "Mar 16", count: 34 },
  ],
  businessHours: [
    { day: "Mon - Fri", hours: "9:00 AM - 7:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 5:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
};

function supplierStub(
  id: string,
  slug: string,
  companyName: string,
  logoInitial: string,
  locationName: string,
  activeOfferCount: number,
  positiveScorePercent: number,
): SupplierProfile {
  return { ...AL_HADI, id, slug, companyName, logoInitial, locationName, activeOfferCount, positiveScorePercent };
}

const MOCK_SUPPLIERS: SupplierProfile[] = [
  AL_HADI,
  supplierStub("supplier-skyline", "skyline-general-trading", "Skyline General Trading", "S", "Bur Dubai", 410, 97),
  supplierStub("supplier-microlink", "microlink-technology", "Microlink Technology LLC", "M", "Bur Dubai", 892, 99),
  supplierStub("supplier-network-zone", "network-zone", "Network Zone FZE", "N", "Al Fahidi", 225, 98),
  supplierStub("supplier-techno-source", "techno-source", "Techno Source LLC", "T", "Bur Dubai", 310, 96),
  supplierStub("supplier-seven-seas", "seven-seas-computers", "Seven Seas Computers", "S", "Deira", 187, 99),
];

function toSummary(profile: SupplierProfile): SupplierSummary {
  const { id, slug, companyName, logoInitial, verified, locationName, activeOfferCount, positiveScorePercent } =
    profile;
  return { id, slug, companyName, logoInitial, verified, locationName, activeOfferCount, positiveScorePercent };
}

export function getMockSuppliers(): SupplierSummary[] {
  return MOCK_SUPPLIERS.map(toSummary);
}

export function getMockSupplierBySlug(slug: string): SupplierProfile | undefined {
  return MOCK_SUPPLIERS.find((supplier) => supplier.slug === slug);
}
