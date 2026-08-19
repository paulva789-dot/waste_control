const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth, optionalAuth, requireRole } = require("../middleware/auth");
const { notifyUser } = require("../lib/notify");

const router = express.Router();

// Reporting is the highest-volume, lowest-friction civic action this platform
// offers, so it must not require an account. Anonymous reporters give a phone
// number instead (used only to send status updates on this report).
const createSchema = z.object({
  type: z.enum([
    "ILLEGAL_DUMPING",
    "MISSED_PICKUP",
    "OVERFLOWING_BIN",
    "DAMAGED_BIN",
    "POOR_SERVICE",
    "OTHER",
  ]),
  description: z.string().min(3),
  photoUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  reporterPhone: z.string().min(9).optional(),
});

router.get("/", requireAuth, async (req, res) => {
  const isStaff = ["COUNCIL_ADMIN", "SYSTEM_ADMIN", "INSPECTOR", "HYSACAM_SUPERVISOR"].includes(req.user.role);
  const where = isStaff ? {} : { reporterId: req.user.sub };

  const complaints = await prisma.complaint.findMany({
    where,
    include: { reporter: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(complaints.map((c) => ({ ...c, reference: c.id.slice(0, 8).toUpperCase() })));
});

router.post("/", optionalAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (!req.user && !parsed.data.reporterPhone) {
    return res.status(400).json({ error: "A phone number is required to report anonymously" });
  }

  const complaint = await prisma.complaint.create({
    data: {
      ...parsed.data,
      reporterId: req.user?.sub ?? null,
      statusEvents: { create: { status: "OPEN" } },
    },
  });

  const io = req.app.get("io");
  io.emit("complaint:created", complaint);

  res.status(201).json({ ...complaint, reference: complaint.id.slice(0, 8).toUpperCase() });
});

// Public tracking by ID/reference — no auth required, mirrors a parcel
// tracking number. Only shows status + timeline, never reporter identity.
router.get("/:id/track", async (req, res) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: req.params.id },
    include: { statusEvents: { orderBy: { createdAt: "asc" } } },
  });
  if (!complaint) return res.status(404).json({ error: "Report not found" });

  res.json({
    reference: complaint.id.slice(0, 8).toUpperCase(),
    type: complaint.type,
    description: complaint.description,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    timeline: complaint.statusEvents.map((e) => ({ status: e.status, at: e.createdAt })),
  });
});

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("COUNCIL_ADMIN", "SYSTEM_ADMIN", "INSPECTOR", "HYSACAM_SUPERVISOR"),
  async (req, res) => {
    const { status } = req.body;
    const allowed = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status, handlerId: req.user.sub, statusEvents: { create: { status } } },
    });

    const io = req.app.get("io");
    io.emit("complaint:updated", complaint);

    const STATUS_MESSAGES = {
      IN_REVIEW: "Your complaint is now being reviewed by the council.",
      RESOLVED: "Your complaint has been resolved. Thanks for reporting it.",
      REJECTED: "Your complaint was reviewed and rejected.",
    };
    if (STATUS_MESSAGES[status] && complaint.reporterId) {
      await notifyUser(
        io,
        prisma,
        complaint.reporterId,
        "Complaint update",
        STATUS_MESSAGES[status]
      );
    }

    res.json(complaint);
  }
);

module.exports = router;
