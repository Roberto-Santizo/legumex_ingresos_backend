import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface JwtPayload {
    id: number
    name: string
    username: string
    role: string
    permissions: string[]
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

export const checkPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const permissions: string[] = req.user?.permissions ?? []
        if (!permissions.includes(permission)) {
            return res.status(403).json({ statusCode: 403, message: "No tienes permiso para realizar esta acción" })
        }
        next()
    }
}
