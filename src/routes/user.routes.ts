import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createUser, getUsers, getUserById, updateUser } from "../handlers/user"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('users:create'),
    body("name").notEmpty().withMessage("Name is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("role_id").isInt().withMessage("Role id is required"),
    body("department_id").isInt().withMessage("Department id is required"),
    handleInputErrors,
    createUser
)

router.get("/",
    validateJWT,
    checkPermission('users:view'),
    getUsers
)

router.get("/:id",
    validateJWT,
    checkPermission('users:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getUserById
)

router.patch("/:id",
    validateJWT,
    checkPermission('users:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateUser
)

export default router
