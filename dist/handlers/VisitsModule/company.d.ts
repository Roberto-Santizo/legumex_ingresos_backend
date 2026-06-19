import { Request, Response } from "express";
export declare const createCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompanies: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompanyById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
