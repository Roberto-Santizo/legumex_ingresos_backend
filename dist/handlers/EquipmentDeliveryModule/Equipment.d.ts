import { Request, Response } from "express";
export declare const createEquipment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getEquipments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getEquipmentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateEquipment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
