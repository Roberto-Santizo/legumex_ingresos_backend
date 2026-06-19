"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyPerson = exports.updateCompanyPerson = exports.getCompanyPersonsByCompany = exports.getCompanyPersonById = exports.getCompanyPersons = exports.createCompanyPerson = void 0;
const sequelize_1 = require("sequelize");
const VisitsModule_1 = require("../../models/VisitsModule");
const createCompanyPerson = async (req, res) => {
    try {
        const person = await VisitsModule_1.CompanyPerson.create(req.body);
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
exports.createCompanyPerson = createCompanyPerson;
const getCompanyPersons = async (req, res) => {
    try {
        const { name, document_number } = req.query;
        const where = {};
        if (name)
            where.name = { [sequelize_1.Op.iLike]: `%${name}%` };
        if (document_number)
            where.document_number = { [sequelize_1.Op.iLike]: `%${document_number}%` };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await VisitsModule_1.CompanyPerson.findAndCountAll({
            where,
            attributes: {
                exclude: ['document_photo_front', 'document_photo_back', 'license_photo'],
                include: [
                    [(0, sequelize_1.literal)("NULLIF(document_photo_front, '') IS NOT NULL"), 'has_document_photo_front'],
                    [(0, sequelize_1.literal)("NULLIF(document_photo_back, '') IS NOT NULL"), 'has_document_photo_back'],
                    [(0, sequelize_1.literal)("NULLIF(license_photo, '') IS NOT NULL"), 'has_license_photo'],
                ],
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: VisitsModule_1.Company, attributes: ['id', 'name'] }],
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
exports.getCompanyPersons = getCompanyPersons;
const getCompanyPersonById = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await VisitsModule_1.CompanyPerson.findByPk(+id, {
            include: [{ model: VisitsModule_1.Company, attributes: ['id', 'name'] }],
        });
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
exports.getCompanyPersonById = getCompanyPersonById;
// Listar personas de una empresa especifica (util para el dropdown del check-in)
const getCompanyPersonsByCompany = async (req, res) => {
    try {
        const { company_id } = req.params;
        const persons = await VisitsModule_1.CompanyPerson.findAll({
            where: { company_id: +company_id },
            order: [['name', 'ASC']],
        });
        return res.status(200).json({ data: persons });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener las personas de la empresa" });
    }
};
exports.getCompanyPersonsByCompany = getCompanyPersonsByCompany;
const updateCompanyPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await VisitsModule_1.CompanyPerson.findByPk(+id);
        if (!person) {
            return res.status(404).json({ message: "Persona no encontrada" });
        }
        const { company_id, name, document_number, document_photo_front, document_photo_back, license_number, license_photo } = req.body;
        const updateData = {};
        if (company_id !== undefined)
            updateData.company_id = company_id;
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
exports.updateCompanyPerson = updateCompanyPerson;
const deleteCompanyPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await VisitsModule_1.CompanyPerson.findByPk(+id);
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
exports.deleteCompanyPerson = deleteCompanyPerson;
//# sourceMappingURL=companyPerson.js.map