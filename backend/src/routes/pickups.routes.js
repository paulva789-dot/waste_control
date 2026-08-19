const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole, requirePremium } = require("../middleware/auth");
const { calculatePickupPrice } = require("../lib/pricing");
const { notifyUser } = require("../lib/notify");
const { completionPhotoUpload } = require("../lib/upload");

const STAFF_STATUS_ROLES = ["COLLECTOR", "HYSACAM_DRIVER", "HYSACAM_SUPERVISOR", "COUNCIL_ADMIN", "SYSTEM_ADMIN"];

const router = express.Router();

const createSchema = z.object({
  wasteType: z.string().default("General"),
  address: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
});

router.get("/", requireAuth, async (req, res) => {
  const isStaff = ["COLLECTOR", "HYSACAM_DRIVER", "HYSACAM_SUPERVISOR", "COUNCIL_ADMIN", "SYSTEM_ADMIN"].includes(
    req.user.role
  );
  const where = isStaff ? {} : { residentId: req.user.sub };

  const pickups = await prisma.pickupRequest.findMany({
    where,
    include: {
      resident: { select: { id: true, name: true, phone: true, area: true } },
      collector: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(pickups);
});

router.get("/quote", requireAuth, (req, res) => {
  const when = req.query.scheduledFor ? new Date(String(req.query.scheduledFor)) : new Date();
  res.json(calculatePickupPrice(when));
});

router.post("/", requireAuth, requirePremium, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const when = parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : new Date();
  const quote = calculatePickupPrice(when);

  const pickup = await prisma.pickupRequest.create({
    data: { ...parsed.data, residentId: req.user.sub, isSpecial: true, priceXAF: quote.priceXAF },
  });

  const io = req.app.get("io");
  io.emit("pickup:created", pickup);

  res.status(201).json(pickup);
});

router.patch(
  "/:id/assign",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const { collectorId, scheduledFor } = req.body;
    const pickup = await prisma.pickupRequest.update({
      where: { id: req.params.id },
      data: { collectorId, scheduledFor, status: "SCHEDULED" },
      include: { collector: { select: { id: true, name: true } } },
    });

    const io = req.app.get("io");
    io.emit("pickup:updated", pickup);
    await notifyUser(
      io,
      prisma,
      pickup.residentId,
      "Pickup scheduled",
      `${pickup.collector?.name || "A collector"} has been assigned to your ${pickup.wasteType.toLowerCase()} pickup at ${pickup.address}.`
    );

    res.json(pickup);
  }
);

function checkCanUpdate(pickup, req) {
  const isAssignedCollector = pickup.collectorId === req.user.sub;
  const isStaff = STAFF_STATUS_ROLES.includes(req.user.role);
  return isAssignedCollector || isStaff;
}

const STATUS_MESSAGES = {
  IN_PROGRESS: "Your collector is on the way and pickup is now in progress.",
  COMPLETED: "Your pickup has been completed. Thanks for using CleanCity!",
  MISSED: "Your pickup was missed. Please contact support or re-schedule.",
  CANCELLED: "Your pickup request was cancelled.",
};

// COMPLETED is deliberately not accepted here — it can only be reached via
// POST /:id/complete, which requires proof of service (photo + GPS +
// timestamp). Without that, "the truck came" is just an unverified claim.
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ["PENDING", "SCHEDULED", "IN_PROGRESS", "MISSED", "CANCELLED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use POST /:id/complete to mark a pickup completed." });
  }

  const existing = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Pickup not found" });
  if (!checkCanUpdate(existing, req)) {
    return res.status(403).json({ error: "Only the assigned collector or staff can update this pickup" });
  }

  const pickup = await prisma.pickupRequest.update({
    where: { id: req.params.id },
    data: { status },
  });

  const io = req.app.get("io");
  io.emit("pickup:updated", pickup);
  if (STATUS_MESSAGES[status]) {
    await notifyUser(io, prisma, pickup.residentId, "Pickup update", STATUS_MESSAGES[status]);
  }

  res.json(pickup);
});

router.post("/:id/complete", requireAuth, completionPhotoUpload.single("photo"), async (req, res) => {
  const existing = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Pickup not found" });
  if (!checkCanUpdate(existing, req)) {
    return res.status(403).json({ error: "Only the assigned collector or staff can complete this pickup" });
  }

  const latitude = req.body.latitude !== undefined ? Number(req.body.latitude) : undefined;
  const longitude = req.body.longitude !== undefined ? Number(req.body.longitude) : undefined;
  const binCount = req.body.binCount !== undefined ? Number(req.body.binCount) : undefined;

  const pickup = await prisma.pickupRequest.update({
    where: { id: req.params.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completionPhotoUrl: req.file ? `/uploads/completions/${req.file.filename}` : undefined,
      completionLatitude: Number.isFinite(latitude) ? latitude : undefined,
      completionLongitude: Number.isFinite(longitude) ? longitude : undefined,
      binCount: Number.isFinite(binCount) ? binCount : undefined,
    },
  });

  const io = req.app.get("io");
  io.emit("pickup:updated", pickup);
  await notifyUser(io, prisma, pickup.residentId, "Pickup update", STATUS_MESSAGES.COMPLETED);

  res.json(pickup);
});

module.exports = router;
