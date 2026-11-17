/**
 * The IT categories SouqFeed starts with. Seeded by
 * `src/lib/database/seed-categories.ts`, which only adds what's missing, so
 * staff can rename or extend them afterwards. Child slugs are prefixed with
 * the parent's, since slugs are unique across the whole table.
 */
export interface TaxonomyCategory {
  name: string;
  slug: string;
  children: { name: string; slug: string }[];
}

function top(
  name: string,
  slug: string,
  children: [name: string, suffix: string][],
): TaxonomyCategory {
  return {
    name,
    slug,
    children: children.map(([childName, suffix]) => ({
      name: childName,
      slug: `${slug}-${suffix}`,
    })),
  };
}

export const IT_TAXONOMY: TaxonomyCategory[] = [
  top("Laptops", "laptops", [
    ["Business Laptops", "business"],
    ["Consumer Laptops", "consumer"],
    ["Gaming Laptops", "gaming"],
    ["MacBooks", "macbooks"],
    ["Mobile Workstations", "workstations"],
    ["2-in-1 Laptops", "2-in-1"],
    ["Chromebooks", "chromebooks"],
  ]),
  top("Desktops", "desktops", [
    ["Tower PCs", "towers"],
    ["All-in-One PCs", "all-in-one"],
    ["Mini PCs", "mini"],
    ["Workstations", "workstations"],
    ["Mac Desktops", "mac"],
    ["Thin Clients", "thin-clients"],
  ]),
  top("Servers", "servers", [
    ["Rack Servers", "rack"],
    ["Tower Servers", "tower"],
    ["Blade Servers", "blade"],
    ["Server Parts & Options", "parts"],
  ]),
  top("Storage", "storage", [
    ["Internal HDD", "hdd"],
    ["Internal SSD", "ssd"],
    ["External Drives", "external"],
    ["NAS", "nas"],
    ["SAN & Enterprise Storage", "enterprise"],
    ["USB Flash Drives", "usb"],
    ["Memory Cards", "memory-cards"],
    ["Tape & Backup", "backup"],
  ]),
  top("Components", "components", [
    ["Processors (CPU)", "cpu"],
    ["Memory (RAM)", "ram"],
    ["Graphics Cards", "gpu"],
    ["Motherboards", "motherboards"],
    ["Power Supplies", "psu"],
    ["PC Cases", "cases"],
    ["Cooling", "cooling"],
    ["Laptop Parts", "laptop-parts"],
  ]),
  top("Monitors", "monitors", [
    ["Office Monitors", "office"],
    ["Gaming Monitors", "gaming"],
    ["Professional Monitors", "professional"],
    ["Large Format Displays", "large-format"],
  ]),
  top("Networking", "networking", [
    ["Switches", "switches"],
    ["Routers", "routers"],
    ["Wireless Access Points", "access-points"],
    ["Firewalls", "firewalls"],
    ["Network Cards", "network-cards"],
    ["Transceivers & Cables", "transceivers"],
    ["Racks & Cabinets", "racks"],
  ]),
  top("Accessories", "accessories", [
    ["Keyboards & Mice", "keyboards-mice"],
    ["Headsets", "headsets"],
    ["Webcams", "webcams"],
    ["Docking Stations", "docks"],
    ["Bags & Cases", "bags"],
    ["Chargers & Adapters", "chargers"],
    ["Cables", "cables"],
  ]),
  top("Phones", "phones", [
    ["Smartphones", "smartphones"],
    ["Tablets", "tablets"],
    ["IP Phones", "ip-phones"],
    ["Smartwatches", "smartwatches"],
  ]),
  top("Printers", "printers", [
    ["Laser Printers", "laser"],
    ["Inkjet Printers", "inkjet"],
    ["Multifunction Printers", "multifunction"],
    ["Label & Receipt Printers", "label"],
    ["Scanners", "scanners"],
    ["Toner & Ink", "toner-ink"],
  ]),
  top("Software", "software", [
    ["Operating Systems", "os"],
    ["Office & Productivity", "office"],
    ["Security Software", "security"],
    ["Server Software & CALs", "server"],
    ["Virtualization & Backup", "virtualization"],
  ]),
  top("Security", "security", [
    ["CCTV Cameras", "cctv"],
    ["NVR & DVR", "nvr-dvr"],
    ["Access Control", "access-control"],
    ["Intercoms", "intercoms"],
  ]),
  top("Power & UPS", "power-ups", [
    ["UPS", "ups"],
    ["PDUs", "pdu"],
    ["Batteries", "batteries"],
    ["Surge Protectors", "surge"],
  ]),
  top("Audio & Video", "audio-video", [
    ["Video Conferencing", "conferencing"],
    ["Projectors", "projectors"],
    ["Speakers", "speakers"],
    ["Headphones", "headphones"],
  ]),
  top("Gaming", "gaming", [
    ["Consoles", "consoles"],
    ["Controllers", "controllers"],
    ["Gaming Accessories", "accessories"],
  ]),
];

export const TOP_LEVEL_SLUGS = IT_TAXONOMY.map((category) => category.slug);
