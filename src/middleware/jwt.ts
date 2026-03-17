import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface JwtPayload {
    id: number
    name: string
    username: string
    role: string
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"]

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ statusCode: 401, message: "Token no proporcionado" })
    }

    const token = authHeader.split(" ")[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        req.user = payload
        next()
    } catch {
        return res.status(401).json({ statusCode: 401, message: "Token inválido o expirado" })
    }
}