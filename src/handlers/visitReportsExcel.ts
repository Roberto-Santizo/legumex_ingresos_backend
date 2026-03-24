import { Request, Response } from "express"
import { Op } from "sequelize"
import ExcelJS from "exceljs"
import Visit from "../models/Visit.model"
import Visitor from "../models/Visitor.model"
import VisitorPerson from "../models/VisitorPerson.model"
import VisitCompanion from "../models/VisitCompanion.model"
import Department from "../models/Department.model"
import Agent from "../models/Agent.model"

// ─── GET /api/reports/excel?from=YYYY-MM-DD&to=YYYY-MM-DD ────────────────────
// Generates and downloads an Excel file with all visits within the given date range.
// Includes: date, company, visitor, DPI, companions, department,
//           destination area, responsible person, entry time and exit time.
export const getVisitsExcelReport = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query

        if (!from || !to) {
            return res.status(400).json({
                message: "Faltan parámetros requeridos: from (YYYY-MM-DD), to (YYYY-MM-DD)",
            })
        }

        const rangeStart = new Date(`${from}T00:00:00.000Z`)
        const rangeEnd   = new Date(`${to}T23:59:59.999Z`)

        // ── Main query ───────────────────────────────────────────────────────
        const visits = await Visit.findAll({
            where: {
                date: { [Op.between]: [rangeStart, rangeEnd] },
                entry_time: { [Op.ne]: null }, // Only visits that actually checked in
            },
            include: [
                { model: Visitor,       as: "visitor",       attributes: ["name"] },
                { model: VisitorPerson, as: "visitor_person", attributes: ["name", "document_number"] },
                { model: Department,    as: "department",     attributes: ["name"] },
                { model: Agent,         as: "agent",          attributes: ["name"] },
                {
                    model: VisitCompanion,
                    as: "visit_companions",
                    include: [
                        { model: VisitorPerson, as: "visitor_person", attributes: ["name", "document_number"] },
                    ],
                },
            ],
            order: [["date", "ASC"], ["entry_time", "ASC"]],
        })

        // ── Build workbook ───────────────────────────────────────────────────
        const workbook  = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Reporte de Visitas")

        // Columns with defined width
        worksheet.columns = [
            { header: "Fecha de Visita",       key: "fecha",              width: 16 },
            { header: "Empresa",               key: "empresa",            width: 25 },
            { header: "Nombre Visitante",      key: "visitante",          width: 28 },
            { header: "DPI Visitante",         key: "dpi_visitante",      width: 18 },
            { header: "Acompañantes",          key: "acompanantes",       width: 40 },
            { header: "DPI Acompañantes",      key: "dpi_acompanantes",   width: 35 },
            { header: "Departamento",          key: "departamento",       width: 20 },
            { header: "Área de Destino",       key: "area_destino",       width: 25 },
            { header: "Responsable",           key: "responsable",        width: 25 },
            { header: "Hora de Ingreso",       key: "hora_ingreso",       width: 15 },
            { header: "Hora de Salida",        key: "hora_salida",        width: 15 },
        ]

        // Header row styles
        const headerRow = worksheet.getRow(1)
        headerRow.eachCell((cell) => {
            cell.font      = { bold: true, color: { argb: "FFFFFFFF" } }
            cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } }
            cell.alignment = { vertical: "middle", horizontal: "center" }
            cell.border    = {
                top:    { style: "thin" },
                left:   { style: "thin" },
                bottom: { style: "thin" },
                right:  { style: "thin" },
            }
        })
        headerRow.height = 20

        // ── Data rows ────────────────────────────────────────────────────────
        for (const visit of visits) {
            const visitor       = visit.get("visitor")        as Visitor        | null
            const visitorPerson = visit.get("visitor_person") as VisitorPerson  | null
            const department    = visit.get("department")     as Department     | null
            const companions    = visit.get("visit_companions") as VisitCompanion[] ?? []

            // Companions: names and DPIs joined by " / "
            const companionNames = companions
                .map((c) => (c.get("visitor_person") as VisitorPerson | null)?.name ?? "")
                .filter(Boolean)
                .join(" / ")

            const companionDPIs = companions
                .map((c) => (c.get("visitor_person") as VisitorPerson | null)?.document_number ?? "")
                .filter(Boolean)
                .join(" / ")

            // Format date as DD/MM/YYYY
            const rawDate  = visit.date as unknown as Date
            const fecha    = rawDate
                ? `${String(rawDate.getUTCDate()).padStart(2,"0")}/${String(rawDate.getUTCMonth()+1).padStart(2,"0")}/${rawDate.getUTCFullYear()}`
                : ""

            const row = worksheet.addRow({
                fecha,
                empresa:          visitor?.name                    ?? "",
                visitante:        visitorPerson?.name              ?? "",
                dpi_visitante:    visitorPerson?.document_number   ?? "",
                acompanantes:     companionNames                   || "Sin acompañantes",
                dpi_acompanantes: companionDPIs                    || "-",
                departamento:     department?.name                 ?? "",
                area_destino:     visit.destination                ?? "",
                responsable:      visit.responsible_person         ?? "",
                hora_ingreso:     visit.entry_time                 ?? "",
                hora_salida:      visit.exit_time                  || "Aún en planta",
            })

            // Border on each data cell
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top:    { style: "thin" },
                    left:   { style: "thin" },
                    bottom: { style: "thin" },
                    right:  { style: "thin" },
                }
                cell.alignment = { vertical: "middle", wrapText: true }
            })
        }

        // ── Send file as HTTP response ───────────────────────────────────────
        const filename = `reporte_visitas_${from}_${to}.xlsx`

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)

        await workbook.xlsx.write(res)
        res.end()

    } catch (error) {
        console.error("Error en getVisitsExcelReport:", error)
        return res.status(500).json({ message: "Error al generar el reporte Excel" })
    }
}
