import { Request, response, Response } from "express";
import Department from "../models/Department.model";

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const department = await Department.create(req.body)
        return res.status(201).json({ message: "Departamento creado correctamente", data: department })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al crear el departamento" })
    }
}

export const getDepartments = async (req: Request, res: Response) => {
    try {
        if(req.query.all === "true"){
            const rows = await Department.findAll({order:[['name', 'ASC']]})
            return res.status(200).json({statusCode: 200, response: rows})
        }
        const page = parseInt(req.query.page as string)|| 1
        const limit = parseInt(req.query.limit as string)|| 10
        const offset = (page-1) * limit
        const {count, rows} = await Department.findAndCountAll({
            limit, offset, order: [['createdAt', 'DESC']]
        })
    
        const lastPage = Math.ceil(count/limit)
        return res.status(200).json({
            statusCode: 200,
            response: rows,
            total: count,
            page,
            lastPage,
            limit,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener los departamentos" })
    }
}

export const getDepartmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const department = await Department.findByPk(+id)
        if (!department) {
            return res.status(404).json({ message: "Departamento no encontrado" })
        }
        return res.status(200).json({ data: department })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener el departamento" })
    }
}

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const department = await Department.findByPk(+id)
        if (!department) {
            return res.status(404).json({ message: "Departamento no encontrado" })
        }
        const { name, code } = req.body
        const updateData: Record<string, any> = {}
        if (name !== undefined) updateData.name = name
        if (code !== undefined) updateData.code = code
        await department.update(updateData)
        return res.status(200).json({ message: "Departamento actualizado correctamente", data: department })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar el departamento" })
    }
}

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const department = await Department.findByPk(+id)
        if (!department) {
            return res.status(404).json({ message: "Departamento no encontrado" })
        }
        await department.destroy()
        return res.status(200).json({ message: "Departamento eliminado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al eliminar el departamento" })
    }
}
