import multer from 'multer';
import path from 'path';
import {NextFunction, Request, Response} from 'express';
import * as fs from "node:fs";
import sharp from 'sharp';
import {STATIC_FOLDER, STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER} from "../app";

// Set up a storage engine
const upload = multer({storage: multer.memoryStorage()});

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const uploadRcImage = async (req: MulterRequest, res: Response, next: NextFunction) => {
    const singleUpload = upload.single('rcImage');
    singleUpload(req, res, async function (err: any) {
        if (err) {
            return res.status(400).json({status: false, message: 'Image upload failed', error: err.message});
        }
        if (req.file) {
            const uploadPath = path.join(STATIC_FOLDER_PATH, MEDIA_FOLDER, RC_IMAGE_FOLDER);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, {recursive: true});
            }
            const uniqueSuffix = Date.now() + '_' + req.user?.firstName + '_' + req.user?.lastName + '.jpeg';
            const filePath = path.join(uploadPath, uniqueSuffix);

            await sharp(req.file.buffer)
                .resize({
                    width: 800,
                    height: 600,
                    fit: 'inside',
                    withoutEnlargement: true
                }) // Reduce resolution, preserve aspect ratio
                .toFile(filePath);

            req.body.rcImageUrl = `${MEDIA_FOLDER}/${RC_IMAGE_FOLDER}/${uniqueSuffix}`;
        } else {
            req.body.rcImageUrl = null;
        }
        next();
    });
};

export {
    uploadRcImage,
    MulterRequest,
};
