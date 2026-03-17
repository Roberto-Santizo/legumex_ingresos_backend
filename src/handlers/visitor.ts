import { Request, Response } from "express"
import Visitor from "../models/Visitor.model";

export const createVisitor = async (req: Request, res: Response) => {
    try {
        const visitor = await Visitor.create(req.body)
        return res.status(201).json({ message: "Visitante creado correctamente", data: visitor })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "No se pudo crear el visitante" })
    }
}

export const getVisitors = async (req: Request, res: Response) => {
    try {
        if (req.query.all === "true") {
            const rows = await Visitor.findAll({ order: [['name', 'ASC']] })
            return res.status(200).json({ statusCode: 200, response: rows })
        }

        const page  = parseInt(req.query.page  as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const offset = (page - 1) * limit

        const { count, rows } = await Visitor.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC'], ['id', 'ASC']],
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
        console.log(error)
        return res.status(500).json({ message: "No se pudieron obtener los visitantes" })
    }
}

export const getVisitorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visitor = await Visitor.findByPk(+id)
        if (!visitor) {
            return res.status(404).json({ message: "Visitante no encontrado" })
        }
        return res.status(200).json({ data: visitor })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener el visitante" })
    }
}

export const updateVisitor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visitor = await Visitor.findByPk(+id)
        if (!visitor) {
            return res.status(404).json({ message: "Visitante no encontrado" })
        }
        const { name } = req.body
        const updateData: Record<string, any> = {}
        if (name !== undefined) updateData.name = name
        await visitor.update(updateData)
        return res.status(200).json({ message: "Visitante actualizado correctamente", data: visitor })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar el visitante" })
    }
}
