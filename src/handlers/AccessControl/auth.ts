import { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User, Role, Permission } from "../../models/AccessControl"
import { JwtPayload, JwtRefreshPayload, verifyRefreshToken } from "../../middleware/jwt"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"]
    })
}

const generateRefreshToken = (userId: number): string => {
    const payload: JwtRefreshPayload = { id: userId, type: 'refresh' }
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"]
    })
}

const fetchUserWithPermissions = async (userId: number) => {
    return User.findByPk(userId, {
        include: [{ model: Role, include: [{ model: Permission }] }]
    })
}

const buildPayload = (user: any): JwtPayload => {
    const role = user.role
    const permissions: string[] = (role?.permissions ?? []).map((p: Permission) => p.name)
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: role?.name ?? 'unknown',
        permissions
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const ip = req.ip || req.socket?.remoteAddress || 'unknown'

        const user = await User.findOne({
            where: { username },
            include: [{ model: Role, include: [{ model: Permission }] }]
        })

        if (!user) {
            console.warn(`[AUTH] Failed login - username:"${username}" ip:${ip}`)
            return res.status(401).json({ message: "Credenciales invalidas" })
        }

        // Check if account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            const minutesLeft = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000)
            console.warn(`[AUTH] Blocked login attempt on locked account - username:"${username}" ip:${ip}`)
            return res.status(423).json({
                message: `Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            const newCount = (user.failed_attempts ?? 0) + 1
            const updates: { failed_attempts: number; locked_until?: Date } = { failed_attempts: newCount }

            if (newCount >= MAX_FAILED_ATTEMPTS) {
                updates.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                console.warn(`[AUTH] Account locked after ${newCount} attempts - username:"${username}" ip:${ip}`)
            } else {
                console.warn(`[AUTH] Failed login (${newCount}/${MAX_FAILED_ATTEMPTS}) - username:"${username}" ip:${ip}`)
            }

            await user.update(updates)
            return res.status(401).json({ message: "Credenciales invalidas" })
        }

        // Reset lockout on successful login
        await user.update({ failed_attempts: 0, locked_until: null })

        const payload = buildPayload(user)
        const token = generateToken(payload)
        const refreshToken = generateRefreshToken(user.id)

        console.log(`[AUTH] Login - userId:${user.id} username:${username} ip:${ip}`)

        return res.status(200).json({ data: payload, token, refreshToken })
    } catch (error) {
        console.error('[AUTH] Login error:', error)
        return res.status(500).json({ message: "Error interno del servidor" })
    }
}

export const checkStatus = async (req: Request, res: Response) => {
    const { id } = req.user!

    const user = await fetchUserWithPermissions(id)
    if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" })
    }

    const payload = buildPayload(user)
    const token = generateToken(payload)
    const refreshToken = generateRefreshToken(id)

    return res.status(200).json({ data: payload, token, refreshToken })
}

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body

        const decoded = verifyRefreshToken(refreshToken)
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: "Token invalido" })
        }

        const user = await fetchUserWithPermissions(decoded.id)
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" })
        }

        const payload = buildPayload(user)
        const newToken = generateToken(payload)
        const newRefreshToken = generateRefreshToken(decoded.id)

        return res.status(200).json({ data: payload, token: newToken, refreshToken: newRefreshToken })
    } catch {
        return res.status(401).json({ message: "Refresh token invalido o expirado" })
    }
}

export const logout = (_req: Request, res: Response) => {
    return res.status(200).json({ message: "Sesion cerrada correctamente" })
}
