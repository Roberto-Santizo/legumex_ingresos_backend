"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const department_1 = require("../../handlers/VisitsModule/department");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('departments:create'), (0, express_validator_1.body)("name").notEmpty().withMessage("name es requerido"), (0, express_validator_1.body)("code").notEmpty().withMessage("code es requerido"), middleware_1.handleInputErrors, department_1.createDepartment);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('departments:view'), department_1.getDepartments);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('departments:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, department_1.getDepartmentById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('departments:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, department_1.updateDepartment);
router.delete("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('departments:delete'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, department_1.deleteDepartment);
exports.default = router;
//# sourceMappingURL=department.routes.js.map