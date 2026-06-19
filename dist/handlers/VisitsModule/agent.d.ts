import { Request, Response } from "express";
export declare const createAgent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAgents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAgentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAgent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
