"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRolePermissions = exports.getRolePermissions = exports.getAllPermissions = void 0;
const AccessControl_1 = require("../../models/AccessControl");
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await AccessControl_1.Permission.findAll({ order: [['name', 'ASC']] });
        return res.status(200).json({ data: permissions });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los permisos" });
    }
};
exports.getAllPermissions = getAllPermissions;
const getRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await AccessControl_1.Role.findByPk(+id, {
            include: [{ model: AccessControl_1.Permission }]
        });
        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }
        const permissions = role.permissions ?? [];
        return res.status(200).json({ data: permissions });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los permisos del rol" });
    }
};
exports.getRolePermissions = getRolePermissions;
const updateRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;
        const role = await AccessControl_1.Role.findByPk(+id);
        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }
        // Fetch Permission ids by name
        const permissionRecords = await AccessControl_1.Permission.findAll({
            where: { name: permissions }
        });
        // Delete existing and replace with new ones
        await AccessControl_1.RolePermission.destroy({ where: { role_id: +id } });
        await AccessControl_1.RolePermission.bulkCreate(permissionRecords.map(p => ({ role_id: +id, permission_id: p.id })));
        return res.status(200).json({ message: "Permisos actualizados correctamente" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar los permisos del rol" });
    }
};
exports.updateRolePermissions = updateRolePermissions;
//# sourceMappingURL=permission.js.map