import { Request, Response } from "express";
export declare const createVisitCompanion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVisitCompanions: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVisitCompanionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteVisitCompanion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
