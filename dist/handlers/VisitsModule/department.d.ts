import { Request, Response } from "express";
export declare const createDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDepartments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDepartmentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
