import type { Brand } from "./types";

const MOCK_BRANDS: Brand[] = [
  { id: "brand-lenovo", name: "Lenovo", slug: "lenovo" },
  { id: "brand-hp", name: "HP", slug: "hp" },
  { id: "brand-dell", name: "Dell", slug: "dell" },
  { id: "brand-apple", name: "Apple", slug: "apple" },
  { id: "brand-acer", name: "Acer", slug: "acer" },
  { id: "brand-wd", name: "WD", slug: "wd" },
  { id: "brand-aruba", name: "Aruba", slug: "aruba" },
  { id: "brand-samsung", name: "Samsung", slug: "samsung" },
  { id: "brand-cisco", name: "Cisco", slug: "cisco" },
  { id: "brand-logitech", name: "Logitech", slug: "logitech" },
];

export function getMockBrands(): Brand[] {
  return MOCK_BRANDS;
}
