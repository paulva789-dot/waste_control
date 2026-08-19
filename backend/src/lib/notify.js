async function notifyUser(io, prisma, userId, title, body) {
  const notification = await prisma.notification.create({
    data: { userId, title, body },
  });
  io.to(`user:${userId}`).emit("notification:new", notification);
  return notification;
}

module.exports = { notifyUser };
