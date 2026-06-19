"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployeeBenefited = exports.getEmployeeBenefiteds = exports.findOrCreateEmployeeBenefited = exports.searchExternalEmployees = void 0;
const EmployeeBenefited_model_1 = __importStar(require("../../models/EquipmentDeliveryModule/EmployeeBenefited.model"));
const DeliveryEquipmentTransaction_model_1 = __importDefault(require("../../models/EquipmentDeliveryModule/DeliveryEquipmentTransaction.model"));
const sequelize_1 = require("sequelize");
const BIOMETRICO_API_URL = process.env.BIOMETRICO_API_URL;
const BIOMETRICO_API_KEY = process.env.BIOMETRICO_API_KEY;
const searchExternalEmployees = async (req, response) => {
    try {
        const apiResponse = await fetch(BIOMETRICO_API_URL, {
            headers: { Authorization: BIOMETRICO_API_KEY }
        });
        if (!apiResponse.ok) {
            return response.status(502).json({ message: "No se pudo conectar con el servicio de empleados" });
        }
        const externalEmployees = await apiResponse.json();
        const searchQuery = (req.query.searchQuery ?? "").toLowerCase().trim();
        const employees = searchQuery
            ? externalEmployees.filter((employee) => employee.name?.toLowerCase().includes(searchQuery) ||
                employee.code?.toLowerCase().includes(searchQuery))
            : externalEmployees;
        // Enriquece cada empleado externo con su estado actual en el sistema (si ya existe),
        // para que el personal vea si ya recibió equipo antes de seleccionarlo de nuevo.
        const externalIds = employees.map((employee) => employee.id);
        const existingRecords = externalIds.length > 0
            ? await EmployeeBenefited_model_1.default.findAll({ where: { external_id: { [sequelize_1.Op.in]: externalIds } } })
            : [];
        const recordByExternalId = new Map(existingRecords.map((record) => [record.external_id, record]));
        const enrichedEmployees = await Promise.all(employees.map(async (employee) => {
            const existingRecord = recordByExternalId.get(employee.id);
            if (!existingRecord) {
                return { ...employee, existing_status: null, last_delivery_date: null };
            }
            const lastDeliveryDate = await DeliveryEquipmentTransaction_model_1.default.max('delivery_date', {
                where: { employee_benefited_id: existingRecord.employee_benefited_id },
            });
            return {
                ...employee,
                existing_status: existingRecord.status,
                last_delivery_date: lastDeliveryDate,
            };
        }));
        return response.status(200).json({ data: enrichedEmployees });
    }
    catch (error) {
        return response.status(500).json({ message: "Error al obtener empleados externos" });
    }
};
exports.searchExternalEmployees = searchExternalEmployees;
const findOrCreateEmployeeBenefited = async (req, response) => {
    try {
        const { id, name, code, position, deparment, photo_url } = req.body;
        if (!id || !name) {
            return response.status(400).json({ message: "Se requiere id y name del empleado" });
        }
        const [employee, created] = await EmployeeBenefited_model_1.default.findOrCreate({
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
        const wasReopened = !created && employee.status === EmployeeBenefited_model_1.EmployeeBenefitedStatus.COMPLETED;
        if (!created) {
            await employee.update({
                employee_name: name,
                employee_code: code ?? null,
                employee_position: position ?? null,
                department_name: deparment?.name ?? null,
                photo_url: photo_url ?? null,
                ...(wasReopened ? { status: EmployeeBenefited_model_1.EmployeeBenefitedStatus.DELIVER_EQUIPMENT } : {}),
            });
        }
        return response.status(200).json({ data: employee, reopened: wasReopened });
    }
    catch (error) {
        return response.status(500).json({ message: "Error al registrar empleado beneficiado" });
    }
};
exports.findOrCreateEmployeeBenefited = findOrCreateEmployeeBenefited;
// GET /employee-benefited — lista empleados que ya han recibido equipos
const getEmployeeBenefiteds = async (req, response) => {
    try {
        const { name } = req.query;
        const where = {};
        if (name) {
            where.employee_name = { [sequelize_1.Op.iLike]: `%${name}%` };
        }
        if (req.query.all === 'true') {
            const row = await EmployeeBenefited_model_1.default.findAll({ where, order: [['updatedAt', 'DESC']] });
            return response.status(200).json({ data: row });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await EmployeeBenefited_model_1.default.findAndCountAll({
            where,
            limit,
            offset,
            order: [['updatedAt', 'DESC']],
        });
        const lastPage = Math.ceil(count / limit);
        return response.status(200).json({
            statusCode: 200,
            response: rows,
            total: count,
            page,
            lastPage,
            limit,
        });
    }
    catch (error) {
        return response.status(500).json({ message: "No se pudieron obtener los empleados beneficiados" });
    }
};
exports.getEmployeeBenefiteds = getEmployeeBenefiteds;
// DELETE /employee-benefited/:id — solo permite eliminar empleados que aún no han recibido equipo
const deleteEmployeeBenefited = async (req, response) => {
    try {
        const { id } = req.params;
        const employeeBenefited = await EmployeeBenefited_model_1.default.findByPk(+id);
        if (!employeeBenefited) {
            return response.status(404).json({ message: "Empleado beneficiado no encontrado" });
        }
        if (employeeBenefited.status !== EmployeeBenefited_model_1.EmployeeBenefitedStatus.DELIVER_EQUIPMENT) {
            return response.status(400).json({ message: "Solo se pueden eliminar empleados que aún no han recibido equipo" });
        }
        await employeeBenefited.destroy();
        return response.status(200).json({ message: "Empleado beneficiado eliminado correctamente" });
    }
    catch (error) {
        return response.status(500).json({ message: "Error al eliminar el empleado beneficiado" });
    }
};
exports.deleteEmployeeBenefited = deleteEmployeeBenefited;
//# sourceMappingURL=EmployeeBenefited.js.map