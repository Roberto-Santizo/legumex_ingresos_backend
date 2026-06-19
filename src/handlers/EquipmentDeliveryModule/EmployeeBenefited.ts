import { Request, Response } from "express";
import EmployeeBenefited, { EmployeeBenefitedStatus } from "../../models/EquipmentDeliveryModule/EmployeeBenefited.model";
import DeliveryEquipmentTransaction from "../../models/EquipmentDeliveryModule/DeliveryEquipmentTransaction.model";
import { Op, WhereOptions } from "sequelize";

const BIOMETRICO_API_URL = process.env.BIOMETRICO_API_URL!;
const BIOMETRICO_API_KEY = process.env.BIOMETRICO_API_KEY!;

interface ExternalEmployee {
    id: string;
    name: string;
    code?: string;
    position?: string;
    deparment?: { name: string };
    photo_url?: string;
}


export const searchExternalEmployees = async (req: Request, response: Response) => {
    try {
        const apiResponse = await fetch(BIOMETRICO_API_URL, {
            headers: { Authorization: BIOMETRICO_API_KEY }
        });

        if (!apiResponse.ok) {
            return response.status(502).json({ message: "No se pudo conectar con el servicio de empleados" });
        }

        const externalEmployees = await apiResponse.json() as ExternalEmployee[];
        const searchQuery = (req.query.searchQuery as string ?? "").toLowerCase().trim();

        const employees = searchQuery
            ? externalEmployees.filter((employee) =>
                employee.name?.toLowerCase().includes(searchQuery) ||
                employee.code?.toLowerCase().includes(searchQuery)
            )
            : externalEmployees;

        // Enriquece cada empleado externo con su estado actual en el sistema (si ya existe),
        // para que el personal vea si ya recibió equipo antes de seleccionarlo de nuevo.
        const externalIds = employees.map((employee) => employee.id);
        const existingRecords = externalIds.length > 0
            ? await EmployeeBenefited.findAll({ where: { external_id: { [Op.in]: externalIds } } })
            : [];
        const recordByExternalId = new Map(existingRecords.map((record) => [record.external_id, record]));

        const enrichedEmployees = await Promise.all(employees.map(async (employee) => {
            const existingRecord = recordByExternalId.get(employee.id);
            if (!existingRecord) {
                return { ...employee, existing_status: null, last_delivery_date: null };
            }
            const lastDeliveryDate = await DeliveryEquipmentTransaction.max('delivery_date', {
                where: { employee_benefited_id: existingRecord.employee_benefited_id },
            }) as Date | null;
            return {
                ...employee,
                existing_status: existingRecord.status,
                last_delivery_date: lastDeliveryDate,
            };
        }));

        return response.status(200).json({ data: enrichedEmployees });
    } catch (error) {
        return response.status(500).json({ message: "Error al obtener empleados externos" });
    }
};

export const findOrCreateEmployeeBenefited = async (req: Request, response: Response) => {
    try {
        const { id, name, code, position, deparment, photo_url } = req.body as ExternalEmployee;

        if (!id || !name) {
            return response.status(400).json({ message: "Se requiere id y name del empleado" });
        }

        const [employee, created] = await EmployeeBenefited.findOrCreate({
            where: { external_id: id },
            defaults: {
                external_id: id,
                employee_name: name,
                employee_code: code ?? null,
                employee_position: position ?? null,
                department_name: deparment?.name ?? null,
                photo_url: photo_url ?? null,
            }
        });

        // Si el empleado ya había completado un ciclo de entrega, seleccionarlo de nuevo
        // reabre el proceso automaticamente para que pueda recibir equipo otra vez.
        const wasReopened = !created && employee.status === EmployeeBenefitedStatus.COMPLETED;

        if (!created) {
            await employee.update({
                employee_name: name,
                employee_code: code ?? null,
                employee_position: position ?? null,
                department_name: deparment?.name ?? null,
                photo_url: photo_url ?? null,
                ...(wasReopened ? { status: EmployeeBenefitedStatus.DELIVER_EQUIPMENT } : {}),
            });
        }

        return response.status(200).json({ data: employee, reopened: wasReopened });
    } catch (error) {
        return response.status(500).json({ message: "Error al registrar empleado beneficiado" });
    }
};

// GET /employee-benefited — lista empleados que ya han recibido equipos
export const getEmployeeBenefiteds = async (req: Request, response: Response) => {
    try {
        const {name} = req.query;
        const where: WhereOptions<EmployeeBenefited> = {};
        if(name){
            where.employee_name = {[Op.iLike]: `%${name}%`};
        }
        if(req.query.all === 'true'){
            const row = await EmployeeBenefited.findAll({where, order: [['updatedAt', 'DESC']]});
            return response.status(200).json({data: row});
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const{count,rows} = await EmployeeBenefited.findAndCountAll({
            where,
            limit,
            offset,
            order: [['updatedAt', 'DESC']],
        })
        const lastPage = Math.ceil(count / limit);
        return response.status(200).json({
            statusCode: 200,
            response: rows,
            total: count,
            page,
            lastPage,
            limit,
        })
    } catch (error) {
        return response.status(500).json({ message: "No se pudieron obtener los empleados beneficiados" });
    }
};

// DELETE /employee-benefited/:id — solo permite eliminar empleados que aún no han recibido equipo
export const deleteEmployeeBenefited = async (req: Request, response: Response) => {
    try {
        const { id } = req.params;
        const employeeBenefited = await EmployeeBenefited.findByPk(+id);
        if (!employeeBenefited) {
            return response.status(404).json({ message: "Empleado beneficiado no encontrado" });
        }
        if (employeeBenefited.status !== EmployeeBenefitedStatus.DELIVER_EQUIPMENT) {
            return response.status(400).json({ message: "Solo se pueden eliminar empleados que aún no han recibido equipo" });
        }
        await employeeBenefited.destroy();
        return response.status(200).json({ message: "Empleado beneficiado eliminado correctamente" });
    } catch (error) {
        return response.status(500).json({ message: "Error al eliminar el empleado beneficiado" });
    }
};
