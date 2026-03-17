import { Request, Response } from "express";
import Companion from "../models/Companion.model";

export const createCompanion = async (req: Request, res: Response) => {
    try {
        const companion = await Companion.create(req.body)
        return res.status(201).json({ message: "Acompañante creado correctamente", data: companion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "No se pudo crear el acompañante" })
    }
}

export const getCompanions = async (req: Request, res: Response) => {
    try {
        const companions = await Companion.findAll()
        return res.status(200).json({ data: companions })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener los acompañantes" })
    }
}

export const getCompanionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const companion = await Companion.findByPk(+id)
        if (!companion) {
            return res.status(404).json({ message: "Acompañante no encontrado" })
        }
        return res.status(200).json({ data: companion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener el acompañante" })
    }
}

export const updateCompanion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const companion = await Companion.findByPk(+id)
        if (!companion) {
            return res.status(404).json({ message: "Acompañante no encontrado" })
        }
        const { full_name, document_number, document_photo, license_number, license_photo } = req.body
        const updateData: Record<string, any> = {}
        if (full_name !== undefined)        updateData.full_name = full_name
        if (document_number !== undefined)  updateData.document_number = document_number
        if (document_photo !== undefined)   updateData.document_photo = document_photo
        if (license_number !== undefined)   updateData.license_number = license_number
        if (license_photo !== undefined)    updateData.license_photo = license_photo
        await companion.update(updateData)
        return res.status(200).json({ message: "Acompañante actualizado correctamente", data: companion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar el acompañante" })
    }
}

export const deleteCompanion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const companion = await Companion.findByPk(+id)
        if (!companion) {
            return res.status(404).json({ message: "Acompañante no encontrado" })
        }
        await companion.destroy()
        return res.status(200).json({ message: "Acompañante eliminado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al eliminar el acompañante" })
    }
}
