import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createUser, getUsers, getUserById, updateUser } from "../handlers/user"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("Name is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("role_id").isInt().withMessage("Role id is required"),
    body("department_id").isInt().withMessage("Department id is required"),
    handleInputErrors,
    createUser
)

router.get("/", getUsers)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getUserById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateUser
)



export default router