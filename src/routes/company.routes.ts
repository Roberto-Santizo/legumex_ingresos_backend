import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createCompany, getCompanies, getCompanyById, updateCompany } from "../handlers/company"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('companies:create'),
    body("name").notEmpty().withMessage("name es requerido"),
    handleInputErrors,
    createCompany
)

router.get("/",
    validateJWT,
    checkPermission('companies:view'),
    getCompanies
)

router.get("/:id",
    validateJWT,
    checkPermission('companies:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getCompanyById
)

router.patch("/:id",
    validateJWT,
    checkPermission('companies:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateCompany
)

export default router
