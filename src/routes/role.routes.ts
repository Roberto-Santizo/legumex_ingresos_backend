import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createRole, getRoles, getRoleById, updateRole } from "../handlers/role"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("Name is required"),
    handleInputErrors,
    createRole
)

router.get("/", getRoles)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getRoleById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateRole
)

export default router