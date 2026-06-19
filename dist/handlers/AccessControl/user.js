"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const AccessControl_1 = require("../../models/AccessControl");
const bcrypt_1 = __importDefault(require("bcrypt"));
const VisitsModule_1 = require("../../models/VisitsModule");
const createUser = async (req, res) => {
    try {
        const { password, username, ...rest } = req.body;
        const existing = await AccessControl_1.User.findOne({ where: { username } });
        if (existing) {
            return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await AccessControl_1.User.create({ ...rest, username, password: hashedPassword });
        return res.status(201).json({ message: "Usuario creado correctamente", data: newUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "No se pudo crear el usuario" });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await AccessControl_1.User.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: AccessControl_1.Role, attributes: ['name'] },
                { model: VisitsModule_1.Department, attributes: ['name'] }
            ]
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
        console.error(error);
        return res.status(500).json({ message: "No se pudieron obtener los usuarios" });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await AccessControl_1.User.findByPk(+id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.status(200).json({ data: user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener el usuario" });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await AccessControl_1.User.findByPk(+id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const { name, username, department_id, role_id, password } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (username !== undefined)
            updateData.username = username;
        if (department_id !== undefined)
            updateData.department_id = department_id;
        if (role_id !== undefined)
            updateData.role_id = role_id;
        if (password)
            updateData.password = await bcrypt_1.default.hash(password, 10);
        await user.update(updateData);
        return res.status(200).json({ message: "Usuario actualizado correctamente", data: user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el usuario" });
    }
};
exports.updateUser = updateUser;
//# sourceMappingURL=user.js.map