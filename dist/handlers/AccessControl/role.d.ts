import { Request, Response } from "express";
export declare const createRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRoleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
