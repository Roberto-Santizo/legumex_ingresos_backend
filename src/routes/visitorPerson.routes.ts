import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import {
    createVisitorPerson,
    getVisitorPersons,
    getVisitorPersonById,
    getVisitorPersonsByVisitor,
    updateVisitorPerson,
    deleteVisitorPerson,
} from "../handlers/visitorPerson"
import { validateJWT } from "../middleware/jwt"

const router = Router()

router.use(validateJWT)

router.post("/",
    body("visitor_id").notEmpty().isInt().withMessage("visitor_id es requerido"),
    body("name").notEmpty().withMessage("name es requerido"),
    body("document_number").notEmpty().withMessage("document_number es requerido"),
    handleInputErrors,
    createVisitorPerson
)

router.get("/", getVisitorPersons)

// Listar personas de un visitante/empresa especifico
router.get("/by-visitor/:visitor_id",
    param("visitor_id").isInt().withMessage("visitor_id no válido"),
    handleInputErrors,
    getVisitorPersonsByVisitor
)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getVisitorPersonById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateVisitorPerson
)

router.delete("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteVisitorPerson
)

export default router
