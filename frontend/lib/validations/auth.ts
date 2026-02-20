import { z } from "zod";

// ─── Login Schema ──────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Signup Schema ─────────────────────────────────────
export const signupSchema = z.object({
  username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
  userType: z.enum(["user", "organizer"]),
  interests: z.array(z.string()),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

// ─── Account Schema ────────────────────────────────────
export const accountSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

// ─── OTP Schema ────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export type OTPFormValues = z.infer<typeof otpSchema>;

// ─── Forgot Password Schema ───────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── Reset Password Schema ────────────────────────────
export const resetPasswordSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
