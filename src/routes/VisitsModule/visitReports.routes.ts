import { Router } from "express"
import {
    getDashboardSummary,
    getInPlantAt,
    getVisitsByCompany,
} from "../../handlers/VisitsModule/visitReports"
import { getVisitsExcelReport } from "../../handlers/VisitsModule/visitReportsExcel"
import { validateJWT, checkPermission } from "../../middleware/jwt"

const router = Router()

// GET /api/reports/dashboard-summary?date=YYYY-MM-DD
router.get("/dashboard-summary",
    validateJWT,
    checkPermission('visitsReports:view'),
    getDashboardSummary
)

// GET /api/reports/in-plant-at?date=YYYY-MM-DD&from=HH:MM&to=HH:MM
router.get("/in-plant-at",
    validateJWT,
    checkPermission('visitsReports:view'),
    getInPlantAt
)

// GET /api/reports/visits-by-company?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/visits-by-company",
    validateJWT,
    checkPermission('visitsReports:view'),
    getVisitsByCompany
)

// Excel Report - GET /api/reports/excel?from=YYYY-MM-DD&to=YYYY-MM-DDo
// Downloads a .xlsx file with all visits in the given date range
router.get("/excel",
    validateJWT,
    checkPermission('visitsReports:view'),
    getVisitsExcelReport
)

export default router
