import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../../middleware"
import { createVisitCompanion, getVisitCompanions, getVisitCompanionById, deleteVisitCompanion } from "../../handlers/VisitsModule/visitCompanion"
import { validateJWT, checkPermission } from "../../middleware/jwt"

const router = Router()

router.use(validateJWT)

router.post("/",
    checkPermission('visits:create'),
    body("visit_id").notEmpty().isInt().withMessage("visit_id es requerido y debe ser un numero"),
    body("visitor_person_id").notEmpty().isInt().withMessage("visitor_person_id es requerido y debe ser un numero"),
    handleInputErrors,
    createVisitCompanion
)

router.get("/",
    checkPermission('visits:view:all'),
    getVisitCompanions
)

router.get("/:id",
    checkPermission('visits:view'),
    param("id").isInt().withMessage("Id no valido"),
    handleInputErrors,
    getVisitCompanionById
)

router.delete("/:id",
    checkPermission('visits:edit'),
    param("id").isInt().withMessage("Id no valido"),
    handleInputErrors,
    deleteVisitCompanion
)

export default router
