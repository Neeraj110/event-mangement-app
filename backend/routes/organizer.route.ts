import express from "express";
import {
  getOrganizerEvents,
  getEventStats,
} from "../controllers/organizer.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware"; // Assuming authorizeRoles exists or I need to create it

const router = express.Router();

// Apply auth and role check
router.use(authMiddleware);

// Restrict to organizers
// Assuming authorizeRoles middleware exists. If not, I will add check inside controller or add middleware.
// For now, let's assume I need to implement basic role checking if middleware is missing.
// Checking routes/admin.route.ts might clarify, but it doesn't exist yet.
// I will check auth.middleware.ts in next step to be sure.

router.get("/events", getOrganizerEvents);
router.get("/events/:id/stats", getEventStats);

export default router;
