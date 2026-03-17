import { Request, Response } from "express";
import VisitCompanion from "../models/VisitCompanion.model";
import VisitorPerson from "../models/VisitorPerson.model";

const includeRelations = [
    { model: VisitorPerson, as: 'visitor_person', attributes: ['id', 'name', 'document_number'] },
]

export const createVisitCompanion = async (req: Request, res: Response) => {
    try {
        const visitCompanion = await VisitCompanion.create(req.body)
        return res.status(201).json({ message: "Acompañante de visita creado correctamente", data: visitCompanion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al crear el acompañante de visita" })
    }
}

export const getVisitCompanions = async (_req: Request, res: Response) => {
    try {
        const visitCompanions = await VisitCompanion.findAll({ include: includeRelations })
        return res.status(200).json({ data: visitCompanions })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener los acompañantes de visita" })
    }
}

export const getVisitCompanionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visitCompanion = await VisitCompanion.findByPk(+id, { include: includeRelations })
        if (!visitCompanion) {
            return res.status(404).json({ message: "Acompañante de visita no encontrado" })
        }
        return res.status(200).json({ data: visitCompanion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener el acompañante de visita" })
    }
}

export const deleteVisitCompanion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visitCompanion = await VisitCompanion.findByPk(+id)
        if (!visitCompanion) {
            return res.status(404).json({ message: "Acompañante de visita no encontrado" })
        }
        await visitCompanion.destroy()
        return res.status(200).json({ message: "Acompañante de visita eliminado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al eliminar el acompañante de visita" })
    }
}
