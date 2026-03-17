import { Request, Response } from "express"
import User from "../models/User.model"
import bcrypt from "bcrypt"
import Role from "../models/Role.model"
import Department from "../models/Department.model"


export const createUser = async (req: Request, res: Response) => {
   try {
      const { password, username, ...rest } = req.body

      const existing = await User.findOne({ where: { username } })
      if (existing) {
         return res.status(409).json({ message: "El nombre de usuario ya está en uso" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const product = await User.create({ ...rest, username, password: hashedPassword })
      return res.status(201).json({ message: "Usuario creado correctamente", data: product })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "No se pudo crear el usuario" })
   }
}

export const getUsers = async(req: Request, res: Response) => {
   try {
      const page  = parseInt(req.query.page  as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const offset = (page - 1) * limit

      const { count, rows } = await User.findAndCountAll({
         limit,
         offset,
         order: [['createdAt', 'DESC']],

         include:[
            {model: Role, attributes:['name']},
            {model: Department, attributes:['name']}
         ]
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
      return res.status(500).json({ message: "No se pudieron obtener los usuarios" })
   }
}

export const getUserById = async(req: Request, res: Response) => {
   try {
      const { id } = req.params
      const user = await User.findByPk(+id)
      if(!user){
         return res.status(404).json({ message: "Usuario no encontrado" })
      }
      return res.status(200).json({ data: user })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Error al obtener el usuario" })
   }
}

export const updateUser = async(req: Request, res: Response) => {
   try {
      const { id } = req.params
      const user = await User.findByPk(+id)
      if(!user){
         return res.status(404).json({ message: "Usuario no encontrado" })
      }

      const { name, username, department_id, role_id, password } = req.body

      const updateData: Record<string, any> = {}

      if(name !== undefined)          updateData.name = name
      if(username !== undefined)      updateData.username = username
      if(department_id !== undefined) updateData.department_id = department_id
      if(role_id !== undefined)       updateData.role_id = role_id
      if(password)                    updateData.password = await bcrypt.hash(password, 10)

      await user.update(updateData)

      return res.status(200).json({ message: "Usuario actualizado correctamente", data: user })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Error al actualizar el usuario" })
   }
}
