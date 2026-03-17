import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createCompanion, getCompanions, getCompanionById, updateCompanion, deleteCompanion } from "../handlers/companion"

const router = Router()

router.post("/",
    body("full_name").notEmpty().withMessage("full_name es requerido"),
    body("document_number").notEmpty().withMessage("document_number es requerido"),
    handleInputErrors,
    createCompanion
)

router.get("/", getCompanions)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getCompanionById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateCompanion
)

router.delete("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteCompanion
)

export default router