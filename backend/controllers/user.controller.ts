import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { IUserDocument } from "../types/types";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary";

export const register = async (req: Request, res: Response) => {
  const result = createUserSchema.safeParse(req.body);
  const profileImage = req.file;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  const { name, email, password, role, isPremium, interests, location } =
    result.data;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let uploadedImage;
    if (profileImage) {
      uploadedImage = await uploadOnCloudinary(profileImage.path);
      if (!uploadedImage) {
        return res
          .status(500)
          .json({ message: "Failed to upload profile image" });
      }
    }

    const user = new User({
      name,
      profileImage: uploadedImage?.secure_url,
      email,
      password,
      role,
      isPremium,
      interests,
      location,
    });
    await user.save();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
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

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUserDocument | undefined;
    const user = await User.findById(currentUser?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
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
        id: user._id,
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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}?accessToken=${accessToken}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
