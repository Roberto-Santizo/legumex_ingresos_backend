"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const Equipment_1 = require("../../handlers/EquipmentDeliveryModule/Equipment");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipment:create'), (0, express_validator_1.body)("equipment_name").notEmpty().withMessage("El nombre del equipo es requerido"), middleware_1.handleInputErrors, Equipment_1.createEquipment);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipment:view'), Equipment_1.getEquipments);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipment:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, Equipment_1.getEquipmentById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipment:updateEquipment'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, Equipment_1.updateEquipment);
exports.default = router;
//# sourceMappingURL=equipment.routes.js.map