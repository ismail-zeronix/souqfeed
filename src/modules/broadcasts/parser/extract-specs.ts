import type { LineScanner } from "./line-scanner";

// Boundaries that treat letters and digits as word characters.
const B = String.raw`(?<![A-Z0-9])`;
const E = String.raw`(?![A-Z0-9])`;

const titleCase = (word: string) =>
  word.charAt(0) + word.slice(1).toLowerCase();

const GENERATION =
  /(?<![A-Z0-9])(\d{1,2})\s*(?:TH|ST|ND|RD)\s*GEN(?:ERATION)?(?![A-Z])/;

function withGeneration(scanner: LineScanner, cpu: string): string {
  const generation = scanner.take(GENERATION);
  return generation ? `${cpu} (${Number(generation[1])}th Gen)` : cpu;
}

type CpuRule = {
  pattern: RegExp;
  format: (match: RegExpExecArray, scanner: LineScanner) => string;
  /** Only tried when this is present somewhere in the line. */
  requires?: RegExp;
};

const CPU_RULES: CpuRule[] = [
  {
    // Core Ultra 7 155H, Ultra 5-125H, CORE ULTRA-7 155U, CORE ULTRA5-226V
    pattern: new RegExp(
      String.raw`(?:INTEL\s*)?(?:CORE\s*)?ULTRA\s*-?\s*([579])(?:\s*-?\s*(\d{3}[A-Z]{1,2}))?${E}`,
    ),
    format: (m) => `Intel Core Ultra ${m[1]}${m[2] ? ` ${m[2]}` : ""}`,
  },
  {
    // U7 155H (shorthand for Core Ultra)
    pattern: new RegExp(
      String.raw`${B}U([579])(?:\s*-?\s*(\d{3}[A-Z]{1,2}))?${E}`,
    ),
    format: (m) => `Intel Core Ultra ${m[1]}${m[2] ? ` ${m[2]}` : ""}`,
  },
  {
    // Core 5 120U, CORE5-120U (Core Series 1/2, needs the model number)
    pattern: new RegExp(
      String.raw`(?:INTEL\s*)?CORE\s*-?\s*([357])\s*-?\s*(\d{3}[A-Z]{1,2})${E}`,
    ),
    format: (m) => `Intel Core ${m[1]} ${m[2]}`,
  },
  {
    // i5-1235U, Core i7 1355U, I3-N305, i5 11th Gen, i7
    pattern: new RegExp(
      String.raw`(?:INTEL\s*)?(?:CORE\s*)?${B}I([3579])(?:\s*-?\s*(\d{4,5}[A-Z]{0,2}\d?|N\d{3}))?${E}`,
    ),
    format: (m, scanner) =>
      m[2]
        ? `Intel Core i${m[1]}-${m[2]}`
        : withGeneration(scanner, `Intel Core i${m[1]}`),
  },
  {
    // Ryzen AI 9 HX 370
    pattern: new RegExp(
      String.raw`(?:AMD\s*)?RYZEN\s*AI\s*([579])\s*(?:(HX|PRO)\s*)?(\d{3})${E}`,
    ),
    format: (m) => `AMD Ryzen AI ${m[1]}${m[2] ? ` ${m[2]}` : ""} ${m[3]}`,
  },
  {
    // Ryzen 5 7530U, Ryzen 7 PRO 7840U, Ryzen 5
    pattern: new RegExp(
      String.raw`(?:AMD\s*)?RYZEN\s*([3579])(?:\s*-?\s*(PRO\s*)?(\d{4}[A-Z]{0,3}))?${E}`,
    ),
    format: (m) =>
      `AMD Ryzen ${m[1]}${m[2] ? " PRO" : ""}${m[3] ? ` ${m[3]}` : ""}`,
  },
  {
    // R5 5600U (bare "R5" needs the model number)
    pattern: new RegExp(String.raw`${B}R([3579])\s*-?\s*(\d{4}[A-Z]{1,3})${E}`),
    format: (m) => `AMD Ryzen ${m[1]} ${m[2]}`,
  },
  {
    // Apple M2, M3 Pro, M4 Max (only on Apple lines)
    pattern: new RegExp(
      String.raw`(?<![A-Z0-9.])M([1-5])(?:\s*(PRO|MAX|ULTRA))?${E}`,
    ),
    requires: /MACBOOK|IMAC|MAC\s*(?:MINI|STUDIO)|APPLE|IPAD/,
    format: (m) => `Apple M${m[1]}${m[2] ? ` ${titleCase(m[2])}` : ""}`,
  },
  {
    // Celeron N4500, Pentium Silver N6000, Xeon W-2245, Athlon Silver 7120U
    pattern: new RegExp(
      String.raw`(?:INTEL\s*|AMD\s*)?(CELERON|PENTIUM(?:\s*(?:SILVER|GOLD))?|XEON|ATHLON(?:\s*(?:SILVER|GOLD))?)(?:\s*-?\s*([A-Z]{0,2}-?\d{3,5}[A-Z]{0,2}\d?))?${E}`,
    ),
    format: (m) => {
      const family = m[1].split(/\s+/).map(titleCase).join(" ");
      const maker = family.startsWith("Athlon") ? "AMD" : "Intel";
      return `${maker} ${family}${m[2] ? ` ${m[2]}` : ""}`;
    },
  },
  {
    // Snapdragon X Elite / X Plus
    pattern:
      /(?:QUALCOMM\s*)?SNAPDRAGON(?:\s*(X\s*(?:ELITE|PLUS)|X\d?))?(?![A-Z0-9])/,
    format: (m) =>
      `Qualcomm Snapdragon${m[1] ? ` ${m[1].replace(/\s+/g, " ").split(" ").map(titleCase).join(" ").replace(/^x/, "X")}` : ""}`,
  },
];

export function extractCpu(scanner: LineScanner): string | null {
  for (const rule of CPU_RULES) {
    if (rule.requires && !scanner.has(rule.requires)) continue;
    const match = scanner.take(rule.pattern);
    if (match) return rule.format(match, scanner);
  }
  return null;
}

const VRAM = String.raw`(?:\s*[-,]?\s*(\d{1,2})\s*GB)?`;

const GPU_RULES: { pattern: RegExp; format: (m: RegExpExecArray) => string }[] =
  [
    {
      // RTX 4060, RTX3050 4GB, GTX 1650 Ti, RTX A2000
      pattern: new RegExp(
        String.raw`(?:NVIDIA\s*)?(?:GEFORCE\s*)?(RTX|GTX)\s*-?\s*(A?\d{3,4})(?:\s*(TI|SUPER))?${E}${VRAM}`,
      ),
      format: (m) =>
        `NVIDIA ${m[1]} ${m[2]}${m[3] ? ` ${titleCase(m[3])}` : ""}${m[4] ? ` ${m[4]}GB` : ""}`,
    },
    {
      // RX 7600S, Radeon RX 6500M 4GB
      pattern: new RegExp(
        String.raw`(?:AMD\s*)?(?:RADEON\s*)?${B}RX\s*-?\s*(\d{3,4})(XT|M|S)?${E}${VRAM}`,
      ),
      format: (m) =>
        `AMD Radeon RX ${m[1]}${m[2] ?? ""}${m[3] ? ` ${m[3]}GB` : ""}`,
    },
    {
      // MX550
      pattern: new RegExp(
        String.raw`(?:NVIDIA\s*)?(?:GEFORCE\s*)?${B}MX\s*(\d{3})${E}${VRAM}`,
      ),
      format: (m) => `NVIDIA MX${m[1]}${m[2] ? ` ${m[2]}GB` : ""}`,
    },
    {
      // Quadro T1000, NVIDIA T500, NVIDIA A1000
      pattern: new RegExp(
        String.raw`(?:NVIDIA\s*QUADRO|QUADRO|NVIDIA)\s*([TAP]?\d{3,4})${E}${VRAM}`,
      ),
      format: (m) => `NVIDIA ${m[1]}${m[2] ? ` ${m[2]}GB` : ""}`,
    },
    {
      // 4GB graphics / 2GB VGA
      pattern: new RegExp(
        String.raw`${B}(\d{1,2})\s*GB\s*(?:DEDICATED\s*)?(?:GRAPHICS|VGA|GPU)${E}`,
      ),
      format: (m) => `${m[1]}GB graphics`,
    },
  ];

export function extractGpu(scanner: LineScanner): string | null {
  for (const rule of GPU_RULES) {
    const match = scanner.take(rule.pattern);
    if (match) return rule.format(match);
  }
  return null;
}

const RAM_SIZES = new Set([
  2, 3, 4, 6, 8, 12, 16, 18, 20, 24, 32, 36, 40, 48, 64, 96, 128,
]);

function storageType(word: string | undefined): string {
  if (!word) return "";
  if (word === "NVME") return " NVMe";
  if (word.startsWith("M")) return " M.2";
  if (word === "STORAGE") return "";
  return ` ${word}`;
}

/**
 * Storage size from a number and optional unit. Without a unit, 32 and up is
 * GB and 1–8 is TB (as in "16/1"); anything else is too ambiguous to read.
 */
function storageSize(value: string, unit: string | undefined): string | null {
  const amount = Number(value);
  if (unit === "TB" || unit === "T")
    return amount > 0 && amount <= 16 ? `${amount}TB` : null;
  if (unit === "GB") return amount >= 16 ? `${amount}GB` : null;
  if (amount >= 32 && amount <= 8192) return `${amount}GB`;
  if (amount >= 1 && amount <= 8 && Number.isInteger(amount))
    return `${amount}TB`;
  return null;
}

const STORAGE_WORD = String.raw`SSD|HDD|NVME|EMMC|M\.2|STORAGE`;

export function extractMemory(scanner: LineScanner): {
  ram: string | null;
  storage: string | null;
} {
  let ram: string | null = null;
  let storage: string | null = null;

  // 16/512, 8+256, 16GB/1TB SSD, 16 GB RAM / 512 SSD
  for (const match of scanner.findAll(
    new RegExp(
      String.raw`(?<![\d.])(\d{1,3})\s*(?:GB)?\s*(?:RAM)?\s*[\/+]\s*(\d{1,4}(?:\.\d)?)\s*(GB|TB|T)?\s*(${STORAGE_WORD})?${E}`,
    ),
  )) {
    const size = storageSize(match[2], match[3]);
    if (!RAM_SIZES.has(Number(match[1])) || !size) continue;
    scanner.claim(match);
    ram = `${Number(match[1])}GB`;
    storage = `${size}${storageType(match[4])}`;
    break;
  }

  // 16GB DDR5 RAM, RAM: 16GB, 16GB DDR4
  if (!ram) {
    const explicit =
      scanner.take(
        new RegExp(
          String.raw`(?<![\d.])(\d{1,3})\s*GB\s*(?:((?:LP)?DDR\s*\dX?)\s*)?(?:RAM|MEMORY)(?![A-Z])`,
        ),
      ) ??
      scanner.take(
        /(?:RAM|MEMORY)\s*[:\-]?\s*(\d{1,3})\s*GB(?:\s*((?:LP)?DDR\s*\dX?))?(?![A-Z0-9])/,
      ) ??
      scanner.take(
        /(?<![\d.])(\d{1,3})\s*GB\s*((?:LP)?DDR\s*\dX?)(?![A-Z0-9])/,
      );
    if (explicit && RAM_SIZES.has(Number(explicit[1]))) {
      ram = `${Number(explicit[1])}GB${explicit[2] ? ` ${explicit[2].replace(/\s+/g, "")}` : ""}`;
    }
  }

  // 256SSD, 1TBSSD, 512 GB SSD, SSD 512GB
  if (!storage) {
    for (const match of scanner.findAll(
      new RegExp(
        String.raw`(?<![\d.])(\d{1,4}(?:\.\d)?)\s*(GB|TB|T)?\s*(${STORAGE_WORD})${E}`,
      ),
    )) {
      const size = storageSize(match[1], match[2]);
      if (!size) continue;
      scanner.claim(match);
      storage = `${size}${storageType(match[3])}`;
      break;
    }
  }
  if (!storage) {
    const before = scanner.find(
      new RegExp(
        String.raw`(SSD|HDD|NVME)\s*[:\-]?\s*(\d{1,4}(?:\.\d)?)\s*(GB|TB)${E}`,
      ),
    );
    const size = before && storageSize(before[2], before[3]);
    if (before && size) {
      scanner.claim(before);
      storage = `${size}${storageType(before[1])}`;
    }
  }

  // Bare sizes: 1TB is storage; a small GB value is RAM, a large one storage.
  if (!storage) {
    const terabytes = scanner.take(/(?<![\d.])(\d(?:\.\d)?)\s*TB(?![A-Z0-9])/);
    if (terabytes) storage = `${Number(terabytes[1])}TB`;
  }
  for (const match of scanner.findAll(/(?<![\d.])(\d{1,4})\s*GB(?![A-Z0-9])/)) {
    const amount = Number(match[1]);
    if (!ram && RAM_SIZES.has(amount) && amount <= 64) {
      scanner.claim(match);
      ram = `${amount}GB`;
    } else if (!storage && amount >= 128 && amount <= 8192) {
      scanner.claim(match);
      storage = `${amount}GB`;
    }
  }

  return { ram, storage };
}

const DISPLAY_WORDS: [RegExp, string][] = [
  [/^FULL\s*HD$/, "FHD"],
  [/^TOUCH(?:SCREEN)?$/, "Touch"],
  [/^(\d{2,3})\s*HZ$/, "$1Hz"],
];

export function extractDisplay(scanner: LineScanner): string | null {
  const parts: string[] = [];

  const size =
    scanner.take(
      // Not a bare "IN": "20 in stock" is a quantity, not a 20" screen.
      /(?<![\d.])(1\d|2\d|3[0-4])(\.\d)?\s*(?:"|”|“|''|INCH(?:ES)?(?![A-Z]))/,
    ) ??
    // A bare laptop size like 15.6 or 13.3, once prices and specs are gone.
    scanner.take(
      /(?<![\d.,])(1[0-8])(\.\d)(?![\d.,%])(?!\s*(?:GB|TB|GHZ|K\b))/,
    );
  if (size) parts.push(`${size[1]}${size[2] ?? ""}"`);

  for (const match of scanner.findAll(
    /(?<![A-Z0-9.])(FHD\+?|FULL\s*HD|QHD\+?|UHD|4K|2(?:\.[58])?K|3K|WUXGA|WQXGA|OLED|IPS|TOUCH(?:SCREEN)?|\d{2,3}\s*HZ)(?![A-Z0-9])/,
  )) {
    scanner.claim(match);
    let word = match[1].replace(/\s+/g, " ");
    for (const [pattern, replacement] of DISPLAY_WORDS) {
      if (pattern.test(word)) word = word.replace(pattern, replacement);
    }
    if (!parts.includes(word)) parts.push(word);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

const WINDOWS_EDITION: Record<string, string> = {
  PRO: " Pro",
  P: " Pro",
  HOME: " Home",
  H: " Home",
};

export function extractOs(scanner: LineScanner): string | null {
  const windows =
    scanner.take(
      new RegExp(
        String.raw`${B}(?:WINDOWS|WIN)\s*-?\s*(10|11)\s*(PRO|HOME|P|H)?${E}`,
      ),
    ) ??
    scanner.take(new RegExp(String.raw`${B}W(10|11)\s*(PRO|HOME|P|H)?${E}`));
  if (windows) {
    return `Windows ${windows[1]}${windows[2] ? WINDOWS_EDITION[windows[2]] : ""}`;
  }
  if (scanner.take(new RegExp(String.raw`${B}(?:FREE\s*)?DOS${E}`)))
    return "DOS";
  if (scanner.take(/MAC\s*OS(?![A-Z])/)) return "macOS";
  if (scanner.take(/CHROME\s*OS(?![A-Z])/)) return "ChromeOS";
  const linux = scanner.take(new RegExp(String.raw`${B}(UBUNTU|LINUX)${E}`));
  if (linux) return titleCase(linux[1]);
  return null;
}
