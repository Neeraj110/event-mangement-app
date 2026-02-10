import express from "express";
import {
  createPaymentIntent,
  handleWebhook,
} from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/create-intent", authMiddleware, createPaymentIntent);

// Webhook endpoint (must be raw body, usually handled in index.ts middleware)
// But for now, we attach it here. Note: body parsing might conflict.
// Usually webhooks are mounted separately or we use `express.raw({type: 'application/json'})` for this route.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

export default router;
