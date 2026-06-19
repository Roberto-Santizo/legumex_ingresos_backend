"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../../middleware/jwt");
const express_validator_1 = require("express-validator");
const index_1 = require("../../middleware/index");
const DeliveryEquipmentTransaction_1 = require("../../handlers/EquipmentDeliveryModule/DeliveryEquipmentTransaction");
const router = (0, express_1.Router)();
console.log('[DeliveryTransaction] Router loaded');
router.use((req, _res, next) => {
    console.log(`[DeliveryTransaction] ${req.method} ${req.path}`);
    next();
});
router.post('/', jwt_1.validateJWT, (0, jwt_1.checkPermission)('deliveryTransaction:create'), (0, express_validator_1.body)('employee_benefited_id').isInt({ min: 1 }).withMessage('ID de empleado invalido'), (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un equipo'), (0, express_validator_1.body)('items.*.equipment_id').isInt({ min: 1 }).withMessage('ID de equipo invalido'), (0, express_validator_1.body)('items.*.equipment_condition').isIn(['NEW', 'USED']).withMessage('Condicion invalida'), (0, express_validator_1.body)('items.*.delivery_equipment_type').isIn(['DELIVERED', 'CHANGE']).withMessage('Tipo de entrega invalido'), (0, express_validator_1.body)('items.*.is_paid').isBoolean().withMessage('El campo pagado debe ser verdadero o falso'), index_1.handleInputErrors, DeliveryEquipmentTransaction_1.createDeliveryEquipmentTransaction);
router.patch('/final-photo/:employeeBenefitedId', jwt_1.validateJWT, (0, jwt_1.checkPermission)('deliveryTransaction:finalPhoto'), (0, express_validator_1.param)('employeeBenefitedId').isInt({ min: 1 }).withMessage('ID de empleado invalido'), (0, express_validator_1.body)('photo_base64').notEmpty().withMessage('La foto es requerida'), index_1.handleInputErrors, DeliveryEquipmentTransaction_1.uploadFinalPhoto);
router.get('/by-employee/:employeeBenefitedId', jwt_1.validateJWT, (0, jwt_1.checkPermission)('deliveryTransaction:view'), (0, express_validator_1.param)('employeeBenefitedId').isInt({ min: 1 }).withMessage('ID de empleado invalido'), index_1.handleInputErrors, DeliveryEquipmentTransaction_1.getDeliveryTransactionsByEmployee);
exports.default = router;
//# sourceMappingURL=DeliveryEquipmentTransaction.routes.js.map