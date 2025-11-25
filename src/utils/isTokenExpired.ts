import jwt from 'jsonwebtoken';

export function isTokenExpired(token: string): boolean {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
}
