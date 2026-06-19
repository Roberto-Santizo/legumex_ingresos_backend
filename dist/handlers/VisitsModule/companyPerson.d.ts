import { Request, Response } from "express";
export declare const createCompanyPerson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompanyPersons: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompanyPersonById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompanyPersonsByCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCompanyPerson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCompanyPerson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
