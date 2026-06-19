import { Model } from "sequelize-typescript";
import User from "../AccessControl/User.model";
import EmployeeBenefited from "./EmployeeBenefited.model";
import EquipmentDeliveryDetails from "./EquipmentDeliveryDetails";
export default class DeliveryEquipmentTransaction extends Model {
    delivery_equipment_transaction_id: number;
    employee_benefited_id: number;
    delivered_by_user_id: number;
    equipment_delivery_detail_id: number;
    delivery_date: Date;
    delivery_batch_id: number;
    delivery_equipment_type: string;
    is_paid: boolean;
    delivery_photo_url: string;
    delivery_notes: string;
    employeeBenefited?: EmployeeBenefited;
    deliveredBy?: User;
    equipmentDetails?: EquipmentDeliveryDetails;
}
