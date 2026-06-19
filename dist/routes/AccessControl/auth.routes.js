"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const middleware_1 = require("../../middleware");
const jwt_1 = require("../../middleware/jwt");
const auth_1 = require("../../handlers/AccessControl/auth");
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { statusCode: 429, message: 'Demasiados intentos de inicio de sesion, intenta de nuevo en 15 minutos' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Solo cuenta intentos fallidos, igual que el contador de bloqueo de cuenta en la BD
    skipSuccessfulRequests: true,
    // Limita por cuenta intentada (username), no por IP compartida (proxy/red corporativa)
    keyGenerator: (req) => {
        const username = typeof req.body?.username === "string" ? req.body.username.toLowerCase() : "";
        return username ? `user:${username}` : (0, express_rate_limit_1.ipKeyGenerator)(req.ip);
    },
});
router.post("/", loginLimiter, (0, express_validator_1.body)("username").notEmpty().withMessage("Username is required"), (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"), middleware_1.handleInputErrors, auth_1.login);
router.get("/check-status", jwt_1.validateJWT, auth_1.checkStatus);
router.post("/refresh", (0, express_validator_1.body)("refreshToken").notEmpty().withMessage("refreshToken es requerido"), middleware_1.handleInputErrors, auth_1.refresh);
router.post("/logout", auth_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map