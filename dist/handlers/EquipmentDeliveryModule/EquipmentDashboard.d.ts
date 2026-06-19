import { Request, Response } from "express";
export declare const getEquipmentDashboardSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDeliveriesByEquipment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPendingEmployees: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
