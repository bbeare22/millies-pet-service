import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      name: "Dog Walking (30 min)",
      description: "A brisk 30-minute walk around the neighborhood.",
      priceCents: 2000,
      durationMin: 30
    },
    {
      name: "Dog Walking (60 min)",
      description: "A full hour walk for high-energy pups.",
      priceCents: 3500,
      durationMin: 60
    },
    {
      name: "Drop-in Visit",
      description: "15–20 minutes let-out, food/water top-up, playtime.",
      priceCents: 1800,
      durationMin: 20
    },
    {
      name: "Overnight Sitting",
      description: "Stay at client's home overnight; includes evening/morning care.",
      priceCents: 9000,
      durationMin: 720
    }
  ];
  for (const s of services) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: {},
      create: s
    });
  }
  console.log("Seeded services ✅");
}

main().catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());