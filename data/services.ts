// data/services.ts
export type ServiceItem = {
  name: string;
  description: string;
  price: string;      
  duration: string;   
};

export const SERVICES: ServiceItem[] = [
  // Walks (Up to 2 pets)
  {
    name: "Dog Walk (20 min)",
    description: "Leashed neighborhood walk. Up to 2 pets. Additional pets $5.00.",
    price: "$22.00",
    duration: "20 minutes",
  },
  {
    name: "Dog Walk (30 min)",
    description: "A brisk 30-minute walk. Up to 2 pets. Additional pets $5.00.",
    price: "$26.00",
    duration: "30 minutes",
  },
  {
    name: "Dog Walk (60 min)",
    description: "Full-hour walk for high-energy pups. Up to 2 pets. Additional pets $5.00.",
    price: "$34.00",
    duration: "60 minutes",
  },

  // Drop-ins (Up to 2 pets)
  {
    name: "Drop-in (20 min)",
    description:
      "Quick drop-in to refresh water, food, and potty break. Up to 2 pets. Additional pets $3.00.",
    price: "$20.00",
    duration: "20 minutes",
  },
  {
    name: "Drop-in (30 min)",
    description:
      "Drop-in with extra time for attention, play, and clean-up. Up to 2 pets. Additional pets $3.00.",
    price: "$25.00",
    duration: "30 minutes",
  },
  {
    name: "Drop-in (60 min)",
    description:
      "Extended drop-in for extra enrichment and care. Up to 2 pets. Additional pets $3.00.",
    price: "$30.00",
    duration: "60 minutes",
  },

  // Sitting
  {
    name: "Sitting (overnight, pet parent’s home)",
    description:
      "Overnight sitting in your home. Up to 2 pets included. Additional pets $10.00 each.",
    price: "$40.00 / night",
    duration: "Overnight",
  },

  // Add-ons
  {
    name: "Transport",
    description: "Local pickup or drop-off up to 10 miles (per each way).",
    price: "$7.00 each way",
    duration: "Varies",
  },
  {
    name: "Administration of Meds",
    description: "Simple medication administration per visit.",
    price: "$5.00 per visit",
    duration: "Varies",
  },
];
