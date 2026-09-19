import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
}

/**
 * Uploads a base64 string or remote image URL to Cloudinary.
 * @param {string} imageSource - Base64 data URI or image URL
 * @param {string} [folder='infosys_menus'] - Target folder in Cloudinary
 * @returns {Promise<{ secureUrl: string, publicId: string }>}
 */
export const uploadToCloudinary = async (imageSource, folder = 'infosys_menus') => {
  if (!imageSource) {
    throw new Error('No image source provided for Cloudinary upload');
  }

  // If already a Cloudinary or remote HTTPS URL, return directly
  if (
    typeof imageSource === 'string' &&
    (imageSource.startsWith('https://res.cloudinary.com') ||
      imageSource.startsWith('http://') ||
      (imageSource.startsWith('https://') && !imageSource.startsWith('data:')))
  ) {
    return {
      secureUrl: imageSource,
      publicId: null,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(imageSource, {
      folder,
      resource_type: 'image',
    });

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]', error);
    throw error;
  }
};

export { cloudinary };
