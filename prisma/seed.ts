import '../src/config/env.js';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  if (!prisma) {
    console.error("Prisma client not initialized. Check DATABASE_URL.");
    process.exit(1);
  }

  console.log("Starting database seeding...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.dailyReport.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log("Existing data cleared");

    // Create sample users (passwords are all "test123")
    console.log("Creating sample users...");

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@construction.com",
        passwordHash:
          "$2b$10$vn8KM3cRLYsZWt/A3.1xjuZfLBH0DerwXjzBp6cQ9H8jdwhrch5wu", // test123
        role: "ADMIN",
      },
    });

    const manager = await prisma.user.create({
      data: {
        name: "Project Manager",
        email: "manager@construction.com",
        passwordHash:
          "$2b$10$f7cU.oe4XTpd8A3kYeNcTeGJfa7dFohfbydcP.BBaZCDsKiKIF.QO", // test123
        role: "MANAGER",
      },
    });

    const worker = await prisma.user.create({
      data: {
        name: "Site Worker",
        email: "worker@construction.com",
        passwordHash:
          "$2b$10$FhwTnKIap2p/EvVZFFfjYuksC0ItKmrODrXObBHjUhp96WDSYqhuO", // test123
        role: "WORKER",
      },
    });

    console.log("Sample users created");
    console.log(`Admin: admin@construction.com / test123`);
    console.log(`Manager: manager@construction.com / test123`);
    console.log(`Worker: worker@construction.com / test123`);

    // Create sample project
    console.log("Creating sample projects...");

    const highwayProject = await prisma.project.create({
      data: {
        name: "Highway Construction Project",
        description: "Construction of 10km highway with bridges and interchanges",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        budget: 5000000,
        location: "City Center to Suburb Highway",
        status: "ACTIVE",
        createdById: admin.id,
      },
    });

    const residentialProject = await prisma.project.create({
      data: {
        name: "Green Valley Residential Complex",
        description: "Modern eco-friendly apartment complex with 5 towers",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2025-06-30"),
        budget: 12000000,
        location: "Green Valley District, Block B",
        status: "PLANNED",
        createdById: manager.id,
      },
    });

    console.log(`Projects created: ${highwayProject.name}, ${residentialProject.name}`);

    // Create sample daily reports
    console.log("Creating sample daily reports...");

    const reports = [
      {
        projectId: highwayProject.id,
        userId: worker.id,
        date: new Date("2024-01-15"),
        workDescription: "Completed excavation for section A. Started foundation work for bridge 1 pillars.",
        weather: "Sunny, 25°C",
        workerCount: 25,
        challenges: "Heavy machinery delivery delayed by 2 hours due to traffic congestion",
        materialsUsed: "Cement: 100 bags, Steel rods: 2 tons, Gravel: 50 cubic meters, Sand: 30 cubic meters",
        equipmentUsed: "Excavator x2, Concrete mixer x3, Crane x1, Trucks x5, Vibrators x4",
        safetyIncidents: "None reported. Safety protocol audit conducted at 10 AM.",
        nextDayPlan: "Continue concrete pouring for bridge foundation. Inspect steel reinforcements for section B.",
      },
      {
        projectId: highwayProject.id,
        userId: worker.id,
        date: new Date("2024-01-16"),
        workDescription: "Continued foundation work. Finished pouring concrete for pillars 1-4. Started curing process.",
        weather: "Cloudy, 22°C",
        workerCount: 30,
        challenges: "Concrete mixer broke down in the afternoon. Rented replacement on-site within 1 hour.",
        materialsUsed: "Cement: 150 bags, Steel: 3 tons, Concrete: 100 cubic meters, Admixture: 50 liters",
        equipmentUsed: "Concrete mixer x4, Crane x2, Vibrators x6, Water tankers x2",
        safetyIncidents: "Minor slip incident in section A. Worker provided first aid. No work downtime.",
        nextDayPlan: "Start scaffolding for pillar caps. Delivery of structural steel expected.",
      },
      {
        projectId: highwayProject.id,
        userId: worker.id,
        date: new Date("2024-01-17"),
        workDescription: "Pillar cap reinforcement started. Structural steel inspection completed.",
        weather: "Light rain, 18°C",
        workerCount: 20,
        challenges: "Work slowed down due to light rain. Safety precautions increased for slippery surfaces.",
        materialsUsed: "Steel reinforcement bars: 5 tons, Tie wire: 50 kg, Formwork sheets: 20 units",
        equipmentUsed: "Crane x2, Forklift x1, Welding machines x3",
        safetyIncidents: "None. Rain gear distributed to all workers.",
        nextDayPlan: "Finalize reinforcement for caps. Schedule concrete delivery for Friday.",
      }
    ];

    for (const reportData of reports) {
      await prisma.dailyReport.create({
        data: reportData,
      });
    }

    console.log(`Created ${reports.length} daily reports`);
    console.log("Database seeding completed successfully!");
  } catch (error: any) {
    console.error("Seeding error:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
