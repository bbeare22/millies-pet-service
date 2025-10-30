const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Millie’s services…");

  // Clear bookings first so we can safely reset services
  await prisma.booking.deleteMany({});
  console.log("  - Cleared bookings");

  await prisma.service.deleteMany({});
  console.log("  - Cleared services");

  const services = [
    // ---- Dog Walks ----
    {
      name: "Dog Walk (20 min)",
      description: "Leashed neighborhood walk. 2 dogs $25.50",
      priceCents: 1700,
      durationMin: 20,
      isActive: true,
    },
    {
      name: "Dog Walk (30 min)",
      description: "A brisk 30-minute walk. 2 dogs $39.00",
      priceCents: 2200,
      durationMin: 30,
      isActive: true,
    },
    {
      name: "Dog Walk (60 min)",
      description: "Full-hour walk for high-energy pups. 2 dogs $48.00",
      priceCents: 3200,
      durationMin: 60,
      isActive: true,
    },

    // ---- Drop-ins ----
    {
      name: "Drop-in (20 min)",
      description:
        "Quick drop-in to make sure dog/cat has fresh water and food. Backyard potty break.",
      priceCents: 1500,
      durationMin: 20,
      isActive: true,
    },
    {
      name: "Drop-in (30 min)",
      description:
        "Quick drop-in with extra time for play/care. Includes water/food top-up and litter pan clean-up.",
      priceCents: 2000,
      durationMin: 30,
      isActive: true,
    },
    {
      name: "Drop-in (60 min)",
      description:
        "Extended drop-in for extra attention and enrichment. Water/food top-up and clean-up included. (Cats exempt from 60 min option.)",
      priceCents: 3000,
      durationMin: 60,
      isActive: true,
    },

    // ---- Overnights ----
    {
      name: "Boarding (overnight)",
      description:
        "Overnight at Millie’s home. $25/night. Additional dogs $18 each (up to 3). Pets must be picked up by 11:59pm.",
      priceCents: 2500,
      durationMin: 720,
      isActive: true,
    },
    {
      name: "Sitting (overnight, owner’s home)",
      description:
        "Overnight at your home. $30/night. Additional dogs $23 each. Pets must be picked up by 11:59pm.",
      priceCents: 3000,
      durationMin: 720,
      isActive: true,
    },

    // ---- Add-ons ----
    {
      name: "Add-on: Administration of Meds",
      description: "Simple medication administration per visit.",
      priceCents: 500,
      durationMin: 0,
      isActive: true,
    },
    {
      name: "Add-on: Pickup/Drop-off (each way, up to 10 miles)",
      description: "Local pickup or drop-off up to 10 miles (per each way).",
      priceCents: 700,
      durationMin: 0,
      isActive: true,
    },
  ];

  await prisma.service.createMany({ data: services });
  console.log(`✅ Inserted ${services.length} services`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
