"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const user_1 = require("../../handlers/AccessControl/user");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('users:create'), (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"), (0, express_validator_1.body)("username").notEmpty().withMessage("Username is required"), (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"), (0, express_validator_1.body)("role_id").isInt().withMessage("Role id is required"), (0, express_validator_1.body)("department_id").isInt().withMessage("Department id is required"), middleware_1.handleInputErrors, user_1.createUser);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('users:view'), user_1.getUsers);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('users:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, user_1.getUserById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('users:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, user_1.updateUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map