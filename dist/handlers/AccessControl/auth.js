"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.checkStatus = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AccessControl_1 = require("../../models/AccessControl");
const jwt_1 = require("../../middleware/jwt");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m")
    });
};
const generateRefreshToken = (userId) => {
    const payload = { id: userId, type: 'refresh' };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d")
    });
};
const fetchUserWithPermissions = async (userId) => {
    return AccessControl_1.User.findByPk(userId, {
        include: [{ model: AccessControl_1.Role, include: [{ model: AccessControl_1.Permission }] }]
    });
};
const buildPayload = (user) => {
    const role = user.role;
    const permissions = (role?.permissions ?? []).map((p) => p.name);
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: role?.name ?? 'unknown',
        permissions
    };
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const user = await AccessControl_1.User.findOne({
            where: { username },
            include: [{ model: AccessControl_1.Role, include: [{ model: AccessControl_1.Permission }] }]
        });
        if (!user) {
            console.warn(`[AUTH] Failed login - username:"${username}" ip:${ip}`);
            return res.status(401).json({ message: "Credenciales invalidas" });
        }
        // Check if account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            const minutesLeft = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
            console.warn(`[AUTH] Blocked login attempt on locked account - username:"${username}" ip:${ip}`);
            return res.status(423).json({
                message: `Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`
            });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            const newCount = (user.failed_attempts ?? 0) + 1;
            const updates = { failed_attempts: newCount };
            if (newCount >= MAX_FAILED_ATTEMPTS) {
                updates.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
                console.warn(`[AUTH] Account locked after ${newCount} attempts - username:"${username}" ip:${ip}`);
            }
            else {
                console.warn(`[AUTH] Failed login (${newCount}/${MAX_FAILED_ATTEMPTS}) - username:"${username}" ip:${ip}`);
            }
            await user.update(updates);
            return res.status(401).json({ message: "Credenciales invalidas" });
        }
        // Reset lockout on successful login
        await user.update({ failed_attempts: 0, locked_until: null });
        const payload = buildPayload(user);
        const token = generateToken(payload);
        const refreshToken = generateRefreshToken(user.id);
        console.log(`[AUTH] Login - userId:${user.id} username:${username} ip:${ip}`);
        return res.status(200).json({ data: payload, token, refreshToken });
    }
    catch (error) {
        console.error('[AUTH] Login error:', error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.login = login;
const checkStatus = async (req, res) => {
    const { id } = req.user;
    const user = await fetchUserWithPermissions(id);
    if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
    }
    const payload = buildPayload(user);
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(id);
    return res.status(200).json({ data: payload, token, refreshToken });
};
exports.checkStatus = checkStatus;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: "Token invalido" });
        }
        const user = await fetchUserWithPermissions(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        const payload = buildPayload(user);
        const newToken = generateToken(payload);
        const newRefreshToken = generateRefreshToken(decoded.id);
        return res.status(200).json({ data: payload, token: newToken, refreshToken: newRefreshToken });
    }
    catch {
        return res.status(401).json({ message: "Refresh token invalido o expirado" });
    }
};
exports.refresh = refresh;
const logout = (_req, res) => {
    return res.status(200).json({ message: "Sesion cerrada correctamente" });
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map