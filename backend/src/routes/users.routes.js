const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const { CAMEROON_TOWNS } = require("../lib/towns");

const router = express.Router();

const TOWN_CHANGE_COOLDOWN_DAYS = 30;
const STAFF_ROLES = ["COLLECTOR", "HYSACAM_DRIVER", "HYSACAM_SUPERVISOR", "INSPECTOR", "COUNCIL_ADMIN", "SYSTEM_ADMIN"];
const ADMIN_ONLY_ROLES = ["COUNCIL_ADMIN", "SYSTEM_ADMIN"];

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

router.get(
  "/",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const { role } = req.query;
    const roles = role ? String(role).split(",") : undefined;
    const users = await prisma.user.findMany({
      where: roles ? { role: { in: roles } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json(users.map(({ passwordHash, ...u }) => u));
  }
);

router.patch("/me", requireAuth, async (req, res) => {
  const { name, phone, area } = req.body;
  const data = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof phone === "string") data.phone = phone.trim() || null;
  if (typeof area === "string") data.area = area.trim() || null;

  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data,
  });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

// Staff accounts (drivers, supervisors, council admins, inspectors) are never
// publicly self-registerable — see auth.routes.js. An existing admin creates
// them here instead and hands the generated temporary password to the new
// hire directly, since this project has no outbound email/SMS infrastructure.
const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(STAFF_ROLES),
  area: z.string().optional(),
  town: z.enum(CAMEROON_TOWNS).optional(),
});

router.post(
  "/invite",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (ADMIN_ONLY_ROLES.includes(parsed.data.role) && req.user.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({ error: "Only a system admin can create admin accounts" });
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const tempPassword = crypto.randomBytes(6).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: { ...parsed.data, passwordHash },
    });

    const { passwordHash: _omit, ...publicUser } = user;
    res.status(201).json({ user: publicUser, tempPassword });
  }
);

router.patch("/me/town", requireAuth, async (req, res) => {
  const parsed = z.object({ town: z.enum(CAMEROON_TOWNS) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const current = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (current.lastTownChangeAt) {
    const nextAllowed = new Date(current.lastTownChangeAt);
    nextAllowed.setDate(nextAllowed.getDate() + TOWN_CHANGE_COOLDOWN_DAYS);
    if (nextAllowed > new Date()) {
      const daysRemaining = Math.ceil((nextAllowed - new Date()) / (1000 * 60 * 60 * 24));
      return res.status(429).json({
        error: `Town can be changed again in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,
        daysRemaining,
      });
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: { town: parsed.data.town, pendingTown: null, lastTownChangeAt: new Date() },
  });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

router.patch("/me/location", requireAuth, async (req, res) => {
  const { latitude, longitude } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: { latitude, longitude },
  });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

module.exports = router;
