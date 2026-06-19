"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAgent = exports.getAgentById = exports.getAgents = exports.createAgent = void 0;
const VisitsModule_1 = require("../../models/VisitsModule");
const createAgent = async (req, res) => {
    try {
        const agent = await VisitsModule_1.Agent.create(req.body);
        return res.status(201).json({ message: "Agente creado correctamente", data: agent });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo crear el agente" });
    }
};
exports.createAgent = createAgent;
const getAgents = async (req, res) => {
    try {
        if (req.query.all === 'true') {
            const rows = await VisitsModule_1.Agent.findAll({ order: [['createdAt', 'DESC']] });
            return res.status(200).json({
                statusCode: 200,
                response: rows,
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows } = await VisitsModule_1.Agent.findAndCountAll({
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
        return res.status(500).json({ message: "No se pudieron obtener los agentes" });
    }
};
exports.getAgents = getAgents;
const getAgentById = async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await VisitsModule_1.Agent.findByPk(+id);
        if (!agent) {
            return res.status(404).json({ message: "Agente no encontrado" });
        }
        return res.status(200).json({ data: agent });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener el agente" });
    }
};
exports.getAgentById = getAgentById;
const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await VisitsModule_1.Agent.findByPk(+id);
        if (!agent) {
            return res.status(404).json({ message: "Agente no encontrado" });
        }
        const { name } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        await agent.update(updateData);
        return res.status(200).json({ message: "Agente actualizado correctamente", data: agent });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al actualizar el agente" });
    }
};
exports.updateAgent = updateAgent;
//# sourceMappingURL=agent.js.map