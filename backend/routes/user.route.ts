import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getProfile,
  updateProfile,
  socialAuthCallback,
  upgradeToOrganizer,
} from "../controllers/user.controller";
import upload from "../middlewares/multer.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);

// Google Auth — pass selected role via OAuth state param
router.get("/auth/google", (req, res, next) => {
  const role = req.query.role === "organizer" ? "organizer" : "user";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role,
  })(req, res, next);
});
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  socialAuthCallback,
);

// GitHub Auth — pass selected role via OAuth state param
router.get("/auth/github", (req, res, next) => {
  const role = req.query.role === "organizer" ? "organizer" : "user";
  passport.authenticate("github", {
    scope: ["user:email"],
    state: role,
  })(req, res, next);
});
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  socialAuthCallback,
);

router.use(authMiddleware);
router.get("/profile", getProfile);
router.put("/update", upload.single("profileImage"), updateProfile);
router.patch("/upgrade-role", upgradeToOrganizer);

export default router;
