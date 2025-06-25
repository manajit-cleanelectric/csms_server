import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    phoneNumber: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
            session?: any;
        }
    }
}

// export const currentUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     if (!req.session?.jwt) {
//         return next();
//     }
//     try {
//         req.user = jwt.verify(req.session.jwt, process.env.JWT_SECRET_KEY!) as UserPayload;
//     } catch (error) {
//         throw new Error('Invalid JWT');
//     }
//     next();
// };
