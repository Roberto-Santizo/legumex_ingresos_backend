"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const role_1 = require("../../handlers/AccessControl/role");
const permission_1 = require("../../handlers/AccessControl/permission");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('roles:create'), (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"), middleware_1.handleInputErrors, role_1.createRole);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('roles:view'), role_1.getRoles);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('roles:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, role_1.getRoleById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('roles:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, role_1.updateRole);
// Gestión de permisos por rol
router.get("/:id/permissions", jwt_1.validateJWT, (0, jwt_1.checkPermission)('roles:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, permission_1.getRolePermissions);
router.put("/:id/permissions", jwt_1.validateJWT, (0, jwt_1.checkPermission)('roles:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), (0, express_validator_1.body)("permissions").isArray().withMessage("permissions debe ser un arreglo"), middleware_1.handleInputErrors, permission_1.updateRolePermissions);
exports.default = router;
//# sourceMappingURL=role.routes.js.map