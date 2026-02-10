import express from "express";
import {
  createSubscription,
  getSubscriptionStatus,
} from "../controllers/subscription.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

// Only organizers can subscribe (as per request "for subscriptions which can only orgnaiser")
router.post("/create", authorizeRoles("organizer"), createSubscription);
router.get("/me", authorizeRoles("organizer"), getSubscriptionStatus);

export default router;
