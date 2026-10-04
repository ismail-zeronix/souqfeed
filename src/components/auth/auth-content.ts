export const authRoleContent = {
  buyer: {
    label: "Buyer",
    title: "Buy with confidence",
    description:
      "Find the right stock faster with a live view of the UAE IT wholesale market.",
    features: [
      "Compare current supplier offers",
      "Save time on repetitive sourcing",
      "Contact suppliers directly",
    ],
    cta: "Create buyer account",
  },
  seller: {
    label: "Seller",
    title: "Reach ready buyers",
    description:
      "Put your inventory in front of active IT buyers who are sourcing right now.",
    features: [
      "Broadcast live stock updates",
      "Reach buyers across the UAE",
      "Build a trusted supplier profile",
    ],
    cta: "Create seller account",
  },
} as const;

export type AuthRole = keyof typeof authRoleContent;
