import {
  AppWindow,
  BatteryCharging,
  Cctv,
  Cpu,
  Gamepad2,
  HardDrive,
  Laptop,
  Monitor,
  Mouse,
  Network,
  Package,
  PcCase,
  Printer,
  Server,
  Smartphone,
  Speaker,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  laptops: Laptop,
  desktops: PcCase,
  servers: Server,
  storage: HardDrive,
  components: Cpu,
  monitors: Monitor,
  networking: Network,
  accessories: Mouse,
  phones: Smartphone,
  printers: Printer,
  software: AppWindow,
  security: Cctv,
  "power-ups": BatteryCharging,
  "audio-video": Speaker,
  gaming: Gamepad2,
};

/** The icon for a top-level category; a box for ones staff added. */
export function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS[slug] ?? Package;
  return <Icon className={className} aria-hidden />;
}
