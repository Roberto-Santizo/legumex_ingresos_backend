import { Request, Response } from "express";
import { Op } from "sequelize";
import db from "../config/db";
import Visit from "../models/Visit.model";
import VisitStatus from "../models/Visit_status.model";
import VisitCompanion from "../models/VisitCompanion.model";
import Company from "../models/Company.model";
import CompanyPerson from "../models/CompanyPerson.model";
import Department from "../models/Department.model";
import Agent from "../models/Agent.model";

const includeRelations = [
    { model: Company,       as: 'company',       attributes: ['id', 'name'] },
    { model: CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number', 'document_photo_front', 'document_photo_back', 'license_number', 'license_photo'] },
    { model: VisitStatus,   as: 'visit_status',  attributes: ['id', 'name'] },
    { model: Department,    as: 'department',    attributes: ['id', 'name'] },
    { model: Agent,         as: 'agent',         attributes: ['id', 'name'] },
    {
        model: VisitCompanion,
        as: 'visit_companions',
        separate: true,
        include: [{ model: CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] }],
    },
]

// IDs fijos de los estados de visita (evita queries extra en cada request)
const VISIT_STATUS_CACHE: Record<string, number> = {}

// Phase 1 - Schedule visit: visitor (company), person and date are required
export const createVisit = async (req: Request, res: Response) => {
    try {
        const { company_id, company_person_id, date, department_id, responsible_person, destination, companions } = req.body

        if (!company_id || !date || !department_id || !responsible_person || !destination) {
            return res.status(400).json({ message: "Faltan campos requeridos: company_id, date, department_id, responsible_person, destination" })
        }

        if (Array.isArray(companions) && companions.length > 0) {
            const isMainAlsoCompanion = companions.some((c: { company_person_id: number }) => c.company_person_id === company_person_id)
            if (isMainAlsoCompanion) {
                return res.status(400).json({ message: "La persona principal no puede ser también acompañante" })
            }
            const ids = companions.map((c: { company_person_id: number }) => c.company_person_id)
            if (new Set(ids).size !== ids.length) {
                return res.status(400).json({ message: "Hay personas duplicadas en los acompañantes" })
            }
        }

        const status = await VisitStatus.findOne({ where: { name: 'PROGRAMADA' } })
        if (!status) {
            return res.status(500).json({ message: "Estado 'PROGRAMADA' no encontrado. Verifique los estados de visita." })
        }

        const transaction = await db.transaction()
        try {
            const visit = await Visit.create({
                company_id,
                company_person_id,
                date,
                department_id,
                responsible_person,
                destination,
                visit_status_id: status.id,
                created_by: req.user!.id,
            }, { transaction })

            if (Array.isArray(companions) && companions.length > 0) {
                const companionRecords = companions.map((c: { company_person_id: number }) => ({
                    visit_id: visit.id,
                    company_person_id: c.company_person_id,
                }))
                await VisitCompanion.bulkCreate(companionRecords, { transaction })
            }

            if (transaction) await transaction.commit()
            return res.status(201).json({ message: "Cita programada correctamente", data: visit })
        } catch (txError: any) {
            if (transaction) await transaction.rollback()
            console.error("Error en createVisit transaction:", txError)
            return res.status(500).json({ message: "Error al programar la cita", detail: txError?.message })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al programar la cita" })
    }
}

// Get all visits with optional filters ?date=YYYY-MM-DD&status=PROGRAMADA&page=1&limit=10
export const getVisits = async (req: Request, res: Response) => {
    try {
        const { date, status } = req.query
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const offset = (page - 1) * limit
        const where: Record<string, any> = {}

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`)
            const end   = new Date(`${date}T23:59:59.999Z`)
            where.date = { [Op.between]: [start, end] }
        }

        if (status) {
            const statusName = String(status).toUpperCase()
            if (!VISIT_STATUS_CACHE[statusName]) {
                const found = await VisitStatus.findOne({ where: { name: statusName }, attributes: ['id'] })
                if (found) VISIT_STATUS_CACHE[statusName] = found.id
            }
            if (VISIT_STATUS_CACHE[statusName]) where.visit_status_id = VISIT_STATUS_CACHE[statusName]
        }

        // Si no tiene visits:view:all, solo ve las visitas que él creó
        const canViewAll = req.user!.permissions.includes('visits:view:all')
        if (!canViewAll) {
            where.created_by = req.user!.id
        }

        const { count, rows } = await Visit.findAndCountAll({
            where,
            include: includeRelations,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
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
        return res.status(500).json({ message: "Error al obtener las visitas" })
    }
}

// Today's visits (agent dashboard)
export const getVisitsToday = async (_req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0]

        const visits = await Visit.findAll({
            where: { date: today },
            include: includeRelations,
            order: [['createdAt', 'ASC']],
        })

        return res.status(200).json({ data: visits })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener las visitas de hoy" })
    }
}

// Visits currently inside the plant
export const getVisitsActive = async (_req: Request, res: Response) => {
    try {
        const status = await VisitStatus.findOne({ where: { name: 'EN PLANTA' } })
        if (!status) {
            return res.status(500).json({ message: "Estado 'EN PLANTA' no encontrado" })
        }

        const visits = await Visit.findAll({
            where: { visit_status_id: status.id },
            include: includeRelations,
        })

        return res.status(200).json({ data: visits })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener las visitas activas" })
    }
}

// Get visit detail
export const getVisitById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id, { include: includeRelations })
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }
        return res.status(200).json({ data: visit })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al obtener la visita" })
    }
}

// Phase 2 - Check-in: agent registers entry time and assigns badge numbers
// Body: { entry_time, badge_number, agent_id, companions?: [{ badge_number }] }
// company_person_id and companions persons are already set from createVisit
export const checkIn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id, {
            include: [{ model: VisitCompanion, as: 'visit_companions' }],
        })
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }

        // Only allow check-in if visit is in PROGRAMADA status
        const programadaStatus = await VisitStatus.findOne({ where: { name: 'PROGRAMADA' } })
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se puede registrar el ingreso de visitas en estado PROGRAMADA" })
        }

        const { entry_time, badge_number, agent_id, license_plate, companions } = req.body
        const company_person_id = visit.company_person_id ?? req.body.company_person_id

        if (!entry_time || !badge_number || !agent_id) {
            return res.status(400).json({ message: "Faltan campos requeridos: entry_time, badge_number, agent_id" })
        }

        if (companions !== undefined && !Array.isArray(companions)) {
            return res.status(400).json({ message: "companions debe ser un arreglo" })
        }

        const existingCompanions = ((visit as any).visit_companions as VisitCompanion[]) ?? []

        if (Array.isArray(companions) && companions.length > 0 && company_person_id !== undefined) {
            const isMainAlsoCompanion = companions.some((c: any) => c.company_person_id === company_person_id)
            if (isMainAlsoCompanion) {
                return res.status(400).json({
                    message: "La persona principal no puede ser también acompañante",
                    code: 'PERSON_DUPLICATE_ROLE',
                })
            }
        }

        // Validate badge_number for each existing companion
        if (existingCompanions.length > 0) {
            if (!Array.isArray(companions) || companions.length !== existingCompanions.length) {
                return res.status(400).json({ message: "Debe enviar badge_number para cada acompañante de la visita" })
            }
            for (const c of companions) {
                if (!c.badge_number) {
                    return res.status(400).json({ message: "Cada acompañante debe tener badge_number" })
                }
            }
        }

        // Badge numbers must be unique across main visitor and all companions
        if (Array.isArray(companions) && companions.length > 0) {
            const allBadgeNumbers = [badge_number, ...companions.map((c: { badge_number: string }) => c.badge_number)]
            const duplicateBadges = allBadgeNumbers.filter((b, i) => allBadgeNumbers.indexOf(b) !== i)
            if (duplicateBadges.length > 0) {
                return res.status(400).json({
                    message: `El carnet ${duplicateBadges[0]} esta asignado a mas de una persona. Cada visitante debe tener un carnet diferente. Verifique los carnets ingresados.`,
                    code: 'DUPLICATE_BADGE_NUMBER',
                    duplicate_badges: duplicateBadges,
                })
            }
        }

        const enPlantaStatus = await VisitStatus.findOne({ where: { name: 'EN PLANTA' } })
        if (!enPlantaStatus) {
            return res.status(500).json({ message: "Estado 'EN PLANTA' no encontrado" })
        }

        // Check that the main visitor is not currently inside the plant
        const mainPersonInPlant = await Visit.findOne({
            where: {
                company_person_id,
                visit_status_id: enPlantaStatus.id,
                id: { [Op.ne]: +id },
            },
            include: [{ model: CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] }],
        })
        if (mainPersonInPlant) {
            const person = (mainPersonInPlant as any).company_person
            return res.status(409).json({
                message: `Verifique: ${person?.name ?? 'Esta persona'} (DPI: ${person?.document_number ?? company_person_id}) actualmente se encuentra en planta en la visita #${mainPersonInPlant.id}. No puede ingresar hasta que finalice su visita activa.`,
                code: 'PERSON_ALREADY_IN_PLANT',
                active_visit_id: mainPersonInPlant.id,
            })
        }

        // Check that no companion is currently inside the plant
        for (const companion of existingCompanions) {
            const companionInPlant = await VisitCompanion.findOne({
                where: { company_person_id: companion.company_person_id },
                include: [{
                    model: Visit,
                    as: 'visit',
                    where: { visit_status_id: enPlantaStatus.id },
                    attributes: ['id'],
                }],
            })
            if (companionInPlant) {
                const companionPerson = await CompanyPerson.findByPk(companion.company_person_id, { attributes: ['name', 'document_number'] })
                return res.status(409).json({
                    message: `Verifique: ${companionPerson?.name ?? 'Un acompañante'} (DPI: ${companionPerson?.document_number ?? companion.company_person_id}) actualmente se encuentra en planta. No puede ingresar hasta que finalice su visita activa.`,
                    code: 'COMPANION_ALREADY_IN_PLANT',
                })
            }
        }

        const transaction = await db.transaction()
        try {
            await visit.update({
                entry_time,
                badge_number,
                agent_id,
                license_plate: license_plate ?? null,
                visit_status_id: enPlantaStatus.id,
            }, { transaction })

            // Update badge_number on existing companions (matched by index/order)
            if (Array.isArray(companions) && companions.length > 0) {
                for (let i = 0; i < existingCompanions.length; i++) {
                    await existingCompanions[i].update({ badge_number: companions[i].badge_number }, { transaction })
                }
            }

            await transaction.commit()
        } catch (txError: any) {
            await transaction.rollback()
            console.error("Error en checkIn transaction:", txError)
            return res.status(500).json({
                message: "Error al realizar el check-in",
                detail: txError?.message ?? String(txError),
            })
        }

        const updatedVisit = await Visit.findByPk(+id, { include: includeRelations })
        return res.status(200).json({ message: "Check-in realizado correctamente", data: updatedVisit })
    } catch (error: any) {
        console.error("Error en checkIn:", error)
        return res.status(500).json({
            message: "Error al realizar el check-in",
            detail: error?.message ?? String(error),
        })
    }
}

// Phase 3 - Check-out: visitor leaves the plant
export const checkOut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id)
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }

        const { exit_time } = req.body
        if (!exit_time) {
            return res.status(400).json({ message: "Falta campo requerido: exit_time" })
        }

        const status = await VisitStatus.findOne({ where: { name: 'FINALIZADA' } })
        if (!status) {
            return res.status(500).json({ message: "Estado 'FINALIZADA' no encontrado" })
        }

        await visit.update({ exit_time, visit_status_id: status.id })

        return res.status(200).json({ message: "Check-out realizado correctamente", data: visit })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al realizar el check-out" })
    }
}

// Update visit (only when PROGRAMADA) - edit fields and replace companions list
export const updateVisit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id, {
            include: [{ model: VisitCompanion, as: 'visit_companions' }],
        })
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }

        const programadaStatus = await VisitStatus.findOne({ where: { name: 'PROGRAMADA' } })
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se pueden editar visitas en estado PROGRAMADA" })
        }

        const { company_id, company_person_id, date, department_id, responsible_person, destination, companions } = req.body

        if (Array.isArray(companions)) {
            const companionIds = companions.map((c: { company_person_id: number }) => c.company_person_id)
            // Use new company_person_id if provided, otherwise keep existing
            const mainPersonId = company_person_id ?? visit.company_person_id
            if (mainPersonId != null && companionIds.includes(mainPersonId)) {
                return res.status(400).json({ message: "La persona principal no puede ser también acompañante" })
            }
            if (new Set(companionIds).size !== companionIds.length) {
                return res.status(400).json({ message: "Hay personas duplicadas en los acompañantes" })
            }
        }

        const transaction = await db.transaction()
        try {
            const updateData: Record<string, any> = {}
            if (company_id !== undefined)         updateData.company_id = company_id
            if (company_person_id !== undefined)  updateData.company_person_id = company_person_id
            if (date !== undefined)               updateData.date = date
            if (department_id !== undefined)      updateData.department_id = department_id
            if (responsible_person !== undefined) updateData.responsible_person = responsible_person
            if (destination !== undefined)        updateData.destination = destination

            if (Object.keys(updateData).length > 0) {
                await visit.update(updateData, { transaction })
            }

            // Replace entire companions list when provided
            if (Array.isArray(companions)) {
                await VisitCompanion.destroy({ where: { visit_id: visit.id }, transaction })
                if (companions.length > 0) {
                    const companionRecords = companions.map((c: { company_person_id: number }) => ({
                        visit_id: visit.id,
                        company_person_id: c.company_person_id,
                    }))
                    await VisitCompanion.bulkCreate(companionRecords, { transaction })
                }
            }

            await transaction.commit()
        } catch (txError: any) {
            await transaction.rollback()
            console.error("Error en updateVisit transaction:", txError)
            return res.status(500).json({ message: "Error al actualizar la visita", detail: txError?.message })
        }

        const updatedVisit = await Visit.findByPk(+id, { include: includeRelations })
        return res.status(200).json({ message: "Visita actualizada correctamente", data: updatedVisit })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al actualizar la visita" })
    }
}

// Delete visit (only when PROGRAMADA - not yet entered the plant)
export const deleteVisit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id)
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }

        const programadaStatus = await VisitStatus.findOne({ where: { name: 'PROGRAMADA' } })
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se pueden eliminar visitas en estado PROGRAMADA. Una visita que ya ingresó a planta no puede eliminarse." })
        }

        await VisitCompanion.destroy({ where: { visit_id: visit.id } })
        await visit.destroy()

        return res.status(200).json({ message: "Visita eliminada correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al eliminar la visita" })
    }
}

// Cancel visit
export const cancelVisit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id)
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }

        const status = await VisitStatus.findOne({ where: { name: 'CANCELADA' } })
        if (!status) {
            return res.status(500).json({ message: "Estado 'CANCELADA' no encontrado" })
        }

        await visit.update({ visit_status_id: status.id })

        return res.status(200).json({ message: "Visita cancelada correctamente", data: visit })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al cancelar la visita" })
    }
}
