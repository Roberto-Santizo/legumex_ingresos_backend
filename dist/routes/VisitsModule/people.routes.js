"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const people_1 = require("../../handlers/VisitsModule/people");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.use(jwt_1.validateJWT);
router.post("/", (0, jwt_1.checkPermission)('people:create'), (0, express_validator_1.body)("name").notEmpty().withMessage("name es requerido"), (0, express_validator_1.body)("document_number").notEmpty().withMessage("document_number es requerido"), middleware_1.handleInputErrors, people_1.createPeople);
router.get("/", (0, jwt_1.checkPermission)('people:view'), people_1.getPeople);
router.get("/:id", (0, jwt_1.checkPermission)('people:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no valido"), middleware_1.handleInputErrors, people_1.getPeopleById);
router.patch("/:id", (0, jwt_1.checkPermission)('people:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no valido"), middleware_1.handleInputErrors, people_1.updatePeople);
router.delete("/:id", (0, jwt_1.checkPermission)('people:delete'), (0, express_validator_1.param)("id").isInt().withMessage("Id no valido"), middleware_1.handleInputErrors, people_1.deletePeople);
exports.default = router;
//# sourceMappingURL=people.routes.js.map