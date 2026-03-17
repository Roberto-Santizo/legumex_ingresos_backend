import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createVisitor, getVisitors, getVisitorById, updateVisitor } from "../handlers/visitor"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("name es requerido"),
    handleInputErrors,
    createVisitor
)

router.get("/", getVisitors)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getVisitorById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateVisitor
)

export default router
