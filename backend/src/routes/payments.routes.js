const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { initiateCollection } = require("../lib/fintech");
const { UNLOCK_FEE_XAF } = require("../lib/pricing");
const authRoutes = require("./auth.routes");

const router = express.Router();

const PREMIUM_MEMBERSHIP_XAF = 5000;

// Town changes are free (see PATCH /users/me/town) — TOWN_CHANGE is no longer
// an initiable payment type, kept only as a historical Payment.type value for
// records created before this change.
const initiateSchema = z.object({
  type: z.enum(["UNLOCK_TRACKING", "PREMIUM_MEMBERSHIP", "SPECIAL_PICKUP"]),
  provider: z.enum(["MTN", "ORANGE"]),
  phone: z.string().min(9),
  pickupId: z.string().optional(),
});

function amountFor(type) {
  if (type === "UNLOCK_TRACKING") return UNLOCK_FEE_XAF;
  if (type === "PREMIUM_MEMBERSHIP") return PREMIUM_MEMBERSHIP_XAF;
  return null; // SPECIAL_PICKUP amount comes from the pickup's computed priceXAF
}

router.post("/initiate", requireAuth, async (req, res) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { type, provider, phone, pickupId } = parsed.data;

  let amountXAF = amountFor(type);
  if (type === "SPECIAL_PICKUP") {
    if (!pickupId) return res.status(400).json({ error: "pickupId required for SPECIAL_PICKUP" });
    const pickup = await prisma.pickupRequest.findUnique({ where: { id: pickupId } });
    if (!pickup || pickup.residentId !== req.user.sub) {
      return res.status(404).json({ error: "Pickup not found" });
    }
    amountXAF = pickup.priceXAF;
  }

  const reference = `DWMS-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    await initiateCollection({ provider, amountXAF, phone, reference });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user.sub,
      amountXAF,
      provider,
      type,
      phone,
      reference,
      status: "PENDING",
    },
  });

  res.status(201).json(payment);
});

// Stub of the aggregator webhook — in production this is called by MTN/Orange, not the client.
// Kept client-callable here so the demo flow can complete without real credentials.
router.post("/:id/confirm", requireAuth, async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment || payment.userId !== req.user.sub) {
    return res.status(404).json({ error: "Payment not found" });
  }
  if (payment.status !== "PENDING") {
    return res.status(400).json({ error: "Payment already settled" });
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "SUCCESS" },
  });

  let user = await prisma.user.findUnique({ where: { id: req.user.sub } });

  if (payment.type === "UNLOCK_TRACKING") {
    user = await prisma.user.update({
      where: { id: req.user.sub },
      data: { hasUnlockedTracking: true },
    });
  } else if (payment.type === "PREMIUM_MEMBERSHIP") {
    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + 1);
    user = await prisma.user.update({
      where: { id: req.user.sub },
      data: { isPremium: true, premiumUntil },
    });
  }

  const { passwordHash, ...publicUser } = user;
  const token = authRoutes.signToken(user);

  res.json({ payment: updated, user: publicUser, token });
});

router.get("/", requireAuth, async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.sub },
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
});

module.exports = router;
