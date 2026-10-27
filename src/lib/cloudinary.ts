import { v2 as cloudinary } from 'cloudinary';

// Cloudinary automatically picks up CLOUDINARY_URL if available
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqrhieirs',
    api_key: process.env.CLOUDINARY_API_KEY || '796724996161429',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'imdciz1F9_cA7i0P-SXND2bRlos',
    secure: true,
  });
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

/**
 * Upload a base64 or buffer image to Cloudinary
 * Strictly checks that the file size is under 1MB (1,048,576 bytes)
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  folder = 'amarghor_properties'
): Promise<string> {
  // Check approximate payload size for base64
  // base64 size in bytes = (len * 3/4) - padding
  const stringLength = base64Data.length - (base64Data.indexOf(',') + 1);
  const sizeInBytes = Math.ceil((stringLength * 3) / 4);

  const MAX_BYTES = 1024 * 1024; // strictly 1 MB
  if (sizeInBytes > MAX_BYTES) {
    throw new Error(`Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB) exceeds strictly allowed limit of 1 MB`);
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || 'Cloudinary upload failed'));
        }
        if (!result) {
          return reject(new Error('No response from Cloudinary'));
        }

        // Additional safeguard: verify the returned file size
        if (result.bytes && result.bytes > MAX_BYTES) {
          // Clean up if it exceeded 1MB
          cloudinary.uploader.destroy(result.public_id).catch(() => {});
          return reject(new Error('Image exceeds 1MB limit'));
        }

        resolve(result.secure_url);
      }
    );
  });
}

export default cloudinary;
