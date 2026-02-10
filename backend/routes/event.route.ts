import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

// Public Routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected Routes
router.post("/", authMiddleware, upload.single("coverImage"), createEvent);
router.put("/:id", authMiddleware, upload.single("coverImage"), updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

export default router;
