import path from "path";
import {logger} from "../services/logger.service";
import * as fs from "node:fs";

const STATIC_DIR = path.join(__dirname, "..", "..", process.env.STATIC_FOLDER!);

export function deleteImageFromDisk(imagePath: string): void {
    if (!imagePath) return;
    imagePath = path.join(STATIC_DIR, imagePath);
    fs.unlink(imagePath, (err) => {
        if (err) {
            logger.error(`Failed to delete image from disk: ${err.message}`);
        } else {
            logger.info(`Image deleted successfully from disk: ${imagePath}`);
        }
    });
}