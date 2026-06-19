import { Model } from "sequelize-typescript";
import EquipmentDeliveryDetails from "./EquipmentDeliveryDetails";
export default class Equipment extends Model {
    equipment_id: number;
    equipment_name: string;
    equipment_description: string;
    created_by: string;
    deliveryDetails: EquipmentDeliveryDetails[];
}
