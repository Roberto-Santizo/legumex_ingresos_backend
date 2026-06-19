import { Request, Response } from "express";
export declare const createPeople: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPeople: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPeopleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePeople: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePeople: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
