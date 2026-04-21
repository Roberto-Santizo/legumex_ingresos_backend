import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import People from "../models/People.model";

export const createPeople = async (req: Request, res: Response) => {
    try {
        const person = await People.create(req.body)
        return res.status(201).json({ message: "Persona creada correctamente", data: person })
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            const field = error.errors[0]?.path ?? "documento"
            return res.status(409).json({
                message: `La persona que estás tratando de registrar ya está registrada en el sistema. El campo "${field}" ya existe.`
            })
        }
        console.log(error)
        return res.status(500).json({ message: "Error al crear la persona" })
    }
}

export const getPeople = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string)|| 1
        const limit = parseInt(req.query.limit as string)|| 10
        const offset = (page - 1) * limit

        const {count, rows} = await People.findAndCountAll({
            attributes: { exclude: ['document_photo_front', 'document_photo_back', 'license_photo'] },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
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
        return res.status(500).json({ message: "Error al obtener las personas" })
    }
}

export const getPeopleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const person = await People.findByPk(+id)
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" })
        }
        return res.status(200).json({ data: person })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener la persona" })
    }
}

export const updatePeople = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const person = await People.findByPk(+id)
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" })
        }
        const { company_id, name, document_number, document_photo_front, document_photo_back, license_number, license_photo } = req.body
        const updateData: Record<string, any> = {}
        if (company_id !== undefined)             updateData.company_id = company_id
        if (name !== undefined)                   updateData.name = name
        if (document_number !== undefined)        updateData.document_number = document_number
        if (document_photo_front !== undefined)   updateData.document_photo_front = document_photo_front
        if (document_photo_back !== undefined)    updateData.document_photo_back = document_photo_back
        if (license_number !== undefined)        updateData.license_number = license_number
        if (license_photo !== undefined)         updateData.license_photo = license_photo
        await person.update(updateData)
        return res.status(200).json({ message: "Persona actualizada correctamente", data: person })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar la persona" })
    }
}

export const deletePeople = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const person = await People.findByPk(+id)
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
