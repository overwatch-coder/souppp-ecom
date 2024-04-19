import cloudinary from "@/config/cloudinary";
import fileUpload from "express-fileupload";
import { createHttpError } from "@/middleware/error.middleware";

// upload a single file (image)
export const uploadImage = async (
  file: fileUpload.UploadedFile,
  folderName: string
) => {
  try {
    const url = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `souppp/${folderName}`,
      resource_type: "auto",
    });

    if (!url.public_id) {
      throw createHttpError("Error uploading image");
    }

    return url.secure_url;
  } catch (error: any) {
    throw createHttpError(error?.message);
  }
};

// upload multiple files (images)
export const uploadMultipleImages = async (
  files: fileUpload.UploadedFile[],
  folderName: string
) => {
  try {
    const urlPromises = files?.map(async (file) => {
      // upload image to cloudinary
      const url = await uploadImage(file, folderName);
      return url;
    });

    const urls = await Promise.all(urlPromises);

    return urls;
  } catch (error: any) {
    throw createHttpError(error?.message);
  }
};
