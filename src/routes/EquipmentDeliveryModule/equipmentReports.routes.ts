import { Router } from "express"
import { getEquipmentExcelReport } from "../../handlers/EquipmentDeliveryModule/EquipmentExcelReport"
import { getEquipmentDashboardSummary, getDeliveriesByEquipment, getPendingEmployees } from "../../handlers/EquipmentDeliveryModule/EquipmentDashboard"
import { validateJWT, checkPermission } from "../../middleware/jwt"

const router = Router()

// Dashboard endpoints
router.get("/dashboard-summary",   validateJWT, checkPermission('equipmentReports:view'), getEquipmentDashboardSummary)
router.get("/by-equipment",        validateJWT, checkPermission('equipmentReports:view'), getDeliveriesByEquipment)
router.get("/pending-employees",   validateJWT, checkPermission('equipmentReports:view'), getPendingEmployees)

// Excel Report - GET /api/equipment-reports/excel?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/excel",               validateJWT, checkPermission('equipmentReports:view'), getEquipmentExcelReport)

export default router
