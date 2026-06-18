import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import morgan from "morgan";
import { rateLimiter } from "./utils/rateLimits";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db";
import { connectRedis, disconnectRedis } from "./config/redis";
import { initSocket } from "./config/socket";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import passport from "./config/passport";
import ticketRoutes from "./routes/ticket.route";
import organizerRoutes from "./routes/organizer.route";
import subscriptionRoutes from "./routes/subscription.route";
import adminRoutes from "./routes/admin.route";
import paymentRoutes from "./routes/payment.route";
import checkInRoutes from "./routes/checkin.route";
import { startEventArchiveCron, startSubscriptionExpiryCron } from "./utils/cron";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

connectRedis();

initSocket(server);

const globalLimiter = rateLimiter(
  200,
  15 * 60 * 1000,
  "Too many requests, please try again later.",
);

export const paymentLimiter = rateLimiter(
  10,
  1 * 60 * 1000,
  "Too many payment requests, please slow down.",
);

export const authLimiter = rateLimiter(
  20,
  15 * 60 * 1000,
  "Too many login attempts, please try again later.",
);

app.use(passport.initialize());
app.use(helmet());
app.use(globalLimiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(morgan("dev"));

app.use((req, _res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }
  next();
});

app.use("/api/users", authLimiter, userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/checkin", checkInRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
  startEventArchiveCron();
  startSubscriptionExpiryCron();
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("📡 HTTP server closed");
  });
  await disconnectRedis();
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
