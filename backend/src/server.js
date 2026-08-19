require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const pickupsRoutes = require("./routes/pickups.routes");
const complaintsRoutes = require("./routes/complaints.routes");
const vehiclesRoutes = require("./routes/vehicles.routes");
const schedulesRoutes = require("./routes/schedules.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const paymentsRoutes = require("./routes/payments.routes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "*", methods: ["GET", "POST"] },
});
app.set("io", io);
require("./sockets")(io);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => res.json({ status: "ok", service: "dwms-backend" }));
app.get("/api/towns", (req, res) => res.json(require("./lib/towns").CAMEROON_TOWNS));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/pickups", pickupsRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`DWMS backend listening on http://localhost:${PORT}`);
});
