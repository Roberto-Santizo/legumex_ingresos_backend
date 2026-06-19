"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquipmentExcelReport = void 0;
const sequelize_1 = require("sequelize");
const exceljs_1 = __importDefault(require("exceljs"));
const EquipmentDeliveryModule_1 = require("../../models/EquipmentDeliveryModule");
const AccessControl_1 = require("../../models/AccessControl");
const CONDITION_LABELS = {
    NEW: 'Nuevo',
    USED: 'Usado',
};
const DELIVERY_TYPE_LABELS = {
    DELIVERED: 'Entrega',
    CHANGE: 'Cambio',
};
const REPORT_TIME_ZONE = 'America/Guatemala';
// Formatea la fecha en la zona horaria de Guatemala, sin importar en que zona horaria corra el servidor.
function formatDeliveryDate(date) {
    const parts = new Intl.DateTimeFormat('es-GT', {
        timeZone: REPORT_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const getPart = (type) => parts.find((part) => part.type === type)?.value ?? '';
    return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}`;
}
// ─── GET /api/equipment-reports/excel?from=YYYY-MM-DD&to=YYYY-MM-DD ──────────
// Generates and downloads an Excel file with all equipment delivery
// transactions within the given date range, including employee, equipment
// and delivery details.
const getEquipmentExcelReport = async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({ message: "Faltan parámetros requeridos: from (YYYY-MM-DD), to (YYYY-MM-DD)" });
        }
        const rangeStart = new Date(`${from}T00:00:00.000Z`);
        const rangeEnd = new Date(`${to}T23:59:59.999Z`);
        const transactions = await EquipmentDeliveryModule_1.DeliveryEquipmentTransaction.findAll({
            where: {
                delivery_date: { [sequelize_1.Op.between]: [rangeStart, rangeEnd] },
            },
            include: [
                {
                    model: EquipmentDeliveryModule_1.EmployeeBenefited,
                    as: "employeeBenefited",
                    attributes: ["employee_name", "employee_code", "employee_position", "department_name"],
                },
                {
                    model: AccessControl_1.User,
                    as: "deliveredBy",
                    attributes: ["name"],
                },
                {
                    model: EquipmentDeliveryModule_1.EquipmentDeliveryDetails,
                    as: "equipmentDetails",
                    attributes: ["equipment_condition"],
                    include: [
                        { model: EquipmentDeliveryModule_1.Equipment, as: "equipment", attributes: ["equipment_name", "equipment_description"] },
                    ],
                },
            ],
            order: [["delivery_date", "ASC"], ["delivery_batch_id", "ASC"]],
        });
        // ── Build workbook ───────────────────────────────────────────────────
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet("Reporte de Equipos");
        worksheet.columns = [
            { header: "Fecha de Entrega", key: "fecha", width: 18 },
            { header: "Empleado", key: "empleado", width: 28 },
            { header: "Código", key: "codigo", width: 14 },
            { header: "Puesto", key: "puesto", width: 22 },
            { header: "Departamento", key: "departamento", width: 20 },
            { header: "Equipo", key: "equipo", width: 25 },
            { header: "Descripción", key: "descripcion", width: 30 },
            { header: "Condición", key: "condicion", width: 14 },
            { header: "Tipo de Entrega", key: "tipo", width: 16 },
            { header: "Pagado", key: "pagado", width: 10 },
            { header: "Notas", key: "notas", width: 30 },
            { header: "Entregado por", key: "entregado_por", width: 22 },
            { header: "Ronda", key: "ronda", width: 10 },
        ];
        // Header row styles
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        headerRow.height = 20;
        // ── Data rows ────────────────────────────────────────────────────────
        for (const transaction of transactions) {
            const employee = transaction.get("employeeBenefited");
            const deliveredBy = transaction.get("deliveredBy");
            const equipmentDetails = transaction.get("equipmentDetails");
            const equipment = equipmentDetails?.get("equipment");
            const rawDate = transaction.delivery_date;
            const fecha = rawDate ? formatDeliveryDate(rawDate) : "";
            const isChange = transaction.delivery_equipment_type === 'CHANGE';
            const row = worksheet.addRow({
                fecha,
                empleado: employee?.employee_name ?? "",
                codigo: employee?.employee_code ?? "",
                puesto: employee?.employee_position ?? "",
                departamento: employee?.department_name ?? "",
                equipo: equipment?.equipment_name ?? "",
                descripcion: equipment?.equipment_description ?? "",
                condicion: CONDITION_LABELS[equipmentDetails?.equipment_condition ?? ""] ?? "-",
                tipo: DELIVERY_TYPE_LABELS[transaction.delivery_equipment_type] ?? transaction.delivery_equipment_type,
                pagado: isChange ? (transaction.is_paid ? "Sí" : "No") : "-",
                notas: transaction.delivery_notes ?? "-",
                entregado_por: deliveredBy?.name ?? "",
                ronda: transaction.delivery_batch_id,
            });
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                cell.alignment = { vertical: "middle", wrapText: true };
            });
        }
        // ── Send file as HTTP response ───────────────────────────────────────
        const filename = `reporte_equipos_${from}_${to}.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        return res.status(500).json({ message: "Error al generar el reporte Excel" });
    }
};
exports.getEquipmentExcelReport = getEquipmentExcelReport;
//# sourceMappingURL=EquipmentExcelReport.js.map