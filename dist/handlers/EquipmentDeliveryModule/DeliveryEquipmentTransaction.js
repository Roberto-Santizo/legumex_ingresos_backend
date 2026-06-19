"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFinalPhoto = exports.getDeliveryTransactionsByEmployee = exports.createDeliveryEquipmentTransaction = void 0;
const EmployeeBenefited_model_1 = __importStar(require("../../models/EquipmentDeliveryModule/EmployeeBenefited.model"));
const EquipmentDeliveryDetails_1 = __importDefault(require("../../models/EquipmentDeliveryModule/EquipmentDeliveryDetails"));
const DeliveryEquipmentTransaction_model_1 = __importDefault(require("../../models/EquipmentDeliveryModule/DeliveryEquipmentTransaction.model"));
const Equipment_model_1 = __importDefault(require("../../models/EquipmentDeliveryModule/Equipment.model"));
const AccessControl_1 = require("../../models/AccessControl");
const s3Upload_service_1 = require("../../services/s3Upload.service");
const createDeliveryEquipmentTransaction = async (req, res) => {
    try {
        const { employee_benefited_id, items } = req.body;
        if (!employee_benefited_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Datos incompletos para registrar la entrega" });
        }
        const employee = await EmployeeBenefited_model_1.default.findByPk(employee_benefited_id);
        if (!employee) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        const lastBatchId = await DeliveryEquipmentTransaction_model_1.default.max('delivery_batch_id', {
            where: { employee_benefited_id },
        });
        const deliveryBatchId = (lastBatchId ?? 0) + 1;
        const createdTransactions = [];
        for (const item of items) {
            const deliveryDetail = await EquipmentDeliveryDetails_1.default.create({
                equipment_id: item.equipment_id,
                equipment_condition: item.equipment_condition,
            });
            const transaction = await DeliveryEquipmentTransaction_model_1.default.create({
                employee_benefited_id,
                delivered_by_user_id: req.user.id,
                equipment_delivery_detail_id: deliveryDetail.equipment_delivery_detail_id,
                delivery_date: new Date(),
                delivery_batch_id: deliveryBatchId,
                delivery_equipment_type: item.delivery_equipment_type,
                is_paid: item.delivery_equipment_type === 'CHANGE' ? item.is_paid : false,
                delivery_notes: item.delivery_notes ?? null,
            });
            createdTransactions.push(transaction);
        }
        await employee.update({ status: EmployeeBenefited_model_1.EmployeeBenefitedStatus.FINAL_PHOTO });
        return res.status(201).json({
            message: "Equipo asignado correctamente",
            data: createdTransactions,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo registrar la entrega de equipo" });
    }
};
exports.createDeliveryEquipmentTransaction = createDeliveryEquipmentTransaction;
// GET /delivery-equipment-transaction/by-employee/:employeeBenefitedId — historial de entregas de un empleado
const getDeliveryTransactionsByEmployee = async (req, res) => {
    try {
        const employeeBenefitedId = +req.params.employeeBenefitedId;
        const employee = await EmployeeBenefited_model_1.default.findByPk(employeeBenefitedId);
        if (!employee) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        const transactions = await DeliveryEquipmentTransaction_model_1.default.findAll({
            where: { employee_benefited_id: employeeBenefitedId },
            include: [
                {
                    model: EquipmentDeliveryDetails_1.default,
                    as: "equipmentDetails",
                    attributes: ["equipment_condition"],
                    include: [
                        { model: Equipment_model_1.default, as: "equipment", attributes: ["equipment_name"] },
                    ],
                },
                { model: AccessControl_1.User, as: "deliveredBy", attributes: ["name"] },
            ],
            order: [["delivery_batch_id", "DESC"], ["delivery_equipment_transaction_id", "ASC"]],
        });
        const history = transactions.map((transaction) => {
            const equipmentDetails = transaction.get("equipmentDetails");
            const equipment = equipmentDetails?.get("equipment");
            const deliveredBy = transaction.get("deliveredBy");
            return {
                delivery_equipment_transaction_id: transaction.delivery_equipment_transaction_id,
                delivery_batch_id: transaction.delivery_batch_id,
                delivery_date: transaction.delivery_date,
                delivery_equipment_type: transaction.delivery_equipment_type,
                is_paid: transaction.is_paid,
                delivery_notes: transaction.delivery_notes,
                delivery_photo_url: transaction.delivery_photo_url,
                equipment_name: equipment?.equipment_name ?? null,
                equipment_condition: equipmentDetails?.equipment_condition ?? null,
                delivered_by_name: deliveredBy?.name ?? null,
            };
        });
        return res.status(200).json({ data: history });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo obtener el historial de entregas" });
    }
};
exports.getDeliveryTransactionsByEmployee = getDeliveryTransactionsByEmployee;
const uploadFinalPhoto = async (req, res) => {
    try {
        const employeeBenefitedId = +req.params.employeeBenefitedId;
        const { photo_base64 } = req.body;
        const employee = await EmployeeBenefited_model_1.default.findByPk(employeeBenefitedId);
        if (!employee) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        const photoUrl = await (0, s3Upload_service_1.uploadImageToS3)(photo_base64, 'final-delivery-photos');
        const currentBatchId = await DeliveryEquipmentTransaction_model_1.default.max('delivery_batch_id', {
            where: { employee_benefited_id: employeeBenefitedId },
        });
        await DeliveryEquipmentTransaction_model_1.default.update({ delivery_photo_url: photoUrl }, { where: { employee_benefited_id: employeeBenefitedId, delivery_batch_id: currentBatchId } });
        await employee.update({ status: EmployeeBenefited_model_1.EmployeeBenefitedStatus.COMPLETED });
        return res.status(200).json({ message: "Foto guardada correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: "No se pudo guardar la foto" });
    }
};
exports.uploadFinalPhoto = uploadFinalPhoto;
//# sourceMappingURL=DeliveryEquipmentTransaction.js.map