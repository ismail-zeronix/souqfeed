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
  tags: [
    "Laptops",
    "Desktops",
    "Components",
    "Networking",
    "Accessories",
    "Software",
  ],
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
    {
      categoryId: "cat-networking",
      categoryName: "Networking",
      sharePercent: 12,
    },
    {
      categoryId: "cat-components",
      categoryName: "Components",
      sharePercent: 8,
    },
    {
      categoryId: "cat-accessories",
      categoryName: "Accessories",
      sharePercent: 6,
    },
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

interface SupplierStubContact {
  description: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  tags: string[];
}

function supplierStub(
  id: string,
  slug: string,
  companyName: string,
  logoInitial: string,
  locationName: string,
  activeOfferCount: number,
  positiveScorePercent: number,
  contact: SupplierStubContact,
): SupplierProfile {
  return {
    ...AL_HADI,
    id,
    slug,
    companyName,
    logoInitial,
    locationName,
    activeOfferCount,
    positiveScorePercent,
    ...contact,
  };
}

const MOCK_SUPPLIERS: SupplierProfile[] = [
  AL_HADI,
  supplierStub(
    "supplier-skyline",
    "skyline-general-trading",
    "Skyline General Trading",
    "S",
    "Bur Dubai",
    410,
    97,
    {
      description:
        "Skyline General Trading is a wholesale distributor of laptops and business PCs in Bur Dubai, serving resellers across the UAE with fast turnaround and volume pricing.",
      whatsappNumber: "+971505552001",
      phone: "+97142230011",
      email: "sales@skylinetrading.ae",
      address: "Bur Dubai, Dubai, UAE",
      googleMapsUrl:
        "https://maps.google.com/?q=Skyline+General+Trading+Bur+Dubai",
      tags: ["Laptops", "Business Series", "Bulk Orders"],
    },
  ),
  supplierStub(
    "supplier-microlink",
    "microlink-technology",
    "Microlink Technology LLC",
    "M",
    "Bur Dubai",
    892,
    99,
    {
      description:
        "Microlink Technology LLC specializes in storage, surveillance, and networking hardware, supplying integrators and CCTV installers across Dubai with genuine WD, Seagate, and Aruba stock.",
      whatsappNumber: "+971505552002",
      phone: "+97142230022",
      email: "sales@microlinktech.ae",
      address: "Bur Dubai, Dubai, UAE",
      googleMapsUrl:
        "https://maps.google.com/?q=Microlink+Technology+Bur+Dubai",
      tags: ["Storage", "Surveillance", "Networking"],
    },
  ),
  supplierStub(
    "supplier-network-zone",
    "network-zone",
    "Network Zone FZE",
    "N",
    "Al Fahidi",
    225,
    98,
    {
      description:
        "Network Zone FZE is an Al Fahidi-based networking specialist supplying access points, switches, and enterprise Wi-Fi gear to IT contractors and system integrators.",
      whatsappNumber: "+971505552003",
      phone: "+97142230033",
      email: "sales@networkzone.ae",
      address: "Al Fahidi, Dubai, UAE",
      googleMapsUrl: "https://maps.google.com/?q=Network+Zone+FZE+Al+Fahidi",
      tags: ["Networking", "Access Points", "Enterprise Wi-Fi"],
    },
  ),
  supplierStub(
    "supplier-techno-source",
    "techno-source",
    "Techno Source LLC",
    "T",
    "Bur Dubai",
    310,
    96,
    {
      description:
        "Techno Source LLC supplies desktops and workstations to corporate buyers across Dubai, with same-day quotes and bulk-order pricing on Dell and HP business lines.",
      whatsappNumber: "+971505552004",
      phone: "+97142230044",
      email: "sales@technosourcellc.ae",
      address: "Bur Dubai, Dubai, UAE",
      googleMapsUrl: "https://maps.google.com/?q=Techno+Source+LLC+Bur+Dubai",
      tags: ["Desktops", "Workstations", "Corporate Supply"],
    },
  ),
  supplierStub(
    "supplier-seven-seas",
    "seven-seas-computers",
    "Seven Seas Computers",
    "S",
    "Deira",
    187,
    99,
    {
      description:
        "Seven Seas Computers is a Deira-based Apple reseller supplying MacBooks and iOS accessories to retailers and corporate buyers across the Dubai IT wholesale market.",
      whatsappNumber: "+971505552005",
      phone: "+97142230055",
      email: "sales@sevenseascomputers.ae",
      address: "Deira, Dubai, UAE",
      googleMapsUrl: "https://maps.google.com/?q=Seven+Seas+Computers+Deira",
      tags: ["Apple", "MacBooks", "Retail Supply"],
    },
  ),
];

function toSummary(profile: SupplierProfile): SupplierSummary {
  const {
    id,
    slug,
    companyName,
    logoInitial,
    verified,
    locationName,
    activeOfferCount,
    positiveScorePercent,
  } = profile;
  return {
    id,
    slug,
    companyName,
    logoInitial,
    verified,
    locationName,
    activeOfferCount,
    positiveScorePercent,
  };
}

export function getMockSuppliers(): SupplierSummary[] {
  return MOCK_SUPPLIERS.map(toSummary);
}

export function getMockSupplierBySlug(
  slug: string,
): SupplierProfile | undefined {
  return MOCK_SUPPLIERS.find((supplier) => supplier.slug === slug);
}
