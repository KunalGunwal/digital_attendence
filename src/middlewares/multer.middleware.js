// src/middlewares/multer.middleware.js

import multer from "multer";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs'; // Node.js file system module

// Get __dirname equivalent in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the temporary upload directory
const tempUploadDir = join(__dirname, '../../public/temp'); // Assuming public is at the root of src, and temp inside public

// Ensure the temporary directory exists
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadDir); // Files will be temporarily saved in the 'public/temp' directory
    },
    filename: function (req, file, cb) {
        // Use a unique name to prevent collisions. You could also use file.originalname
        // but adding a timestamp or UUID is safer.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

// Configure Multer to accept single file uploads with the field name 'photo'
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});
