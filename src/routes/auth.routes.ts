import { Router } from "express"
import { body } from "express-validator"
import { handleInputErrors } from "../middleware"
import { validateJWT } from "../middleware/jwt"
import { login, checkStatus } from "../handlers/auth"

const router = Router()

// POST /api/login
router.post("/",
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    handleInputErrors,
    login
)

// GET /api/check-status
router.get("/check-status", validateJWT, checkStatus)

export default router