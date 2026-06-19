"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelVisit = exports.deleteVisit = exports.updateVisit = exports.checkOut = exports.checkIn = exports.getVisitById = exports.getVisitsActive = exports.getVisitsToday = exports.getVisits = exports.createVisit = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../../config/db"));
const VisitsModule_1 = require("../../models/VisitsModule");
const includeRelations = [
    { model: VisitsModule_1.Company, as: 'company', attributes: ['id', 'name'] },
    {
        model: VisitsModule_1.CompanyPerson, as: 'company_person',
        attributes: [
            'id', 'name', 'document_number', 'license_number',
            [(0, sequelize_1.literal)("NULLIF(\"company_person\".\"document_photo_front\", '') IS NOT NULL"), 'has_document_photo_front'],
            [(0, sequelize_1.literal)("NULLIF(\"company_person\".\"license_photo\", '') IS NOT NULL"), 'has_license_photo'],
        ],
    },
    { model: VisitsModule_1.VisitStatus, as: 'visit_status', attributes: ['id', 'name'] },
    { model: VisitsModule_1.Department, as: 'department', attributes: ['id', 'name'] },
    { model: VisitsModule_1.Agent, as: 'agent', attributes: ['id', 'name'] },
    {
        model: VisitsModule_1.VisitCompanion,
        as: 'visit_companions',
        include: [{ model: VisitsModule_1.CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] }],
    },
];
// IDs fijos de los estados de visita (evita queries extra en cada request)
const VISIT_STATUS_CACHE = {};
const errorMessage = (error) => error instanceof Error ? error.message : undefined;
// Phase 1 - Schedule visit: visitor (company), person and date are required
const createVisit = async (req, res) => {
    try {
        const { company_id, company_person_id, date, department_id, responsible_person, destination, companions } = req.body;
        if (!company_id || !date || !department_id || !responsible_person || !destination) {
            return res.status(400).json({ message: "Faltan campos requeridos: company_id, date, department_id, responsible_person, destination" });
        }
        if (Array.isArray(companions) && companions.length > 0) {
            const isMainAlsoCompanion = companions.some((c) => c.company_person_id === company_person_id);
            if (isMainAlsoCompanion) {
                return res.status(400).json({ message: "La persona principal no puede ser también acompañante" });
            }
            const ids = companions.map((c) => c.company_person_id);
            if (new Set(ids).size !== ids.length) {
                return res.status(400).json({ message: "Hay personas duplicadas en los acompañantes" });
            }
        }
        const status = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'PROGRAMADA' } });
        if (!status) {
            return res.status(500).json({ message: "Estado 'PROGRAMADA' no encontrado. Verifique los estados de visita." });
        }
        const transaction = await db_1.default.transaction();
        try {
            const visit = await VisitsModule_1.Visit.create({
                company_id,
                company_person_id,
                date,
                department_id,
                responsible_person,
                destination,
                visit_status_id: status.id,
                created_by: req.user.id,
            }, { transaction });
            if (Array.isArray(companions) && companions.length > 0) {
                const companionRecords = companions.map((c) => ({
                    visit_id: visit.id,
                    company_person_id: c.company_person_id,
                }));
                await VisitsModule_1.VisitCompanion.bulkCreate(companionRecords, { transaction });
            }
            if (transaction)
                await transaction.commit();
            return res.status(201).json({ message: "Cita programada correctamente", data: visit });
        }
        catch (txError) {
            if (transaction)
                await transaction.rollback();
            console.error("Error en createVisit transaction:", txError);
            return res.status(500).json({ message: "Error al programar la cita", detail: errorMessage(txError) });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al programar la cita" });
    }
};
exports.createVisit = createVisit;
// Get all visits with optional filters ?date=YYYY-MM-DD&status=PROGRAMADA&name=xx&document_number=xx&page=1&limit=10
const getVisits = async (req, res) => {
    try {
        const { date, status, name, document_number } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const where = {};
        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);
            where.date = { [sequelize_1.Op.between]: [start, end] };
        }
        if (status) {
            const statusName = String(status).toUpperCase();
            if (!VISIT_STATUS_CACHE[statusName]) {
                const found = await VisitsModule_1.VisitStatus.findOne({ where: { name: statusName }, attributes: ['id'] });
                if (found)
                    VISIT_STATUS_CACHE[statusName] = found.id;
            }
            if (VISIT_STATUS_CACHE[statusName])
                where.visit_status_id = VISIT_STATUS_CACHE[statusName];
        }
        // Si no tiene visits:view:all, solo ve las visitas que él creó
        const canViewAll = req.user.permissions.includes('visits:view:all');
        if (!canViewAll) {
            where.created_by = req.user.id;
        }
        const personWhere = {};
        if (name)
            personWhere.name = { [sequelize_1.Op.iLike]: `%${name}%` };
        if (document_number)
            personWhere.document_number = { [sequelize_1.Op.iLike]: `%${document_number}%` };
        const hasPersonFilter = Object.keys(personWhere).length > 0;
        const activeInclude = hasPersonFilter
            ? includeRelations.map(rel => ('as' in rel && rel.as === 'company_person')
                ? { ...rel, where: personWhere, required: true }
                : rel)
            : includeRelations;
        const { count, rows } = await VisitsModule_1.Visit.findAndCountAll({
            where,
            include: activeInclude,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true,
        });
        const lastPage = Math.ceil(count / limit);
        return res.status(200).json({
            statusCode: 200,
            response: rows,
            total: count,
            page,
            lastPage,
            limit,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener las visitas" });
    }
};
exports.getVisits = getVisits;
// Today's visits (agent dashboard)
const getVisitsToday = async (_req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const visits = await VisitsModule_1.Visit.findAll({
            where: { date: today },
            include: includeRelations,
            order: [['createdAt', 'ASC']],
        });
        return res.status(200).json({ data: visits });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener las visitas de hoy" });
    }
};
exports.getVisitsToday = getVisitsToday;
// Visits currently inside the plant
const getVisitsActive = async (_req, res) => {
    try {
        const status = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'EN PLANTA' } });
        if (!status) {
            return res.status(500).json({ message: "Estado 'EN PLANTA' no encontrado" });
        }
        const visits = await VisitsModule_1.Visit.findAll({
            where: { visit_status_id: status.id },
            include: includeRelations,
        });
        return res.status(200).json({ data: visits });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener las visitas activas" });
    }
};
exports.getVisitsActive = getVisitsActive;
// Get visit detail
const getVisitById = async (req, res) => {
    try {
        const { id } = req.params;
        const visit = await VisitsModule_1.Visit.findByPk(+id, { include: includeRelations });
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" });
        }
        return res.status(200).json({ data: visit });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener la visita" });
    }
};
exports.getVisitById = getVisitById;
// Phase 2 - Check-in: agent registers entry time and assigns badge numbers
// Body: { entry_time, badge_number, agent_id, companions?: [{ badge_number }] }
// company_person_id and companions persons are already set from createVisit
const checkIn = async (req, res) => {
    try {
        const { id } = req.params;
        const visit = await VisitsModule_1.Visit.findByPk(+id, {
            include: [{ model: VisitsModule_1.VisitCompanion, as: 'visit_companions' }],
        });
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" });
        }
        // Only allow check-in if visit is in PROGRAMADA status
        const programadaStatus = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'PROGRAMADA' } });
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se puede registrar el ingreso de visitas en estado PROGRAMADA" });
        }
        const { entry_time, badge_number, agent_id, license_plate, companions } = req.body;
        const company_person_id = visit.company_person_id ?? req.body.company_person_id;
        if (!entry_time || !badge_number || !agent_id) {
            return res.status(400).json({ message: "Faltan campos requeridos: entry_time, badge_number, agent_id" });
        }
        if (companions !== undefined && !Array.isArray(companions)) {
            return res.status(400).json({ message: "companions debe ser un arreglo" });
        }
        const existingCompanions = visit.visit_companions ?? [];
        if (Array.isArray(companions) && companions.length > 0 && company_person_id !== undefined) {
            const isMainAlsoCompanion = companions.some((c) => c.company_person_id === company_person_id);
            if (isMainAlsoCompanion) {
                return res.status(400).json({
                    message: "La persona principal no puede ser también acompañante",
                    code: 'PERSON_DUPLICATE_ROLE',
                });
            }
        }
        // Validate badge_number for each existing companion
        if (existingCompanions.length > 0) {
            if (!Array.isArray(companions) || companions.length !== existingCompanions.length) {
                return res.status(400).json({ message: "Debe enviar badge_number para cada acompañante de la visita" });
            }
            for (const c of companions) {
                if (!c.badge_number) {
                    return res.status(400).json({ message: "Cada acompañante debe tener badge_number" });
                }
            }
        }
        // Badge numbers must be unique across main visitor and all companions
        if (Array.isArray(companions) && companions.length > 0) {
            const allBadgeNumbers = [badge_number, ...companions.map((c) => c.badge_number)];
            const duplicateBadges = allBadgeNumbers.filter((b, i) => allBadgeNumbers.indexOf(b) !== i);
            if (duplicateBadges.length > 0) {
                return res.status(400).json({
                    message: `El carnet ${duplicateBadges[0]} esta asignado a mas de una persona. Cada visitante debe tener un carnet diferente. Verifique los carnets ingresados.`,
                    code: 'DUPLICATE_BADGE_NUMBER',
                    duplicate_badges: duplicateBadges,
                });
            }
        }
        const enPlantaStatus = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'EN PLANTA' } });
        if (!enPlantaStatus) {
            return res.status(500).json({ message: "Estado 'EN PLANTA' no encontrado" });
        }
        // Check that the main visitor is not currently inside the plant
        const mainPersonInPlant = await VisitsModule_1.Visit.findOne({
            where: {
                company_person_id,
                visit_status_id: enPlantaStatus.id,
                id: { [sequelize_1.Op.ne]: +id },
            },
            include: [{ model: VisitsModule_1.CompanyPerson, as: 'company_person', attributes: ['id', 'name', 'document_number'] }],
        });
        if (mainPersonInPlant) {
            const person = mainPersonInPlant.company_person;
            return res.status(409).json({
                message: `Verifique: ${person?.name ?? 'Esta persona'} (DPI: ${person?.document_number ?? company_person_id}) actualmente se encuentra en planta en la visita #${mainPersonInPlant.id}. No puede ingresar hasta que finalice su visita activa.`,
                code: 'PERSON_ALREADY_IN_PLANT',
                active_visit_id: mainPersonInPlant.id,
            });
        }
        // Check that no companion is currently inside the plant
        for (const companion of existingCompanions) {
            const companionInPlant = await VisitsModule_1.VisitCompanion.findOne({
                where: { company_person_id: companion.company_person_id },
                include: [{
                        model: VisitsModule_1.Visit,
                        as: 'visit',
                        where: { visit_status_id: enPlantaStatus.id },
                        attributes: ['id'],
                    }],
            });
            if (companionInPlant) {
                const companionPerson = await VisitsModule_1.CompanyPerson.findByPk(companion.company_person_id, { attributes: ['name', 'document_number'] });
                return res.status(409).json({
                    message: `Verifique: ${companionPerson?.name ?? 'Un acompañante'} (DPI: ${companionPerson?.document_number ?? companion.company_person_id}) actualmente se encuentra en planta. No puede ingresar hasta que finalice su visita activa.`,
                    code: 'COMPANION_ALREADY_IN_PLANT',
                });
            }
        }
        const transaction = await db_1.default.transaction();
        try {
            await visit.update({
                entry_time,
                badge_number,
                agent_id,
                license_plate: license_plate ?? null,
                visit_status_id: enPlantaStatus.id,
            }, { transaction });
            // Update badge_number on existing companions (matched by index/order)
            if (Array.isArray(companions) && companions.length > 0) {
                for (let i = 0; i < existingCompanions.length; i++) {
                    await existingCompanions[i].update({ badge_number: companions[i].badge_number }, { transaction });
                }
            }
            await transaction.commit();
        }
        catch (txError) {
            await transaction.rollback();
            console.error("Error en checkIn transaction:", txError);
            return res.status(500).json({
                message: "Error al realizar el check-in",
                detail: errorMessage(txError) ?? String(txError),
            });
        }
        const updatedVisit = await VisitsModule_1.Visit.findByPk(+id, { include: includeRelations });
        return res.status(200).json({ message: "Check-in realizado correctamente", data: updatedVisit });
    }
    catch (error) {
        console.error("Error en checkIn:", error);
        return res.status(500).json({
            message: "Error al realizar el check-in",
            detail: errorMessage(error) ?? String(error),
        });
    }
};
exports.checkIn = checkIn;
// Phase 3 - Check-out: visitor leaves the plant
const checkOut = async (req, res) => {
    try {
        const { id } = req.params;
        const visit = await VisitsModule_1.Visit.findByPk(+id);
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" });
        }
        const { exit_time } = req.body;
        if (!exit_time) {
            return res.status(400).json({ message: "Falta campo requerido: exit_time" });
        }
        const status = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'FINALIZADA' } });
        if (!status) {
            return res.status(500).json({ message: "Estado 'FINALIZADA' no encontrado" });
        }
        await visit.update({ exit_time, visit_status_id: status.id });
        return res.status(200).json({ message: "Check-out realizado correctamente", data: visit });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al realizar el check-out" });
    }
};
exports.checkOut = checkOut;
// Update visit (only when PROGRAMADA) - edit fields and replace companions list
const updateVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const visit = await VisitsModule_1.Visit.findByPk(+id, {
            include: [{ model: VisitsModule_1.VisitCompanion, as: 'visit_companions' }],
        });
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" });
        }
        const programadaStatus = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'PROGRAMADA' } });
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se pueden editar visitas en estado PROGRAMADA" });
        }
        const { company_id, company_person_id, date, department_id, responsible_person, destination, companions } = req.body;
        if (Array.isArray(companions)) {
            const companionIds = companions.map((c) => c.company_person_id);
            // Use new company_person_id if provided, otherwise keep existing
            const mainPersonId = company_person_id ?? visit.company_person_id;
            if (mainPersonId != null && companionIds.includes(mainPersonId)) {
                return res.status(400).json({ message: "La persona principal no puede ser también acompañante" });
            }
            if (new Set(companionIds).size !== companionIds.length) {
                return res.status(400).json({ message: "Hay personas duplicadas en los acompañantes" });
            }
        }
        const transaction = await db_1.default.transaction();
        try {
            const updateData = {};
            if (company_id !== undefined)
                updateData.company_id = company_id;
            if (company_person_id !== undefined)
                updateData.company_person_id = company_person_id;
            if (date !== undefined)
                updateData.date = date;
            if (department_id !== undefined)
                updateData.department_id = department_id;
            if (responsible_person !== undefined)
                updateData.responsible_person = responsible_person;
            if (destination !== undefined)
                updateData.destination = destination;
            if (Object.keys(updateData).length > 0) {
                await visit.update(updateData, { transaction });
            }
            // Replace entire companions list when provided
            if (Array.isArray(companions)) {
                await VisitsModule_1.VisitCompanion.destroy({ where: { visit_id: visit.id }, transaction });
                if (companions.length > 0) {
                    const companionRecords = companions.map((c) => ({
                        visit_id: visit.id,
                        company_person_id: c.company_person_id,
                    }));
                    await VisitsModule_1.VisitCompanion.bulkCreate(companionRecords, { transaction });
                }
            }
            await transaction.commit();
        }
        catch (txError) {
            await transaction.rollback();
            console.error("Error en updateVisit transaction:", txError);
            return res.status(500).json({ message: "Error al actualizar la visita", detail: errorMessage(txError) });
        }
        const updatedVisit = await VisitsModule_1.Visit.findByPk(+id, { include: includeRelations });
        return res.status(200).json({ message: "Visita actualizada correctamente", data: updatedVisit });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al actualizar la visita" });
    }
};
exports.updateVisit = updateVisit;
// Delete visit (only when PROGRAMADA - not yet entered the plant)
const deleteVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const visit = await VisitsModule_1.Visit.findByPk(+id);
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" });
        }
        const programadaStatus = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'PROGRAMADA' } });
        if (!programadaStatus || visit.visit_status_id !== programadaStatus.id) {
            return res.status(400).json({ message: "Solo se pueden eliminar visitas en estado PROGRAMADA. Una visita que ya ingresó a planta no puede eliminarse." });
        }
        await VisitsModule_1.VisitCompanion.destroy({ where: { visit_id: visit.id } });
        await visit.destroy();
        return res.status(200).json({ message: "Visita eliminada correctamente" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al eliminar la visita" });
    }
};
exports.deleteVisit = deleteVisit;
// Cancel visit
const cancelVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const visit = await VisitsModule_1.Visit.findByPk(+id);
        if (!visit) {
            return res.status(404).json({ message: "Visita no encontrada" });
        }
        const status = await VisitsModule_1.VisitStatus.findOne({ where: { name: 'CANCELADA' } });
        if (!status) {
            return res.status(500).json({ message: "Estado 'CANCELADA' no encontrado" });
        }
        await visit.update({ visit_status_id: status.id });
        return res.status(200).json({ message: "Visita cancelada correctamente", data: visit });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al cancelar la visita" });
    }
};
exports.cancelVisit = cancelVisit;
//# sourceMappingURL=visit.js.map