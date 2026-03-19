import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createRole, getRoles, getRoleById, updateRole } from "../handlers/role"
import { getRolePermissions, updateRolePermissions } from "../handlers/permission"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('roles:create'),
    body("name").notEmpty().withMessage("Name is required"),
    handleInputErrors,
    createRole
)

router.get("/",
    validateJWT,
    checkPermission('roles:view'),
    getRoles
)

router.get("/:id",
    validateJWT,
    checkPermission('roles:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getRoleById
)

router.patch("/:id",
    validateJWT,
    checkPermission('roles:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateRole
)

// Gestión de permisos por rol
router.get("/:id/permissions",
    validateJWT,
    checkPermission('roles:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getRolePermissions
)

router.put("/:id/permissions",
    validateJWT,
    checkPermission('roles:edit'),
    param("id").isInt().withMessage("Id no válido"),
    body("permissions").isArray().withMessage("permissions debe ser un arreglo"),
    handleInputErrors,
    updateRolePermissions
)

export default router
