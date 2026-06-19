import { Request, Response } from "express";
export declare const searchExternalEmployees: (req: Request, response: Response) => Promise<Response<any, Record<string, any>>>;
export declare const findOrCreateEmployeeBenefited: (req: Request, response: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getEmployeeBenefiteds: (req: Request, response: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteEmployeeBenefited: (req: Request, response: Response) => Promise<Response<any, Record<string, any>>>;
