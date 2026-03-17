import { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.model"
import Role from "../models/Role.model"
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
            include: [{ model: Role }]
        })

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" })
        }

        const roleName: string = (user as any).role?.name ?? "unknown"

        const payload: JwtPayload = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: roleName
        }

        const token = generateToken(payload)

        return res.status(200).json({ data: payload, token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error interno del servidor" })
    }
}

export const checkStatus = (req: Request, res: Response) => {
    const { id, name, username, role } = req.user!

    const token = generateToken({ id, name, username, role })

    return res.status(200).json({ data: { id, name, username, role }, token })
}
