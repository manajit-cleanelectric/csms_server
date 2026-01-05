import multer, {Multer} from 'multer';
import path from 'path';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import * as fs from 'node:fs';
import sharp from 'sharp';
import { STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER } from '../app';

interface MulterRequest extends Request {
    files?: {
        [fieldName: string]: Express.Multer.File[];
    };
    user?: (Request['user'] & {
        firstName?: string;
        lastName?: string;
    }) | undefined;
    body: {
        invoiceProofUrls?: string[];
        rcImageUrls?: string[];
        [key: string]: any;
    };
}

// Use memory storage for better performance with Sharp
const upload: Multer = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 10 // Maximum total files
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
 * Processes multiple images from a field
 */
const processFieldImages = async (
    files: Express.Multer.File[],
    uploadPath: string,
    fieldName: string,
    req: MulterRequest
): Promise<string[]> => {
    const processedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const phoneNumber = sanitizeFilename(req.user?.phoneNumber || '0000000000');
        const timestamp = Date.now();
        const fileName = `${phoneNumber}_${timestamp}_${fieldName}_${i}.jpeg`;

        const url = await processImage(file.buffer, uploadPath, fileName);
        processedUrls.push(url);
    }

    return processedUrls;
};

/**
 * Middleware to upload and process multiple image fields
 */
const uploadProofImage: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    const mReq = req as MulterRequest;

    const Upload = upload.fields([
        { name: 'invoiceProof', maxCount: 5 },
        { name: 'rcImage', maxCount: 5 }
    ]);

    Upload(mReq, res, async (err: any) => {
        // Handle multer errors
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: false,
                    message: 'File size exceeds 5MB limit'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    status: false,
                    message: 'Too many files uploaded'
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
            mReq.body = mReq.body || {};

            // Ensure upload directory exists
            const uploadPath = path.join(STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            // Process files if they exist
            if (mReq.files && typeof mReq.files === 'object' && !Array.isArray(mReq.files)) {
                // Process invoiceProof images
                if (mReq.files.invoiceProof && mReq.files.invoiceProof.length > 0) {
                    req.body.invoiceProofUrls = await processFieldImages(
                        mReq.files.invoiceProof,
                        uploadPath,
                        'invoiceProof',
                        mReq
                    );
                } else {
                    req.body.invoiceProofUrls = [];
                }

                // Process rcImage images
                if (mReq.files.rcImage && mReq.files.rcImage.length > 0) {
                    req.body.rcImageUrls = await processFieldImages(
                        mReq.files.rcImage,
                        uploadPath,
                        'rcImage',
                        mReq
                    );
                } else {
                    mReq.body.rcImageUrls = [];
                }
            } else {
                // No files uploaded
                mReq.body.invoiceProofUrls = [];
                mReq.body.rcImageUrls = [];
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
    uploadProofImage,
};