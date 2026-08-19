const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(notification);
});

module.exports = router;
