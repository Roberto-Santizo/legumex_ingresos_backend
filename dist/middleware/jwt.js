"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = exports.verifyRefreshToken = exports.validateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ statusCode: 401, message: "Token no proporcionado" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        const expired = err?.name === 'TokenExpiredError';
        return res.status(401).json({
            statusCode: 401,
            message: expired ? "Token expirado" : "Token inválido",
            expired
        });
    }
};
exports.validateJWT = validateJWT;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
const checkPermission = (permission) => {
    return (req, res, next) => {
        const permissions = req.user?.permissions ?? [];
        if (!permissions.includes(permission)) {
            console.warn(`[AUTH] 403 userId:${req.user?.id} permission_required:${permission} ${req.method} ${req.path}`);
            return res.status(403).json({ statusCode: 403, message: "No tienes permiso para realizar esta acción" });
        }
        next();
    };
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=jwt.js.map