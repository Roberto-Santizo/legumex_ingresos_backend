"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRole = exports.getRoleById = exports.getRoles = exports.createRole = void 0;
const AccessControl_1 = require("../../models/AccessControl");
const createRole = async (req, res) => {
    try {
        const role = await AccessControl_1.Role.create(req.body);
        return res.status(201).json({ message: "Rol creado correctamente", data: role });
    }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: "El nombre del rol ya existe" });
        }
        console.error(error);
        return res.status(500).json({ message: "No se pudo crear el rol" });
    }
};
exports.createRole = createRole;
const getRoles = async (req, res) => {
    try {
        if (req.query.all === "true") {
            const rows = await AccessControl_1.Role.findAll({ order: [['name', 'ASC']] });
            return res.status(200).json({ statusCode: 200, response: rows });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await AccessControl_1.Role.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
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
        console.error(error);
        return res.status(500).json({ message: "No se pudieron obtener los roles" });
    }
};
exports.getRoles = getRoles;
const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await AccessControl_1.Role.findByPk(+id);
        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }
        return res.status(200).json({ data: role });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener el rol" });
    }
};
exports.getRoleById = getRoleById;
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await AccessControl_1.Role.findByPk(+id);
        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }
        const { name } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        await role.update(updateData);
        return res.status(200).json({ message: "Rol actualizado correctamente", data: role });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el rol" });
    }
};
exports.updateRole = updateRole;
//# sourceMappingURL=role.js.map