"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const jwt_1 = require("../../middleware/jwt");
const EmployeeBenefited_1 = require("../../handlers/EquipmentDeliveryModule/EmployeeBenefited");
const router = (0, express_1.Router)();
router.get('/search', jwt_1.validateJWT, (0, jwt_1.checkPermission)('employeeBenefited:view'), EmployeeBenefited_1.searchExternalEmployees);
router.post('/find-or-create', jwt_1.validateJWT, (0, jwt_1.checkPermission)('employeeBenefited:edit'), EmployeeBenefited_1.findOrCreateEmployeeBenefited);
router.get('/', jwt_1.validateJWT, (0, jwt_1.checkPermission)('employeeBenefited:view'), EmployeeBenefited_1.getEmployeeBenefiteds);
router.delete('/:id', jwt_1.validateJWT, (0, jwt_1.checkPermission)('employeeBenefited:delete'), (0, express_validator_1.param)('id').isInt().withMessage('Id no válido'), middleware_1.handleInputErrors, EmployeeBenefited_1.deleteEmployeeBenefited);
exports.default = router;
//# sourceMappingURL=EmployeeBenefited.routes.js.map