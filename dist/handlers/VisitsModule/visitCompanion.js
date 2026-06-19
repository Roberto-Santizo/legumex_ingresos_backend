"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVisitCompanion = exports.getVisitCompanionById = exports.getVisitCompanions = exports.createVisitCompanion = void 0;
const VisitsModule_1 = require("../../models/VisitsModule");
const includeRelations = [
    { model: VisitsModule_1.CompanyPerson, as: 'visitor_person', attributes: ['id', 'name', 'document_number'] },
];
const createVisitCompanion = async (req, res) => {
    try {
        const visitCompanion = await VisitsModule_1.VisitCompanion.create(req.body);
        return res.status(201).json({ message: "Acompañante de visita creado correctamente", data: visitCompanion });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al crear el acompañante de visita" });
    }
};
exports.createVisitCompanion = createVisitCompanion;
const getVisitCompanions = async (_req, res) => {
    try {
        const visitCompanions = await VisitsModule_1.VisitCompanion.findAll({ include: includeRelations });
        return res.status(200).json({ data: visitCompanions });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener los acompañantes de visita" });
    }
};
exports.getVisitCompanions = getVisitCompanions;
const getVisitCompanionById = async (req, res) => {
    try {
        const { id } = req.params;
        const visitCompanion = await VisitsModule_1.VisitCompanion.findByPk(+id, { include: includeRelations });
        if (!visitCompanion) {
            return res.status(404).json({ message: "Acompañante de visita no encontrado" });
        }
        return res.status(200).json({ data: visitCompanion });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener el acompañante de visita" });
    }
};
exports.getVisitCompanionById = getVisitCompanionById;
const deleteVisitCompanion = async (req, res) => {
    try {
        const { id } = req.params;
        const visitCompanion = await VisitsModule_1.VisitCompanion.findByPk(+id);
        if (!visitCompanion) {
            return res.status(404).json({ message: "Acompañante de visita no encontrado" });
        }
        await visitCompanion.destroy();
        return res.status(200).json({ message: "Acompañante de visita eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al eliminar el acompañante de visita" });
    }
};
exports.deleteVisitCompanion = deleteVisitCompanion;
//# sourceMappingURL=visitCompanion.js.map