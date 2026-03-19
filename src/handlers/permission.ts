import { Request, Response } from "express"
import Permission from "../models/Permission.model"
import Role from "../models/Role.model"
import RolePermission from "../models/RolePermission.model"

export const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await Permission.findAll({ order: [['name', 'ASC']] })
        return res.status(200).json({ data: permissions })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al obtener los permisos" })
    }
}

export const getRolePermissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const role = await Role.findByPk(+id, {
            include: [{ model: Permission }]
        })
        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" })
        }
        const permissions = (role as any).permissions ?? []
        return res.status(200).json({ data: permissions })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al obtener los permisos del rol" })
    }
}

export const updateRolePermissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { permissions } = req.body as { permissions: string[] }

        const role = await Role.findByPk(+id)
        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" })
        }

        // Fetch Permission ids by name
        const permissionRecords = await Permission.findAll({
            where: { name: permissions }
        })

        // Delete existing and replace with new ones
        await RolePermission.destroy({ where: { role_id: +id } })
        await RolePermission.bulkCreate(
            permissionRecords.map(p => ({ role_id: +id, permission_id: p.id }))
        )

        return res.status(200).json({ message: "Permisos actualizados correctamente" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al actualizar los permisos del rol" })
    }
}
