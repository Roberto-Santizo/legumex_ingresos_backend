"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDepartment = exports.updateDepartment = exports.getDepartmentById = exports.getDepartments = exports.createDepartment = void 0;
const VisitsModule_1 = require("../../models/VisitsModule");
const createDepartment = async (req, res) => {
    try {
        const department = await VisitsModule_1.Department.create(req.body);
        return res.status(201).json({ message: "Departamento creado correctamente", data: department });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al crear el departamento" });
    }
};
exports.createDepartment = createDepartment;
const getDepartments = async (req, res) => {
    try {
        if (req.query.all === "true") {
            const rows = await VisitsModule_1.Department.findAll({ order: [['name', 'ASC']] });
            return res.status(200).json({ statusCode: 200, response: rows });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await VisitsModule_1.Department.findAndCountAll({
            limit, offset, order: [['createdAt', 'DESC']]
        });
        const lastPage = Math.ceil(count / limit);
        return res.status(200).json({
            statusCode: 200,
            response: rows,
            total: count,
            page,
            lastPage,
            limit,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener los departamentos" });
    }
};
exports.getDepartments = getDepartments;
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await VisitsModule_1.Department.findByPk(+id);
        if (!department) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }
        return res.status(200).json({ data: department });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener el departamento" });
    }
};
exports.getDepartmentById = getDepartmentById;
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await VisitsModule_1.Department.findByPk(+id);
        if (!department) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }
        const { name, code } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (code !== undefined)
            updateData.code = code;
        await department.update(updateData);
        return res.status(200).json({ message: "Departamento actualizado correctamente", data: department });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al actualizar el departamento" });
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await VisitsModule_1.Department.findByPk(+id);
        if (!department) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }
        await department.destroy();
        return res.status(200).json({ message: "Departamento eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al eliminar el departamento" });
    }
};
exports.deleteDepartment = deleteDepartment;
//# sourceMappingURL=department.js.map