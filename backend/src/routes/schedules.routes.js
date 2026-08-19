const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { area } = req.query;
  const schedules = await prisma.schedule.findMany({
    where: area ? { area: String(area) } : undefined,
    include: { vehicle: { include: { driver: { select: { name: true } } } } },
    orderBy: { dayOfWeek: "asc" },
  });
  res.json(schedules);
});

router.post(
  "/",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const { area, dayOfWeek, startTime, endTime, vehicleId } = req.body;
    const schedule = await prisma.schedule.create({
      data: { area, dayOfWeek, startTime, endTime, vehicleId },
    });
    res.status(201).json(schedule);
  }
);

module.exports = router;
