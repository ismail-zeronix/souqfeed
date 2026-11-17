/**
 * Which specification fields a supplier is asked for when describing a
 * product that isn't in the catalog, by top-level category slug. The six
 * keys the parser also detects (cpu, ram, storage, gpu, display, os) are
 * stored in their own columns; the rest go to `extra_specs`.
 */
export interface SpecField {
  key: string;
  label: string;
  placeholder: string;
}

export const DETECTED_SPEC_KEYS = [
  "cpu",
  "ram",
  "storage",
  "gpu",
  "display",
  "os",
] as const;

export type DetectedSpecKey = (typeof DETECTED_SPEC_KEYS)[number];

export function isDetectedSpecKey(key: string): key is DetectedSpecKey {
  return (DETECTED_SPEC_KEYS as readonly string[]).includes(key);
}

const f = (key: string, label: string, placeholder: string): SpecField => ({
  key,
  label,
  placeholder,
});

const CPU = f("cpu", "Processor", "e.g. Intel Core i7-1355U");
const RAM = f("ram", "RAM", "e.g. 16GB DDR5");
const STORAGE = f("storage", "Storage", "e.g. 512GB SSD");
const GPU = f("gpu", "Graphics", "e.g. RTX 4060 8GB");
const OS = f("os", "Operating system", "e.g. Windows 11 Pro");
const REGION = f("region", "Region / spec", "e.g. Middle East, Global, US");
const COLOR = f("color", "Colour", "e.g. Space Grey");
const RESOLUTION = f("resolution", "Resolution", "e.g. 2560×1440");

export const SPEC_TEMPLATES: Record<string, SpecField[]> = {
  laptops: [
    CPU,
    RAM,
    STORAGE,
    GPU,
    f("display", "Display", 'e.g. 14" FHD'),
    OS,
    f("keyboard", "Keyboard", "e.g. Arabic/English"),
  ],
  desktops: [CPU, RAM, STORAGE, GPU, OS],
  servers: [
    CPU,
    RAM,
    STORAGE,
    f("formFactor", "Form factor", "e.g. 1U rack"),
    f("powerSupply", "Power supply", "e.g. 2× 800W"),
  ],
  storage: [
    f("capacity", "Capacity", "e.g. 4TB"),
    f("interface", "Interface", "e.g. SATA 6Gb/s, NVMe PCIe 4.0"),
    f("formFactor", "Form factor", 'e.g. 3.5", M.2 2280'),
  ],
  components: [
    f("capacity", "Capacity / size", "e.g. 16GB, 850W"),
    f("speed", "Speed", "e.g. 3200MHz, 3.6GHz"),
    f("interface", "Socket / interface", "e.g. LGA1700, DDR5, PCIe 4.0"),
  ],
  monitors: [
    f("display", "Screen size", 'e.g. 27"'),
    RESOLUTION,
    f("panel", "Panel", "e.g. IPS"),
    f("refreshRate", "Refresh rate", "e.g. 144Hz"),
  ],
  networking: [
    f("ports", "Ports", "e.g. 24× GbE + 4× SFP+"),
    f("speed", "Speed", "e.g. 10Gbps, Wi-Fi 6"),
    f("poe", "PoE", "e.g. PoE+ 370W"),
  ],
  accessories: [
    f("connectivity", "Connectivity", "e.g. USB-C, Bluetooth"),
    COLOR,
  ],
  phones: [
    STORAGE,
    RAM,
    COLOR,
    f("network", "Network", "e.g. 5G, Dual SIM"),
    REGION,
  ],
  printers: [
    f("printType", "Print type", "e.g. Laser, Inkjet"),
    f("colour", "Mono / colour", "e.g. Colour"),
    f("functions", "Functions", "e.g. Print, scan, copy"),
  ],
  software: [
    f("licenseType", "Licence type", "e.g. Retail, OEM, Volume"),
    f("term", "Term", "e.g. Perpetual, 1 year"),
    f("users", "Users / devices", "e.g. 1 user, 5 devices"),
  ],
  security: [
    RESOLUTION,
    f("cameraType", "Type", "e.g. Dome, Bullet, PTZ"),
    f("channels", "Channels", "e.g. 16 channel"),
  ],
  "power-ups": [
    f("capacity", "Capacity", "e.g. 1500VA / 900W"),
    f("formFactor", "Form factor", "e.g. Tower, 2U rack"),
  ],
  "audio-video": [
    f("connectivity", "Connectivity", "e.g. HDMI, USB"),
    RESOLUTION,
  ],
  gaming: [STORAGE, f("edition", "Edition", "e.g. Digital, Disc"), REGION],
};

// A key shared by several templates keeps the first, most general label
// (storage's "Interface" rather than components' "Socket / interface").
const LABELS = new Map<string, string>();
for (const field of Object.values(SPEC_TEMPLATES).flat()) {
  if (!LABELS.has(field.key)) LABELS.set(field.key, field.label);
}
LABELS.set("display", "Display");

/** Spec fields for a top-level category; none for an unknown one. */
export function specTemplateFor(topLevelSlug: string | null): SpecField[] {
  return (topLevelSlug && SPEC_TEMPLATES[topLevelSlug]) || [];
}

/** A readable label for any stored spec key, e.g. "refreshRate" → "Refresh rate". */
export function specLabel(key: string): string {
  return (
    LABELS.get(key) ??
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (c) => c.toUpperCase())
  );
}
