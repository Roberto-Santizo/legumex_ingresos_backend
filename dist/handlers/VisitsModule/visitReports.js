"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitsByCompany = exports.getInPlantAt = exports.getDashboardSummary = void 0;
const sequelize_1 = require("sequelize");
const VisitsModule_1 = require("../../models/VisitsModule");
// ─── GET /api/reports/dashboard-summary?date=YYYY-MM-DD ──────────────────────
// Returns KPI counters for a given day (defaults to today)
const getDashboardSummary = async (req, res) => {
    try {
        const dateParam = req.query.date;
        const targetDate = dateParam ?? new Date().toISOString().split('T')[0];
        const dayStart = new Date(`${targetDate}T00:00:00.000Z`);
        const dayEnd = new Date(`${targetDate}T23:59:59.999Z`);
        const dateRange = { [sequelize_1.Op.between]: [dayStart, dayEnd] };
        const [programadaStatus, enPlantaStatus, finalizadaStatus, canceladaStatus,] = await Promise.all([
            VisitsModule_1.VisitStatus.findOne({ where: { name: 'PROGRAMADA' } }),
            VisitsModule_1.VisitStatus.findOne({ where: { name: 'EN PLANTA' } }),
            VisitsModule_1.VisitStatus.findOne({ where: { name: 'FINALIZADA' } }),
            VisitsModule_1.VisitStatus.findOne({ where: { name: 'CANCELADA' } }),
        ]);
        // Total visits scheduled for the day
        const totalVisitsToday = await VisitsModule_1.Visit.count({
            where: { date: dateRange },
        });
        // Visits that completed check-in today (entry_time is set)
        const totalCheckInsToday = await VisitsModule_1.Visit.count({
            where: {
                date: dateRange,
                entry_time: { [sequelize_1.Op.ne]: null },
            },
        });
        // Visits currently inside the plant (status EN PLANTA)
        const currentlyInPlant = enPlantaStatus
            ? await VisitsModule_1.Visit.count({ where: { visit_status_id: enPlantaStatus.id } })
            : 0;
        // Total companions that entered today
        const totalCompanionsToday = await VisitsModule_1.VisitCompanion.count({
            include: [{
                    model: VisitsModule_1.Visit,
                    as: 'visit',
                    where: { date: dateRange, entry_time: { [sequelize_1.Op.ne]: null } },
                    attributes: [],
                }],
        });
        // Cancelled visits today
        const cancelledToday = canceladaStatus
            ? await VisitsModule_1.Visit.count({ where: { date: dateRange, visit_status_id: canceladaStatus.id } })
            : 0;
        // Pending visits today (PROGRAMADA, no check-in yet)
        const pendingToday = programadaStatus
            ? await VisitsModule_1.Visit.count({ where: { date: dateRange, visit_status_id: programadaStatus.id } })
            : 0;
        // Completed visits today (FINALIZADA)
        const completedToday = finalizadaStatus
            ? await VisitsModule_1.Visit.count({ where: { date: dateRange, visit_status_id: finalizadaStatus.id } })
            : 0;
        return res.status(200).json({
            data: {
                date: targetDate,
                total_visits_today: totalVisitsToday,
                total_check_ins_today: totalCheckInsToday,
                currently_in_plant: currentlyInPlant,
                total_companions_today: totalCompanionsToday,
                pending_today: pendingToday,
                completed_today: completedToday,
                cancelled_today: cancelledToday,
            },
        });
    }
    catch (error) {
        console.error("Error in getDashboardSummary:", error);
        return res.status(500).json({ message: "Error al obtener el resumen del dashboard" });
    }
};
exports.getDashboardSummary = getDashboardSummary;
// ─── GET /api/reports/in-plant-at?date=YYYY-MM-DD&from=HH:MM&to=HH:MM ────────
// Returns all people (main visitors + companions) that were inside the plant
// during the given time range on the given date.
// Logic: entry_time <= to AND (exit_time >= from OR exit_time IS NULL)
const getInPlantAt = async (req, res) => {
    try {
        const { date, from, to } = req.query;
        if (!date || !from || !to) {
            return res.status(400).json({
                message: "Faltan parametros requeridos: date (YYYY-MM-DD), from (HH:MM), to (HH:MM)",
            });
        }
        const dayStart = new Date(`${date}T00:00:00.000Z`);
        const dayEnd = new Date(`${date}T23:59:59.999Z`);
        // Main visitors: entry_time <= to AND (exit_time >= from OR exit_time is null)
        const mainCompanys = await VisitsModule_1.Visit.findAll({
            where: {
                date: { [sequelize_1.Op.between]: [dayStart, dayEnd] },
                entry_time: { [sequelize_1.Op.lte]: to },
                [sequelize_1.Op.or]: [
                    { exit_time: { [sequelize_1.Op.gte]: from } },
                    { exit_time: null },
                ],
            },
            include: [
                { model: VisitsModule_1.CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] },
                { model: VisitsModule_1.Company, as: 'company', attributes: ['id', 'name'] },
                { model: VisitsModule_1.Department, as: 'department', attributes: ['id', 'name'] },
                { model: VisitsModule_1.VisitStatus, as: 'visit_status', attributes: ['id', 'name'] },
                { model: VisitsModule_1.Agent, as: 'agent', attributes: ['id', 'name'] },
            ],
            order: [['entry_time', 'ASC']],
        });
        // Build response: each visit entry with its companions
        const result = await Promise.all(mainCompanys.map(async (visit) => {
            const companions = await VisitsModule_1.VisitCompanion.findAll({
                where: { visit_id: visit.id },
                include: [{ model: VisitsModule_1.CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] }],
            });
            const companyPerson = visit.get('company_person');
            const visitStatus = visit.get('visit_status');
            const company = visit.get('company');
            const department = visit.get('department');
            const agent = visit.get('agent');
            return {
                visit_id: visit.id,
                date: visit.date,
                entry_time: visit.entry_time,
                exit_time: visit.exit_time,
                badge_number: visit.badge_number,
                status: visitStatus?.name ?? null,
                company: company?.name ?? null,
                department: department?.name ?? null,
                agent: agent?.name ?? null,
                main_visitor: {
                    id: companyPerson?.id ?? null,
                    name: companyPerson?.name ?? null,
                    document_number: companyPerson?.document_number ?? null,
                },
                companions: companions.map((companion) => {
                    const companionPerson = companion.get('company_person');
                    return {
                        id: companionPerson?.id ?? null,
                        name: companionPerson?.name ?? null,
                        document_number: companionPerson?.document_number ?? null,
                        badge_number: companion.badge_number,
                    };
                }),
                total_people: 1 + companions.length,
            };
        }));
        return res.status(200).json({
            data: {
                date,
                from,
                to,
                total_visits: result.length,
                total_people: result.reduce((sum, visit) => sum + visit.total_people, 0),
                visits: result,
            },
        });
    }
    catch (error) {
        console.error("Error in getInPlantAt:", error);
        return res.status(500).json({ message: "Error al obtener personas en planta" });
    }
};
exports.getInPlantAt = getInPlantAt;
// ─── GET /api/reports/visits-by-company?from=YYYY-MM-DD&to=YYYY-MM-DD ────────
// Returns visit count grouped by company (visitor) within a date range.
// Includes total visits, total people (main + companions), and last visit date.
const getVisitsByCompany = async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                message: "Faltan parametros requeridos: from (YYYY-MM-DD), to (YYYY-MM-DD)",
            });
        }
        const rangeStart = new Date(`${from}T00:00:00.000Z`);
        const rangeEnd = new Date(`${to}T23:59:59.999Z`);
        const visits = await VisitsModule_1.Visit.findAll({
            where: {
                date: { [sequelize_1.Op.between]: [rangeStart, rangeEnd] },
            },
            include: [
                { model: VisitsModule_1.Company, as: 'company', attributes: ['id', 'name'] },
                { model: VisitsModule_1.VisitStatus, as: 'visit_status', attributes: ['id', 'name'] },
                {
                    model: VisitsModule_1.VisitCompanion,
                    as: 'visit_companions',
                    attributes: ['id'],
                },
            ],
            order: [['date', 'DESC']],
        });
        // Group by company
        const companyMap = new Map();
        for (const visit of visits) {
            const company = visit.get('company');
            const companions = visit.get('visit_companions') ?? [];
            if (!company)
                continue;
            const peopleInVisit = 1 + companions.length;
            if (!companyMap.has(company.id)) {
                companyMap.set(company.id, {
                    company_id: company.id,
                    company_name: company.name,
                    total_visits: 0,
                    total_people: 0,
                    last_visit: visit.date,
                });
            }
            const entry = companyMap.get(company.id);
            entry.total_visits += 1;
            entry.total_people += peopleInVisit;
            const visitDate = visit.date;
            if (visitDate > entry.last_visit)
                entry.last_visit = visitDate;
        }
        const result = Array.from(companyMap.values())
            .sort((firstCompany, secondCompany) => secondCompany.total_visits - firstCompany.total_visits);
        return res.status(200).json({
            data: {
                from,
                to,
                total_companies: result.length,
                total_visits: visits.length,
                companies: result,
            },
        });
    }
    catch (error) {
        console.error("Error in getVisitsByCompany:", error);
        return res.status(500).json({ message: "Error al obtener visitas por empresa" });
    }
};
exports.getVisitsByCompany = getVisitsByCompany;
//# sourceMappingURL=visitReports.js.map