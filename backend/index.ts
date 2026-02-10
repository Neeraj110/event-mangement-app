import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./config/db";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";

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

// Middleware
// Note: Webhook needs raw body, so we might need to adjust middleware order or configuration if mounting under /api/payments
// Ideally, webhook shouldn't be under /api if we have global JSON parser.
// But for simplicity in this task, I'll register it. If webhook fails due to parsing, we might need a separate route in index.ts
app.use(helmet());
app.use(cors());

// Custom JSON parser to ignore webhook route
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/checkin", checkInRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
