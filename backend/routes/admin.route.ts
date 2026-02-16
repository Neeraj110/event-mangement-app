import express from "express";
import {
  getAllUsers,
  getAllEvents,
  deleteEventByAdmin,
  getAllPayments,
  approvePayout,
  checkAdminExists,
  registerAdmin,
  toggleEventPublish,
} from "../controllers/admin.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

// ─── Public routes (no auth required) ──────────────────────
router.get("/check-exists", checkAdminExists);
router.post("/register", registerAdmin);

// ─── Protected routes (admin-only) ────────────────────────
router.use(authMiddleware);
router.use(authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.get("/events", getAllEvents);
router.delete("/events/:id", deleteEventByAdmin);
router.patch("/events/:id/publish", toggleEventPublish);
router.get("/payments", getAllPayments);
router.post("/payouts", approvePayout);

export default router;
