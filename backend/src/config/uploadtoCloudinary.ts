import cloudinary from "./cloudinary";

interface UploadResult {
  url: string;
  publicId: string;
  duration?: number;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: "video" | "image" | "raw" = "image",
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
          duration: result!.duration,
        });
      },
    );
    stream.end(buffer);
  });
};
