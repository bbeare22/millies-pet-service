// data/services.ts
export type ServiceItem = {
  name: string;
  description: string;
  price: string;      
  duration: string;   
};

export const SERVICES: ServiceItem[] = [
  // Walks
  {
    name: "Dog Walk (20 min)",
    description: "Leashed neighborhood walk. 2 dogs $25.50",
    price: "$17.00",
    duration: "20 minutes",
  },
  {
    name: "Dog Walk (30 min)",
    description: "A brisk 30-minute walk. 2 dogs $39.00",
    price: "$22.00",
    duration: "30 minutes",
  },
  {
    name: "Dog Walk (60 min)",
    description: "Full-hour walk for high-energy pups. 2 dogs $48.00",
    price: "$32.00",
    duration: "60 minutes",
  },

  // Drop-ins
  {
    name: "Drop-in (20 min)",
    description:
      "Quick drop-in to make sure dog or cat has fresh water and food. Backyard potty break.",
    price: "$15.00",
    duration: "20 minutes",
  },
  {
    name: "Drop-in (30 min)",
    description:
      "Drop-in with extra time for play and care. Includes water/food top-up and litter pan clean-up.",
    price: "$20.00",
    duration: "30 minutes",
  },
  {
    name: "Drop-in (60 min)",
    description:
      "Extended drop-in for extra attention and enrichment. Includes water/food top-up and clean-up.",
    price: "$30.00",
    duration: "60 minutes",
  },

  // Sitting
  {
    name: "Sitting (overnight, pet parent’s home)",
    description:
      "Overnight care in your home. $38 per night. Additional pets $22 each.",
    price: "$38.00 / night",
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
