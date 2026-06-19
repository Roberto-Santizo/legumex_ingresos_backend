"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EquipmentExcelReport_1 = require("../../handlers/EquipmentDeliveryModule/EquipmentExcelReport");
const EquipmentDashboard_1 = require("../../handlers/EquipmentDeliveryModule/EquipmentDashboard");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
// Dashboard endpoints
router.get("/dashboard-summary", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipmentReports:view'), EquipmentDashboard_1.getEquipmentDashboardSummary);
router.get("/by-equipment", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipmentReports:view'), EquipmentDashboard_1.getDeliveriesByEquipment);
router.get("/pending-employees", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipmentReports:view'), EquipmentDashboard_1.getPendingEmployees);
// Excel Report - GET /api/equipment-reports/excel?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/excel", jwt_1.validateJWT, (0, jwt_1.checkPermission)('equipmentReports:view'), EquipmentExcelReport_1.getEquipmentExcelReport);
exports.default = router;
//# sourceMappingURL=equipmentReports.routes.js.map