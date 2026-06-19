import { Request, Response } from "express";
export declare const getAllPermissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRolePermissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateRolePermissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
