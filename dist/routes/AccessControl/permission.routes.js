"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_1 = require("../../handlers/AccessControl/permission");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.get("/", jwt_1.validateJWT, permission_1.getAllPermissions);
exports.default = router;
//# sourceMappingURL=permission.routes.js.map