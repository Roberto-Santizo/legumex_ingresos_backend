import { Request, Response } from "express";
import { Op } from "sequelize";
import db from "../config/db";
import Visit from "../models/Visit.model";
import VisitStatus from "../models/Visit_status.model";
import VisitCompanion from "../models/VisitCompanion.model";
import Visitor from "../models/Visitor.model";
import VisitorPerson from "../models/VisitorPerson.model";
import Department from "../models/Department.model";
import Agent from "../models/Agent.model";

const includeRelations = [
    { model: Visitor,       as: 'visitor',       attributes: ['id', 'name'] },
    { model: VisitorPerson, as: 'visitor_person', attributes: ['id', 'name', 'document_number', 'document_photo', 'license_number', 'license_photo'] },
    { model: VisitStatus,   as: 'visit_status',  attributes: ['id', 'name'] },
    { model: Department,    as: 'department',    attributes: ['id', 'name'] },
    { model: Agent,         as: 'agent',         attributes: ['id', 'name'] },
    {
        model: VisitCompanion,
        as: 'visit_companions',
        include: [{ model: VisitorPerson, as: 'visitor_person', attributes: ['id', 'name', 'document_number'] }],
    },
]

// Phase 1 - Schedule visit: only the visitor (company) and date are required
export const createVisit = async (req: Request, res: Response) => {
    try {
        const { visitor_id, date, department_id, responsible_person, destination } = req.body

        if (!visitor_id || !date || !department_id || !responsible_person || !destination) {
            return res.status(400).json({ message: "Faltan campos requeridos: visitor_id, date, department_id, responsible_person, destination" })
        }

        const status = await VisitStatus.findOne({ where: { name: 'PROGRAMADA' } })
        if (!status) {
            return res.status(500).json({ message: "Estado 'PROGRAMADA' no encontrado. Verifique los estados de visita." })
        }

        const visit = await Visit.create({
            visitor_id,
            date,
            department_id,
            responsible_person,
            destination,
            visit_status_id: status.id,
        })

        return res.status(201).json({ message: "Cita programada correctamente", data: visit })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al programar la cita" })
    }
}

// Get all visits with optional filters ?date=YYYY-MM-DD&status=PROGRAMADA
export const getVisits = async (req: Request, res: Response) => {
    try {
        const { date, status } = req.query
        const where: Record<string, any> = {}

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`)
            const end   = new Date(`${date}T23:59:59.999Z`)
            where.date = { [Op.between]: [start, end] }
        }

        if (status) {
            const visitStatus = await VisitStatus.findOne({ where: { name: String(status).toUpperCase() } })
            if (visitStatus) where.visit_status_id = visitStatus.id
        }

        const visits = await Visit.findAll({
            where,
            include: includeRelations,
            order: [['date', 'DESC']],
        })

        return res.status(200).json({ data: visits })
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

// Phase 2 - Check-in: agent confirms who arrived and registers entry
// Body: { visitor_person_id, entry_time, badge_number, agent_id, companions?: [{ visitor_person_id, badge_number }] }
export const checkIn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const visit = await Visit.findByPk(+id)
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" })
        }

        // Only allow check-in if visit is in PROGRAMADA status
        const programadaStatus = await VisitStatus.findOne({ where: { name: 'PROGRAMADA' } })
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se puede registrar el ingreso de visitas en estado PROGRAMADA" })
        }

        const { visitor_person_id, entry_time, badge_number, agent_id, companions } = req.body

        if (!visitor_person_id || !entry_time || !badge_number || !agent_id) {
            return res.status(400).json({ message: "Faltan campos requeridos: visitor_person_id, entry_time, badge_number, agent_id" })
        }

        // Validate companions is a valid array if provided
        if (companions !== undefined && !Array.isArray(companions)) {
            return res.status(400).json({ message: "El campo companions debe ser un arreglo" })
        }

        if (Array.isArray(companions)) {
            for (const companion of companions) {
                if (!companion.visitor_person_id || !companion.badge_number) {
                    return res.status(400).json({ message: "Cada acompañante debe tener visitor_person_id y badge_number" })
                }
            }

            // A person cannot be both the main visitor and a companion
            const mainVisitorIsAlsoCompanion = companions.some(
                (companion: { visitor_person_id: number }) => companion.visitor_person_id === visitor_person_id
            )
            if (mainVisitorIsAlsoCompanion) {
                const mainPerson = await VisitorPerson.findByPk(visitor_person_id, { attributes: ['name', 'document_number'] })
                return res.status(400).json({
                    message: `${mainPerson?.name ?? 'El visitante principal'} (DPI: ${mainPerson?.document_number ?? visitor_person_id}) está registrado como visitante principal y también como acompañante. Una persona solo puede tener un rol por visita.`,
                    code: 'PERSON_DUPLICATE_ROLE',
                })
            }

            // Companions cannot be duplicated among themselves
            const companionPersonIds = companions.map((companion: { visitor_person_id: number }) => companion.visitor_person_id)
            const uniquePersonIds = new Set(companionPersonIds)
            if (uniquePersonIds.size !== companionPersonIds.length) {
                return res.status(400).json({
                    message: 'Hay acompañantes duplicados en la lista. Cada persona solo puede aparecer una vez.',
                    code: 'DUPLICATE_COMPANIONS',
                })
            }

            // Badge numbers must be unique across main visitor and all companions
            const allBadgeNumbers = [badge_number, ...companions.map((companion: { badge_number: string }) => companion.badge_number)]
            const duplicateBadges = allBadgeNumbers.filter((badgeNumber, index) => allBadgeNumbers.indexOf(badgeNumber) !== index)
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
                visitor_person_id,
                visit_status_id: enPlantaStatus.id,
                id: { [Op.ne]: +id },
            },
            include: [{ model: VisitorPerson, as: 'visitor_person', attributes: ['id', 'name', 'document_number'] }],
        })
        if (mainPersonInPlant) {
            const person = (mainPersonInPlant as any).visitor_person
            return res.status(409).json({
                message: `Verifique: ${person?.name ?? 'Esta persona'} (DPI: ${person?.document_number ?? visitor_person_id}) actualmente se encuentra en planta en la visita #${mainPersonInPlant.id}. No puede ingresar hasta que finalice su visita activa.`,
                code: 'PERSON_ALREADY_IN_PLANT',
                active_visit_id: mainPersonInPlant.id,
            })
        }

        // Check that no companion is currently inside the plant
        if (Array.isArray(companions) && companions.length > 0) {
            for (const companion of companions) {
                const companionInPlant = await VisitCompanion.findOne({
                    where: { visitor_person_id: companion.visitor_person_id },
                    include: [{
                        model: Visit,
                        as: 'visit',
                        where: { visit_status_id: enPlantaStatus.id },
                        attributes: ['id'],
                    }],
                })
                if (companionInPlant) {
                    const companionPerson = await VisitorPerson.findByPk(companion.visitor_person_id, { attributes: ['name', 'document_number'] })
                    return res.status(409).json({
                        message: `Verifique: ${companionPerson?.name ?? 'Un acompañante'} (DPI: ${companionPerson?.document_number ?? companion.visitor_person_id}) actualmente se encuentra en planta. No puede ingresar hasta que finalice su visita activa.`,
                        code: 'COMPANION_ALREADY_IN_PLANT',
                    })
                }
            }
        }

        const transaction = await db.transaction()
        try {
            await visit.update({
                visitor_person_id,
                entry_time,
                badge_number,
                agent_id,
                visit_status_id: enPlantaStatus.id,
            }, { transaction })

            if (Array.isArray(companions) && companions.length > 0) {
                const companionRecords = companions.map((c: { visitor_person_id: number; badge_number: string }) => ({
                    visit_id: visit.id,
                    visitor_person_id: c.visitor_person_id,
                    badge_number: c.badge_number,
                }))
                await VisitCompanion.bulkCreate(companionRecords, { transaction })
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
