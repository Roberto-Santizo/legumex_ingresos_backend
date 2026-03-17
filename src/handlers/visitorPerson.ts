import { Request, Response } from "express";
import VisitorPerson from "../models/VisitorPerson.model";
import Visitor from "../models/Visitor.model";

export const createVisitorPerson = async (req: Request, res: Response) => {
    try {
        const person = await VisitorPerson.create(req.body)
        return res.status(201).json({ message: "Persona creada correctamente", data: person })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al crear la persona" })
    }
}

export const getVisitorPersons = async (req: Request, res: Response) => {
    try {
        const page  = parseInt(req.query.page  as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const offset = (page - 1) * limit

        const { count, rows } = await VisitorPerson.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: Visitor, attributes: ['id', 'name'] }],
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
        return res.status(500).json({ message: "Error al obtener las personas" })
    }
}

export const getVisitorPersonById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const person = await VisitorPerson.findByPk(+id, {
            include: [{ model: Visitor, attributes: ['id', 'name'] }],
        })
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" })
        }
        return res.status(200).json({ data: person })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener la persona" })
    }
}

// Listar personas de un visitante/empresa especifico (util para el dropdown del check-in)
export const getVisitorPersonsByVisitor = async (req: Request, res: Response) => {
    try {
        const { visitor_id } = req.params
        const persons = await VisitorPerson.findAll({
            where: { visitor_id: +visitor_id },
            order: [['name', 'ASC']],
        })
        return res.status(200).json({ data: persons })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener las personas del visitante" })
    }
}

export const updateVisitorPerson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const person = await VisitorPerson.findByPk(+id)
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" })
        }
        const { visitor_id, name, document_number, document_photo, license_number, license_photo } = req.body
        const updateData: Record<string, any> = {}
        if (visitor_id !== undefined)       updateData.visitor_id = visitor_id
        if (name !== undefined)             updateData.name = name
        if (document_number !== undefined)  updateData.document_number = document_number
        if (document_photo !== undefined)   updateData.document_photo = document_photo
        if (license_number !== undefined)   updateData.license_number = license_number
        if (license_photo !== undefined)    updateData.license_photo = license_photo
        await person.update(updateData)
        return res.status(200).json({ message: "Persona actualizada correctamente", data: person })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar la persona" })
    }
}

export const deleteVisitorPerson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const person = await VisitorPerson.findByPk(+id)
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" })
        }
        await person.destroy()
        return res.status(200).json({ message: "Persona eliminada correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al eliminar la persona" })
    }
}
