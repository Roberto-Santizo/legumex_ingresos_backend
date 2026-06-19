"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const company_1 = require("../../handlers/VisitsModule/company");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('companies:create'), (0, express_validator_1.body)("name").notEmpty().withMessage("name es requerido"), middleware_1.handleInputErrors, company_1.createCompany);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('companies:view'), company_1.getCompanies);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('companies:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, company_1.getCompanyById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('companies:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, company_1.updateCompany);
exports.default = router;
//# sourceMappingURL=company.routes.js.map