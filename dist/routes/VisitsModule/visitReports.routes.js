"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitReports_1 = require("../../handlers/VisitsModule/visitReports");
const visitReportsExcel_1 = require("../../handlers/VisitsModule/visitReportsExcel");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
// GET /api/reports/dashboard-summary?date=YYYY-MM-DD
router.get("/dashboard-summary", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visitsReports:view'), visitReports_1.getDashboardSummary);
// GET /api/reports/in-plant-at?date=YYYY-MM-DD&from=HH:MM&to=HH:MM
router.get("/in-plant-at", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visitsReports:view'), visitReports_1.getInPlantAt);
// GET /api/reports/visits-by-company?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/visits-by-company", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visitsReports:view'), visitReports_1.getVisitsByCompany);
// Excel Report - GET /api/reports/excel?from=YYYY-MM-DD&to=YYYY-MM-DDo
// Downloads a .xlsx file with all visits in the given date range
router.get("/excel", jwt_1.validateJWT, (0, jwt_1.checkPermission)('visitsReports:view'), visitReportsExcel_1.getVisitsExcelReport);
exports.default = router;
//# sourceMappingURL=visitReports.routes.js.map