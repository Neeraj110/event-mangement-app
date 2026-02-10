import express from "express";
import {
  getAllUsers,
  getAllEvents,
  deleteEventByAdmin,
  getAllPayments,
  approvePayout,
} from "../controllers/admin.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("admin")); // Critical: Only admins

router.get("/users", getAllUsers);
router.get("/events", getAllEvents);
router.delete("/events/:id", deleteEventByAdmin);
router.get("/payments", getAllPayments);
router.post("/payouts", approvePayout);

export default router;
