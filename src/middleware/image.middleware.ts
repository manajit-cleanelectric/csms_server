import multer from 'multer';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'node:fs';
import sharp from 'sharp';
import { STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER } from '../app';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
    user?: any; // Added user property for filename generation
    body: {
        rcImageUrl?: string | null; // Use rcImageUrl for consistency
    };
}

// Set up disk storage
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const tempDir = path.join(STATIC_FOLDER_PATH, 'temp'); // Temp folder for uploads
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            cb(null, tempDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(7);
            cb(null, uniqueSuffix + path.extname(file.originalname)); // Temp filename
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Optional: Validate mime type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images allowed'));
        }
        cb(null, true);
    },
});

const uploadRcImage = async (req: MulterRequest, res: Response, next: NextFunction) => {
    const singleUpload = upload.single('rcImage');
    singleUpload(req, res, async function (err: any) {
        if (err) {
            return res.status(400).json({ status: false, message: `Image upload failed: ${err.message}` });
        }

        if (req.file) {
            req.body = req.body || {}; // Ensure req.body is always defined
            const uploadPath = path.join(STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            // Robust filename generation
            const firstName = req.user?.firstName || 'user';
            const lastName = req.user?.lastName || 'unknown';
            const uniqueSuffix = Date.now() + '_' + firstName + '_' + lastName + '.jpeg';
            const filePath = path.join(uploadPath, uniqueSuffix);
            const relativePath = path.join(MEDIA_FOLDER, RC_IMAGE_FOLDER, uniqueSuffix); // For rcImageUrl

            try {
                await sharp(req.file.path)
                    .resize({
                        width: 800,
                        height: 600,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .toFile(filePath);

                req.body.rcImageUrl = relativePath; // Set relative path for client use

                // Clean up temp file
                fs.unlinkSync(req.file.path);
            } catch (sharpErr) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                const errorMsg = (sharpErr instanceof Error) ? sharpErr.message : 'Unknown error';
                return res.status(500).json({ status: false, message: `Image processing failed: ${errorMsg}` });
            }
        } else {
            req.body = req.body || {}; // Ensure req.body is always defined
            req.body.rcImageUrl = null;
        }
        next();
    });
};

export {
    uploadRcImage,
};
