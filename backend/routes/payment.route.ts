import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify", authMiddleware, verifyPayment);

export default router;
