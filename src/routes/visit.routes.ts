import { Router } from "express"
import { param } from "express-validator"
import { handleInputErrors } from "../middleware"
import {
    createVisit,
    getVisits,
    getVisitsToday,
    getVisitsActive,
    getVisitById,
    checkIn,
    checkOut,
    cancelVisit,
} from "../handlers/visit"

const router = Router()

// Rutas específicas primero (antes de /:id para evitar conflictos)
router.get("/today", getVisitsToday)
router.get("/active", getVisitsActive)

router.post("/", createVisit)
router.get("/", getVisits)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getVisitById
)

router.patch("/:id/checkin",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    checkIn
)

router.patch("/:id/checkout",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    checkOut
)

router.patch("/:id/cancel",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    cancelVisit
)

export default router
