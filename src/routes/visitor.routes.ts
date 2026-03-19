import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createVisitor, getVisitors, getVisitorById, updateVisitor } from "../handlers/visitor"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('visitors:create'),
    body("name").notEmpty().withMessage("name es requerido"),
    handleInputErrors,
    createVisitor
)

router.get("/",
    validateJWT,
    checkPermission('visitors:view'),
    getVisitors
)

router.get("/:id",
    validateJWT,
    checkPermission('visitors:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getVisitorById
)

router.patch("/:id",
    validateJWT,
    checkPermission('visitors:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateVisitor
)

export default router
