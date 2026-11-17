/**
 * Brands traded in the Dubai IT wholesale market, seeded by
 * `src/lib/database/seed-brands.ts` (adds only what's missing). `categories`
 * are the top-level category slugs a brand is known for; the add-offer form
 * lists those brands first. It is a hint for ordering, never a restriction.
 */
export interface ItBrand {
  name: string;
  slug: string;
  categories: string[];
}

function brand(name: string, slug: string, categories: string): ItBrand {
  return { name, slug, categories: categories.split(" ") };
}

export const IT_BRANDS: ItBrand[] = [
  // Computers
  brand(
    "Lenovo",
    "lenovo",
    "laptops desktops servers monitors accessories phones",
  ),
  brand("HP", "hp", "laptops desktops monitors printers accessories"),
  brand("HPE", "hpe", "servers storage networking"),
  brand(
    "Dell",
    "dell",
    "laptops desktops servers monitors storage accessories",
  ),
  brand("Apple", "apple", "laptops desktops phones accessories"),
  brand("Acer", "acer", "laptops desktops monitors audio-video"),
  brand(
    "Asus",
    "asus",
    "laptops desktops monitors components networking phones gaming",
  ),
  brand("MSI", "msi", "laptops desktops monitors components gaming"),
  brand("Microsoft", "microsoft", "laptops software accessories gaming"),
  brand("Samsung", "samsung", "phones monitors storage laptops audio-video"),
  brand("LG", "lg", "monitors laptops audio-video"),
  brand("Huawei", "huawei", "phones laptops networking"),
  brand("Xiaomi", "xiaomi", "phones accessories"),
  brand("Dynabook", "dynabook", "laptops"),
  brand("Gigabyte", "gigabyte", "components laptops monitors"),
  brand("Razer", "razer", "laptops accessories gaming"),
  brand("Fujitsu", "fujitsu", "laptops desktops servers"),
  brand("Panasonic", "panasonic", "laptops phones"),
  brand("Google", "google", "phones laptops"),
  brand("OnePlus", "oneplus", "phones"),
  brand("Honor", "honor", "phones laptops"),
  // Storage and memory
  brand("WD", "wd", "storage"),
  brand("Seagate", "seagate", "storage"),
  brand("Toshiba", "toshiba", "storage laptops"),
  brand("Kingston", "kingston", "storage components"),
  brand("Crucial", "crucial", "storage components"),
  brand("SanDisk", "sandisk", "storage"),
  brand("Transcend", "transcend", "storage components"),
  brand("ADATA", "adata", "storage components"),
  brand("Lexar", "lexar", "storage"),
  brand("Synology", "synology", "storage"),
  brand("QNAP", "qnap", "storage"),
  brand("NetApp", "netapp", "storage"),
  // Components
  brand("Intel", "intel", "components networking"),
  brand("AMD", "amd", "components"),
  brand("NVIDIA", "nvidia", "components"),
  brand("Corsair", "corsair", "components accessories gaming"),
  brand("G.Skill", "g-skill", "components"),
  brand("ASRock", "asrock", "components"),
  brand("Cooler Master", "cooler-master", "components accessories"),
  brand("Thermaltake", "thermaltake", "components"),
  brand("NZXT", "nzxt", "components"),
  brand("Sapphire", "sapphire", "components"),
  // Monitors and displays
  brand("BenQ", "benq", "monitors audio-video"),
  brand("ViewSonic", "viewsonic", "monitors audio-video"),
  brand("AOC", "aoc", "monitors"),
  brand("Philips", "philips", "monitors accessories"),
  // Networking
  brand("Cisco", "cisco", "networking phones"),
  brand("Aruba", "aruba", "networking"),
  brand("Ubiquiti", "ubiquiti", "networking security"),
  brand("TP-Link", "tp-link", "networking"),
  brand("D-Link", "d-link", "networking"),
  brand("Netgear", "netgear", "networking"),
  brand("MikroTik", "mikrotik", "networking"),
  brand("Juniper", "juniper", "networking"),
  brand("Fortinet", "fortinet", "networking"),
  brand("Sophos", "sophos", "networking software"),
  brand("Palo Alto Networks", "palo-alto-networks", "networking"),
  brand("SonicWall", "sonicwall", "networking"),
  brand("Ruckus", "ruckus", "networking"),
  brand("Zyxel", "zyxel", "networking"),
  brand("Linksys", "linksys", "networking"),
  brand("Extreme Networks", "extreme-networks", "networking"),
  // Accessories, audio and conferencing
  brand("Logitech", "logitech", "accessories audio-video gaming"),
  brand("Jabra", "jabra", "accessories audio-video"),
  brand("Poly", "poly", "audio-video phones accessories"),
  brand("Yealink", "yealink", "phones audio-video"),
  brand("Grandstream", "grandstream", "phones networking"),
  brand("Targus", "targus", "accessories"),
  brand("Belkin", "belkin", "accessories"),
  brand("Anker", "anker", "accessories"),
  brand("Ugreen", "ugreen", "accessories"),
  brand("Sony", "sony", "audio-video gaming phones"),
  brand("JBL", "jbl", "audio-video"),
  brand("Bose", "bose", "audio-video"),
  brand("Epson", "epson", "printers audio-video"),
  // Printers
  brand("Canon", "canon", "printers audio-video"),
  brand("Brother", "brother", "printers"),
  brand("Xerox", "xerox", "printers"),
  brand("Ricoh", "ricoh", "printers"),
  brand("Kyocera", "kyocera", "printers"),
  brand("Zebra", "zebra", "printers"),
  // Security
  brand("Hikvision", "hikvision", "security"),
  brand("Dahua", "dahua", "security"),
  brand("Uniview", "uniview", "security"),
  brand("Axis", "axis", "security"),
  brand("ZKTeco", "zkteco", "security"),
  // Power
  brand("APC", "apc", "power-ups"),
  brand("Eaton", "eaton", "power-ups"),
  brand("Vertiv", "vertiv", "power-ups"),
  brand("CyberPower", "cyberpower", "power-ups"),
  // Software
  brand("Adobe", "adobe", "software"),
  brand("Kaspersky", "kaspersky", "software"),
  brand("ESET", "eset", "software"),
  brand("Bitdefender", "bitdefender", "software"),
  brand("Veeam", "veeam", "software"),
  brand("VMware", "vmware", "software"),
  brand("Autodesk", "autodesk", "software"),
  // Gaming
  brand("Nintendo", "nintendo", "gaming"),
];

/** Brand slug → the top-level categories it's known for. */
export const BRAND_CATEGORY_HINTS: ReadonlyMap<string, readonly string[]> =
  new Map(IT_BRANDS.map((item) => [item.slug, item.categories]));
