import { Request, Response } from "express";
import Agent from "../models/Agent.model";

export const createAgent = async (req: Request, res: Response) => {
    try {
        const agent = await Agent.create(req.body)
        return res.status(201).json({ message: "Agente creado correctamente", data: agent })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "No se pudo crear el agente" })
    }
}

export const getAgents = async(req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const offset = (page - 1) * limit

        const { count, rows } = await Agent.findAndCountAll({
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
        console.log(error)
        return res.status(500).json({ message: "No se pudieron obtener los agentes" })
    }
}

export const getAgentById = async(req: Request, res: Response) => {
    try {
        const { id } = req.params
        const agent = await Agent.findByPk(+id)
        if(!agent){
            return res.status(404).json({ message: "Agente no encontrado" })
        }
        return res.status(200).json({ data: agent })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener el agente" })
    }
}

export const updateAgent = async(req: Request, res: Response) => {
    try {
        const { id } = req.params
        const agent = await Agent.findByPk(+id)
        if(!agent){
            return res.status(404).json({ message: "Agente no encontrado" })
        }
        const { name } = req.body
        const updateData: Record<string, any> = {}
        if(name !== undefined) updateData.name = name
        await agent.update(updateData)
        return res.status(200).json({ message: "Agente actualizado correctamente", data: agent })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar el agente" })
    }
}
