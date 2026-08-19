const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dwms.cm" },
    update: {},
    create: { name: "Council Admin", email: "admin@dwms.cm", passwordHash: password, role: "COUNCIL_ADMIN", area: "Yaounde Central" },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@hysacam.cm" },
    update: {},
    create: { name: "HYSACAM Supervisor", email: "supervisor@hysacam.cm", passwordHash: password, role: "HYSACAM_SUPERVISOR" },
  });

  const driver = await prisma.user.upsert({
    where: { email: "driver@hysacam.cm" },
    update: {},
    create: {
      name: "Jean Mballa",
      email: "driver@hysacam.cm",
      phone: "677001122",
      passwordHash: password,
      role: "HYSACAM_DRIVER",
      town: "Yaoundé",
      latitude: 3.848,
      longitude: 11.502,
    },
  });

  const moreDrivers = [
    {
      name: "Grace Ngo Bikoy",
      email: "grace.driver@hysacam.cm",
      phone: "677010203",
      town: "Douala",
      latitude: 4.0511,
      longitude: 9.7679,
      plateNumber: "LT-1032-DL",
      truckColor: "Blue",
      description: "Handles the Akwa–Bonanjo corridor, morning shift specialist.",
      status: "EN_ROUTE",
    },
    {
      name: "Samuel Fon Ache",
      email: "samuel.driver@hysacam.cm",
      phone: "677010204",
      town: "Bamenda",
      latitude: 5.9631,
      longitude: 10.1591,
      plateNumber: "NW-2210-BA",
      truckColor: "Yellow",
      description: "Covers Bamenda City Council zone 3, evening runs.",
      status: "IDLE",
    },
    {
      name: "Aissatou Bello",
      email: "aissatou.driver@hysacam.cm",
      phone: "677010205",
      town: "Garoua",
      latitude: 9.3265,
      longitude: 13.3978,
      plateNumber: "NO-3305-GA",
      truckColor: "Red",
      description: "Handles market-day heavy pickups in central Garoua.",
      status: "EN_ROUTE",
    },
    {
      name: "Patrice Owona",
      email: "patrice.driver@hysacam.cm",
      phone: "677010206",
      town: "Buea",
      latitude: 4.1560,
      longitude: 9.2419,
      plateNumber: "SW-4408-BU",
      truckColor: "White",
      description: "Buea town + university campus route, recycling-focused.",
      status: "MAINTENANCE",
    },
  ];

  const extraDriverUsers = [];
  for (const d of moreDrivers) {
    const u = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        name: d.name,
        email: d.email,
        phone: d.phone,
        passwordHash: password,
        role: "HYSACAM_DRIVER",
        town: d.town,
        latitude: d.latitude,
        longitude: d.longitude,
      },
    });
    extraDriverUsers.push({ user: u, meta: d });
  }

  const resident = await prisma.user.upsert({
    where: { email: "resident@dwms.cm" },
    update: {},
    create: {
      name: "Paul Vandenberghe",
      email: "resident@dwms.cm",
      passwordHash: password,
      role: "RESIDENT",
      area: "Bastos",
      town: "Yaoundé",
      latitude: 3.888,
      longitude: 11.518,
      isPremium: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { plateNumber: "CE-4521-YA" },
    update: {},
    create: {
      plateNumber: "CE-4521-YA",
      type: "Compactor Truck",
      truckColor: "Lime Green",
      town: "Yaoundé",
      description: "Bastos & Centre-ville morning collection route.",
      capacityKg: 6000,
      driverId: driver.id,
      latitude: 3.848,
      longitude: 11.502,
      status: "EN_ROUTE",
    },
  });

  for (const { user: u, meta } of extraDriverUsers) {
    await prisma.vehicle.upsert({
      where: { plateNumber: meta.plateNumber },
      update: {},
      create: {
        plateNumber: meta.plateNumber,
        type: "Compactor Truck",
        truckColor: meta.truckColor,
        town: meta.town,
        description: meta.description,
        capacityKg: 5500,
        driverId: u.id,
        latitude: meta.latitude,
        longitude: meta.longitude,
        status: meta.status,
      },
    });
  }

  await prisma.pickupRequest.createMany({
    data: [
      {
        residentId: resident.id,
        wasteType: "General",
        address: "Rue 1.812, Bastos, Yaounde",
        latitude: 3.888,
        longitude: 11.518,
        status: "COMPLETED",
        completedAt: new Date(),
      },
      {
        residentId: resident.id,
        wasteType: "Recyclable",
        address: "Avenue Kennedy, Yaounde",
        latitude: 3.869,
        longitude: 11.52,
        status: "PENDING",
      },
      {
        residentId: resident.id,
        collectorId: driver.id,
        wasteType: "General",
        address: "Rue 1.750, Bastos, Yaounde",
        latitude: 3.891,
        longitude: 11.515,
        status: "SCHEDULED",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 3),
      },
      {
        residentId: resident.id,
        collectorId: driver.id,
        wasteType: "Organic",
        address: "Marche Mokolo, Yaounde",
        latitude: 3.879,
        longitude: 11.508,
        status: "IN_PROGRESS",
        scheduledFor: new Date(),
      },
    ],
  });

  await prisma.complaint.create({
    data: {
      reporterId: resident.id,
      type: "OVERFLOWING_BIN",
      description: "Bin near the market has been overflowing for 3 days.",
      latitude: 3.87,
      longitude: 11.52,
      status: "OPEN",
    },
  });

  await prisma.recyclingStat.createMany({
    data: [
      { area: "Bastos", material: "Plastic", quantityKg: 1200 },
      { area: "Bastos", material: "Paper", quantityKg: 800 },
      { area: "Mvog-Mbi", material: "Metal", quantityKg: 450 },
      { area: "Mvog-Mbi", material: "Glass", quantityKg: 300 },
    ],
  });

  console.log("Seed complete. Demo accounts (password: password123):");
  console.log("- admin@dwms.cm (Council Admin)");
  console.log("- supervisor@hysacam.cm (HYSACAM Supervisor)");
  console.log("- driver@hysacam.cm (HYSACAM Driver)");
  console.log("- resident@dwms.cm (Resident)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
