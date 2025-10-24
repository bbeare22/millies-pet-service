import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Resetting bookings only...");

  const deleted = await prisma.booking.deleteMany({});
  console.log(`Deleted ${deleted.count} booking(s).`);

  console.log("✅ Bookings cleared, services preserved.");
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
