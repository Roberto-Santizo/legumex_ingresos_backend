import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createAgent, getAgents, getAgentById } from "../handlers/agent"
import { updateAgent } from "../handlers/agent"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("Name is required"),
    handleInputErrors,
    createAgent
)

router.get("/", getAgents)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getAgentById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateAgent
)

export default router