const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/overview",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const [totalPickups, completedPickups, missedPickups, openComplaints, resolvedComplaints, vehicles, recycling] =
      await Promise.all([
        prisma.pickupRequest.count(),
        prisma.pickupRequest.count({ where: { status: "COMPLETED" } }),
        prisma.pickupRequest.count({ where: { status: "MISSED" } }),
        prisma.complaint.count({ where: { status: "OPEN" } }),
        prisma.complaint.count({ where: { status: "RESOLVED" } }),
        prisma.vehicle.count(),
        prisma.recyclingStat.groupBy({ by: ["material"], _sum: { quantityKg: true } }),
      ]);

    const collectionEfficiency = totalPickups > 0 ? Math.round((completedPickups / totalPickups) * 100) : 0;

    res.json({
      totalPickups,
      completedPickups,
      missedPickups,
      openComplaints,
      resolvedComplaints,
      vehicles,
      collectionEfficiency,
      recycling: recycling.map((r) => ({ material: r.material, quantityKg: r._sum.quantityKg })),
    });
  }
);

module.exports = router;
