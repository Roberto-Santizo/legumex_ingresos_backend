import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createAgent, getAgents, getAgentById, updateAgent } from "../handlers/agent"
import { validateJWT, checkPermission } from "../middleware/jwt"

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('agents:create'),
    body("name").notEmpty().withMessage("Name is required"),
    handleInputErrors,
    createAgent
)

router.get("/",
    validateJWT,
    checkPermission('agents:view'),
    getAgents
)

router.get("/:id",
    validateJWT,
    checkPermission('agents:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getAgentById
)

router.patch("/:id",
    validateJWT,
    checkPermission('agents:edit'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateAgent
)

export default router
