import { Request, Response } from "express";
import EmployeeBenefited, { EmployeeBenefitedStatus } from "../../models/EquipmentDeliveryModule/EmployeeBenefited.model";
import EquipmentDeliveryDetails from "../../models/EquipmentDeliveryModule/EquipmentDeliveryDetails";
import DeliveryEquipmentTransaction from "../../models/EquipmentDeliveryModule/DeliveryEquipmentTransaction.model";
import Equipment from "../../models/EquipmentDeliveryModule/Equipment.model";
import { User } from "../../models/AccessControl";
import { uploadImageToS3 } from "../../services/s3Upload.service";

interface TransactionItem {
    equipment_id: number;
    equipment_condition: 'NEW' | 'USED';
    delivery_equipment_type: 'DELIVERED' | 'CHANGE';
    is_paid: boolean;
    delivery_notes?: string;
}

export const createDeliveryEquipmentTransaction = async (req: Request, res: Response) => {
    try {
        const { employee_benefited_id, items } = req.body as {
            employee_benefited_id: number;
            items: TransactionItem[];
        };

        if (!employee_benefited_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Datos incompletos para registrar la entrega" });
        }

        const employee = await EmployeeBenefited.findByPk(employee_benefited_id);
        if (!employee) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        const lastBatchId = await DeliveryEquipmentTransaction.max('delivery_batch_id', {
            where: { employee_benefited_id },
        }) as number | null;
        const deliveryBatchId = (lastBatchId ?? 0) + 1;

        const createdTransactions = [];

        for (const item of items) {
            const deliveryDetail = await EquipmentDeliveryDetails.create({
                equipment_id: item.equipment_id,
                equipment_condition: item.equipment_condition,
            });

            const transaction = await DeliveryEquipmentTransaction.create({
                employee_benefited_id,
                delivered_by_user_id: req.user!.id,
                equipment_delivery_detail_id: deliveryDetail.equipment_delivery_detail_id,
                delivery_date: new Date(),
                delivery_batch_id: deliveryBatchId,
                delivery_equipment_type: item.delivery_equipment_type,
                is_paid: item.delivery_equipment_type === 'CHANGE' ? item.is_paid : false,
                delivery_notes: item.delivery_notes ?? null,
            });

            createdTransactions.push(transaction);
        }

        await employee.update({ status: EmployeeBenefitedStatus.FINAL_PHOTO });

        return res.status(201).json({
            message: "Equipo asignado correctamente",
            data: createdTransactions,
        });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo registrar la entrega de equipo" });
    }
};

// GET /delivery-equipment-transaction/by-employee/:employeeBenefitedId — historial de entregas de un empleado
export const getDeliveryTransactionsByEmployee = async (req: Request, res: Response) => {
    try {
        const employeeBenefitedId = +req.params.employeeBenefitedId;

        const employee = await EmployeeBenefited.findByPk(employeeBenefitedId);
        if (!employee) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        const transactions = await DeliveryEquipmentTransaction.findAll({
            where: { employee_benefited_id: employeeBenefitedId },
            include: [
                {
                    model: EquipmentDeliveryDetails,
                    as: "equipmentDetails",
                    attributes: ["equipment_condition"],
                    include: [
                        { model: Equipment, as: "equipment", attributes: ["equipment_name"] },
                    ],
                },
                { model: User, as: "deliveredBy", attributes: ["name"] },
            ],
            order: [["delivery_batch_id", "DESC"], ["delivery_equipment_transaction_id", "ASC"]],
        });

        const history = transactions.map((transaction) => {
            const equipmentDetails = transaction.get("equipmentDetails") as EquipmentDeliveryDetails | null;
            const equipment        = equipmentDetails?.get("equipment") as Equipment | null | undefined;
            const deliveredBy      = transaction.get("deliveredBy") as User | null;

            return {
                delivery_equipment_transaction_id: transaction.delivery_equipment_transaction_id,
                delivery_batch_id:                 transaction.delivery_batch_id,
                delivery_date:                     transaction.delivery_date,
                delivery_equipment_type:           transaction.delivery_equipment_type,
                is_paid:                           transaction.is_paid,
                delivery_notes:                    transaction.delivery_notes,
                delivery_photo_url:                transaction.delivery_photo_url,
                equipment_name:                    equipment?.equipment_name ?? null,
                equipment_condition:               equipmentDetails?.equipment_condition ?? null,
                delivered_by_name:                 deliveredBy?.name ?? null,
            };
        });

        return res.status(200).json({ data: history });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo obtener el historial de entregas" });
    }
};

export const uploadFinalPhoto = async (req: Request, res: Response) => {
    try {
        const employeeBenefitedId = +req.params.employeeBenefitedId;
        const { photo_base64 } = req.body as { photo_base64: string };

        const employee = await EmployeeBenefited.findByPk(employeeBenefitedId);
        if (!employee) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        const photoUrl = await uploadImageToS3(photo_base64, 'final-delivery-photos')

        const currentBatchId = await DeliveryEquipmentTransaction.max('delivery_batch_id', {
            where: { employee_benefited_id: employeeBenefitedId },
        }) as number | null;

        await DeliveryEquipmentTransaction.update(
            { delivery_photo_url: photoUrl },
            { where: { employee_benefited_id: employeeBenefitedId, delivery_batch_id: currentBatchId } }
        );

        await employee.update({ status: EmployeeBenefitedStatus.COMPLETED });

        return res.status(200).json({ message: "Foto guardada correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo guardar la foto" });
    }
};
