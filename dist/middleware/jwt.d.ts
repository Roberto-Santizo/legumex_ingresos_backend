import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    id: number;
    name: string;
    username: string;
    role: string;
    permissions: string[];
}
export interface JwtRefreshPayload {
    id: number;
    type: 'refresh';
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const validateJWT: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const verifyRefreshToken: (token: string) => JwtRefreshPayload;
export declare const checkPermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
