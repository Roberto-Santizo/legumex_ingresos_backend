import {Request, Response} from "express"
import Equipment from "../../models/EquipmentDeliveryModule/Equipment.model"
import { Op, WhereOptions } from "sequelize";

export const createEquipment = async (req:Request, res:Response) => {
    try{
        const equipment = await Equipment.create({...req.body, created_by: req.user!.name})
        return res.status(201).json({ message: "Equipo creado correctamente", data: equipment })
    }catch(error){
        return res.status(500).json({ message: "No se pudo crear el equipo" })

    }
}

export const getEquipments = async (req:Request, res:Response) => {
    try{
        const { name } = req.query
        const where: WhereOptions<Equipment> = {}
        if(name){
            where.equipment_name = { [Op.iLike]: `%${name}%` }
        }

        if (req.query.all === 'true'){
            const rows = await Equipment.findAll({order:[['createdAt', 'DESC']]})
            return res.status(200).json({ statusCode: 200, response: rows })
        }
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const offset = (page - 1) * limit
        
        const {count, rows} = await Equipment.findAndCountAll({
            where,
            limit,
            offset,
            order:[['createdAt', 'DESC']],
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
    }catch(error){
        return res.status(500).json({message: "No se pudieron obtener los equipos"})
    }
}

export const getEquipmentById = async (req:Request, res:Response) => {
    try{
        const { id } = req.params
        const equipment = await Equipment.findByPk(+id)
        if(!equipment){
            return res.status(404).json({message: "Equipo no encontrado"})
        }
        return res.status(200).json({data: equipment})
    }catch(error){
        return res.status(500).json({message: "No se pudo obtener el equipo"})
    }
}

export const updateEquipment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const equipment = await Equipment.findByPk(+id)

        if (!equipment) {
            return res.status(404).json({
                message: "Equipo no encontrado"
            })
        }

        await equipment.update({
            equipment_name: req.body.equipment_name,
            equipment_description: req.body.equipment_description
        })

        return res.status(200).json({
            message: "Equipo actualizado correctamente",
            data: equipment
        })
    } catch (error) {
        return res.status(500).json({
            message: "No se pudo actualizar el equipo"
        })
    }
}