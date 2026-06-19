"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const visitCompanion_1 = require("../../handlers/VisitsModule/visitCompanion");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.use(jwt_1.validateJWT);
router.post("/", (0, jwt_1.checkPermission)('visits:create'), (0, express_validator_1.body)("visit_id").notEmpty().isInt().withMessage("visit_id es requerido y debe ser un numero"), (0, express_validator_1.body)("visitor_person_id").notEmpty().isInt().withMessage("visitor_person_id es requerido y debe ser un numero"), middleware_1.handleInputErrors, visitCompanion_1.createVisitCompanion);
router.get("/", (0, jwt_1.checkPermission)('visits:view:all'), visitCompanion_1.getVisitCompanions);
router.get("/:id", (0, jwt_1.checkPermission)('visits:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no valido"), middleware_1.handleInputErrors, visitCompanion_1.getVisitCompanionById);
router.delete("/:id", (0, jwt_1.checkPermission)('visits:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no valido"), middleware_1.handleInputErrors, visitCompanion_1.deleteVisitCompanion);
exports.default = router;
//# sourceMappingURL=visitCompanion.routes.js.map