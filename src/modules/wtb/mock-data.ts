/**
 * Illustrative want-to-buy requests. Real buyer requests are a post-launch
 * feature (no table yet), so the /wtb page shows these with a "sample" notice
 * and never presents them as real demand.
 */
export interface SampleWtbRequest {
  id: string;
  title: string;
  categoryName: string;
  quantity: number | null;
  condition: "New" | "Refurbished" | "Any";
  location: string;
  tag: "Urgent" | "Corporate" | null;
  postedLabel: string;
  note: string | null;
}

const SAMPLE_REQUESTS: SampleWtbRequest[] = [
  {
    id: "wtb-1",
    title: "iPhone 15 Pro Max 256GB",
    categoryName: "Phones",
    quantity: 20,
    condition: "New",
    location: "Dubai",
    tag: null,
    postedLabel: "5m ago",
    note: "Sealed boxes, UAE or international spec.",
  },
  {
    id: "wtb-2",
    title: "NVIDIA RTX 4080 / 4090",
    categoryName: "Components",
    quantity: 6,
    condition: "New",
    location: "Deira",
    tag: "Urgent",
    postedLabel: "12m ago",
    note: "Need this week.",
  },
  {
    id: "wtb-3",
    title: "Cisco Catalyst 24-port switches",
    categoryName: "Networking",
    quantity: 10,
    condition: "Any",
    location: "Dubai",
    tag: null,
    postedLabel: "28m ago",
    note: null,
  },
  {
    id: "wtb-4",
    title: "Dell Latitude laptops, Core i7",
    categoryName: "Laptops",
    quantity: 40,
    condition: "Refurbished",
    location: "Business Bay",
    tag: "Corporate",
    postedLabel: "41m ago",
    note: "16GB RAM minimum, 512GB SSD.",
  },
  {
    id: "wtb-5",
    title: "Seagate IronWolf 8TB drives",
    categoryName: "Storage",
    quantity: 12,
    condition: "New",
    location: "Al Rigga",
    tag: null,
    postedLabel: "1h ago",
    note: null,
  },
  {
    id: "wtb-6",
    title: "HP LaserJet Pro M404dn",
    categoryName: "Printers",
    quantity: 8,
    condition: "New",
    location: "Dubai",
    tag: null,
    postedLabel: "2h ago",
    note: null,
  },
  {
    id: "wtb-7",
    title: "Ubiquiti UniFi access points",
    categoryName: "Networking",
    quantity: 25,
    condition: "New",
    location: "Sharjah",
    tag: "Corporate",
    postedLabel: "3h ago",
    note: "For a hotel fit-out.",
  },
  {
    id: "wtb-8",
    title: "MacBook Air M3 13-inch",
    categoryName: "Laptops",
    quantity: 5,
    condition: "New",
    location: "Dubai",
    tag: "Urgent",
    postedLabel: "4h ago",
    note: null,
  },
];

export function getSampleWtbRequests(): SampleWtbRequest[] {
  return SAMPLE_REQUESTS;
}

export function wtbCategories(requests: SampleWtbRequest[]): string[] {
  return [...new Set(requests.map((request) => request.categoryName))].sort();
}
