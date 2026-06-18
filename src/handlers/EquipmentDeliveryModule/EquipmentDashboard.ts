import { Request, Response } from "express"
import { Op } from "sequelize"
import { EmployeeBenefited, EmployeeBenefitedStatus, DeliveryEquipmentTransaction, EquipmentDeliveryDetails, Equipment } from "../../models/EquipmentDeliveryModule"

// ─── GET /api/equipment-reports/dashboard-summary?date=YYYY-MM-DD ────────────
// Returns KPI counters for the equipment delivery module (defaults to today)
export const getEquipmentDashboardSummary = async (req: Request, res: Response) => {
    try {
        const dateParam = req.query.date as string | undefined
        const targetDate = dateParam ?? new Date().toISOString().split('T')[0]

        const dayStart = new Date(`${targetDate}T00:00:00.000Z`)
        const dayEnd   = new Date(`${targetDate}T23:59:59.999Z`)
        const dateRange = { [Op.between]: [dayStart, dayEnd] }

        const [
            totalEmployees,
            pendingDelivery,
            pendingFinalPhoto,
            completed,
            deliveriesToday,
            changesToday,
        ] = await Promise.all([
            EmployeeBenefited.count(),
            EmployeeBenefited.count({ where: { status: EmployeeBenefitedStatus.DELIVER_EQUIPMENT } }),
            EmployeeBenefited.count({ where: { status: EmployeeBenefitedStatus.FINAL_PHOTO } }),
            EmployeeBenefited.count({ where: { status: EmployeeBenefitedStatus.COMPLETED } }),
            DeliveryEquipmentTransaction.count({ where: { delivery_date: dateRange, delivery_equipment_type: 'DELIVERED' } }),
            DeliveryEquipmentTransaction.count({ where: { delivery_date: dateRange, delivery_equipment_type: 'CHANGE' } }),
        ])

        return res.status(200).json({
            data: {
                date: targetDate,
                total_employees:     totalEmployees,
                pending_delivery:    pendingDelivery,
                pending_final_photo: pendingFinalPhoto,
                completed:           completed,
                deliveries_today:    deliveriesToday,
                changes_today:       changesToday,
            },
        })
    } catch (error) {
        console.error("Error in getEquipmentDashboardSummary:", error)
        return res.status(500).json({ message: "Error al obtener el resumen del dashboard" })
    }
}

// ─── GET /api/equipment-reports/by-equipment?from=YYYY-MM-DD&to=YYYY-MM-DD ───
// Returns equipment delivery counts within a date range, grouped by equipment.
export const getDeliveriesByEquipment = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query

        if (!from || !to) {
            return res.status(400).json({ message: "Faltan parametros requeridos: from (YYYY-MM-DD), to (YYYY-MM-DD)" })
        }

        const rangeStart = new Date(`${from}T00:00:00.000Z`)
        const rangeEnd   = new Date(`${to}T23:59:59.999Z`)

        const transactions = await DeliveryEquipmentTransaction.findAll({
            where: {
                delivery_date: { [Op.between]: [rangeStart, rangeEnd] },
            },
            include: [
                {
                    model: EquipmentDeliveryDetails,
                    as: "equipmentDetails",
                    attributes: ["equipment_condition"],
                    include: [
                        { model: Equipment, as: "equipment", attributes: ["equipment_id", "equipment_name"] },
                    ],
                },
            ],
        })

        const equipmentMap = new Map<number, {
            equipment_id:    number
            equipment_name:  string
            total_delivered: number
            total_changed:   number
            total:           number
        }>()

        for (const transaction of transactions) {
            const equipmentDetails = transaction.get("equipmentDetails") as EquipmentDeliveryDetails | null
            const equipment        = equipmentDetails?.get("equipment") as Equipment | null | undefined
            if (!equipment) continue

            if (!equipmentMap.has(equipment.equipment_id)) {
                equipmentMap.set(equipment.equipment_id, {
                    equipment_id:    equipment.equipment_id,
                    equipment_name:  equipment.equipment_name,
                    total_delivered: 0,
                    total_changed:   0,
                    total:           0,
                })
            }

            const entry = equipmentMap.get(equipment.equipment_id)!
            if (transaction.delivery_equipment_type === 'CHANGE') {
                entry.total_changed += 1
            } else {
                entry.total_delivered += 1
            }
            entry.total += 1
        }

        const result = Array.from(equipmentMap.values())
            .sort((first, second) => second.total - first.total)

        return res.status(200).json({
            data: {
                from,
                to,
                total_deliveries: transactions.length,
                equipment:        result,
            },
        })
    } catch (error) {
        console.error("Error in getDeliveriesByEquipment:", error)
        return res.status(500).json({ message: "Error al obtener entregas por equipo" })
    }
}

// ─── GET /api/equipment-reports/pending-employees ────────────────────────────
// Returns employees that have not yet completed the equipment delivery process,
// along with the date of their most recent delivery.
export const getPendingEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await EmployeeBenefited.findAll({
            where: { status: { [Op.ne]: EmployeeBenefitedStatus.COMPLETED } },
            include: [
                { model: DeliveryEquipmentTransaction, as: "transactions", attributes: ["delivery_date"] },
            ],
            order: [["employee_name", "ASC"]],
        })

        const result = employees.map((employee) => {
            const transactions = employee.get("transactions") as DeliveryEquipmentTransaction[] ?? []
            const lastDeliveryDate = transactions.reduce<Date | null>((latest, transaction) => {
                const date = transaction.delivery_date as unknown as Date
                return !latest || date > latest ? date : latest
            }, null)

            return {
                employee_benefited_id: employee.employee_benefited_id,
                employee_name:         employee.employee_name,
                employee_code:         employee.employee_code,
                employee_position:     employee.employee_position,
                department_name:       employee.department_name,
                status:                employee.status,
                last_delivery_date:    lastDeliveryDate,
            }
        })

        return res.status(200).json({
            data: {
                total:     result.length,
                employees: result,
            },
        })
    } catch (error) {
        console.error("Error in getPendingEmployees:", error)
        return res.status(500).json({ message: "Error al obtener empleados pendientes" })
    }
}
