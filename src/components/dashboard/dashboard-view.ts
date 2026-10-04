export function getDashboardCopy(role: string) {
  if (role === "SUPPLIER") {
    return {
      eyebrow: "Seller workspace",
      title: "Keep your stock moving.",
      description:
        "See your market presence at a glance and share fresh inventory with active buyers.",
      primaryAction: "List your stock",
      secondaryAction: "View market",
    };
  }
  return {
    eyebrow: "Buyer workspace",
    title: "Source with a clearer view.",
    description:
      "Track the market, revisit useful offers, and find the right supplier faster.",
    primaryAction: "Browse live market",
    secondaryAction: "Explore suppliers",
  };
}
