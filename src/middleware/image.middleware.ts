import multer, {StorageEngine} from 'multer';
import path from 'path';
import {NextFunction, Request, Response} from 'express';
import * as fs from "node:fs";

// Set up a storage engine
const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        const uploadPath = path.join(__dirname, '../../uploads/rcImages');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (
        req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Extend a Request type to include a file property
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const uploadRcImage = (req: MulterRequest, res: Response, next: NextFunction) => {
    const singleUpload = upload.single('rcImage');
    singleUpload(req, res, function (err: any) {
        if (err) {
            return res.status(400).json({ status: false, message: 'Image upload failed', error: err.message });
        }
        if (req.file) {
            req.body.rcImageUrl = `/uploads/rcImages/${req.file.filename}`;
        } else {
            req.body.rcImageUrl = null; // Handle case where no file is uploaded
        }
        next();
    });
};

export {
    uploadRcImage,
    MulterRequest,
};
