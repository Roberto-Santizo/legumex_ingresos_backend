"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePeople = exports.updatePeople = exports.getPeopleById = exports.getPeople = exports.createPeople = void 0;
const sequelize_1 = require("sequelize");
const VisitsModule_1 = require("../../models/VisitsModule");
const createPeople = async (req, res) => {
    try {
        const person = await VisitsModule_1.People.create(req.body);
        return res.status(201).json({ message: "Persona creada correctamente", data: person });
    }
    catch (error) {
        if (error instanceof sequelize_1.UniqueConstraintError) {
            const field = error.errors[0]?.path ?? "documento";
            return res.status(409).json({
                message: `La persona que estás tratando de registrar ya está registrada en el sistema. El campo "${field}" ya existe.`
            });
        }
        console.log(error);
        return res.status(500).json({ message: "Error al crear la persona" });
    }
};
exports.createPeople = createPeople;
const getPeople = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await VisitsModule_1.People.findAndCountAll({
            attributes: { exclude: ['document_photo_front', 'document_photo_back', 'license_photo'] },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
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
        return res.status(500).json({ message: "Error al obtener las personas" });
    }
};
exports.getPeople = getPeople;
const getPeopleById = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await VisitsModule_1.People.findByPk(+id);
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" });
        }
        return res.status(200).json({ data: person });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener la persona" });
    }
};
exports.getPeopleById = getPeopleById;
const updatePeople = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await VisitsModule_1.People.findByPk(+id);
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" });
        }
        const { name, document_number, document_photo_front, document_photo_back, license_number, license_photo } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (document_number !== undefined)
            updateData.document_number = document_number;
        if (document_photo_front !== undefined)
            updateData.document_photo_front = document_photo_front;
        if (document_photo_back !== undefined)
            updateData.document_photo_back = document_photo_back;
        if (license_number !== undefined)
            updateData.license_number = license_number;
        if (license_photo !== undefined)
            updateData.license_photo = license_photo;
        await person.update(updateData);
        return res.status(200).json({ message: "Persona actualizada correctamente", data: person });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al actualizar la persona" });
    }
};
exports.updatePeople = updatePeople;
const deletePeople = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await VisitsModule_1.People.findByPk(+id);
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" });
        }
        await person.destroy();
        return res.status(200).json({ message: "Persona eliminada correctamente" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al eliminar la persona" });
    }
};
exports.deletePeople = deletePeople;
//# sourceMappingURL=people.js.map