// src/utils/cloudinary.js

import { v2 as cloudinary } from 'cloudinary'; // Import v2 for Cloudinary operations
import fs from 'fs'; // Node.js file system module for file operations (e.g., unlink)
import dotenv from 'dotenv';
import { ApiError } from './ApiError.js'; // Assuming you have ApiError

dotenv.config({ path: './.env' }); // Ensure environment variables are loaded

// Configure Cloudinary using credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a local file to Cloudinary.
 * @param {string} localFilePath - The absolute path to the local file to be uploaded.
 * @returns {Promise<object | null>} - A promise that resolves with the Cloudinary response
 * object if upload is successful, or null if it fails.
 * @throws {ApiError} - If Cloudinary credentials are not configured.
 */
const uploadOnCloudinary = async (localFilePath) => {
    // Basic validation for Cloudinary credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary credentials are not fully configured in environment variables.");
        throw new ApiError(500, "Cloudinary service not configured. Missing credentials.");
    }

    if (!localFilePath) {
        // If no file path is provided, it's not an error but means nothing to upload.
        // It's good to log this for debugging, but we return null/resolve promise.
        console.warn("No local file path provided for Cloudinary upload.");
        return null;
    }

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detect the resource type (image, video, raw)
        });

        // File has been uploaded successfully
        // console.log("File uploaded successfully on Cloudinary:", response.url);

        // Remove the locally saved temporary file after successful upload
        // fs.unlinkSync(localFilePath); // Sync version, consider async for non-blocking
        fs.unlink(localFilePath, (err) => { // Async version
            if (err) {
                console.error(`Failed to delete local file ${localFilePath}:`, err);
            } else {
                // console.log(`Local file ${localFilePath} deleted.`);
            }
        });

        return response; // Return the Cloudinary response (contains URL, public_id, etc.)

    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // If the upload failed, still attempt to remove the locally saved temporary file
        // in case it was created.
        if (fs.existsSync(localFilePath)) {
             // fs.unlinkSync(localFilePath); // Sync version
             fs.unlink(localFilePath, (err) => { // Async version
                if (err) {
                    console.error(`Failed to delete local file ${localFilePath} after upload error:`, err);
                }
            });
        }

        throw new ApiError(500, `Failed to upload file to Cloudinary: ${error.message || 'Unknown Cloudinary error.'}`);
    }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the resource to delete on Cloudinary.
 * @returns {Promise<object>} - A promise that resolves with the Cloudinary deletion result.
 * @throws {ApiError} - If deletion fails.
 */
const deleteFromCloudinary = async (publicId) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary credentials are not fully configured in environment variables.");
        throw new ApiError(500, "Cloudinary service not configured. Missing credentials.");
    }
    if (!publicId) {
        throw new ApiError(400, "Public ID is required to delete from Cloudinary.");
    }

    try {
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(`File with public ID '${publicId}' deleted from Cloudinary:`, response);
        return response;
    } catch (error) {
        console.error(`Failed to delete file with public ID '${publicId}' from Cloudinary:`, error);
        throw new ApiError(500, `Failed to delete file from Cloudinary: ${error.message || 'Unknown Cloudinary error.'}`);
    }
};


export { uploadOnCloudinary, deleteFromCloudinary };
