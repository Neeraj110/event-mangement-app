import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model";
import OTP from "../models/otp.model";
import PendingUser from "../models/pendingUser.model";
import { IUserDocument } from "../types/types";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary";
import { sendOTPEmail } from "../utils/mailer";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookie";

// ─── Helper: generate 6-digit OTP ────────────────────────
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Register (Step 1: send OTP, do NOT create user) ─────
export const register = async (req: Request, res: Response) => {
  const result = createUserSchema.safeParse(req.body);
  const profileImage = req.file;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  const { name, email, password, role, interests } = result.data;

  try {
    // Check if a real user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Upload profile image if provided
    let uploadedImageUrl: string | undefined;
    if (profileImage) {
      const uploaded = await uploadOnCloudinary(profileImage.path);
      if (!uploaded) {
        return res
          .status(500)
          .json({ message: "Failed to upload profile image" });
      }
      uploadedImageUrl = uploaded.secure_url;
    }

    // Upsert pending user (replace any previous pending signup for this email)
    await PendingUser.findOneAndDelete({ email });
    const pendingUser = new PendingUser({
      name,
      email,
      password,
      role: role || "user",
      interests: interests || [],
      profileImage: uploadedImageUrl,
    });
    await pendingUser.save();

    // Delete any old OTPs for this email & purpose, then create new
    await OTP.deleteMany({ email, purpose: "signup" });
    const otpCode = generateOTP();
    const otpDoc = new OTP({ email, otp: otpCode, purpose: "signup" });
    await otpDoc.save();

    // Send OTP via email
    await sendOTPEmail(email, otpCode, "signup");

    res.status(200).json({
      message:
        "OTP sent to your email. Please verify to complete registration.",
      email,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Verify Signup OTP (Step 2: create real user) ────────
export const verifySignupOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // Find the latest OTP for this email
    const otpDoc = await OTP.findOne({ email, purpose: "signup" }).sort({
      createdAt: -1,
    });
    if (!otpDoc) {
      return res
        .status(400)
        .json({
          message: "OTP expired or not found. Please request a new one.",
        });
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, otpDoc.otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Get pending user data
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res
        .status(400)
        .json({ message: "Signup session expired. Please register again." });
    }

    // Check if user was created in the meantime (race condition guard)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteMany({ email, purpose: "signup" });
      await PendingUser.findOneAndDelete({ email });
      return res.status(400).json({ message: "User already exists" });
    }

    // Create the real user (password is already hashed in PendingUser)
    const user = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // already hashed
      role: pendingUser.role,
      interests: pendingUser.interests,
      profileImage: pendingUser.profileImage,
    });
    // Skip the pre-save hash since password is already hashed
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Cleanup
    await OTP.deleteMany({ email, purpose: "signup" });
    await PendingUser.findOneAndDelete({ email });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: "Email verified. Account created successfully!",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Resend OTP ──────────────────────────────────────────
export const resendOTP = async (req: Request, res: Response) => {
  const { email, purpose } = req.body;

  if (!email || !purpose) {
    return res.status(400).json({ message: "Email and purpose are required" });
  }

  try {
    if (purpose === "signup") {
      const pendingUser = await PendingUser.findOne({ email });
      if (!pendingUser) {
        return res
          .status(400)
          .json({
            message: "No pending registration found. Please sign up again.",
          });
      }
    } else if (purpose === "forgot-password") {
      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return res
          .status(400)
          .json({ message: "No account found with that email." });
      }
    }

    // Delete old OTPs & create new
    await OTP.deleteMany({ email, purpose });
    const otpCode = generateOTP();
    const otpDoc = new OTP({ email, otp: otpCode, purpose });
    await otpDoc.save();

    await sendOTPEmail(email, otpCode, purpose);

    res.status(200).json({ message: "OTP resent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Forgot Password (send OTP) ─────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return res
        .status(200)
        .json({
          message: "If that email is registered, you'll receive an OTP.",
        });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses social login (Google/GitHub). Password reset is not available.",
      });
    }

    await OTP.deleteMany({ email, purpose: "forgot-password" });
    const otpCode = generateOTP();
    const otpDoc = new OTP({ email, otp: otpCode, purpose: "forgot-password" });
    await otpDoc.save();

    await sendOTPEmail(email, otpCode, "forgot-password");

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Reset Password (verify OTP + set new password) ─────
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const otpDoc = await OTP.findOne({
      email,
      purpose: "forgot-password",
    }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res
        .status(400)
        .json({
          message: "OTP expired or not found. Please request a new one.",
        });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    // Cleanup
    await OTP.deleteMany({ email, purpose: "forgot-password" });

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Login ───────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const result = loginUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  const { email, password } = result.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log(error);
  }
};

// ─── Logout ──────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUserDocument | undefined;
    if (user) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $unset: { refreshToken: 1 } },
      );
    }
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    clearRefreshTokenCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Refresh Access Token ────────────────────────────────
export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as { _id: string };

    const user = await User.findOne({ _id: decoded._id, refreshToken });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = user.generateAccessToken();

    res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// ─── Get Profile ─────────────────────────────────────────
export const getProfile = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUserDocument | undefined;
    const user = await User.findById(currentUser?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        interests: user.interests,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Update Profile ──────────────────────────────────────
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUserDocument | undefined;
    const user = await User.findById(currentUser?._id);
    const { name, email, role, isPremium, interests, location } = req.body;
    const profileImage = req.file;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (profileImage) {
      try {
        if (user.profileImage) {
          await deleteOnCloudinary(user.profileImage);
        }
        const uploadedImage = await uploadOnCloudinary(profileImage.path);
        if (!uploadedImage) {
          return res
            .status(500)
            .json({ message: "Failed to upload profile image" });
        }
        user.profileImage = uploadedImage.secure_url;
      } catch (error) {
        return res.status(500).json({ message: "Server error" });
      }
    }
    user.name = name;
    user.email = email;
    user.role = role;
    user.isPremium = isPremium;
    user.interests = interests;
    user.location = location;
    await user.save();
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        interests: user.interests,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Social Auth Callback ────────────────────────────────
export const socialAuthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUserDocument | undefined;
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`,
      );
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.redirect(`${process.env.FRONTEND_URL}?accessToken=${accessToken}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

// ─── Upgrade to Organizer ────────────────────────────────
export const upgradeToOrganizer = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUserDocument | undefined;
    const user = await User.findById(currentUser?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "organizer") {
      return res.status(400).json({ message: "You are already an organizer" });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin accounts cannot change role" });
    }

    user.role = "organizer";
    await user.save();

    // Generate a new access token with updated role claim
    const accessToken = user.generateAccessToken();

    res.status(200).json({
      message: "Successfully upgraded to organizer",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
