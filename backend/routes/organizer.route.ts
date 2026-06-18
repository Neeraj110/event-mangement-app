import express from "express";
import {
  getOrganizerEvents,
  getEventStats,
} from "../controllers/organizer.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware"; // Assuming authorizeRoles exists or I need to create it

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("organizer", "admin"));

router.get("/events", getOrganizerEvents);
router.get("/events/:id/stats", getEventStats);

export default router;
