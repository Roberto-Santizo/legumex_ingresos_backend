import { Request, Response } from "express";
export declare const createDeliveryEquipmentTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDeliveryTransactionsByEmployee: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadFinalPhoto: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
