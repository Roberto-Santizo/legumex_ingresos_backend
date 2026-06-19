import { Request, Response } from "express";
export declare const getDashboardSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getInPlantAt: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVisitsByCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
