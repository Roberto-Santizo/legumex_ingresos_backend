import {Router} from "express";
import { body, param} from "express-validator";
import { handleInputErrors } from "../../middleware";
import { createEquipment, getEquipments,getEquipmentById,updateEquipment } from "../../handlers/EquipmentDeliveryModule/Equipment";
import { validateJWT, checkPermission } from "../../middleware/jwt";

const router = Router()

router.post("/",
    validateJWT,
    checkPermission('equipment:create'),
    body("equipment_name").notEmpty().withMessage("El nombre del equipo es requerido"),
    handleInputErrors,
    createEquipment
)
router.get("/",
    validateJWT,
    checkPermission('equipment:view'),
    getEquipments
)
router.get("/:id",
    validateJWT,
    checkPermission('equipment:view'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    getEquipmentById
)

router.patch("/:id",
    validateJWT,
    checkPermission('equipment:updateEquipment'),
    param("id").isInt().withMessage("Id no válido"),
    handleInputErrors,
    updateEquipment
)
    
export default router