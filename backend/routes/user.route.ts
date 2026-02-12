import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getProfile,
  updateProfile,
  socialAuthCallback,
} from "../controllers/user.controller";
import upload from "../middlewares/multer.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);

// Google Auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  socialAuthCallback,
);

// GitHub Auth
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  socialAuthCallback,
);

router.use(authMiddleware);
router.get("/profile", getProfile);
router.put("/update", upload.single("profileImage"), updateProfile);

export default router;
