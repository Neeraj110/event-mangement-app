import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import passport from "./config/passport";
import ticketRoutes from "./routes/ticket.route";
import organizerRoutes from "./routes/organizer.route";
import subscriptionRoutes from "./routes/subscription.route";
import adminRoutes from "./routes/admin.route";
import paymentRoutes from "./routes/payment.route";
import checkInRoutes from "./routes/checkin.route";

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

// ─── Global Rate Limiter ──────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Strict Rate Limiter for Payment Routes ───────────────
export const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 payment requests per minute per IP
  message: { message: "Too many payment requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Auth Rate Limiter ────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 auth requests per 15 mins per IP
  message: { message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Middleware ───────────────────────────────────────────
app.use(passport.initialize());
app.use(helmet());
app.use(globalLimiter);
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      process.env.FRONTEND_URL || "",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(morgan("dev"));

// NoSQL injection prevention — sanitize req.body, req.query, req.params
app.use(mongoSanitize());

// ─── Routes ──────────────────────────────────────────────
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
