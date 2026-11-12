import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function main() {
  console.log(" Seeding database for Sweety Glucose Tracker...");

  // 1. Create or update Demo User
  const demoEmail = "demo@sweety.com";
  const demoPassword = "password123";
  const hashedPassword = await bcrypt.hash(demoPassword, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Demo User",
      password: hashedPassword,
    },
    create: {
      email: demoEmail,
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log(` Demo User ready: ${demoEmail} (Password: ${demoPassword})`);

  // 2. Clear existing readings for this demo user to ensure clean, idempotent seed
  await prisma.reading.deleteMany({
    where: { userId: demoUser.id },
  });

  // 3. Generate dynamic dates relative to today
  const today = new Date();

  const getDateStr = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  // Previous month dates helper
  const getPrevMonthDateStr = (dayOfMonth) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 1, dayOfMonth);
    return d.toISOString().split("T")[0];
  };

  const sampleReadings = [
    // Today's 4 readings (Full day for dashboard metrics & chart)
    { date: getDateStr(0), slot: "MORNING", value: 95 },
    { date: getDateStr(0), slot: "AFTER_BREAKFAST", value: 120 },
    { date: getDateStr(0), slot: "AFTER_LUNCH", value: 135 },
    { date: getDateStr(0), slot: "AFTER_DINNER", value: 155 },

    // Yesterday's readings (3 slots)
    { date: getDateStr(1), slot: "MORNING", value: 92 },
    { date: getDateStr(1), slot: "AFTER_BREAKFAST", value: 128 },
    { date: getDateStr(1), slot: "AFTER_DINNER", value: 165 },

    // 2 days ago (2 slots)
    { date: getDateStr(2), slot: "MORNING", value: 88 },
    { date: getDateStr(2), slot: "AFTER_LUNCH", value: 142 },

    // 3 days ago (Including a Low reading showcase)
    { date: getDateStr(3), slot: "MORNING", value: 68 }, // Low (< 70)
    { date: getDateStr(3), slot: "AFTER_BREAKFAST", value: 115 },
    { date: getDateStr(3), slot: "AFTER_DINNER", value: 148 },

    // 4 days ago
    { date: getDateStr(4), slot: "MORNING", value: 102 }, // Medium fasting (100-125)
    { date: getDateStr(4), slot: "AFTER_LUNCH", value: 130 },
    { date: getDateStr(4), slot: "AFTER_DINNER", value: 175 },

    // 5 days ago (Including a High reading showcase)
    { date: getDateStr(5), slot: "MORNING", value: 96 },
    { date: getDateStr(5), slot: "AFTER_BREAKFAST", value: 135 },
    { date: getDateStr(5), slot: "AFTER_LUNCH", value: 205 }, // High (200+)

    // Previous Month Readings (For complete monthly report statistics)
    { date: getPrevMonthDateStr(3), slot: "MORNING", value: 90 },
    { date: getPrevMonthDateStr(3), slot: "AFTER_BREAKFAST", value: 118 },
    { date: getPrevMonthDateStr(8), slot: "MORNING", value: 94 },
    { date: getPrevMonthDateStr(8), slot: "AFTER_LUNCH", value: 140 },
    { date: getPrevMonthDateStr(14), slot: "MORNING", value: 89 },
    { date: getPrevMonthDateStr(14), slot: "AFTER_DINNER", value: 162 },
    { date: getPrevMonthDateStr(20), slot: "MORNING", value: 93 },
    { date: getPrevMonthDateStr(20), slot: "AFTER_BREAKFAST", value: 125 },
    { date: getPrevMonthDateStr(20), slot: "AFTER_LUNCH", value: 138 },
    { date: getPrevMonthDateStr(26), slot: "MORNING", value: 91 },
    { date: getPrevMonthDateStr(26), slot: "AFTER_DINNER", value: 158 },
  ];

  // 4. Insert sample readings
  for (const item of sampleReadings) {
    await prisma.reading.create({
      data: {
        userId: demoUser.id,
        date: new Date(`${item.date}T00:00:00.000Z`),
        slot: item.slot,
        value: item.value,
      },
    });
  }

  console.log(` Inserted ${sampleReadings.length} sample readings.`);
  console.log(" Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(" Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

