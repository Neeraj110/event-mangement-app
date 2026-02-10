import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getProfile,
  updateProfile,
} from "../controllers/user.controller";
import upload from "../middlewares/multer.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);

router.use(authMiddleware);
router.get("/profile", getProfile);
router.put("/update", upload.single("profileImage"), updateProfile);

export default router;
