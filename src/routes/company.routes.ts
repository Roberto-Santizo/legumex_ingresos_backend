import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createCompany, getCompanies, getCompanyById,updateCompany } from "../handlers/company"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("Name is required"),
    handleInputErrors,
    createCompany
)

router.get("/", getCompanies)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getCompanyById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateCompany
)

export default router