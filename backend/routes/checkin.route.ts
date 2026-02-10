import express from "express";
import { checkInUser } from "../controllers/checkin.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

// Only organizers (or staff) can perform check-ins
router.post("/", authorizeRoles("organizer"), checkInUser);

export default router;
