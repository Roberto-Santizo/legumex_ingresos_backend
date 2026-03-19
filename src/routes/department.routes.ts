import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../handlers/department"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('departments:create'),
    body("name").notEmpty().withMessage("name es requerido"),
    body("code").notEmpty().withMessage("code es requerido"),
    handleInputErrors,
    createDepartment
)

router.get("/",
    validateJWT,
    checkPermission('departments:view'),
    getDepartments
)

router.get("/:id",
    validateJWT,
    checkPermission('departments:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getDepartmentById
)

router.patch("/:id",
    validateJWT,
    checkPermission('departments:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateDepartment
)

router.delete("/:id",
    validateJWT,
    checkPermission('departments:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteDepartment
)

export default router
