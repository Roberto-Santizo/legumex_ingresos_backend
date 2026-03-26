import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import {
    createCompanyPerson,
    getCompanyPersons,
    getCompanyPersonById,
    getCompanyPersonsByCompany,
    updateCompanyPerson,
    deleteCompanyPerson,
} from "../handlers/companyPerson"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('people:create'),
    body("company_id").notEmpty().isInt().withMessage("company_id es requerido"),
    body("name").notEmpty().withMessage("name es requerido"),
    body("document_number").notEmpty().withMessage("document_number es requerido"),
    handleInputErrors,
    createCompanyPerson
)

router.get("/",
    validateJWT,
    checkPermission('people:view'),
    getCompanyPersons
)

// Listar personas de una empresa especifica
router.get("/by-company/:company_id",
    validateJWT,
    checkPermission('people:view'),
    param("company_id").isInt().withMessage("company_id no válido"),
    handleInputErrors,
    getCompanyPersonsByCompany
)

router.get("/:id",
    validateJWT,
    checkPermission('people:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getCompanyPersonById
)

router.patch("/:id",
    validateJWT,
    checkPermission('people:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateCompanyPerson
)

router.delete("/:id",
    validateJWT,
    checkPermission('people:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteCompanyPerson
)

export default router
