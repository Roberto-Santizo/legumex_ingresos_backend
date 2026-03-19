import { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.model"
import Role from "../models/Role.model"
import Permission from "../models/Permission.model"
import { JwtPayload } from "../middleware/jwt"

const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "200d") as jwt.SignOptions["expiresIn"]
    })
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body

        const user = await User.findOne({
            where: { username },
            include: [{
                model: Role,
                include: [{ model: Permission }]
            }]
        })

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" })
        }

        const role = (user as any).role
        const roleName: string = role?.name ?? "unknown"
        const permissions: string[] = (role?.permissions ?? []).map((p: Permission) => p.name)

        const payload: JwtPayload = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: roleName,
            permissions
        }

        const token = generateToken(payload)

        return res.status(200).json({ data: payload, token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error interno del servidor" })
    }
}

export const checkStatus = async (req: Request, res: Response) => {
    const { id } = req.user!

    // Re-fetch fresh permissions from DB in case they changed
    const user = await User.findByPk(id, {
        include: [{
            model: Role,
            include: [{ model: Permission }]
        }]
    })

    if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" })
    }

    const role = (user as any).role
    const roleName: string = role?.name ?? "unknown"
    const permissions: string[] = (role?.permissions ?? []).map((p: Permission) => p.name)

    const freshPayload: JwtPayload = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: roleName,
        permissions
    }

    const token = generateToken(freshPayload)

    return res.status(200).json({ data: freshPayload, token })
}
