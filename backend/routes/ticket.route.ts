import express from "express";
import {
  getUserTickets,
  getTicketById,
} from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/me", authMiddleware, getUserTickets);
router.get("/:id", authMiddleware, getTicketById);

export default router;
