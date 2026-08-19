const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { CAMEROON_TOWNS } = require("../lib/towns");

const router = express.Router();

// Public self-registration is limited to non-privileged roles. Staff roles
// (collectors, drivers, supervisors, council admins, inspectors, system admins)
// can only be created by an existing admin via POST /users/invite — see
// users.routes.js. This closes the "anyone can register as Council Admin"
// authorization hole.
const PUBLIC_ROLES = ["RESIDENT", "RECYCLING_COMPANY"];

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  town: z.enum(CAMEROON_TOWNS),
  role: z.enum(PUBLIC_ROLES).default("RESIDENT"),
  area: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      hasUnlockedTracking: user.hasUnlockedTracking,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, phone, password, role, area, town } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role, area, town },
  });

  const token = signToken(user);
  res.status(201).json({ token, user: toPublicUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

// Lets the web/mobile "explore as..." buttons sign a visitor into a seeded
// demo account without ever putting a password in client-side code. Disable
// in a real deployment by setting DEMO_LOGIN_ENABLED=false.
const DEMO_ACCOUNTS = {
  RESIDENT: "resident@dwms.cm",
  DRIVER: "driver@hysacam.cm",
  COUNCIL: "admin@dwms.cm",
};

router.post("/demo-login", async (req, res) => {
  if (process.env.DEMO_LOGIN_ENABLED === "false") {
    return res.status(404).json({ error: "Not found" });
  }
  const persona = String(req.body?.persona || "").toUpperCase();
  const email = DEMO_ACCOUNTS[persona];
  if (!email) {
    return res.status(400).json({ error: `persona must be one of ${Object.keys(DEMO_ACCOUNTS).join(", ")}` });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "Demo account not seeded on this environment" });
  }

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

router.signToken = signToken;

module.exports = router;
