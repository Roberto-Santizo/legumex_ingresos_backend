"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompany = exports.getCompanyById = exports.getCompanies = exports.createCompany = void 0;
const VisitsModule_1 = require("../../models/VisitsModule");
const sequelize_1 = require("sequelize");
const createCompany = async (req, res) => {
    try {
        const company = await VisitsModule_1.Company.create({ ...req.body, created_by: req.user.name });
        return res.status(201).json({ message: "Empresa creada correctamente", data: company });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo crear la empresa" });
    }
};
exports.createCompany = createCompany;
const getCompanies = async (req, res) => {
    try {
        const { name } = req.query;
        const where = {};
        if (name) {
            where.name = { [sequelize_1.Op.iLike]: `%${name}%` };
        }
        if (req.query.all === 'true') {
            const rows = await VisitsModule_1.Company.findAll({ where, order: [['createdAt', 'ASC']] });
            return res.status(200).json({ statusCode: 200, response: rows });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await VisitsModule_1.Company.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'ASC']],
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
        return res.status(500).json({ message: "No se pudieron obtener las empresas" });
    }
};
exports.getCompanies = getCompanies;
const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await VisitsModule_1.Company.findByPk(+id);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }
        return res.status(200).json({ data: company });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al obtener la empresa" });
    }
};
exports.getCompanyById = getCompanyById;
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await VisitsModule_1.Company.findByPk(+id);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }
        const { name } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        await company.update(updateData);
        return res.status(200).json({ message: "Empresa actualizada correctamente", data: company });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al actualizar la empresa" });
    }
};
exports.updateCompany = updateCompany;
//# sourceMappingURL=company.js.map