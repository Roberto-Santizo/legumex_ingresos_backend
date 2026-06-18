import { Router } from "express"
import { body, param } from "express-validator"
import { handleInputErrors } from "../../middleware"
import { createPeople, getPeople, getPeopleById, updatePeople, deletePeople } from "../../handlers/VisitsModule/people"
import { validateJWT, checkPermission } from "../../middleware/jwt"

const router = Router()

router.use(validateJWT)

router.post("/",
    checkPermission('people:create'),
    body("name").notEmpty().withMessage("name es requerido"),
    body("document_number").notEmpty().withMessage("document_number es requerido"),
    handleInputErrors,
    createPeople
)

router.get("/",
    checkPermission('people:view'),
    getPeople
)

router.get("/:id",
    checkPermission('people:view'),
    param("id").isInt().withMessage("Id no valido"),
    handleInputErrors,
    getPeopleById
)

router.patch("/:id",
    checkPermission('people:edit'),
    param("id").isInt().withMessage("Id no valido"),
    handleInputErrors,
    updatePeople
)

router.delete("/:id",
    checkPermission('people:delete'),
    param("id").isInt().withMessage("Id no valido"),
    handleInputErrors,
    deletePeople
)

export default router
