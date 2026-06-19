"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const visit_1 = require("../../handlers/VisitsModule/visit");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
// Rutas específicas primero (antes de /:id para evitar conflictos)
router.get("/today", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:view'), visit_1.getVisitsToday);
router.get("/active", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:view'), visit_1.getVisitsActive);
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:create'), visit_1.createVisit);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:view'), visit_1.getVisits);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, visit_1.getVisitById);
router.patch("/:id/checkin", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:checkin'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, visit_1.checkIn);
router.patch("/:id/checkout", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:checkout'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, visit_1.checkOut);
router.patch("/:id/cancel", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:cancel'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, visit_1.cancelVisit);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, visit_1.updateVisit);
router.delete("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visits:delete'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, visit_1.deleteVisit);
exports.default = router;
//# sourceMappingURL=visit.routes.js.map