import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware"
import { createPeople, getPeople, getPeopleById, updatePeople, deletePeople } from "../handlers/people"

const router = Router()

router.post("/",
    body("name").notEmpty().withMessage("name es requerido"),
    body("document_number").notEmpty().withMessage("document_number es requerido"),
    handleInputErrors,
    createPeople
)

router.get("/", getPeople)

router.get("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getPeopleById
)

router.patch("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updatePeople
)

router.delete("/:id",
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    deletePeople
)

export default router