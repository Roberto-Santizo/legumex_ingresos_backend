import { Router } from "express"
import { param } from "express-validator"
import { handleInputErrors } from "../middleware"
import {
    createVisit,
    updateVisit,
    deleteVisit,
    getVisits,
    getVisitsToday,
    getVisitsActive,
    getVisitById,
    checkIn,
    checkOut,
    cancelVisit,
} from "../handlers/visit"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

// Rutas específicas primero (antes de /:id para evitar conflictos)
router.get("/today",
    validateJWT,
    checkPermission('visits:view'),
    getVisitsToday
)

router.get("/active",
    validateJWT,
    checkPermission('visits:view'),
    getVisitsActive
)

router.post("/",
    validateJWT,
    checkPermission('visits:create'),
    createVisit
)

router.get("/",
    validateJWT,
    checkPermission('visits:view'),
    getVisits
)

router.get("/:id",
    validateJWT,
    checkPermission('visits:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getVisitById
)

router.patch("/:id/checkin",
    validateJWT,
    checkPermission('visits:checkin'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    checkIn
)

router.patch("/:id/checkout",
    validateJWT,
    checkPermission('visits:checkout'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    checkOut
)

router.patch("/:id/cancel",
    validateJWT,
    checkPermission('visits:cancel'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    cancelVisit
)

router.patch("/:id",
    validateJWT,
    checkPermission('visits:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateVisit
)

router.delete("/:id",
    validateJWT,
    checkPermission('visits:delete'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteVisit
)

export default router
