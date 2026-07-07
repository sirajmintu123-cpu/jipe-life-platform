import { db } from "@workspace/db";
import { usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const ADMIN_MEMBER_ID = "JLADMIN01";
  const ADMIN_PASSWORD = "Admin@1234";
  const ADMIN_EMAIL = "admin@jipelife.com";

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.memberId, ADMIN_MEMBER_ID));
  if (existing) {
    console.log("Admin already exists:", ADMIN_MEMBER_ID);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const [admin] = await db.insert(usersTable).values({
    memberId: ADMIN_MEMBER_ID,
    name: "Jipe Admin",
    email: ADMIN_EMAIL,
    phone: "9000000000",
    passwordHash,
    role: "admin",
    package: "gold",
    bv: 4,
    packageCost: 10100,
    ctoActive: false,
    ctoTotalReceived: "0",
    lifetimePairs: 0,
    leftBv: 0,
    rightBv: 0,
    carryForwardBv: 0,
    status: "active",
  }).returning();

  await db.insert(walletsTable).values({
    userId: admin.id,
    balance: "0",
    totalEarned: "0",
    totalWithdrawn: "0",
    pendingWithdrawal: "0",
  });

  console.log("✅ Admin seeded:");
  console.log("  Member ID:", ADMIN_MEMBER_ID);
  console.log("  Password:", ADMIN_PASSWORD);
  console.log("  Email:", ADMIN_EMAIL);

  // Also seed a demo member with some E-pins
  const DEMO_MEMBER_ID = "JL000001";
  const [existingDemo] = await db.select().from(usersTable).where(eq(usersTable.memberId, DEMO_MEMBER_ID));
  if (!existingDemo) {
    const demoHash = await bcrypt.hash("Demo@1234", 10);
    const [demo] = await db.insert(usersTable).values({
      memberId: DEMO_MEMBER_ID,
      name: "Demo Member",
      email: "demo@jipelife.com",
      phone: "9111111111",
      passwordHash: demoHash,
      role: "member",
      package: "gold",
      bv: 4,
      packageCost: 10100,
      sponsorId: admin.id,
      ctoActive: true,
      ctoTotalReceived: "0",
      lifetimePairs: 0,
      leftBv: 5,
      rightBv: 3,
      carryForwardBv: 0,
      status: "active",
    }).returning();

    await db.insert(walletsTable).values({
      userId: demo.id,
      balance: "8500",
      totalEarned: "8500",
      totalWithdrawn: "0",
      pendingWithdrawal: "0",
    });

    console.log("✅ Demo member seeded:");
    console.log("  Member ID:", DEMO_MEMBER_ID);
    console.log("  Password: Demo@1234");
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
