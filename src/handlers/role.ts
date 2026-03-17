import { Request, response, Response } from "express";
import Role from "../models/Role.model";

export const createRole = async (req: Request, res: Response) => {
    try {
        const role = await Role.create(req.body)
        return res.status(201).json({ message: "Rol creado correctamente", data: role })
    } catch (error) {
        if ((error as any).name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: "El nombre del rol ya existe" })
        }
        console.error(error)
        return res.status(500).json({ message: "No se pudo crear el rol" })
    }
}

export const getRoles = async(req: Request, res: Response) => {
    try {
        if(req.query.all ==="true"){
            const rows = await Role.findAll({order:[['name', 'ASC']]})
            return res.status(200).json({statusCode: 200, response: rows})
        }
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const offset = (page - 1) * limit
        const { count, rows } = await Role.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        })
        const lastPage = Math.ceil(count / limit)

        return res.status(200).json({ 
            statusCode: 200,
            response: rows,
            total: count,
            page,
            lastPage,
            limit, 
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "No se pudieron obtener los roles" })
    }
}

export const getRoleById = async(req: Request, res: Response) => {
    try {
        const { id } = req.params
        const role = await Role.findByPk(+id)
        if(!role){
            return res.status(404).json({ message: "Rol no encontrado" })
        }
        return res.status(200).json({ data: role })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al obtener el rol" })
    }
}

export const updateRole = async(req: Request, res: Response) => {
    try {
        const { id } = req.params
        const role = await Role.findByPk(+id)
        if(!role){
            return res.status(404).json({ message: "Rol no encontrado" })
        }
        const { name } = req.body
        const updateData: Record<string, any> = {}
        if(name !== undefined) updateData.name = name
        await role.update(updateData)
        return res.status(200).json({ message: "Rol actualizado correctamente", data: role })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al actualizar el rol" })
    }
}
