import { Router } from "express"
import { getAllPermissions } from "../handlers/permission"
import { validateJWT } from "../middleware/jwt"

const router = Router()

router.get("/",
    validateJWT,
    getAllPermissions
)

export default router
