import { Router } from "express"
import { body } from "express-validator"
import rateLimit from "express-rate-limit"
import { handleInputErrors } from "../../middleware"
import { validateJWT } from "../../middleware/jwt"
import { login, checkStatus, refresh, logout } from "../../handlers/AccessControl/auth"

const router = Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { statusCode: 429, message: 'Demasiados intentos de inicio de sesion, intenta de nuevo en 15 minutos' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})


router.post("/",
    loginLimiter,
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    handleInputErrors,
    login
)


router.get("/check-status", validateJWT, checkStatus)


router.post("/refresh",
    body("refreshToken").notEmpty().withMessage("refreshToken es requerido"),
    handleInputErrors,
    refresh
)

router.post("/logout", logout)

export default router
