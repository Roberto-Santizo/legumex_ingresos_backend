import { Model } from "sequelize-typescript";
import DeliveryEquipmentTransaction from "./DeliveryEquipmentTransaction.model";
export declare enum EmployeeBenefitedStatus {
    DELIVER_EQUIPMENT = "DELIVER_EQUIPMENT",
    FINAL_PHOTO = "FINAL_PHOTO",
    COMPLETED = "COMPLETED"
}
export default class EmployeeBenefited extends Model {
    employee_benefited_id: number;
    external_id: string;
    employee_name: string;
    employee_code: string;
    employee_position: string;
    department_name: string;
    photo_url: string | null;
    status: EmployeeBenefitedStatus;
    transactions?: DeliveryEquipmentTransaction[];
}
