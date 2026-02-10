import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Cloudinary environment variables are missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  public_id?: string;
  overwrite?: boolean;
  transformation?: object[];
}

export const uploadOnCloudinary = async (
  localFilePath: string,
  options: UploadOptions = {},
) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      ...options,
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export const deleteOnCloudinary = async (url: string) => {
  try {
    if (!url) return null;

    const parts = url.split("/");
    const public_id_with_ext = parts.slice(-2).join("/");
    const public_id = public_id_with_ext.split(".")[0];

    let resource_type: "image" | "video" | "raw" = "image";

    if (url.includes("/video/")) {
      resource_type = "video";
    } else if (url.includes("/raw/")) {
      resource_type = "raw";
    }

    return await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};
