import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {UserRoles} from '../models/users';
import {JWT_SECRET_KEY} from "../app";

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

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authorization header missing or malformed' });
            return;
        }
        const token = authHeader.replace('Bearer ', '').trim();
        const { user } = jwt.verify(token, JWT_SECRET_KEY) as { user: UserPayload; iat: number; exp: number };
        req.user = user;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, message: 'Token expired', data: null });
            return;
        }
        res.status(401).json({ success: false, message: 'Invalid or missing token', data: null });
        return;
    }
};

const authorize = (...allowedRoles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as UserPayload | undefined;
        if (!user || !allowedRoles.includes(user.role as UserRoles)) {
            res.status(403).json({ success: false, message: 'Forbidden: Access denied', data: null });
            return;
        }
        next();
    };
};

export  {
    authenticate,
    authorize,
    UserPayload
}
