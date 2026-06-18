import { Request, Response } from "express";
import EmployeeBenefited from "../../models/EquipmentDeliveryModule/EmployeeBenefited.model";
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

        return response.status(200).json({ data: employees });
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

        if (!created) {
            await employee.update({
                employee_name: name,
                employee_code: code ?? null,
                employee_position: position ?? null,
                department_name: deparment?.name ?? null,
                photo_url: photo_url ?? null,
            });
        }

        return response.status(200).json({ data: employee });
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
            const row = await EmployeeBenefited.findAll({where, order: [['createdAt', 'DESC']]});
            return response.status(200).json({data: row});
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const{count,rows} = await EmployeeBenefited.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
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
