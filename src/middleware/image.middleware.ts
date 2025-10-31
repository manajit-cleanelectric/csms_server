import multer from 'multer';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'node:fs';
import sharp from 'sharp';
import { STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER } from '../app';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
    user?: (Request['user'] & {
        firstName?: string;
        lastName?: string;
    }) | undefined;
    body: {
        rcImageUrl?: string | null;
        [key: string]: any;
    };
}

// Use memory storage for better performance with Sharp
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
        }
    },
});

/**
 * Sanitizes filename components to prevent path traversal
 */
const sanitizeFilename = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
};

/**
 * Processes and saves the uploaded image
 */
const processImage = async (
    buffer: Buffer,
    uploadPath: string,
    fileName: string
): Promise<string> => {
    const filePath = path.join(uploadPath, fileName);
    const relativePath = path.join(MEDIA_FOLDER, RC_IMAGE_FOLDER, fileName);

    await sharp(buffer)
        .resize({
            width: 800,
            height: 600,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .jpeg({ quality: 85 }) // Optimize quality
        .toFile(filePath);

    return relativePath;
};

/**
 * Middleware to upload and process RC images
 */
const uploadRcImage = (req: MulterRequest, res: Response, next: NextFunction): void => {
    const singleUpload = upload.single('rcImage');

    singleUpload(req, res, async (err: any) => {
        // Handle multer errors
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: false,
                    message: 'File size exceeds 5MB limit'
                });
            }
            return res.status(400).json({
                status: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                status: false,
                message: `Image upload failed: ${err.message}`
            });
        }

        try {
            // Initialize req.body if undefined
            req.body = req.body || {};

            if (req.file) {
                // Ensure upload directory exists
                const uploadPath = path.join(STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER);
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                // Generate safe filename
                const firstName = sanitizeFilename(req.user?.firstName || 'user');
                const lastName = sanitizeFilename(req.user?.lastName || 'unknown');
                const timestamp = Date.now();
                const fileName = `${timestamp}_${firstName}_${lastName}.jpeg`;

                // Process image from memory buffer (no temp file cleanup needed)
                req.body.rcImageUrl = await processImage(
                    req.file.buffer,
                    uploadPath,
                    fileName
                );
            } else {
                req.body.rcImageUrl = null;
            }

            next();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                status: false,
                message: `Image processing failed: ${errorMessage}`
            });
        }
    });
};

export {
    uploadRcImage,
};
