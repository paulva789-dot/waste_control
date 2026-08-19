const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const STAFF_ROLES = ["COLLECTOR", "HYSACAM_DRIVER", "HYSACAM_SUPERVISOR", "COUNCIL_ADMIN", "SYSTEM_ADMIN"];

router.get("/", requireAuth, async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    include: { driver: { select: { id: true, name: true, phone: true, email: true, role: true } } },
    orderBy: { plateNumber: "asc" },
  });

  const canTrack = req.user.hasUnlockedTracking || STAFF_ROLES.includes(req.user.role);
  if (!canTrack) {
    // Locked view: vehicle exists, but no live location or driver identity.
    return res.json(vehicles.map((v) => ({ id: v.id, type: v.type, status: v.status, locked: true })));
  }

  const canSeeContact = req.user.isPremium || STAFF_ROLES.includes(req.user.role);
  res.json(
    vehicles.map((v) => ({
      ...v,
      driver: v.driver && {
        id: v.driver.id,
        name: v.driver.name,
        role: v.driver.role,
        phone: canSeeContact ? v.driver.phone : null,
        email: canSeeContact ? v.driver.email : null,
      },
    }))
  );
});

router.post(
  "/",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const { plateNumber, type, capacityKg, driverId } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: { plateNumber, type, capacityKg, driverId },
    });
    res.status(201).json(vehicle);
  }
);

router.patch("/:id/location", requireAuth, async (req, res) => {
  const { latitude, longitude, heading, status } = req.body;
  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { latitude, longitude, heading, status },
  });

  const io = req.app.get("io");
  io.emit("vehicle:location", vehicle);

  res.json(vehicle);
});

module.exports = router;
