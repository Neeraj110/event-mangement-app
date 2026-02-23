import express from "express";
import {
  checkInUser,
  getCheckInStats,
  getCheckInLogs,
} from "../controllers/checkin.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

// Only organizers (or staff) can perform check-ins
router.post("/", authorizeRoles("organizer"), checkInUser);
router.get("/:eventId/stats", authorizeRoles("organizer"), getCheckInStats);
router.get("/:eventId/logs", authorizeRoles("organizer"), getCheckInLogs);

export default router;
