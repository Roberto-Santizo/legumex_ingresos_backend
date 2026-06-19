"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEquipment = exports.getEquipmentById = exports.getEquipments = exports.createEquipment = void 0;
const Equipment_model_1 = __importDefault(require("../../models/EquipmentDeliveryModule/Equipment.model"));
const sequelize_1 = require("sequelize");
const createEquipment = async (req, res) => {
    try {
        const equipment = await Equipment_model_1.default.create({ ...req.body, created_by: req.user.name });
        return res.status(201).json({ message: "Equipo creado correctamente", data: equipment });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo crear el equipo" });
    }
};
exports.createEquipment = createEquipment;
const getEquipments = async (req, res) => {
    try {
        const { name } = req.query;
        const where = {};
        if (name) {
            where.equipment_name = { [sequelize_1.Op.iLike]: `%${name}%` };
        }
        if (req.query.all === 'true') {
            const rows = await Equipment_model_1.default.findAll({ order: [['createdAt', 'DESC']] });
            return res.status(200).json({ statusCode: 200, response: rows });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await Equipment_model_1.default.findAndCountAll({
            where,
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
        return res.status(500).json({ message: "No se pudieron obtener los equipos" });
    }
};
exports.getEquipments = getEquipments;
const getEquipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment_model_1.default.findByPk(+id);
        if (!equipment) {
            return res.status(404).json({ message: "Equipo no encontrado" });
        }
        return res.status(200).json({ data: equipment });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo obtener el equipo" });
    }
};
exports.getEquipmentById = getEquipmentById;
const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment_model_1.default.findByPk(+id);
        if (!equipment) {
            return res.status(404).json({ message: "Equipo no encontrado" });
        }
        await equipment.update({ ...req.body, updated_by: req.user.name });
        return res.status(200).json({ message: "Equipo actualizado correctamente", data: equipment });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo actualizar el equipo" });
    }
};
exports.updateEquipment = updateEquipment;
//# sourceMappingURL=Equipment.js.map