import bcrypt from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: "signup" | "forgot-password";
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  purpose: {
    type: String,
    enum: ["signup", "forgot-password"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});

// Hash the OTP before saving
otpSchema.pre("save", async function () {
  if (!this.isModified("otp")) return;
  this.otp = await bcrypt.hash(this.otp, 10);
});

// Compare plain OTP with hashed
otpSchema.methods.compareOTP = async function (
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.otp);
};

export default mongoose.model<IOtp>("Otp", otpSchema);
