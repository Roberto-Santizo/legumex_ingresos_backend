import { Router } from "express"
import {
    getDashboardSummary,
    getInPlantAt,
    getVisitsByCompany,
} from "../handlers/visitReports"

const router = Router()

// GET /api/reports/dashboard-summary?date=YYYY-MM-DD
router.get("/dashboard-summary", getDashboardSummary)

// GET /api/reports/in-plant-at?date=YYYY-MM-DD&from=HH:MM&to=HH:MM
router.get("/in-plant-at", getInPlantAt)

// GET /api/reports/visits-by-company?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/visits-by-company", getVisitsByCompany)

export default router
