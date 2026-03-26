import { Request, Response } from "express"
import { Op } from "sequelize"
import db from "../config/db"
import Visit from "../models/Visit.model"
import VisitStatus from "../models/Visit_status.model"
import VisitCompanion from "../models/VisitCompanion.model"
import Company from "../models/Company.model"
import CompanyPerson from "../models/CompanyPerson.model"
import Department from "../models/Department.model"
import Agent from "../models/Agent.model"

// ─── GET /api/reports/dashboard-summary?date=YYYY-MM-DD ──────────────────────
// Returns KPI counters for a given day (defaults to today)
export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const dateParam = req.query.date as string | undefined
        const targetDate = dateParam ?? new Date().toISOString().split('T')[0]

        const dayStart = new Date(`${targetDate}T00:00:00.000Z`)
        const dayEnd   = new Date(`${targetDate}T23:59:59.999Z`)
        const dateRange = { [Op.between]: [dayStart, dayEnd] }

        const [
            programadaStatus,
            enPlantaStatus,
            finalizadaStatus,
            canceladaStatus,
        ] = await Promise.all([
            VisitStatus.findOne({ where: { name: 'PROGRAMADA' } }),
            VisitStatus.findOne({ where: { name: 'EN PLANTA' } }),
            VisitStatus.findOne({ where: { name: 'FINALIZADA' } }),
            VisitStatus.findOne({ where: { name: 'CANCELADA' } }),
        ])

        // Total visits scheduled for the day
        const totalVisitsToday = await Visit.count({
            where: { date: dateRange },
        })

        // Visits that completed check-in today (entry_time is set)
        const totalCheckInsToday = await Visit.count({
            where: {
                date: dateRange,
                entry_time: { [Op.ne]: null },
            },
        })

        // Visits currently inside the plant (status EN PLANTA)
        const currentlyInPlant = enPlantaStatus
            ? await Visit.count({ where: { visit_status_id: enPlantaStatus.id } })
            : 0

        // Total companions that entered today
        const totalCompanionsToday = await VisitCompanion.count({
            include: [{
                model: Visit,
                as: 'visit',
                where: { date: dateRange, entry_time: { [Op.ne]: null } },
                attributes: [],
            }],
        })

        // Cancelled visits today
        const cancelledToday = canceladaStatus
            ? await Visit.count({ where: { date: dateRange, visit_status_id: canceladaStatus.id } })
            : 0

        // Pending visits today (PROGRAMADA, no check-in yet)
        const pendingToday = programadaStatus
            ? await Visit.count({ where: { date: dateRange, visit_status_id: programadaStatus.id } })
            : 0

        // Completed visits today (FINALIZADA)
        const completedToday = finalizadaStatus
            ? await Visit.count({ where: { date: dateRange, visit_status_id: finalizadaStatus.id } })
            : 0

        return res.status(200).json({
            data: {
                date: targetDate,
                total_visits_today:     totalVisitsToday,
                total_check_ins_today:  totalCheckInsToday,
                currently_in_plant:     currentlyInPlant,
                total_companions_today: totalCompanionsToday,
                pending_today:          pendingToday,
                completed_today:        completedToday,
                cancelled_today:        cancelledToday,
            },
        })
    } catch (error) {
        console.error("Error in getDashboardSummary:", error)
        return res.status(500).json({ message: "Error al obtener el resumen del dashboard" })
    }
}

// ─── GET /api/reports/in-plant-at?date=YYYY-MM-DD&from=HH:MM&to=HH:MM ────────
// Returns all people (main visitors + companions) that were inside the plant
// during the given time range on the given date.
// Logic: entry_time <= to AND (exit_time >= from OR exit_time IS NULL)
export const getInPlantAt = async (req: Request, res: Response) => {
    try {
        const { date, from, to } = req.query

        if (!date || !from || !to) {
            return res.status(400).json({
                message: "Faltan parametros requeridos: date (YYYY-MM-DD), from (HH:MM), to (HH:MM)",
            })
        }

        const dayStart = new Date(`${date}T00:00:00.000Z`)
        const dayEnd   = new Date(`${date}T23:59:59.999Z`)

        // Main visitors: entry_time <= to AND (exit_time >= from OR exit_time is null)
        const mainCompanys = await Visit.findAll({
            where: {
                date: { [Op.between]: [dayStart, dayEnd] },
                entry_time: { [Op.lte]: to },
                [Op.or]: [
                    { exit_time: { [Op.gte]: from } },
                    { exit_time: null },
                ],
            },
            include: [
                { model: CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] },
                { model: Company,       as: 'company',        attributes: ['id', 'name'] },
                { model: Department,    as: 'department',     attributes: ['id', 'name'] },
                { model: VisitStatus,   as: 'visit_status',   attributes: ['id', 'name'] },
                { model: Agent,         as: 'agent',          attributes: ['id', 'name'] },
            ],
            order: [['entry_time', 'ASC']],
        })

        // Build response: each visit entry with its companions
        const result = await Promise.all(
            mainCompanys.map(async (visit) => {
                const companions = await VisitCompanion.findAll({
                    where: { visit_id: visit.id },
                    include: [{ model: CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] }],
                })

                const companyPerson  = visit.get('company_person')  as CompanyPerson | null
                const visitStatus    = visit.get('visit_status')    as VisitStatus   | null
                const company        = visit.get('company')         as Company        | null
                const department     = visit.get('department')      as Department     | null
                const agent          = visit.get('agent')           as Agent          | null

                return {
                    visit_id:         visit.id,
                    date:             visit.date,
                    entry_time:       visit.entry_time,
                    exit_time:        visit.exit_time,
                    badge_number:     visit.badge_number,
                    status:           visitStatus?.name    ?? null,
                    company:          company?.name        ?? null,
                    department:       department?.name     ?? null,
                    agent:            agent?.name          ?? null,
                    main_visitor: {
                        id:              companyPerson?.id              ?? null,
                        name:            companyPerson?.name            ?? null,
                        document_number: companyPerson?.document_number ?? null,
                    },
                    companions: companions.map((companion) => {
                        const companionPerson = companion.get('company_person') as CompanyPerson | null
                        return {
                            id:              companionPerson?.id              ?? null,
                            name:            companionPerson?.name            ?? null,
                            document_number: companionPerson?.document_number ?? null,
                            badge_number:    companion.badge_number,
                        }
                    }),
                    total_people: 1 + companions.length,
                }
            })
        )

        return res.status(200).json({
            data: {
                date,
                from,
                to,
                total_visits:  result.length,
                total_people:  result.reduce((sum, visit) => sum + visit.total_people, 0),
                visits:        result,
            },
        })
    } catch (error) {
        console.error("Error in getInPlantAt:", error)
        return res.status(500).json({ message: "Error al obtener personas en planta" })
    }
}

// ─── GET /api/reports/visits-by-company?from=YYYY-MM-DD&to=YYYY-MM-DD ────────
// Returns visit count grouped by company (visitor) within a date range.
// Includes total visits, total people (main + companions), and last visit date.
export const getVisitsByCompany = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query

        if (!from || !to) {
            return res.status(400).json({
                message: "Faltan parametros requeridos: from (YYYY-MM-DD), to (YYYY-MM-DD)",
            })
        }

        const rangeStart = new Date(`${from}T00:00:00.000Z`)
        const rangeEnd   = new Date(`${to}T23:59:59.999Z`)

        const visits = await Visit.findAll({
            where: {
                date: { [Op.between]: [rangeStart, rangeEnd] },
            },
            include: [
                { model: Company,     as: 'company',      attributes: ['id', 'name'] },
                { model: VisitStatus, as: 'visit_status', attributes: ['id', 'name'] },
                {
                    model: VisitCompanion,
                    as: 'visit_companions',
                    attributes: ['id'],
                },
            ],
            order: [['date', 'DESC']],
        })

        // Group by company
        const companyMap = new Map<number, {
            company_id:    number
            company_name:  string
            total_visits:  number
            total_people:  number
            last_visit:    string
        }>()

        for (const visit of visits) {
            const company    = visit.get('company')         as Company        | null
            const companions = visit.get('visit_companions') as VisitCompanion[] ?? []
            if (!company) continue

            const peopleInVisit = 1 + companions.length

            if (!companyMap.has(company.id)) {
                companyMap.set(company.id, {
                    company_id:   company.id,
                    company_name: company.name,
                    total_visits: 0,
                    total_people: 0,
                    last_visit:   visit.date as unknown as string,
                })
            }

            const entry = companyMap.get(company.id)!
            entry.total_visits  += 1
            entry.total_people  += peopleInVisit

            const visitDate = visit.date as unknown as string
            if (visitDate > entry.last_visit) entry.last_visit = visitDate
        }

        const result = Array.from(companyMap.values())
            .sort((firstCompany, secondCompany) => secondCompany.total_visits - firstCompany.total_visits)

        return res.status(200).json({
            data: {
                from,
                to,
                total_companies: result.length,
                total_visits:    visits.length,
                companies:       result,
            },
        })
    } catch (error) {
        console.error("Error in getVisitsByCompany:", error)
        return res.status(500).json({ message: "Error al obtener visitas por empresa" })
    }
}
