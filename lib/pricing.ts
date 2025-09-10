export type Bundle = {
  name: string;
  price: number;
};

export type PriceGroup = {
  bundles: Bundle[];
  afa: number;
};

export const PRICES: Record<"customer" | "agent", PriceGroup> = {
  customer: {
    bundles: [
      { name: "Bundle A", price: 10 },
      { name: "Bundle B", price: 20 },
    ],
    afa: 8,
  },
  agent: {
    bundles: [
      { name: "Bundle A", price: 7 },
      { name: "Bundle B", price: 14 },
    ],
    afa: 6,
  }
};

export const UPGRADE_AGENT_FEE = 20;
