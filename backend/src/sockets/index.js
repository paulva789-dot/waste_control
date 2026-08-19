function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("identify", (userId) => {
      if (typeof userId === "string" && userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on("vehicle:track", (payload) => {
      socket.broadcast.emit("vehicle:location", payload);
    });

    socket.on("disconnect", () => {});
  });
}

module.exports = registerSocketHandlers;
