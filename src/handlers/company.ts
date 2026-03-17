import { Request, Response } from "express"
import Company from "../models/Company.model";

export const createCompany = async (req: Request, res: Response) => {
    try {
        const company = await Company.create(req.body)
        return res.status(201).json({ message: "Empresa creada correctamente", data: company })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "No se pudo crear la empresa" })
    }
}

export const getCompanies = async(req: Request, res: Response) => {
    try {
      if (req.query.all === "true") {
        const rows = await Company.findAll({ order: [['name', 'ASC']] })
        return res.status(200).json({ statusCode: 200, response: rows })
      }

      const page  = parseInt(req.query.page  as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const offset = (page - 1) * limit

      const { count, rows } = await Company.findAndCountAll({
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
        return res.status(500).json({ message: "No se pudieron obtener las empresas" })
    }
}

export const getCompanyById = async(req: Request, res: Response) => {
    try {
        const { id } = req.params
        const company = await Company.findByPk(+id)
        if(!company){
            return res.status(404).json({ message: "Empresa no encontrada" })
        }
        return res.status(200).json({ data: company })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener la empresa" })
    }
}

export const updateCompany = async(req: Request, res: Response) => {
    try {
        const { id } = req.params
        const company = await Company.findByPk(+id)
        if(!company){
            return res.status(404).json({ message: "Empresa no encontrada" })
        }
        const { name } = req.body
        const updateData: Record<string, any> = {}
        if(name !== undefined) updateData.name = name
        await company.update(updateData)
        return res.status(200).json({ message: "Empresa actualizada correctamente", data: company })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar la empresa" })
    }
}
