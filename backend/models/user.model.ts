import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import { IUser, IUserDocument, IUserMethods } from "../types/types";

// Define the Model type locally to simplify the Schema definition
interface IUserModel extends mongoose.Model<IUser, {}, IUserMethods> {}

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: { type: String, required: true, unique: true },
    profileImage: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    githubId: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "organizer"],
      default: "user",
    },
    isPremium: { type: Boolean, default: false },
    interests: { type: [String], default: [] },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (this: IUserDocument) {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password as string, 10);
});

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  password: string,
) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password as string);
};

userSchema.methods.generateAccessToken = function (this: IUserDocument) {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15m",
    },
  );
};

userSchema.methods.generateRefreshToken = function (this: IUserDocument) {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export default mongoose.model<IUser, IUserModel>("User", userSchema);
