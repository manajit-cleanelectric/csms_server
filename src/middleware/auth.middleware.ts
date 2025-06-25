import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {UserRoles} from '../models/users'

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
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY!) as UserPayload;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        res.status(401).json({ message: 'Invalid or missing token' });
        return;
    }
};

const authorize = (...allowedRoles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as UserPayload | undefined;
        if (!user || !allowedRoles.includes(user.role as UserRoles)) {
            res.status(403).json({ message: 'Forbidden: Access denied' });
            return;
        }
        next();
    };
};

export  {
    authenticate,
    authorize
}
