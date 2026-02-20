import bcrypt from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "organizer";
  interests: string[];
  profileImage?: string;
  createdAt: Date;
}

const pendingUserSchema = new Schema<IPendingUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "organizer"],
    default: "user",
  },
  interests: { type: [String], default: [] },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // auto-delete after 15 min
});

// Hash password before saving
pendingUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model<IPendingUser>("PendingUser", pendingUserSchema);
