"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const companyPerson_1 = require("../../handlers/VisitsModule/companyPerson");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('people:create'), (0, express_validator_1.body)("company_id").notEmpty().isInt().withMessage("company_id es requerido"), (0, express_validator_1.body)("name").notEmpty().withMessage("name es requerido"), (0, express_validator_1.body)("document_number").notEmpty().withMessage("document_number es requerido"), middleware_1.handleInputErrors, companyPerson_1.createCompanyPerson);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('people:view'), companyPerson_1.getCompanyPersons);
// Listar personas de una empresa especifica
router.get("/by-company/:company_id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('people:view'), (0, express_validator_1.param)("company_id").isInt().withMessage("company_id no válido"), middleware_1.handleInputErrors, companyPerson_1.getCompanyPersonsByCompany);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('people:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, companyPerson_1.getCompanyPersonById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('people:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, companyPerson_1.updateCompanyPerson);
router.delete("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('people:delete'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, companyPerson_1.deleteCompanyPerson);
exports.default = router;
//# sourceMappingURL=companyPerson.routes.js.map