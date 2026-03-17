import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../handlers/department"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("name es requerido"),
    body("code").notEmpty().withMessage("code es requerido"),
    handleInputErrors,
    createDepartment
)

router.get("/", getDepartments)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getDepartmentById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateDepartment
)

router.delete("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deleteDepartment
)

export default router