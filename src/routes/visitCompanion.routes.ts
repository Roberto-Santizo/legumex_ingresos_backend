import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createVisitCompanion, getVisitCompanions, getVisitCompanionById, deleteVisitCompanion } from "../handlers/visitCompanion"

const router = Router()

router.post("/",
    body("visit_id").notEmpty().isInt().withMessage("visit_id es requerido y debe ser un número"),
    body("visitor_person_id").notEmpty().isInt().withMessage("visitor_person_id es requerido y debe ser un número"),
    handleInputErrors,
    createVisitCompanion
)

router.get("/", getVisitCompanions)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getVisitCompanionById
)

router.delete("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteVisitCompanion
)

export default router