import {Image} from "../../models/image.model";
import {IImage} from "./image.interface";

export function imageToIImage(image: Image): IImage {
    return {
        id: image.id,
        title: image.title,
        url: image.url,
    };
}