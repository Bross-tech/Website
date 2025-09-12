export type Bundle = {
  network: string;
  size: string;
  price: number;
};

export type PriceGroup = {
  bundles: Bundle[];
  afa: number;
};

export const PRICES: Record<"customer" | "agent", PriceGroup> = {
  customer: {
    bundles: [
      // MTN Customer Bundles
      { network: "MTN", size: "1GB", price: 5.20 },
      { network: "MTN", size: "2GB", price: 10.20 },
      { network: "MTN", size: "3GB", price: 15.20 },
      { network: "MTN", size: "4GB", price: 20.20 },
      { network: "MTN", size: "5GB", price: 24.80 },
      { network: "MTN", size: "6GB", price: 28.20 },
      { network: "MTN", size: "7GB", price: 33.20 },
      { network: "MTN", size: "8GB", price: 36.80 },
      { network: "MTN", size: "10GB", price: 43.00 },
      { network: "MTN", size: "15GB", price: 66.00 },
      { network: "MTN", size: "20GB", price: 84.00 },
      { network: "MTN", size: "25GB", price: 104.00 },
      { network: "MTN", size: "30GB", price: 124.00 },
      { network: "MTN", size: "40GB", price: 159.00 },
      { network: "MTN", size: "50GB", price: 200.00 },
      { network: "MTN", size: "100GB", price: 379.00 },

      // Telecel Customer Bundles
      { network: "Telecel", size: "5GB", price: 24.70 },
      { network: "Telecel", size: "10GB", price: 41.00 },
      { network: "Telecel", size: "15GB", price: 59.00 },
      { network: "Telecel", size: "20GB", price: 79.00 },
      { network: "Telecel", size: "25GB", price: 98.00 },
      { network: "Telecel", size: "30GB", price: 111.00 },
      { network: "Telecel", size: "40GB", price: 145.00 },
      { network: "Telecel", size: "50GB", price: 186.00 },
      { network: "Telecel", size: "100GB", price: 354.00 },

      // Tigo iShare Customer Bundles
      { network: "Tigo", size: "1GB", price: 4.80 },
      { network: "Tigo", size: "2GB", price: 8.60 },
      { network: "Tigo", size: "3GB", price: 12.40 },
      { network: "Tigo", size: "4GB", price: 16.90 },
      { network: "Tigo", size: "5GB", price: 21.50 },
      { network: "Tigo", size: "6GB", price: 27.40 },
      { network: "Tigo", size: "7GB", price: 28.40 },
      { network: "Tigo", size: "8GB", price: 34.20 },
      { network: "Tigo", size: "9GB", price: 37.00 },
      { network: "Tigo", size: "10GB", price: 40.50 },

      // Togo Big-Time Customer Bundles
      { network: "Togo", size: "15GB", price: 56.30 },
      { network: "Togo", size: "20GB", price: 67.00 },
      { network: "Togo", size: "25GB", price: 72.20 },
      { network: "Togo", size: "30GB", price: 77.20 },
      { network: "Togo", size: "40GB", price: 87.20 },
      { network: "Togo", size: "50GB", price: 97.00 },
      { network: "Togo", size: "60GB", price: 137.20 },
      { network: "Togo", size: "100GB", price: 203.20 },
      { network: "Togo", size: "200GB", price: 375.20 },
    ],
    afa: 8, // Customer AFA registration
  },
  agent: {
    bundles: [
      // MTN Agent Bundles
      { network: "MTN", size: "1GB", price: 5.20 },
      { network: "MTN", size: "2GB", price: 10.20 },
      { network: "MTN", size: "3GB", price: 15.20 },
      { network: "MTN", size: "4GB", price: 20.20 },
      { network: "MTN", size: "5GB", price: 24.80 },
      { network: "MTN", size: "6GB", price: 28.20 },
      { network: "MTN", size: "7GB", price: 33.20 },
      { network: "MTN", size: "8GB", price: 36.80 },
      { network: "MTN", size: "10GB", price: 43.00 },
      { network: "MTN", size: "15GB", price: 66.00 },
      { network: "MTN", size: "20GB", price: 84.00 },
      { network: "MTN", size: "25GB", price: 104.00 },
      { network: "MTN", size: "30GB", price: 124.00 },
      { network: "MTN", size: "40GB", price: 159.00 },
      { network: "MTN", size: "50GB", price: 200.00 },
      { network: "MTN", size: "100GB", price: 379.00 },

      // Telecel Agent Bundles
      { network: "Telecel", size: "5GB", price: 24.70 },
      { network: "Telecel", size: "10GB", price: 41.00 },
      { network: "Telecel", size: "15GB", price: 59.00 },
      { network: "Telecel", size: "20GB", price: 79.00 },
      { network: "Telecel", size: "25GB", price: 98.00 },
      { network: "Telecel", size: "30GB", price: 111.00 },
      { network: "Telecel", size: "40GB", price: 145.00 },
      { network: "Telecel", size: "50GB", price: 186.00 },
      { network: "Telecel", size: "100GB", price: 354.00 },

      // Tigo iShare Agent Bundles
      { network: "Tigo", size: "1GB", price: 4.80 },
      { network: "Tigo", size: "2GB", price: 8.60 },
      { network: "Tigo", size: "3GB", price: 12.40 },
      { network: "Tigo", size: "4GB", price: 16.90 },
      { network: "Tigo", size: "5GB", price: 21.50 },
      { network: "Tigo", size: "6GB", price: 27.40 },
      { network: "Tigo", size: "7GB", price: 28.40 },
      { network: "Tigo", size: "8GB", price: 34.20 },
      { network: "Tigo", size: "9GB", price: 37.00 },
      { network: "Tigo", size: "10GB", price: 40.50 },

      // Togo Big-Time Agent Bundles
      { network: "Togo", size: "15GB", price: 56.30 },
      { network: "Togo", size: "20GB", price: 67.00 },
      { network: "Togo", size: "25GB", price: 72.20 },
      { network: "Togo", size: "30GB", price: 77.20 },
      { network: "Togo", size: "40GB", price: 87.20 },
      { network: "Togo", size: "50GB", price: 97.00 },
      { network: "Togo", size: "60GB", price: 137.20 },
      { network: "Togo", size: "100GB", price: 203.20 },
      { network: "Togo", size: "200GB", price: 375.20 },
    ],
    afa: 6, // Agent AFA registration
  },
};

// Upgrade fee to become an agent
export const UPGRADE_AGENT_FEE = 20;
