import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CATALOG = [
  // Dog Walks
  {
    name: "Dog Walk (20 min)",
    description: "Leashed neighborhood walk. 2 dogs $25.50.",
    priceCents: 1700,
    durationMin: 20,
    isActive: true,
  },
  {
    name: "Dog Walk (30 min)",
    description: "A brisk 30-minute walk. 2 dogs $39.00.",
    priceCents: 2200,
    durationMin: 30,
    isActive: true,
  },
  {
    name: "Dog Walk (60 min)",
    description: "Full-hour walk for high-energy pups. 2 dogs $48.00.",
    priceCents: 3200,
    durationMin: 60,
    isActive: true,
  },

  // Potty Breaks
  {
    name: "Potty Break (20 min)",
    description:
      "Quick drop-in to make sure dog/cat has fresh water and food. Backyard potty break; 30/60 min drop-ins include playtime, cuddles, and litter pan clean-up.",
    priceCents: 1500,
    durationMin: 20,
    isActive: true,
  },
  {
    name: "Potty Break (30 min)",
    description:
      "Quick drop-in with extra time for play/care. Includes water/food top-up and litter pan clean-up.",
    priceCents: 2000,
    durationMin: 30,
    isActive: true,
  },
  {
    name: "Potty Break (60 min)",
    description:
      "Extended drop-in for extra attention and enrichment. Water/food top-up and clean-up included.",
    priceCents: 3000,
    durationMin: 60,
    isActive: true,
  },

  // Overnight
  {
    name: "Boarding (Millie’s home)",
    description:
      "Overnight at Millie’s home. $25/night. Additional dogs $18 each (up to 3). Pets must be picked up by 11:59pm.",
    priceCents: 2500,
    durationMin: 720,
    isActive: true,
  },
  {
    name: "Sitting (Pet parents’ home)",
    description:
      "Overnight at your home. $30/night. Additional dogs $23 each. Pets must be picked up by 11:59pm.",
    priceCents: 3000,
    durationMin: 720,
    isActive: true,
  },

  // Add-ons (durationMin = 0)
  {
    name: "Dog pickup / drop-off (each way, up to 10 miles)",
    description: "Convenient transport for your pet(s).",
    priceCents: 700,
    durationMin: 0,
    isActive: true,
  },
  {
    name: "Vet Appointments",
    description: "Transport + assistance for scheduled vet visits.",
    priceCents: 2500,
    durationMin: 0,
    isActive: true,
  },
  {
    name: "Administration of Meds",
    description: "Simple medication administration per visit.",
    priceCents: 500,
    durationMin: 0,
    isActive: true,
  },
];

async function main() {
  // Upsert each service by name (no unique constraint required)
  for (const svc of CATALOG) {
    const existing = await prisma.service.findFirst({
      where: { name: svc.name },
    });
    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          description: svc.description,
          priceCents: svc.priceCents,
          durationMin: svc.durationMin,
          isActive: svc.isActive,
        },
      });
    } else {
      await prisma.service.create({ data: svc });
    }
  }

  // Soft-deactivate any service not in the current catalog (keep bookings intact)
  const names = CATALOG.map((s) => s.name);
  await prisma.service.updateMany({
    where: { name: { notIn: names } },
    data: { isActive: false },
  });

  console.log("Seed complete: services upserted, extras deactivated ✔");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
